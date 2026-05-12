# AI Service (FastAPI)

## Run (local)

```bash
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Endpoints
- `GET /health`
- `POST /ai/insights`

