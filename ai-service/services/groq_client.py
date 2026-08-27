"""Thin, retrying Groq wrapper with average-latency instrumentation."""
import os
import json
import time
import logging
from typing import Optional

log = logging.getLogger(__name__)

try:
    from groq import Groq
except Exception:            # groq lib is optional in offline test envs
    Groq = None              # type: ignore


class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.model   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.temperature = float(os.getenv("GROQ_TEMPERATURE", "0.3"))
        self.max_tokens  = int(os.getenv("GROQ_MAX_TOKENS", "1024"))
        self.calls_total = 0
        self._total_ms   = 0.0
        self._client: Optional[object] = None
        if Groq and self.api_key:
            try:
                self._client = Groq(api_key=self.api_key)
            except Exception as e:
                log.warning("Groq client init failed: %s", e)

    def avg_response_ms(self) -> int:
        return int(self._total_ms / self.calls_total) if self.calls_total else 0

    def is_enabled(self) -> bool:
        return self._client is not None

    def chat_json(self, system_prompt: str, user_prompt: str, retries: int = 3) -> Optional[dict]:
        """Call Groq. On any failure return None (caller falls back)."""
        if not self._client:
            log.info("Groq disabled (no key or lib) — returning None.")
            return None
        last_err = None
        for attempt in range(1, retries + 1):
            t0 = time.time()
            try:
                resp = self._client.chat.completions.create(
                    model=self.model,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                )
                content = resp.choices[0].message.content
                self._record(t0)
                return json.loads(content)
            except Exception as e:
                last_err = e
                log.warning("Groq call failed (attempt %d/%d): %s", attempt, retries, e)
                time.sleep(min(2 ** attempt, 5))
        log.error("Groq call exhausted retries: %s", last_err)
        return None

    def _record(self, t0: float):
        self.calls_total += 1
        self._total_ms += (time.time() - t0) * 1000.0
