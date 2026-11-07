from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import HTTPException

from app.core.config import get_settings
from app.schemas.sessions import ProgressEntry, ProgressReport, SessionRecap
from app.services.gemini_service import generate_recap


async def create_recap(history: list[dict[str, str]]) -> SessionRecap | None:
    if not history:
        return None
    return await generate_recap(history)


def _supabase_headers(access_token: str, *, prefer: str | None = None) -> dict[str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise HTTPException(status_code=503, detail="Supabase storage is not configured.")
    headers = {
        "apikey": settings.supabase_publishable_key,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def _recaps_url() -> str:
    url = get_settings().supabase_url
    if not url:
        raise HTTPException(status_code=503, detail="Supabase storage is not configured.")
    return f"{url.rstrip('/')}/rest/v1/session_recaps"


async def save_recap(
    *,
    session_id: str,
    user_id: str,
    access_token: str,
    started_at: datetime,
    ended_at: datetime,
    recap: SessionRecap,
    helpfulness_rating: int,
) -> None:
    record = {
        "session_id": session_id,
        "user_id": user_id,
        "started_at": started_at.isoformat(),
        "ended_at": ended_at.isoformat(),
        "summary": recap.summary,
        "themes": recap.themes,
        "cbt_reflection": recap.cbt_reflection.model_dump(),
        "next_step": recap.next_step,
        "helpfulness_rating": helpfulness_rating,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                _recaps_url(),
                params={"on_conflict": "user_id,session_id"},
                headers=_supabase_headers(
                    access_token,
                    prefer="resolution=merge-duplicates,return=minimal",
                ),
                json=record,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not save the session recap.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Your sign-in expired before the recap could be saved.")
    if response.is_error:
        raise HTTPException(status_code=503, detail="Could not save the session recap.")


async def save_helpfulness_rating(
    *, session_id: str, user_id: str, access_token: str, rating: int
) -> None:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.patch(
                _recaps_url(),
                params={"session_id": f"eq.{session_id}", "user_id": f"eq.{user_id}"},
                headers=_supabase_headers(access_token, prefer="return=representation"),
                json={"helpfulness_rating": rating},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not save your feedback.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Your sign-in expired before feedback could be saved.")
    if response.is_error:
        raise HTTPException(status_code=503, detail="Could not save your feedback.")
    try:
        updated = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Supabase returned an unreadable response.") from exc
    if not updated:
        raise HTTPException(status_code=404, detail="There is no recap to rate for this session.")


async def get_progress_report(
    *, user_id: str, access_token: str, period_days: int
) -> ProgressReport:
    cutoff = datetime.now(timezone.utc) - timedelta(days=period_days)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                _recaps_url(),
                params={
                    "select": "session_id,ended_at,summary,themes,helpfulness_rating",
                    "user_id": f"eq.{user_id}",
                    "ended_at": f"gte.{cutoff.isoformat()}",
                    "order": "ended_at.desc",
                    "limit": "100",
                },
                headers=_supabase_headers(access_token),
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not load your progress report.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Your sign-in expired before the report could load.")
    if response.is_error:
        raise HTTPException(status_code=503, detail="Could not load your progress report.")
    try:
        records: list[dict[str, Any]] = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Supabase returned an unreadable report.") from exc

    theme_counts: Counter[str] = Counter()
    theme_labels: dict[str, str] = {}
    recent: list[ProgressEntry] = []
    ratings: list[int] = []
    for record in records:
        themes = record.get("themes") or []
        for theme in themes:
            normalized = theme.strip().casefold()
            if normalized:
                theme_labels.setdefault(normalized, theme.strip())
                theme_counts[normalized] += 1
        rating = record.get("helpfulness_rating")
        if rating is not None:
            ratings.append(int(rating))
        if len(recent) < 10:
            recent.append(
                ProgressEntry(
                    session_id=str(record["session_id"]),
                    ended_at=record["ended_at"],
                    summary=record["summary"],
                    themes=themes,
                    helpfulness_rating=rating,
                )
            )

    return ProgressReport(
        period_days=period_days,
        session_count=len(records),
        average_helpfulness=round(sum(ratings) / len(ratings), 1) if ratings else None,
        recurring_themes=[theme_labels[key] for key, _ in theme_counts.most_common(5)],
        recent_sessions=recent,
        activity_timestamps=[
            datetime.fromisoformat(str(record["ended_at"]).replace("Z", "+00:00"))
            for record in records
        ],
    )




async def delete_user_recaps(*, user_id: str, access_token: str) -> int:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.delete(
                _recaps_url(),
                params={"user_id": f"eq.{user_id}"},
                headers=_supabase_headers(access_token, prefer="return=representation"),
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not delete saved session recaps.") from exc
    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Your sign-in expired before your data could be deleted.")
    if response.is_error:
        raise HTTPException(status_code=503, detail="Could not delete saved session recaps.")
    try:
        deleted = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Supabase returned an unreadable response.") from exc
    return len(deleted) if isinstance(deleted, list) else 0
