from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Shiv Tatva AI Service", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-service", "ts": datetime.utcnow().isoformat() + "Z"}


class InsightsRequest(BaseModel):
    department: str | None = None
    sample_size: int = 50


@app.post("/ai/insights")
def ai_insights(req: InsightsRequest):
    # Placeholder for OpenAI/LangChain/TensorFlow based insights.
    # This endpoint is wired for future expansion.
    insights = [
        "Break durations trending higher after 3 PM — suggest smart reminders.",
        "Late arrival spike on Mondays — consider flexible shift policy.",
        "High productivity cluster in Engineering — replicate workflow templates.",
    ]
    if req.department:
        insights.insert(0, f"Insights filtered for department: {req.department}")
    return {"ok": True, "sample_size": req.sample_size, "insights": insights}

