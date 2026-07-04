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

## Phase 4: Coach Portal (Completed)
- [x] Coach Dashboard view: Athlete progress summary grid
- [x] Red flag indicators (pain >= 5, fatigue >= 5, missed 2+ sessions, inactivity)
- [x] Active client list & manual Access Control editor (status, expiration date)
- [x] Review Queue page: coach feedback summaries and status updates
- [x] Basic FAQ/Resource CRUD for admins

## Phase 5: Production Readiness & PWA (Completed)
- [x] Clean up structure and prepare for Vercel deployment
- [x] Service worker and manifest configurations for PWA compliance
- [x] End-to-end user manual test validations

## Phase 6: Workout Curriculum Integration & Navigation Enhancements (Completed)
- [x] Parse and seed the 4-week Capacity & Base Phase macrocycle block workouts into `db.js`
- [x] Implement dynamic Today session loading from local storage
- [x] Enable interactive calendar rows to switch to selected workouts on click

