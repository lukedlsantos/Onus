/**
 * app.js
 * Main application client script.
 * Handles state management, dynamic navigation rendering, and tab routing.
 */

import { db } from './db.js';

// Application State
const state = {
  currentUser: null,
  currentAccess: null,
  activeTab: null,
  todaySession: null
};

// Navigation Tab Configuration
const NAVIGATION_CONFIG = {
  athlete: [
    { id: 'today', label: 'Today', screen: 'screen-today', icon: `<svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { id: 'calendar', label: 'Calendar', screen: 'screen-calendar', icon: `<svg viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>` },
    { id: 'log', label: 'Log', screen: 'screen-log', icon: `<svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>` },
    { id: 'review', label: 'Review', screen: 'screen-review', icon: `<svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` },
    { id: 'resources', label: 'Resources', screen: 'screen-resources', icon: `<svg viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>` },
    { id: 'faqs', label: 'FAQs', screen: 'screen-faqs', icon: `<svg viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { id: 'profile', label: 'Profile', screen: 'screen-profile', icon: `<svg viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>` }
  ],
  admin: [
    { id: 'athletes', label: 'Athletes', screen: 'screen-athletes', icon: `<svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>` },
    { id: 'programs', label: 'Programs', screen: 'screen-programs', icon: `<svg viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>` },
    { id: 'reviews-queue', label: 'Reviews', screen: 'screen-reviews-queue', icon: `<svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` },
    { id: 'checkins', label: 'Check-ins', screen: 'screen-checkins', icon: `<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { id: 'resources', label: 'Resources', screen: 'screen-resources', icon: `<svg viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>` },
    { id: 'faqs', label: 'FAQs', screen: 'screen-faqs', icon: `<svg viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` }
  ]
};

// Initialize Application UI
async function initApp() {
  const defaultUserId = "ath-1";
  await switchUser(defaultUserId);

  document.getElementById("switch-role-btn").addEventListener("click", handleRoleSwitchToggle);
  setupSliderIndicators();

  document.getElementById("session-log-form").addEventListener("submit", handleLogSubmit);
  document.getElementById("weekly-checkin-form").addEventListener("submit", handleCheckinSubmit);
  document.getElementById("video-review-form").addEventListener("submit", handleVideoReviewSubmit);
  document.getElementById("toggle-checkin-header").addEventListener("click", toggleWeeklyCheckinForm);

  document.getElementById("log-today-btn").addEventListener("click", () => {
    switchTab("log");
    if (state.todaySession) {
      document.getElementById("log-session-select").value = state.todaySession.id;
    }
  });

  // Admin access card handlers
  document.getElementById("admin-access-form").addEventListener("submit", handleAdminAccessSubmit);
  document.getElementById("cancel-access-btn").addEventListener("click", () => {
    document.getElementById("admin-access-card").style.display = "none";
  });
}

// Verify locks and lock app if account status is expired
function verifyAccessLock() {
  const lockedScreen = document.getElementById("locked-screen");
  
  if (state.currentUser.role === "athlete" && state.currentAccess && state.currentAccess.status === "expired") {
    lockedScreen.style.display = "flex";
  } else {
    lockedScreen.style.display = "none";
  }
}

// Switch User & Update State
async function switchUser(userId) {
  state.currentUser = await db.getProfile(userId);
  state.currentAccess = await db.getAccess(userId);

  // Apply visual expired lock
  verifyAccessLock();

  const badgeEl = document.getElementById("role-badge");
  const switchBtn = document.getElementById("switch-role-btn");

  badgeEl.textContent = state.currentUser.role;
  if (state.currentUser.role === "admin") {
    badgeEl.classList.add("admin");
    switchBtn.textContent = "Switch to Athlete";
  } else {
    badgeEl.classList.remove("admin");
    switchBtn.textContent = "Switch to Coach";
  }

  renderNavigation();

  const defaultTab = NAVIGATION_CONFIG[state.currentUser.role][0];
  switchTab(defaultTab.id);

  loadResources();
  loadFAQs();
  
  if (state.currentUser.role === "athlete") {
    loadAthleteTodayScreen();
    loadProfileScreen();
    loadTrainingCalendar();
    loadVideoReviews();
    setupSessionSelectDropdown();
  } else {
    loadAdminAthletes();
    loadAdminPrograms();
    loadAdminReviewsQueue();
    loadAdminCheckins();
  }
}

// Toggle Athlete / Admin Role Switches (Simulating Auth Toggle)
async function handleRoleSwitchToggle() {
  const currentRole = state.currentUser.role;
  const nextUser = currentRole === "athlete" ? "admin-1" : "ath-1";
  await switchUser(nextUser);
}

// Render dynamic tabs depending on the active role
function renderNavigation() {
  const navContainer = document.getElementById("tab-nav-bar");
  const currentTabs = NAVIGATION_CONFIG[state.currentUser.role];

  navContainer.innerHTML = currentTabs.map(tab => `
    <button class="tab-btn" data-tab-id="${tab.id}">
      ${tab.icon}
      <span>${tab.label}</span>
    </button>
  `).join('');

  navContainer.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tabId);
    });
  });
}

// Switch current tab view visibility
function switchTab(tabId) {
  state.activeTab = tabId;
  const tabsList = NAVIGATION_CONFIG[state.currentUser.role];
  const targetTab = tabsList.find(t => t.id === tabId);

  if (!targetTab) return;

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tabId === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  
  const targetScreenEl = document.getElementById(targetTab.screen);
  if (targetScreenEl) {
    targetScreenEl.classList.add("active");
  }

  // Reload lists on routing
  if (state.currentUser.role === "athlete") {
    if (tabId === 'calendar') loadTrainingCalendar();
    else if (tabId === 'review') loadVideoReviews();
  } else {
    if (tabId === 'athletes') loadAdminAthletes();
    else if (tabId === 'programs') loadAdminPrograms();
    else if (tabId === 'reviews-queue') loadAdminReviewsQueue();
    else if (tabId === 'checkins') loadAdminCheckins();
  }
}

// Setup form range value live updates
function setupSliderIndicators() {
  const sliders = [
    { id: 'log-rpe', valId: 'rpe-val' },
    { id: 'log-fatigue', valId: 'fatigue-val' },
    { id: 'log-finger-pain', valId: 'finger-pain-val' },
    { id: 'log-skin', valId: 'skin-val' },
    { id: 'chk-energy', valId: 'chk-energy-val' },
    { id: 'chk-sleep', valId: 'chk-sleep-val' },
    { id: 'chk-stress', valId: 'chk-stress-val' },
    { id: 'chk-motivation', valId: 'chk-motivation-val' },
    { id: 'chk-finger-pain', valId: 'chk-finger-pain-val' },
    { id: 'chk-skin', valId: 'chk-skin-val' }
  ];
  sliders.forEach(slider => {
    const input = document.getElementById(slider.id);
    const label = document.getElementById(slider.valId);
    if (input && label) {
      label.textContent = input.value;
      input.addEventListener("input", (e) => {
        label.textContent = e.target.value;
      });
    }
  });
}

// Populate dropdown options
async function setupSessionSelectDropdown() {
  if (state.currentUser.role !== "athlete") return;

  const select = document.getElementById("log-session-select");
  if (!select) return;

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    select.innerHTML = `<option value="">No program assigned</option>`;
    return;
  }

  const phases = await db.getPhasesForProgram(assigned.program_id);
  let optionsHtml = '';

  for (const phase of phases) {
    const weeks = await db.getWeeksForPhase(phase.id);
    for (const week of weeks) {
      const sessions = await db.getSessionsForWeek(week.id);
      sessions.forEach(sess => {
        optionsHtml += `<option value="${sess.id}">${phase.title} (W${week.week_number}) - ${sess.day_label}: ${sess.title}</option>`;
      });
    }
  }
  select.innerHTML = optionsHtml;
}

// Load content onto Athlete dashboard
async function loadAthleteTodayScreen() {
  if (state.currentUser.role !== "athlete") return;

  const titleEl = document.getElementById("today-session-title");
  const objectiveEl = document.getElementById("today-session-objective");
  const drillContainer = document.getElementById("today-drills-container");
  const drillList = document.getElementById("today-drills-list");
  const logBtn = document.getElementById("log-today-btn");
  const phaseWeekLabel = document.getElementById("today-session-phase-week");

  const checkins = await db.getWeeklyCheckinsForAthlete(state.currentUser.id);
  const badge = document.getElementById("checkin-status-badge");
  if (checkins.length > 0) {
    badge.textContent = "Done";
    badge.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
    badge.style.color = "var(--accent-green)";
  } else {
    badge.textContent = "Start";
    badge.style.backgroundColor = "rgba(6, 182, 212, 0.15)";
    badge.style.color = "var(--accent-cyan)";
  }

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    titleEl.textContent = "No program assigned.";
    objectiveEl.textContent = "Ask your coach to assign a plan.";
    drillContainer.style.display = "none";
    logBtn.style.display = "none";
    return;
  }

  const phases = await db.getPhasesForProgram(assigned.program_id);
  if (phases.length > 0) {
    const weeks = await db.getWeeksForPhase(phases[0].id);
    if (weeks.length > 0) {
      const sessions = await db.getSessionsForWeek(weeks[0].id);
      if (sessions.length > 0) {
        const session = sessions[0];
        state.todaySession = session;

        phaseWeekLabel.textContent = `${phases[0].title} — Week ${weeks[0].week_number}`;
        titleEl.textContent = `${session.day_label}: ${session.title}`;
        objectiveEl.textContent = session.objective;
        logBtn.style.display = "block";

        const drills = await db.getExercisesForSession(session.id);
        if (drills.length > 0) {
          drillList.innerHTML = drills.map(d => `
            <div class="drill-item">
              <div class="drill-title">
                <span>${d.name}</span>
                <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 500;">${d.sets} sets</span>
              </div>
              <div class="drill-meta">Rep/Duration: ${d.reps_or_duration} | Rest: ${d.rest}</div>
              ${d.notes ? `<div class="drill-meta" style="font-style: italic; color: var(--text-muted);">Note: ${d.notes}</div>` : ''}
            </div>
          `).join('');
          drillContainer.style.display = "block";
        } else {
          drillContainer.style.display = "none";
        }
        return;
      }
    }
  }
  
  titleEl.textContent = "Rest Day";
  objectiveEl.textContent = "Enjoy your recovery.";
  drillContainer.style.display = "none";
  logBtn.style.display = "none";
}

// Load Training Calendar View
async function loadTrainingCalendar() {
  if (state.currentUser.role !== "athlete") return;

  const calendarList = document.getElementById("calendar-list");
  if (!calendarList) return;

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    calendarList.innerHTML = `<p class="text-muted">No training program assigned.</p>`;
    return;
  }

  const logs = await db.getLogsForAthlete(state.currentUser.id);
  const phases = await db.getPhasesForProgram(assigned.program_id);
  
  let calendarHtml = '';

  for (const phase of phases) {
    calendarHtml += `<h3 style="margin-top: 14px; font-size: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">${phase.title}</h3>`;
    const weeks = await db.getWeeksForPhase(phase.id);
    for (const week of weeks) {
      calendarHtml += `<h4 style="font-size: 0.85rem; color: var(--accent-cyan); margin-top: 8px;">Week ${week.week_number}</h4>`;
      const sessions = await db.getSessionsForWeek(week.id);
      
      sessions.forEach(sess => {
        const log = logs.find(l => l.session_id === sess.id);
        const status = log ? log.status : 'pending';
        
        calendarHtml += `
          <div class="calendar-day-row">
            <div class="calendar-day-info">
              <span class="calendar-day-name">${sess.day_label}: ${sess.title}</span>
              <span class="calendar-session-title">${sess.objective}</span>
            </div>
            <span class="status-badge ${status}">${status}</span>
          </div>
        `;
      });
    }
  }
  calendarList.innerHTML = calendarHtml;
}

// Handle session logs submission form
async function handleLogSubmit(e) {
  e.preventDefault();

  const logData = {
    athlete_id: state.currentUser.id,
    session_id: document.getElementById("log-session-select").value,
    status: document.getElementById("log-status").value,
    duration_minutes: parseInt(document.getElementById("log-duration").value) || 0,
    rpe: parseInt(document.getElementById("log-rpe").value) || 1,
    fatigue: parseInt(document.getElementById("log-fatigue").value) || 1,
    finger_pain: parseInt(document.getElementById("log-finger-pain").value) || 0,
    skin_condition: parseInt(document.getElementById("log-skin").value) || 5,
    video_url: document.getElementById("log-video-url").value,
    notes: document.getElementById("log-notes").value
  };

  await db.addLog(logData);

  const warningEl = document.getElementById("pain-warning");
  if (logData.finger_pain >= 5 || logData.fatigue >= 5) {
    if (warningEl) warningEl.style.display = "block";
  }

  document.getElementById("session-log-form").reset();
  setupSliderIndicators();

  document.getElementById("rpe-val").textContent = "6";
  document.getElementById("fatigue-val").textContent = "3";
  document.getElementById("finger-pain-val").textContent = "0";
  document.getElementById("skin-val").textContent = "5";

  switchTab("calendar");
}

// Collapsible Check-in form toggle
function toggleWeeklyCheckinForm() {
  const form = document.getElementById("weekly-checkin-form");
  if (form.style.display === "none") {
    form.style.display = "flex";
    form.style.flexDirection = "column";
  } else {
    form.style.display = "none";
  }
}

// Handle weekly checkin submissions
async function handleCheckinSubmit(e) {
  e.preventDefault();

  const checkinData = {
    athlete_id: state.currentUser.id,
    week_start_date: new Date().toISOString().split('T')[0],
    energy: parseInt(document.getElementById("chk-energy").value),
    sleep: parseInt(document.getElementById("chk-sleep").value),
    stress: parseInt(document.getElementById("chk-stress").value),
    motivation: parseInt(document.getElementById("chk-motivation").value),
    finger_pain: parseInt(document.getElementById("chk-finger-pain").value),
    skin_condition: parseInt(document.getElementById("chk-skin").value),
    what_felt_good: document.getElementById("chk-good").value,
    what_felt_bad: document.getElementById("chk-bad").value,
    notes: document.getElementById("chk-notes").value
  };

  await db.addWeeklyCheckin(checkinData);

  const badge = document.getElementById("checkin-status-badge");
  badge.textContent = "Done";
  badge.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
  badge.style.color = "var(--accent-green)";

  document.getElementById("weekly-checkin-form").reset();
  setupSliderIndicators();
  toggleWeeklyCheckinForm();
}

// Handle video review submissions
async function handleVideoReviewSubmit(e) {
  e.preventDefault();

  const reviewReq = {
    athlete_id: state.currentUser.id,
    video_url: document.getElementById("rev-url").value,
    storage_source: document.getElementById("rev-source").value,
    climb_grade: document.getElementById("rev-grade").value,
    wall_angle: document.getElementById("rev-angle").value,
    climb_style: document.getElementById("rev-style").value,
    athlete_question: document.getElementById("rev-question").value,
    status: "submitted"
  };

  await db.addVideoReview(reviewReq);
  document.getElementById("video-review-form").reset();
  loadVideoReviews();
}

// Load Video Reviews onto Athlete Screen
async function loadVideoReviews() {
  if (state.currentUser.role !== "athlete") return;

  const listEl = document.getElementById("video-reviews-list");
  if (!listEl) return;

  const reviews = await db.getVideoReviewsForAthlete(state.currentUser.id);

  if (reviews.length === 0) {
    listEl.innerHTML = `<p class="text-muted" style="font-size: 0.9rem;">No review requests submitted yet.</p>`;
    return;
  }

  listEl.innerHTML = reviews.map(rev => {
    let statusClass = 'pending';
    if (rev.status === 'reviewed') statusClass = 'completed';
    if (rev.status === 'needs_follow_up') statusClass = 'modified';

    return `
      <div style="padding: 12px; margin-top: 10px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 0.9rem; color: var(--accent-cyan);">${rev.climb_grade || 'Unspecified Grade'} - ${rev.climb_style || 'General Climb'}</span>
          <span class="status-badge ${statusClass}">${rev.status}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Angle: ${rev.wall_angle || 'N/A'} | Source: ${rev.storage_source}</p>
        <p style="font-size: 0.85rem; margin-top: 6px;">Q: "${rev.athlete_question || 'None'}"</p>
        <a href="${rev.video_url}" target="_blank" style="color: var(--accent-blue); font-size: 0.85rem; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Video Link &rarr;</a>
        ${rev.coach_feedback_summary ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 0.85rem;">
            <strong>Coach Feedback:</strong>
            <p style="color: var(--accent-amber);">${rev.coach_feedback_summary}</p>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   COACH / ADMIN PORTAL LOGIC
   ========================================================================== */

// Load Active Athletes Grid
async function loadAdminAthletes() {
  const container = document.getElementById("admin-athletes-list");
  if (!container) return;

  const profiles = await db.getProfiles();
  const athletes = profiles.filter(p => p.role === "athlete");
  
  let html = '';

  for (const athlete of athletes) {
    const access = await db.getAccess(athlete.id);
    const logs = await db.getLogsForAthlete(athlete.id);
    const reviews = await db.getVideoReviewsForAthlete(athlete.id);

    // Calculate Adherence rate (out of 3 seeded sessions in default program)
    const completedCount = logs.filter(l => l.status === "completed").length;
    const adherence = completedCount > 0 ? Math.round((completedCount / 3) * 100) : 0;
    
    // Find latest pain / fatigue scores
    const latestLog = logs[logs.length - 1];
    const latestPain = latestLog ? latestLog.finger_pain : 0;
    const latestFatigue = latestLog ? latestLog.fatigue : 1;

    // Check Red Flag indicators
    let hasRedFlags = false;
    let flagsList = [];

    if (latestPain >= 5) {
      hasRedFlags = true;
      flagsList.push(`High Finger Pain (${latestPain})`);
    }
    if (latestFatigue >= 5) {
      hasRedFlags = true;
      flagsList.push(`High Fatigue (${latestFatigue})`);
    }

    const pendingReviews = reviews.filter(r => r.status === "submitted").length;

    html += `
      <div style="padding: 14px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="font-size: 1.1rem; margin-bottom: 2px;">${athlete.full_name}</h3>
            <small class="text-muted">Plan: ${access ? access.plan_type.replace('_', ' ') : 'None'} | Expiry: ${access ? access.access_until : 'N/A'}</small>
          </div>
          <span class="badge ${access ? access.status : 'expired'}">${access ? access.status : 'expired'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; font-size: 0.85rem;">
          <div><strong>Adherence:</strong> ${adherence}%</div>
          <div><strong>Pending Reviews:</strong> ${pendingReviews}</div>
          <div><strong>Last Pain Log:</strong> ${latestPain}/10</div>
          <div><strong>Telegram:</strong> <a href="https://t.me/${athlete.telegram_username || ''}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">@${athlete.telegram_username || 'None'}</a></div>
        </div>

        ${hasRedFlags ? `
          <div class="alert alert-warning" style="margin-top: 10px; padding: 6px 10px; font-size: 0.8rem;">
            <strong>Red Flags:</strong> ${flagsList.join(', ')}
          </div>
        ` : ''}

        <button class="btn btn-primary manage-access-trigger" data-athlete-id="${athlete.id}" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px; width: auto;">
          Edit Access Settings
        </button>
      </div>
    `;
  }
  container.innerHTML = html;

  // Bind Manage Access buttons
  container.querySelectorAll(".manage-access-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      openAccessManagement(btn.dataset.athleteId);
    });
  });
}

// Open Access Settings Card
async function openAccessManagement(athleteId) {
  const athlete = await db.getProfile(athleteId);
  const access = await db.getAccess(athleteId);

  document.getElementById("access-edit-name").textContent = athlete.full_name;
  document.getElementById("access-edit-athlete-id").value = athlete.id;

  if (access) {
    document.getElementById("access-status").value = access.status;
    document.getElementById("access-plan").value = access.plan_type;
    document.getElementById("access-until").value = access.access_until;
    document.getElementById("access-notes").value = access.notes || '';
  }

  // Display edit card
  document.getElementById("admin-access-card").style.display = "block";
  document.getElementById("admin-access-card").scrollIntoView({ behavior: 'smooth' });
}

// Submit updated client settings
async function handleAdminAccessSubmit(e) {
  e.preventDefault();
  const athleteId = document.getElementById("access-edit-athlete-id").value;
  const accessData = await db.getAccess(athleteId);

  const updatedAccess = {
    id: accessData ? accessData.id : "access-" + Math.random().toString(36).substr(2, 9),
    athlete_id: athleteId,
    status: document.getElementById("access-status").value,
    plan_type: document.getElementById("access-plan").value,
    access_until: document.getElementById("access-until").value,
    notes: document.getElementById("access-notes").value
  };

  await db.updateAccess(updatedAccess);

  // Close card
  document.getElementById("admin-access-card").style.display = "none";
  
  // Refresh lists
  loadAdminAthletes();
}

// Load Program Templates
async function loadAdminPrograms() {
  const container = document.getElementById("admin-programs-list");
  if (!container) return;

  const programs = await db.getPrograms();
  container.innerHTML = programs.map(prog => `
    <div style="padding: 12px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
      <strong style="color: var(--accent-cyan); font-size: 1rem;">${prog.title}</strong>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${prog.description || 'No description provided.'}</p>
    </div>
  `).join('');
}

// Load Video Reviews Queue
async function loadAdminReviewsQueue() {
  const container = document.getElementById("admin-reviews-list");
  if (!container) return;

  const reviews = await db.getAllVideoReviews();
  const pending = reviews.filter(r => r.status === "submitted" || r.status === "needs_follow_up");

  if (pending.length === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size: 0.9rem;">Review queue is clean! No pending requests.</p>`;
    return;
  }

  let html = '';
  for (const rev of pending) {
    const athlete = await db.getProfile(rev.athlete_id);
    html += `
      <div style="padding: 14px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong style="color: var(--accent-cyan);">${athlete ? athlete.full_name : 'Unknown Athlete'}</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Grade: ${rev.climb_grade || 'V?'} | Angle: ${rev.wall_angle || 'N/A'}</p>
          </div>
          <span class="status-badge ${rev.status === 'needs_follow_up' ? 'modified' : 'pending'}">${rev.status}</span>
        </div>
        <p style="font-size: 0.85rem; margin-top: 6px;">Q: "${rev.athlete_question || ''}"</p>
        <a href="${rev.video_url}" target="_blank" style="color: var(--accent-blue); font-size: 0.85rem; text-decoration: none; display: inline-block; margin-top: 6px;">Watch Video &rarr;</a>

        <form class="coach-feedback-form" data-review-id="${rev.id}" style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div class="form-group">
            <label class="form-label" style="font-size: 0.75rem;">Coach Assessment Notes</label>
            <textarea class="form-control feedback-notes" style="font-size: 0.85rem; min-height: 60px;" placeholder="Add core cues, focus on feet tension..." required></textarea>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <select class="form-control feedback-status" style="font-size: 0.85rem; width: auto; padding: 4px 8px;">
              <option value="reviewed">Reviewed</option>
              <option value="needs_follow_up">Needs Follow Up</option>
            </select>
            <button type="submit" class="btn btn-primary" style="width: auto; padding: 4px 12px; font-size: 0.85rem;">Send Feedback</button>
          </div>
        </form>
      </div>
    `;
  }
  container.innerHTML = html;

  // Bind feedbacks forms submits
  container.querySelectorAll(".coach-feedback-form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const reviewId = form.dataset.reviewId;
      const reviewsList = await db.getAllVideoReviews();
      const request = reviewsList.find(r => r.id === reviewId);

      if (request) {
        request.coach_feedback_summary = form.querySelector(".feedback-notes").value;
        request.status = form.querySelector(".feedback-status").value;
        request.reviewed_at = new Date().toISOString();
        await db.updateVideoReview(request);
        loadAdminReviewsQueue();
      }
    });
  });
}

