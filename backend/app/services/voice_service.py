from uuid import uuid4

import httpx
from fastapi import HTTPException

from app.core.config import get_settings
from app.services.conversation_service import respond_to_turn
from app.services.session_service import get_active_session

_audio_outputs: dict[str, dict[str, bytes]] = {}
_MAX_AUDIO_OUTPUTS_PER_SESSION = 3


async def process_voice_turn(
    session_id: str,
    user_id: str,
    audio: bytes,
    filename: str,
    content_type: str,
    language_code: str,
) -> tuple[str, str, str]:
    get_active_session(session_id, user_id)
    settings = get_settings()
    if not settings.gnani_api_key:
        raise HTTPException(status_code=503, detail="Gnani Speech API is not configured.")
    if not audio:
        raise HTTPException(status_code=400, detail="The recorded audio is empty.")

    headers = {"X-API-Key-ID": settings.gnani_api_key}
    stt_url = f"{settings.gnani_speech_base_url.rstrip('/')}/stt/v3"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            stt_response = await client.post(
                stt_url,
                headers=headers,
                data={
                    "model": settings.gnani_stt_model,
                    "language_code": language_code or settings.gnani_stt_language_code,
                    "format": "transcribe",
                },
                files={
                    "audio_file": (
                        filename or "recording.m4a",
                        audio,
                        content_type or "application/octet-stream",
                    )
                },
            )
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Speech transcription timed out.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Gnani transcription.") from exc

    if stt_response.status_code == 429 or stt_response.status_code >= 500:
        raise HTTPException(status_code=503, detail="Speech transcription is temporarily unavailable.")
    if stt_response.is_error:
        raise HTTPException(status_code=502, detail="Gnani could not transcribe this recording.")
    try:
        transcript = stt_response.json()["transcript"].strip()
    except (AttributeError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Gnani returned an unreadable transcript.") from exc
    if not transcript:
        raise HTTPException(status_code=422, detail="No speech was detected. Please try again.")

    reply = await respond_to_turn(session_id, transcript, user_id)
    tts_url = f"{settings.gnani_speech_base_url.rstrip('/')}/api/v1/tts/inference"
    tts_body = {
        "text": reply,
        "model": settings.gnani_tts_model,
        "voice": settings.gnani_tts_voice,
        "language": settings.gnani_tts_language,
        "audio_config": {
            "sample_rate": 24000,
            "num_channels": 1,
            "container": "mp3",
        },
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            tts_response = await client.post(tts_url, headers=headers, json=tts_body)
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Speech synthesis timed out.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Gnani speech synthesis.") from exc

    if tts_response.status_code == 429 or tts_response.status_code >= 500:
        raise HTTPException(status_code=503, detail="Speech synthesis is temporarily unavailable.")
    if tts_response.is_error or not tts_response.content:
        raise HTTPException(status_code=502, detail="Gnani could not synthesize the response.")

    audio_id = str(uuid4())
    outputs = _audio_outputs.setdefault(session_id, {})
    outputs[audio_id] = tts_response.content
    while len(outputs) > _MAX_AUDIO_OUTPUTS_PER_SESSION:
        outputs.pop(next(iter(outputs)))
    return transcript, reply, audio_id


def get_turn_audio(session_id: str, audio_id: str, user_id: str) -> bytes:
    get_active_session(session_id, user_id)
    audio = _audio_outputs.get(session_id, {}).get(audio_id)
    if audio is None:
        raise HTTPException(status_code=404, detail="Audio response not found or expired.")
    return audio


def clear_turn_audio(session_id: str) -> None:
    _audio_outputs.pop(session_id, None)
