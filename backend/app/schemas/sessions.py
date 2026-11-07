from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CBTReflection(BaseModel):
    situation: str
    thought: str
    balanced_perspective: str


class SessionRecap(BaseModel):
    summary: str
    themes: list[str] = Field(default_factory=list, max_length=5)
    cbt_reflection: CBTReflection
    next_step: str


class ProgressEntry(BaseModel):
    session_id: str
    ended_at: datetime
    summary: str
    themes: list[str]
    helpfulness_rating: int | None = None


class ProgressReport(BaseModel):
    period_days: int
    activity_timestamps: list[datetime] = Field(default_factory=list)
    session_count: int
    average_helpfulness: float | None = None
    recurring_themes: list[str] = Field(default_factory=list)
    recent_sessions: list[ProgressEntry] = Field(default_factory=list)


class CBTFeedbackRequest(BaseModel):
    helpfulness_rating: int = Field(ge=1, le=5)


class CBTFeedbackResponse(BaseModel):
    session_id: str
    helpfulness_rating: int


class SessionStartResponse(BaseModel):
    session_id: str
    status: Literal["active"]
    started_at: datetime
    processing_status: Literal["provider_pending"]


class SessionEndResponse(BaseModel):
    session_id: str
    status: Literal["ended"]
    ended_at: datetime
    recap_status: Literal["generated", "empty", "unavailable"]
    message: str
    recap: SessionRecap | None = None


class SessionTurnRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class SessionTurnResponse(BaseModel):
    session_id: str
    response: str
    model: str


class SessionVoiceTurnResponse(BaseModel):
    session_id: str
    transcript: str
    response: str
    model: str
    audio_id: str


class SessionRecord(BaseModel):
    session_id: str
    user_id: str
    status: Literal["active", "ended"]
    started_at: datetime
    ended_at: datetime | None = None
    # Development lifecycle only. Audio and transcript content are never stored here.
    event_count: int = Field(default=0, ge=0)
