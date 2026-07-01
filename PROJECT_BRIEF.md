# Project Brief - Climbing Training PWA

## Product Goal
Build a simple private coaching dashboard for 10–20 climbing clients. The app helps athletes follow a 6-month or 12-month training plan, log sessions, submit video review links, view resources, and complete weekly check-ins. The app stays lightweight and avoids expensive/server-heavy features.

## Core Value
- Clear training plan
- Simple session logging
- Coach accountability
- Video review workflow
- Progress tracking
- Resources and FAQs

## Tech Stack
- Frontend: Single Page Application (HTML5, Vanilla CSS, JavaScript)
- Deployment: Netlify-ready (static assets)
- Database/Backend (Future): Supabase (Auth + Postgres)
- Mock Layer: Local storage based mock database for local development and offline-first simulation.

## Non-Goals (Out of Scope for MVP)
- Native iOS/Android app wrappers
- In-app video uploads, hosting, compression, or AI analysis
- Custom chat system (uses Telegram links instead)
- Payment gateway or subscription billing (handled manually)
- Community or social feeds

## User Roles
1. **Athlete**: Can log in, see today's session, view calendar, log sessions, submit weekly check-ins, submit video review links, access external resources/FAQs, and open Telegram review chat.
2. **Coach/Admin**: Can view all athletes, see adherence/completion summaries, see pain/fatigue flags, assign program levels, create/edit training plans, view video review requests, and manage resources/FAQs.
