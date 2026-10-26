"""Vercel serverless function: POST /api/translate
Request:  {"text": "...", "source": "en", "target": "hi"}
Response: {"translation": "..."}
Translates on the server with the free MyMemory API (Python standard library only).
Optional env var: MYMEMORY_EMAIL (a real email raises the free daily limit)."""

import json
import os
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler

LANGS = {
    "en",
    "hi",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ja",
    "ko",
    "zh-CN",
    "ar",
    "ru",
    "bn",
    "ta",
    "te",
    "mr",
    "gu",
    "ur",
}
MAX_CHARS, MAX_BYTES = 5000, 450  # MyMemory accepts about 500 bytes per request
SENTENCE = re.compile(r"[^.!?\n।]+[.!?।]*\s*")
CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class QuotaError(Exception):
    """Raised when the free MyMemory translation quota is used up."""


class ServiceError(Exception):
    """Raised when the translation service fails or is unreachable."""


def chunks(text):
    """Split text into sentence-sized pieces that fit the API limit."""
    out, buf = [], ""
    for s in SENTENCE.findall(text) or [text]:
        if buf and len((buf + s).encode()) > MAX_BYTES:
            out.append(buf)
            buf = ""
        if len(s.encode()) > MAX_BYTES:
            out += [s[i : i + 120] for i in range(0, len(s), 120)]
        else:
            buf += s
    if buf:
        out.append(buf)
    return out


def translate_piece(args):
    piece, source, target = args
    params = {"q": piece, "langpair": f"{source}|{target}"}
    if os.environ.get("MYMEMORY_EMAIL"):
        params["de"] = os.environ["MYMEMORY_EMAIL"]
    try:
        with urllib.request.urlopen(
            "https://api.mymemory.translated.net/get?" + urllib.parse.urlencode(params),
            timeout=8,
        ) as r:
            data = json.loads(r.read())
    except Exception:
        raise ServiceError
    text = (data.get("responseData") or {}).get("translatedText", "")
    status = int(data.get("responseStatus") or 0)
    if status == 429 or "MYMEMORY WARNING" in text.upper():
        raise QuotaError
    if status != 200:
        raise ServiceError
    return text


class handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send(405, {"error": "Method not allowed."})

    def do_POST(self):
        try:
            size = int(self.headers.get("content-length", 0))
            if size <= 0 or size > 30_000:
                return self._send(413, {"error": "Request too large."})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict):
                raise ValueError
            text = CONTROL.sub("", str(data.get("text") or "")).strip()
            source, target = data.get("source"), data.get("target")
            if (
                not text
                or len(text) > MAX_CHARS
                or source not in LANGS
                or target not in LANGS
                or source == target
            ):
                return self._send(
                    400, {"error": "Please check the text and the two languages."}
                )
            with ThreadPoolExecutor(max_workers=4) as pool:
                parts = list(
                    pool.map(
                        translate_piece, [(c, source, target) for c in chunks(text)]
                    )
                )
            self._send(200, {"translation": " ".join(parts)})
        except QuotaError:
            self._send(
                429,
                {"error": "Daily free translation limit reached. Try again tomorrow."},
            )
        except ServiceError:
            self._send(
                502,
                {"error": "The translation service is unavailable. Try again later."},
            )
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid request."})
        except Exception:
            self._send(500, {"error": "Something went wrong. Please try again later."})
