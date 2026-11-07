from datetime import date
from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.sessions import router as sessions_router
from app.core.config import get_settings
from app.core.auth import AuthenticatedUser, require_authenticated_user
from app.schemas.sessions import ProgressReport
from app.services.reflection_service import delete_user_recaps, get_progress_report

settings = get_settings()

app = FastAPI(
    title="Pragya API",
    version="0.1.0",
    description="API for Pragya's live reflection and wellbeing prototype.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.app_cors_origins.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(sessions_router, prefix="/api")


class DailyPrompt(BaseModel):
    date: date
    prompt: str


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:


    return {
        "status": "ok",
        "service": "pragya-api",
        "text_model": settings.gemini_model,
        "session_end_requires_feedback": "true",
    }


@app.get("/api/prompts/daily", response_model=DailyPrompt, tags=["prompts"])
async def daily_prompt() -> DailyPrompt:
    prompts = [
        "What is one thing you wish felt a little easier today?",
        "What has been taking up most of your attention lately?",
        "What would you like to give yourself credit for today?",
    ]
    index = date.today().toordinal() % len(prompts)
    return DailyPrompt(date=date.today(), prompt=prompts[index])


@app.get("/api/progress", response_model=ProgressReport, tags=["progress"])
async def progress_report(
    days: int = Query(default=30, ge=7, le=90),
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> ProgressReport:
    return await get_progress_report(
        user_id=user.user_id,
        access_token=user.access_token,
        period_days=days,
    )


class DataDeletionResponse(BaseModel):
    deleted_recaps: int
    message: str


@app.delete("/api/account/data", response_model=DataDeletionResponse, tags=["account"])
async def delete_account_data(
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> DataDeletionResponse:
    deleted_count = await delete_user_recaps(user_id=user.user_id, access_token=user.access_token)
    return DataDeletionResponse(
        deleted_recaps=deleted_count,
        message="Your saved session recaps have been deleted.",
    )
