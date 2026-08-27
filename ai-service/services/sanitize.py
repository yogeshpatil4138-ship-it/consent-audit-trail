"""Strip HTML, detect obvious prompt-injection patterns, cap field length."""
import re
import bleach

MAX_FIELD_LEN = 2000

_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"disregard\s+the\s+system",
    r"you\s+are\s+now\s+.*",
    r"reveal\s+(the\s+)?system\s+prompt",
    r"<\s*script",
]


class SanitizationError(ValueError):
    pass


def _clean_str(s: str) -> str:
    if not isinstance(s, str):
        return s
    if len(s) > MAX_FIELD_LEN:
        raise SanitizationError(f"Field too long (>{MAX_FIELD_LEN} chars)")
    for pat in _INJECTION_PATTERNS:
        if re.search(pat, s, re.IGNORECASE):
            raise SanitizationError("Input rejected by prompt-injection filter")
    return bleach.clean(s, tags=[], attributes={}, strip=True)


def sanitize_payload(data):
    if isinstance(data, dict):
        return {k: sanitize_payload(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_payload(v) for v in data]
    if isinstance(data, str):
        return _clean_str(data)
    return data
