# Antigravity Handoff Prompt — Climbing Training PWA MVP

Use this prompt inside Antigravity for the first build pass. Attach this markdown file to the project or place it in the project root as `PROJECT_BRIEF.md` so the agent can keep using it as context.

---

## Prompt

You are building a mobile-first PWA MVP for a private climbing training/coaching app.

Before writing code, inspect the existing project structure and create an implementation plan. Do not delete or rewrite unrelated files unless necessary. Preserve existing working behavior. If the project is empty, create the simplest clean structure possible.

## Product Goal

Build a simple private coaching dashboard for 10–20 climbing clients. The app should help athletes follow a 6-month or 12-month training plan, log sessions, submit video review links, view resources, and complete weekly check-ins. The app should stay lightweight and avoid expensive/server-heavy features.

The core value is not community. The core value is:

- clear training plan
- simple session logging
- coach accountability
- video review workflow
- progress tracking
- resources and FAQs

## Core Stack

Use:

- PWA / mobile-first web app
- Netlify-ready frontend
- Supabase-ready architecture for Auth + Postgres
- No native iOS/Android app
- No in-app video uploads
- No image-heavy features
- No custom chat system
- No payment gateway
- Manual access unlock by admin

If Supabase keys are not available yet, build with a local mock data layer first, but structure the app so the data layer can later be swapped with Supabase without rewriting the UI.

## Product Decisions

Confirmed decisions:

1. This is a PWA, not a native app.
2. The app is for a small beginner cohort of around 10–20 clients.
3. Hosting target is Netlify Free.
4. The app should be frontend-heavy.
5. Supabase should be used later for Auth and Postgres.
6. Videos should not be uploaded to the app.
7. Videos should be stored externally, mainly through Google Drive links.
8. Telegram is preferred over Discord because community channels are not important.
9. Telegram is used for quick coach/client communication.
10. Google Drive is used for permanent video storage.
11. Payments are manual outside the app.
12. Access is manually unlocked/expired by admin.
13. Do not delete users or logs when access expires.
14. The app should include tabs for FAQs and resource files/links.

## Non-Goals

Do not build:

- native mobile app
- in-app video upload
- video hosting
- video compression
- AI video analysis
- payment gateway
- subscription billing
- in-app chat
- public community feed
- Discord-style channels
- social features
- heavy image library
- complex automation
- Telegram-to-Google-Drive automation in v1

## User Roles

### Athlete

Athletes can:

- log in
- see today’s assigned session
- view training calendar
- log a session
- mark session complete, skipped, or modified
- submit weekly check-ins
- submit video review requests using external video links
- open their Telegram review chat/link
- view coach feedback summaries
- view resources
- view FAQs

Athletes cannot:

- edit program templates
- view other athletes
- manage access
- see admin dashboard

### Admin / Coach

Admin can:

- view all athletes
- see adherence/completion summaries
- see pain/fatigue red flags
- assign program level and start date
- create/edit training phases, weeks, sessions, and exercises
- manually mark athlete access as active, paused, or expired
- set access expiration date
- view video review requests
- mark review requests as submitted, reviewed, or needs follow-up
- add coach feedback summaries
- manage resource links and FAQ items

## Main Navigation

Use simple tabs/navigation:

Athlete:

1. Today
2. Calendar
3. Log
4. Video Review
5. Resources
6. FAQs
7. Profile / Access

Admin:

1. Athletes
2. Programs
3. Reviews
4. Check-ins
5. Resources
6. FAQs
7. Access

Keep navigation obvious and low-cognitive-load. Do not overdesign.

## Required Features

### 1. Authentication Shell

Build a basic login-ready structure.

If Supabase is unavailable:

- create mock users
- allow switching between Athlete and Admin mode for testing
- clearly isolate auth logic in a service/module

Later Supabase auth should replace this without changing every page.

### 2. Manual Access Control

Each athlete needs:

- status: active / paused / expired
- plan_type: 6_month / 12_month
- start_date
- access_until
- notes

If access is expired, athlete should not lose data. Show a locked/expired state with a message to contact the coach.

### 3. Athlete Dashboard / Today Page

Show:

- current phase
- today’s session
- session objective
- exercises/drills
- duration estimate
- intensity/RPE target
- complete / skip / modify actions
- warning if a pain/fatigue flag exists

### 4. Training Calendar

Show:

- current week
- upcoming sessions
- completed sessions
- skipped sessions
- modified sessions

Keep it simple. Do not build drag-and-drop scheduling yet.

### 5. Session Logging

Athlete can log:

- completed / skipped / modified
- duration_minutes
- RPE 1–10
- fatigue 1–5
- finger pain 0–10
- skin condition 1–5
- notes
- optional video link

Calculate simple workload:

session_workload = duration_minutes × RPE

Store enough data to later calculate weekly workload and adherence.

### 6. Weekly Check-in

Athlete submits once per week:

- energy 1–5
- sleep 1–5
- stress 1–5
- motivation 1–5
- finger pain 0–10
- skin condition 1–5
- what felt good
- what felt bad
- anything coach should know

Admin can view all check-ins by athlete and week.

### 7. Coach Dashboard

Show a table/list:

- athlete name
- current phase
- current week
- access status
- sessions completed this week
- adherence percentage
- last log date
- latest pain score
- red flag indicator
- pending video reviews

Red flag rules:

