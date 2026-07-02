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

## Phase 3: Athlete Utilities & Feedback
- [ ] Weekly Check-in questionnaire (stress, sleep, energy, pain)
- [ ] Video Review request submittal form (external URL, grade, questions)
- [ ] Telegram/Google Drive instructions integration
- [ ] Static list displays for Resources and FAQs
