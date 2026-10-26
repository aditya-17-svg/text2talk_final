"""POST /api/delete_account  {"confirm": "DELETE"}
Deletes the signed-in user's stored audio files and their account. Saved rows are removed
automatically (the tables cascade from the user). Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
"""

import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler


def base_url():
    return (
        os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or ""
    ).rstrip("/")


def verify_user(headers):
    token = (headers.get("authorization") or "").removeprefix("Bearer ").strip()
    anon = (
        os.environ.get("SUPABASE_ANON_KEY")
        or os.environ.get("VITE_SUPABASE_ANON_KEY")
        or ""
    )
    if not token or not base_url():
        return None
    req = urllib.request.Request(
        f"{base_url()}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": anon},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read())
    except Exception:
        return None


def admin(method, path, body=None):
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(
        base_url() + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


class handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send(405, {"error": "Method not allowed."})

    def do_POST(self):
        try:
            user = verify_user(self.headers)
            if not user or not user.get("id"):
                return self._send(401, {"error": "Please sign in again."})
            data = json.loads(
                self.rfile.read(min(int(self.headers.get("content-length", 0)), 1000))
                or b"{}"
            )
            if data.get("confirm") != "DELETE":
                return self._send(400, {"error": "Confirmation is missing."})
            uid = user["id"]
            try:  
                items = (
                    admin(
                        "POST",
                        "/storage/v1/object/list/audio-files",
                        {"prefix": f"{uid}/", "limit": 1000, "offset": 0},
                    )
                    or []
                )
                paths = [f"{uid}/{o['name']}" for o in items if o.get("name")]
                if paths:
                    admin(
                        "DELETE", "/storage/v1/object/audio-files", {"prefixes": paths}
                    )
            except Exception:
                pass
            admin("DELETE", f"/auth/v1/admin/users/{uid}")
            self._send(200, {"ok": True})
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid request."})
        except Exception:
            self._send(
                500,
                {
                    "error": "Could not delete the account. Please try again or contact support."
                },
            )
