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
  // Setup default user profile (Athlete "Alex Honnold" initially)
  const defaultUserId = "ath-1";
  await switchUser(defaultUserId);

  // Bind Role Switcher Event
  document.getElementById("switch-role-btn").addEventListener("click", handleRoleSwitchToggle);

  // Bind Slider Value Displays
  setupSliderIndicators();

  // Bind Logging Form Submit
  document.getElementById("session-log-form").addEventListener("submit", handleLogSubmit);

  // Bind "Log Today's Work" Action
  document.getElementById("log-today-btn").addEventListener("click", () => {
    switchTab("log");
    if (state.todaySession) {
      document.getElementById("log-session-select").value = state.todaySession.id;
    }
  });
}

// Switch User & Update State
async function switchUser(userId) {
  state.currentUser = await db.getProfile(userId);
  state.currentAccess = await db.getAccess(userId);

  // Update layout header info
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

  // Draw appropriate Navigation Tabs
  renderNavigation();

  // Navigate to first screen default
  const defaultTab = NAVIGATION_CONFIG[state.currentUser.role][0];
  switchTab(defaultTab.id);

  // Load screen data
  loadResources();
  loadFAQs();
  loadAthleteTodayScreen();
  loadProfileScreen();
  loadTrainingCalendar();
  setupSessionSelectDropdown();
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

  // Bind Navigation click events
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

  // Update CSS tab highlights
  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tabId === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Hide all screens and show active
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  
  const targetScreenEl = document.getElementById(targetTab.screen);
  if (targetScreenEl) {
    targetScreenEl.classList.add("active");
  }

  // Hook-up reloads on navigation
  if (tabId === 'calendar') {
    loadTrainingCalendar();
  }
}

// Setup form range value live updates
function setupSliderIndicators() {
  const sliders = [
    { id: 'log-rpe', valId: 'rpe-val' },
    { id: 'log-fatigue', valId: 'fatigue-val' },
    { id: 'log-finger-pain', valId: 'finger-pain-val' },
    { id: 'log-skin', valId: 'skin-val' }
  ];
  sliders.forEach(slider => {
    const input = document.getElementById(slider.id);
    const label = document.getElementById(slider.valId);
    if (input && label) {
      input.addEventListener("input", (e) => {
        label.textContent = e.target.value;
      });
    }
  });
}

// Populate session logging dropdown with athlete's program sessions
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
        // Use Day 1 session as the mock Today's Session
        const session = sessions[0];
        state.todaySession = session;

        phaseWeekLabel.textContent = `${phases[0].title} — Week ${weeks[0].week_number}`;
        titleEl.textContent = `${session.day_label}: ${session.title}`;
        objectiveEl.textContent = session.objective;
        logBtn.style.display = "block";

        // Fetch drills
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

  // Pain/Fatigue warning check
  const warningEl = document.getElementById("pain-warning");
  if (logData.finger_pain >= 5 || logData.fatigue >= 5) {
    if (warningEl) warningEl.style.display = "block";
  }

  // Reset form inputs
  document.getElementById("session-log-form").reset();
  setupSliderIndicators();

  // Reset labels
  document.getElementById("rpe-val").textContent = "6";
  document.getElementById("fatigue-val").textContent = "3";
  document.getElementById("finger-pain-val").textContent = "0";
  document.getElementById("skin-val").textContent = "5";

  // Redirect to calendar screen to see log status updated
  switchTab("calendar");
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
window.addEventListener("DOMContentLoaded", initApp);
