---
phase: 1
plan: 1
subsystem: voice-session
tags: [expo, fastapi, voice, cbt, feedback]
status: complete
key-files:
  modified:
    - mobile/src/app/session.tsx
    - mobile/src/app/_layout.tsx
    - backend/app/services/session_service.py
    - backend/app/api/sessions.py
decisions:
  - Feedback and recap generation require exactly three completed spoken turns.
  - Android tab layout reserves the native bottom safe area.
verification:
  - npm run lint
  - npx tsc --noEmit
  - python -m compileall -q app
  - three-turn server gate probe
---

# Phase 1 Plan 01: Voice Session Reliability Summary

The core reflection journey now enforces its three-turn contract on both the mobile client and FastAPI server, preserves text when reply audio fails, and reserves Android safe-area space for the tab bar.

## Completed

- Removed the early feedback control from `mobile/src/app/session.tsx`, so the feedback form appears only after the third completed voice turn.
- Added `ensure_feedback_available` in `backend/app/services/session_service.py` and enforced it from `backend/app/api/sessions.py` before recap generation and session closure.
- Removed a duplicate backend schema import in `backend/app/api/sessions.py`.
- Applied Expo Router safe-area insets to the bottom tab bar in `mobile/src/app/_layout.tsx` to keep controls clear of Android system navigation.

## Verification

- `npm run lint` — passed.
- `npx tsc --noEmit` — passed.
- `python -m compileall -q app` — passed.
- Direct server gate probe — confirmed feedback is available after exactly three recorded turns.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Closed the early-feedback escape hatch**
- The user could open feedback after one completed turn, despite the product rule requiring three turns.
- The client control was removed and the backend now enforces the same rule.

## Commit Status

No commit was created because the repository already has substantial untracked user work. The implementation changes remain safely in the working tree for the user to review and commit as part of the project baseline.

## Self-Check: PASSED

- Modified files exist and mobile/backend verification commands pass.