- finger pain >= 5
- fatigue >= 5
- missed 2+ sessions in a week
- no log for 7 days

### 8. Program Builder

Create editable program structure:

- program
- phase
- week
- session
- exercise/drill

Each session should have:

- title
- phase
- week_number
- day_label
- objective
- session_type: climbing / strength / mobility / rest / testing
- estimated_duration_minutes
- target_intensity
- instructions
- exercise list

Exercise/drill fields:

- name
- category
- sets
- reps_or_duration
- intensity
- rest
- notes

Seed sample data for a simple 6-month climbing program and a 12-month climbing program. The sample data does not need to be scientifically perfect; it only needs to prove the UI and data model.

### 9. Video Review Requests

Do not upload videos to the app.

Athlete can create a review request with:

- video_url
- storage_source: Google Drive / YouTube / Telegram / Other
- climb_grade
- wall_angle
- climb_style
- athlete_question
- status: draft / submitted / reviewed / needs_follow_up
- coach_feedback_summary
- created_at
- reviewed_at

The Video Review page should include clear instructions:

- Upload your video to Google Drive or send it in Telegram.
- Paste the shareable link here.
- Make sure the coach has access to view the file.
- Use short clips when possible.

Also include a configurable Telegram link button:

- “Open Telegram Review Chat”

### 10. Resources Tab

Add a Resources tab for file/link cards.

Categories:

- Nutrition Plan
- Competition Prep
- Warm-up Guide
- Mobility / Prehab
- Recovery
- Training Notes
- Other

Each resource should have:

- title
- category
- description
- external_url
- visibility: all / specific_program / specific_athlete
- created_at

No file uploads needed in v1. External links only.

### 11. FAQs Tab

Add FAQ management.

FAQ fields:

- question
- answer
- category
- visibility
- display_order

Athletes can view FAQs. Admin can create/edit/delete FAQs.

Suggested FAQ categories:

- App Usage
- Training Plan
- Logging
- Video Review
- Pain / Injury Flags
- Scheduling
- Payments / Access

### 12. Analytics / Metrics

Keep analytics simple:

Athlete view:

- weekly completion rate
- total sessions completed
- weekly workload
- current phase progress
- pain trend indicator

Admin view:

- adherence per athlete
- pending reviews
- red flags
- last activity

Do not build advanced ACWR yet unless the basic workload data is already clean.

### 13. Data Model

Create or document tables/interfaces for:

- users/profiles
- athlete_access
- programs
- phases
- weeks
- sessions
- exercises
- assigned_programs
- session_logs
- weekly_checkins
- video_review_requests
- resources
- faqs

Keep IDs and foreign keys clear. If using local mock data first, mirror the future Supabase table names.

### 14. UX Requirements

Design should be:

- mobile-first
- simple
- calm
- private coaching dashboard feel
- fast to use after climbing
- low cognitive load
- not social-media-like
- not visually heavy

Prioritize:

- obvious next action
- fewer choices
- clean forms
- clear labels
- simple status indicators

Avoid:

- decorative dashboards
- random stats
- community feed
- unnecessary animations
- too many cards
- vague labels

## Markdown Files To Create / Update

Create these docs in the project:

1. `PROJECT_BRIEF.md`
   - confirmed decisions
   - product goal
   - non-goals
   - user roles
   - tech stack

2. `FEATURES.md`
   - feature list
   - status: planned / in progress / built / deferred
   - notes and open questions

3. `DATA_MODEL.md`
   - tables/interfaces
   - fields
   - relationships
   - Supabase-ready notes

4. `BUILD_PLAN.md`
   - implementation phases
   - checklist
   - test steps

5. `DECISIONS.md`
   - record major product/architecture decisions
   - explain why decisions were made

6. `TODO.md`
   - small actionable tasks
   - keep updated as work progresses

The agent must keep these docs updated as it builds.

## Build Order

Phase 1:

- project structure
- docs
- mock auth / role switcher
- navigation
- seed mock data

Phase 2:

- athlete dashboard
- today page
- calendar
- session logging

Phase 3:

- weekly check-ins
- video review requests
- Telegram/Google Drive link flow
- resources tab
- FAQ tab

Phase 4:

- admin dashboard
- access management
- review management
- program builder basics

Phase 5:

- Supabase-ready data layer cleanup
- deployment readiness for Netlify
- basic QA

## Testing Requirements

After implementation, verify:

- athlete can view today’s session
- athlete can log a session
- athlete can submit weekly check-in
- athlete can submit video review link
- athlete can open Telegram review link
- athlete can view resources
- athlete can view FAQs
- admin can see all athletes
- admin can see red flags
- admin can manage access status
- admin can add coach feedback summary
- admin can manage resources and FAQs
- expired access locks app without deleting data

## Output Expected From Agent

Before coding:

1. Inspect files.
2. Summarize current structure.
3. Identify gaps.
4. Produce implementation plan.
5. Wait for approval if the change is broad or destructive.

During coding:

1. Make small changes.
2. Preserve working behavior.
3. Update markdown docs.
4. Avoid unrelated rewrites.

After coding:

1. Summarize what changed.
2. List files changed.
3. Explain how to test.
4. List remaining gaps.
5. Update TODO.md.

## Important Constraints

Keep this MVP boring and useful. Do not add community/social features. Do not add video uploads. Do not add automation unless explicitly requested later.

The app should organize training and coaching. Telegram and Google Drive handle communication and media storage.
