/**
 * db.js
 * Mock database service mirroring future Supabase structures.
 * Uses localStorage for persistence. All calls return Promises to simulate async network operations.
 */

// Seed Data
const DEFAULT_PROFILES = [
  {
    id: "ath-1",
    email: "athlete@example.com",
    role: "athlete",
    full_name: "Alex Honnold",
    telegram_username: "alex_climbs",
    strava_connected: false,
    strava_last_sync: null,
    created_at: new Date().toISOString()
  },
  {
    id: "admin-1",
    email: "coach@example.com",
    role: "admin",
    full_name: "Coach John",
    telegram_username: "coach_john",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_ATHLETE_ACCESS = [
  {
    id: "access-1",
    athlete_id: "ath-1",
    status: "active",
    plan_type: "6_month",
    start_date: "2026-06-01",
    access_until: "2026-12-01",
    notes: "Beginner cohort client. Focus on finger endurance and general base building."
  }
];

const DEFAULT_PROGRAMS = [
  {
    id: "prog-6m",
    title: "6-Month Intermediate Climbing Plan",
    description: "Designed for climbers operating in the V3-V5 / 5.10-5.11 range looking to build structured finger strength and core."
  },
  {
    id: "prog-12m",
    title: "12-Month Elite Training Plan",
    description: "Comprehensive cycle focusing on max power, campus board work, and energy system development."
  }
];

const DEFAULT_PHASES = [
  { id: "phase-1", program_id: "prog-6m", title: "Base Endurance & Aerobic Capacity", phase_order: 1 },
  { id: "phase-2", program_id: "prog-6m", title: "Strength & Power Recruitment", phase_order: 2 }
];

const DEFAULT_WEEKS = [
  { id: "week-1", phase_id: "phase-1", week_number: 1 },
  { id: "week-2", phase_id: "phase-1", week_number: 2 }
];

const DEFAULT_SESSIONS = [
  {
    id: "session-w1-d1",
    week_id: "week-1",
    day_label: "Day 1",
    title: "Aerobic Capacity Climbing & Core",
    objective: "Build local forearm endurance and capillary density via volume climbing.",
    session_type: "climbing",
    estimated_duration_minutes: 90,
    target_intensity: 6,
    instructions: "Maintain a steady pace. You should be slightly pumped but never completely failing due to fatigue."
  },
  {
    id: "session-w1-d2",
    week_id: "week-1",
    day_label: "Day 2",
    title: "Active Recovery & Mobility",
    objective: "Restore range of motion in shoulders and hips.",
    session_type: "mobility",
    estimated_duration_minutes: 45,
    target_intensity: 3,
    instructions: "Focus on controlled deep breathing during stretches."
  },
  {
    id: "session-w1-d3",
    week_id: "week-1",
    day_label: "Day 3",
    title: "Finger Strength Max Hangs",
    objective: "Develop recruitment and tendon stiffness in the fingers.",
    session_type: "strength",
    estimated_duration_minutes: 60,
    target_intensity: 8,
    instructions: "Perform proper warm-up before hanging on small edges."
  }
];

const DEFAULT_EXERCISES = [
  {
    id: "ex-1",
    session_id: "session-w1-d1",
    name: "Autobahn / Arc Climbing",
    category: "Climbing",
    sets: 3,
    reps_or_duration: "15 min continuous climbing",
    intensity: "RPE 5 (light pump)",
    rest: "5 min rest between sets",
    notes: "Use a vertical wall. Move continuously without stopping."
  },
  {
    id: "ex-2",
    session_id: "session-w1-d1",
    name: "Plank Variations",
    category: "Core",
    sets: 3,
    reps_or_duration: "60 seconds",
    intensity: "Bodyweight",
    rest: "60 seconds rest",
    notes: "Keep hips level and glutes squeezed."
  },
  {
    id: "ex-3",
    session_id: "session-w1-d3",
    name: "Half Crimp Max Hangs",
    category: "Fingerboard",
    sets: 5,
    reps_or_duration: "7s hang",
    intensity: "80% of max added weight",
    rest: "3 min rest",
    notes: "Do not let hips sag, keep shoulders active."
  }
];

const DEFAULT_ASSIGNED_PROGRAMS = [
  {
    id: "assigned-1",
    athlete_id: "ath-1",
    program_id: "prog-6m",
    start_date: "2026-06-01"
  }
];

const DEFAULT_RESOURCES = [
  {
    id: "res-1",
    title: "Fingerboard Warmup & Safety Protocol",
    category: "Warm-up Guide",
    description: "Crucial routines to perform before hanging to prevent pulley injuries.",
    external_url: "https://example.com/warmup-guide",
    visibility: "all",
    created_at: new Date().toISOString()
  },
  {
    id: "res-2",
    title: "Weekly Nutrition & Recovery Guidelines",
    category: "Recovery",
    description: "Macronutrient breakdown and hydration rules for high-volume climbing phases.",
    external_url: "https://example.com/nutrition",
    visibility: "all",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "What do I do if I feel sharp finger pain?",
    answer: "Stop climbing immediately. Do not complete the session. Flag finger pain as 5+ in your log and weekly check-in, and contact the coach via Telegram.",
    category: "Pain / Injury Flags",
    visibility: "all",
    display_order: 1
  },
  {
    id: "faq-2",
    question: "How do I submit my climbing video for coach feedback?",
    answer: "Upload your video to your personal folder in Google Drive or record/send it on Telegram. In the 'Video Review' tab of this app, submit the public link so the coach can review and add notes.",
    category: "Video Review",
    visibility: "all",
    display_order: 2
  }
];

// Helper to initialize database
function initDB() {
  const store = (key, data) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  store("onus_profiles", DEFAULT_PROFILES);
  store("onus_athlete_access", DEFAULT_ATHLETE_ACCESS);
  store("onus_programs", DEFAULT_PROGRAMS);
  store("onus_phases", DEFAULT_PHASES);
  store("onus_weeks", DEFAULT_WEEKS);
  store("onus_sessions", DEFAULT_SESSIONS);
  store("onus_exercises", DEFAULT_EXERCISES);
  store("onus_assigned_programs", DEFAULT_ASSIGNED_PROGRAMS);
  store("onus_session_logs", []);
  store("onus_weekly_checkins", []);
  store("onus_video_reviews", []);
  store("onus_resources", DEFAULT_RESOURCES);
  store("onus_faqs", DEFAULT_FAQS);
}

// Initialize database right away
initDB();

// DB API Layer wrapper
export const db = {
  // Read item helper
  _get: (key) => JSON.parse(localStorage.getItem(key)),
  
  // Write item helper
  _set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),

  // General Profiles
  getProfiles: () => Promise.resolve(db._get("onus_profiles")),
  getProfile: (id) => Promise.resolve(db._get("onus_profiles").find(p => p.id === id)),

  // Athlete Access
  getAccess: (athleteId) => Promise.resolve(db._get("onus_athlete_access").find(a => a.athlete_id === athleteId)),
  getAllAccess: () => Promise.resolve(db._get("onus_athlete_access")),
  updateAccess: (access) => {
    const all = db._get("onus_athlete_access");
    const idx = all.findIndex(a => a.id === access.id);
    if (idx !== -1) {
      all[idx] = access;
    } else {
      all.push(access);
    }
    db._set("onus_athlete_access", all);
    return Promise.resolve(access);
  },

  // Programs & Phases
  getPrograms: () => Promise.resolve(db._get("onus_programs")),
  getProgram: (id) => Promise.resolve(db._get("onus_programs").find(p => p.id === id)),
  getAssignedProgram: (athleteId) => Promise.resolve(db._get("onus_assigned_programs").find(ap => ap.athlete_id === athleteId)),
  getPhasesForProgram: (programId) => Promise.resolve(db._get("onus_phases").filter(p => p.program_id === programId)),
  getWeeksForPhase: (phaseId) => Promise.resolve(db._get("onus_weeks").filter(w => w.phase_id === phaseId)),
  getSessionsForWeek: (weekId) => Promise.resolve(db._get("onus_sessions").filter(s => s.week_id === weekId)),
  getExercisesForSession: (sessionId) => Promise.resolve(db._get("onus_exercises").filter(e => e.session_id === sessionId)),

  // Session Logs
  getLogsForAthlete: (athleteId) => Promise.resolve(db._get("onus_session_logs").filter(l => l.athlete_id === athleteId)),
  getAllLogs: () => Promise.resolve(db._get("onus_session_logs")),
  addLog: (log) => {
    const logs = db._get("onus_session_logs");
    log.id = log.id || "log-" + Math.random().toString(36).substr(2, 9);
    log.logged_at = log.logged_at || new Date().toISOString();
    log.workload = log.duration_minutes * log.rpe;
    logs.push(log);
    db._set("onus_session_logs", logs);
    return Promise.resolve(log);
  },

  // Resources & FAQs
  getResources: () => Promise.resolve(db._get("onus_resources")),
  getFaqs: () => Promise.resolve(db._get("onus_faqs")),
  addFaq: (faq) => {
    const faqs = db._get("onus_faqs");
    faq.id = faq.id || "faq-" + Math.random().toString(36).substr(2, 9);
    faqs.push(faq);
    db._set("onus_faqs", faqs);
    return Promise.resolve(faq);
  },
  addResource: (res) => {
    const resources = db._get("onus_resources");
    res.id = res.id || "res-" + Math.random().toString(36).substr(2, 9);
    res.created_at = res.created_at || new Date().toISOString();
    resources.push(res);
    db._set("onus_resources", resources);
    return Promise.resolve(res);
  },

  // Weekly Check-ins
  getWeeklyCheckinsForAthlete: (athleteId) => Promise.resolve(db._get("onus_weekly_checkins").filter(c => c.athlete_id === athleteId)),
  getAllWeeklyCheckins: () => Promise.resolve(db._get("onus_weekly_checkins")),
  addWeeklyCheckin: (checkin) => {
    const all = db._get("onus_weekly_checkins");
    checkin.id = checkin.id || "chk-" + Math.random().toString(36).substr(2, 9);
    checkin.submitted_at = checkin.submitted_at || new Date().toISOString();
    all.push(checkin);
    db._set("onus_weekly_checkins", all);
    return Promise.resolve(checkin);
  },

  // Video Review Requests
  getVideoReviewsForAthlete: (athleteId) => Promise.resolve(db._get("onus_video_reviews").filter(r => r.athlete_id === athleteId)),
  getAllVideoReviews: () => Promise.resolve(db._get("onus_video_reviews")),
  addVideoReview: (req) => {
    const all = db._get("onus_video_reviews");
    req.id = req.id || "rev-" + Math.random().toString(36).substr(2, 9);
    req.created_at = req.created_at || new Date().toISOString();
    req.status = req.status || "submitted";
    all.push(req);
    db._set("onus_video_reviews", all);
    return Promise.resolve(req);
  },
  updateVideoReview: (req) => {
    const all = db._get("onus_video_reviews");
    const idx = all.findIndex(r => r.id === req.id);
    if (idx !== -1) {
      all[idx] = req;
    }
    db._set("onus_video_reviews", all);
    return Promise.resolve(req);
  },

  // Strava Integration Actions
  connectStrava: (athleteId) => {
    const profiles = db._get("onus_profiles");
    const profile = profiles.find(p => p.id === athleteId);
    if (profile) {
      profile.strava_connected = true;
      profile.strava_last_sync = new Date().toLocaleString();
      db._set("onus_profiles", profiles);
    }
    return Promise.resolve(profile);
  },
  disconnectStrava: (athleteId) => {
    const profiles = db._get("onus_profiles");
    const profile = profiles.find(p => p.id === athleteId);
    if (profile) {
      profile.strava_connected = false;
      profile.strava_last_sync = null;
      db._set("onus_profiles", profiles);
    }
    return Promise.resolve(profile);
  }
};
