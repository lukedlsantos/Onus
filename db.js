/**
 * db.js
 * Mock database service mirroring future Supabase structures.
 * Uses localStorage for persistence. All calls return Promises to simulate async network operations.
 */

// Fallback for non-browser environments (e.g. Vercel serverless build/runtime)
if (typeof localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
}


// Seed Data
const DEFAULT_PROFILES = [
  {
    id: "ath-1",
    email: "athlete@example.com",
    role: "athlete",
    full_name: "Alex Honnold",
    telegram_username: "alex_climbs",
    telegram_link: "https://t.me/+2HunNy7a_XpiZTg1",
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
    telegram_link: "https://t.me/+2HunNy7a_XpiZTg1",
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
  { id: "phase-1", program_id: "prog-6m", title: "Month 1: Capacity & Base Phase", phase_order: 1 },
  { id: "phase-2", program_id: "prog-6m", title: "Month 2: Basic Strength Phase", phase_order: 2 },
  { id: "phase-3", program_id: "prog-6m", title: "Month 3: Max Strength Phase", phase_order: 3 },
  { id: "phase-4", program_id: "prog-6m", title: "Month 4: Power Phase", phase_order: 4 },
  { id: "phase-5", program_id: "prog-6m", title: "Month 5: Power Endurance Phase", phase_order: 5 },
  { id: "phase-6", program_id: "prog-6m", title: "Month 6: Performance & Peak Phase", phase_order: 6 }
];

const DEFAULT_WEEKS = [];
const DEFAULT_SESSIONS = [];
const DEFAULT_EXERCISES = [];

// Dynamic workout generator for Months 1-6
function generateWorkouts() {
  // Generate weeks
  for (let phaseNum = 1; phaseNum <= 6; phaseNum++) {
    const phaseId = `phase-${phaseNum}`;
    for (let w = 1; w <= 4; w++) {
      const weekNum = (phaseNum - 1) * 4 + w;
      DEFAULT_WEEKS.push({
        id: `week-${weekNum}`,
        phase_id: phaseId,
        week_number: weekNum
      });
    }
  }

  // Generate sessions and exercises
  for (let phaseNum = 1; phaseNum <= 6; phaseNum++) {
    const phaseId = `phase-${phaseNum}`;
    for (let w = 1; w <= 4; w++) {
      const weekNum = (phaseNum - 1) * 4 + w;
      const isDeload = (w === 4);
      const weekId = `week-${weekNum}`;

      for (let d = 1; d <= 7; d++) {
        const sessionId = `session-w${weekNum}-d${d}`;
        const dayLabel = `Day ${d}`;
        let title = "";
        let objective = "";
        let sessionType = "";
        let duration = 180;
        let intensity = 6;
        let exercises = [];

        if (d === 1) {
          // DAY 1 (Board/Climbing Day)
          sessionType = "climbing";
          duration = 180;
          if (phaseNum === 1) {
            title = "High-Volume Base & ARC Construction";
            objective = "Aerobic capacity training with continuous on-wall movement.";
            intensity = 5;
            let probs = w === 1 ? 20 : w === 2 ? 22 : w === 3 ? 25 : 10;
            let rest = w === 1 ? "90 seconds" : w === 2 ? "75 seconds" : w === 3 ? "60 seconds" : "None";
            exercises = [
              { name: "Warm-up & Ramp", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 6", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Aerobic Regeneration Circuits (ARC)", category: "Core Driver", sets: probs, reps_or_duration: `${probs} problems`, intensity: "RPE 6", rest: rest, notes: isDeload ? "Cut volume by 50%. Run easy vertical bouldering." : `Execute ${probs} unique vertical to gentle overhanging problems. Rest strictly ${rest} between problems.` },
              { name: "Slab and Dynamic Slab", category: "Progress Hook", sets: 3, reps_or_duration: "3 reps (1 climb/route)", intensity: "RPE 6", rest: "1 min", notes: "Intentionally direct center of mass to negative volumes or no-tex holds. 1 rep = 1 climb or route." },
              { name: "Diagonal Sling & Reactive Ankle Integration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets to failure Supine Hand-to-Toe Touches (Strict V-ups)\n2 sets x 10 reps Single-Hand Elevated Scapular Push-ups (Or both hands if too hard)\n2 sets x 15 reps per side Weighted Pogo Jumps" }
            ];
          } else if (phaseNum === 2) {
            title = "Advanced Board Climbing & Tension Syntax";
            objective = "Board climbing on steep angles focusing on full body tension.";
            intensity = 8;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            let rest = w === 1 ? "3 minutes" : w === 2 ? "2.5 minutes" : w === 3 ? "2 minutes" : "3 minutes";
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Advanced Board Climbing & Tension Syntax", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} climbs`, intensity: "RPE 8", rest: rest, notes: isDeload ? "Cut volume by 50%." : `Complete ${climbs} board climbs. Rest ${rest} between burns.` },
              { name: "1% Capillary Booster & Rotational Core", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "ARC bouldering with 3s hover cues." },
              { name: "Unilateral Scapular Control & Ankle Springs", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 8 reps Single-Hand Elevated Scap Push-ups\n2 sets x 8 reps Dips\n2 sets x 20 reps Weighted Pogo Jumps" }
            ];
          } else if (phaseNum === 3) {
            title = "High-Neural / Absolute Limit Bouldering";
            objective = "Maximum recruitment limit projecting on steep system boards.";
            intensity = 9;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            let rest = w === 1 ? "4 minutes" : w === 2 ? "4 minutes" : w === 3 ? "5 minutes" : "4 minutes";
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "High-Neural / Absolute Limit Bouldering", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} attempts`, intensity: "RPE 9.5", rest: rest, notes: isDeload ? "Cut attempts by 50%." : `Project ${climbs} climbs. Rest ${rest} between burns.` },
              { name: "Capacity Preservation", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Vertical ARC climbing with hover cues." },
              { name: "Chiba Tore Core & Antagonist", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 10 reps Supine Hand-to-Toe Touches\n2 sets x 8 reps Single-Hand Elevated Scapular Push-ups" }
            ];
          } else if (phaseNum === 4) {
            title = "High-Neural / Dynamic Power Board";
            objective = "Explosive coordination jumps and running dynos on system board.";
            intensity = 9;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "High-Neural / Dynamic Power Board", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} attempts`, intensity: "RPE 9", rest: "3-4 mins", notes: isDeload ? "Cut dynamic burns by 50%." : `Complete ${climbs} dynamic coordination climbs. Rest 3-4 mins.` },
              { name: "Force Ceiling Defense", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "2 max-effort 5s dead-hangs on 20mm edge at RPE 9 before climbing, then weighted pull-ups." },
              { name: "Chiba Tore Core & Ankle Springs", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 10 reps Supine Hand-to-Toe Touches\n2 sets x 20 reps Weighted Pogo Jumps" }
            ];
          } else if (phaseNum === 5) {
            title = "High-Neural Trigger into Lactic Capacity";
            objective = "Lactic tolerance circuit blocks to survive forearm pump.";
            intensity = 9;
            let blocks = w === 1 ? 4 : w === 2 ? 4 : w === 3 ? 5 : 2;
            let climbs = w === 1 ? 4 : w === 2 ? 5 : w === 3 ? 4 : 4;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Lactic Circuits & Capacity (4x4s)", category: "Core Driver", sets: blocks, reps_or_duration: `${blocks} blocks of ${climbs} climbs`, intensity: "RPE 9", rest: "45s/4m", notes: isDeload ? "Eliminate lactic circuits. Rest 3m between easy climbs." : `Complete ${blocks} blocks of ${climbs} climbs back-to-back. Rest 45s between climbs, 4m between blocks.` },
              { name: "Neuro-Power Trigger", category: "Progress Hook", sets: 2, reps_or_duration: "2 attempts", intensity: "RPE 9.5", rest: "Self-paced", notes: "Execute 2 max-velocity limit board attempts at the absolute start while fresh." },
              { name: "Forearm Flush & Core Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 60s Rice Bucket Hand Drills\n2 sets x 30s Pen Rolling\n2 sets x 10 reps Supine Hand-to-Toe Touches" }
            ];
          } else if (phaseNum === 6) {
            title = "Peaking / Limit Projecting Session";
            objective = "Maximum quality projecting and mock competition send simulations.";
            intensity = 10;
            let projects = w === 4 ? 3 : 5;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Limit Projecting & Send Simulation", category: "Core Driver", sets: projects, reps_or_duration: `${projects} projects`, intensity: "RPE 10", rest: "5 mins", notes: isDeload ? "Cut projecting intensity and attempts by 50%." : `Attempt ${projects} limit bouldering projects. Give 100% effort per attempt. Rest at least 5 minutes between burns.` },
              { name: "Supercompensation Flush", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 5", rest: "Self-paced", notes: "15 mins of very easy movement on vertical terrain." },
              { name: "Posture Decompression & Core", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 5", rest: "Self-paced", notes: "2 sets x 10 reps Cat & Camel\n2 sets x 8 reps Hanging Leg Raises\n2 sets x 30s Passive Overhead Hangs" }
            ];
          }
        } else if (d === 2) {
          // DAY 2 (Mobility/PT Day)
          sessionType = "mobility";
          duration = 120;
          intensity = 3;
          title = (phaseNum === 5 || phaseNum === 6) ? "Technique Under Pump & Recovery" : "Physical Therapy Core & Recovery";
          objective = "Nasal breathing flush and active joint range checks.";
          let plankSecs = w === 1 ? 45 : w === 2 ? 50 : w === 3 ? 60 : 30;
           exercises = [
            { name: "Cardio Work (30 mins)", category: "General", sets: 1, reps_or_duration: "30 Mins", intensity: "RPE 3", rest: "None", notes: "Continuous zone 2 to zone 4 cardio work (Swimming, biking, running) with steady-state nasal breathing." },
            { name: "Climbing-Specific PT Core", category: "Core", sets: 1, reps_or_duration: "1 set", intensity: "RPE 3", rest: "None", notes: `Climbing-Specific PT Core:\n3 sets x 10 reps per side Cable Pallof Presses\n3 sets x ${plankSecs}s Side Planks (each side)\n3 sets x 10 reps Swiss-Ball Rollouts / Stir-the-Pot\n3 sets x 10 reps Seated Contra-Lateral Leg Raises` },
            { name: "Deep Shoulder & Spine Mobility", category: "Mobility", sets: 1, reps_or_duration: "1 set", intensity: "RPE 3", rest: "None", notes: "2 sets x 60s Thoracic Extensions Over Foam Roller\n2 sets x 30s Sleeper Stretches (each side)\n2 sets x 10 reps Prone Y Extensions\n2 sets x 10 reps Prone T Extensions\n2 sets x 10 reps Prone W Extensions\n2 sets x 10 reps Prone L Extensions\n2 sets x 30s Puppy Pose Lat Stretches\n2 sets x 30s Spine Twists (each side)" },
            { name: "Antagonist Isometric Holds", category: "Isometrics", sets: 1, reps_or_duration: "1 set", intensity: "RPE 7", rest: "2 mins", notes: "2 sets x 30s Supinated Wrist Holds (RPE 7/10 target intensity, keep forearm supported flat)\n2 sets x 30s Pronated Wrist Holds (RPE 7/10 target intensity, keep forearm supported flat)" }
          ];
        } else if (d === 3) {
          // DAY 3 (Off-Wall Strength / Fingerboard)
          sessionType = "strength";
          duration = 180;
          intensity = 7;
          if (phaseNum === 1) {
            title = "Baseline Functional Hypertrophy & Fingerboard Loading";
            objective = "Off-wall compound resistance and finger edge conditioning.";
            exercises = [
              { name: "Off-Wall Prep Container & Edge Activation", category: "Warm-up & Prep", sets: 1, reps_or_duration: "None", intensity: "RPE 6", rest: "None", notes: "1 set Spine & Thoracic Mobilization: 3 half-circles, 15 passes foam rolling thoracic, 10 Spine Waves.\n1 set Scapular & Rotator Cuff Activation: 12 passes band dislocates, 10 Serratus wall slides, 8 prone Y-T-W-L positions.\n1 set Lower Chain Mobility: 10 dynamic 90-90 hip switches, 8 hip CARs/side, 12 resisted dorsiflexion ankle wall-touches.\n3 sets x 3 hangs Submaximal Edge Activation: 2-3 submaximal hangs or pulls on fingerboard at 50% and 75% effort." },
              { name: "Compound Strength Overload", category: "Core Driver", sets: 3, reps_or_duration: "None", intensity: "RPE 7", rest: "None", notes: isDeload ? "Cut resistance reps by 50%." : "3 sets x 8 reps Strict Weighted Pull-Ups (assisted if needed). Focus on clean scapular retraction.\n3 sets x 8 reps Dumbbell Floor Presses. Capsule protection: Keep elbows tucked at 45 degrees relative to torso.\n3 sets x 8 reps Barbell Rows. Maintain neutral spine posture.\n3 sets x 8 reps Heels-Elevated Weighted Squats. Elevate heels on wedges, descend into deep squat control." },
              { name: "Active Overcoming Isometrics", category: "Progress Hook", sets: 6, reps_or_duration: "6 reps x 10s", intensity: "RPE 9", rest: "50 seconds", notes: isDeload ? "Progress Hook: Eliminated." : "Perform 10-second active maximum-effort concentric pulls against an immovable fixed block (Tindeq gauge).\n\n*FALLBACK PROTOCOL:* If no Tindeq gauge or fixed block is available, execute 10-second active dead-hangs on a 20mm edge at RPE 9." },
              { name: "Antagonist Balance & Plyos", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 20 reps Extensor Bands: Antagonist finger extension balance.\n2 sets x 15 reps Wrist Roller Rolls: Forearm extensors.\n2 sets x 60s Forearm Flexor Self-Massage: Decompress tight forearm tissue.\n3 sets x 5 reps Depth Jumps to Max Vertical Vector: Quick ground contact to build reactive power." }
            ];
          } else if (phaseNum === 2) {
            title = "Heavy Compound Strength & Overcoming Finger Pulls";
            objective = "Neurological recruitment overload and edge pulling.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Max Off-Wall Compound Overload", category: "Core Driver", sets: 4, reps_or_duration: "4 sets x 6 reps", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Cut reps in half." : "Weighted pull-ups, barbell rows, dumbbell floor presses, and strict hanging L-sits." },
              { name: "Overcoming Isometric Pulls", category: "Progress Hook", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 8", rest: "53 seconds", notes: isDeload ? "Progress Hook: Eliminated." : "Progress Hook: Overcoming Isometric Pulls: 7s max-effort dead-hangs on 20mm edge at RPE 8-9." },
              { name: "Antagonist Care & Plyometric Extensions", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 60s Forearm Rolling\n2 sets x 12 reps Wrist Curls\n3 sets x 5 reps Depth Jumps to Max Box Jumps" }
            ];
          } else if (phaseNum === 3) {
            title = "Compound Max Strength & Max Fingerboard";
            objective = "Maximum neuromuscular force compound resistance training.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Compound Max Strength Overload", category: "Core Driver", sets: 4, reps_or_duration: "4 sets x 5 reps", intensity: "RPE 9", rest: "3-4 mins", notes: isDeload ? "Cut sets/reps by 50%." : "Heavy weighted pull-ups, heavy dumbbell floor presses, barbell rows, and Heels-Elevated weighted squats." },
              { name: "Max Edge Overcoming Pulls", category: "Progress Hook", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 9", rest: "3 mins", notes: isDeload ? "Progress Hook: Eliminated." : "Progress Hook: Max Edge Overcoming Pulls: 7s max-effort dead-hangs on 15mm edge at RPE 9.5." },
              { name: "Antagonist Balance & Plyos", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 20 reps Extensor Bands\n2 sets x 15 reps Wrist Rolls\n3 sets x 5 reps Depth Jumps to Max Vertical Vector" }
            ];
          } else if (phaseNum === 4) {
            title = "Fingerboard Structural & Gym Power/Plyos";
            objective = "Rapid Rate of Force Development campus bumps and edge pulls.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Fingerboard Structural & Gym Power/Plyos", category: "Core Driver", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 9", rest: "4 mins", notes: isDeload ? "Cut volume by 50%." : "Fingerboard recruitment max-effort dead-hangs at RPE 9 + Campus board bumps." },
              { name: "Compound Strength Retention", category: "Progress Hook", sets: 3, reps_or_duration: "3 sets x 5 reps", intensity: "RPE 8", rest: "Self-paced", notes: "Dumbbell overhead press, goblet squats, face-pulls." },
              { name: "Antagonist Balance & Plyo", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 60s Forearm Rolling\n2 sets x 20 reps Extensor Bands\n3 sets x 5 reps Depth Jumps to Max Vertical Box Jumps" }
            ];
          } else if (phaseNum === 5) {
            title = "High-Fatigue Link Sessions & Lifting";
            objective = "Linked sport bouldering loops under local exhaustion.";
            intensity = 9;
            let reps = w === 1 ? 5 : w === 2 ? 6 : w === 3 ? 7 : 3;
            let moves = w === 1 ? 25 : w === 2 ? 30 : w === 3 ? 35 : 15;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "High-Fatigue Link Sessions", category: "Core Driver", sets: reps, reps_or_duration: `${reps} links`, intensity: "RPE 9", rest: "3 mins", notes: isDeload ? "Cut reps by 50%." : `Climb overlapping sport climb segments. Link two blocks of moves together with 10s shakeout on wall. Total ${moves} moves.` },
              { name: "Base Strength Maintenance", category: "Progress Hook", sets: 3, reps_or_duration: "3 sets x 5 reps", intensity: "RPE 8", rest: "Self-paced", notes: "Weighted pull-ups and heavy squats." },
              { name: "Antagonist Balance & Plyos", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "3 sets x 5 reps Depth Jumps\n2 sets x 60s Forearm Rolling\n2 sets x 20 reps Extensor Bands" }
            ];
          } else if (phaseNum === 6) {
            title = "Max Power & Peaking Fingerboard";
            objective = "High neuromuscular recruitment, low volume rate of force development.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Max Power campus & Edge Pulls", category: "Core Driver", sets: 3, reps_or_duration: "3 sets x 3 reps", intensity: "RPE 9.5", rest: "4 mins", notes: isDeload ? "Cut power work by 50%." : "Campus board 1-4-7 power pulls + 20mm edge maximum weight dead-hangs. Rest 4 mins." },
              { name: "Power Baseline Retention", category: "Progress Hook", sets: 2, reps_or_duration: "2 sets x 3 reps", intensity: "RPE 8", rest: "Self-paced", notes: "Weighted pullups and goblet squats." },
              { name: "Finger Care & Antagonist Flush", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 5", rest: "Self-paced", notes: "2 sets x 20 reps Extensor Bands\n2 sets x 60s Forearm Self-Massage" }
            ];
          }
        } else if (d === 4) {
          // DAY 4 (Active Recovery Day)
          sessionType = "recovery";
          duration = 60;
          intensity = 3;
          title = "Active Recovery Day";
          objective = "Full-body isometric maintenance focusing on wrists, fingers, shoulders, and core tension.";
          exercises = [
            { name: "Passive to Active Scapular Hangs", category: "Shoulders", sets: 3, reps_or_duration: "3 sets x 3 reps", intensity: "RPE 4", rest: "1 min", notes: "Intent: Scapular control under load.\nStructure (50s continuous hang): 5s setup -> 3 reps of [5s passive dead-hang -> 10s active hold]. Do not drop off between reps. Follow audio beeps. (Optionally add weight or do one-handed if too easy)" },
            { name: "Sub-Max Isometric Edge Hangs", category: "Fingers", sets: 3, reps_or_duration: "3 reps x 10s", intensity: "RPE 5", rest: "1 min", notes: "Intent: Condition tendon sheath pulleys and finger joints without high-neural stress.\nHang from a 20mm edge using a half-crimp or open-hand grip. Keep elbows slightly bent (active tension). Hold 10s at ~60% max effort." },
            { name: "Isometric Wrist Extension Holds", category: "Wrists", sets: 3, reps_or_duration: "3 reps x 20s", intensity: "RPE 4", rest: "45s", notes: "Intent: Strengthen wrist stabilizers and forearm flexor/extensor muscle tendons.\nHold a dumbbell or resistance band in active wrist extension (palm up or palm down) parallel to the ground against resistance. Hold 20s per side." },
            { name: "Full-Body Tension Plank", category: "Full-Body", sets: 3, reps_or_duration: "3 reps x 30s", intensity: "RPE 4", rest: "1 min", notes: "Intent: Re-enforce diagonal core tension and abdominal bracing necessary for steep walls.\nStandard forearm plank, but actively squeeze your glutes, quads, fists, and core as hard as possible to generate maximum body tension. Hold 30s." }
          ];
        } else if (d === 5) {
          // DAY 5 (Volume/Mileage Day)
          sessionType = "climbing";
          duration = 180;
          intensity = 6;
          if (phaseNum === 1) {
            title = "Low-Intensity Volume Accrual & Mileage";
            objective = "High mileage on vertical to slab terrain without pump.";
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 6", rest: "None", notes: "3-5 easy problems on vertical/slab terrain, progressively increasing wall angle and hold difficulty." },
              { name: "Low-Intensity Volume Accrual & Mileage", category: "Core Driver", sets: 12, reps_or_duration: "12-15 problems", intensity: "RPE 6", rest: "2 mins", notes: isDeload ? "Cut volume by 50%." : "Clear 12-15 easy vertical/slab grade problems. Rest 2 mins." },
              { name: "Quiet Feet Practice", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Intent: Train footwork accuracy, visual tracking, and core-to-toe load transfer under volume.\nFocus on silent, precise foot placements. Lock your eyes on the hold until your shoe is fully placed and weighted without readjusting." },
              { name: "Postural Realignment & Scapular Release", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 10 reps Cat & Camel\n2 sets x 10 reps Spine Rolls\n2 sets x 30s passive overhead Hang Right holds" }
            ];
          } else if (phaseNum === 2) {
            title = "Modern Dynamic Coordination Volumes";
            objective = "Comp-style coordination dynos and foot-volume jumps.";
            intensity = 7;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Modern Dynamic Coordination Volumes", category: "Core Driver", sets: 10, reps_or_duration: "10-12 problems", intensity: "RPE 7", rest: "2 mins", notes: isDeload ? "Cut volume by 50%." : "Complete 10-12 comp coordination problems. Rest 2 mins." },
              { name: "Under-Pump Coordination Repeats", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 7", rest: "Self-paced", notes: "Run 8 flash problems on overhanging terrain." },
              { name: "Hamstring & Ankle Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 15 reps Resisted Ankle Dorsiflexion\n2 sets x 60s Foam Rolling (hamstrings & calves)\n2 sets x 12 reps Toes-on-Edge Bridges" }
            ];
          } else if (phaseNum === 3) {
            title = "High-Velocity Board Work & Power";
            objective = "Dynamic launches and contact catches on steep boards.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "High-Velocity Board Work & Power", category: "Core Driver", sets: 8, reps_or_duration: "8-10 problems", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Cut dynamic volume by 50%." : "Complete 8-10 dynamic climbs on steep board. Pelvic launch, straight-arm stacking." },
              { name: "Under-Pump Technical Repeats", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 7", rest: "Self-paced", notes: "6 flash problems on overhanging terrain." },
              { name: "Forearm Decompression", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 60s Rice Bucket Hand Drills\n2 sets x 30s Pen Rolling\n2 sets x 60s Flexor Massage" }
            ];
          } else if (phaseNum === 4) {
            title = "Speed & Contact Bouldering";
            objective = "Speed-centric coordination moves and bouldering volume.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Speed & Contact Bouldering", category: "Core Driver", sets: 10, reps_or_duration: "10-12 problems", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Cut volume by 50%." : "Complete 10-12 speed coordination climbs, focus on running dynos (Tomoa skip)." },
              { name: "Under-Pump Coordination Repeats", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "8 flash problems on overhangs." },
              { name: "Antagonist Decompression", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 20 reps Wrist Extensor Bands\n2 sets x 60s Tennis-Ball Pec Release\n2 sets x 30s Passive Centrated Hang Right Shoulder Hangs" }
            ];
          } else if (phaseNum === 5) {
            title = "Power Endurance Peak Overload (4x4s)";
            objective = "4x4 interval capacity overloading blocks.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Power Endurance Peak Overload (4x4s)", category: "Core Driver", sets: 4, reps_or_duration: "4 blocks of 4 climbs", intensity: "RPE 9", rest: "4 mins", notes: isDeload ? "Eliminate 4x4s. Run easy climbs." : "Run 4x4 boulder intervals. Choose 4 distinct problems. Climb them back-to-back with no rest." },
              { name: "Friction Coordination Repeats", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "Slab volume stepping drills under pump." },
              { name: "Gentle Posture Decompression", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "2 sets x 10 reps Cat & Camel\n2 sets x 10 reps Spine Rolls\n2 sets x 30s Passive Overhead Hangs" }
            ];
          } else if (phaseNum === 6) {
            title = "Mock Competition & Redpoint Peaking";
            objective = "High technical complexity boulder mock competition.";
            intensity = 9;
            let projects = w === 4 ? 4 : 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Mock Competition Redpoints", category: "Core Driver", sets: projects, reps_or_duration: `${projects} attempts`, intensity: "RPE 9", rest: "5 mins", notes: isDeload ? "Cut mock comp volume by 50%." : `Attempt ${projects} commercial boulder problems at your flash/redpoint limit. Rest 5 minutes between attempts.` },
              { name: "Under-Pump Technical Repeats", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "Slab volume stepping drills under pump." },
              { name: "Postural Realignment & Release", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 5", rest: "Self-paced", notes: "2 sets x 10 reps Cat & Camel\n2 sets x 30s Passive Overhead Hangs" }
            ];
          }
        } else if (d === 6) {
          // DAY 6 (PT Gym Day)
          sessionType = "strength";
          duration = 90;
          intensity = 6;
          title = "Climbing-Specific PT Gym Session";
          objective = "Posterior kinetic chain alignment and shoulder girdle stabilization.";
          let reverseLungesName = phaseNum === 1 ? "Lower Body Alignment" : "Lower Body posterior sling";
          let reverseLungesNotes = phaseNum === 1
            ? "Bodyweight single-leg Romanian deadlifts (3 sets x 8 reps/leg) paired with slow bodyweight lunges."
            : "Pair Deficit Kettlebell Reverse Lunges (3 sets x 8 reps/leg) directly with Kettlebell Floating RDLs (3 sets x 10 reps/leg).";
          exercises = [
            { name: "Rotator Cuff & Scapular Base Grid", category: "Mobility", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "None", notes: "3 sets x 10 reps Prone Y-T-W-L Positions\n3 sets x 10 reps Wall Slides" },
            { name: reverseLungesName, category: "Strength", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "None", notes: phaseNum === 1 ? "Lower Body Alignment:\n3 sets x 8 reps Bodyweight Single-Leg Romanian Deadlifts (each leg)\n3 sets x 10 reps Slow Bodyweight Lunges" : "Lower Body Posterior Sling:\n3 sets x 8 reps Deficit Kettlebell Reverse Lunges (each leg)\n3 sets x 10 reps Kettlebell Floating RDLs (each leg)" },
            { name: "Anti-Extension Trunk Stability", category: "Core", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "None", notes: "3 sets x 12 reps Deadbugs\n3 sets x 30s Slow Planks or Ab-Wheel Rollouts" }
          ];
        } else if (d === 7) {
          // DAY 7 (Rest Day)
          sessionType = "rest";
          duration = 0;
          intensity = 1;
          title = "Absolute Rest Day";
          objective = "* Complete central nervous system off-load.";
          exercises = [
            { name: "Absolute Reset", category: "General", sets: 1, reps_or_duration: "1 set", intensity: "RPE 1", rest: "Self-paced", notes: "Zero training parameters tracked. CNS and skin reset." }
          ];
        }

        // Calculate duration dynamically based on day, phase, and load/deload status (rounded to multiples of 5)
        if (d === 1 || d === 3 || d === 5) {
          let main = 90;
          let hook = 30;
          if (phaseNum === 3) {
            main = isDeload ? 70 : 100;
            hook = isDeload ? 15 : 20;
          } else if (phaseNum === 4) {
            main = isDeload ? 65 : 95;
            hook = isDeload ? 20 : 25;
          } else if (phaseNum === 5) {
            main = isDeload ? 70 : 100;
            hook = isDeload ? 15 : 20;
          } else if (phaseNum === 6) {
            main = isDeload ? 50 : 75;
            hook = isDeload ? 10 : 15;
          } else {
            // Months 1 & 2
            main = isDeload ? 65 : 90;
            hook = isDeload ? 20 : 30;
          }
          duration = 10 + main + hook + 10; // Warmup (10m) + Core Driver + Progress Hook + Restore/PT (10m)
        } else if (d === 2) {
          duration = isDeload ? 40 : 60;
        } else if (d === 4) {
          duration = isDeload ? 30 : 45;
        } else if (d === 6) {
          duration = isDeload ? 50 : 75;
        } else if (d === 7) {
          duration = 0;
        }


        // Add generated session
        DEFAULT_SESSIONS.push({
          id: sessionId,
          week_id: weekId,
          day_label: dayLabel,
          title: title,
          objective: objective,
          session_type: sessionType,
          estimated_duration_minutes: duration,
          target_intensity: intensity,
          instructions: `Follow instructions for Week ${w} ${dayLabel} in the exercise list.`
        });

        // Add generated exercises
        exercises.forEach((ex, idx) => {
          DEFAULT_EXERCISES.push({
            id: `ex-w${weekNum}-d${d}-${idx + 1}`,
            session_id: sessionId,
            name: ex.name,
            category: ex.category,
            sets: ex.sets,
            reps_or_duration: ex.reps_or_duration,
            intensity: ex.intensity,
            rest: ex.rest,
            notes: ex.notes
          });
        });
      }
    }
  }
}

