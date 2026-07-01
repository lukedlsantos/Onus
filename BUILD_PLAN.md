# Build Plan - Climbing Training PWA

## Phase 1: Foundation (Current)
- [ ] Define baseline styling system (`index.css`)
- [ ] Set up Project Structure (`index.html`, `app.js`, `db.js`)
- [ ] Implement local database mock layer storing/fetching from `localStorage`
- [ ] Seed dummy training program (6-month and 12-month templates) and user profiles
- [ ] Create mock login and User Role Switcher (Athlete vs. Admin)
- [ ] Build mobile-first layout shell with navigation tabs responsive to selected role

## Phase 2: Athlete Core Workflow (Next)
- [ ] Athlete "Today" dashboard view: display current session drills and duration
- [ ] Session Logging Form: Capture pain, skin, fatigue, duration, RPE, notes, and external video link
- [ ] Workload calculation (`duration * RPE`) logic and telemetry storage
- [ ] Training Calendar view: Mark completed, skipped, modified session history

## Phase 3: Athlete Utilities & Feedback
- [ ] Weekly Check-in questionnaire (stress, sleep, energy, pain)
- [ ] Video Review request submittal form (external URL, grade, questions)
- [ ] Telegram/Google Drive instructions integration
- [ ] Static list displays for Resources and FAQs

## Phase 4: Coach Portal
- [ ] Coach Dashboard view: Athlete progress summary grid
- [ ] Red flag indicators (pain >= 5, fatigue >= 5, missed 2+ sessions, inactivity)
- [ ] Active client list & manual Access Control editor (status, expiration date)
- [ ] Review Queue page: coach feedback summaries and status updates
- [ ] Basic FAQ/Resource CRUD for admins

## Phase 5: Production Readiness & PWA
- [ ] Clean up structure and prepare for Netlify deployment
- [ ] Service worker and manifest configurations for PWA compliance
- [ ] End-to-end user manual test validations
