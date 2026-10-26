"""Vercel serverless function: POST /api/contact
Validates and cleans the input, hashes the visitor's IP (SHA-256 + secret salt),
rate-limits per IP, then stores the message in Supabase using a server-only key.
Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, IP_HASH_SALT"""

import hashlib
import json
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from http.server import BaseHTTPRequestHandler

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$")
CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
MAX_PER_HOUR = 5


def clean(value, limit):
    return CONTROL.sub("", str(value or "")).strip()[:limit]


def supabase(method, path, body=None):
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(
        f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}",
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.read()


class handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        self._send(405, {"error": "Method not allowed."})

    def do_POST(self):
        try:
            if (
                self.headers.get("content-type", "").split(";")[0].strip()
                != "application/json"
            ):
                return self._send(415, {"error": "Unsupported request."})
            size = int(self.headers.get("content-length", 0))
            if size <= 0 or size > 10_000:
                return self._send(413, {"error": "Request too large."})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict):
                raise ValueError
            if data.get("website"):  # honeypot field that real users never fill in
                return self._send(200, {"ok": True})
            name = clean(data.get("name"), 100)
            email = clean(data.get("email"), 254).lower()
            message = clean(data.get("message"), 2000)
            if len(name) < 2 or not EMAIL_RE.match(email) or len(message) < 10:
                return self._send(
                    400, {"error": "Please check your name, email and message."}
                )

            ip = self.headers.get("x-forwarded-for", "").split(",")[0].strip()
            ip_hash = hashlib.sha256(
                (os.environ["IP_HASH_SALT"] + ip).encode()
            ).hexdigest()
            since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
            query = urllib.parse.urlencode(
                {
                    "select": "id",
                    "ip_hash": f"eq.{ip_hash}",
                    "created_at": f"gte.{since}",
                    "limit": MAX_PER_HOUR,
                }
            )
            if (
                len(json.loads(supabase("GET", f"contact_messages?{query}") or b"[]"))
                >= MAX_PER_HOUR
            ):
                return self._send(
                    429, {"error": "Too many messages. Please try again later."}
                )

            supabase(
                "POST",
                "contact_messages",
                {"name": name, "email": email, "message": message, "ip_hash": ip_hash},
            )
            self._send(200, {"ok": True})
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid request."})
        except Exception:  # never leak internal details
            self._send(500, {"error": "Something went wrong. Please try again later."})
