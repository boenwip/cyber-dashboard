/**
 * dashboard.js — pseudosec. Dashboard
 * Requires: shared.js, definitions.js loaded first
 */

// ── TRACKER ────────────────────────────────────────────────
var FY_START  = new Date('2025-07-01T00:00:00+10:00');
var SECS_YEAR = 365.25 * 24 * 3600;

function getElapsed() {
  var now   = new Date();
  var start = FY_START > now ? new Date('2024-07-01T00:00:00+10:00') : FY_START;
  return Math.max(0, (now - start) / 1000);
}

function fmt(n) { return Math.floor(n).toLocaleString('en-AU'); }

function updateTracker() {
  var el = document.getElementById('main-count');
  if (!el) return;
  var e = getElapsed();
  el.textContent = fmt(e * 84700 / SECS_YEAR);
  el.classList.add('visible');
}

function initBarChart() {
  setTimeout(function() {
    var b = document.getElementById('b-ransom');
    if (!b) return;
    document.getElementById('b-ransom').style.width = '11%';
    document.getElementById('b-id').style.width    = '8%';
    document.getElementById('b-shop').style.width  = '7%';
    document.getElementById('b-bank').style.width  = '6%';
    document.getElementById('b-other').style.width = '68%';
  }, 500);
}

// ── THREAT MAP ─────────────────────────────────────────────
function toggleThreatMap() {
  var section = document.getElementById('threat-map-section');
  var layout  = document.querySelector('.layout');
  if (!section) return;
  var isHidden = section.hidden;
  section.hidden = !isHidden;
  if (layout) layout.style.display = isHidden ? 'none' : 'grid';
  var btn = document.getElementById('threat-map-btn');
  if (btn) btn.textContent = isHidden ? '✕ Close Map' : '🌐 Threat Map';
}

// ── DATA STATE ─────────────────────────────────────────────
var allArticles = [];
var allTools    = [];
var activeFilters = { topic: [], threat: [] };

// ── FILTER LOGIC ───────────────────────────────────────────
function passesFilters(article) {
  var t = activeFilters.topic;
  var h = activeFilters.threat;
  if (t.length && !t.some(function(v) { return (article.tags || []).indexOf(v) > -1; })) return false;
  if (h.length && h.indexOf(article.threat) === -1) return false;
  return true;
}

function toggleTagFilter(type, value) {
  var idx = activeFilters[type].indexOf(value);
  if (idx > -1) {
    activeFilters[type].splice(idx, 1);
  } else {
    activeFilters[type].push(value);
  }
  updateFilterBar();
  renderArticles();
}

function clearAllFilters() {
  activeFilters = { topic: [], threat: [] };
  updateFilterBar();
  renderArticles();
}

function updateFilterBar() {
  var bar = document.getElementById('active-filter-bar');
  var tagsContainer = document.getElementById('active-filter-tags');
  if (!bar || !tagsContainer) return;
  var all = activeFilters.topic.concat(activeFilters.threat);
  if (!all.length) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  tagsContainer.innerHTML = all.map(function(v) {
    return '<button class="active-filter-chip" onclick="removeFilter(\'' + v + '\')" aria-label="Remove ' + v + ' filter">' +
      v + ' ✕</button>';
  }).join('');
}

function removeFilter(value) {
  var ti = activeFilters.topic.indexOf(value);
  if (ti > -1) activeFilters.topic.splice(ti, 1);
  var hi = activeFilters.threat.indexOf(value);
  if (hi > -1) activeFilters.threat.splice(hi, 1);
  updateFilterBar();
  renderArticles();
}

// ── TAG HELPERS ────────────────────────────────────────────
var TAG_CLASS_MAP = {
  'AU Cyber':   'tag-cyber',
  'RTO / VET':  'tag-rto',
  'Education':  'tag-edu',
  'EdTech':     'tag-edtech',
  'AI & Tools': 'tag-ai',
  'Scams':      'tag-scam',
  'Compliance': 'tag-comp',
  'Good News':  'tag-good'
};

function tagClass(t)  { return 'tag ' + (TAG_CLASS_MAP[t] || ''); }
function threatDot(t) {
  if (t === 'Critical') return '● Critical';
  if (t === 'High')     return '● High';
  if (t === 'Medium')   return '● Medium';
  return '● Advisory';
}
function threatClass(t) {
  if (t === 'Critical') return 'threat-badge t-critical';
  if (t === 'High')     return 'threat-badge t-high';
  if (t === 'Medium')   return 'threat-badge t-medium';
  return 'threat-badge t-advisory';
}

