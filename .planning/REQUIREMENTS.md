# Requirements: Pragya

**Defined:** 2026-11-07
**Core Value:** A person can have a private, fast, natural voice reflection that produces a useful non-clinical recap.

## v1 Requirements

### Voice Reflection

- [ ] **VOICE-01**: User can start, complete, and hear or read a three-turn voice reflection on Android.
- [ ] **VOICE-02**: User receives a clear, recoverable error when recording, providers, or audio playback fail.
- [ ] **VOICE-03**: Pragya responds in the user’s language when available, otherwise natural Hinglish.

### Session Outcome

- [ ] **RECAP-01**: After the third spoken turn, user submits a 1–5 helpfulness rating before the session ends.
- [ ] **RECAP-02**: Submitted feedback generates and displays a non-clinical CBT-informed daily report.
- [ ] **PROMPT-01**: Home shows a daily prompt and can route a user into a live session.

### Profile and Progress

- [ ] **PROF-01**: User has an anonymous persona that is not derived from or exposed as their email identity.
- [ ] **PROF-02**: User can open Profile from Home and view persona, saved recaps, and a GitHub-style activity calendar.
- [ ] **PROG-01**: Activity calendar and progress summary are based on the authenticated user’s saved recaps.

### Product Experience

- [ ] **UX-01**: Android tabs and screen navigation remain visible above system navigation controls.
- [ ] **UX-02**: Home greeting updates from the device’s current time.
- [ ] **PLAY-01**: User can explore a mood-based AI playlist preview with an honest prototype state.
- [ ] **SAFE-01**: App makes the non-therapy boundary, privacy choice, and safe error states clear.

## v2 Requirements

- **PLAY-02**: User can connect Spotify and create a private playlist in their own account.
- **VOICE-04**: User can hold a streaming, interruption-aware live voice conversation.
- **NOTF-01**: User can opt into device-native daily prompts.

## Out of Scope

| Feature | Reason |
|---|---|
| Diagnosis or therapy claims | Unsafe and contrary to product boundary |
| Persistent raw recordings/transcripts | Not needed for the core reflection and raises privacy risk |
| Public Spotify launch integration | OAuth review and quota work exceeds the three-day deadline |

## Traceability

| Requirement | Phase | Status |
|---|---:|---|
| VOICE-01 | Phase 1 | In Progress |
| VOICE-02 | Phase 1 | In Progress |
| VOICE-03 | Phase 1 | In Progress |
| RECAP-01 | Phase 1 | In Progress |
| RECAP-02 | Phase 1 | In Progress |
| PROMPT-01 | Phase 1 | In Progress |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROG-01 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| PLAY-01 | Phase 3 | Pending |
| SAFE-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-07*
*Last updated: 2026-11-07 after GSD brownfield initialization*
