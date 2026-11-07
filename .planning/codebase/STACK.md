---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# Technology Stack

**Analysis Date:** 2026-11-07

## Languages

**Primary:**
- TypeScript — Expo mobile client in `mobile/src/`.
- Python — FastAPI service in `backend/app/`.

**Secondary:**
- SQL — Supabase schema in `backend/supabase_schema.sql`.
- JavaScript — Expo and ESLint configuration in `mobile/`.

## Runtime

**Environment:**
- Node.js with npm and the committed `mobile/package-lock.json` for the Expo app.
- Python with Uvicorn for the FastAPI API, declared in `backend/requirements.txt`.

**Package Manager:**
- npm for `mobile/package.json`.
- pip-compatible requirements file for `backend/requirements.txt`.

## Frameworks

**Core:**
- Expo SDK 58 with Expo Router in `mobile/package.json`; route screens live in `mobile/src/app/`.
- React 19.3 and React Native 0.88 for the mobile interface.
- FastAPI 0.115+ with Pydantic Settings in `backend/app/main.py` and `backend/app/core/config.py`.

**Build and development:**
- Expo development client and `expo run:android` scripts in `mobile/package.json`.
- Uvicorn runs the API module at `backend/app/main.py`.
- TypeScript configuration is in `mobile/tsconfig.json`; linting uses Expo ESLint via `mobile/eslint.config.js`.

## Key Dependencies

**Mobile:**
- `expo-audio` records and plays session audio in the native app.
- `expo-file-system` supplies Blob-compatible `File` uploads in `mobile/src/lib/api.ts`.
- `expo-secure-store` persists the native Supabase auth session in `mobile/src/lib/supabase.ts`.
- `@supabase/supabase-js` manages authentication and user metadata.
- `expo-web-browser`, `expo-linking`, and `expo-router` support OAuth and deep-link callback routing.

**Backend:**
- `httpx` calls speech, model, authentication, and database REST APIs.
- `python-multipart` accepts uploaded recording parts in `backend/app/api/sessions.py`.
- Pydantic request and response schemas are defined in `backend/app/schemas/sessions.py`.

## Configuration

- Server configuration is typed in `backend/app/core/config.py`; it loads environment configuration without storing secrets in source.
- Mobile public configuration is read by `mobile/src/lib/supabase.ts` and `mobile/src/lib/api.ts` through Expo public environment configuration.
- Android package metadata and required Expo plugins are defined in `mobile/app.json`.
- Native Android source and Gradle configuration are generated/maintained in `mobile/android/` for development-client builds.

## Platform Requirements

- Development requires Node/npm, Python, an Android SDK for native device builds, and configured external service accounts.
- Production currently has no committed deployment or CI configuration; the app expects a reachable FastAPI instance and Supabase project.

---

*Stack analysis: 2026-11-07*
