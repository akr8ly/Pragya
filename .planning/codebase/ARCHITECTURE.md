---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
<!-- refreshed: 2026-11-07 -->
# Architecture

**Analysis Date:** 2026-11-07

## System Overview

```text
Expo Router mobile client (`mobile/src/app/`)
  -> Supabase Auth (`mobile/src/lib/supabase.ts`)
  -> FastAPI (`backend/app/main.py`)
  -> session services / external AI providers
  -> Supabase PostgREST (`session_recaps`)
```

## Component Responsibilities

| Component | Responsibility | File |
|---|---|---|
| Mobile routes | Screens, device audio and navigation | `mobile/src/app/` |
| API client | Authenticated HTTP, recording upload and reply URL construction | `mobile/src/lib/api.ts` |
| API router | Session lifecycle, feedback, voice turns and audio delivery | `backend/app/api/sessions.py` |
| Session service | In-memory session state and provider orchestration | `backend/app/services/session_service.py` |
| Reflection service | Recap persistence and progress aggregation | `backend/app/services/reflection_service.py` |

## Data Flow

1. The signed-in Expo app starts a session through `mobile/src/lib/api.ts`.
2. `backend/app/api/sessions.py` verifies the Supabase bearer token through `backend/app/core/auth.py`.
3. Audio flows through `backend/app/services/voice_service.py`, then the language model service in `backend/app/services/gemini_service.py`.
4. The three-turn session ends only after feedback; the recap is saved by `backend/app/services/reflection_service.py` to the `session_recaps` table.
5. The profile/progress UI requests the aggregate report from `backend/app/main.py`.

## Architectural Constraints

- The mobile client never owns AI provider credentials; its only provider-facing target is the FastAPI API.
- Session memory is process-local in `backend/app/services/session_service.py`; server restarts end active sessions.
- Recaps, not raw audio or full transcripts, are persisted by the current schema.
- The app is intentionally non-diagnostic and uses CBT-informed reflection, enforced by `backend/app/services/gemini_service.py`.

## Error Handling

- Backend routes translate provider and Supabase failures into FastAPI HTTP errors.
- The mobile client shows user-facing messages and preserves text responses when audio playback fails.

---

*Architecture analysis: 2026-11-07*
