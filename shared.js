/**
 * shared.js — pseudosec.
 * Theme, nav active state, date utilities, word of the day
 * Load before page-specific scripts.
 */

// ── THEME — apply before paint to avoid flash ──────────────
(function() {
  var t = localStorage.getItem('csi-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('csi-theme', next);
  var btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = next === 'dark' ? '\u2600' : '\u263D';
}

// ── NAV ACTIVE STATE ────────────────────────────────────────
function markActiveNav() {
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    var href = (link.getAttribute('href') || '').split('/').pop();
    var active = href === page ||
      (page === '' && href === 'index.html') ||
      (page === 'dashboard.html' && href === 'index.html');
    if (active) link.classList.add('nav-link--active');
    else link.classList.remove('nav-link--active');
  });
  var btn = document.getElementById('theme-btn');
  if (btn) {
    var saved = localStorage.getItem('csi-theme') || 'dark';
    btn.textContent = saved === 'dark' ? '\u2600' : '\u263D';
  }
}

// ── DATE UTILITIES ──────────────────────────────────────────
function parseArticleDate(dateStr) {
  if (!dateStr) return new Date(0);
  try {
    var m = dateStr.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (m) {
      var h = parseInt(m[4]);
      if (m[6].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (m[6].toUpperCase() === 'AM' && h === 12) h = 0;
      var iso = m[3]+'-'+m[2]+'-'+m[1]+'T'+(h<10?'0':'')+h+':'+m[5]+':00+10:00';
      var d = new Date(iso);
      return isNaN(d) ? new Date(0) : d;
    }
  } catch(e) {}
  return new Date(0);
}

function formatDateAEST(s) {
  if (!s) return '';
  if (/^\d{2}-\d{2}-\d{4}/.test(s)) return s;
  try {
    var d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch(e) { return s; }
}

// ── READING TIME ────────────────────────────────────────────
function readingTime(text) {
  if (!text) return '';
  var words = text.trim().split(/\s+/).length;
  var mins = Math.max(1, Math.ceil(words / 220));
  return mins + ' min read';
}

// ── WORD OF THE DAY ─────────────────────────────────────────
// Deterministic daily pick — same for all users on the same AEST day
function getWordOfTheDay(terms) {
  if (!terms || !terms.length) return null;
  try {
    // Use UTC+10 offset for AEST — simple, reliable, no locale dependency
    var nowUtc = Date.now() + (10 * 60 * 60 * 1000);
    var dayNum = Math.floor(nowUtc / 86400000);
    return terms[dayNum % terms.length];
  } catch(e) {
    return terms[0];
  }
}

function renderWotd(terms) {
  if (!terms || !terms.length) return;
  var term = getWordOfTheDay(terms);
  if (!term) return;
  var termEl = document.getElementById('wotd-term');
  var defEl  = document.getElementById('wotd-def');
  if (termEl) termEl.textContent = term.term || '';
  if (defEl)  defEl.textContent  = term.short || '';
  var strip = document.getElementById('wotd-strip');
  if (strip) strip.style.opacity = '1';
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  markActiveNav();
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
