# TODO

## Phase 1: Foundation (Completed)
- [x] Create `index.html` structure with mobile-first viewport meta tags and UI wrapper
- [x] Write `index.css` with dark-themed premium design (using Outfit/Inter, CSS Variables, and responsive grids)
- [x] Implement `db.js` with structured seed data for training plans and mock athlete/coach profiles
- [x] Implement local database operations (e.g., save/get profiles, session logs, check-ins, FAQ listings)
- [x] Create mock auth layer in `app.js` with role switcher
- [x] Create responsive navigation layout displaying athlete tabs or admin tabs based on active user role
- [x] Validate mock database initialization and basic tab navigation

## Phase 2: Athlete Core Workflow
- [ ] Athlete "Today" dashboard view: display current session drills and duration
- [ ] Session Logging Form: Capture pain, skin, fatigue, duration, RPE, notes, and external video link
- [ ] Workload calculation (`duration * RPE`) logic and telemetry storage
- [ ] Training Calendar view: Mark completed, skipped, modified session history
