# Roadmap: Pragya

## Overview

This three-day milestone turns the already-working local voice prototype into a coherent, mobile-first demo. The work first locks the core session outcomes, then finishes profile/progress and navigation, and finally adds honest playlist and release-quality polish.

## Phases

- [x] **Phase 1: Voice Session Reliability** - Make the complete three-turn reflection, feedback, and report journey dependable and demoable.
- [ ] **Phase 2: Personal Progress Experience** - Deliver profile, anonymous persona, calendar, history, and mobile navigation polish.
- [ ] **Phase 3: Demo Completion** - Finish playlist experience, safety/privacy presentation, and release readiness.

## Phase Details

### Phase 1: Voice Session Reliability
**Goal**: A signed-in Android user can complete the complete reflection outcome without getting stuck or losing the report.
**Depends on**: Nothing
**Requirements**: VOICE-01, VOICE-02, VOICE-03, RECAP-01, RECAP-02, PROMPT-01
**Success Criteria**:
  1. User can complete three voice turns and sees their remaining turns.
  2. User must submit feedback before the session ends and receives a daily report.
  3. Text response remains available if spoken audio fails and errors are actionable.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Audit and harden the core voice-session state machine and validate the mobile build.

### Phase 2: Personal Progress Experience
**Goal**: Home reliably leads to a polished, private Profile with persona, calendar, saved reports, and correct Android navigation.
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROG-01, UX-01, UX-02
**Success Criteria**:
  1. Profile is reachable from Home and never shows an email-derived name.
  2. Calendar visually reflects the signed-in user’s report activity and exposes report history.
  3. Navigation and tab labels are safe on the target Android device.
**Plans**: TBD

### Phase 3: Demo Completion
**Goal**: The app communicates a compelling playlist concept and has polished safety, loading, empty, and error states.
**Depends on**: Phase 2
**Requirements**: PLAY-01, SAFE-01
**Success Criteria**:
  1. Playlist screen presents mood-aligned preview content without claiming unavailable Spotify actions.
  2. Every primary screen has purposeful loading, empty, and failure states.
  3. Privacy and non-therapy boundaries are clear before and during reflection.
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Voice Session Reliability | 1/1 | Complete | 2026-11-07 |
| 2. Personal Progress Experience | 0/TBD | Not started | - |
| 3. Demo Completion | 0/TBD | Not started | - |
