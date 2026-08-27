# SECURITY.md — Consent Audit Trail

## 1. Executive Summary

The Consent Audit Trail stores potentially sensitive GDPR consent metadata. This document
lists the identified threats, mitigating controls, tests executed, findings, and residual
risks. All critical/high findings from the pre-demo review were fixed.

## 2. Threat Model

| # | Threat                             | Impact                                | Mitigation                                                                            |
| - | ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| 1 | Credential compromise / brute-force | Attacker impersonates a legitimate user | BCrypt password hashing, JWT tokens (1h TTL), server-side rate limiting on `/api/auth/**` (recommended for prod), never log passwords. |
| 2 | JWT tampering / replay             | Privilege escalation                  | HMAC-SHA256 signature with `JWT_SECRET` (≥32 bytes), issuer/expiry validated on every request. |
| 3 | SQL injection                      | Data exfiltration / destruction       | JPA + parameterised queries only. Zero string-concatenated SQL. Bean validation on every DTO. |
| 4 | Prompt injection on AI endpoints   | Model divulges system prompt / abuse  | Input sanitiser (`services/sanitize.py`) strips HTML and rejects known jailbreak patterns; length capped at 2000 chars. |
| 5 | Cross-origin abuse                 | CSRF / data theft from other origins  | Strict CORS whitelist via `CORS_ALLOWED_ORIGINS`, `SameSite` on cookies (N/A here — JWT header), CSRF disabled only because API is stateless with Bearer tokens. |
| 6 | XSS in frontend                    | Session hijack                        | React auto-escapes; nginx sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, HSTS. |
| 7 | Denial-of-service on AI            | Groq bill blow-out / outages          | `flask-limiter` at 30 req/min per IP, Redis 15-minute SHA-256 response cache, 3-retry with backoff and fallback response. |
| 8 | PII leaked into LLM prompts        | GDPR breach                           | Prompts contain only subject ID (opaque) + purpose + legal basis; email/address never sent. Verified by grep audit. |
| 9 | Secrets in git                     | Full account takeover                 | `.env` in `.gitignore` from Day 1, `.env.example` committed instead, GitHub secret scanning enabled. |
| 10 | Broken access control             | User reads/edits others' data         | Spring Security `@PreAuthorize`, `DELETE /consents/*` restricted to ADMIN role. |

## 3. Tests Conducted

| Test                                                | Tool                     | Result |
| --------------------------------------------------- | ------------------------ | ------ |
| Static analysis on Java                             | `mvn spotbugs:check`     | 0 critical |
| Dependency scan                                     | `mvn dependency-check`   | No known-critical CVEs |
| AI-service dependency scan                          | `pip-audit`              | 0 critical |
| Prompt-injection payloads (20 variants)             | Manual + pytest          | All rejected with 400 |
| SQL injection on every endpoint                     | Manual + `sqlmap`        | No injection possible |
| Auth bypass — missing / expired / tampered JWT      | Postman                  | 401 in every case |
| Role escalation — user calls DELETE                 | Postman                  | 403 for non-admin |
| Rate limiting                                       | `ab -n 100 -c 10 …`      | 30/min enforced |
| OWASP ZAP full active scan                          | ZAP 2.15                 | 0 Critical, 0 High remaining |
| Docker image scan                                   | `trivy image cat-*`      | Base images patched (Alpine, Temurin, Python-slim) |

## 4. Findings and Fixes

| Severity | Finding                                             | Status  |
| -------- | --------------------------------------------------- | ------- |
| High     | JWT secret was too short in first pass              | Fixed — hard-fail on startup if `<32` bytes |
| High     | `/actuator/**` unauthenticated exposed heap dumps   | Fixed — Actuator exposure limited to `health,info,metrics` |
| Medium   | Missing `X-Content-Type-Options` on API responses   | Fixed via Spring Security `headers()` |
| Medium   | Session cookie set by default Spring config         | Fixed — session policy STATELESS, cookies disabled |
| Low      | Verbose stack traces returned on 500                | Fixed — `@ControllerAdvice` sanitises messages |

## 5. Residual Risks

- **Free Groq tier** has occasional latency spikes; mitigated with cache + fallback but SLA is best-effort.
- Backend does **not currently** send SMS/email 2FA. Suitable for internal audit use only.
- Postgres is exposed on `5432` in `docker-compose.yml` for developer convenience. **Do not** publish this port in production — remove the port mapping.
- The seeded `admin/admin123` credential is for demo only. **Rotate on first prod boot.**

## 6. Sign-off

| Role              | Name    | Date       |
| ----------------- | ------- | ---------- |
| Java Developer 1  | _____   | 8 May 2026 |
| Java Developer 2  | _____   | 8 May 2026 |
| AI Developer 1    | _____   | 8 May 2026 |
| AI Developer 2    | _____   | 8 May 2026 |
| Security Reviewer | _____   | 8 May 2026 |
