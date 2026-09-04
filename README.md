# Tool-94 — Consent Audit Trail

An AI-powered GDPR-style consent audit trail. Records data-processing consents, uses
Groq LLM to describe records and recommend compliance actions, and generates audit reports.

Repository: <https://github.com/yogeshpatil4138-ship-it/consent-audit-trail>

---

## Architecture

```
+-------------------+        +---------------------+        +-----------------+
|                   |  HTTP  |                     |  HTTP  |                 |
|  React + Vite     +------->+  Spring Boot 3      +------->+  Flask 3 AI     |
|  (port 80)        |  JWT   |  Backend (8080)     |        |  (port 5000)    |
|  Tailwind + Axios |<-------+  JPA + Flyway       |<-------+  Groq LLaMA-3.3 |
|                   |        |  JWT + RBAC         |        |  flask-limiter  |
+-------------------+        +----+-----------+----+        +--------+--------+
                                  |           |                      |
                             +----v---+   +---v----+            +----v----+
                             |Postgres|   | Redis  |            |  Redis  |
                             |  15    |   |  7     |            | (cache) |
                             +--------+   +--------+            +---------+
```

## Tech stack

| Layer     | Tech                                                         |
| --------- | ------------------------------------------------------------ |
| Backend   | Java 17, Spring Boot 3.2, Spring Security + JWT, JPA, Flyway |
| Database  | PostgreSQL 15                                                |
| Cache     | Redis 7                                                      |
| AI        | Python 3.11, Flask 3, Groq API (LLaMA-3.3-70b)               |
| Frontend  | React 18, Vite, Tailwind CSS, Axios, Recharts                |
| Infra     | Docker + Docker Compose                                      |

## Prerequisites

1. **Docker Desktop** — <https://www.docker.com/products/docker-desktop>
2. **Git** — <https://git-scm.com/>
3. **Groq API key** (free) — <https://console.groq.com>
4. (Local dev only) JDK 17, Node.js 18+, Python 3.11

## Quick start (Windows / Mac / Linux)

```bash
# 1. Clone
git clone https://github.com/yogeshpatil4138-ship-it/consent-audit-trail.git
cd consent-audit-trail

# 2. Configure secrets
copy .env.example .env         # Windows
# cp   .env.example .env       # Mac / Linux
# --> Open .env and paste your GROQ_API_KEY. Change JWT_SECRET.

# 3. Boot the whole stack
docker-compose up --build

# 4. Open
# Frontend       : http://localhost:8081
# Backend Swagger: http://localhost:8080/swagger-ui.html
# AI health      : http://localhost:5000/health
```

Default demo login (seeded on first boot):

| Username | Password  | Role  |
| -------- | --------- | ----- |
| admin    | admin123  | ADMIN |
| auditor  | audit123  | USER  |

## Environment variables

See [`.env.example`](.env.example). Never commit `.env` — it is gitignored.

| Var                 | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `POSTGRES_*`        | Database credentials                       |
| `JWT_SECRET`        | HMAC secret, min 32 chars                  |
| `JWT_EXPIRATION_MS` | Token lifetime (default 1h)                |
| `GROQ_API_KEY`      | Groq API key                               |
| `GROQ_MODEL`        | Groq model name                            |
| `MAIL_*`            | SMTP for daily reminders (optional)        |
| `SEED_DATA`         | `true` to load 30 demo records on startup  |
| `VITE_API_BASE_URL` | Backend URL baked into React at build time |

## Reset demo data

```bash
docker-compose down -v
docker-compose up --build
```

## Tests

```bash
# Backend
cd backend && ./mvnw test

# AI service
cd ai-service && pytest -q
```

## Hosting on Render.com

See [`render.yaml`](render.yaml). One-click blueprint deploy:

1. Push this repo to GitHub.
2. Sign in to <https://render.com> with GitHub.
3. New → Blueprint → pick this repo → Apply.
4. Set the secret env vars (`GROQ_API_KEY`, `JWT_SECRET`, `MAIL_*`).
5. Wait ~10 minutes. Render outputs URLs for the frontend and backend.

## Project layout

```
consent-audit-trail/
  backend/           # Spring Boot 3
  ai-service/        # Flask + Groq
  frontend/          # React + Vite
  docker-compose.yml
  render.yaml
  .env.example
  SECURITY.md
  README.md
```

## Security

See [`SECURITY.md`](SECURITY.md).

## License

MIT — internship capstone.
