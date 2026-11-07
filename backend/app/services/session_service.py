from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException

from app.schemas.sessions import SessionRecord

# Temporary process-local state for the prototype API contract.
# Replace with a user-scoped database repository before multi-user deployment.
_sessions: dict[str, SessionRecord] = {}
MAX_SESSION_TURNS = 3


def start_session(user_id: str) -> SessionRecord:
    session = SessionRecord(
        session_id=str(uuid4()),
        user_id=user_id,
        status="active",
        started_at=datetime.now(timezone.utc),
    )
    _sessions[session.session_id] = session
    return session


def get_active_session(session_id: str, user_id: str) -> SessionRecord:
    session = get_session(session_id, user_id)
    if session.status != "active":
        raise HTTPException(status_code=409, detail="This session has already ended.")
    return session


def ensure_turn_available(session_id: str, user_id: str) -> SessionRecord:
    session = get_active_session(session_id, user_id)
    if session.event_count >= MAX_SESSION_TURNS:
        raise HTTPException(
            status_code=409,
            detail="You’ve completed 3 spoken turns. Submit your feedback to generate the daily report and end the session.",
        )
    return session


def record_completed_turn(session_id: str, user_id: str) -> SessionRecord:
    session = ensure_turn_available(session_id, user_id)
    updated = session.model_copy(update={"event_count": session.event_count + 1})
    _sessions[session_id] = updated
    return updated


def ensure_feedback_available(session_id: str, user_id: str) -> SessionRecord:
    """Require the complete three-turn reflection before closing a session."""
    session = get_active_session(session_id, user_id)
    if session.event_count < MAX_SESSION_TURNS:
        remaining = MAX_SESSION_TURNS - session.event_count
        turn_label = "turn" if remaining == 1 else "turns"
        raise HTTPException(
            status_code=409,
            detail=(
                f"Complete all {MAX_SESSION_TURNS} spoken turns before feedback. "
                f"You have {remaining} {turn_label} left."
            ),
        )
    return session


def get_session(session_id: str, user_id: str) -> SessionRecord:
    session = _sessions.get(session_id)
    if session is None or session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Session not found or server restarted.")
    return session


def end_session(session_id: str, user_id: str) -> SessionRecord:
    session = get_session(session_id, user_id)

    if session.status == "ended":
        return session

    ended = session.model_copy(
        update={"status": "ended", "ended_at": datetime.now(timezone.utc)}
    )
    _sessions[session_id] = ended
    return ended
