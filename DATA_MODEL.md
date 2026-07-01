# Data Model - Climbing Training PWA

We use a local database service (`db.js`) that mimics Supabase/Postgres structures to facilitate an easy transition later.

## Schema Interfaces

### Profiles / Users
```typescript
interface Profile {
  id: string; // uuid
  email: string;
  role: 'athlete' | 'admin';
  full_name: string;
  telegram_username?: string;
  created_at: string;
}
```

### Athlete Access
```typescript
interface AthleteAccess {
  id: string; // uuid
  athlete_id: string; // fk -> profiles.id
  status: 'active' | 'paused' | 'expired';
  plan_type: '6_month' | '12_month';
  start_date: string; // YYYY-MM-DD
  access_until: string; // YYYY-MM-DD
  notes?: string;
}
```

### Programs, Phases, Weeks, Sessions & Exercises
```typescript
interface Program {
  id: string;
  title: string; // e.g. "6-Month Intermediate Climbing"
  description?: string;
}

interface Phase {
  id: string;
  program_id: string;
  title: string; // e.g. "Base Endurance"
  phase_order: number;
}

interface Week {
  id: string;
  phase_id: string;
  week_number: number;
}

interface Session {
  id: string;
  week_id: string;
  day_label: string; // e.g., "Day 1", "Day 2"
  title: string; // e.g., "Finger Strength & Core"
  objective: string;
  session_type: 'climbing' | 'strength' | 'mobility' | 'rest' | 'testing';
  estimated_duration_minutes: number;
  target_intensity: number; // RPE target 1-10
  instructions?: string;
}

interface Exercise {
  id: string;
  session_id: string;
  name: string;
  category: string;
  sets: number;
  reps_or_duration: string; // e.g. "7s hang / 3s rest" or "10 reps"
  intensity: string; // e.g. "Bodyweight", "+10 lbs"
  rest: string; // e.g. "2 min"
  notes?: string;
}

interface AssignedProgram {
  id: string;
  athlete_id: string;
  program_id: string;
  start_date: string;
}
```

### Session Logs
```typescript
interface SessionLog {
  id: string;
  athlete_id: string;
  session_id: string;
  logged_at: string;
  status: 'completed' | 'skipped' | 'modified';
  duration_minutes: number;
  rpe: number; // 1-10
  fatigue: number; // 1-5
  finger_pain: number; // 0-10
  skin_condition: number; // 1-5
  notes?: string;
  video_url?: string;
  workload: number; // duration_minutes * rpe
}
```

### Weekly Check-ins
```typescript
interface WeeklyCheckin {
  id: string;
  athlete_id: string;
  week_start_date: string;
  submitted_at: string;
  energy: number; // 1-5
  sleep: number; // 1-5
  stress: number; // 1-5
  motivation: number; // 1-5
  finger_pain: number; // 0-10
  skin_condition: number; // 1-5
  what_felt_good?: string;
  what_felt_bad?: string;
  notes?: string;
}
```

### Video Review Requests
```typescript
interface VideoReviewRequest {
  id: string;
  athlete_id: string;
  video_url: string;
  storage_source: 'Google Drive' | 'YouTube' | 'Telegram' | 'Other';
  climb_grade?: string;
  wall_angle?: string;
  climb_style?: string;
  athlete_question?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'needs_follow_up';
  coach_feedback_summary?: string;
  created_at: string;
  reviewed_at?: string;
}
```

### Resources & FAQs
```typescript
interface Resource {
  id: string;
  title: string;
  category: 'Nutrition Plan' | 'Competition Prep' | 'Warm-up Guide' | 'Mobility / Prehab' | 'Recovery' | 'Training Notes' | 'Other';
  description?: string;
  external_url: string;
  visibility: 'all' | string; // 'all' or program_id or athlete_id
  created_at: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  visibility: 'all' | string;
  display_order: number;
}
```
