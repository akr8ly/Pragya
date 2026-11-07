---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# Codebase Concerns

**Analysis Date:** 2026-11-07

## Tech Debt

**Process-local active sessions:**
- Files: `backend/app/services/session_service.py`
- Issue: active conversation state is held in the API process.
- Impact: a restart drops an in-progress voice session.
- Fix approach: store minimal active-session state in a server-side database or make session recovery explicit.

**Local-development network assumptions:**
- Files: `mobile/src/lib/api.ts`, `backend/app/main.py`
- Issue: device testing depends on LAN routing or Android port reversal.
- Impact: the app can appear stuck while the phone cannot reach the local API.
- Fix approach: use a deployed API base URL for demos/production and show a fast connectivity error.

## Performance Bottlenecks

**Sequential voice provider chain:**
- Files: `backend/app/services/voice_service.py`, `backend/app/services/gemini_service.py`, `mobile/src/app/session.tsx`
- Problem: STT, model generation and TTS happen sequentially per turn.
- Impact: long perceived wait after recording.
- Improvement path: expose progress stages, set per-provider timeouts, and use production infrastructure geographically closer to users.

## Fragile Areas

**Audio playback and multipart upload:**
- Files: `mobile/src/app/session.tsx`, `mobile/src/lib/api.ts`
- Why fragile: web and native recording formats and fetch/FormData implementations differ.
- Safe modification: validate on a real Android device after any change to `expo-audio`, `expo-file-system`, or upload code.

**Navigation chrome:**
- Files: `mobile/src/app/_layout.tsx`
- Why fragile: Android system navigation inset behavior can overlap custom tab presentation.
- Safe modification: validate on the Samsung development device and use Expo-version-compatible safe-area patterns.

## Missing Critical Features

- Spotify authorization and real playlist creation are not implemented; the current UI is a preview.
- A durable production deployment, monitoring, rate limiting and provider usage controls are not present in the mapped source.
- Automated test coverage is absent.

## Security Considerations

- Auth is verified server-side in `backend/app/core/auth.py`; retain this boundary for every protected endpoint.
- Do not expose provider or Supabase privileged credentials in `mobile/`.
- Review Supabase RLS policies in `backend/supabase_schema.sql` whenever new persisted data is added.

---

*Concerns audit: 2026-11-07*