// ── RENDER ARTICLES ────────────────────────────────────────
function renderArticles() {
  var container = document.getElementById('articles-container');
  if (!container) return;

  var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  var filtered = allArticles
    .filter(passesFilters)
    .filter(function(a) { return !a.date || parseArticleDate(a.date) >= sevenDaysAgo; })
    .sort(function(a, b) { return parseArticleDate(b.date) - parseArticleDate(a.date); })
    .slice(0, 30);

  if (!filtered.length) {
    container.innerHTML = '<div class="no-results"><div class="no-results-icon">—</div>' +
      '<p>No articles match the current filters.</p>' +
      '<p style="margin-top:8px;"><button onclick="clearAllFilters()" style="background:transparent;border:0.5px solid var(--border2);color:var(--accent);padding:6px 14px;border-radius:20px;cursor:pointer;font-family:inherit;font-size:13px;">Clear filters</button></p></div>';
    return;
  }

  container.innerHTML = filtered.map(function(a) {
    // Security: sanitise title and summary
    if (!a.title) return '';
    if (a.title.toLowerCase().indexOf('sponsored') === 0) return '';
    var title   = a.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var summary = (a.summary || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    if (summary.length < 80 || (a.source || '').toLowerCase().indexOf('google news') > -1) summary = '';
    var href = (a.link && a.link.indexOf('http') === 0) ? a.link : '#';

    // Reading time from title + summary words
    var wordCount = (title + ' ' + summary).split(/\s+/).length;
    var mins = Math.max(1, Math.ceil(wordCount / 220));
    var readTime = mins + ' min read';

    // Tags — clickable to filter
    var tags = (a.tags || []).map(function(t) {
      var isActive = activeFilters.topic.indexOf(t) > -1;
      var cls = tagClass(t) + (isActive ? ' tag--active' : '');
      return '<span class="' + cls + '" ' +
        'onclick="event.preventDefault();toggleTagFilter(\'topic\',\'' + t.replace(/'/g, "\\'") + '\')" ' +
        'role="button" tabindex="0" aria-label="Filter by ' + t + '">' + t + '</span>';
    }).join('');

    // Threat tag — clickable
    var threatVal = a.threat || 'Advisory';
    var isThActive = activeFilters.threat.indexOf(threatVal) > -1;
    var threatBtn = '<span class="' + threatClass(a.threat) + (isThActive ? ' tag--active' : '') + '" ' +
      'onclick="event.preventDefault();toggleTagFilter(\'threat\',\'' + threatVal + '\')" ' +
      'role="button" tabindex="0" aria-label="Filter by ' + threatVal + ' threat">' + threatDot(a.threat) + '</span>';

    var dateStr  = a.date ? formatDateAEST(a.date) : '';
    var datePart = dateStr ? '<span class="dot">·</span><span class="art-date">' + dateStr + '</span>' : '';
    var summaryPart = summary ? '<div class="art-summary">' + summary.substring(0, 240) + '</div>' : '';

    return '<a class="article" href="' + href + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="art-meta">' +
        '<span class="source">' + (a.source || '').replace(/</g,'&lt;') + '</span>' +
        datePart +
        '<span class="dot">·</span>' +
        '<span class="art-reading-time">' + readTime + '</span>' +
      '</div>' +
      '<div class="art-title">' + title + '</div>' +
      summaryPart +
      '<div class="art-tags">' + tags + threatBtn + '</div>' +
    '</a>';
  }).join('');
}

// ── RENDER CVE ─────────────────────────────────────────────
function renderCVE(items) {
  var el = document.getElementById('cve-feed');
  if (!el) return;
  if (!items || !items.length) {
    el.innerHTML = '<div class="cve-loading">No CVE data available.</div>';
    return;
  }
  el.innerHTML = items.slice(0, 10).map(function(c) {
    var sev    = (c.severity || 'HIGH').toUpperCase();
    var sevCls = sev === 'CRITICAL' ? 'cve-sev--critical' : 'cve-sev--high';
    var ransom = c.ransomware === 'Known' ? '<span class="cve-ransomware">⚠ Ransomware</span>' : '';
    var desc   = (c.description || '').substring(0, 120) + (c.description && c.description.length > 120 ? '…' : '');
    var link   = c.link || 'https://nvd.nist.gov/vuln/detail/' + (c.id || '');
    var added  = c.published ? c.published : '';
    return '<a class="cve-item" href="' + link + '" target="_blank" rel="noopener noreferrer" role="listitem">' +
      '<div class="cve-id-row">' +
        '<span class="cve-id">' + (c.id || '') + '</span>' +
        '<span class="cve-sev ' + sevCls + '">● ' + sev + '</span>' +
        ransom +
      '</div>' +
      '<div class="cve-desc">' + desc.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' +
      (added ? '<div class="cve-date">Added ' + added + '</div>' : '') +
    '</a>';
  }).join('');
}

// ── RENDER TOOLS ───────────────────────────────────────────
function renderTools() {
  var el = document.getElementById('tools-container');
  if (!el) return;
  if (!allTools.length) {
    el.innerHTML = '<div class="sb-empty">No tool updates available.</div>';
    return;
  }
  var grouped = {};
  allTools.forEach(function(t) {
    if (!grouped[t.tool]) grouped[t.tool] = [];
    grouped[t.tool].push(t);
  });
  el.innerHTML = Object.entries(grouped).map(function(entry) {
    var tool  = entry[0];
    var items = entry[1].slice(0, 3);
    var rows  = items.map(function(i) {
      var title = (i.title || '');
      if (/^v\d+\.\d+/.test(title)) title = tool + ' ' + title;
      if (title.length > 80) title = title.substring(0, 77) + '…';
      title = title.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var href = (i.link && i.link.indexOf('http') === 0) ? i.link : '#';
      return '<a class="tool-item" href="' + href + '" target="_blank" rel="noopener noreferrer">' +
        '<div class="tool-item-title">' + title + '</div>' +
        (i.date ? '<div class="tool-item-date">' + i.date + '</div>' : '') +
      '</a>';
    }).join('');
    var toolKey = tool.toLowerCase().replace(/[\s\/]+/g, '-').replace(/[^a-z0-9-]/g, '');
    return '<div class="tool-group"><div class="tool-name" data-tool="' + toolKey + '">' +
      tool.replace(/</g,'&lt;') + '</div>' + rows + '</div>';
  }).join('');
}

// ── SCAM OF THE WEEK ───────────────────────────────────────
function renderScamOfWeek(articles) {
  var callout = document.getElementById('scam-callout');
  if (!callout) return;
  var scams = articles
    .filter(function(a) { return (a.tags || []).indexOf('Scams') > -1 && a.link && a.title; })
    .sort(function(a, b) { return parseArticleDate(b.date) - parseArticleDate(a.date); });
  if (!scams.length) {
    var el = document.getElementById('scam-callout');
    if (el) el.style.display = 'none';
    return;
  }
  var s = scams[0];
  var titleEl = document.getElementById('scam-title');
  var metaEl  = document.getElementById('scam-meta');
  var linkEl  = document.getElementById('scam-link');
  if (titleEl) titleEl.textContent = s.title || '';
  if (metaEl)  metaEl.textContent  = (s.source || '') + (s.date ? '  ·  ' + s.date : '');
  if (linkEl)  { linkEl.href = s.link; }
  callout.style.display = 'flex';
}

// ── AI BRIEFING ────────────────────────────────────────────
function toggleBriefing() {
  var body = document.getElementById('briefing-body');
  var btn  = document.getElementById('briefing-toggle');
  if (!body) return;
  var isOpen = body.classList.contains('briefing-body--open');
  if (isOpen) {
    body.classList.remove('briefing-body--open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  } else {
    body.classList.add('briefing-body--open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
}

function loadBriefing() {
  var textEl = document.getElementById('briefing-text');
  var dateEl = document.getElementById('briefing-date');
  if (!textEl) return;
  fetch('briefing.json?t=' + Date.now(), { cache: 'no-cache' })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      var item = (data.items && typeof data.items === 'object' && !Array.isArray(data.items))
        ? data.items : data;
      if (item.briefing) {
        textEl.textContent = item.briefing;
        if (dateEl && item.date) dateEl.textContent = item.date;
      } else {
        var panel = document.getElementById('briefing-panel');
        if (panel) panel.style.display = 'none';
      }
    })
    .catch(function() {
      var panel = document.getElementById('briefing-panel');
      if (panel) panel.style.display = 'none';
    });
}

// ── WORD OF THE DAY ────────────────────────────────────────
function initWotd() {
  if (typeof DEFINITIONS === 'undefined' || !DEFINITIONS.length) return;
  renderWotd(DEFINITIONS);
  var strip = document.getElementById('wotd-strip');
  if (strip) strip.style.opacity = '1';
}

// ── DATA LOAD ──────────────────────────────────────────────
async function loadData() {
  var luEl = document.getElementById('last-updated');
  var fuEl = document.getElementById('footer-updated');

  // 1. News feed
  try {
    var res  = await fetch('news.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    allArticles = Array.isArray(data.items) ? data.items : [];
    var ts = data.last_updated ? formatDateAEST(data.last_updated) : '';
    if (luEl) { luEl.textContent = ts ? 'Updated ' + ts : ''; luEl.classList.add('visible'); }
    if (fuEl)   fuEl.textContent = ts ? 'Updated ' + ts : '';
    renderArticles();
    renderScamOfWeek(allArticles);
  } catch(e) {
    var c = document.getElementById('articles-container');
    if (c) c.innerHTML = '<div class="no-results"><div class="no-results-icon">—</div>' +
      '<p>Could not load news feed. ' + (e.message || '') + '</p></div>';
    if (luEl) luEl.textContent = 'Load failed';
  }

  // 2. Tool updates
  try {
    var res2  = await fetch('tool_updates.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res2.ok) throw new Error('HTTP ' + res2.status);
    var data2 = await res2.json();
    allTools  = Array.isArray(data2.items) ? data2.items : [];
    renderTools();
  } catch(e) {}

  // 3. CVE feed
  try {
    var res3  = await fetch('cve.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res3.ok) throw new Error('HTTP ' + res3.status);
    var data3 = await res3.json();
    var cveItems = Array.isArray(data3.items) ? data3.items :
      (typeof data3.items === 'object' ? (data3.items.items || []) : []);
    renderCVE(cveItems);
  } catch(e) {
    var cveEl = document.getElementById('cve-feed');
    if (cveEl) cveEl.innerHTML = '<div class="cve-loading">CVE data unavailable.</div>';
  }
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateTracker();
  setInterval(updateTracker, 6000);
  initBarChart();
  initWotd();
  loadBriefing();
  loadData();
});
