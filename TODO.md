# TODO

## Phase 1: Foundation (Completed)
- [x] Create `index.html` structure with mobile-first viewport meta tags and UI wrapper
- [x] Write `index.css` with dark-themed premium design (using Outfit/Inter, CSS Variables, and responsive grids)
- [x] Implement `db.js` with structured seed data for training plans and mock athlete/coach profiles
- [x] Implement local database operations (e.g., save/get profiles, session logs, check-ins, FAQ listings)
- [x] Create mock auth layer in `app.js` with role switcher
- [x] Create responsive navigation layout displaying athlete tabs or admin tabs based on active user role
- [x] Validate mock database initialization and basic tab navigation

## Phase 2: Athlete Core Workflow (Completed)
- [x] Athlete "Today" dashboard view: display current session drills and duration
- [x] Session Logging Form: Capture pain, skin, fatigue, duration, RPE, notes, and external video link
- [x] Workload calculation (`duration * RPE`) logic and telemetry storage
- [x] Training Calendar view: Mark completed, skipped, modified session history

## Phase 3: Athlete Utilities & Feedback (Completed)
- [x] Weekly Check-in questionnaire (stress, sleep, energy, pain)
- [x] Video Review request submittal form (external URL, grade, questions)
- [x] Telegram/Google Drive instructions integration
- [x] Static list displays for Resources and FAQs

## Phase 4: Coach Portal
- [ ] Coach Dashboard view: Athlete progress summary grid
- [ ] Red flag indicators (pain >= 5, fatigue >= 5, missed 2+ sessions, inactivity)
- [ ] Active client list & manual Access Control editor (status, expiration date)
- [ ] Review Queue page: coach feedback summaries and status updates
- [ ] Basic FAQ/Resource CRUD for admins
