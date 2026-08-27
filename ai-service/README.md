# AI Service — Consent Audit Trail

Flask microservice that wraps the Groq LLM API to describe consent records,
recommend compliance actions, and generate executive audit reports.

## Endpoints

| Method | Path              | Purpose                                    |
| ------ | ----------------- | ------------------------------------------ |
| GET    | `/health`         | Uptime + model + cache stats               |
| POST   | `/describe`       | 2-3 sentence description + compliance score |
| POST   | `/recommend`      | 3 prioritised recommendations              |
| POST   | `/generate-report`| Executive JSON report from stats           |

All responses are JSON. If Groq is unreachable, endpoints return a valid
fallback response with `"is_fallback": true`.

## Environment

| Var             | Required | Default                        |
| --------------- | -------- | ------------------------------ |
| `GROQ_API_KEY`  | yes      | —                              |
| `GROQ_MODEL`    | no       | `llama-3.3-70b-versatile`      |
| `GROQ_TEMPERATURE` | no    | `0.3`                          |
| `GROQ_MAX_TOKENS`  | no    | `1024`                         |
| `REDIS_HOST`    | no       | `localhost`                    |
| `REDIS_PORT`    | no       | `6379`                         |
| `PORT`          | no       | `5000`                         |

## Local dev

```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env    # then edit GROQ_API_KEY
export GROQ_API_KEY=gsk_...
python app.py
```

## Test

```bash
pytest -q
```

Tests mock the Groq client entirely — no network required.

## Docker

```bash
docker build -t cat-ai .
docker run -p 5000:5000 -e GROQ_API_KEY=$GROQ_API_KEY cat-ai
```
