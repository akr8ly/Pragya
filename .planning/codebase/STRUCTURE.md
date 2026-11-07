---
last_mapped_commit: 56a50efa4d38f66b6ae10df3448b44e5638b6580
last_mapped_at: 2026-11-07
---
# Codebase Structure

**Analysis Date:** 2026-11-07

## Directory Layout

```text
D:/Pragya/
├── backend/                 # FastAPI service and database schema
│   ├── app/api/             # HTTP routes
│   ├── app/core/            # configuration and auth boundary
│   ├── app/services/        # conversation, voice, recap and LLM services
│   └── supabase_schema.sql  # persistent recap table and RLS policies
├── mobile/                  # Expo Router React Native client
│   ├── src/app/             # route screens and root tabs
│   ├── src/components/      # shared UI and auth/consent screens
│   ├── src/lib/             # API, auth callback, alias and Supabase clients
│   └── assets/              # app and tab assets
└── README.md                # product and implementation overview
```

## Key File Locations

**Entry points:**
- `backend/app/main.py`: FastAPI application and top-level health/progress/prompt routes.
- `mobile/src/app/_layout.tsx`: Auth gate, consent gate and Expo Router tab navigator.

**Core user flows:**
- `mobile/src/app/index.tsx`: home, greeting, alias, daily prompt and quick links.
- `mobile/src/app/session.tsx`: microphone capture, playback, three-turn cap, feedback and report.
- `mobile/src/app/profile.tsx`: persona and profile presentation.
- `mobile/src/app/progress.tsx`: report and activity surface.

**Shared integrations:**
- `mobile/src/lib/api.ts`: all FastAPI calls.
- `mobile/src/lib/supabase.ts`: Supabase client initialization.
- `backend/app/api/sessions.py`: authenticated session API.

## Naming Conventions

- Expo routes use lowercase filenames in `mobile/src/app/`.
- Shared React components use lowercase hyphenated filenames in `mobile/src/components/`.
- Backend services use snake_case Python modules in `backend/app/services/`.

## Where to Add New Code

- Add a mobile screen as a route in `mobile/src/app/`; keep reusable UI outside that directory.
- Add API calls in `mobile/src/lib/api.ts` and route endpoints in `backend/app/api/`.
- Add provider or business logic in the appropriate `backend/app/services/` module.
- Extend persisted recap/progress data through `backend/supabase_schema.sql` and `backend/app/schemas/sessions.py`.

---

*Structure analysis: 2026-11-07*
