# Windows setup + Git + Render deploy (step-by-step)

You are on Windows. This walks you through:

1. Getting the project into `C:\Users\Yogesh\consent-audit-trail`
2. Pushing to <https://github.com/yogeshpatil4138-ship-it/consent-audit-trail>
3. Running it locally with Docker Desktop
4. Deploying to Render.com

Open **Command Prompt** (not PowerShell) for the commands below unless noted.

---

## 0. One-time installs

| Tool           | Where                                                       |
| -------------- | ----------------------------------------------------------- |
| Docker Desktop | <https://www.docker.com/products/docker-desktop>            |
| Git for Windows| <https://git-scm.com/download/win>                          |
| VS Code (opt.) | <https://code.visualstudio.com/>                            |

Verify:

```cmd
docker --version
git  --version
```

## 1. Unzip the project into C:\Users\Yogesh

1. Extract the `consent-audit-trail.zip` I provided so the folder ends up at:
   `C:\Users\Yogesh\consent-audit-trail\`
   (Inside it you should see `backend`, `ai-service`, `frontend`, `docker-compose.yml`, etc.)

2. Configure Git identity once (skip if already done):

```cmd
git config --global user.name  "Yogesh Patil"
git config --global user.email "your@email.com"
```

## 2. Get your Groq API key

1. Open <https://console.groq.com>.
2. Sign in with Google or GitHub (free tier, no credit card).
3. **API Keys → Create API Key**. Copy the `gsk_...` value.

## 3. Create your local .env

```cmd
cd C:\Users\Yogesh\consent-audit-trail
copy .env.example .env
notepad .env
```

Paste the Groq key into `GROQ_API_KEY=...`. Change `JWT_SECRET` to any 40+ char random string.
Save and close.

## 4. Push to your GitHub repo

```cmd
cd C:\Users\Yogesh\consent-audit-trail
git init
git remote add origin https://github.com/yogeshpatil4138-ship-it/consent-audit-trail.git
git branch -M main
git add .
git status         :: confirm .env is NOT listed
git commit -m "Day 1 — initial project scaffolding for Tool-94"
git push -u origin main
```

If GitHub asks for auth, use a **Personal Access Token** (not password):
<https://github.com/settings/tokens/new> → check `repo`, generate, paste as password.

## 5. Run locally

```cmd
cd C:\Users\Yogesh\consent-audit-trail
docker-compose up --build
```

Wait ~2 min on first boot (postgres warms up, Maven builds). Then open:

- <http://localhost>              — the React app
- <http://localhost:8080/swagger-ui.html> — API docs
- <http://localhost:5000/health>  — AI health

Login: `admin` / `admin123`

Stop: `Ctrl+C`, then `docker-compose down`.
Reset seeded data: `docker-compose down -v && docker-compose up --build`.

## 6. Deploy to Render.com

1. <https://render.com> → **Sign in with GitHub**.
2. Authorize Render to see `yogeshpatil4138-ship-it/consent-audit-trail`.
3. Click **New → Blueprint**.
4. Pick your repo. Render reads `render.yaml` automatically.
5. Click **Apply**.
6. In the settings page:
   - Paste your `GROQ_API_KEY` (marked `sync: false`).
   - Optionally set `MAIL_USERNAME` and `MAIL_PASSWORD` (Gmail app password).
7. Wait ~10 min. Render builds and boots all services.
8. Open the `cat-frontend` URL — that is your live app.

## 7. Daily workflow (per project spec — 1 commit per working day)

```cmd
cd C:\Users\Yogesh\consent-audit-trail
:: ...edit files...
git add .
git commit -m "Day 3 — implemented service layer with validation"
git push
```

Every push to `main` automatically triggers GitHub Actions (`.github/workflows/ci.yml`)
and re-deploys to Render.

## 8. Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `docker-compose up` fails on Windows with "cannot connect to Docker daemon" | Open Docker Desktop first and wait until the whale icon is steady. |
| Port 80 already in use | Change frontend port in `docker-compose.yml` to `"8081:80"` and open http://localhost:8081 |
| `pip` / `mvn` errors on local dev | Use Docker instead — you don't need JDK/Python installed. |
| Render backend can't reach AI | In Render env vars, ensure `AI_SERVICE_URL` matches the `cat-ai` service host. |
| Groq 401 / 402 | Key wrong or free-tier quota exhausted — regenerate at console.groq.com. |
| Empty consent list | `docker-compose down -v && docker-compose up --build` to re-seed. |

## 9. Demo-day dry run (Day 17 of the sprint)

```cmd
docker-compose down -v
docker-compose up --build
:: wait for "Started ConsentAuditTrailApplication in ... seconds"
```

Then follow section 8 of the PDF spec (6-minute presentation).