// Call generation logic immediately
generateWorkouts();

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
  const CURRENT_VERSION = "5.9";
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

  // Dynamic Month 6 & Day 4 Isometric Migration Patch
  try {
    const phasesJson = localStorage.getItem("onus_phases");
    if (phasesJson) {
      const currentPhases = JSON.parse(phasesJson);
      const hasPhase6 = currentPhases.some(p => p.id === "phase-6");
      if (!hasPhase6) {
        // 1. Add phase-6
        const phase6 = DEFAULT_PHASES.find(p => p.id === "phase-6");
        if (phase6) {
          currentPhases.push(phase6);
          localStorage.setItem("onus_phases", JSON.stringify(currentPhases));
        }

        // 2. Add Phase 6 weeks (weeks 21-24)
        const weeksJson = localStorage.getItem("onus_weeks");
        if (weeksJson) {
          const currentWeeks = JSON.parse(weeksJson);
          const p6Weeks = DEFAULT_WEEKS.filter(w => w.phase_id === "phase-6");
          p6Weeks.forEach(w => {
            if (!currentWeeks.some(cw => cw.id === w.id)) {
              currentWeeks.push(w);
            }
          });
          localStorage.setItem("onus_weeks", JSON.stringify(currentWeeks));
        }

        // 3. Add Phase 6 sessions
        const sessionsJson = localStorage.getItem("onus_sessions");
        if (sessionsJson) {
          const currentSessions = JSON.parse(sessionsJson);
          const p6Sessions = DEFAULT_SESSIONS.filter(s => s.id.startsWith("session-w21") || s.id.startsWith("session-w22") || s.id.startsWith("session-w23") || s.id.startsWith("session-w24"));
          p6Sessions.forEach(s => {
            if (!currentSessions.some(cs => cs.id === s.id)) {
              currentSessions.push(s);
            }
          });
          localStorage.setItem("onus_sessions", JSON.stringify(currentSessions));
        }

        // 4. Add Phase 6 exercises
        const exercisesJson = localStorage.getItem("onus_exercises");
        if (exercisesJson) {
          let currentExercises = JSON.parse(exercisesJson);
          const p6SessionIds = new Set(DEFAULT_SESSIONS.filter(s => s.id.startsWith("session-w21") || s.id.startsWith("session-w22") || s.id.startsWith("session-w23") || s.id.startsWith("session-w24")).map(s => s.id));
          const p6Exercises = DEFAULT_EXERCISES.filter(e => p6SessionIds.has(e.session_id));
          p6Exercises.forEach(e => {
            if (!currentExercises.some(ce => ce.id === e.id)) {
              currentExercises.push(e);
            }
          });

          // 5. Update Day 4 exercises (isometrics) for all existing weeks
          currentExercises = currentExercises.filter(e => !e.session_id.endsWith("-d4"));
          const newD4Exercises = DEFAULT_EXERCISES.filter(e => e.session_id.endsWith("-d4"));
          currentExercises.push(...newD4Exercises);

          localStorage.setItem("onus_exercises", JSON.stringify(currentExercises));
        }
        console.log("Database Migration: Successfully patched Month 6 (Phase 6) and Day 4 Isometrics into local storage.");
      }
    }
  } catch (err) {
    console.error("Database Migration Failed:", err);
  }
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
