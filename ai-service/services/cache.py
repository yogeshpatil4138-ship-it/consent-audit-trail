"""Redis-backed AI response cache (SHA256 key, 15 min TTL). Silent fallback in-memory."""
import os
import json
import hashlib
import logging
from typing import Any, Optional

log = logging.getLogger(__name__)

try:
    import redis
except Exception:
    redis = None    # type: ignore


class ResponseCache:
    def __init__(self, ttl_seconds: int = 900):
        self.ttl = ttl_seconds
        self._mem: dict[str, tuple[float, str]] = {}
        self._hits = 0
        self._misses = 0
        self._r: Optional[object] = None
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", "6379"))
        if redis:
            try:
                self._r = redis.Redis(host=host, port=port, decode_responses=True, socket_connect_timeout=2)
                self._r.ping()
            except Exception as e:
                log.info("Redis unavailable (%s) — using in-memory cache.", e)
                self._r = None

    @staticmethod
    def key(endpoint: str, payload: dict) -> str:
        raw = endpoint + "|" + json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return "ai:" + hashlib.sha256(raw.encode()).hexdigest()

    def get(self, k: str) -> Optional[Any]:
        try:
            if self._r:
                v = self._r.get(k)
                if v: self._hits += 1; return json.loads(v)
            elif k in self._mem:
                self._hits += 1
                return json.loads(self._mem[k][1])
        except Exception as e:
            log.warning("cache get failed: %s", e)
        self._misses += 1
        return None

    def set(self, k: str, value: Any) -> None:
        try:
            payload = json.dumps(value)
            if self._r: self._r.setex(k, self.ttl, payload)
            else:       self._mem[k] = (0.0, payload)
        except Exception as e:
            log.warning("cache set failed: %s", e)

    def stats(self) -> dict:
        return {"backend": "redis" if self._r else "memory",
                "hits": self._hits, "misses": self._misses}
