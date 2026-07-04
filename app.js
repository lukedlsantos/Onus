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
  todaySession: null,
  startedSessionId: null, // Track if current session has been started by user
  drillCompletions: {}, // { drillId: completedSets }
  activeTimers: {}, // { drillId: { intervalId, remainingSeconds, originalSeconds, running, startTime } }
  wakeLockObj: null
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
      
      // Auto-populate workout notes with granular set progress
      const notesEl = document.getElementById("log-notes");
      const summaryList = [];
      document.querySelectorAll(".stepper-container").forEach(container => {
        const name = container.dataset.drillName;
        const val = state.drillCompletions[container.dataset.drillId] || 0;
        const max = container.dataset.maxSets;
        summaryList.push(`- ${name}: ${val}/${max} sets completed`);
      });
      if (summaryList.length > 0) {
        notesEl.value = `Workout Performance:\n` + summaryList.join("\n") + `\n\nNotes: `;
      }
    }
  });

  // Admin access card handlers
  document.getElementById("admin-access-form").addEventListener("submit", handleAdminAccessSubmit);
  document.getElementById("cancel-access-btn").addEventListener("click", () => {
    document.getElementById("admin-access-card").style.display = "none";
  });

  // Strava integration trigger
  document.getElementById("connect-strava-btn").addEventListener("click", handleStravaConnectionToggle);

  // Bind Exercise Stepper & Timer Events via Delegation
  const todayDrillsList = document.getElementById("today-drills-list");
  if (todayDrillsList) {
    todayDrillsList.addEventListener("click", handleDrillActionsClick);
  }

  // Auto-acquire wake lock when tab visibility changes back to visible
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Start Session Button Handler
  document.getElementById("start-session-btn").addEventListener("click", () => {
    if (state.todaySession) {
      state.startedSessionId = state.todaySession.id;
      document.getElementById("today-drills-container").style.display = "block";
      document.getElementById("log-today-btn").style.display = "block";
      document.getElementById("start-session-btn").style.display = "none";
      requestWakeLock();
    }
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

  // Clear timers state
  Object.values(state.activeTimers).forEach(timer => {
    if (timer.intervalId) clearInterval(timer.intervalId);
  });
  state.activeTimers = {};
  state.drillCompletions = {};
  
  // Clear any active wake lock
  releaseWakeLock();

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
  
  // Set dynamic links based on user profile
  const tgLink = document.getElementById("review-telegram-link");
  const driveLink = document.getElementById("review-drive-link");
  if (tgLink) tgLink.href = state.currentUser.telegram_link || "https://t.me/coach_john";
  if (driveLink) driveLink.href = state.currentUser.google_drive_folder_url || "#";

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

  // Manage Wake Lock based on screens
  if (state.currentUser.role === "athlete" && tabId === "today" && state.todaySession && state.startedSessionId === state.todaySession.id) {
    requestWakeLock();
  } else {
    releaseWakeLock();
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

// Request browser Wake Lock (prevents screen lock during training)
async function requestWakeLock() {
  if ('wakeLock' in navigator && !state.wakeLockObj) {
    try {
      state.wakeLockObj = await navigator.wakeLock.request('screen');
      updateWakeLockUI(true);
      
      state.wakeLockObj.addEventListener('release', () => {
        state.wakeLockObj = null;
        updateWakeLockUI(false);
      });
    } catch (err) {
      console.warn("Screen Wake Lock failed to initialize:", err);
      updateWakeLockUI(false);
    }
  }
}

// Release Wake Lock (allows screen sleep again)
async function releaseWakeLock() {
  if (state.wakeLockObj) {
    try {
      await state.wakeLockObj.release();
      state.wakeLockObj = null;
    } catch (err) {
      console.warn("Error releasing Screen Wake Lock:", err);
    }
  }
  updateWakeLockUI(false);
}

// Handle Page Visibility Changes (re-acquire lock if returning to app)
function handleVisibilityChange() {
  if (state.currentUser && state.currentUser.role === "athlete" && state.activeTab === "today") {
    if (document.visibilityState === 'visible') {
      requestWakeLock();
    } else {
      state.wakeLockObj = null;
      updateWakeLockUI(false);
    }
  }
}

// Update Screen Wake Lock indicators in UI
function updateWakeLockUI(isActive) {
  const indicator = document.getElementById("wake-lock-indicator");
  const label = document.getElementById("wake-lock-label");

  if (!indicator || !label) return;

  if (isActive) {
    indicator.style.backgroundColor = "var(--accent-green)";
    label.textContent = "Keep Awake";
    label.style.color = "var(--accent-green)";
  } else {
    indicator.style.backgroundColor = "var(--text-muted)";
    label.textContent = "Dim Safe";
    label.style.color = "var(--text-secondary)";
  }
}

// Setup form range value live updates
function setupSliderIndicators() {
  const sliders = [
    { id: 'log-rpe', valId: 'rpe-val' },
    { id: 'log-fatigue', valId: 'fatigue-val' },
    { id: 'log-finger-pain', valId: 'finger-pain-val' },
    { id: 'log-skin', valId: 'skin-val' },
    { id: 'chk-intensity-rpe', valId: 'chk-intensity-rpe-val' },
    { id: 'chk-movement-precision', valId: 'chk-movement-precision-val' },
    { id: 'chk-energy', valId: 'chk-energy-val' },
    { id: 'chk-sleep', valId: 'chk-sleep-val' },
    { id: 'chk-stress', valId: 'chk-stress-val' },
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

// Parse duration text strings into absolute seconds (e.g. "15 min" -> 900, "60 seconds" -> 60)
function parseDurationText(text) {
  if (!text) return null;
  let match = text.match(/(\d+)\s*(?:min|minute)/i);
  if (match) return parseInt(match[1]) * 60;
  match = text.match(/(\d+)\s*(?:s|sec|second)/i);
  if (match) return parseInt(match[1]);
  return null;
}

// Format seconds into MM:SS
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    titleEl.textContent = "No program assigned.";
    objectiveEl.style.display = "none";
    drillContainer.style.display = "none";
    logBtn.style.display = "none";
    return;
  }

  const phases = await db.getPhasesForProgram(assigned.program_id);
  let session = null;
  const storedSessionId = localStorage.getItem("onus_selected_today_session_id");

  if (storedSessionId && phases.length > 0) {
    for (const phase of phases) {
      const weeks = await db.getWeeksForPhase(phase.id);
      for (const week of weeks) {
        const sessions = await db.getSessionsForWeek(week.id);
        const found = sessions.find(s => s.id === storedSessionId);
        if (found) {
          session = found;
          phaseWeekLabel.textContent = `Week ${week.week_number} - ${phase.title}`;
          break;
        }
      }
      if (session) break;
    }
  }

  if (!session && phases.length > 0) {
    // Find the first unlogged session in chronological order
    const logs = await db.getLogsForAthlete(state.currentUser.id);
    let foundUnlogged = false;
    for (const phase of phases) {
      const weeks = await db.getWeeksForPhase(phase.id);
      for (const week of weeks) {
        const sessions = await db.getSessionsForWeek(week.id);
        for (const sess of sessions) {
          const logged = logs.some(l => l.session_id === sess.id);
          if (!logged) {
            session = sess;
            phaseWeekLabel.textContent = `Week ${week.week_number} - ${phase.title}`;
            foundUnlogged = true;
            break;
          }
        }
        if (foundUnlogged) break;
      }
      if (foundUnlogged) break;
    }

    // Dynamic fallback to the absolute first session if all sessions in program have logs
    if (!session) {
      const weeks = await db.getWeeksForPhase(phases[0].id);
      if (weeks.length > 0) {
        const sessions = await db.getSessionsForWeek(weeks[0].id);
        if (sessions.length > 0) {
          session = sessions[0];
          phaseWeekLabel.textContent = `Week ${weeks[0].week_number} - ${phases[0].title}`;
        }
      }
    }
  }

  if (session) {
    state.todaySession = session;
    titleEl.textContent = `${session.day_label}: ${session.title}`;
    objectiveEl.style.display = "none"; // Do not show objective/description anymore

    // Toggle view components based on started state
    const isStarted = state.startedSessionId === session.id;
    if (isStarted) {
      document.getElementById("start-session-btn").style.display = "none";
      drillContainer.style.display = "block";
      logBtn.style.display = "block";
    } else {
      document.getElementById("start-session-btn").style.display = "block";
      drillContainer.style.display = "none";
      logBtn.style.display = "none";
    }

    const drills = await db.getExercisesForSession(session.id);
    if (drills.length > 0) {
      drillList.innerHTML = drills.map(d => {
        const timerSecs = parseDurationText(d.reps_or_duration);
        let timerHtml = '';
        
        if (timerSecs !== null) {
          timerHtml = `
            <div class="timer-container" data-drill-id="${d.id}" data-seconds="${timerSecs}">
              <span class="timer-display">${formatTime(timerSecs)}</span>
              <button class="timer-btn timer-start-btn">Start</button>
              <button class="timer-btn timer-reset-btn" style="display: none;">Reset</button>
            </div>
          `;
        }

        return `
          <div class="drill-item" id="drill-card-${d.id}">
            <div class="drill-title">
              <span>${d.name}</span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 500;">${d.sets} sets</span>
            </div>
            <div class="drill-meta">Rep/Duration: ${d.reps_or_duration} | Rest: ${d.rest}</div>
            ${d.notes ? `<div class="drill-meta" style="font-style: italic; color: var(--text-muted);">Note: ${d.notes}</div>` : ''}
            
            <div class="drill-actions">
              <div class="stepper-container" data-drill-id="${d.id}" data-drill-name="${d.name}" data-max-sets="${d.sets}">
                <button class="stepper-btn stepper-minus">&minus;</button>
                <span class="stepper-val">0 / ${d.sets} sets</span>
                <button class="stepper-btn stepper-plus">+</button>
              </div>
              ${timerHtml}
            </div>
          </div>
        `;
      }).join('');
    } else {
      drillList.innerHTML = '';
    }

    // Auto request lock on Today load if already started
    if (state.activeTab === "today" && isStarted) requestWakeLock();
    return;
  }
  
  titleEl.textContent = "Rest Day";
  objectiveEl.style.display = "none"; // Do not show objective/description anymore
  document.getElementById("start-session-btn").style.display = "none";
  drillContainer.style.display = "none";
  logBtn.style.display = "none";
}

// Handle set-by-set steppers and background-resilient timers clicks
function handleDrillActionsClick(e) {
  const target = e.target;

  // Handle Steppers
  if (target.classList.contains("stepper-btn")) {
    const container = target.closest(".stepper-container");
    const drillId = container.dataset.drillId;
    const max = parseInt(container.dataset.maxSets);
    let val = state.drillCompletions[drillId] || 0;

    if (target.classList.contains("stepper-plus")) {
      if (val < max) val++;
    } else if (target.classList.contains("stepper-minus")) {
      if (val > 0) val--;
    }

    state.drillCompletions[drillId] = val;
    container.querySelector(".stepper-val").textContent = `${val} / ${max} sets`;
    return;
  }

  // Handle Timers (Start/Pause)
  if (target.classList.contains("timer-start-btn")) {
    const container = target.closest(".timer-container");
    const drillId = container.dataset.drillId;
    const originalSecs = parseInt(container.dataset.seconds);
    
    if (!state.activeTimers[drillId]) {
      state.activeTimers[drillId] = {
        intervalId: null,
        remainingSeconds: originalSecs,
        originalSeconds: originalSecs,
        running: false
      };
    }

    const timer = state.activeTimers[drillId];
    const resetBtn = container.querySelector(".timer-reset-btn");

    if (timer.running) {
      clearInterval(timer.intervalId);
      timer.running = false;
      target.textContent = "Start";
    } else {
      timer.running = true;
      timer.startTime = Date.now();
      timer.originalRemaining = timer.remainingSeconds;
      target.textContent = "Pause";
      resetBtn.style.display = "inline-block";

      timer.intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        timer.remainingSeconds = Math.max(0, timer.originalRemaining - elapsed);
        
        container.querySelector(".timer-display").textContent = formatTime(timer.remainingSeconds);

        if (timer.remainingSeconds <= 0) {
          clearInterval(timer.intervalId);
          timer.running = false;
          target.textContent = "Start";
          resetBtn.style.display = "none";
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }, 200);
    }
    return;
  }

  // Handle Timers (Reset)
  if (target.classList.contains("timer-reset-btn")) {
    const container = target.closest(".timer-container");
    const drillId = container.dataset.drillId;
    const timer = state.activeTimers[drillId];

    if (timer) {
      clearInterval(timer.intervalId);
      timer.running = false;
      timer.remainingSeconds = timer.originalSeconds;
      container.querySelector(".timer-display").textContent = formatTime(timer.originalSeconds);
      container.querySelector(".timer-start-btn").textContent = "Start";
      target.style.display = "none";
    }
  }
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
      const isCurrentWeek = state.todaySession && state.todaySession.week_id === week.id;
      const displayStyle = isCurrentWeek ? 'block' : 'none';
      const chevronChar = isCurrentWeek ? '▼' : '▶';
      
      calendarHtml += `
        <div class="calendar-week-block" style="margin-top: 8px;">
          <div class="calendar-week-header" data-week-id="${week.id}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--accent-cyan);">Week ${week.week_number}</span>
            <span class="chevron" style="font-size: 0.75rem; color: var(--text-muted);">${chevronChar}</span>
          </div>
          <div class="calendar-days-container" id="days-container-${week.id}" style="display: ${displayStyle}; margin-top: 4px;">
      `;

      const sessions = await db.getSessionsForWeek(week.id);
      sessions.forEach(sess => {
        const log = logs.find(l => l.session_id === sess.id);
        const status = log ? log.status : 'pending';
        
        calendarHtml += `
          <div class="calendar-day-row" data-session-id="${sess.id}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-top: 4px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div class="calendar-day-info">
              <span class="calendar-day-name" style="font-weight: 500; font-size: 0.8rem;">${sess.day_label}: ${sess.title}</span>
              <span class="calendar-session-title" style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${sess.objective}</span>
            </div>
            <span class="status-badge ${status}">${status}</span>
          </div>
        `;
      });

      calendarHtml += `
          </div>
        </div>
      `;
    }
  }
  calendarList.innerHTML = calendarHtml;

  // Bind toggle handlers for week headers
  calendarList.querySelectorAll(".calendar-week-header").forEach(header => {
    header.addEventListener("click", () => {
      const weekId = header.dataset.weekId;
      const container = document.getElementById(`days-container-${weekId}`);
      const chevron = header.querySelector(".chevron");
      if (container.style.display === "none") {
        container.style.display = "block";
        chevron.textContent = "▼";
      } else {
        container.style.display = "none";
        chevron.textContent = "▶";
      }
    });
  });

  // Bind click handlers to session rows
  calendarList.querySelectorAll(".calendar-day-row").forEach(row => {
    row.addEventListener("click", (e) => {
      // Prevent parent trigger
      e.stopPropagation();
      const sessionId = row.dataset.sessionId;
      localStorage.setItem("onus_selected_today_session_id", sessionId);
      switchTab("today");
      loadAthleteTodayScreen();
    });
  });
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

  // Clear current active selection to auto-advance to the next incomplete day on reload
  localStorage.removeItem("onus_selected_today_session_id");
  state.startedSessionId = null;

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
    planned_sessions: parseInt(document.getElementById("chk-planned-sessions").value) || 0,
    completed_sessions: parseInt(document.getElementById("chk-completed-sessions").value) || 0,
    missed_sessions_reason: document.getElementById("chk-missed-reason").value,
    climbing_intensity_rpe: parseInt(document.getElementById("chk-intensity-rpe").value),
    movement_precision: parseInt(document.getElementById("chk-movement-precision").value),
    energy_readiness: parseInt(document.getElementById("chk-energy").value),
    sleep_efficiency: parseInt(document.getElementById("chk-sleep").value),
    external_stress: parseInt(document.getElementById("chk-stress").value),
    skin_condition: parseInt(document.getElementById("chk-skin").value),
    pain_finger_pulleys: document.getElementById("chk-pain-pulleys").checked,
    pain_elbow_tendons: document.getElementById("chk-pain-elbows").checked,
    pain_shoulder_girdle: document.getElementById("chk-pain-shoulders").checked,
    pain_details: document.getElementById("chk-pain-details").value,
    send_milestone: document.getElementById("chk-send-milestone").value,
    project_bottleneck: document.getElementById("chk-project-bottleneck").value,
    question_for_coach: document.getElementById("chk-coach-question").value
  };

  await db.addWeeklyCheckin(checkinData);

  const badge = document.getElementById("checkin-status-badge");
  badge.textContent = "Done";
  badge.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
  badge.style.color = "var(--accent-green)";
  badge.style.display = "inline-block";

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

    const completedCount = logs.filter(l => l.status === "completed").length;
    const adherence = completedCount > 0 ? Math.round((completedCount / 3) * 100) : 0;
    
    const latestLog = logs[logs.length - 1];
    const latestPain = latestLog ? latestLog.finger_pain : 0;
    const latestFatigue = latestLog ? latestLog.fatigue : 1;

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
  document.getElementById("admin-access-card").style.display = "none";
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
    
    // Check if any orthopedic red flags are checked
    const hasFlags = chk.pain_finger_pulleys || chk.pain_elbow_tendons || chk.pain_shoulder_girdle;
    const flags = [];
    if (chk.pain_finger_pulleys) flags.push("Finger Pulleys");
    if (chk.pain_elbow_tendons) flags.push("Elbow Tendons");
    if (chk.pain_shoulder_girdle) flags.push("Shoulder Girdle");

    html += `
      <div style="padding: 14px; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--accent-cyan); font-size: 1rem;">${athlete ? athlete.full_name : 'Unknown Athlete'}</strong>
          <span class="text-muted" style="font-size: 0.75rem;">${chk.submitted_at.split('T')[0]}</span>
        </div>

        <!-- Part A -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm);">
          <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Part A: Volume & Technical Yield</strong>
          <div>Sessions: Completed <strong>${chk.completed_sessions}</strong> of <strong>${chk.planned_sessions}</strong> planned</div>
          ${chk.missed_sessions_reason ? `<div style="font-style: italic; color: var(--accent-red); margin-top: 2px;">Missed: ${chk.missed_sessions_reason}</div>` : ''}
          <div style="margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>Intensity RPE: <strong>${chk.climbing_intensity_rpe}/5</strong></div>
            <div>Movement Precision: <strong>${chk.movement_precision}/5</strong></div>
          </div>
        </div>

        <!-- Part B -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm);">
          <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Part B: Recovery Biomarkers</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>Energy: <strong>${chk.energy_readiness}/5</strong></div>
            <div>Sleep: <strong>${chk.sleep_efficiency}/5</strong></div>
            <div>Stress: <strong>${chk.external_stress}/5</strong></div>
            <div>Skin: <strong>${chk.skin_condition}/5</strong></div>
          </div>
        </div>

        <!-- Part C -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: ${hasFlags ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-primary)'}; border-radius: var(--border-radius-sm); border: 1px solid ${hasFlags ? 'var(--accent-red)' : 'transparent'};">
          <strong style="display: block; margin-bottom: 4px; color: ${hasFlags ? 'var(--accent-red)' : 'var(--text-primary)'};">Part C: Orthopedic Safety Checks (Red Flags)</strong>
          ${hasFlags ? `
            <div style="color: var(--accent-red); font-weight: 600; margin-bottom: 4px;">Aches detected in: ${flags.join(', ')}</div>
            ${chk.pain_details ? `<div style="font-style: italic; margin-top: 2px;">Details: ${chk.pain_details}</div>` : ''}
          ` : `
            <div style="color: var(--accent-green);">No orthopedic pain reported.</div>
          `}
        </div>

        <!-- Part D -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm);">
          <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Part D: Narrative Context</strong>
          <div style="margin-top: 4px;"><strong>Send Milestone:</strong> <span class="text-secondary">${chk.send_milestone || 'None'}</span></div>
          <div style="margin-top: 4px;"><strong>Project Bottleneck:</strong> <span class="text-secondary">${chk.project_bottleneck || 'None'}</span></div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border-color); color: var(--accent-amber);">
            <strong>Question for Coach:</strong> "${chk.question_for_coach || 'None'}"
          </div>
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

  // Render Strava UI details
  const stravaStatusEl = document.getElementById("strava-status");
  const stravaSyncDetails = document.getElementById("strava-sync-details");
  const stravaLastActivityEl = document.getElementById("strava-last-activity");
  const stravaBtn = document.getElementById("connect-strava-btn");

  if (state.currentUser.strava_connected) {
    stravaStatusEl.textContent = "Connected";
    stravaStatusEl.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
    stravaStatusEl.style.color = "var(--accent-green)";
    
    stravaSyncDetails.style.display = "block";
    stravaLastActivityEl.textContent = state.currentUser.strava_last_sync;

    stravaBtn.textContent = "Disconnect Strava";
    stravaBtn.style.backgroundColor = "var(--bg-tertiary)";
    stravaBtn.style.color = "var(--text-primary)";
  } else {
    stravaStatusEl.textContent = "Not Connected";
    stravaStatusEl.style.backgroundColor = "var(--bg-tertiary)";
    stravaStatusEl.style.color = "var(--text-muted)";

    stravaSyncDetails.style.display = "none";

    stravaBtn.textContent = "Connect Strava Account";
    stravaBtn.style.backgroundColor = "#fc4c02";
    stravaBtn.style.color = "white";
  }
}

// Toggle Strava state and simulate activities fetch (mock Garmin/Apple Sync)
async function handleStravaConnectionToggle() {
  if (state.currentUser.strava_connected) {
    await db.disconnectStrava(state.currentUser.id);
  } else {
    await db.connectStrava(state.currentUser.id);
    
    await db.addLog({
      athlete_id: state.currentUser.id,
      session_id: "session-w1-d2", // Active Recovery
      status: "completed",
      duration_minutes: 45,
      rpe: 3,
      fatigue: 2,
      finger_pain: 0,
      skin_condition: 5,
      notes: "Synced via Garmin Connect (Active Recovery run)"
    });
  }

  state.currentUser = await db.getProfile(state.currentUser.id);
  loadProfileScreen();
  loadTrainingCalendar();
}

// Boot application
window.addEventListener("DOMContentLoaded", () => {
  initApp();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.error('ServiceWorker registration failed:', err));
  }
});
