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
  { id: "phase-5", program_id: "prog-6m", title: "Month 5: Power Endurance Phase", phase_order: 5 }
];

const DEFAULT_WEEKS = [];
const DEFAULT_SESSIONS = [];
const DEFAULT_EXERCISES = [];

// Dynamic workout generator for Months 1-5
function generateWorkouts() {
  // Generate weeks
  for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
    const phaseId = `phase-${phaseNum}`;
    for (let w = 1; w <= 4; w++) {
      const weekNum = (phaseNum - 1) * 4 + w;
      DEFAULT_WEEKS.push({
        id: `week-${weekNum}`,
        phase_id: phaseId,
        week_number: w
      });
    }
  }

  // Generate sessions and exercises
  for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
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
              { name: "Warm-up & Ramp", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 6", rest: "None", notes: "Standard Prep Container + Tindeq MVC neural screening." },
              { name: "Core Driver", category: "Core Driver", sets: probs, reps_or_duration: `${probs} problems`, intensity: "RPE 6", rest: rest, notes: isDeload ? "Core Driver: Cut volume by 50%. Run easy vertical bouldering." : `Core Driver: Execute ${probs} unique vertical to gentle overhanging problems. Rest strictly ${rest} between problems.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Progress Hook: Friction & Foot-Volume Coordination. Direct center-of-mass matching on large sloper volumes." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 2, reps_or_duration: "2 sets", intensity: "RPE 6", rest: "Self-paced", notes: "Chiba Tore Diagonal Core & Ankle Spring: Supine hand-to-toe touches, Single-hand elevated scapular push-ups, and weighted pogo jumps." }
            ];
          } else if (phaseNum === 2) {
            title = "Advanced Board Climbing & Tension Syntax";
            objective = "Board climbing on steep angles focusing on full body tension.";
            intensity = 8;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            let rest = w === 1 ? "3 minutes" : w === 2 ? "2.5 minutes" : w === 3 ? "2 minutes" : "3 minutes";
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "Standard Prep Container + Tindeq MVC neural screening." },
              { name: "Core Driver", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} climbs`, intensity: "RPE 8", rest: rest, notes: isDeload ? "Core Driver: Cut volume by 50%." : `Core Driver: Complete ${climbs} board climbs. Rest ${rest} between burns.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Progress Hook: 1% Capillary Booster & Rotational Core. ARC bouldering with 3s hover cues." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 2, reps_or_duration: "2 sets", intensity: "RPE 6", rest: "Self-paced", notes: "Unilateral Scapular control & Ankle Springs: Single-hand elevated scap pushups, dips, and Weighted Pogo jumps." }
            ];
          } else if (phaseNum === 3) {
            title = "High-Neural / Absolute Limit Bouldering";
            objective = "Maximum recruitment limit projecting on steep system boards.";
            intensity = 9;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            let rest = w === 1 ? "4 minutes" : w === 2 ? "4 minutes" : w === 3 ? "5 minutes" : "4 minutes";
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep container + Tindeq MVC neural screening." },
              { name: "Core Driver", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} attempts`, intensity: "RPE 9.5", rest: rest, notes: isDeload ? "Core Driver: Cut attempts by 50%." : `Core Driver: Project ${climbs} climbs. Rest ${rest} between burns.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Progress Hook: Capacity Preservation. Vertical ARC climbing with hover cues." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 2, reps_or_duration: "2 sets", intensity: "RPE 6", rest: "Self-paced", notes: "Chiba Tore Core & Antagonist: Supine hand-to-toe touches and single-hand elevated scapular pushups." }
            ];
          } else if (phaseNum === 4) {
            title = "High-Neural / Dynamic Power Board";
            objective = "Explosive coordination jumps and running dynos on system board.";
            intensity = 9;
            let climbs = w === 1 ? 8 : w === 2 ? 10 : w === 3 ? 12 : 10;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container + Tindeq MVC neural screening." },
              { name: "Core Driver", category: "Core Driver", sets: climbs, reps_or_duration: `${climbs} attempts`, intensity: "RPE 9", rest: "3-4 mins", notes: isDeload ? "Core Driver: Cut dynamic burns by 50%." : `Core Driver: Complete ${climbs} dynamic coordination climbs. Rest 3-4 mins.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "Progress Hook: Force Ceiling Defense. 2 pulls against force gauge at 90% MVC before climbing, then weighted pull-ups." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 2, reps_or_duration: "2 sets", intensity: "RPE 6", rest: "Self-paced", notes: "Chiba Tore Core & Ankle Springs: Supine hand-to-toe touches and weighted pogo jumps." }
            ];
          } else if (phaseNum === 5) {
            title = "High-Neural Trigger into Lactic Capacity";
            objective = "Lactic tolerance circuit blocks to survive forearm pump.";
            intensity = 9;
            let blocks = w === 1 ? 4 : w === 2 ? 4 : w === 3 ? 5 : 2;
            let climbs = w === 1 ? 4 : w === 2 ? 5 : w === 3 ? 4 : 4;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "Standard Prep container + Tindeq screening." },
              { name: "Core Driver", category: "Core Driver", sets: blocks, reps_or_duration: `${blocks} blocks of ${climbs} climbs`, intensity: "RPE 9", rest: "45s/4m", notes: isDeload ? "Core Driver: Eliminate lactic circuits. Rest 3m between easy climbs." : `Core Driver: Complete ${blocks} blocks of ${climbs} climbs back-to-back. Rest 45s between climbs, 4m between blocks.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 2, reps_or_duration: "2 attempts", intensity: "RPE 9.5", rest: "Self-paced", notes: "Progress Hook: Neuro-Power Trigger. Execute 2 max-velocity limit board attempts at the absolute start while fresh." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Forearm Flush & Core: Rice bucket hand drills, pen rolling, and supine hand-to-toe touches." }
            ];
          }
        } else if (d === 2) {
          // DAY 2 (Mobility/PT Day)
          sessionType = "mobility";
          duration = 120;
          intensity = 3;
          title = phaseNum === 5 ? "Technique Under Pump & Recovery" : "Physical Therapy Core & Recovery";
          objective = "Nasal breathing flush and active joint range checks.";
          let plankSecs = w === 1 ? 45 : w === 2 ? 50 : w === 3 ? 60 : 30;
          exercises = [
            { name: "Aerobic Influx Flush", category: "General", sets: 1, reps_or_duration: "30 Mins", intensity: "RPE 3", rest: "None", notes: "Continuous steady-state nasal breathing jogging or cycling (<140 BPM)." },
            { name: "Climbing-Specific PT Core", category: "Core", sets: 3, reps_or_duration: "3 sets", intensity: "RPE 3", rest: "None", notes: `Cable Pallof presses (10 reps), side planks (${plankSecs}s/side), Swiss-ball rollouts/Stir-the-Pot, and Seated Contra-Lateral Leg Raises.` },
            { name: "Deep Shoulder & Spine Mobility", category: "Mobility", sets: 1, reps_or_duration: "50 Mins", intensity: "RPE 3", rest: "None", notes: "Thoracic extensions over foam roller, sleeper stretches, prone YTWLs, puppy pose lat stretches, and spine twists." }
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
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 6", rest: "None", notes: "Standard Prep Container + Tindeq MVC screening." },
              { name: "Core Driver", category: "Core Driver", sets: 3, reps_or_duration: "3 sets x 8 reps", intensity: "RPE 7", rest: "2 mins", notes: isDeload ? "Core Driver: Cut resistance reps by 50%." : "Core Driver: Weighted pull-ups, dumbbell floor presses, barbell rows, and Heels-Elevated Weighted Squats." },
              { name: "Progress Hook", category: "Progress Hook", sets: 6, reps_or_duration: "6 reps x 10s", intensity: "RPE 6", rest: "50 seconds", notes: isDeload ? "Progress Hook: Eliminated." : "Progress Hook: Active Overcoming Isometrics: 10s active pulls against Tindeq gauge at 95% MVC." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Balance & Plyos: Extensor bands, wrist roller rolls, forearm self-massage, and Depth Jumps." }
            ];
          } else if (phaseNum === 2) {
            title = "Heavy Compound Strength & Overcoming Finger Pulls";
            objective = "Neurological recruitment overload and edge pulling.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "Standard Prep container + Tindeq MVC screening." },
              { name: "Core Driver", category: "Core Driver", sets: 4, reps_or_duration: "4 sets x 6 reps", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Core Driver: Cut reps in half." : "Core Driver: Weighted pull-ups, barbell rows, dumbbell floor presses, and strict hanging L-sits." },
              { name: "Progress Hook", category: "Progress Hook", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 8", rest: "53 seconds", notes: isDeload ? "Progress Hook: Eliminated." : "Progress Hook: Overcoming Isometric pulls against Tindeq gauge at 85%-90% MVC." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Care & Plyometrics: Forearm rolling, wrist curls, and Depth Jumps to Max Box jumps." }
            ];
          } else if (phaseNum === 3) {
            title = "Compound Max Strength & Max Fingerboard";
            objective = "Maximum neuromuscular force compound resistance training.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container + Tindeq MVC screening." },
              { name: "Core Driver", category: "Core Driver", sets: 4, reps_or_duration: "4 sets x 5 reps", intensity: "RPE 9", rest: "3-4 mins", notes: isDeload ? "Core Driver: Cut sets/reps by 50%." : "Core Driver: Heavy weighted pull-ups, heavy dumbbell floor presses, barbell rows, and Heels-Elevated weighted squats." },
              { name: "Progress Hook", category: "Progress Hook", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 9", rest: "3 mins", notes: isDeload ? "Progress Hook: Eliminated." : "Progress Hook: Max Edge Overcoming Pulls against Tindeq gauge at 95% MVC." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Balance & Plyos: Extensor bands, wrist rolls, and Depth Jumps to Max Vertical Vector." }
            ];
          } else if (phaseNum === 4) {
            title = "Fingerboard Structural & Gym Power/Plyos";
            objective = "Rapid Rate of Force Development campus bumps and edge pulls.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container + Tindeq MVC screening." },
              { name: "Core Driver", category: "Core Driver", sets: 5, reps_or_duration: "5 reps x 7s", intensity: "RPE 9", rest: "4 mins", notes: isDeload ? "Core Driver: Cut volume by 50%." : "Core Driver: Fingerboard recruitment active pulls at 90% MVC + Campus board bumps." },
              { name: "Progress Hook", category: "Progress Hook", sets: 3, reps_or_duration: "3 sets x 5 reps", intensity: "RPE 8", rest: "Self-paced", notes: "Progress Hook: Compound Strength Retention. Dumbbell overhead press, goblet squats, face-pulls." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Balance & Plyo: Forearm rolling, extensor bands, and Depth Jumps to Max Vertical Box Jumps." }
            ];
          } else if (phaseNum === 5) {
            title = "High-Fatigue Link Sessions & Lifting";
            objective = "Linked sport bouldering loops under local exhaustion.";
            intensity = 9;
            let reps = w === 1 ? 5 : w === 2 ? 6 : w === 3 ? 7 : 3;
            let moves = w === 1 ? 25 : w === 2 ? 30 : w === 3 ? 35 : 15;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep container + Tindeq screening." },
              { name: "Core Driver", category: "Core Driver", sets: reps, reps_or_duration: `${reps} links`, intensity: "RPE 9", rest: "3 mins", notes: isDeload ? "Core Driver: Cut reps by 50%." : `Core Driver: High-Fatigue Link Sessions: Climb overlapping sport climb segments. Link two blocks of moves together with 10s shakeout on wall. Total ${moves} moves.` },
              { name: "Progress Hook", category: "Progress Hook", sets: 3, reps_or_duration: "3 sets x 5 reps", intensity: "RPE 8", rest: "Self-paced", notes: "Progress Hook: Base Strength Maintenance. Weighted pull-ups and heavy squats." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Balance & Plyos: Depth Jumps, forearm rolling, extensor bands." }
            ];
          }
        } else if (d === 4) {
          // DAY 4 (Asynchronous Recovery Selector)
          sessionType = "mobility";
          duration = 180;
          intensity = 1;
          title = "Asynchronous Recovery Selector";
          objective = "Active flush or passive rest selector.";
          exercises = [
            { name: "Option A: Active Flush", category: "Mobility", sets: 1, reps_or_duration: "1 set", intensity: "RPE 3", rest: "Self-paced", notes: "Re-execute Day 2's deep mobility and PT core container." },
            { name: "Option B: Passive Rest", category: "General", sets: 1, reps_or_duration: "1 set", intensity: "RPE 1", rest: "Self-paced", notes: "Complete off-load. Zero physical stress to repair skin calluses and finger pulley networks." }
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
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 6", rest: "None", notes: "Standard Prep Container + Tindeq screening." },
              { name: "Core Driver", category: "Core Driver", sets: 12, reps_or_duration: "12-15 problems", intensity: "RPE 6", rest: "2 mins", notes: isDeload ? "Core Driver: Cut volume by 50%." : "Core Driver: Clear 12-15 easy vertical/slab grade problems. Rest 2 mins." },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Progress Hook: Eccentric Down-Climbing. Climb up a low-tier problem and completely down-climb using identical foot coordinates." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Postural Realignment & Scapular Release: Cat & Camel, Spine Rolls, passive overhead Hang Right holds." }
            ];
          } else if (phaseNum === 2) {
            title = "Modern Dynamic Coordination Volumes";
            objective = "Comp-style coordination dynos and foot-volume jumps.";
            intensity = 7;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 7", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Core Driver", category: "Core Driver", sets: 10, reps_or_duration: "10-12 problems", intensity: "RPE 7", rest: "2 mins", notes: isDeload ? "Core Driver: Cut volume by 50%." : "Core Driver: Complete 10-12 comp coordination problems. Rest 2 mins." },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 7", rest: "Self-paced", notes: "Progress Hook: Under-Pump Coordination repeats. Run 8 flash problems on overhanging terrain." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Hamstring & Ankle Restoration: Resisted ankle dorsiflexion, foam rolling, and toes-on-edge bridges." }
            ];
          } else if (phaseNum === 3) {
            title = "High-Velocity Board Work & Power";
            objective = "Dynamic launches and contact catches on steep boards.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Core Driver", category: "Core Driver", sets: 8, reps_or_duration: "8-10 problems", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Core Driver: Cut dynamic volume by 50%." : "Core Driver: Complete 8-10 dynamic climbs on steep board. Pelvic launch, straight-arm stacking." },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 7", rest: "Self-paced", notes: "Progress Hook: Under-Pump Technical Repeats. 6 flash problems on overhanging terrain." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Forearm Decompression: Rice bucket hand drills, pen rolling, and flexor massage." }
            ];
          } else if (phaseNum === 4) {
            title = "Speed & Contact Bouldering";
            objective = "Speed-centric coordination moves and bouldering volume.";
            intensity = 8;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Core Driver", category: "Core Driver", sets: 10, reps_or_duration: "10-12 problems", intensity: "RPE 8", rest: "3 mins", notes: isDeload ? "Core Driver: Cut volume by 50%." : "Core Driver: Complete 10-12 speed coordination climbs, focus on running dynos (Tomoa skip)." },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "Progress Hook: Under-Pump Coordination repeats. 8 flash problems on overhangs." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Antagonist Decompression: Wrist extensor bands, tennis-ball pec release, passive centrated Hang Right shoulder hangs." }
            ];
          } else if (phaseNum === 5) {
            title = "Power Endurance Peak Overload (4x4s)";
            objective = "4x4 interval capacity overloading blocks.";
            intensity = 9;
            exercises = [
              { name: "Warm-up & Prep", category: "Warm-up & Prep", sets: 1, reps_or_duration: "10 Mins", intensity: "RPE 8", rest: "None", notes: "Standard Prep Container with screening." },
              { name: "Core Driver", category: "Core Driver", sets: 4, reps_or_duration: "4 blocks of 4 climbs", intensity: "RPE 9", rest: "4 mins", notes: isDeload ? "Core Driver: Eliminate 4x4s. Run easy climbs." : "Core Driver: Run 4x4 boulder intervals. Choose 4 distinct problems. Climb them back-to-back with no rest." },
              { name: "Progress Hook", category: "Progress Hook", sets: 1, reps_or_duration: "1 set", intensity: "RPE 8", rest: "Self-paced", notes: "Progress Hook: Friction Coordination Repeats. Slab volume stepping drills under pump." },
              { name: "Care & Restoration", category: "Care & Restoration", sets: 1, reps_or_duration: "1 set", intensity: "RPE 6", rest: "Self-paced", notes: "Gentle Posture Decompression: Cat & Camel, Spine Rolls, and passive overhead hangs." }
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
            { name: "Rotator Cuff & Scapular Base Grid", category: "Mobility", sets: 3, reps_or_duration: "3 sets", intensity: "RPE 6", rest: "None", notes: "Prone unweighted Y-T-W-L positions (10 reps) paired with wall slides (10 reps) to promote scapular upward rotation." },
            { name: reverseLungesName, category: "Strength", sets: 3, reps_or_duration: "3 sets", intensity: "RPE 6", rest: "None", notes: reverseLungesNotes },
            { name: "Anti-Extension Trunk Stability", category: "Core", sets: 3, reps_or_duration: "3 sets x 12 reps", intensity: "RPE 6", rest: "None", notes: "Deadbugs paired with slow planks or ab-wheel rollouts." }
          ];
        } else if (d === 7) {
          // DAY 7 (Rest Day)
          sessionType = "rest";
          duration = 180;
          intensity = 1;
          title = "Absolute Rest Day";
          objective = "* Complete central nervous system off-load.";
          exercises = [
            { name: "Absolute Reset", category: "General", sets: 1, reps_or_duration: "1 set", intensity: "RPE 1", rest: "Self-paced", notes: "Zero training parameters tracked. CNS and skin reset." }
          ];
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
  const CURRENT_VERSION = "2.9";
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
