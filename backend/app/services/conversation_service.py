from app.services.gemini_service import generate_reply
from app.services.session_service import get_active_session

_MAX_HISTORY_MESSAGES = 12
_conversations: dict[str, list[dict[str, str]]] = {}


async def respond_to_turn(session_id: str, message: str, user_id: str) -> str:
    get_active_session(session_id, user_id)
    clean_message = message.strip()
    if not clean_message:
        return ""

    history = _conversations.get(session_id, [])
    reply = await generate_reply(history, clean_message)
    updated = history + [
        {"role": "user", "text": clean_message},
        {"role": "model", "text": reply},
    ]
    _conversations[session_id] = updated[-_MAX_HISTORY_MESSAGES:]
    return reply


def get_conversation_history(session_id: str) -> list[dict[str, str]]:
    return list(_conversations.get(session_id, []))


def clear_conversation(session_id: str) -> None:
    _conversations.pop(session_id, None)
