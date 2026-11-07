---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# Coding Conventions

**Analysis Date:** 2026-11-07

## Naming Patterns

- React screen and component functions are PascalCase, for example `HomeScreen` in `mobile/src/app/index.tsx`.
- TypeScript helpers are camelCase, for example `getDailyPrompt` in `mobile/src/lib/api.ts`.
- Python functions and modules are snake_case, for example `generate_recap` in `backend/app/services/gemini_service.py`.
- API response shapes are explicit Pydantic models in `backend/app/schemas/sessions.py`.

## Code Style

- The mobile app uses TypeScript, React hooks and `StyleSheet.create` style objects.
- Mobile linting is configured through `mobile/eslint.config.js` and runs via `npm run lint`.
- Backend imports are grouped standard library, external dependencies, then local `app` imports.

## Error Handling

- Use user-safe messages in mobile catch blocks; do not expose provider payloads.
- Raise `HTTPException` in the backend services/routes with a meaningful status code.
- Preserve the existing session UI fallback: text remains visible when TTS playback cannot load.

## Data and Safety Rules

- Keep credentials only in environment configuration; never add secret values to source, docs or client code.
- Treat raw spoken content as sensitive: do not add transcript persistence without an explicit privacy and retention decision.
- Keep wellbeing output non-diagnostic and constrained by the system prompt in `backend/app/services/gemini_service.py`.

## Module Design

- Put routing in `backend/app/api/`; keep provider calls and business logic in `backend/app/services/`.
- Put shared API/auth helpers in `mobile/src/lib/`, not in route screens.
- Use Expo Router `Link` for declarative navigation in mobile screens.

---

*Convention analysis: 2026-11-07*
