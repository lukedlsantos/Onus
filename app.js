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
  wakeLockObj: null,
  globalRestTimerVal: 120,
  globalRestTimerInterval: null
};

// Helper to escape HTML characters to prevent Stored XSS injection
function escapeHTML(str) {
  if (typeof str !== 'string') return str === undefined || str === null ? '' : String(str);
  return str.replace(/[&<>'"]/g, (tag) => {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return chars[tag] || tag;
  });
}

// Re-usable AudioContext helper initialized on user gesture to bypass browser security blocks
function initAudioContext() {
  try {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
  } catch (e) {
    console.warn("AudioContext initialization failed:", e);
  }
}

// Navigation Tab Configuration
const NAVIGATION_CONFIG = {
  athlete: [
    { id: 'today', label: 'Today', screen: 'screen-today', icon: `<svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
    { id: 'warmup', label: 'Warm-Up', screen: 'screen-warmup', icon: `<svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>` },
    { id: 'calendar', label: 'Calendar', screen: 'screen-calendar', icon: `<svg viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>` },
    { id: 'log', label: 'Log', screen: 'screen-log', icon: `<svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>` },
    { id: 'review', label: 'Review', screen: 'screen-review', icon: `<svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` },
    { id: 'profile', label: 'Profile', screen: 'screen-profile', icon: `<svg viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>` }
  ],
  admin: [
    { id: 'athletes', label: 'Athletes', screen: 'screen-athletes', icon: `<svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>` },
    { id: 'programs', label: 'Programs', screen: 'screen-programs', icon: `<svg viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>` },
    { id: 'reviews-queue', label: 'Reviews', screen: 'screen-reviews-queue', icon: `<svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` },
    { id: 'checkins', label: 'Check-ins', screen: 'screen-checkins', icon: `<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` }
  ]
};

// Initialize Application UI
async function initApp() {
  const defaultUserId = "ath-1";
  await switchUser(defaultUserId);

  document.getElementById("switch-role-btn").addEventListener("click", handleRoleSwitchToggle);
  setupSliderIndicators();



  const backToCalendarBtn = document.getElementById("back-to-calendar-btn");
  if (backToCalendarBtn) {
    backToCalendarBtn.addEventListener("click", () => {
      switchTab("calendar");
    });
  }

  document.getElementById("session-log-form").addEventListener("submit", handleLogSubmit);
  document.getElementById("weekly-checkin-form").addEventListener("submit", handleCheckinSubmit);
  document.getElementById("video-review-form").addEventListener("submit", handleVideoReviewSubmit);
  document.getElementById("toggle-checkin-header").addEventListener("click", toggleWeeklyCheckinForm);

  // Initialize Global 2-Minute Rest Timer listeners
  const restStartBtn = document.getElementById("global-rest-start");
  const restResetBtn = document.getElementById("global-rest-reset");
  const restDisplay = document.getElementById("global-rest-display");

  if (restStartBtn && restResetBtn && restDisplay) {
    restStartBtn.addEventListener("click", () => {
      if (state.globalRestTimerInterval) {
        // Pause
        clearInterval(state.globalRestTimerInterval);
        state.globalRestTimerInterval = null;
        restStartBtn.textContent = "Start";
      } else {
        // Start
        restStartBtn.textContent = "Pause";
        restResetBtn.style.display = "inline-block";
        state.globalRestTimerInterval = setInterval(() => {
          if (state.globalRestTimerVal > 0) {
            state.globalRestTimerVal--;
            restDisplay.textContent = formatTime(state.globalRestTimerVal);
          } else {
            // Alarm/done
            clearInterval(state.globalRestTimerInterval);
            state.globalRestTimerInterval = null;
            restStartBtn.textContent = "Start";
            playSoftDing();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            // Reset to 120s
            state.globalRestTimerVal = 120;
            restDisplay.textContent = "02:00";
            restResetBtn.style.display = "none";
          }
        }, 1000);
      }
    });

    restResetBtn.addEventListener("click", () => {
      if (state.globalRestTimerInterval) {
        clearInterval(state.globalRestTimerInterval);
        state.globalRestTimerInterval = null;
      }
      state.globalRestTimerVal = 120;
      restDisplay.textContent = "02:00";
      restStartBtn.textContent = "Start";
      restResetBtn.style.display = "none";
    });
  }

  document.getElementById("log-today-btn").addEventListener("click", () => {
    const modal = document.getElementById("quick-log-modal");
    const sheet = modal.querySelector(".quick-log-sheet");
    
    if (state.todaySession) {
      document.getElementById("quick-log-title").textContent = `Log: ${state.todaySession.day_label} - ${state.todaySession.title}`;
    }
    
    modal.style.display = "flex";
    setTimeout(() => {
      sheet.style.transform = "translateY(0)";
    }, 50);
  });

  // Bind Quick Log overlay triggers
  document.getElementById("close-quick-log-btn").addEventListener("click", closeQuickLogModal);
  
  const quickLogModal = document.getElementById("quick-log-modal");
  quickLogModal.addEventListener("mousedown", (e) => {
    if (e.target === quickLogModal) closeQuickLogModal();
  });
  
  document.getElementById("quick-log-rpe").addEventListener("input", (e) => {
    document.getElementById("quick-rpe-val").textContent = `${e.target.value} / 10`;
  });
  
  document.getElementById("quick-log-skin").addEventListener("input", (e) => {
    document.getElementById("quick-skin-val").textContent = `${e.target.value} / 10`;
  });
  
  document.getElementById("quick-log-fatigue").addEventListener("input", (e) => {
    document.getElementById("quick-fatigue-val").textContent = `${e.target.value} / 10`;
  });
  
  document.getElementById("quick-log-finger-pain").addEventListener("input", (e) => {
    document.getElementById("quick-finger-pain-val").textContent = `${e.target.value} / 10`;
  });
  
  document.getElementById("quick-log-body-pain").addEventListener("input", (e) => {
    document.getElementById("quick-body-pain-val").textContent = `${e.target.value} / 10`;
  });
  
  document.getElementById("submit-quick-log-btn").addEventListener("click", submitQuickLog);

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
      initAudioContext(); // Initialize audio context on user gesture
      state.startedSessionId = state.todaySession.id;
      document.getElementById("today-drills-container").style.display = "block";
      document.getElementById("log-today-btn").style.display = "block";
      document.getElementById("start-session-btn").style.display = "none";
      requestWakeLock();
    }
  });

  // Initialize Warm-Up Module UI event listeners
  initWarmupModule();
}

// Verify locks and lock app using a default-deny validation structure
function verifyAccessLock() {
  const lockedScreen = document.getElementById("locked-screen");
  
  if (state.currentUser && state.currentUser.role === "athlete") {
    if (!state.currentAccess || state.currentAccess.status !== "active") {
      lockedScreen.style.display = "flex";
      return;
    }
  }
  lockedScreen.style.display = "none";
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
  if (tgLink) tgLink.href = state.currentUser.telegram_link || "https://t.me/+2HunNy7a_XpiZTg1";
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
    else if (tabId === 'warmup') loadWarmupScreen();

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
    if (document.visibilityState === 'visible' && state.startedSessionId === state.todaySession?.id) {
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
        optionsHtml += `<option value="${escapeHTML(sess.id)}">${escapeHTML(phase.title)} (W${parseInt(week.id.replace('week-', '')) || week.week_number}) - ${escapeHTML(sess.day_label)}: ${escapeHTML(sess.title)}</option>`;
      });
    }
  }
  select.innerHTML = optionsHtml;
}

// Parse duration text strings into absolute seconds (e.g. "15 min" -> 900, "60 seconds" -> 60)
function parseDurationText(text) {
  if (!text) return null;
  let match = text.match(/(\d+)\s*(?:min|minute)s?\b/i);
  if (match) return parseInt(match[1]) * 60;
  match = text.match(/(\d+)\s*(?:s|sec|second)s?\b/i);
  if (match) return parseInt(match[1]);
  return null;
}

// Format seconds into MM:SS
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Generate the HTML for a single timer container
function renderTimerMarkup(timerId, originalSecs, label) {
  let remainingSecs = originalSecs;
  let startText = "Start";
  let resetStyle = "display: none;";
  
  if (state.activeTimers[timerId]) {
    const activeTimer = state.activeTimers[timerId];
    remainingSecs = activeTimer.remainingSeconds;
    if (activeTimer.running) {
      startText = "Pause";
      resetStyle = "display: inline-block;";
    } else if (activeTimer.remainingSeconds < activeTimer.originalSeconds) {
      resetStyle = "display: inline-block;";
    }
  }

  return `
    <div class="timer-container" data-drill-id="${timerId}" data-seconds="${originalSecs}" style="flex: 1; min-width: 120px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 6px; border-radius: var(--border-radius-sm); display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span style="font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${label}</span>
      <span class="timer-display" style="font-size: 1rem; font-weight: 700; color: var(--accent-cyan); font-family: monospace;">${formatTime(remainingSecs)}</span>
      <div style="display: flex; gap: 4px; width: 100%;">
        <button class="timer-btn timer-start-btn" style="flex: 1; padding: 2px 4px; font-size: 0.65rem;">${startText}</button>
        <button class="timer-btn timer-reset-btn" style="flex: 1; padding: 2px 4px; font-size: 0.65rem; ${resetStyle}">Reset</button>
      </div>
    </div>
  `;
}

/// Parse text into individual sets/reps workouts for Tier 4
function parseSubExercises(notes, parentId, instruction = "") {
  let textToParse = notes || "";
  if (instruction && (instruction.includes("sets x") || instruction.includes("sets of") || instruction.includes("set x") || instruction.includes("\n"))) {
    if (!textToParse.includes("sets x") && !textToParse.includes("sets of") && !textToParse.includes("set x")) {
      textToParse = instruction;
    }
  }
  if (!textToParse) return [];
  const lines = textToParse.split('\n');
  const subItems = [];
  
  lines.forEach((line, index) => {
    let cleanLine = line.replace(/^\s*(?:[*\-•]\s*)*(?:\d+[.)\]]\s*)?/, '').trim();
    if (!cleanLine) return;
    
    let categoryHeader = "";
    const headerMatch = cleanLine.match(/^\**([^*:]+)\**[:\*]+\s*(.*)/);
    if (headerMatch) {
      const potentialHeader = headerMatch[1].trim();
      if (!potentialHeader.match(/\d+\s*set/i)) {
        categoryHeader = potentialHeader;
        cleanLine = headerMatch[2].trim();
      }
    }
    
    const parts = cleanLine.split(/(?<=\D\.)\s+|(?<=;)\s+/);
    parts.forEach((part, subIndex) => {
      let text = part.trim();
      if (!text) return;
      
      text = text.replace(/^[\*\-\s\:\,]+/, '').replace(/[\*]+$/, '').trim();
      if (!text) return;
      
      let sets = 1;
      let repsOrDuration = "1 set";
      let cleanName = text;
      
      const failureMatch = text.match(/^(\d+)\s*sets?\s*(?:to|x)\s*failure\s+(.*)/i);
      const setRepMatch = text.match(/^(\d+)\s*sets?\s*[×x*]\s*(\d+\s*(?:s|sec|secs|seconds?|reps?|mins?|minutes?|holds?|per\s+side|per-side|each\s+side|each-side)*)\s+(.*)/i);
      
      if (failureMatch) {
        sets = parseInt(failureMatch[1]);
        repsOrDuration = "to failure";
        cleanName = failureMatch[2].trim();
      } else if (setRepMatch) {
        sets = parseInt(setRepMatch[1]);
        repsOrDuration = setRepMatch[2].trim();
        cleanName = setRepMatch[3].trim();
      } else {
        const setOfMatch = text.match(/^(\d+)\s*sets?\s+of\s+([^,]+),\s*(.*)/i);
        if (setOfMatch) {
          sets = parseInt(setOfMatch[1]);
          repsOrDuration = setOfMatch[2].trim();
          cleanName = setOfMatch[3].trim();
        } else {
          const durMatch = text.match(/^(\d+)\s*(?:min|minute|sec|second|s)\b\s*(.*)/i);
          if (durMatch) {
            repsOrDuration = text.match(/^(\d+)\s*(?:min|minute|sec|second|s)\b/i)[0];
            cleanName = durMatch[2].trim();
          }
        }
      }
      
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      subItems.push({
        id: `${parentId}-sub-${index}-${subIndex}`,
        category: categoryHeader || "Exercise",
        text: cleanName,
        sets: sets,
        repsOrDuration: repsOrDuration
      });
    });
  });
  
  return subItems;
}

// Play an audible double-beep alarm using Web Audio API (cross-browser compatible)
function playAlarmSound() {
  try {
    initAudioContext();
    const ctx = state.audioContext;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High-pitched clean beep (A5 note)
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Double beep pattern: beep (0.25s), gap (0.15s), beep (0.4s)
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn("AudioContext failed to start:", e);
  }
}

// Send local system push notification
function sendTimerNotification(timerId, container) {
  let labelText = "Timer";
  if (container) {
    const labelSpan = container.querySelector('span');
    if (labelSpan) {
      labelText = labelSpan.textContent.trim();
    }
  }
  
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(`${labelText} Finished!`, {
        body: `Time is up for your training block. Click to resume training.`,
        icon: "./icons/icon-192.png",
        vibrate: [300, 150, 300]
      });
    }
  }
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

  // Hide weekly check-in card by default; it's shown only on Day 7 after session resolution
  const checkinCard = document.getElementById("weekly-checkin-card");
  if (checkinCard) checkinCard.style.display = "none";

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    titleEl.textContent = "No program assigned.";
    objectiveEl.style.display = "none";
    drillContainer.style.display = "none";
    logBtn.style.display = "none";
    const backBtn = document.getElementById("back-to-calendar-btn");
    if (backBtn) backBtn.style.display = "none";
    return;
  }

  const phases = await db.getPhasesForProgram(assigned.program_id);
  let session = null;
  const storedSessionId = localStorage.getItem("onus_selected_today_session_id");
  console.log("[Diagnostics] loadAthleteTodayScreen started. Stored ID:", storedSessionId);
  console.log("[Diagnostics] Phases found:", phases.map(p => p.id));

  if (storedSessionId && phases.length > 0) {
    for (const phase of phases) {
      const weeks = await db.getWeeksForPhase(phase.id);
      for (const week of weeks) {
        const sessions = await db.getSessionsForWeek(week.id);
        const found = sessions.find(s => s.id === storedSessionId);
        if (found) {
          console.log("[Diagnostics] Session found in Phase:", phase.id, "Week:", week.id, found);
          session = found;
          phaseWeekLabel.textContent = `Week ${parseInt(week.id.replace('week-', '')) || week.week_number} - ${phase.title}`;
          break;
        }
      }
      if (session) break;
    }
  }

  if (!session && phases.length > 0) {
    console.log("[Diagnostics] Session lookup failed or was empty. Executing fallback logic.");
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
            phaseWeekLabel.textContent = `Week ${parseInt(week.id.replace('week-', '')) || week.week_number} - ${phase.title}`;
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
          phaseWeekLabel.textContent = `Week ${parseInt(weeks[0].id.replace('week-', '')) || weeks[0].week_number} - ${phases[0].title}`;
        }
      }
    }
  }

  if (session) {
    state.todaySession = session;
    titleEl.textContent = `${session.day_label}: ${session.title}`;
    objectiveEl.style.display = "none"; // Do not show objective/description anymore

    // Show weekly check-in card only on Day 7
    if (session.day_label === "Day 7" && checkinCard) {
      checkinCard.style.display = "";
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
    }

    const backBtn = document.getElementById("back-to-calendar-btn");
    if (backBtn) backBtn.style.display = "inline-flex";

    // Conditionally show/hide global 2-minute Rest Timer for Day 1, 5, 7
    const restTimerEl = document.getElementById("global-rest-timer");
    if (restTimerEl) {
      if (session.day_label === "Day 1" || session.day_label === "Day 5" || session.day_label === "Day 7") {
        restTimerEl.style.display = "none";
      } else {
        restTimerEl.style.display = "flex";
      }
    }

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
    let drillsHtml = "";

    if (drills.length > 0) {
      const weekNumMatch = session.week_id.match(/week-(\d+)/);
      const weekNum = weekNumMatch ? parseInt(weekNumMatch[1]) : 1;
      const isDeload = (weekNum % 4 === 0);
      const phaseNum = Math.ceil(weekNum / 4);

      drillsHtml += drills.map(d => {
        let timerHtml = '';
        
        if (d.category === "Warm-up & Prep") {
          timerHtml = renderTimerMarkup(d.id + "-warmup", 600, "Warm-up Timer");
        } else if (d.category === "Core Driver") {
          let mainMins = 90;
          if (phaseNum === 3) {
            mainMins = isDeload ? 70 : 100;
          } else if (phaseNum === 4) {
            mainMins = isDeload ? 65 : 95;
          } else if (phaseNum === 5) {
            mainMins = isDeload ? 70 : 100;
          } else if (phaseNum === 6) {
            mainMins = isDeload ? 50 : 75;
          } else {
            mainMins = isDeload ? 65 : 90;
          }
          const workSecs = parseDurationText(d.reps_or_duration) || (mainMins * 60);
          const restSecs = parseDurationText(d.rest) || 90; // 90s default
          timerHtml = `
            <div style="display: flex; gap: 8px; margin-top: 6px; width: 100%; flex-wrap: wrap;">
              ${renderTimerMarkup(d.id + "-work", workSecs, "Block Timer")}
              ${renderTimerMarkup(d.id + "-rest", restSecs, "Rest Timer")}
            </div>
          `;
        } else if (d.category === "Progress Hook") {
          let hookMins = 30;
          if (phaseNum === 3) {
            hookMins = isDeload ? 15 : 20;
          } else if (phaseNum === 4) {
            hookMins = isDeload ? 20 : 25;
          } else if (phaseNum === 5) {
            hookMins = isDeload ? 15 : 20;
          } else if (phaseNum === 6) {
            hookMins = isDeload ? 10 : 15;
          } else {
            hookMins = isDeload ? 20 : 30;
          }
          const workSecs = parseDurationText(d.reps_or_duration) || (hookMins * 60);
          const dayNumMatch = d.id.match(/-d(\d+)-/);
          const dayNum = dayNumMatch ? parseInt(dayNumMatch[1]) : 1;
          const restSecs = (dayNum === 3) ? 90 : 60;
          timerHtml = `
            <div style="display: flex; gap: 8px; margin-top: 6px; width: 100%; flex-wrap: wrap;">
              ${renderTimerMarkup(d.id + "-work", workSecs, "Block Timer")}
              ${renderTimerMarkup(d.id + "-rest", restSecs, "Rest Timer")}
            </div>
          `;
        } else if (d.category !== "Care & Restoration") {
          const timerSecs = parseDurationText(d.reps_or_duration);
          if (timerSecs !== null) {
            timerHtml = renderTimerMarkup(d.id, timerSecs, "Duration Timer");
          }
        }

        // Check if main drill is completed
        const isCompleted = (state.drillCompletions[d.id] || 0) === d.sets;
        const checkSymbol = isCompleted ? '✓' : '';
        const checkBg = isCompleted ? 'background-color: rgba(16, 185, 129, 0.15); border-color: var(--accent-green);' : 'background: none; border-color: var(--border-color);';
        const cardBg = isCompleted ? 'border-color: var(--accent-green); box-shadow: 0 0 10px rgba(16, 185, 129, 0.05);' : '';

        const subItems = parseSubExercises(d.notes, d.id, d.instruction || d.instructions);
        const isWorkoutContainer = subItems.length > 0 && (
          d.category === "Care & Restoration" || 
          subItems.some(sub => sub.sets > 1 || sub.repsOrDuration !== "1 set")
        );

        let subCardsHtml = '';
        if (isWorkoutContainer) {
          // Check if parent should display completed because all sub-items are completed
          const allSubDone = subItems.every(sub => (state.drillCompletions[sub.id] || 0) === sub.sets);
          const parentCheckSymbol = allSubDone ? '✓' : '';
          const parentCheckBg = allSubDone ? 'background-color: rgba(16, 185, 129, 0.15); border-color: var(--accent-green);' : 'background: none; border-color: var(--border-color);';
          const parentCardBg = allSubDone ? 'border-color: var(--accent-green);' : '';
          
          d.isCompletedOverride = allSubDone;
          d.checkBgOverride = parentCheckBg;
          d.checkSymbolOverride = parentCheckSymbol;
          d.cardBgOverride = parentCardBg;

          subCardsHtml = `
            <div class="sub-drills-stack" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%;">
              ${subItems.map((sub, idx) => {
                const subTimerSecs = parseDurationText(sub.repsOrDuration);
                let subTimerHtml = '';
                if (subTimerSecs !== null) {
                  subTimerHtml = renderTimerMarkup(sub.id, subTimerSecs, "Duration");
                }
                
                const isSubCompleted = (state.drillCompletions[sub.id] || 0) === sub.sets;
                const subCheckSymbol = isSubCompleted ? '✓' : '';
                const subCheckBg = isSubCompleted ? 'background-color: rgba(16, 185, 129, 0.15); border-color: var(--accent-green);' : 'background: none; border-color: var(--border-color);';
                const subCardBg = isSubCompleted ? 'border-color: var(--accent-green);' : '';

                // Track open/collapsed state across re-renders
                const isExpanded = state.expandedSubDrills && state.expandedSubDrills[sub.id];
                const displayStyle = isExpanded ? 'block' : 'none';
                const chevronChar = isExpanded ? '▼' : '▶';

                return `
                  <div class="sub-drill-card" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); overflow: hidden; ${subCardBg}">
                    <div class="sub-drill-header" data-sub-id="${escapeHTML(sub.id)}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: rgba(255,255,255,0.02);">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="drill-check-btn" data-drill-id="${escapeHTML(sub.id)}" style="width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.75rem; flex-shrink: 0; padding: 0; ${subCheckBg}">${subCheckSymbol}</button>
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); text-align: left; padding-right: 8px;">${escapeHTML(sub.text)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 500;">${sub.sets} sets ${sub.repsOrDuration && sub.repsOrDuration !== "1 set" ? `× ${sub.repsOrDuration}` : ''}</span>
                        <span class="sub-chevron" style="font-size: 0.65rem; color: var(--text-muted);">${chevronChar}</span>
                      </div>
                    </div>
                    <div class="sub-drill-body" id="sub-body-${escapeHTML(sub.id)}" style="display: ${displayStyle}; padding: 10px; border-top: 1px solid var(--border-color); background-color: var(--bg-primary);">
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; width: 100%;">
                        <div class="stepper-container" data-drill-id="${escapeHTML(sub.id)}" data-drill-name="${escapeHTML(sub.text)}" data-max-sets="${sub.sets}">
                          <button class="stepper-btn stepper-minus" style="padding: 2px 8px; font-size: 0.75rem;">&minus;</button>
                          <span class="stepper-val" style="font-size: 0.75rem;">${state.drillCompletions[sub.id] || 0} / ${sub.sets} sets ${sub.repsOrDuration && sub.repsOrDuration !== "1 set" ? `× ${sub.repsOrDuration}` : ''}</span>
                          <button class="stepper-btn stepper-plus" style="padding: 2px 8px; font-size: 0.75rem;">+</button>
                        </div>
                        ${subTimerHtml}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        const renderCardBg = isWorkoutContainer ? (d.cardBgOverride || '') : cardBg;
        const renderCheckBg = isWorkoutContainer ? (d.checkBgOverride || '') : checkBg;
        const renderCheckSymbol = isWorkoutContainer ? (d.checkSymbolOverride || '') : checkSymbol;

        return `
          <div class="drill-item" id="drill-card-${escapeHTML(d.id)}" style="${renderCardBg}">
            <div class="drill-title" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${!isWorkoutContainer ? `
                  <button class="drill-check-btn" data-drill-id="${escapeHTML(d.id)}" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.75rem; flex-shrink: 0; padding: 0; ${renderCheckBg}">${renderCheckSymbol}</button>
                ` : `
                  <button class="drill-check-btn" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-weight: 700; cursor: default; transition: all 0.2s; font-size: 0.75rem; flex-shrink: 0; padding: 0; pointer-events: none; ${renderCheckBg}">${renderCheckSymbol}</button>
                `}
                <span style="font-weight: 600;">${escapeHTML(d.name)}</span>
              </div>

            </div>
            
            ${!isWorkoutContainer ? `
              <div class="drill-meta">Rep/Duration: ${escapeHTML(d.reps_or_duration)} | Rest: ${escapeHTML(d.rest)}</div>
              ${d.notes ? `<div class="drill-meta" style="font-style: italic; color: var(--text-muted); white-space: pre-wrap;">Note: ${escapeHTML(d.notes)}</div>` : ''}
              
              <div class="drill-actions">
                <div class="stepper-container" data-drill-id="${escapeHTML(d.id)}" data-drill-name="${escapeHTML(d.name)}" data-max-sets="${d.sets}">
                  <button class="stepper-btn stepper-minus">&minus;</button>
                  <span class="stepper-val">${state.drillCompletions[d.id] || 0} / ${d.sets} sets</span>
                  <button class="stepper-btn stepper-plus">+</button>
                </div>
                ${timerHtml}
              </div>
            ` : subCardsHtml}
          </div>
        `;
      }).join('');
      drillList.innerHTML = drillsHtml;
    } else {
      drillList.innerHTML = '';
    }

      // Bind toggle handlers for Tier 4 sub-drills
      drillList.querySelectorAll(".sub-drill-header").forEach(header => {
        header.addEventListener("click", () => {
          const subId = header.dataset.subId;
          const body = document.getElementById(`sub-body-${subId}`);
          const chevron = header.querySelector(".sub-chevron");
          
          if (!state.expandedSubDrills) state.expandedSubDrills = {};
          
          if (body.style.display === "none") {
            body.style.display = "block";
            chevron.textContent = "▼";
            state.expandedSubDrills[subId] = true;
          } else {
            body.style.display = "none";
            chevron.textContent = "▶";
            state.expandedSubDrills[subId] = false;
          }
        });
      });

      // Auto request lock on Today load if already started
      if (state.activeTab === "today" && isStarted) requestWakeLock();
      return;
    }
  titleEl.textContent = "Rest Day";
  objectiveEl.style.display = "none"; // Do not show objective/description anymore
  document.getElementById("start-session-btn").style.display = "none";
  drillContainer.style.display = "none";
  logBtn.style.display = "none";
  const backBtn = document.getElementById("back-to-calendar-btn");
  if (backBtn) backBtn.style.display = "inline-flex";
}

// Handle set-by-set steppers and background-resilient timers clicks
function handleDrillActionsClick(e) {
  const target = e.target;

  // Handle Checkmark completions
  if (target.classList.contains("drill-check-btn") || target.closest(".drill-check-btn")) {
    const btn = target.classList.contains("drill-check-btn") ? target : target.closest(".drill-check-btn");
    const drillId = btn.dataset.drillId;
    
    // Find sets limit
    let container = btn.closest(".drill-item");
    let max = 1;
    let stepper = container ? container.querySelector(`.stepper-container[data-drill-id="${drillId}"]`) : null;
    
    if (!stepper) {
      container = btn.closest(".sub-drill-card");
      stepper = container ? container.querySelector(`.stepper-container[data-drill-id="${drillId}"]`) : null;
    }
    
    if (stepper) {
      max = parseInt(stepper.dataset.maxSets) || 1;
    }
    
    let val = state.drillCompletions[drillId] || 0;
    if (val === max) {
      state.drillCompletions[drillId] = 0;
    } else {
      state.drillCompletions[drillId] = max;
    }
    
    loadAthleteTodayScreen();
    return;
  }

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
    loadAthleteTodayScreen(); // Refresh to sync check status instantly
    return;
  }

  // Handle Timers (Start/Pause)
  if (target.classList.contains("timer-start-btn")) {
    initAudioContext(); // Initialize audio context on user gesture
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
        
        // Query the active DOM container element to avoid detached DOM node update bugs
        const activeContainer = document.querySelector(`.timer-container[data-drill-id="${drillId}"]`);
        if (activeContainer) {
          activeContainer.querySelector(".timer-display").textContent = formatTime(timer.remainingSeconds);
        }

        if (timer.remainingSeconds <= 0) {
          clearInterval(timer.intervalId);
          timer.running = false;
          
          if (activeContainer) {
            activeContainer.querySelector(".timer-start-btn").textContent = "Start";
            activeContainer.querySelector(".timer-reset-btn").style.display = "none";
          }
          
          // Trigger audible, vibration, and push notification alarms
          playAlarmSound();
          if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
          sendTimerNotification(drillId, activeContainer);
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
      
      const activeContainer = document.querySelector(`.timer-container[data-drill-id="${drillId}"]`);
      if (activeContainer) {
        activeContainer.querySelector(".timer-display").textContent = formatTime(timer.originalSeconds);
        activeContainer.querySelector(".timer-start-btn").textContent = "Start";
        activeContainer.querySelector(".timer-reset-btn").style.display = "none";
      }
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
    calendarHtml += `<h3 style="margin-top: 14px; font-size: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">${escapeHTML(phase.title)}</h3>`;
    const weeks = await db.getWeeksForPhase(phase.id);
    for (const week of weeks) {
      const isCurrentWeek = state.todaySession && state.todaySession.week_id === week.id;
      const displayStyle = isCurrentWeek ? 'block' : 'none';
      const chevronChar = isCurrentWeek ? '▼' : '▶';
      
      calendarHtml += `
        <div class="calendar-week-block" style="margin-top: 8px;">
          <div class="calendar-week-header" data-week-id="${escapeHTML(week.id)}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--accent-cyan);">Week ${parseInt(week.id.replace('week-', '')) || week.week_number}</span>
            <span class="chevron" style="font-size: 0.75rem; color: var(--text-muted);">${chevronChar}</span>
          </div>
          <div class="calendar-days-container" id="days-container-${escapeHTML(week.id)}" style="display: ${displayStyle}; margin-top: 4px;">
      `;

      const sessions = await db.getSessionsForWeek(week.id);
      sessions.forEach(sess => {
        const log = logs.find(l => l.session_id === sess.id);
        const status = log ? log.status : 'pending';
        
        calendarHtml += `
          <div class="calendar-day-row" data-session-id="${escapeHTML(sess.id)}" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-top: 4px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
            <div class="calendar-day-info">
              <span class="calendar-day-name" style="font-weight: 500; font-size: 0.8rem;">${escapeHTML(sess.day_label)}: ${escapeHTML(sess.title)}</span>
              <span class="calendar-session-title" style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${escapeHTML(sess.objective)}</span>
            </div>
            <span class="status-badge ${escapeHTML(status)}">${escapeHTML(status)}</span>
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
      console.log("[Diagnostics] Calendar row clicked. Data attribute sessionId:", sessionId);
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

// Close quick log modal sheet
function closeQuickLogModal() {
  const modal = document.getElementById("quick-log-modal");
  const sheet = modal.querySelector(".quick-log-sheet");
  sheet.style.transform = "translateY(100%)";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Submit quick log details synced with checkbox/stepper states
async function submitQuickLog() {
  if (!state.todaySession) return;
  
  const rpe = parseInt(document.getElementById("quick-log-rpe").value) || 6;
  const skin = parseInt(document.getElementById("quick-log-skin").value) || 5;
  const fatigue = parseInt(document.getElementById("quick-log-fatigue").value) || 5;
  const fingerPain = parseInt(document.getElementById("quick-log-finger-pain").value) || 0;
  const bodyPain = parseInt(document.getElementById("quick-log-body-pain").value) || 0;
  const painDesc = document.getElementById("quick-log-pain-desc").value.trim();
  
  // Calculate completed exercises details
  let sessionDrills = await db.getExercisesForSession(state.todaySession.id);
  const completions = [];
  
  for (const d of sessionDrills) {
    const subItems = parseSubExercises(d.notes, d.id, d.instruction || d.instructions);
    const isWorkoutContainer = subItems.length > 0 && (
      d.category === "Care & Restoration" || 
      subItems.some(sub => sub.sets > 1 || sub.repsOrDuration !== "1 set")
    );
    
    if (isWorkoutContainer) {
      subItems.forEach(sub => {
        const completed = state.drillCompletions[sub.id] || 0;
        completions.push({
          name: sub.text,
          category: d.category,
          sets_completed: completed,
          sets_total: sub.sets
        });
      });
    } else {
      const completed = state.drillCompletions[d.id] || 0;
      completions.push({
        name: d.name,
        category: d.category,
        sets_completed: completed,
        sets_total: d.sets
      });
    }
  }
  
  const formattedNotes = [
    `Quick Log. Completed exercises details: ` + completions.map(c => `${c.name} (${c.sets_completed}/${c.sets_total})`).join(", "),
    `Body Pain / Soreness: ${bodyPain} / 10`,
    painDesc ? `Pain Details: ${painDesc}` : ""
  ].filter(Boolean).join("\n\n");
  
  const logData = {
    athlete_id: state.currentUser.id,
    session_id: state.todaySession.id,
    status: "completed",
    duration_minutes: state.todaySession.estimated_duration_minutes || 60,
    rpe: rpe,
    fatigue: fatigue,
    finger_pain: fingerPain,
    skin_condition: skin,
    video_url: "",
    notes: formattedNotes
  };
  
  await db.addLog(logData);
  
  // Clear active selection and advance
  localStorage.removeItem("onus_selected_today_session_id");
  state.startedSessionId = null;
  
  closeQuickLogModal();
  
  // Reset fields to defaults
  document.getElementById("quick-log-rpe").value = "5";
  document.getElementById("quick-rpe-val").textContent = "5 / 10";
  document.getElementById("quick-log-skin").value = "5";
  document.getElementById("quick-skin-val").textContent = "5 / 10";
  document.getElementById("quick-log-fatigue").value = "5";
  document.getElementById("quick-fatigue-val").textContent = "5 / 10";
  document.getElementById("quick-log-finger-pain").value = "0";
  document.getElementById("quick-finger-pain-val").textContent = "0 / 10";
  document.getElementById("quick-log-body-pain").value = "0";
  document.getElementById("quick-body-pain-val").textContent = "0 / 10";
  document.getElementById("quick-log-pain-desc").value = "";
  
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
          <span style="font-weight: 600; font-size: 0.9rem; color: var(--accent-cyan);">${escapeHTML(rev.climb_grade || 'Unspecified Grade')} - ${escapeHTML(rev.climb_style || 'General Climb')}</span>
          <span class="status-badge ${escapeHTML(statusClass)}">${escapeHTML(rev.status)}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Angle: ${escapeHTML(rev.wall_angle || 'N/A')} | Source: ${escapeHTML(rev.storage_source)}</p>
        <p style="font-size: 0.85rem; margin-top: 6px;">Q: "${escapeHTML(rev.athlete_question || 'None')}"</p>
        <a href="${escapeHTML(rev.video_url)}" target="_blank" style="color: var(--accent-blue); font-size: 0.85rem; text-decoration: none; display: inline-block; margin-top: 4px;">Watch Video Link &rarr;</a>
        ${rev.coach_feedback_summary ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 0.85rem;">
            <strong>Coach Feedback:</strong>
            <p style="color: var(--accent-amber);">${escapeHTML(rev.coach_feedback_summary)}</p>
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
            <h3 style="font-size: 1.1rem; margin-bottom: 2px;">${escapeHTML(athlete.full_name)}</h3>
            <small class="text-muted">Plan: ${access ? escapeHTML(access.plan_type.replace('_', ' ')) : 'None'} | Expiry: ${access ? escapeHTML(access.access_until) : 'N/A'}</small>
          </div>
          <span class="badge ${access ? escapeHTML(access.status) : 'expired'}">${access ? escapeHTML(access.status) : 'expired'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; font-size: 0.85rem;">
          <div><strong>Adherence:</strong> ${adherence}%</div>
          <div><strong>Pending Reviews:</strong> ${pendingReviews}</div>
          <div><strong>Last Pain Log:</strong> ${latestPain}/10</div>
          <div><strong>Telegram:</strong> <a href="https://t.me/${escapeHTML(athlete.telegram_username || '')}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">@${escapeHTML(athlete.telegram_username || 'None')}</a></div>
        </div>

        ${hasRedFlags ? `
          <div class="alert alert-warning" style="margin-top: 10px; padding: 6px 10px; font-size: 0.8rem;">
            <strong>Red Flags:</strong> ${escapeHTML(flagsList.join(', '))}
          </div>
        ` : ''}

        <button class="btn btn-primary manage-access-trigger" data-athlete-id="${escapeHTML(athlete.id)}" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px; width: auto;">
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
    start_date: accessData ? accessData.start_date : new Date().toISOString().split('T')[0],
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
      <strong style="color: var(--accent-cyan); font-size: 1rem;">${escapeHTML(prog.title)}</strong>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${escapeHTML(prog.description || 'No description provided.')}</p>
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
            <strong style="color: var(--accent-cyan);">${athlete ? escapeHTML(athlete.full_name) : 'Unknown Athlete'}</strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Grade: ${escapeHTML(rev.climb_grade || 'V?')} | Angle: ${escapeHTML(rev.wall_angle || 'N/A')}</p>
          </div>
          <span class="status-badge ${rev.status === 'needs_follow_up' ? 'modified' : 'pending'}">${escapeHTML(rev.status)}</span>
        </div>
        <p style="font-size: 0.85rem; margin-top: 6px;">Q: "${escapeHTML(rev.athlete_question || '')}"</p>
        <a href="${escapeHTML(rev.video_url)}" target="_blank" style="color: var(--accent-blue); font-size: 0.85rem; text-decoration: none; display: inline-block; margin-top: 6px;">Watch Video &rarr;</a>

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
          <strong style="color: var(--accent-cyan); font-size: 1rem;">${athlete ? escapeHTML(athlete.full_name) : 'Unknown Athlete'}</strong>
          <span class="text-muted" style="font-size: 0.75rem;">${escapeHTML(chk.submitted_at.split('T')[0])}</span>
        </div>

        <!-- Part A -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm);">
          <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Part A: Volume & Technical Yield</strong>
          <div>Sessions: Completed <strong>${chk.completed_sessions}</strong> of <strong>${chk.planned_sessions}</strong> planned</div>
          ${chk.missed_sessions_reason ? `<div style="font-style: italic; color: var(--accent-red); margin-top: 2px;">Missed: ${escapeHTML(chk.missed_sessions_reason)}</div>` : ''}
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
            <div style="color: var(--accent-red); font-weight: 600; margin-bottom: 4px;">Aches detected in: ${escapeHTML(flags.join(', '))}</div>
            ${chk.pain_details ? `<div style="font-style: italic; margin-top: 2px;">Details: ${escapeHTML(chk.pain_details)}</div>` : ''}
          ` : `
            <div style="color: var(--accent-green);">No orthopedic pain reported.</div>
          `}
        </div>

        <!-- Part D -->
        <div style="font-size: 0.85rem; padding: 6px 10px; background-color: var(--bg-primary); border-radius: var(--border-radius-sm);">
          <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Part D: Narrative Context</strong>
          <div style="margin-top: 4px;"><strong>Send Milestone:</strong> <span class="text-secondary">${escapeHTML(chk.send_milestone || 'None')}</span></div>
          <div style="margin-top: 4px;"><strong>Project Bottleneck:</strong> <span class="text-secondary">${escapeHTML(chk.project_bottleneck || 'None')}</span></div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border-color); color: var(--accent-amber);">
            <strong>Question for Coach:</strong> "${escapeHTML(chk.question_for_coach || 'None')}"
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
      <strong>${escapeHTML(res.title)}</strong>
      <span class="badge" style="background-color: var(--bg-tertiary); color: var(--accent-cyan); font-size: 0.65rem; margin-left: 8px;">${escapeHTML(res.category)}</span>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 8px 0;">${escapeHTML(res.description || '')}</p>
      <a href="${escapeHTML(res.external_url)}" target="_blank" style="color: var(--accent-cyan); font-size: 0.85rem; text-decoration: none;">View Document &rarr;</a>
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
      <strong style="color: var(--accent-cyan); display: block; margin-bottom: 6px;">Q: ${escapeHTML(faq.question)}</strong>
      <p style="font-size: 0.9rem; color: var(--text-primary);">A: ${escapeHTML(faq.answer)}</p>
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

  // Request notifications permission on app initialization
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.error('ServiceWorker registration failed:', err));
  }
});

// ==========================================
// OFF-THE-WALL WARM-UP MODULE SPECIFICATION
// ==========================================

const WARMUP_ROUTINES = {
  breathing: {
    title: "Breathing Prep",
    objective: "Optimize oxygen delivery (Bohr Effect), elevate CO2 tolerance, and prime diaphragmatic recruitment (10 Minutes total). Best done seated before physical warm-up.",
    phases: [
      { name: "Phase A: Resonant Frequency (HRV Sync)", duration: "3:00" },
      { name: "Phase B: Physiological Sigh (CNS Reset)", duration: "2:00" },
      { name: "Phase C: Hypoxic Retentions (CO2 Tolerance)", duration: "5:00" }
    ],
    stations: [
      { name: "Resonant Frequency: Nasal Breathing", desc: "HRV Synchronization & HRV Priming.\nCycle: Inhale through nose for 5s, then Exhale passively for 5s.\nTotal: 18 cycles.", type: "coherent", work: 5, rest: 5, phase: "Phase A: Resonant Frequency (HRV Sync)", cycles: 18 },
      { name: "Physiological Sigh: Double Inhale", desc: "CNS Reset & Alveolar Priming.\nCycle: Two rapid nasal inhales (one deep, one quick top-off), followed by a slow, passive oral exhale.\nTotal: 15 cycles (8s per loop).", type: "sigh", work: 2, rest: 6, phase: "Phase B: Physiological Sigh (CNS Reset)", cycles: 15 },
      { name: "BOLT Retentions: Nasal Breathing", desc: "Hypoxic Priming & Nitric Oxide Surge.\nCycle: Breathe normally through nose for 15s, then perform a light 15s breath hold after exhalation.\nTotal: 10 cycles (30s per loop).", type: "retention", work: 15, rest: 15, phase: "Phase C: Hypoxic Retentions (CO2 Tolerance)", cycles: 10 }
    ]
  },
  lazy: {
    title: "Lazy Warm-Up",
    objective: "Systemic temperature elevation and closed-chain stability (8-10 Minutes)",
    phases: [
      { name: "Phase 1: Systemic Pulse & Joint Matrix", duration: "7:00" },
      { name: "Phase 2: Streamlined Targeted Activation", duration: "3:00" }
    ],
    stations: [
      // Phase 1: Anatomical Prep & Systemic Pulse
      { name: "Jumping Jacks", desc: "Quick, rhythmic cardiovascular elevation.", duration: 20, phase: "Phase 1: Systemic Pulse" },
      { name: "Finger Flashes & Tendon Glides (Set 1)", desc: "Speed finger flexing and tendon slides to prime pulleys without load.", duration: 20, phase: "Phase 1: Systemic Pulse" },
      { name: "Seal Jacks", desc: "Jump feet out while clapping straight arms out to the sides and together in front to open chest/shoulder girdles.", duration: 20, phase: "Phase 1: Systemic Pulse" },
      { name: "Finger Flashes & Tendon Glides (Set 2)", desc: "Secondary pulley preparation.", duration: 20, phase: "Phase 1: Systemic Pulse" },
      
      { name: "Cervical Pivot (Neck CARs)", desc: "Slow, deliberate neck rotation. Perform 15 seconds clockwise, then 15 seconds counter-clockwise.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Shoulder Girdle Rotations", desc: "Arm circles scaling from tight to wide loops, working both forward and reverse.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Wrist & Forearm Rolls", desc: "Rolls and waves to pool fluid into the forearms.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Thoracic Spine Sweeps", desc: "Standing torso twists with relaxed, sweeping arms.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Cat-Cow Pelvic Tilts", desc: "Spine flexion and extension from a quadruped posture.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Dynamic Hip Gate Openers", desc: "Lift knee, rotate outward 90°, tap the floor, and reverse.", duration: 30, phase: "Phase 1: Joint Matrix" },
      { name: "Ankle & Knee Circles", desc: "Ankle rotations paired with controlled knee bends.", duration: 30, phase: "Phase 1: Joint Matrix" },

      // Phase 2: Streamlined Targeted Activation & Closed-Chain Stability
      { name: "Banded Pull-Aparts", desc: "Trigger the mid-trapezius and rhomboids.\nPerform 1 set × 10 reps.", type: "reps", sets: 1, phase: "Phase 2: Targeted Activation" },
      { name: "Banded External Rotations", desc: "Pin elbows firmly to ribs and rotate hands outward to fire the rotator cuff.\nPerform 1 set × 10 reps.", type: "reps", sets: 1, phase: "Phase 2: Targeted Activation" },
      { name: "Plank to Scapular Shrugs", desc: "Hold plank to wake up core/serratus, transitioning into hanging shoulder shrugs.\nRest 20 seconds after this station.", duration: 30, phase: "Phase 2: Targeted Activation" },
      { name: "Plank Shoulder Taps", desc: "Hold a rigid push-up plank. Tap opposite shoulder slowly without rocking your hips.", duration: 30, phase: "Phase 2: Targeted Activation" },
      { name: "Unweighted Hip Extension Flips", desc: "Smooth bodyweight quarter-squats, focusing on driving hips forward to prime hip-to-core power transfer.", duration: 30, phase: "Phase 2: Targeted Activation" }
    ]
  },
  standard: {
    title: "Standard Warm-Up",
    objective: "Systemic pulse raising, Chiba Tore movement screening, capsule stabilization under light bodyweight, and body/power potentiation (20-25 Minutes)",
    phases: [
      { name: "Phase 1: Anatomical Prep & Systemic Pulse", duration: "10:00" },
      { name: "Phase 2: Scapular & Spinal Stabilization", duration: "10:00" },
      { name: "Phase 3: Body & Power Potentiation", duration: "5:00" }
    ],
    stations: [
      // Phase 1
      { name: "Systemic Pulse Raiser", desc: "Perform 3 sets of 30 seconds of high knees or jumping jacks to raise heart rate, with 30 seconds of active rest (breathing/stretching) between sets.", work: 30, rest: 30, cycles: 3, type: "timer", phase: "Phase 1: Systemic Pulse" },
      { name: "Overhead Towel Squat Screen", desc: "Hold a towel overhead with wide arms and perform unweighted deep squats to assess chest, shoulder, and hip integration.", duration: 120, type: "timer", phase: "Phase 1: Systemic Pulse" },
      { name: "Chiba Diagonal Mobilization", desc: "Perform Staggered Squat & Elbow Circle (contralateral tracking) and Supine Hand-to-Toe Touch (coordinates obliques with opposite hip/shoulder).", duration: 300, type: "timer", phase: "Phase 1: Systemic Pulse" },
      // Phase 2
      { name: "Prone Y-T-W Floor Raises", desc: "Face down on mat. Lift chest slightly and pulse arms into Y, T, and W positions.\nHold apex for 2 seconds.\nPerform 3 sets × 10 reps.", type: "reps", sets: 3, phase: "Phase 2: Stabilization" },
      { name: "Scapular Push-Ups to Downward Dog Shifting", desc: "Retract and protract shoulder blades in high plank, then drive hips back to downward dog.\nPerform 3 sets × 12 reps.", type: "reps", sets: 3, phase: "Phase 2: Stabilization" },
      { name: "Banded Pallof Press", desc: "Anchor band at chest height, step out for tension, hold at sternum and press straight out.\nPerform 3 sets × 12 reps per side.", type: "reps", sets: 3, phase: "Phase 2: Stabilization" },
      // Phase 3
      { name: "Static Block Presses", desc: "Perform slow, controlled push-ups on two small blocks to absorb force deeply into shoulders and chest.\nPerform 1 set × 3–5 reps.", type: "reps", sets: 1, phase: "Phase 3: Body & Power Potentiation" },
      { name: "Feet-On Campus Rung Taps", desc: "Stand in front of campus board (feet on floor/kickplate) and gently tap a higher rung with engaged shoulders.\nPerform 1 set × 3–5 reps.", type: "reps", sets: 1, phase: "Phase 3: Body & Power Potentiation" },
      { name: "Low-Impact Box Steps & Hops", desc: "Step onto low box, transition to light jumps, and land softly in a deep squat.\nPerform 1 set × 3–5 reps.", type: "reps", sets: 1, phase: "Phase 3: Body & Power Potentiation" },
      { name: "Mini Skater Bounds", desc: "Short lateral leaps foot-to-foot, landing and freezing for 2 seconds to train joint stability.\nPerform 1 set × 3–5 reps.", type: "reps", sets: 1, phase: "Phase 3: Body & Power Potentiation" },
      { name: "Sub-Maximal Vertical Rebounds", desc: "Dip into a quick quarter-squat and jump straight up while reaching overhead with both hands.\nPerform 1 set × 3–5 reps.", type: "reps", sets: 1, phase: "Phase 3: Body & Power Potentiation" }
    ]
  },
  comp: {
    title: "Competition Warm-Up",
    objective: "Targeted release, pulse elevation, stability activation, and plyometric nervous acceleration (45 Minutes)",
    phases: [
      { name: "Phase A: Targeted Release & Pulse Influx", duration: "15:00" },
      { name: "Phase B: Integrated Bodywork & Slings", duration: "15:00" },
      { name: "Phase C: Plyometric & Nervous Acceleration", duration: "15:00" }
    ],
    stations: [
      // Phase A
      { name: "Targeted Tennis Ball Releases", desc: "Focus on pec minor, rhomboids, and latissimus dorsi to free scapular/shoulder restrictions before raising pulse.", duration: 180, phase: "Phase A: Release & Pulse" },
      { name: "Systemic Pulse Elevation", desc: "High-knee skipping, directional footwork agility, and lateral shuffling to flood body with circulation.", duration: 300, phase: "Phase A: Release & Pulse" },
      { name: "Dynamic Joint Matrix & T-Hip Roll", desc: "Neck CARs, arm circles, wrist rolls, and T-Hip Roll for full pelvic-scapular integration.", duration: 420, phase: "Phase A: Release & Pulse" },
      // Phase B
      { name: "Bodyweight Turkish Get-Ups", desc: "Slow floor-to-standing transition. Keep vertical shoulder locked.\nPerform 3 sets × 3 reps per side.", type: "reps", sets: 3, phase: "Phase B: Cross-Sling" },
      { name: "Dynamic Copenhagen Side Planks", desc: "Anchor top foot on bench, drive hips upward into side plank using adductor/core bracing.\nPerform 3 sets × 8 reps per side.", type: "reps", sets: 3, phase: "Phase B: Cross-Sling" },
      { name: "Banded Face Pulls with Dynamic Overhead Press", desc: "Pull band to nose, retract scapula, then press straight overhead.\nPerform 3 sets × 15 reps.", type: "reps", sets: 3, phase: "Phase B: Cross-Sling" },
      { name: "Single-Leg Romanian Deadlifts", desc: "Hinge at hips with straight trailing leg to fire hamstrings/glutes/ankle stabilization.\nPerform 3 sets × 10 reps per side.", type: "reps", sets: 3, phase: "Phase B: Cross-Sling" },
      // Phase C
      { name: "Plyometric Push-Ups", desc: "Explode off floor so hands completely break contact.\nPerform 3 sets × 5 reps.\nRest 60s between sets.", duration: 60, type: "timer", sets: 3, phase: "Phase C: Plyometric" },
      { name: "High-Velocity Band Slams", desc: "Pull high-tension band overhead downward through core sling at max speed.\nPerform 3 sets × 6 reps.\nRest 60s between sets.", duration: 60, type: "timer", sets: 3, phase: "Phase C: Plyometric" },
      { name: "Neurological Fast-Twitch Finger Flashes", desc: "Extend arms forward, cycle hands between absolute tight fist and wide open fingers at max speed.", duration: 20, type: "timer", sets: 3, phase: "Phase C: Plyometric" },
      { name: "Pre-Comp Taper Rest", desc: "Rest completely seated with deep box breathing for 4 minutes before your first attempt.", duration: 240, phase: "Phase C: Plyometric" }
    ]
  },
  fingerboard: {
    title: "Fingerboard Routine",
    objective: "Progressive mechanical loading, recruitment matrix, and max force ceiling priming (15 Minutes)",
    phases: [
      { name: "Phase 1: Pulley Priming & Sloper Engagement", duration: "5:00" },
      { name: "Phase 2: Progressive Edge Loading", duration: "5:00" },
      { name: "Phase 3: Max Recruitment Pulls", duration: "5:00" }
    ],
    stations: [
      // Pulley Priming
      { name: "Controlled 20mm Edge Hangs", desc: "Engage shoulders and keep a strict half-crimp to recruit forearm flexors without dynamic impact.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 1: Pulley Priming & Sloper Engagement" },
      { name: "3-Finger Drag Hangs", desc: "Drop your pinky finger off a comfortable edge, hanging in a relaxed, open-handed drag position.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 1: Pulley Priming & Sloper Engagement" },
      { name: "20° Decline Sloper Hangs", desc: "Engage wrists and maximize skin contact on a gentle 20-degree sloper to prime friction grips.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 1: Pulley Priming & Sloper Engagement" },
      { name: "30° Decline Sloper Hangs", desc: "Drive body tension straight through your core down to your toes on a 30-degree sloper.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 1: Pulley Priming & Sloper Engagement" },
      { name: "40° Decline Sloper Hangs", desc: "Maximize palm compression on a slick 40-degree sloper to fully turn on your wrist stabilizers.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 1: Pulley Priming & Sloper Engagement" },
      // Edge Shrinking / Progressive Loading
      { name: "15mm Micro-Edge Hangs", desc: "Step down to a smaller edge size to increase neural recruitment in a strict half-crimp posture.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 2: Progressive Edge Loading" },
      { name: "12mm Micro-Edge Hangs", desc: "Focus on immediate tension recruitment as the hold profile shrinks.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 2: Progressive Edge Loading" },
      { name: "10mm Micro-Edge Hangs", desc: "The final priming step for high contact strength. Ensure your posture remains completely rigid.", type: "pulls", work: 5, rest: 15, cycles: 3, phase: "Phase 2: Progressive Edge Loading" },
      // Max Recruitment Pulls (from Standard / Comp)
      { name: "CNS Neural Check: 50% & 75% MVC Pulls", desc: "Perform 2 pulls × 5 seconds (one at 50%, one at 75% effort) against static ground block or crane scale. Verify neural drive. Rest 60s between pulls.", duration: 60, type: "pulls", pullsCount: 2, pullDuration: 5, phase: "Phase 3: Max Recruitment Pulls" },
      { name: "Peak Recruitment Pulls (100% effort)", desc: "Perform 3 holds × 5 seconds absolute max downward pull on 20mm frame edge half-crimp. Rest 1 minute.", type: "pulls", work: 5, rest: 60, cycles: 3, phase: "Phase 3: Max Recruitment Pulls" }
    ]
  }
};

// Initialize warm-up event listeners
function initWarmupModule() {
  // Sub-tabs listeners
  const screenWarmup = document.getElementById("screen-warmup");
  if (!screenWarmup) return;

  const subTabBtns = screenWarmup.querySelectorAll(".sub-tab-btn");
  subTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.warmup.activeType = btn.dataset.warmupType;
      state.warmup.activeStationIdx = 0;
      loadWarmupScreen();
    });
  });

  // Start routine button
  document.getElementById("start-warmup-btn").addEventListener("click", startWarmupRoutine);

  // Stepper sets buttons
  document.getElementById("warmup-set-plus").addEventListener("click", () => {
    const routine = WARMUP_ROUTINES[state.warmup.activeType];
    const station = routine.stations[state.warmup.activeStationIdx];
    const key = `${state.warmup.activeType}-${state.warmup.activeStationIdx}`;
    let val = state.warmup.completions[key] || 0;
    if (val < (station.sets || 1)) val++;
    state.warmup.completions[key] = val;
    document.getElementById("warmup-set-val").textContent = `${val} / ${station.sets || 1}`;
  });

  document.getElementById("warmup-set-minus").addEventListener("click", () => {
    const key = `${state.warmup.activeType}-${state.warmup.activeStationIdx}`;
    let val = state.warmup.completions[key] || 0;
    if (val > 0) val--;
    state.warmup.completions[key] = val;
    const routine = WARMUP_ROUTINES[state.warmup.activeType];
    const station = routine.stations[state.warmup.activeStationIdx];
    document.getElementById("warmup-set-val").textContent = `${val} / ${station.sets || 1}`;
  });

  // Timer play/pause and reset
  document.getElementById("warmup-timer-toggle").addEventListener("click", toggleWarmupTimer);
  document.getElementById("warmup-timer-reset").addEventListener("click", resetWarmupTimer);

  // Wizard nav buttons
  document.getElementById("warmup-prev-btn").addEventListener("click", prevWarmupStation);
  document.getElementById("warmup-next-btn").addEventListener("click", nextWarmupStation);
  document.getElementById("exit-warmup-btn").addEventListener("click", exitWarmupRoutine);
}

// Load warm-up routing view
async function loadWarmupScreen() {
  if (!state.warmup) {
    state.warmup = {
      activeType: 'breathing',
      activeStationIdx: 0,
      timerVal: 0,
      timerRunning: false,
      timerInterval: null,
      tabataPhase: 'work',
      completions: {}
    };
  }

  const type = state.warmup.activeType;
  const routine = WARMUP_ROUTINES[type];

  // 1. Adaptive Highlighting Check (Flag 2)
  const alertEl = document.getElementById("warmup-recommendation");
  try {
    const checkins = await db.getCheckinsForAthlete(state.currentUser.id);
    const lastCheckin = checkins && checkins.length > 0 ? checkins[checkins.length - 1] : null;
    if (lastCheckin && lastCheckin.energy_readiness <= 2) {
      alertEl.style.display = "block";
      // Auto highlight Lazy warm-up
      if (!state.warmup.hasAutoHighlighted) {
        state.warmup.activeType = 'lazy';
        state.warmup.hasAutoHighlighted = true;
        loadWarmupScreen();
        return;
      }
    } else {
      alertEl.style.display = "none";
    }
  } catch (e) {
    alertEl.style.display = "none";
  }

  // Peak Phase check (Month 6)
  try {
    const assigned = await db.getAssignedProgram(state.currentUser.id);
    if (assigned && (assigned.title.includes("Month 6") || assigned.title.includes("Peak")) && !state.warmup.hasAutoPresetComp) {
      state.warmup.activeType = 'comp';
      state.warmup.hasAutoPresetComp = true;
      loadWarmupScreen();
      return;
    }
  } catch (e) {}

  // Update active sub-tab styling
  document.querySelectorAll("#screen-warmup .sub-tab-btn").forEach(btn => {
    if (btn.dataset.warmupType === type) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Render overview details
  document.getElementById("warmup-routine-title").textContent = routine.title;
  document.getElementById("warmup-routine-objective").textContent = routine.objective;

  const phasesList = document.getElementById("warmup-phases-list");
  phasesList.innerHTML = routine.phases.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--border-radius-sm);">
      <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-primary);">${p.name}</span>
      <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">${p.duration}</span>
    </div>
  `).join('');

  document.getElementById("warmup-overview").style.display = "block";
  document.getElementById("warmup-wizard-card").style.display = "none";
}

// Start routine wizard
function startWarmupRoutine() {
  document.getElementById("warmup-overview").style.display = "none";
  document.getElementById("warmup-wizard-card").style.display = "block";
  state.warmup.activeStationIdx = 0;
  loadWarmupStation();
}

// Load active wizard station
function loadWarmupStation() {
  if (state.warmup.timerInterval) {
    clearInterval(state.warmup.timerInterval);
    state.warmup.timerInterval = null;
  }
  state.warmup.timerRunning = false;
  state.warmup.tabataPhase = 'work';

  const type = state.warmup.activeType;
  const routine = WARMUP_ROUTINES[type];
  const idx = state.warmup.activeStationIdx;
  const station = routine.stations[idx];

  // Title & phase info
  document.getElementById("warmup-wizard-phase").textContent = station.phase || routine.phases[0].name;
  document.getElementById("warmup-wizard-progress").textContent = `Station ${idx + 1} / ${routine.stations.length}`;
  document.getElementById("warmup-station-name").textContent = station.name;
  document.getElementById("warmup-station-desc").textContent = station.desc;

  // Stepper config
  const setsBox = document.getElementById("warmup-station-sets-box");
  const completedLabel = setsBox ? setsBox.querySelector("span") : null;
  if (setsBox && completedLabel) {
    if (station.cycles) {
      setsBox.style.display = "flex";
      completedLabel.textContent = "Cycle:";
      document.getElementById("warmup-set-minus").style.display = "none";
      document.getElementById("warmup-set-plus").style.display = "none";
      const currentCycle = (state.warmup.intervalCycleCount || 0) + 1;
      document.getElementById("warmup-set-val").textContent = `${currentCycle} / ${station.cycles}`;
    } else if (station.sets || station.type === 'reps') {
      setsBox.style.display = "flex";
      completedLabel.textContent = "Completed Sets:";
      document.getElementById("warmup-set-minus").style.display = "inline-block";
      document.getElementById("warmup-set-plus").style.display = "inline-block";
      const key = `${type}-${idx}`;
      const completedSets = state.warmup.completions[key] || 0;
      document.getElementById("warmup-set-val").textContent = `${completedSets} / ${station.sets || 1}`;
    } else {
      setsBox.style.display = "none";
    }
  }

  // Timer setup
  const timerToggle = document.getElementById("warmup-timer-toggle");
  const timerReset = document.getElementById("warmup-timer-reset");
  const timerLabel = document.getElementById("warmup-timer-label");
  const timerDigits = document.getElementById("warmup-timer-digits");
 
  timerToggle.textContent = "Start";
  timerReset.style.display = "none";
 
  if (station.work && station.rest) {
    if (station.type === 'coherent') timerLabel.textContent = "Inhale";
    else if (station.type === 'sigh') timerLabel.textContent = "Double Inhale";
    else if (station.type === 'retention') timerLabel.textContent = "Nasal Breathe";
    else if (station.type === 'pulls') timerLabel.textContent = "Pull Time";
    else timerLabel.textContent = "Work Time";
    state.warmup.timerVal = station.work;
    state.warmup.intervalCycleCount = 0;
  } else if (station.duration) {
    timerLabel.textContent = "Timer";
    state.warmup.timerVal = station.duration;
  } else {
    timerLabel.textContent = "Sets Focus";
    state.warmup.timerVal = 0;
  }
 
  timerDigits.textContent = formatTime(state.warmup.timerVal);
  updateBreathingVisual(timerLabel.textContent);
}

// Play a soft meditative bell chime / ding (528Hz Solfeggio frequency with smooth decay)
function playSoftDing() {
  try {
    initAudioContext();
    const ctx = state.audioContext;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz (Calming Transformation frequency)
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03); // Quick clean strike
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // Smooth trailing ring
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.warn("AudioContext failed to start soft ding:", e);
  }
}

// Update the visual breathing guide bubble states (Inhale / Exhale / Hold)
function updateBreathingVisual(label) {
  const outer = document.getElementById("breathing-circle-outer");
  const inner = document.getElementById("breathing-circle-inner");
  const cue = document.getElementById("warmup-breathing-cue");
  const labelEl = document.getElementById("warmup-timer-label");
  
  if (!outer || !inner) return;
  
  if (label === "Inhale" || label === "Double Inhale") {
    inner.style.transform = "scale(1.35)";
    inner.style.background = "radial-gradient(circle, var(--accent-green) 0%, rgba(16, 185, 129, 0.4) 100%)";
    inner.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
    outer.style.borderColor = "var(--accent-green)";
    labelEl.style.color = "var(--accent-green)";
    cue.textContent = label === "Inhale" ? "Fill your lungs deeply" : "Sniff twice rapidly!";
  } else if (label === "Exhale" || label === "Slow Exhale") {
    inner.style.transform = "scale(0.85)";
    inner.style.background = "radial-gradient(circle, var(--accent-green) 0%, rgba(16, 185, 129, 0.2) 100%)";
    inner.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.2)";
    outer.style.borderColor = "rgba(16, 185, 129, 0.2)";
    labelEl.style.color = "var(--accent-green)";
    cue.textContent = label === "Exhale" ? "Let the air fall out" : "Sigh out slowly through pursed lips";
  } else if (label === "Breath Hold" || label === "Nasal Breathe") {
    inner.style.transform = "scale(1.0)";
    inner.style.background = "radial-gradient(circle, var(--accent-cyan) 0%, rgba(6, 182, 212, 0.4) 100%)";
    inner.style.boxShadow = "0 0 15px rgba(6, 182, 212, 0.4)";
    outer.style.borderColor = "var(--accent-cyan)";
    labelEl.style.color = "var(--accent-cyan)";
    cue.textContent = label === "Breath Hold" ? "Hold still, relax your mind" : "Breathe light, calm nasal flow";
  } else {
    // Normal timer
    inner.style.transform = "scale(1.0)";
    inner.style.background = "radial-gradient(circle, var(--accent-cyan) 0%, rgba(6, 182, 212, 0.4) 100%)";
    inner.style.boxShadow = "0 0 10px rgba(6, 182, 212, 0.2)";
    outer.style.borderColor = "var(--border-color)";
    labelEl.style.color = "var(--text-primary)";
    cue.textContent = "Maintain focus";
  }
}

// Timer control logic
function toggleWarmupTimer() {
  initAudioContext(); // Initialize audio context on user gesture
  const toggleBtn = document.getElementById("warmup-timer-toggle");
  const resetBtn = document.getElementById("warmup-timer-reset");

  if (state.warmup.timerRunning) {
    // Pause
    state.warmup.timerRunning = false;
    clearInterval(state.warmup.timerInterval);
    state.warmup.timerInterval = null;
    toggleBtn.textContent = "Resume";
  } else {
    // Start/Resume
    state.warmup.timerRunning = true;
    toggleBtn.textContent = "Pause";
    resetBtn.style.display = "inline-block";

    const tick = () => {
      if (state.warmup.timerVal > 0) {
        state.warmup.timerVal--;
        document.getElementById("warmup-timer-digits").textContent = formatTime(state.warmup.timerVal);
        
        // Pulse bubble slightly on each tick to feel alive
        const inner = document.getElementById("breathing-circle-inner");
        if (inner && state.warmup.activeType === 'breathing') {
          inner.style.opacity = "0.9";
          setTimeout(() => { inner.style.opacity = "1"; }, 150);
        }
      } else {
        // Timer alarm triggered
        clearInterval(state.warmup.timerInterval);
        state.warmup.timerInterval = null;
        state.warmup.timerRunning = false;
        
        // Play relaxing ding and pulse haptics on transitions
        playSoftDing();
        if (navigator.vibrate) navigator.vibrate(100); // Gentle 100ms haptic tap

        const routine = WARMUP_ROUTINES[state.warmup.activeType];
        const station = routine.stations[state.warmup.activeStationIdx];

        if (station.work && station.rest) {
          // It's an automated interval station (Tabata, Coherent, Sigh, Retention, Pulls)
          if (!state.warmup.intervalCycleCount) state.warmup.intervalCycleCount = 0;
          
          if (state.warmup.tabataPhase === 'work') {
            // Transition from Work to Rest
            state.warmup.tabataPhase = 'rest';
            state.warmup.timerVal = station.rest;
            
            // Set label
            let nextLabel = "Rest Time";
            if (state.warmup.activeType === 'breathing') {
              if (station.type === 'coherent') nextLabel = "Exhale";
              else if (station.type === 'sigh') nextLabel = "Slow Exhale";
              else if (station.type === 'retention') nextLabel = "Breath Hold";
            } else if (station.type === 'pulls') {
              nextLabel = "Rest between reps";
            }
            
            document.getElementById("warmup-timer-label").textContent = nextLabel;
            updateBreathingVisual(nextLabel);
            
            state.warmup.timerRunning = true;
            state.warmup.timerInterval = setInterval(tick, 1000);
          } else {
            // Transition from Rest to Work
            state.warmup.intervalCycleCount++;
            const maxCycles = station.cycles || 1;
            
            if (state.warmup.intervalCycleCount < maxCycles) {
              // Update cycle UI display
              if (station.cycles) {
                document.getElementById("warmup-set-val").textContent = `${state.warmup.intervalCycleCount + 1} / ${station.cycles}`;
              }
              
              state.warmup.tabataPhase = 'work';
              state.warmup.timerVal = station.work;
              
              let nextLabel = "Work Time";
              if (state.warmup.activeType === 'breathing') {
                if (station.type === 'coherent') nextLabel = "Inhale";
                else if (station.type === 'sigh') nextLabel = "Double Inhale";
                else if (station.type === 'retention') nextLabel = "Nasal Breathe";
              } else if (station.type === 'pulls') {
                nextLabel = "Pull Time";
              }
              
              document.getElementById("warmup-timer-label").textContent = nextLabel;
              updateBreathingVisual(nextLabel);
              
              state.warmup.timerRunning = true;
              state.warmup.timerInterval = setInterval(tick, 1000);
            } else {
              // Finished all cycles for this station, reset count and go to next
              state.warmup.intervalCycleCount = 0;
              nextWarmupStation(true);
            }
          }
        } else {
          toggleBtn.textContent = "Done";
        }
      }
    };

    state.warmup.timerInterval = setInterval(tick, 1000);
  }
}

function resetWarmupTimer() {
  if (state.warmup.timerInterval) {
    clearInterval(state.warmup.timerInterval);
    state.warmup.timerInterval = null;
  }
  state.warmup.timerRunning = false;

  const routine = WARMUP_ROUTINES[state.warmup.activeType];
  const station = routine.stations[state.warmup.activeStationIdx];

  if (station.work && station.rest) {
    state.warmup.timerVal = station.work;
    let nextLabel = "Work Time";
    if (state.warmup.activeType === 'breathing') {
      if (station.type === 'coherent') nextLabel = "Inhale";
      else if (station.type === 'sigh') nextLabel = "Double Inhale";
      else if (station.type === 'retention') nextLabel = "Nasal Breathe";
    }
    document.getElementById("warmup-timer-label").textContent = nextLabel;
    updateBreathingVisual(nextLabel);
  } else {
    state.warmup.timerVal = station.duration || 0;
    updateBreathingVisual("Timer");
  }

  document.getElementById("warmup-timer-digits").textContent = formatTime(state.warmup.timerVal);
  document.getElementById("warmup-timer-toggle").textContent = "Start";
  document.getElementById("warmup-timer-reset").style.display = "none";
}

// Next station navigation
function nextWarmupStation(autoStart = false) {
  const routine = WARMUP_ROUTINES[state.warmup.activeType];
  if (state.warmup.activeStationIdx < routine.stations.length - 1) {
    state.warmup.activeStationIdx++;
    loadWarmupStation();
    if (autoStart) {
      toggleWarmupTimer();
    }
  } else {
    // Complete warm-up
    localStorage.setItem("warm_up_completed", "true");
    alert("Congratulations! Warm-up routine completed successfully. Time to climb!");
    exitWarmupRoutine();
  }
}

// Previous station navigation
function prevWarmupStation() {
  if (state.warmup.activeStationIdx > 0) {
    state.warmup.activeStationIdx--;
    loadWarmupStation();
  }
}

// Exit warm-up wizard
function exitWarmupRoutine() {
  if (state.warmup.timerInterval) {
    clearInterval(state.warmup.timerInterval);
    state.warmup.timerInterval = null;
  }
  state.warmup.timerRunning = false;
  state.warmup.activeStationIdx = 0;
  
  loadWarmupScreen();
  switchTab("today");
}
