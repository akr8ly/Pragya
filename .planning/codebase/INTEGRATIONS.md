---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# External Integrations

**Analysis Date:** 2026-11-07

## APIs & External Services

**Speech:**
- Gnani Speech API — transcribes a voice turn and synthesizes the companion reply in `backend/app/services/voice_service.py`.
  - Client: `httpx.AsyncClient`.
  - STT endpoint: configured base URL plus `/stt/v3`.
  - TTS endpoint: configured base URL plus `/api/v1/tts/inference`.
  - Auth: server-only `GNANI_API_KEY` configuration; it is never sent to the mobile app.

**Generative text:**
- Google Generative Language API — generates the CBT-informed reply and structured recap in `backend/app/services/gemini_service.py`.
  - Client: `httpx.AsyncClient` with `generateContent`.
  - Model selection: server configuration defaults to `gemma-4-26b-a4b-it`.
  - Auth: server-only `GEMINI_API_KEY` configuration.

**Music:**
- Spotify is represented by configuration fields in `backend/app/core/config.py` and a playlist-preview route in `mobile/src/app/playlists.tsx`.
  - Required future integration: OAuth token exchange and Spotify Web API playlist creation are not implemented in the current source.
  - Configuration names: `SPOTIFY_CLIENT_ID`, `SPOTIFY_REDIRECT_URI`, and `SPOTIFY_SCOPES`.

## Data Storage

**Databases:**
- Supabase Postgres persists session recaps and ratings via REST calls in `backend/app/services/reflection_service.py`.
- Schema and row-level-security policy definitions are in `backend/supabase_schema.sql`.
- Connection configuration uses `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; server code can also accept a secret key setting but uses the signed-in user’s access token for recap operations.

**File storage:**
- Raw recordings are uploaded transiently to `backend/app/api/sessions.py`; no file-storage provider is implemented.
- Synthesized MP3 bytes are held only in process memory in `backend/app/services/voice_service.py` and cleared after a session.

**Caching:**
- None. In-memory dictionaries hold active session and short-lived audio state.

## Authentication & Identity

- Supabase Auth provides client sessions and Google OAuth in `mobile/src/components/auth-screen.tsx`.
- Native tokens are persisted with `expo-secure-store`; browser sessions use local storage, both configured in `mobile/src/lib/supabase.ts`.
- The FastAPI dependency `backend/app/core/auth.py` verifies incoming Bearer tokens against the Supabase `/auth/v1/user` endpoint.
- User-facing identity uses private Supabase user metadata for the Pragya alias in `mobile/src/lib/profile-alias.ts`.

## Monitoring & Observability

- No error tracking, metrics, tracing, or structured logging integration is detected.
- API errors are translated into FastAPI HTTP errors in `backend/app/services/voice_service.py` and `backend/app/services/gemini_service.py`.

## CI/CD & Deployment

- No CI pipeline, deployment manifest, or production hosting integration is detected.
- Development uses Expo Metro and a local Uvicorn process; commands are documented in `mobile/package.json` and `backend/README.md`.

## Environment Configuration

**Required configuration names:**
- Mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and optionally `EXPO_PUBLIC_API_URL`.
- Server: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `GNANI_API_KEY`, and `GEMINI_API_KEY`.

**Secrets location:**
- Environment files exist by convention but are intentionally not inspected or committed. The source configuration model is `backend/app/core/config.py`.

## Webhooks & Callbacks

- Incoming API callbacks are not implemented.
- OAuth/deep-link callback handling exists in `mobile/src/app/auth/callback.tsx` and `mobile/src/lib/auth-callback.ts`.
- The app scheme is `pragya`, configured in `mobile/app.json`.

---

*Integration audit: 2026-11-07*
