# Shiv Tatva Solutions Private Limited — Enterprise SaaS + HRMS

Premium, modern, AI-powered SaaS website + HRMS platform built with a production-style architecture.

## Monorepo structure

- `apps/web` — Next.js (TypeScript) public site + dashboards (Admin/Employee)
- `services/api-gateway` — Node.js + Express (JWT/RBAC-ready API gateway)
- `services/ai-service` — Python + FastAPI (AI insights stub, OpenAI/LangChain ready)
- `services/hrms-service` — Spring Boot (HRMS service stub)
- `infra` — Docker Compose for Postgres / MySQL / MongoDB / Redis

## Run the web app

From repo root:

```powershell
npm install
npm run dev:web
```

Open `http://localhost:3000`.

## Run the API gateway (Node/Express)

```powershell
npm install
npm run dev:api
```

API gateway runs at `http://localhost:4000`.

Endpoints:
- `GET /health`
- `POST /auth/login` → returns JWT
- `GET /admin/employees` (admin JWT required)
- `GET /employee/me` (JWT required)

## Run AI service (FastAPI)

```powershell
cd services/ai-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Endpoints:
- `GET /health`
- `POST /ai/insights`

## Run HRMS service (Spring Boot)

```powershell
cd services/hrms-service
mvn spring-boot:run
```

Runs at `http://localhost:8081`.

Endpoints:
- `GET /health`
- `GET /employees`

## Databases (Docker Compose)

Docker Desktop is required. Once installed:

```powershell
cd infra
docker compose up -d
```

Services:
- Postgres: `localhost:5432` (db/user/pass: `shivtatva` / `shivtatva` / `shivtatva`)
- MySQL: `localhost:3306` (db/user/pass: `shivtatva` / `shivtatva` / `shivtatva`)
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

Stop:

```powershell
docker compose down
```

## Security model (ready to extend)

- **JWT Authentication**: demo token issuance in the API gateway
- **RBAC**: route guards via `requireAuth({ roles: [...] })`
- **OAuth 2.0 + MFA**: UI-ready; planned in backend integration layer

## Notes

- The UI is designed for a premium enterprise SaaS feel: glassmorphism, gradients, glow, and motion.
- Attendance demo is stored in browser localStorage for now; it’s structured to be swapped to backend APIs.

