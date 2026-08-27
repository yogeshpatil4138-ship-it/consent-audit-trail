import os
import datetime as dt
from flask import Blueprint, current_app, jsonify, request

bp = Blueprint("report", __name__)

_PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "report.txt")
with open(_PROMPT_PATH, "r", encoding="utf-8") as f:
    SYSTEM = f.read()


def _fallback(stats: dict) -> dict:
    return {
        "title": "Consent Audit Report",
        "summary": "AI service is running in fallback mode. Basic stats included.",
        "overview": "Automated executive summary is unavailable; showing raw counts only.",
        "key_items": [
            f"Total records: {stats.get('total', 0)}",
            f"Active: {stats.get('active', 0)}",
            f"Expired: {stats.get('expired', 0)}",
            f"Withdrawn: {stats.get('withdrawn', 0)}",
        ],
        "recommendations": [
            "Review EXPIRED records and either renew or archive.",
            "Contact WITHDRAWN subjects to confirm deletion of downstream data.",
            "Re-check GROQ_API_KEY and network egress if AI fallbacks persist.",
        ],
        "generated_at": dt.datetime.utcnow().isoformat() + "Z",
        "is_fallback": True,
    }


@bp.post("/generate-report")
def generate_report():
    body = request.get_json(silent=True) or {}
    stats = body.get("stats") or {}
    cache = current_app.cache
    key = cache.key("report", {"stats": stats})
    hit = cache.get(key)
    if hit: return jsonify(hit)

    user = f"Aggregate stats: {stats}\n"
    result = current_app.groq.chat_json(SYSTEM, user)
    if not result:
        result = _fallback(stats)
    else:
        result.setdefault("generated_at", dt.datetime.utcnow().isoformat() + "Z")

    cache.set(key, result)
    return jsonify(result)
