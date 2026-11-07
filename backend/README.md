# Pragya API

## Python environment

Create the virtual environment from the backend directory:

    python -m venv .venv

Activate it in PowerShell:

    .\.venv\Scripts\Activate.ps1

Install dependencies:

    python -m pip install -r requirements.txt

Run the API locally:

    uvicorn app.main:app --reload

The health endpoint is available at http://127.0.0.1:8000/health and interactive API docs at http://127.0.0.1:8000/docs.

## Local configuration

The backend reads `backend/.env`; use [.env.example](.env.example) for variable names only. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for authentication and recap storage. `SUPABASE_SECRET_KEY` is not needed for the current user-scoped flow and must remain server-only. Set `GNANI_API_KEY` once for Prisma STT and Timbre TTS, and `GEMINI_API_KEY` for Gemma responses. The mobile app uses `mobile/.env` for public `EXPO_PUBLIC_` settings. Never put provider or Supabase secret keys in mobile configuration.

Run the SQL in [supabase_schema.sql](supabase_schema.sql) in the Supabase SQL Editor before using recap persistence. Add `pragya://auth/callback` and `http://localhost:8081/auth/callback` to Supabase Auth's allowed redirect URLs.

## Data and runtime behavior

The mobile app signs users in with email magic links and records a first-session data consent choice. FastAPI verifies each Supabase access token. A session accepts at most three completed voice turns. The user submits a 1–5 helpfulness rating before the API generates and saves the daily session report, then marks the session ended. Reports are stored in the `session_recaps` table with Row Level Security; users can load their progress and delete their own saved reports. Session metadata, recent conversation turns, and synthesized reply audio are process-local, scoped to the signed-in user, and cleared when a session ends. They are lost if the backend restarts, so this prototype is not horizontally scalable. Raw recordings and full transcripts are not persisted; audio goes to Gnani for transcription and transcript text goes to Google for Gemma inference.

Voice requests are turn-based and Prisma REST expects supported audio formats. The mobile app sends its native recording format; browser recordings are converted to mono 16 kHz PCM WAV before upload. Spotify playlist creation and OAuth are not implemented yet; the mobile playlist screen is a preview.
