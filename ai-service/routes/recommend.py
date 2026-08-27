import os
import datetime as dt
from flask import Blueprint, current_app, jsonify, request

bp = Blueprint("recommend", __name__)

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "recommend.txt")
with open(_PROMPT_PATH, "r", encoding="utf-8") as f:
    SYSTEM = f.read()


def _fallback(status: str) -> dict:
    recs = [
        {"action_type": "review",  "description": "Manually review this consent record.", "priority": "MEDIUM"},
        {"action_type": "notify",  "description": "Notify the data subject if status is EXPIRED or WITHDRAWN.", "priority": "HIGH" if status in ("EXPIRED","WITHDRAWN") else "LOW"},
        {"action_type": "archive", "description": "Archive supporting evidence and hash it for tamper-evidence.", "priority": "LOW"},
    ]
    return {"recommendations": recs, "generated_at": dt.datetime.utcnow().isoformat() + "Z", "is_fallback": True}


@bp.post("/recommend")
def recommend():
    body = request.get_json(silent=True) or {}
    subject = str(body.get("subject") or "")
    purpose = str(body.get("purpose") or "")
    status  = str(body.get("status")  or "")
    if not purpose:
        return jsonify({"error": "bad_input", "message": "purpose is required"}), 400

    cache = current_app.cache
    key = cache.key("recommend", {"subject": subject, "purpose": purpose, "status": status})
    hit = cache.get(key)
    if hit: return jsonify(hit)

    user = f"Subject: {subject}\nPurpose: {purpose}\nStatus: {status}\n"
    result = current_app.groq.chat_json(SYSTEM, user)
    if not result or "recommendations" not in result:
        result = _fallback(status)
    else:
        result.setdefault("generated_at", dt.datetime.utcnow().isoformat() + "Z")

    cache.set(key, result)
    return jsonify(result)
