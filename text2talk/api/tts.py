"""POST /api/tts  {text, language, gender, rate, pitch, volume}  ->  {"audio": "<base64 MP3>"}
For signed-in users only. Env: GOOGLE_TTS_API_KEY (Google Cloud Text-to-Speech API key).
"""

import base64
import json
import math
import os
import re
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler

LANGS = {"en-US", "en-GB", "en-IN", "hi-IN", "es-ES", "fr-FR", "de-DE"}
GENDERS = {"FEMALE", "MALE"}
MAX_CHARS, MAX_BYTES = 5000, 4000
SENTENCE = re.compile(r"[^.!?\n।]+[.!?।]*\s*")
CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class Unavailable(Exception):
    """Raised when the text-to-speech service cannot be used."""


class BadVoice(Exception):
    """Raised when the language and voice type do not match a real voice."""


def verify_user(headers):
    token = (headers.get("authorization") or "").removeprefix("Bearer ").strip()
    base = (
        os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or ""
    ).rstrip("/")
    anon = (
        os.environ.get("SUPABASE_ANON_KEY")
        or os.environ.get("VITE_SUPABASE_ANON_KEY")
        or ""
    )
    if not token or not base:
        return None
    req = urllib.request.Request(
        f"{base}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": anon},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read())
    except Exception:
        return None


def chunks(text):
    out, buf = [], ""
    for s in SENTENCE.findall(text) or [text]:
        if buf and len((buf + s).encode()) > MAX_BYTES:
            out.append(buf)
            buf = ""
        if len(s.encode()) > MAX_BYTES:
            out += [s[i : i + 800] for i in range(0, len(s), 800)]
        else:
            buf += s
    if buf:
        out.append(buf)
    return out


def synth(args):
    piece, lang, gender, rate, pitch, gain = args
    body = {
        "input": {"text": piece},
        "voice": {"languageCode": lang, "ssmlGender": gender},
        "audioConfig": {
            "audioEncoding": "MP3",
            "speakingRate": rate,
            "pitch": pitch,
            "volumeGainDb": gain,
        },
    }
    req = urllib.request.Request(
        "https://texttospeech.googleapis.com/v1/text:synthesize?key="
        + os.environ["GOOGLE_TTS_API_KEY"],
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return base64.b64decode(json.loads(r.read())["audioContent"])
    except urllib.error.HTTPError as e:
        raise BadVoice if e.code == 400 else Unavailable
    except Exception:
        raise Unavailable


def clamp(value, low, high):
    """Convert to a number and keep it between low and high."""
    return max(low, min(high, float(value)))


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
            if not verify_user(self.headers):
                return self._send(
                    401, {"error": "Please sign in to create audio files."}
                )
            if not os.environ.get("GOOGLE_TTS_API_KEY"):
                return self._send(
                    503, {"error": "Audio file creation isn't set up yet."}
                )
            size = int(self.headers.get("content-length", 0))
            if size <= 0 or size > 30_000:
                return self._send(413, {"error": "Request too large."})
            data = json.loads(self.rfile.read(size))
            text = CONTROL.sub("", str(data.get("text") or "")).strip()
            lang, gender = data.get("language"), data.get("gender")
            if (
                not text
                or len(text) > MAX_CHARS
                or lang not in LANGS
                or gender not in GENDERS
            ):
                return self._send(
                    400, {"error": "Please check the text, language and voice."}
                )
            rate, pitch = clamp(data.get("rate", 1), 0.5, 2), clamp(
                data.get("pitch", 0), -10, 10
            )
            gain = clamp(
                20 * math.log10(max(clamp(data.get("volume", 1), 0, 1), 0.05)), -20, 0
            )
            with ThreadPoolExecutor(max_workers=4) as pool:
                parts = list(
                    pool.map(
                        synth,
                        [(c, lang, gender, rate, pitch, gain) for c in chunks(text)],
                    )
                )
            self._send(200, {"audio": base64.b64encode(b"".join(parts)).decode()})
        except BadVoice:
            self._send(
                400,
                {
                    "error": "That voice isn't available for this language. Try the other voice type."
                },
            )
        except Unavailable:
            self._send(
                503,
                {
                    "error": "Audio file creation isn't available right now. Try again later."
                },
            )
        except (ValueError, TypeError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid request."})
        except Exception:
            self._send(500, {"error": "Something went wrong. Please try again later."})
