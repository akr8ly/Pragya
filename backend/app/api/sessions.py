from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile

from app.core.auth import AuthenticatedUser, require_authenticated_user
from app.schemas.sessions import (
    CBTFeedbackRequest,
    CBTFeedbackResponse,
    SessionEndResponse,
    SessionStartResponse,
    SessionTurnRequest,
    SessionTurnResponse,
    SessionVoiceTurnResponse,
)
from app.services.conversation_service import clear_conversation, get_conversation_history, respond_to_turn
from app.services.reflection_service import create_recap, save_helpfulness_rating, save_recap
from app.services.session_service import (
    end_session,
    ensure_feedback_available,
    ensure_turn_available,
    get_active_session,
    record_completed_turn,
    start_session,
)
from app.core.config import get_settings
from app.services.voice_service import clear_turn_audio, get_turn_audio, process_voice_turn

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionStartResponse, status_code=201)
async def create_session(
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> SessionStartResponse:
    session = start_session(user.user_id)
    return SessionStartResponse(
        session_id=session.session_id,
        status="active",
        started_at=session.started_at,
        processing_status="provider_pending",
    )


@router.post("/{session_id}/turns", response_model=SessionTurnResponse)
async def send_turn(
    session_id: str,
    request: SessionTurnRequest,
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> SessionTurnResponse:
    ensure_turn_available(session_id, user.user_id)
    reply = await respond_to_turn(session_id, request.message, user.user_id)
    record_completed_turn(session_id, user.user_id)
    return SessionTurnResponse(
        session_id=session_id,
        response=reply,
        model=get_settings().gemini_model,
    )


@router.post("/{session_id}/voice-turns", response_model=SessionVoiceTurnResponse)
async def send_voice_turn(
    session_id: str,
    audio_file: UploadFile = File(...),
    language_code: str | None = Form(default=None),
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> SessionVoiceTurnResponse:
    ensure_turn_available(session_id, user.user_id)
    if audio_file.filename and audio_file.filename.lower().endswith(".webm"):
        raise HTTPException(
            status_code=415,
            detail="Web audio is not accepted by the configured Prisma REST endpoint. Use the mobile app recording format.",
        )
    audio = await audio_file.read(10 * 1024 * 1024 + 1)
    if len(audio) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Recording must be no larger than 10 MB.")
    transcript, reply, audio_id = await process_voice_turn(
        session_id,
        user.user_id,
        audio,
        audio_file.filename or "recording.m4a",
        audio_file.content_type or "application/octet-stream",
        language_code or get_settings().gnani_stt_language_code,
    )
    record_completed_turn(session_id, user.user_id)
    return SessionVoiceTurnResponse(
        session_id=session_id,
        transcript=transcript,
        response=reply,
        model=get_settings().gemini_model,
        audio_id=audio_id,
    )


@router.get("/{session_id}/audio/{audio_id}")
async def fetch_turn_audio(
    session_id: str,
    audio_id: str,
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> Response:
    return Response(
        content=get_turn_audio(session_id, audio_id, user.user_id),
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )


@router.post("/{session_id}/end", response_model=SessionEndResponse)
async def finish_session(
    session_id: str,
    request: CBTFeedbackRequest,
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> SessionEndResponse:
    active_session = ensure_feedback_available(session_id, user.user_id)
    history = get_conversation_history(session_id)
    if not history:
        raise HTTPException(status_code=422, detail="Complete at least one spoken turn before ending this session.")
    recap = await create_recap(history)
    if recap is None:
        raise HTTPException(status_code=502, detail="Could not generate the daily report. Please try again.")
    ended_at = datetime.now(timezone.utc)
    await save_recap(
        session_id=session_id,
        user_id=user.user_id,
        access_token=user.access_token,
        started_at=active_session.started_at,
        ended_at=ended_at,
        recap=recap,
        helpfulness_rating=request.helpfulness_rating,
    )
    session = end_session(session_id, user.user_id)
    clear_conversation(session_id)
    clear_turn_audio(session_id)
    return SessionEndResponse(
        session_id=session.session_id,
        status="ended",
        ended_at=session.ended_at,
        recap_status="generated",
        message="Feedback saved. Your session ended and daily report is ready.",
        recap=recap,
    )


@router.post("/{session_id}/feedback", response_model=CBTFeedbackResponse)
async def submit_feedback(
    session_id: str,
    request: CBTFeedbackRequest,
    user: AuthenticatedUser = Depends(require_authenticated_user),
) -> CBTFeedbackResponse:
    await save_helpfulness_rating(
        session_id=session_id,
        user_id=user.user_id,
        access_token=user.access_token,
        rating=request.helpfulness_rating,
    )
    return CBTFeedbackResponse(
        session_id=session_id,
        helpfulness_rating=request.helpfulness_rating,
    )
