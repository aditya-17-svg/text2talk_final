#!/usr/bin/env python3
"""Basic security check.  Usage: python tools/security_check.py [project_dir] [https://your-site]"""

import pathlib
import re
import sys
import urllib.request

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
site = sys.argv[2] if len(sys.argv) > 2 else None
problems = []

RISKY = {
    r"dangerouslySetInnerHTML": "raw HTML (XSS risk)",
    r"\binnerHTML\b": "innerHTML (XSS risk)",
    r"\beval\(": "eval()",
    r"service_role|SERVICE_ROLE": "service-role key referenced in front-end code",
    r"sk_live|secret_key": "possible secret key",
}
for f in (root / "src").rglob("*"):
    if f.suffix in {".js", ".jsx"}:
        text = f.read_text(errors="ignore")
        problems += [
            f"{f}: {why}" for pat, why in RISKY.items() if re.search(pat, text)
        ]
problems += [
    f"{e}: env file inside src/ (may be committed)"
    for e in (root / "src").rglob(".env*")
]
gi = root / ".gitignore"
if not gi.exists() or ".env" not in gi.read_text():
    problems.append(".gitignore is missing or does not list .env")

if site:
    with urllib.request.urlopen(site, timeout=10) as r:
        headers = {k.lower(): v for k, v in r.headers.items()}
    for h in [
        "strict-transport-security",
        "content-security-policy",
        "x-content-type-options",
        "x-frame-options",
        "referrer-policy",
        "permissions-policy",
    ]:
        if h not in headers:
            problems.append(f"{site}: missing header {h}")

print("\n".join(f"PROBLEM  {p}" for p in problems) or "No problems found.")
sys.exit(1 if problems else 0)
