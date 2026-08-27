import os
import datetime as dt
from flask import Blueprint, current_app, jsonify, request

bp = Blueprint("describe", __name__)

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "describe.txt")
with open(_PROMPT_PATH, "r", encoding="utf-8") as f:
    SYSTEM = f.read()


def _fallback(subject: str, purpose: str, legal_basis: str) -> dict:
    score = 60 if legal_basis else 40
    return {
        "description": f"Consent for subject '{subject}' covering '{purpose}'. Legal basis: {legal_basis or 'unspecified'}.",
        "compliance_score": score,
        "risk_level": "MEDIUM" if score >= 60 else "HIGH",
        "generated_at": dt.datetime.utcnow().isoformat() + "Z",
        "is_fallback": True,
    }


@bp.post("/describe")
def describe():
    body = request.get_json(silent=True) or {}
    subject = str(body.get("subject") or "")
    purpose = str(body.get("purpose") or "")
    legal_basis = str(body.get("legal_basis") or "")
    if not purpose:
        return jsonify({"error": "bad_input", "message": "purpose is required"}), 400

    cache = current_app.cache
    key = cache.key("describe", {"subject": subject, "purpose": purpose, "legal_basis": legal_basis})
    hit = cache.get(key)
    if hit: return jsonify(hit)

    user = (
        f"Subject ID: {subject}\n"
        f"Purpose: {purpose}\n"
        f"Legal basis: {legal_basis}\n"
    )
    result = current_app.groq.chat_json(SYSTEM, user)
    if not result:
        result = _fallback(subject, purpose, legal_basis)
    else:
        result.setdefault("generated_at", dt.datetime.utcnow().isoformat() + "Z")

    cache.set(key, result)
    return jsonify(result)
