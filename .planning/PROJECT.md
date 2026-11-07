# Pragya

## What This Is

Pragya is a private, voice-first wellbeing reflection companion for people who want a brief, live conversation rather than a journaling task. It listens, responds naturally in the person’s language or Hinglish, uses gentle CBT-informed reflection, and turns a completed three-turn conversation into an optional daily report.

## Core Value

A person can have a private, fast, natural voice reflection that feels supportive and produces a useful non-clinical recap without making them repeat themselves.

## Requirements

### Validated

- ✓ Google-authenticated mobile access exists through Supabase.
- ✓ A user can complete a three-turn voice session, submit feedback, and receive a recap.

### Active

- [ ] Make the app’s mobile UI reliable, fast, and easy to navigate on the actual Android device.
- [ ] Make the anonymous profile and activity calendar useful, accurate, and reachable from Home.
- [ ] Make daily reports, prompts, and session history understandable and accessible.
- [ ] Turn the current playlist preview into a clear, demo-ready playlist experience.
- [ ] Add practical error, loading, privacy, and safety states for a three-day demo release.

### Out of Scope

- Clinical diagnosis, therapy, prescription, or crisis intervention — Pragya is a wellbeing reflection companion.
- Persistent raw audio or transcript storage — privacy is prioritized over full conversation archiving.
- Public Spotify playlist creation — requires OAuth and platform review beyond this deadline.

## Context

The working product is an Expo 58 / React Native mobile app and FastAPI backend. It uses Supabase for identity and recap storage, Gnani for STT/TTS, and Gemini/Gemma for reasoning. The Android development build and physical-device voice flow have been verified locally; current delivery work must focus on product completeness and mobile polish rather than redoing provider setup.

## Constraints

- **Timeline**: Three days — prioritize demo-ready, observable user flows.
- **Privacy**: Do not read, modify, store, or commit credentials or environment-secret files.
- **Mobile**: Validate UI and audio behavior on Android, not web alone.
- **Safety**: Keep prompts and reports non-diagnostic, supportive, and CBT-informed.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Three spoken turns per session | Gives the conversation shape and protects cost/attention | ✓ Good |
| Feedback gates report generation | Captures usefulness rating and provides a clear session ending | ✓ Good |
| Anonymous generated persona | Avoids extracting/displaying names from email addresses | ✓ Good |
| Hinglish fallback | Keeps spoken replies available when a user’s original language is unsupported by TTS | ✓ Good |

---
*Last updated: 2026-11-07 after GSD brownfield initialization*
