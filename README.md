# Pragya (प्रज्ञा)

> A voice-first wellbeing companion that helps people reflect through a live conversation, practice a guided CBT exercise, and find a helpful next step.

Pragya is a prototype for people who are curious about therapy, hesitant to begin, unsure how to describe what they are feeling, or looking for a private space to reflect. A user starts one live session and speaks naturally with Pragya. Pragya guides the conversation and CBT reflection, then automatically prepares a session recap and progress insights. The user does not need to write a separate journal entry.

Pragya is a wellbeing and self-reflection tool. It is not a therapist, diagnostic system, medical service, or replacement for professional or emergency care.

## Product goal

Help users understand a concern, notice the thoughts connected to it, consider a more balanced perspective, and choose a small next step. Pragya should make reflection and human support feel more approachable without encouraging dependence on an AI.

## Prototype workflow

1. Onboarding explains Pragya’s role, privacy choices, and the optional Spotify connection.
2. Home shows a daily reflection prompt, a personalized playlist, and a clear Start live session action.
3. The user starts a live voice conversation and shares what is on their mind.
4. Pragya responds conversationally and guides the user through a relevant CBT reflection, such as identifying a thought, considering evidence, and finding a balanced perspective.
5. When the user ends the session, Pragya automatically creates a concise recap, captures the CBT reflection and helpfulness feedback, and suggests one small next step.
6. Pragya recommends a playlist based on the user’s stated mood or session context. If Spotify is connected, the user can create a private playlist and listen in Spotify.
7. Progress reports summarize saved session reflections and CBT feedback over time. A new daily prompt is available on Home; it is optional and does not require a session.

## Core features

### Live voice session

- Voice-first live interaction with clear microphone, listening, speaking, and end-session states.
- Gnani Prisma transcribes user speech; Gnani Evon supports reflection and CBT guidance; Gnani Timbre speaks Pragya’s responses.
- Conversation stays warm, concise, nonjudgmental, and responsive to what the user has shared.
- Guided CBT exercises are part of the conversation, not a separate journaling task.
- The user can end the session at any time and review the generated recap.

### Guided CBT reflection

A prototype exercise can guide the user through:

1. Situation: What happened?
2. Thought: What went through your mind?
3. Evidence: What supports the thought, and what might not support it?
4. Balanced perspective: What is another fair way to view the situation?
5. Next step: What small, practical action feels possible?

The exercise should invite reflection rather than tell users what to think. CBT feedback is captured in the session and recap, with a simple helpfulness rating.

### AI-generated Spotify playlists — main feature

- Recommend a playlist that fits the user’s chosen mood or session context.
- Explain the recommendation in simple, nonclinical language.
- Let the user connect Spotify and create a private playlist when available.
- Open the playlist in Spotify for listening; Pragya does not provide full-track playback.
- Allow the user to rate whether the playlist suited the moment.

For the prototype, Spotify Developer Mode is intended for a small test group. Current Spotify requirements include an owner with Spotify Premium and a maximum of five authenticated users on a Development Mode app. Public access requires Spotify’s Extended Quota review and eligibility. Recheck Spotify’s current requirements before launch:

- https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

Use OAuth Authorization Code with PKCE for the mobile app. Request only the scopes needed to create private playlists. Keep tokens secure and comply with Spotify’s Developer Terms and policy. Do not use Spotify content to train AI models.

### Daily prompts

- Show one short optional prompt on Home to help the user begin reflecting.
- Rotate from a curated prompt library for the prototype; prompts may later be generated and reviewed by the backend.
- A prompt is an invitation, not a required check-in.

### Automatic recap and progress reports

A session recap can contain:

- a short summary of what the user discussed,
- themes explicitly present in the conversation,
- the CBT thought and balanced perspective the user explored,
- user-reported exercise helpfulness,
- one optional next step.

Progress reports can summarize saved recaps, recurring themes, and CBT feedback across selected periods. Describe patterns cautiously and avoid unsupported causal claims. Do not calculate or display a diagnostic or mental-health score.

## Mobile app screens

- Home: daily prompt, featured playlist, Start live session, recent recap, and a compact progress preview.
- Live Session: voice interaction, captions/transcript controls, guided CBT reflection, privacy indicator, and end-session control.
- Session Recap: automatic summary, CBT reflection, helpfulness feedback, suggested next step, and save/delete controls.
- Progress: recent report, recurring themes, CBT exercise reflections, and nonclinical trend descriptions.
- Playlists: featured recommendation, mood/intention choices, recent playlists, and Spotify handoff.
- Settings and Privacy: Spotify connection, prompt and spoken-response preferences, saved recap choices, data review/deletion, and consent.

## Technology stack

### Mobile

- React Native with Expo and TypeScript.
- Expo Router for screen navigation.
- Expo Audio for microphone capture and audio playback.
- Spotify OAuth PKCE for account connection.

### Backend

- Python with FastAPI.
- Async HTTP clients for Gnani and Spotify API calls.
- WebSocket support for live session events if required by the selected Gnani integration.
- Pydantic models to validate API requests and structured AI outputs.
- Provider credentials and server-side secrets stay on the backend.

### Data and identity

- Supabase Auth for user identity.
- Supabase PostgreSQL for user-approved session summaries, CBT feedback, prompts, and playlist metadata.
- Row Level Security (RLS) so users can access only their own records.
- Raw voice recordings are not retained by default. Store only the minimum session data needed for the features, explain it clearly, and provide deletion controls.

