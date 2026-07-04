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
    telegram_link: "https://t.me/coach_john",
    google_drive_folder_url: "https://drive.google.com/drive/folders/mock-alex-folder",
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
    telegram_link: "https://t.me/coach_john",
    google_drive_folder_url: "https://drive.google.com/drive/folders/mock-coach-folder",
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
  {
    "id": "week-1",
    "phase_id": "phase-1",
    "week_number": 1
  },
  {
    "id": "week-2",
    "phase_id": "phase-1",
    "week_number": 2
  },
  {
    "id": "week-3",
    "phase_id": "phase-1",
    "week_number": 3
  },
  {
    "id": "week-4",
    "phase_id": "phase-1",
    "week_number": 4
  }
];

const DEFAULT_SESSIONS = [
  {
    "id": "session-w1-d1",
    "week_id": "week-1",
    "day_label": "Day 1",
    "title": "Low-Neural / High-Volume Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 1 Day 1 in the exercise list."
  },
  {
    "id": "session-w1-d2",
    "week_id": "week-1",
    "day_label": "Day 2",
    "title": "Physical Therapy Core & Recovery",
    "objective": "** Continuous low-intensity, steady-state nasal breathing jog.",
    "session_type": "mobility",
    "estimated_duration_minutes": 120,
    "target_intensity": 3,
    "instructions": "Follow instructions for Week 1 Day 2 in the exercise list."
  },
  {
    "id": "session-w1-d3",
    "week_id": "week-1",
    "day_label": "Day 3",
    "title": "Structural Capacity & Base Off-Wall Stability",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "strength",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 1 Day 3 in the exercise list."
  },
  {
    "id": "session-w1-d4",
    "week_id": "week-1",
    "day_label": "Day 4",
    "title": "Asynchronous Recovery Selector",
    "objective": "Render selector giving the athlete two paths based on baseline readiness.*",
    "session_type": "mobility",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 1 Day 4 in the exercise list."
  },
  {
    "id": "session-w1-d5",
    "week_id": "week-1",
    "day_label": "Day 5",
    "title": "Density Volume & Technical Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 1 Day 5 in the exercise list."
  },
  {
    "id": "session-w1-d6",
    "week_id": "week-1",
    "day_label": "Day 6",
    "title": "Climbing-Specific PT Gym Session",
    "objective": "** 2 sets \u00d7 15 band pull-aparts, shoulder internal/external rotations, and active glute bridges.",
    "session_type": "strength",
    "estimated_duration_minutes": 90,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 1 Day 6 in the exercise list."
  },
  {
    "id": "session-w1-d7",
    "week_id": "week-1",
    "day_label": "Day 7",
    "title": "Absolute Rest Day",
    "objective": "* Zero physical training stressors. Complete off-load to dissipate central nervous system fatigue entirely.",
    "session_type": "rest",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 1 Day 7 in the exercise list."
  },
  {
    "id": "session-w2-d1",
    "week_id": "week-2",
    "day_label": "Day 1",
    "title": "Low-Neural / High-Volume Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 2 Day 1 in the exercise list."
  },
  {
    "id": "session-w2-d2",
    "week_id": "week-2",
    "day_label": "Day 2",
    "title": "Physical Therapy Core & Recovery",
    "objective": "** Continuous low-intensity, steady-state nasal breathing run.",
    "session_type": "mobility",
    "estimated_duration_minutes": 120,
    "target_intensity": 3,
    "instructions": "Follow instructions for Week 2 Day 2 in the exercise list."
  },
  {
    "id": "session-w2-d3",
    "week_id": "week-2",
    "day_label": "Day 3",
    "title": "Structural Capacity & Base Off-Wall Stability",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "strength",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 2 Day 3 in the exercise list."
  },
  {
    "id": "session-w2-d4",
    "week_id": "week-2",
    "day_label": "Day 4",
    "title": "Asynchronous Recovery Selector",
    "objective": "** Re-execute Day 2's deep mobility and climbing PT core container.",
    "session_type": "mobility",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 2 Day 4 in the exercise list."
  },
  {
    "id": "session-w2-d5",
    "week_id": "week-2",
    "day_label": "Day 5",
    "title": "Density Volume & Technical Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 2 Day 5 in the exercise list."
  },
  {
    "id": "session-w2-d6",
    "week_id": "week-2",
    "day_label": "Day 6",
    "title": "Climbing-Specific PT Gym Session",
    "objective": "** 2 sets \u00d7 15 band pull-aparts, rotator cuff band rotations, and glute bridges.",
    "session_type": "strength",
    "estimated_duration_minutes": 90,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 2 Day 6 in the exercise list."
  },
  {
    "id": "session-w2-d7",
    "week_id": "week-2",
    "day_label": "Day 7",
    "title": "Absolute Rest Day",
    "objective": "* Full systemic off-load. Maximum recovery priority.",
    "session_type": "rest",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 2 Day 7 in the exercise list."
  },
  {
    "id": "session-w3-d1",
    "week_id": "week-3",
    "day_label": "Day 1",
    "title": "Low-Neural / High-Volume Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 3 Day 1 in the exercise list."
  },
  {
    "id": "session-w3-d2",
    "week_id": "week-3",
    "day_label": "Day 2",
    "title": "Physical Therapy Core & Recovery",
    "objective": "** Continuous low-intensity, steady-state nasal breathing run.",
    "session_type": "mobility",
    "estimated_duration_minutes": 120,
    "target_intensity": 3,
    "instructions": "Follow instructions for Week 3 Day 2 in the exercise list."
  },
  {
    "id": "session-w3-d3",
    "week_id": "week-3",
    "day_label": "Day 3",
    "title": "Structural Capacity & Base Off-Wall Stability",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "strength",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 3 Day 3 in the exercise list."
  },
  {
    "id": "session-w3-d4",
    "week_id": "week-3",
    "day_label": "Day 4",
    "title": "Asynchronous Recovery Selector",
    "objective": "** Re-execute Day 2's deep mobility and climbing PT core container.",
    "session_type": "mobility",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 3 Day 4 in the exercise list."
  },
  {
    "id": "session-w3-d5",
    "week_id": "week-3",
    "day_label": "Day 5",
    "title": "Density Volume & Technical Capacity",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 3 Day 5 in the exercise list."
  },
  {
    "id": "session-w3-d6",
    "week_id": "week-3",
    "day_label": "Day 6",
    "title": "Climbing-Specific PT Gym Session",
    "objective": "** 2 sets \u00d7 15 band pull-aparts, rotator cuff band rotations, and glute bridges.",
    "session_type": "strength",
    "estimated_duration_minutes": 90,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 3 Day 6 in the exercise list."
  },
  {
    "id": "session-w3-d7",
    "week_id": "week-3",
    "day_label": "Day 7",
    "title": "Absolute Rest Day",
    "objective": "* Full systemic off-load. Zero activity.",
    "session_type": "rest",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 3 Day 7 in the exercise list."
  },
  {
    "id": "session-w4-d1",
    "week_id": "week-4",
    "day_label": "Day 1",
    "title": "Low-Volume Fluidity Check",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 4 Day 1 in the exercise list."
  },
  {
    "id": "session-w4-d2",
    "week_id": "week-4",
    "day_label": "Day 2",
    "title": "Restorative Physical Therapy & Recovery",
    "objective": "** Unweighted recovery walking or light nasal-breathing jog.",
    "session_type": "mobility",
    "estimated_duration_minutes": 120,
    "target_intensity": 3,
    "instructions": "Follow instructions for Week 4 Day 2 in the exercise list."
  },
  {
    "id": "session-w4-d3",
    "week_id": "week-4",
    "day_label": "Day 3",
    "title": "Low-Volume Base Stability",
    "objective": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly.",
    "session_type": "strength",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 4 Day 3 in the exercise list."
  },
  {
    "id": "session-w4-d4",
    "week_id": "week-4",
    "day_label": "Day 4",
    "title": "Mandatory Absolute Rest Day",
    "objective": "* Complete structural off-load. No active options permitted.",
    "session_type": "rest",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 4 Day 4 in the exercise list."
  },
  {
    "id": "session-w4-d5",
    "week_id": "week-4",
    "day_label": "Day 5",
    "title": "Low-Volume Fluidity Check",
    "objective": "Warm-Up & Prep [40 Mins]:** Duplicate Day 1 Week 4 deload warm-up exactly.",
    "session_type": "climbing",
    "estimated_duration_minutes": 180,
    "target_intensity": 7,
    "instructions": "Follow instructions for Week 4 Day 5 in the exercise list."
  },
  {
    "id": "session-w4-d6",
    "week_id": "week-4",
    "day_label": "Day 6",
    "title": "Restorative Full Body PT Gym Session",
    "objective": "** Basic joint flossing and foam rolling.",
    "session_type": "strength",
    "estimated_duration_minutes": 90,
    "target_intensity": 6,
    "instructions": "Follow instructions for Week 4 Day 6 in the exercise list."
  },
  {
    "id": "session-w4-d7",
    "week_id": "week-4",
    "day_label": "Day 7",
    "title": "Absolute Rest Day",
    "objective": "* Complete systemic recovery to allow supercompensation to materialize before launching into **Month 2: Basic Strengt...",
    "session_type": "rest",
    "estimated_duration_minutes": 180,
    "target_intensity": 1,
    "instructions": "Follow instructions for Week 4 Day 7 in the exercise list."
  }
];

