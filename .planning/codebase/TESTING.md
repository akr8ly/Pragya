---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# Testing Patterns

**Analysis Date:** 2026-11-07

## Current Test Framework

**Mobile:**
- Linting is present through Expo ESLint in `mobile/eslint.config.js`.
- Run `npm run lint` from `mobile/`.
- TypeScript is present in `mobile/tsconfig.json`; run `npx tsc --noEmit` before shipping UI work.

**Backend:**
- FastAPI and Pydantic dependencies are declared in `backend/requirements.txt`.
- No automated Python test suite or test runner configuration was detected in the project source map.

## Current Verification Pattern

- Verify mobile UI on Android development builds because recording, native multipart upload and audio playback differ from web.
- Verify FastAPI locally through `GET /health` and authenticated session endpoints.
- Verify the full product flow: sign in, create a session, record up to three turns, submit rating, review generated recap and profile activity.

## Recommended Test Additions

- Add API tests for authentication errors, three-turn enforcement, feedback validation and recap persistence.
- Add unit tests for `mobile/src/lib/api.ts` error mapping and alias generation in `mobile/src/lib/profile-alias.ts`.
- Add a regression test for Expo native `File` multipart upload used by `sendVoiceTurn`.

## Test Data Rules

- Use synthetic reflection text and test audio only.
- Never commit recordings, tokens, Supabase keys, or provider credentials.

---

*Testing analysis: 2026-11-07*
