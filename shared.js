/**
 * shared.js — pseudosec.
 * Theme toggle, nav, escaping, date utilities, word of the day.
 * Load before page-specific scripts. The initial theme is applied by a
 * tiny inline script in each page's <head> so there is no flash.
 */

// ── THEME ──────────────────────────────────────────────────
function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

// The button's icon is swapped by CSS; keep its label in step for screen readers.
function syncThemeButton() {
  var btn = document.getElementById('theme-btn');
  if (btn) btn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function toggleTheme() {
  var next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('csi-theme', next); } catch (e) {}
  syncThemeButton();
}

// ── NAV ACTIVE STATE ────────────────────────────────────────
function markActiveNav() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    var href = (link.getAttribute('href') || '').split('/').pop();
    var active = href === page;
    link.classList.toggle('nav-link--active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

// ── ESCAPING ────────────────────────────────────────────────
// Every value from data/*.json goes through esc() (text) or safeUrl() (links)
// before it is placed in an HTML string. Feed content is untrusted.
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Returns an escaped absolute https URL, or '' if the value isn't one.
function safeUrl(value) {
  try {
    var u = new URL(String(value || ''));
    return u.protocol === 'https:' ? esc(u.href) : '';
  } catch (e) {
    return '';
  }
}

// ── DATES ───────────────────────────────────────────────────
// Data files store ISO 8601 UTC. Display is always Sydney time, so
// daylight saving (AEDT) is handled by the browser.
var SYDNEY = 'Australia/Sydney';

function parseDate(value) {
  if (!value) return null;
  var d = new Date(value);
  return isNaN(d) ? null : d;
}

function formatDate(value, withTime) {
  var d = parseDate(value);
  if (!d) return '';
  var opts = { timeZone: SYDNEY, day: 'numeric', month: 'short' };
  if (withTime) { opts.hour = 'numeric'; opts.minute = '2-digit'; }
  return d.toLocaleString('en-AU', opts);
}

// Whole days since 1970-01-01 in Sydney's calendar. Every daily rotation
// (word, tip, blurb) uses this so they all change at Sydney midnight.
function sydneyDayNumber() {
  var parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date()).split('-');
  return Math.floor(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]) / 86400000);
}

function pickForToday(list) {
  return list && list.length ? list[sydneyDayNumber() % list.length] : null;
}

// ── WORD OF THE DAY ─────────────────────────────────────────
function renderWotd(terms) {
  var term = pickForToday(terms);
  if (!term) return;
  var termEl = document.getElementById('wotd-term');
  var defEl  = document.getElementById('wotd-def');
  if (termEl) termEl.textContent = term.term || '';
  if (defEl)  defEl.textContent  = term.short || '';
  var strip = document.getElementById('wotd-strip');
  if (strip) strip.style.opacity = '1';
}

// ── MOBILE NAV ──────────────────────────────────────────────
function initMobileNav() {
  var toggle = document.getElementById('nav-toggle');
  var nav    = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  function openNav() {
    nav.classList.add('site-nav--open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
  }
  function closeNav() {
    nav.classList.remove('site-nav--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }

  toggle.addEventListener('click', function() {
    nav.classList.contains('site-nav--open') ? closeNav() : openNav();
  });

  nav.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', function(e) {
    if (nav.classList.contains('site-nav--open') &&
        !nav.contains(e.target) && !toggle.contains(e.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('site-nav--open')) {
      closeNav();
      toggle.focus();
    }
  });
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  markActiveNav();
  syncThemeButton();
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  initMobileNav();
});
