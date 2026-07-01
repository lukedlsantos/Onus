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
  activeTab: null
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
}

// Load content onto Athlete dashboard
async function loadAthleteTodayScreen() {
  if (state.currentUser.role !== "athlete") return;

  const assigned = await db.getAssignedProgram(state.currentUser.id);
  if (!assigned) {
    document.getElementById("today-session-title").textContent = "No program assigned.";
    return;
  }

  // Get first session of first week as mock today's session
  const phases = await db.getPhasesForProgram(assigned.program_id);
  if (phases.length > 0) {
    const weeks = await db.getWeeksForPhase(phases[0].id);
    if (weeks.length > 0) {
      const sessions = await db.getSessionsForWeek(weeks[0].id);
      if (sessions.length > 0) {
        const todaySession = sessions[0];
        document.getElementById("today-session-title").innerHTML = `
          <strong>${todaySession.title}</strong><br>
          <small>Objective: ${todaySession.objective}</small><br>
          <small>Duration: ${todaySession.estimated_duration_minutes} mins | Target RPE: ${todaySession.target_intensity}/10</small>
        `;
        return;
      }
    }
  }
  document.getElementById("today-session-title").textContent = "Rest Day";
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
