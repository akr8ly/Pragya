# Pragya (प्रज्ञा)

> **A voice-first AI wellbeing and therapy-readiness companion that helps users reflect, recognize emotional patterns, build healthier coping habits, and feel more comfortable seeking human support when needed.**

Pragya is a GenAI-powered mental wellbeing companion designed for people who are curious about therapy, hesitant to start, unsure whether their problems are “serious enough,” or simply want a private place to reflect before speaking to another person.

Pragya is **not a therapist, diagnostic system, medical service, or replacement for professional mental-health care**. Its purpose is to support self-reflection, track self-reported wellbeing over time, recommend small wellness activities, and encourage human support when persistent distress or safety concerns are detected.

---

## Table of Contents

1. [Vision](#vision)
2. [Problem](#problem)
3. [Solution](#solution)
4. [Target Users](#target-users)
5. [Core Product Loop](#core-product-loop)
6. [Consumer Workflow](#consumer-workflow)
7. [Core Features](#core-features)
8. [Gnani AI Integration](#gnani-ai-integration)
9. [Architecture](#architecture)
10. [Conversation Design](#conversation-design)
11. [Memory and Personalization](#memory-and-personalization)
12. [Progress Tracking](#progress-tracking)
13. [Wellbeing Trend Score](#wellbeing-trend-score)
14. [Weekly Reflection Report](#weekly-reflection-report)
15. [Therapy Readiness](#therapy-readiness)
16. [Safety and Escalation](#safety-and-escalation)
17. [Data Model](#data-model)
18. [Suggested API Design](#suggested-api-design)
19. [Frontend Experience](#frontend-experience)
20. [Backend Responsibilities](#backend-responsibilities)
21. [Prompting Strategy](#prompting-strategy)
22. [Token and Audio Optimization](#token-and-audio-optimization)
23. [MVP Scope](#mvp-scope)
24. [Implementation Roadmap](#implementation-roadmap)
25. [Suggested Folder Structure](#suggested-folder-structure)
26. [Example Session](#example-session)
27. [Privacy Principles](#privacy-principles)
28. [Evaluation Metrics](#evaluation-metrics)
29. [Future Scope](#future-scope)
30. [Hackathon Value Proposition](#hackathon-value-proposition)
31. [Responsible Use Notice](#responsible-use-notice)

---

## Vision

The hardest part of seeking mental-health support is often the first step: **opening up**.

Many people hesitate because they wonder:

- Is what I am feeling serious enough for therapy?
- What would I even say to a therapist?
- What if I cannot explain how I feel?
- What if therapy feels uncomfortable?
- Can I first try talking somewhere privately?

Pragya is designed to sit before that first step.

Its goal is to create a gentle bridge between **private self-reflection** and **human professional support**.

The core journey is:

```text
Check in → Speak → Reflect → Try one small action → Track patterns → Review progress → Seek human support when appropriate
```

Pragya does not attempt to imitate clinical therapy. Instead, it helps users become more aware of what they feel, what repeatedly affects them, what coping actions appear useful, and whether their self-reported wellbeing is improving or declining over time.

---

## Problem

People often delay or avoid mental-health support because of:

- stigma around therapy,
- discomfort opening up,
- fear of judgment,
- uncertainty about whether they need help,
- difficulty describing emotions,
- cost or accessibility concerns,
- lack of awareness of their own emotional patterns.

Most conversational AI systems solve only one part of the problem: **chat**.

A generic chatbot may respond to what a user says now, but often does not meaningfully answer:

- How has the user felt across several days?
- Which themes keep returning?
- Which interventions were actually useful?
- Is wellbeing improving or declining?
- Is the person becoming more comfortable discussing difficult topics?
- Is it time to encourage professional support?

Pragya focuses on **longitudinal emotional context**, not isolated chatbot responses.

---

## Solution

Pragya combines:

- short voice-based emotional conversations,
- daily mood check-ins,
- AI-generated reflections,
- context-aware prompts,
- micro wellness activities,
- feel-good music recommendations,
- daily feedback,
- mood and theme trend analysis,
- weekly AI reflection reports,
- therapy-readiness tracking,
- professional-support recommendations,
- safety escalation logic.

The project is designed around Gnani AI:

- **Prisma** for speech-to-text,
- **Evon** for reasoning, contextual understanding, theme extraction, recommendations and reporting,
- **Timbre** for text-to-speech.

---

## Target Users

Pragya is intended for:

- students experiencing academic, placement or social stress,
- young professionals dealing with burnout or uncertainty,
- people who are skeptical or hesitant about therapy,
- users who find it difficult to put emotions into words,
- people looking for structured emotional self-reflection,
- users who want to understand their patterns before seeking human support.

---

## Core Product Loop

```text
Mood
  ↓
Voice
  ↓
Reflection
  ↓
Small Action
  ↓
Feedback
  ↓
Progress
  ↓
Human Support When Needed
```

The product should feel like a series of manageable moments, not a clinical questionnaire.

---

## Consumer Workflow

### 1. Daily check-in

The user selects an emotional state such as:

- Great
- Good
- Okay
- Low
- Overwhelmed

They can optionally provide an intensity rating from 1 to 10 and answer:

> What has been taking up most of your headspace today?

### 2. Voice reflection

The user records a short reflection of up to approximately **30 seconds**.

### 3. Speech-to-text

Gnani **Prisma** transcribes the audio.

### 4. Safety screening

The transcript passes through the application's safety layer before normal conversation processing.

### 5. Context building

The backend adds only the most useful context:

- recent mood,
- recent intensity,
- recurring themes,
- latest session summary,
- recent trend,
- activities that helped or did not help.

### 6. AI reasoning

Gnani **Evon** generates a concise reflection, insight, follow-up question, or activity recommendation.

### 7. Voice response

Gnani **Timbre** converts the response into speech.

### 8. Micro-action

At the end of a conversation, Pragya can suggest one small action such as:

- a two-minute breathing exercise,
- a reflection prompt,
- a short walk,
- music,
- grounding,
- reaching out to someone trusted.

### 9. Feedback

The user rates whether the activity helped.

### 10. Progress update

Mood, themes, helpfulness and daily feedback are aggregated into progress data.

### 11. Weekly report

Evon converts the week's structured data into an understandable reflection report.

### 12. Human-support recommendation

If low self-reported wellbeing persists or the user's trend worsens, Pragya can gently suggest speaking with a qualified professional.

---

## Core Features

### Daily Mood Check-In

Stored fields may include:

```text
emotion
intensity
dayRating
context
timestamp
```

Self-reported emotional data should take priority over AI-inferred labels.

### Voice Conversations

The 30-second input limit is treated as a product design choice rather than a weakness.

```text
User voice ≤ 30 sec
        ↓
AI response
        ↓
User voice ≤ 30 sec
        ↓
AI response
```

This creates low-pressure, turn-based conversations.

### Prompt of the Day

Examples:

- What drained most of your energy today?
- What went slightly better than expected?
- What are you avoiding thinking about?
- What do you wish someone understood about your day?
- What was actually under your control today?

### Micro-Activities

Categories can include:

- breathing,
- journaling,
- grounding,
- reframing,
- stretching,
- short walks,
- music,
- digital breaks,
- sleep wind-down,
- social connection.

Example:

> Write down the outcome you are worried about and one part of tomorrow that you can actually control.

### Feel-Good Music

Music recommendations are organized by intent:

```text
Need calm
Need energy
Need focus
Need comfort
Need sleep
```

Users can rate whether the recommendation helped. Over time, Pragya can learn simple preference patterns such as:

```text
anxious + evening + acoustic → often helpful
low energy + morning + upbeat → often helpful
```

### Daily Feedback

A lightweight evening flow can ask:

- Overall day rating: 1-10
- What helped most today?
- Is there anything you want tomorrow's conversation to remember?

---

## Gnani AI Integration

### Prisma: Speech-to-Text

Responsibilities:

- receive short audio,
- transcribe spoken content,
- return normalized text,
- feed the transcript into the safety and reasoning pipeline.

```text
Microphone → Audio → Prisma → Transcript
```

### Evon: Reasoning Layer

Evon can be used for:

- reflective responses,
- follow-up questions,
- theme extraction,
- session summaries,
- activity selection,
- daily prompt generation,
- weekly report generation,
- structured insight generation.

Evon should receive **compressed context**, not unlimited raw history.

### Timbre: Text-to-Speech

```text
Evon response → Timbre → Audio response → User
```

Voice responses should remain concise to reduce latency and improve conversational flow.

---

## Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
              Text input                    Voice input
                                                 │
                                          ┌──────▼──────┐
                                          │   Prisma    │
                                          │ Speech→Text │
                                          └──────┬──────┘
                                                 │
                                   ┌─────────────▼─────────────┐
                                   │       Safety Layer        │
                                   └─────────────┬─────────────┘
                                                 │
                                   ┌─────────────▼─────────────┐
                                   │      Context Builder      │
                                   ├───────────────────────────┤
                                   │ Recent mood               │
                                   │ Reflection memory         │
                                   │ Recurring themes          │
                                   │ Activity feedback         │
                                   │ Recent trend              │
                                   └─────────────┬─────────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │    Evon     │
                                          │  Reasoning  │
                                          └──────┬──────┘
                                                 │
                        ┌────────────────────────┼───────────────────────┐
                        │                        │                       │
                   Reflection                 Insight                Activity
                        │
                   ┌────▼────┐
                   │ Timbre  │
                   │Text→Voice│
                   └────┬────┘
                        │
                  Spoken response
```

Progress/reporting pipeline:

```text
Mood logs
Conversation summaries
Daily feedback
Activity ratings
Therapy-readiness answers
        │
        ▼
Weekly aggregation
        │
        ▼
Structured summary
        │
        ▼
Evon
        │
        ▼
Weekly Reflection Report
```

---

## Conversation Design

A useful Pragya response should typically follow:

```text
ACKNOWLEDGE → REFLECT → ASK OR ACT
```

Example:

**User:**
> I cannot stop thinking about whether I will get placed this year.

**Pragya:**
> That worry seems to stay active even when you are not preparing. Is the bigger fear about the interview itself, or about what it would mean if things do not go as planned?

Pragya should avoid:

- diagnosis,
- fake certainty,
- impersonating a therapist,
- generic motivational filler,
- emotional dependency language,
- unsafe medical advice.

---

## Memory and Personalization

Pragya should keep a compact **User Reflection Memory** rather than sending all previous chats to Evon.

Example:

```json
{
  "recentMood": "anxious",
  "recentIntensity": 7,
  "recurringThemes": [
    "placement anxiety",
    "sleep",
    "self-confidence"
  ],
  "helpfulActivities": [
    "music",
    "short walks"
  ],
  "unhelpfulActivities": [
    "long journaling"
  ],
  "recentTrend": "slightly improving",
  "lastSessionSummary": "User discussed upcoming interviews and fear of underperforming."
}
```

Benefits:

- lower token use,
- faster inference,
- stronger personalization,
- less repeated sensitive context,
- easier privacy controls.

---

## Progress Tracking

The progress page should answer:

- How have I felt this week?
- Which feelings appeared most often?
- What topics keep returning?
- What helped?
- What did not help?
- Am I feeling better, worse or roughly the same?
- Am I becoming more comfortable opening up?

Suggested cards:

- 7-day mood trend
- 30-day mood trend
- most common feeling
- recurring theme
- check-in count
- helpful activities
- therapy-readiness trend
- AI-generated observation

Example observation:

> Your mood dipped in the middle of the week and improved over the weekend. Career-related stress appeared repeatedly, while music and short breaks were commonly associated with better later check-ins.

The system must describe correlation carefully and avoid claiming causation.

---

## Wellbeing Trend Score

Pragya may calculate a **Wellbeing Trend Score** as a simple, non-clinical summary of self-reported progress.

A prototype weighting could be:

```text
Daily self-reported mood average        35%
Recent mood trend                       25%
Self-reported coping/day feedback       20%
Reflection engagement                   10%
Activity helpfulness                    10%
```

Example:

```text
72 / 100
Stable
```

The interface should emphasize descriptive trends rather than the number itself.

Preferred:

> Your self-reported wellbeing has been relatively stable this week, with a small improvement over the last three days.

Avoid:

> Your mental health is 72% healthy.

---

## Weekly Reflection Report

Every seven days, structured data can be summarized by Evon.

Inputs:

- mood logs,
- daily feedback,
- session summaries,
- recurring themes,
- completed activities,
- helpfulness ratings,
- therapy-readiness responses.

Example:

### Emotional trend
Your mood varied early in the week but improved during the weekend.

### Common themes
- career uncertainty
- sleep
- self-confidence

### Things that appeared helpful
- music
- talking through worries
- short breaks

### Something worth noticing
Career-related concerns appeared in four of six check-ins.

### Small goal for next week
Try a short evening reflection on three days and compare how you feel afterward.

The model must be instructed to use only supplied data and not invent events.

---

## Therapy Readiness

This is one of Pragya's defining features.

Questions may include:

> Are you feeling more comfortable talking about difficult things?

```text
Not really
A little
Yes
```

And:

> Would talking to a real person about these things feel easier now than when you started?

Possible internal representation:

```json
{
  "comfortOpeningUp": 3,
  "willingnessForHumanSupport": 2,
  "timestamp": "2026-10-31T00:00:00Z"
}
```

Dashboard example:

```text
Day 1 → Hesitant
Day 4 → Somewhat open
Day 9 → More comfortable
```

The goal is not to force therapy. It is to reduce uncertainty and make human support more approachable.

---

## Safety and Escalation

Safety is separate from normal wellbeing scoring.

### Persistent Distress

If the application observes repeated low self-reported wellbeing, a declining trend, repeated difficult themes or consistently ineffective coping attempts across time, it can suggest professional support.

Example:

> Things seem to have felt consistently difficult lately. Pragya can help you reflect, but a qualified mental-health professional may be able to give you more personalized support. If you are comfortable, consider speaking with one or reaching out to someone you trust.

This should not be triggered by a single bad day.

### Immediate Safety Escalation

Potential indicators of immediate self-harm, suicide, violence, abuse or imminent danger should bypass normal conversation flow.

The system should:

1. stop normal wellness coaching,
2. respond clearly and calmly,
3. encourage immediate human support,
4. provide verified current emergency/crisis resources where appropriate,
5. avoid leaving the user with only an AI conversation,
6. avoid treating a numeric wellbeing score as the basis for emergency action.

Emergency contact information must be verified before deployment and should not be copied blindly from another project.

---

## Data Model

### User

```text
id
name/displayName
email
createdAt
preferences
consentVersion
```

### MoodEntry

```text
id
userId
emotion
intensity
dayRating
context
createdAt
```

### ConversationSession

```text
id
userId
startedAt
endedAt
sessionSummary
primaryThemes
riskFlag
```

### ConversationTurn

```text
id
sessionId
role
text
inputType
createdAt
```

### ReflectionMemory

```text
id
userId
recentMood
recentIntensity
recurringThemes
helpfulActivities
unhelpfulActivities
recentTrend
lastSessionSummary
updatedAt
```

### Activity

```text
id
title
category
description
duration
instructions
```

### ActivityCompletion

```text
id
userId
activityId
completed
helpfulness
notes
createdAt
```

### DailyFeedback

```text
id
userId
dayRating
helpedMost
memoryNote
createdAt
```

### MusicFeedback

```text
id
userId
recommendationId
intent
helpfulness
createdAt
```

### TherapyReadinessEntry

```text
id
userId
comfortOpeningUp
willingnessForHumanSupport
createdAt
```

### WeeklyReport

```text
id
userId
periodStart
periodEnd
structuredMetrics
reportText
createdAt
```

### SafetyEvent

```text
id
userId
sessionId
riskLevel
triggerType
actionTaken
createdAt
```

---

## Suggested API Design

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/profile

POST   /api/mood
GET    /api/mood/recent
GET    /api/mood/trends

POST   /api/conversation/start
POST   /api/conversation/:id/message
POST   /api/conversation/:id/voice
POST   /api/conversation/:id/end

GET    /api/prompts/daily

GET    /api/activities/recommendation
POST   /api/activities/:id/complete

GET    /api/music/recommendation
POST   /api/music/feedback

POST   /api/feedback/daily
GET    /api/progress/weekly
GET    /api/progress/monthly

POST   /api/readiness
GET    /api/readiness/trend

GET    /api/reports/weekly
POST   /api/reports/generate
```

---

## Frontend Experience

Suggested screens:

### Landing
- clear definition of Pragya
- responsible-use notice
- privacy expectations
- voice-first concept

### Home
- greeting
- today's mood check-in
- Talk to Pragya button
- prompt of the day
- current trend
- suggested activity

### Voice Session
- microphone button
- recording timer
- 30-second limit indicator
- transcript
- AI reflection
- voice playback

### Progress
- mood chart
- emotional distribution
- recurring themes
- activity helpfulness
- weekly insight
- therapy-readiness trend

### Activities
- breathing
- grounding
- reflection
- movement
- music
- sleep-oriented activities

### Weekly Report
- emotional trend
- recurring themes
- what helped
- what to notice
- next week's small goal

### Support
- explanation of professional support
- trusted-person suggestion
- verified crisis resources where appropriate

---

## Backend Responsibilities

The backend should handle:

- authentication,
- persistence,
- Prisma/Evon/Timbre API communication,
- audio upload handling,
- context building,
- prompt assembly,
- structured model-output validation,
- safety screening,
- conversation summarization,
- memory compression,
- progress aggregation,
- trend calculation,
- weekly report generation,
- rate limiting,
- safe logging,
- deletion and privacy controls.

Provider credentials must remain server-side and must never be exposed in the frontend.

---

## Prompting Strategy

Use separate prompts for separate jobs.

### Conversation Prompt

Goal:
- acknowledge,
- reflect,
- remain concise,
- ask one useful follow-up,
- avoid diagnosis.

### Theme Extraction Prompt

Example structured output:

```json
{
  "themes": ["career", "sleep"],
  "emotion": "anxious",
  "summary": "User is worried about upcoming interviews and feels underprepared."
}
```

### Activity Selection Prompt

Inputs:
- mood,
- intensity,
- theme,
- time,
- previous helpfulness.

Possible output:

```json
{
  "activityCategory": "reflection",
  "reason": "User is repeatedly focusing on uncertain outcomes.",
  "activityId": "control-circle-01"
}
```

### Weekly Report Prompt

The model should be instructed to:

- use only supplied metrics,
- not diagnose,
- not invent missing events,
- distinguish observations from conclusions,
- use compassionate but neutral language.

---

## Token and Audio Optimization

The hackathon constraints make efficiency important.

### Short voice turns
Keep user audio within the allowed limit.

### Memory compression
Send:

```text
system instructions
+ compact reflection memory
+ last few turns
+ today's mood
+ current message
```

instead of complete history.

### Structured session summaries
After each session, store a short summary such as:

```json
{
  "summary": "User discussed interview anxiety and fear of being unprepared.",
  "themes": ["career", "self-confidence"],
  "mood": "anxious",
  "suggestedActivity": "control-circle-01"
}
```

### Generate reports only when needed
Generate a weekly report once and store it rather than regenerating it on every dashboard load.

### Keep TTS concise
Short spoken replies are cheaper, faster and more natural.

---

## MVP Scope

Recommended hackathon MVP:

1. onboarding and responsible-use notice,
2. daily mood check-in,
3. 30-second voice recording,
4. Prisma speech-to-text,
5. Evon reflective response generation,
6. Timbre voice playback,
7. short-term conversation history,
8. compressed user reflection memory,
9. daily prompt,
10. micro-activity recommendation,
11. activity helpfulness feedback,
12. simple music recommendation category,
13. evening feedback,
14. 7-day mood trend,
15. recurring-theme extraction,
16. weekly reflection report,
17. therapy-readiness check-in,
18. persistent-distress support suggestion,
19. safety escalation layer.

Excluded from the first MVP:

- social community,
- public profiles,
- gamified leaderboards,
- therapist marketplace,
- complex appointment booking,
- diagnostic claims,
- large social feeds.

---

## Implementation Roadmap

### Phase 1: Foundation
- initialize frontend/backend
- database connection
- user and mood models
- dashboard
- mood check-in

### Phase 2: Gnani Voice Pipeline
- microphone recording
- duration enforcement
- audio upload
- Prisma integration
- transcript processing
- Evon integration
- Timbre integration

### Phase 3: Conversation Intelligence
- session/turn storage
- session summaries
- theme extraction
- compact reflection memory
- context injection

### Phase 4: Wellness Actions
- activity library
- recommendation logic
- completion/helpfulness tracking
- prompt of the day
- music-intent recommendations

### Phase 5: Progress Dashboard
- mood aggregation
- trend calculation
- weekly chart
- recurring themes
- helpful activities
- non-clinical wellbeing trend score

### Phase 6: Weekly Intelligence
- seven-day aggregation
- weekly report generation
- therapy-readiness check-in
- readiness trend

### Phase 7: Safety and Polish
- deterministic risk checks
- model-assisted classification where appropriate
- escalation UI
- verified support resources
- loading/error states
- responsive UI
- API credit testing

---

## Suggested Folder Structure

```text
Pragya/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MoodCheckIn/
│   │   │   ├── VoiceRecorder/
│   │   │   ├── ConversationCard/
│   │   │   ├── ActivityCard/
│   │   │   ├── ProgressChart/
│   │   │   ├── WeeklyReport/
│   │   │   └── SafetyNotice/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Session/
│   │   │   ├── Progress/
│   │   │   ├── Activities/
│   │   │   └── Support/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   │   ├── gnani/
│   │   │   ├── prismaService.*
│   │   │   ├── evonService.*
│   │   │   └── timbreService.*
│   │   ├── conversationService.*
│   │   ├── memoryService.*
│   │   ├── safetyService.*
│   │   ├── insightService.*
│   │   └── reportService.*
│   ├── prompts/
│   │   ├── conversation.*
│   │   ├── summary.*
│   │   ├── activity.*
│   │   └── weeklyReport.*
│   ├── utils/
│   └── server.*
│
├── docs/
│   ├── architecture.md
│   ├── safety.md
│   └── api.md
│
├── .gitignore
└── README.md
```

---

## Example Session

### Check-in

User selects:

```text
Anxious
Intensity: 7/10
```

### Voice reflection

> I have a placement interview next week and I keep thinking everyone else is better prepared than me.

### Prisma

Converts speech to text.

### Context

```text
Recent mood: anxious
Recent intensity: 7
Recurring themes: placements, confidence
Recent trend: stable
Previously helpful: short walks, music
```

### Evon

> It sounds like comparison with other people is increasing the pressure more than the interview alone. Would it help more to talk about what you feel unprepared for, or separate what you can control from what you cannot?

### Timbre

Converts the response into speech.

### Suggested action

> Write two lists: what you can control before the interview and what you cannot. Spend your next preparation block only on the first list.

### Feedback

```text
Yes
A little
Not really
```

### Longitudinal insight

> Placement-related worry appeared in four recent check-ins. Your mood was usually better on days when you took a short break after preparation.

That longitudinal layer is the heart of Pragya.

---

## Privacy Principles

Mental-wellbeing data is sensitive. Pragya should follow privacy-by-design principles:

- collect only what is needed,
- clearly explain what is stored,
- keep API credentials server-side,
- avoid logging raw sensitive conversations unnecessarily,
- encrypt data in transit,
- use secure authentication,
- allow user data deletion,
- separate analytics from identifying data where possible,
- use compact summaries instead of unlimited raw history when practical,
- define retention policies,
- require consent before storing especially sensitive information.

A production deployment would require deeper privacy, legal, security and compliance review.

---

## Evaluation Metrics

### Product
- daily check-in completion
- reflection session completion
- activity helpfulness
- weekly report engagement
- therapy-readiness change
- user-reported usefulness

### Technical
- STT latency
- reasoning latency
- TTS latency
- round-trip conversation latency
- token use per session
- average turns per session
- transcription quality
- structured-output validation success
- API failure recovery

### Safety
- false-positive escalation rate
- false-negative rate on controlled safety tests
- safety-response quality
- unsafe diagnostic claim rate

Safety evaluation is a first-class requirement.

---

## Future Scope

Potential future extensions:

- multilingual Indian-language conversations,
- personalized activity ranking,
- embedding-based reflection memory,
- user-controlled memory inspection/deletion,
- opt-in therapist handoff summary,
- calendar-aware reflection planning,
- optional wearable integration,
- privacy-preserving aggregate institution insights.

Any therapist handoff must be explicitly user-controlled.

---

## Hackathon Value Proposition

Pragya demonstrates all three Gnani AI components as one coherent product instead of three disconnected API demos.

### Prisma
Makes reflection natural through speech.

### Evon
Turns transcripts and historical context into useful reflections, summaries, patterns and recommendations.

### Timbre
Closes the loop with a spoken conversational response.

Together:

```text
Voice
  ↓
Understanding
  ↓
Reasoning
  ↓
Personalized reflection
  ↓
Voice
```

The project also demonstrates:

- memory,
- token efficiency,
- short-form voice UX,
- longitudinal analytics,
- personalized recommendations,
- responsible mental-health design,
- escalation toward human support.

The intended outcome is not to make users talk to an AI forever. It is to help someone understand themselves a little better and make the next healthy step feel easier.

---

## Responsible Use Notice

Pragya is an experimental wellbeing and self-reflection application.

It does **not**:

- diagnose mental-health conditions,
- provide medical or psychiatric treatment,
- replace licensed therapists, psychologists, psychiatrists, doctors or emergency services,
- guarantee that AI-generated reflections are correct,
- determine a person's mental health from a numerical score.

If a user is in immediate danger or at risk of harming themselves or someone else, they should contact local emergency services, a verified crisis service, or a trusted person who can provide immediate human assistance.

Any crisis resources included in a deployed version must be current, verified and appropriate for the user's location.

---

## Project Status

🚧 **Hackathon prototype / active development**

The architecture and feature set described here represent the intended implementation. Individual modules may evolve as the prototype is built and tested.

---

## Name

**Pragya (प्रज्ञा)** evokes wisdom, awareness, discernment and deeper understanding, aligning with the project's goal of helping users understand their own emotional patterns before deciding what support they need.

---

## Repository

https://github.com/akr8ly/Pragya