// Load Checkins
async function loadAdminCheckins() {
  const container = document.getElementById("admin-checkins-list");
  if (!container) return;

  const checkins = await db.getAllWeeklyCheckins();

  if (checkins.length === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size: 0.9rem;">No client check-ins submitted yet this week.</p>`;
    return;
  }

  let html = '';
  for (const chk of checkins) {
    const athlete = await db.getProfile(chk.athlete_id);
    html += `
      <div style="padding: 12px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
        <strong style="color: var(--accent-cyan);">${athlete ? athlete.full_name : 'Unknown Athlete'}</strong>
        <span class="text-muted" style="font-size: 0.75rem; margin-left: 8px;">Check-in on ${chk.submitted_at.split('T')[0]}</span>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; font-size: 0.8rem;">
          <div>Energy: <strong>${chk.energy}/5</strong></div>
          <div>Sleep: <strong>${chk.sleep}/5</strong></div>
          <div>Stress: <strong>${chk.stress}/5</strong></div>
          <div>Motivation: <strong>${chk.motivation}/5</strong></div>
          <div>Pain: <strong style="color: ${chk.finger_pain >= 5 ? 'var(--accent-red)' : 'inherit'};">${chk.finger_pain}/10</strong></div>
          <div>Skin: <strong>${chk.skin_condition}/5</strong></div>
        </div>

        <div style="font-size: 0.85rem; margin-top: 8px;">
          <div><strong>Felt Good:</strong> <span class="text-muted">${chk.what_felt_good || 'None'}</span></div>
          <div><strong>Felt Bad:</strong> <span class="text-muted">${chk.what_felt_bad || 'None'}</span></div>
          <div><strong>Coach Notes:</strong> <span class="text-muted">${chk.notes || 'None'}</span></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// Load Resources List
async function loadResources() {
  const listEl = document.getElementById("resources-list");
  if (!listEl) return;

  const resources = await db.getResources();
  listEl.innerHTML = resources.map(res => `
    <div style="margin-top: 12px; padding: 10px; border-bottom: 1px solid var(--border-color)">
      <strong>${res.title}</strong>
      <span class="badge" style="background-color: var(--bg-tertiary); color: var(--accent-cyan); font-size: 0.65rem; margin-left: 8px;">${res.category}</span>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 8px 0;">${res.description || ''}</p>
      <a href="${res.external_url}" target="_blank" style="color: var(--accent-cyan); font-size: 0.85rem; text-decoration: none;">View Document &rarr;</a>
    </div>
  `).join('');
}

// Load FAQs List
async function loadFAQs() {
  const listEl = document.getElementById("faqs-list");
  if (!listEl) return;

  const faqs = await db.getFaqs();
  listEl.innerHTML = faqs.map(faq => `
    <div style="margin-top: 12px; padding: 10px; background: var(--bg-tertiary); border-radius: var(--border-radius-md);">
      <strong style="color: var(--accent-cyan); display: block; margin-bottom: 6px;">Q: ${faq.question}</strong>
      <p style="font-size: 0.9rem; color: var(--text-primary);">A: ${faq.answer}</p>
    </div>
  `).join('');
}

// Load Profile Info
function loadProfileScreen() {
  if (state.currentUser.role !== "athlete") return;

  document.getElementById("profile-name").textContent = state.currentUser.full_name;
  
  const statusEl = document.getElementById("profile-status");
  statusEl.textContent = state.currentAccess.status;
  statusEl.className = `badge ${state.currentAccess.status}`;

  document.getElementById("profile-valid-until").textContent = state.currentAccess.access_until;
}

// Boot application
window.addEventListener("DOMContentLoaded", () => {
  initApp();

  // Register Service Worker for PWA offline capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.error('ServiceWorker registration failed:', err));
  }
});
