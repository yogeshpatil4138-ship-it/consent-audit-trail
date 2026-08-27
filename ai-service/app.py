"""Flask entry point for the Consent Audit Trail AI service."""
import os
import time
import logging
from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from services.groq_client import GroqClient
from services.cache import ResponseCache
from services.sanitize import sanitize_payload, SanitizationError
from routes.describe import bp as describe_bp
from routes.recommend import bp as recommend_bp
from routes.report import bp as report_bp

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("ai-service")

def create_app() -> Flask:
    app = Flask(__name__)
    app.config["START_TIME"] = time.time()
    app.config["MODEL"] = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    app.groq  = GroqClient()
    app.cache = ResponseCache()

    Limiter(get_remote_address, app=app, default_limits=["30 per minute"])

    @app.before_request
    def _sanitize():
        if request.method == "POST" and request.is_json:
            try:
                cleaned = sanitize_payload(request.get_json(silent=True) or {})
            except SanitizationError as e:
                return jsonify({"error": "bad_input", "message": str(e)}), 400
            # Flask caches parsed JSON in _cached_json as (value_when_not_silent, value_when_silent)
            request._cached_json = (cleaned, cleaned)

    @app.get("/health")
    def health():
        uptime = int(time.time() - app.config["START_TIME"])
        return jsonify({
            "status": "ok",
            "model": app.config["MODEL"],
            "uptime_seconds": uptime,
            "avg_response_ms": app.groq.avg_response_ms(),
            "calls_total": app.groq.calls_total,
            "cache": app.cache.stats(),
        })

    @app.errorhandler(404)
    def _404(e): return jsonify({"error":"not_found"}), 404

    @app.errorhandler(429)
    def _429(e): return jsonify({"error":"rate_limited","message":"Try again in a minute."}), 429

    @app.errorhandler(Exception)
    def _500(e):
        log.exception("Unhandled error")
        return jsonify({"error":"internal","message": str(e)}), 500

    app.register_blueprint(describe_bp)
    app.register_blueprint(recommend_bp)
    app.register_blueprint(report_bp)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