## High-level architecture

    Mobile app
      ├── Expo Audio captures speech and plays spoken responses
      ├── Spotify PKCE connects the user's Spotify account
      └── HTTPS / WebSocket connection to FastAPI
              ├── Safety checks and session orchestration
              ├── Gnani Prisma: speech to text
              ├── Gnani Evon: reflection, CBT guidance, recap, themes
              ├── Gnani Timbre: text to speech
              ├── Spotify Web API: private playlist creation
              └── Supabase Auth and PostgreSQL

At session end, the backend validates and stores only the information the user agreed to retain. Progress reports use saved structured summaries and feedback rather than replaying the full raw conversation.

## Backend API outline

- POST /api/sessions — create a session
- POST /api/sessions/{session_id}/turns — process a voice or text turn
- WS /api/sessions/{session_id}/live — optional live session events
- POST /api/sessions/{session_id}/end — generate and save the recap
- GET /api/sessions — list the user's saved recaps
- GET /api/prompts/daily — retrieve today’s prompt
- POST /api/playlists/recommend — recommend a playlist from user-approved context
- POST /api/playlists/spotify — create a private Spotify playlist
- GET /api/progress?period=7d — retrieve a progress report
- DELETE /api/account/data — delete user data

The exact routes and payloads should be finalized during implementation. Validate all AI output before showing or storing it.

## Initial data model

- UserProfile: user ID, preferences, consent version, created timestamp.
- Session: user ID, start/end timestamps, status, retention choice.
- SessionRecap: session ID, concise summary, themes, next step, creation timestamp.
- CBTReflection: session ID, situation, thought, evidence, balanced perspective, helpfulness feedback.
- DailyPrompt: prompt text, active date, source.
- PlaylistRecommendation: session or prompt context reference, description, Spotify playlist ID/URL, user feedback.
- ProgressReport: user ID, period, structured observations, generated timestamp.

Avoid storing raw audio or full transcripts unless the user has explicitly chosen that behavior and the prototype has a clear retention/deletion path.

## Safety and responsible use

- Do not diagnose, prescribe treatment, or claim to be a therapist.
- Do not present progress summaries as clinical assessments.
- Keep safety handling separate from general CBT and playlist recommendations.
- If a conversation suggests immediate danger, pause ordinary coaching and encourage timely human help and verified local emergency support.
- Do not make safety decisions from an automated score alone.
- Use clear consent, minimal data retention, secure transport, access controls, and user data deletion.
- Never expose Gnani, Supabase service-role, or Spotify client secrets in the mobile app.
- Avoid logging raw sensitive conversation text or audio.

## Implementation roadmap

### Phase 1 — App foundation

- Create Expo mobile app and FastAPI backend.
- Establish navigation, theme, configuration, and a responsive mobile shell.
- Add Supabase Auth and protected user data access.

### Phase 2 — Core interaction

- Build Home, live session, and session recap screens.
- Add microphone permission handling, voice capture, captions, and session lifecycle.
- Integrate Gnani Prisma, Evon, and Timbre behind FastAPI.
- Add CBT exercise state and capture helpfulness feedback.

### Phase 3 — Automated reflection

- Generate structured session recaps and themes at session end.
- Add user consent, save/delete controls, and safe data retention.
- Build daily prompt rotation and progress report generation from saved recaps.

### Phase 4 — Spotify playlist feature

- Connect Spotify using PKCE.
- Recommend and create private playlists for allowlisted Development Mode testers.
- Add clear errors and a fallback recommendation view when Spotify is not connected or unavailable.

### Phase 5 — Safety and polish

- Improve safety checks, loading/error states, accessibility, and mobile layouts.
- Verify privacy controls and user data deletion.
- Review Spotify requirements and Gnani API terms before any broader release.

## Suggested repository structure

    Pragya/
    ├── mobile/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── services/
    │   └── assets/
    ├── backend/
    │   ├── app/
    │   │   ├── api/
    │   │   ├── core/
    │   │   ├── models/
    │   │   ├── schemas/
    │   │   └── services/
    │   │       ├── gnani/
    │   │       ├── spotify/
    │   │       ├── cbt/
    │   │       └── reports/
    │   └── pyproject.toml
    ├── docs/
    │   ├── architecture.md
    │   ├── privacy-and-safety.md
    │   └── api.md
    └── README.md

## Prototype success criteria

- A user can start and end a live voice session.
- Pragya can transcribe, respond, and speak using the configured Gnani services.
- A CBT reflection can be completed conversationally, with helpfulness feedback recorded.
- The recap is created automatically, with no separate journal form.
- Home displays a daily prompt and a prominent playlist recommendation.
- An allowlisted Spotify tester can create and open a private playlist.
- A progress report summarizes saved session recaps and CBT feedback without using diagnostic scores.
- Users can understand, control, and delete stored data.

## Project status

Prototype planning. The product flow and initial stack are defined; implementation will proceed incrementally, beginning with the mobile app shell and FastAPI backend.

## Name

Pragya (प्रज्ञा) evokes wisdom, awareness, and discernment. The product helps users understand their own reflections and choose a next step.

## Repository

https://github.com/akr8ly/Pragya