const DEFAULT_EXERCISES = [
  {
    "id": "ex-w1-d1-1",
    "session_id": "session-w1-d1",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w1-d1-2",
    "session_id": "session-w1-d1",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 20,
    "reps_or_duration": "20 problems",
    "intensity": "RPE 6",
    "rest": "90 seconds",
    "notes": "Core Driver \u2014 High Mileage Volume [90 Mins]:**"
  },
  {
    "id": "ex-w1-d1-3",
    "session_id": "session-w1-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Execute 20 unique vertical to gentle-slab boulder problems at low-to-moderate physical intensity."
  },
  {
    "id": "ex-w1-d1-4",
    "session_id": "session-w1-d1",
    "name": "Pacing",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Rest strictly limited to 90 seconds between problems to drive vascular capillarization."
  },
  {
    "id": "ex-w1-d1-5",
    "session_id": "session-w1-d1",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Technique Base & Core Tension [40 Mins]:**"
  },
  {
    "id": "ex-w1-d1-6",
    "session_id": "session-w1-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Movement library saturation. Complete repetitive paths on flash-grade terrain. Focus on zero foot readjustments, silent feet placements, precision hip tracking, and strict flagging extension."
  },
  {
    "id": "ex-w1-d1-7",
    "session_id": "session-w1-d1",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Care, Advanced Core & Lower-Body Plyometrics [10 Mins]:**"
  },
  {
    "id": "ex-w1-d1-8",
    "session_id": "session-w1-d1",
    "name": "Climbing Core & Upper Push",
    "category": "Core",
    "sets": 2,
    "reps_or_duration": "max time hanging static L-sits",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 max time hanging static L-sits. 2 sets \u00d7 15 deep diamond push-ups. 2 sets \u00d7 8 deep bench dips."
  },
  {
    "id": "ex-w1-d1-9",
    "session_id": "session-w1-d1",
    "name": "Wrist, Shoulder & Lower Plyos",
    "category": "Mobility / Prehab",
    "sets": 2,
    "reps_or_duration": "15 reverse wrist curls with a light dumbbell",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 15 reverse wrist curls with a light dumbbell. 1 min deep dead-hang shoulder decompression. 3 sets \u00d7 6 explosive box jumps with soft, controlled landing mechanics to activate leg drive."
  },
  {
    "id": "ex-w1-d2-1",
    "session_id": "session-w1-d2",
    "name": "Aerobic Influx Flush [30 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "** Continuous low-intensity, steady-state nasal breathing jog."
  },
  {
    "id": "ex-w1-d2-2",
    "session_id": "session-w1-d2",
    "name": "Climbing-Specific PT Core Container [40 Mins]",
    "category": "Core",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w1-d2-3",
    "session_id": "session-w1-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "45-second anti-rotational cable Pallof presses per side",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 45-second anti-rotational cable Pallof presses per side. 3 sets \u00d7 12 reps single-arm kettlebell farmer's carries per side to lock down lateral stability chains. 3 sets \u00d7 10 slow, high-tension Swiss-ball rollouts."
  },
  {
    "id": "ex-w1-d2-4",
    "session_id": "session-w1-d2",
    "name": "Deep Shoulder, Spine & Mobility Matrix [50 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w1-d2-5",
    "session_id": "session-w1-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 seconds passive sleeper stretch for posterior rotator cuff tracking",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 15 seconds passive sleeper stretch for posterior rotator cuff tracking. 3 sets \u00d7 10 reps prone standard Y-T-W arm raises on floor. 3 sets \u00d7 45 seconds deep puppy pose shoulder/lat stretch. 3 sets \u00d7 60 seconds cross-legged spine twists."
  },
  {
    "id": "ex-w1-d3-1",
    "session_id": "session-w1-d3",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w1-d3-2",
    "session_id": "session-w1-d3",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 4,
    "reps_or_duration": "4 blocks of 4 problems",
    "intensity": "RPE 7",
    "rest": "3 mins",
    "notes": "Core Driver \u2014 On-Wall Density Ladders [90 Mins]:**"
  },
  {
    "id": "ex-w1-d3-3",
    "session_id": "session-w1-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Style variety density ladders. Complete 4 distinct blocks of 4 different moderate boulder problems back-to-back across sloper, crimp, and compression angle layouts. Rest 3 minutes between major blocks."
  },
  {
    "id": "ex-w1-d3-4",
    "session_id": "session-w1-d3",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Highly Optimal Off-Wall Foundation [40 Mins]:**"
  },
  {
    "id": "ex-w1-d3-5",
    "session_id": "session-w1-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps strict overhead dumbbell press",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Structural alignment overload. 3 sets \u00d7 8 reps strict overhead dumbbell press. 3 sets \u00d7 8 reps heavy kettlebell goblet squats. 3 sets \u00d7 12 reps cable face-pulls with high contraction hold to counter active climbing shoulder slouch."
  },
  {
    "id": "ex-w1-d3-6",
    "session_id": "session-w1-d3",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Postural Care & Plyometric Booster [10 Mins]:**"
  },
  {
    "id": "ex-w1-d3-7",
    "session_id": "session-w1-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "6 explosive broad jumps emphasizing complete hip extension",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* 5 minutes targeted deep forearm rolling and cross-friction finger tissue massage. 3 sets \u00d7 6 explosive broad jumps emphasizing complete hip extension."
  },
  {
    "id": "ex-w1-d4-1",
    "session_id": "session-w1-d4",
    "name": "Code Instruction",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "Render selector giving the athlete two paths based on baseline readiness.*"
  },
  {
    "id": "ex-w1-d4-2",
    "session_id": "session-w1-d4",
    "name": "Option A (Active Flush)",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Re-execute Day 2's deep mobility and climbing PT core container."
  },
  {
    "id": "ex-w1-d4-3",
    "session_id": "session-w1-d4",
    "name": "Option B (Passive Rest)",
    "category": "Rest",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Zero physical training stress. Complete off-load to repair skin calluses and finger pulley networks."
  },
  {
    "id": "ex-w1-d5-1",
    "session_id": "session-w1-d5",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w1-d5-2",
    "session_id": "session-w1-d5",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 12,
    "reps_or_duration": "10-12 problems",
    "intensity": "RPE 7",
    "rest": "2 mins",
    "notes": "Core Driver \u2014 Medium-Volume Coordination [90 Mins]:**"
  },
  {
    "id": "ex-w1-d5-3",
    "session_id": "session-w1-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Complete 10\u201312 mid-tier problems focusing on coordination steps, dynamic drop-knees, and directional tracking on sub-optimal foot placements. Rest 2 minutes between attempts."
  },
  {
    "id": "ex-w1-d5-4",
    "session_id": "session-w1-d5",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Under-Load Technical Repeats [40 Mins]:**"
  },
  {
    "id": "ex-w1-d5-5",
    "session_id": "session-w1-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Re-climb flash-grade problems under climbing fatigue while actively working through a localized forearm pump to reinforce technical precision when exhausted."
  },
  {
    "id": "ex-w1-d5-6",
    "session_id": "session-w1-d5",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 repetitions wrist extensor band extensions",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Structural Care [10 Mins]:** 3 sets \u00d7 15 repetitions wrist extensor band extensions, 45 seconds doorway chest wall stretches, and 2 minutes passive edge dead-hangs."
  },
  {
    "id": "ex-w1-d6-1",
    "session_id": "session-w1-d6",
    "name": "Warm-Up & Stabilization [15 Mins]",
    "category": "Warm-up",
    "sets": 2,
    "reps_or_duration": "15 band pull-aparts",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 2 sets \u00d7 15 band pull-aparts, shoulder internal/external rotations, and active glute bridges."
  },
  {
    "id": "ex-w1-d6-2",
    "session_id": "session-w1-d6",
    "name": "Shoulder Girdle & Pulling Alignment [35 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w1-d6-3",
    "session_id": "session-w1-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 reps of eccentric pull-ups (4-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls to reinforce posterior structural tracks",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 10 reps of eccentric pull-ups (4-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls to reinforce posterior structural tracks."
  },
  {
    "id": "ex-w1-d6-4",
    "session_id": "session-w1-d6",
    "name": "Pushing & Anterior Posture Corrections [30 Mins]",
    "category": "Strength",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w1-d6-5",
    "session_id": "session-w1-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps kettlebell floor press (shoulder joint capsule safety) and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 8 reps kettlebell floor press (shoulder joint capsule safety) and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses."
  },
  {
    "id": "ex-w1-d6-6",
    "session_id": "session-w1-d6",
    "name": "Core Integration [10 Mins]",
    "category": "Core",
    "sets": 3,
    "reps_or_duration": "10 reps hanging leg raises focusing on slow eccentric control",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 3 sets \u00d7 10 reps hanging leg raises focusing on slow eccentric control."
  },
  {
    "id": "ex-w1-d7-1",
    "session_id": "session-w1-d7",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "* Zero physical training stressors. Complete off-load to dissipate central nervous system fatigue entirely."
  },
  {
    "id": "ex-w2-d1-1",
    "session_id": "session-w2-d1",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w2-d1-2",
    "session_id": "session-w2-d1",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 22,
    "reps_or_duration": "22 problems",
    "intensity": "RPE 6",
    "rest": "75 seconds",
    "notes": "Core Driver \u2014 High Mileage Volume [90 Mins]:**"
  },
  {
    "id": "ex-w2-d1-3",
    "session_id": "session-w2-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Volume overload. Target 22 unique boulder problems."
  },
  {
    "id": "ex-w2-d1-4",
    "session_id": "session-w2-d1",
    "name": "Pacing",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Rest strictly limited to 75 seconds between problems to increase aerobic tax."
  },
  {
    "id": "ex-w2-d1-5",
    "session_id": "session-w2-d1",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Technique Base & Core Tension [40 Mins]:**"
  },
  {
    "id": "ex-w2-d1-6",
    "session_id": "session-w2-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Execute technical precision loops on steep, overhanging walls. Focus on maximum toe hook engagement, core frame rigidity, and minimizing torso swing."
  },
  {
    "id": "ex-w2-d1-7",
    "session_id": "session-w2-d1",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Dynamic Care, Advanced Core & Lower-Body Plyometrics [10 Mins]:**"
  },
  {
    "id": "ex-w2-d1-8",
    "session_id": "session-w2-d1",
    "name": "Climbing Core & Upper Push",
    "category": "Core",
    "sets": 2,
    "reps_or_duration": "max time hanging static L-sits",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 max time hanging static L-sits. 2 sets \u00d7 18 deep diamond push-ups. 2 sets \u00d7 10 deep bench dips."
  },
  {
    "id": "ex-w2-d1-9",
    "session_id": "session-w2-d1",
    "name": "Wrist, Shoulder & Lower Plyos",
    "category": "Mobility / Prehab",
    "sets": 2,
    "reps_or_duration": "15 reverse wrist curls",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 15 reverse wrist curls. 1 min deep dead-hang. 3 sets \u00d7 6 explosive box jumps (increase target box height by 2 inches from Week 1)."
  },
  {
    "id": "ex-w2-d2-1",
    "session_id": "session-w2-d2",
    "name": "Aerobic Influx Flush [30 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "** Continuous low-intensity, steady-state nasal breathing run."
  },
  {
    "id": "ex-w2-d2-2",
    "session_id": "session-w2-d2",
    "name": "Climbing-Specific PT Core Container [40 Mins]",
    "category": "Core",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w2-d2-3",
    "session_id": "session-w2-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "45-second anti-rotational cable Pallof presses",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 45-second anti-rotational cable Pallof presses. 3 sets \u00d7 12 reps single-arm farmer's carries (increase kettlebell load by one increment). 3 sets \u00d7 12 slow, high-tension Swiss-ball rollouts."
  },
  {
    "id": "ex-w2-d2-4",
    "session_id": "session-w2-d2",
    "name": "Deep Shoulder, Spine & Mobility Matrix [50 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w2-d2-5",
    "session_id": "session-w2-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 seconds sleeper stretch",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 15 seconds sleeper stretch. 3 sets \u00d7 12 reps prone floor Y-T-W raises. 3 sets \u00d7 45 seconds puppy pose lat stretch. 3 sets \u00d7 60 seconds cross-legged spine twists."
  },
  {
    "id": "ex-w2-d3-1",
    "session_id": "session-w2-d3",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w2-d3-2",
    "session_id": "session-w2-d3",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 4,
    "reps_or_duration": "4 blocks of 5 problems",
    "intensity": "RPE 7",
    "rest": "3 mins",
    "notes": "Core Driver \u2014 On-Wall Density Ladders [90 Mins]:**"
  },
  {
    "id": "ex-w2-d3-3",
    "session_id": "session-w2-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Density volume overload. Complete 4 distinct blocks of 5 different moderate problems back-to-back. Rest 3 minutes between major blocks."
  },
  {
    "id": "ex-w2-d3-4",
    "session_id": "session-w2-d3",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Highly Optimal Off-Wall Foundation [40 Mins]:**"
  },
  {
    "id": "ex-w2-d3-5",
    "session_id": "session-w2-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps strict overhead dumbbell press (increase load)",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Linear loading progression. 3 sets \u00d7 8 reps strict overhead dumbbell press (increase load). 3 sets \u00d7 8 reps heavy goblet squats (increase load). 3 sets \u00d7 12 reps face-pulls with extended static holds."
  },
  {
    "id": "ex-w2-d3-6",
    "session_id": "session-w2-d3",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Postural Care & Plyometric Booster [10 Mins]:**"
  },
  {
    "id": "ex-w2-d3-7",
    "session_id": "session-w2-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "6 explosive broad jumps targeting max forward trajectory",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Forearm foam rolling and pulley tissue flossing. 3 sets \u00d7 6 explosive broad jumps targeting max forward trajectory."
  },
  {
    "id": "ex-w2-d4-1",
    "session_id": "session-w2-d4",
    "name": "Option A (Active Flush)",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Re-execute Day 2's deep mobility and climbing PT core container."
  },
  {
    "id": "ex-w2-d4-2",
    "session_id": "session-w2-d4",
    "name": "Option B (Passive Rest)",
    "category": "Rest",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Zero physical training stress. Complete off-load."
  },
  {
    "id": "ex-w2-d5-1",
    "session_id": "session-w2-d5",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w2-d5-2",
    "session_id": "session-w2-d5",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 14,
    "reps_or_duration": "12-14 problems",
    "intensity": "RPE 7",
    "rest": "2 mins",
    "notes": "Core Driver \u2014 Medium-Volume Coordination [90 Mins]:**"
  },
  {
    "id": "ex-w2-d5-3",
    "session_id": "session-w2-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Complete 12\u201314 mid-tier problems focusing on rapid coordination steps and skate-style dynamic moves. Rest 2 minutes between attempts."
  },
  {
    "id": "ex-w2-d5-4",
    "session_id": "session-w2-d5",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Under-Load Technical Repeats [40 Mins]:**"
  },
  {
    "id": "ex-w2-d5-5",
    "session_id": "session-w2-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Re-climb flash-grade routes while sustaining an active, deep forearm pump. Focus on clean hand tracking and loose grip tension."
  },
  {
    "id": "ex-w2-d5-6",
    "session_id": "session-w2-d5",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 wrist extensor band repetitions",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Structural Care [10 Mins]:** 3 sets \u00d7 15 wrist extensor band repetitions, 45 seconds doorway chest stretches, and 2 minutes passive dead-hangs."
  },
  {
    "id": "ex-w2-d6-1",
    "session_id": "session-w2-d6",
    "name": "Warm-Up & Stabilization [15 Mins]",
    "category": "Warm-up",
    "sets": 2,
    "reps_or_duration": "15 band pull-aparts",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 2 sets \u00d7 15 band pull-aparts, rotator cuff band rotations, and glute bridges."
  },
  {
    "id": "ex-w2-d6-2",
    "session_id": "session-w2-d6",
    "name": "Shoulder Girdle & Pulling Alignment [35 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w2-d6-3",
    "session_id": "session-w2-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 reps of eccentric pull-ups (5-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 10 reps of eccentric pull-ups (5-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls."
  },
  {
    "id": "ex-w2-d6-4",
    "session_id": "session-w2-d6",
    "name": "Pushing & Anterior Posture Corrections [30 Mins]",
    "category": "Strength",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w2-d6-5",
    "session_id": "session-w2-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps kettlebell floor press and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 8 reps kettlebell floor press and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses."
  },
  {
    "id": "ex-w2-d6-6",
    "session_id": "session-w2-d6",
    "name": "Core Integration [10 Mins]",
    "category": "Core",
    "sets": 3,
    "reps_or_duration": "10 reps hanging leg raises focusing on slow eccentric control",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 3 sets \u00d7 10 reps hanging leg raises focusing on slow eccentric control."
  },
  {
    "id": "ex-w2-d7-1",
    "session_id": "session-w2-d7",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "* Full systemic off-load. Maximum recovery priority."
  },
  {
    "id": "ex-w3-d1-1",
    "session_id": "session-w3-d1",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w3-d1-2",
    "session_id": "session-w3-d1",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 25,
    "reps_or_duration": "25 problems",
    "intensity": "RPE 6",
    "rest": "60 seconds",
    "notes": "Core Driver \u2014 High Mileage Volume [90 Mins]:**"
  },
  {
    "id": "ex-w3-d1-3",
    "session_id": "session-w3-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Peak volume overload. Target 25 unique boulder problems."
  },
  {
    "id": "ex-w3-d1-4",
    "session_id": "session-w3-d1",
    "name": "Pacing",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Rest strictly limited to 60 seconds between problems to maximize aerobic tolerance boundaries."
  },
  {
    "id": "ex-w3-d1-5",
    "session_id": "session-w3-d1",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Technique Base & Core Tension [40 Mins]:**"
  },
  {
    "id": "ex-w3-d1-6",
    "session_id": "session-w3-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Technical execution under maximum systemic exhaustion. Run technique drills on multi-directional coordination tracks. Focus on absolute kinetic stillness."
  },
  {
    "id": "ex-w3-d1-7",
    "session_id": "session-w3-d1",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Dynamic Care, Advanced Core & Lower-Body Plyometrics [10 Mins]:**"
  },
  {
    "id": "ex-w3-d1-8",
    "session_id": "session-w3-d1",
    "name": "Climbing Core & Upper Push",
    "category": "Core",
    "sets": 2,
    "reps_or_duration": "max time hanging static L-sits",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 max time hanging static L-sits. 2 sets \u00d7 20 deep diamond push-ups. 2 sets \u00d7 12 deep bench dips."
  },
  {
    "id": "ex-w3-d1-9",
    "session_id": "session-w3-d1",
    "name": "Wrist, Shoulder & Lower Plyos",
    "category": "Mobility / Prehab",
    "sets": 2,
    "reps_or_duration": "15 reverse wrist curls",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 2 sets \u00d7 15 reverse wrist curls. 1 min deep dead-hang. 3 sets \u00d7 6 explosive box jumps at absolute maximum target height."
  },
  {
    "id": "ex-w3-d2-1",
    "session_id": "session-w3-d2",
    "name": "Aerobic Influx Flush [30 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "** Continuous low-intensity, steady-state nasal breathing run."
  },
  {
    "id": "ex-w3-d2-2",
    "session_id": "session-w3-d2",
    "name": "Climbing-Specific PT Core Container [40 Mins]",
    "category": "Core",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w3-d2-3",
    "session_id": "session-w3-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "45-second anti-rotational cable Pallof presses",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 45-second anti-rotational cable Pallof presses. 3 sets \u00d7 12 reps single-arm farmer's carries (peak kettlebell load). 3 sets \u00d7 15 slow, high-tension Swiss-ball rollouts."
  },
  {
    "id": "ex-w3-d2-4",
    "session_id": "session-w3-d2",
    "name": "Deep Shoulder, Spine & Mobility Matrix [50 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w3-d2-5",
    "session_id": "session-w3-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 seconds sleeper stretch",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 15 seconds sleeper stretch. 3 sets \u00d7 15 reps prone floor Y-T-W raises. 3 sets \u00d7 45 seconds puppy pose lat stretch. 3 sets \u00d7 60 seconds cross-legged spine twists."
  },
  {
    "id": "ex-w3-d3-1",
    "session_id": "session-w3-d3",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w3-d3-2",
    "session_id": "session-w3-d3",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 5,
    "reps_or_duration": "5 blocks of 4 problems",
    "intensity": "RPE 7",
    "rest": "3 mins",
    "notes": "Core Driver \u2014 On-Wall Density Ladders [90 Mins]:**"
  },
  {
    "id": "ex-w3-d3-3",
    "session_id": "session-w3-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Peak structural density accumulation. Complete 5 distinct blocks of 4 different moderate problems back-to-back. Rest 3 minutes between major blocks."
  },
  {
    "id": "ex-w3-d3-4",
    "session_id": "session-w3-d3",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Highly Optimal Off-Wall Foundation [40 Mins]:**"
  },
  {
    "id": "ex-w3-d3-5",
    "session_id": "session-w3-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps strict overhead dumbbell press (peak weight tracking)",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Peak block intensity loading. 3 sets \u00d7 8 reps strict overhead dumbbell press (peak weight tracking). 3 sets \u00d7 8 reps heavy goblet squats (peak weight tracking). 3 sets \u00d7 15 reps face-pulls."
  },
  {
    "id": "ex-w3-d3-6",
    "session_id": "session-w3-d3",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Postural Care & Plyometric Booster [10 Mins]:**"
  },
  {
    "id": "ex-w3-d3-7",
    "session_id": "session-w3-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "6 explosive broad jumps focusing on dynamic velocity out of a deep stance",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Forearm rolling and targeted joint tissue mobilization. 3 sets \u00d7 6 explosive broad jumps focusing on dynamic velocity out of a deep stance."
  },
  {
    "id": "ex-w3-d4-1",
    "session_id": "session-w3-d4",
    "name": "Option A (Active Flush)",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Re-execute Day 2's deep mobility and climbing PT core container."
  },
  {
    "id": "ex-w3-d4-2",
    "session_id": "session-w3-d4",
    "name": "Option B (Passive Rest)",
    "category": "Rest",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "** Zero physical training stress. Complete off-load."
  },
  {
    "id": "ex-w3-d5-1",
    "session_id": "session-w3-d5",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w3-d5-2",
    "session_id": "session-w3-d5",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 16,
    "reps_or_duration": "14-16 problems",
    "intensity": "RPE 7",
    "rest": "2 mins",
    "notes": "Core Driver \u2014 Medium-Volume Coordination [90 Mins]:**"
  },
  {
    "id": "ex-w3-d5-3",
    "session_id": "session-w3-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Complete 14\u201316 mid-tier problems focusing on multi-step lateral coordination moves and directional toe catches. Rest 2 minutes between attempts."
  },
  {
    "id": "ex-w3-d5-4",
    "session_id": "session-w3-d5",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Under-Load Technical Repeats [40 Mins]:**"
  },
  {
    "id": "ex-w3-d5-5",
    "session_id": "session-w3-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Re-climb flash-grade routes while sustaining an active, deep forearm pump. Focus on clean hand tracking and loose grip tension."
  },
  {
    "id": "ex-w3-d5-6",
    "session_id": "session-w3-d5",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "15 wrist extensor band repetitions",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Structural Care [10 Mins]:** 3 sets \u00d7 15 wrist extensor band repetitions, 45 seconds doorway chest stretches, and 2 minutes passive dead-hangs."
  },
  {
    "id": "ex-w3-d6-1",
    "session_id": "session-w3-d6",
    "name": "Warm-Up & Stabilization [15 Mins]",
    "category": "Warm-up",
    "sets": 2,
    "reps_or_duration": "15 band pull-aparts",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 2 sets \u00d7 15 band pull-aparts, rotator cuff band rotations, and glute bridges."
  },
  {
    "id": "ex-w3-d6-2",
    "session_id": "session-w3-d6",
    "name": "Shoulder Girdle & Pulling Alignment [35 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w3-d6-3",
    "session_id": "session-w3-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 reps of eccentric pull-ups (6-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 10 reps of eccentric pull-ups (6-second lowering phase) and 3 sets \u00d7 12 reps cable face-pulls."
  },
  {
    "id": "ex-w3-d6-4",
    "session_id": "session-w3-d6",
    "name": "Pushing & Anterior Posture Corrections [30 Mins]",
    "category": "Strength",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w3-d6-5",
    "session_id": "session-w3-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "8 reps kettlebell floor press and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 8 reps kettlebell floor press and 3 sets \u00d7 8 reps single-arm dumbbell overhead presses."
  },
  {
    "id": "ex-w3-d6-6",
    "session_id": "session-w3-d6",
    "name": "Core Integration [10 Mins]",
    "category": "Core",
    "sets": 3,
    "reps_or_duration": "10 reps hanging leg raises focusing on slow eccentric control",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** 3 sets \u00d7 10 reps hanging leg raises focusing on slow eccentric control."
  },
  {
    "id": "ex-w3-d7-1",
    "session_id": "session-w3-d7",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "* Full systemic off-load. Zero activity."
  },
  {
    "id": "ex-w4-d1-1",
    "session_id": "session-w4-d1",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w4-d1-2",
    "session_id": "session-w4-d1",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 10,
    "reps_or_duration": "8-10 low-grade climbs",
    "intensity": "RPE 6",
    "rest": "Lifts/fluid",
    "notes": "Core Driver \u2014 Technical Clearance [45 Mins]:**"
  },
  {
    "id": "ex-w4-d1-3",
    "session_id": "session-w4-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Cut total training parameters in half. Execute 8 to 10 low-grade technical climbs. Focus strictly on smooth weight transfer, silent feet, and minimal hold gripping force."
  },
  {
    "id": "ex-w4-d1-4",
    "session_id": "session-w4-d1",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Technical Visualization Check [45 Mins]:**"
  },
  {
    "id": "ex-w4-d1-5",
    "session_id": "session-w4-d1",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Visual mapping sequences. Review gym routes, work on finger read patterns, and traverse low-angle lines to keep the technical library active without fatiguing muscles."
  },
  {
    "id": "ex-w4-d1-6",
    "session_id": "session-w4-d1",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 wrist extensor bands",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "Structural Care [10 Mins]:** 3 sets \u00d7 10 wrist extensor bands, 45 seconds doorway chest stretches, and light foam rolling."
  },
  {
    "id": "ex-w4-d2-1",
    "session_id": "session-w4-d2",
    "name": "Aerobic Flush [30 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "** Unweighted recovery walking or light nasal-breathing jog."
  },
  {
    "id": "ex-w4-d2-2",
    "session_id": "session-w4-d2",
    "name": "Restorative Core Alignment [40 Mins]",
    "category": "Core",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w4-d2-3",
    "session_id": "session-w4-d2",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 reps deadbugs",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "* 3 sets \u00d7 10 reps deadbugs. 3 sets \u00d7 10 reps bird-dogs. Avoid any maximal isometric bracing or loading."
  },
  {
    "id": "ex-w4-d2-4",
    "session_id": "session-w4-d2",
    "name": "Deep Mobility Extension [50 Mins]",
    "category": "Mobility / Prehab",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 3",
    "rest": "Self-paced",
    "notes": "** Focus on restoring soft tissue lengths across shoulder capsules, lower back musculature, and forearm fascia."
  },
  {
    "id": "ex-w4-d3-1",
    "session_id": "session-w4-d3",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Execute Standard 40-Minute Prep Container exactly."
  },
  {
    "id": "ex-w4-d3-2",
    "session_id": "session-w4-d3",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 5,
    "reps_or_duration": "5 easy blocks of 2 problems",
    "intensity": "RPE 7",
    "rest": "4 mins",
    "notes": "Core Driver \u2014 Low-Volume Style Variety [45 Mins]:**"
  },
  {
    "id": "ex-w4-d3-3",
    "session_id": "session-w4-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Complete 5 easy blocks of 2 moderate, continuous boulder problems. Long 4-minute rests between blocks to eliminate any metabolic build-up."
  },
  {
    "id": "ex-w4-d3-4",
    "session_id": "session-w4-d3",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Posture Maintenance [45 Mins]:**"
  },
  {
    "id": "ex-w4-d3-5",
    "session_id": "session-w4-d3",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Light off-wall mechanics. Submaximal kettlebell overhead presses and unweighted squats to preserve movement patterns without adding neural fatigue."
  },
  {
    "id": "ex-w4-d3-6",
    "session_id": "session-w4-d3",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Postural Care [10 Mins]:** Forearm cross-friction massage and passive spine decompression hangs."
  },
  {
    "id": "ex-w4-d4-1",
    "session_id": "session-w4-d4",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "* Complete structural off-load. No active options permitted."
  },
  {
    "id": "ex-w4-d5-1",
    "session_id": "session-w4-d5",
    "name": "Tier 1",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Warm-Up & Prep [40 Mins]:** Duplicate Day 1 Week 4 deload warm-up exactly."
  },
  {
    "id": "ex-w4-d5-2",
    "session_id": "session-w4-d5",
    "name": "Tier 2",
    "category": "Climbing",
    "sets": 5,
    "reps_or_duration": "5 easy climbs",
    "intensity": "RPE 7",
    "rest": "Lifts/fluid",
    "notes": "Core Driver \u2014 Technical Coordination Clearance [45 Mins]:**"
  },
  {
    "id": "ex-w4-d5-3",
    "session_id": "session-w4-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Execute 5 low-grade technical climbs. Focus strictly on smooth weight transfer, silent feet, and minimal hold gripping force."
  },
  {
    "id": "ex-w4-d5-4",
    "session_id": "session-w4-d5",
    "name": "Tier 3",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Progress Hook \u2014 Technical Visualization Check [45 Mins]:**"
  },
  {
    "id": "ex-w4-d5-5",
    "session_id": "session-w4-d5",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "* Visual mapping sequences. Reviewing gym routes, working on finger read patterns, and traversing low-angle lines to keep the technical library active without fatiguing muscles."
  },
  {
    "id": "ex-w4-d5-6",
    "session_id": "session-w4-d5",
    "name": "Tier 4",
    "category": "Climbing",
    "sets": 3,
    "reps_or_duration": "10 wrist extensor bands and chest releases",
    "intensity": "RPE 7",
    "rest": "Self-paced",
    "notes": "Structural Care [10 Mins]:** 3 sets \u00d7 10 wrist extensor bands and chest releases."
  },
  {
    "id": "ex-w4-d6-1",
    "session_id": "session-w4-d6",
    "name": "Warm-Up & Movement Clearance [20 Mins]",
    "category": "Warm-up",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "** Basic joint flossing and foam rolling."
  },
  {
    "id": "ex-w4-d6-2",
    "session_id": "session-w4-d6",
    "name": "Rotator Cuff Blood Flow Influx [25 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w4-d6-3",
    "session_id": "session-w4-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 2,
    "reps_or_duration": "12 reps",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Light band-loaded external rotations and serratus presses \u2013 2 sets \u00d7 12 reps. No failure parameters."
  },
  {
    "id": "ex-w4-d6-4",
    "session_id": "session-w4-d6",
    "name": "Lower Body Restoration Sling [25 Mins]",
    "category": "Rest",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w4-d6-5",
    "session_id": "session-w4-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 2,
    "reps_or_duration": "10 reps",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Unweighted single-leg hinges and gentle glute bridges \u2013 2 sets \u00d7 10 reps."
  },
  {
    "id": "ex-w4-d6-6",
    "session_id": "session-w4-d6",
    "name": "Posterior Posture Alignment [20 Mins]",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "**"
  },
  {
    "id": "ex-w4-d6-7",
    "session_id": "session-w4-d6",
    "name": "Exercises",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 6",
    "rest": "Self-paced",
    "notes": "* Face-pulls using very light cable loads and child's pose breathing sequences."
  },
  {
    "id": "ex-w4-d7-1",
    "session_id": "session-w4-d7",
    "name": "Protocol",
    "category": "Climbing",
    "sets": 1,
    "reps_or_duration": "1 set",
    "intensity": "RPE 1",
    "rest": "Self-paced",
    "notes": "* Complete systemic recovery to allow supercompensation to materialize before launching into **Month 2: Basic Strength**."
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
  const CURRENT_VERSION = "2.2";
  const storedVersion = localStorage.getItem("onus_db_version");
  if (storedVersion !== CURRENT_VERSION) {
    // Clear all onus-related localStorage entries to force clean re-seeding
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith("onus_"));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.setItem("onus_db_version", CURRENT_VERSION);
  }
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
