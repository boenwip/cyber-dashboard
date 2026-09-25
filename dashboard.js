/**
 * dashboard.js — pseudosec. Dashboard
 * Requires: shared.js (esc, safeUrl, formatDate, pickForToday), definitions.js
 */

// ── TRACKER ────────────────────────────────────────────────
// Projection only: the latest ASD annual rate applied to the current
// financial year. Every report figure comes from data/annual_report.json —
// update that one file when a new Annual Cyber Threat Report is published.
var REPORT = null;
var SECS_YEAR = 365.25 * 24 * 3600;

// Australian financial year containing `now`: starts 1 July (AEST, no DST in July).
function currentFyStart(now) {
  var sydneyYear  = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, year: 'numeric' }).format(now);
  var sydneyMonth = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, month: 'numeric' }).format(now);
  var startYear = sydneyMonth >= 7 ? sydneyYear : sydneyYear - 1;
  return { year: startYear, date: new Date(startYear + '-07-01T00:00:00+10:00') };
}

function fyLabel(startYear) {
  return 'FY ' + startYear + '–' + String(startYear + 1).slice(2);
}

function initTrackerLabels() {
  var fy = currentFyStart(new Date());
  var set = function(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
  set('tracker-fy', fyLabel(fy.year));
  set('count-label', 'Estimated cybercrime reports — ' + fyLabel(fy.year));
  set('count-from', '1 July ' + fy.year);
}

function updateTracker() {
  var el = document.getElementById('main-count');
  if (!el || !REPORT) return;
  var elapsed = Math.max(0, (Date.now() - currentFyStart(new Date()).date) / 1000);
  el.textContent = Math.floor(elapsed * REPORT.reports_per_year / SECS_YEAR).toLocaleString('en-AU');
  el.classList.add('visible');
}

// Stats grid + crime-type chart, both from data/annual_report.json.
function renderReport(r) {
  var set = function(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
  var link = function(id) { var el = document.getElementById(id); if (el && safeUrl(r.url)) el.setAttribute('href', r.url); };
  set('report-source', 'Source: ' + r.title);
  var interval = document.getElementById('report-interval');
  if (interval) interval.innerHTML = 'One report every <strong>' + esc(r.report_interval) + '</strong> · ';
  link('report-link');
  link('report-crime-link');

  var stats = document.getElementById('report-stats');
  if (stats && r.stats && r.stats.length) {
    stats.innerHTML = r.stats.map(function(st) {
      var tone = st.tone === 'high' ? ' ts-n--high' : st.tone === 'med' ? ' ts-n--med' : '';
      return '<div class="ts-item"><span class="ts-n' + tone + '">' + esc(st.value) + '</span>' +
        '<span class="ts-l">' + esc(st.label) + '</span></div>';
    }).join('');
    document.getElementById('report-stats-wrap').hidden = false;
  }

  var groups = document.getElementById('report-crime-groups');
  if (groups && r.crime_types && r.crime_types.length) {
    set('report-crime-title', 'Most reported cybercrime types — FY ' + r.fy);
    set('report-crime-note', r.crime_types_note || '');
    groups.innerHTML = r.crime_types.map(function(g) {
      return '<figure class="crime-group"><figcaption>' + esc(g.group) + '</figcaption>' +
        g.items.map(function(it) {
          var pct = Math.max(0, Math.min(100, Number(it.pct) || 0));
          return '<div class="crime-row"><span class="crime-name">' + esc(it.name) + '</span>' +
            '<span class="crime-track"><span class="crime-bar" data-pct="' + pct + '"></span></span>' +
            '<span class="crime-pct">' + pct + '%</span></div>';
        }).join('') + '</figure>';
    }).join('');
    // Widths via CSSOM, so the CSP needn't allow inline style attributes.
    groups.querySelectorAll('.crime-bar').forEach(function(bar) {
      bar.style.width = bar.getAttribute('data-pct') + '%';
    });
    document.getElementById('report-crime').hidden = false;
  }
}

// ── DAILY ROTATIONS ────────────────────────────────────────
var BLURBS = [
  'From a $30 phishing text to a ransomware attack on a hospital — this counter catches all of it. Most of it isn\'t sophisticated. Most of it is preventable.',
  'The majority of these reports aren\'t headline events. They\'re opportunistic, automated, and aimed at ordinary Australians on an ordinary day.',
  'One number. Hundreds of types of crime. Everything from a compromised email to critical infrastructure — counted together.',
  'Behind every tick is someone navigating a system they didn\'t choose to become familiar with.',
  'Not every cybercrime makes the news. Most never do — and ASD says most are never reported at all.',
  'The scale isn\'t the whole story. A single report can represent a business that didn\'t survive it.',
  'Most victims don\'t realise something went wrong until weeks later. The counter doesn\'t wait.'
];

var TIPS = [
  'Enable multi-factor authentication on your email account first. It\'s the key to resetting everything else — if someone gets into your email, they can get into everything.',
  'Use a password manager. You only need to remember one strong password, and it handles the rest. Most phones and browsers have one built in for free.',
  'Check if your details have been in a data breach at haveibeenpwned.com — it takes ten seconds and the results are often surprising.',
  'Never click links in unexpected texts or emails. Go directly to the website by typing the address yourself. Scammers rely on you not doing this.',
  'Keep your phone and computer updated. Most successful attacks exploit software that hasn\'t been patched. Updates are the simplest defence.',
  'Don\'t reuse passwords across accounts. If one site gets breached, attackers try your credentials everywhere. Different passwords mean one breach stays one breach.',
  'A real bank, telco, or government agency will never ask for your password, PIN, or one-time code over the phone. Hang up and call back on a number you find yourself.',
  'On public Wi-Fi, stick to sites that use HTTPS and keep your device updated. For anything sensitive, your phone\'s mobile data is the safer choice.',
  'Lock your phone with a PIN, fingerprint, or face recognition. A swipe pattern can be lifted from the smudges on your screen.',
  'Back up your important files somewhere separate — an external drive or cloud service. Ransomware makes backups the difference between inconvenient and catastrophic.',
  'Be thoughtful about what you share on LinkedIn. Job titles, team structure, and project names help attackers craft convincing impersonation attempts.',
  'If you get an unexpected "verify your account" or "unusual login" email, don\'t click the link inside it. Open a new tab and log in directly.',
  'Review which apps have access to your camera, microphone, and location. Revoke anything you don\'t recognise or no longer use.',
  'If something feels off about a call, email, or message, trust your gut. Hang up. Call back on a number you find independently. Legitimate organisations won\'t mind.'
];

function initRotations() {
  var voice = document.getElementById('count-voice');
  if (voice) voice.textContent = pickForToday(BLURBS);
  var tip = document.getElementById('sb-tip-text');
  if (tip) tip.textContent = pickForToday(TIPS);
  if (typeof DEFINITIONS !== 'undefined') renderWotd(DEFINITIONS);
}

// ── DATA STATE ─────────────────────────────────────────────
var allArticles = [];
var activeFilters = { topic: [], threat: [] };

function passesFilters(article) {
  var t = activeFilters.topic;
  var h = activeFilters.threat;
  if (t.length && !t.some(function(v) { return (article.tags || []).indexOf(v) > -1; })) return false;
  if (h.length && h.indexOf(article.threat) === -1) return false;
  return true;
}

function toggleFilter(type, value) {
  var list = activeFilters[type];
  var idx = list.indexOf(value);
  if (idx > -1) list.splice(idx, 1);
  else list.push(value);
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
  var tags = document.getElementById('active-filter-tags');
  if (!bar || !tags) return;
  var chips = activeFilters.topic.map(function(v) { return ['topic', v]; })
    .concat(activeFilters.threat.map(function(v) { return ['threat', v]; }));
  bar.hidden = !chips.length;
  tags.innerHTML = chips.map(function(c) {
    return '<button type="button" class="active-filter-chip" data-filter-type="' + c[0] + '" data-filter-value="' + esc(c[1]) + '"' +
      ' aria-label="Remove ' + esc(c[1]) + ' filter">' + esc(c[1]) + ' ✕</button>';
  }).join('');
}

// ── TAG HELPERS ────────────────────────────────────────────
var TAG_CLASS_MAP = {
  'AU Cyber':   'tag-cyber',
  'AI & Tools': 'tag-ai',
  'Scams':      'tag-scam',
  'Compliance': 'tag-comp'
};

// Threat levels exist only on official ACSC items (see scripts/fetch_cyber_news.py).
var THREAT_CLASS = { Critical: 't-critical', High: 't-high', Medium: 't-medium', Low: 't-advisory', Advisory: 't-advisory' };

function filterButton(type, value, cls, label) {
  var pressed = activeFilters[type].indexOf(value) > -1;
  return '<button type="button" class="' + cls + (pressed ? ' tag--active' : '') + '"' +
    ' data-filter-type="' + type + '" data-filter-value="' + esc(value) + '"' +
    ' aria-pressed="' + pressed + '" title="Filter by ' + esc(value) + '">' + label + '</button>';
}

function cleanSource(source) {
  return String(source || '').replace(/^Google News\s*[—-]\s*/i, '');
}

// ── RENDER ARTICLES ────────────────────────────────────────
function renderArticles() {
  var container = document.getElementById('articles-container');
  if (!container) return;

  var weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  var filtered = allArticles
    .filter(passesFilters)
    .filter(function(a) { var d = parseDate(a.date); return !d || d >= weekAgo; })
    .slice(0, 30);

  if (!filtered.length) {
    container.innerHTML = '<div class="no-results"><div class="no-results-icon">—</div>' +
      '<p>No articles match the current filters.</p>' +
      '<p><button type="button" class="no-results-clear" id="no-results-clear">Clear filters</button></p></div>';
    return;
  }

  container.innerHTML = filtered.map(function(a) {
    var href = safeUrl(a.link);
    var title = esc(a.title);
    var summary = String(a.summary || '');
    // Google News summaries just repeat the headline; very short ones add nothing.
    if (summary.length < 80 || /google news/i.test(a.source || '')) summary = '';

    var tags = (a.tags || []).map(function(t) {
      return filterButton('topic', t, 'tag ' + (TAG_CLASS_MAP[t] || ''), esc(t));
    }).join('');
    var threat = a.threat
      ? filterButton('threat', a.threat, 'tag threat-badge ' + (THREAT_CLASS[a.threat] || 't-advisory'), '● ' + esc(a.official ? 'ACSC ' + a.threat : a.threat))
      : a.official ? '<span class="tag threat-badge t-advisory">● ACSC</span>' : '';

    var date = formatDate(a.date, true);
    return '<article class="article' + (a.official ? ' article--official' : '') + '">' +
      '<div class="art-meta">' +
        '<span class="source">' + esc(cleanSource(a.source)) + '</span>' +
        (a.coverage && a.coverage.length ? '<span class="dot" aria-hidden="true">·</span><span class="art-date">+' + a.coverage.length + ' more source' + (a.coverage.length > 1 ? 's' : '') + '</span>' : '') +
        (date ? '<span class="dot" aria-hidden="true">·</span><time class="art-date" datetime="' + esc(a.date) + '">' + esc(date) + '</time>' : '') +
      '</div>' +
      '<h3 class="art-title">' +
        (href ? '<a class="art-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + title + '</a>' : title) +
      '</h3>' +
      (summary ? '<p class="art-summary">' + esc(summary) + '</p>' : '') +
      '<div class="art-tags">' + threat + tags + '</div>' +
    '</article>';
  }).join('');
}

// ── RENDER CVE ─────────────────────────────────────────────
// CISA KEV has no severity score, so none is shown. The fix-by date is the
// deadline CISA sets for US federal agencies — a useful urgency signal.
function renderCVE(items) {
  var el = document.getElementById('cve-feed');
  if (!el) return;
  if (!items || !items.length) {
    el.innerHTML = '<li class="cve-loading">No CVE data available.</li>';
    return;
  }
  el.innerHTML = items.slice(0, 10).map(function(c) {
    var href = safeUrl(c.link);
    var ransom = c.ransomware === 'Known' ? '<span class="cve-ransomware">⚠ Used in ransomware</span>' : '';
    var added = formatDate(c.date_added);
    var due = formatDate(c.due_date);
    var dates = [added ? 'Added ' + added : '', due ? 'CISA fix-by ' + due : ''].filter(Boolean).join(' · ');
    var inner =
      '<div class="cve-id-row">' +
        '<span class="cve-id">' + esc(c.id) + '</span>' +
        (c.name ? '<span class="cve-name">' + esc(c.name) + '</span>' : '') +
        ransom +
      '</div>' +
      '<div class="cve-desc">' + esc(c.description) + '</div>' +
      (dates ? '<div class="cve-date">' + esc(dates) + '</div>' : '');
    return '<li>' + (href
      ? '<a class="cve-item" href="' + href + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
      : '<div class="cve-item">' + inner + '</div>') + '</li>';
  }).join('');
}

// ── RENDER TOOLS ───────────────────────────────────────────
function renderTools(tools) {
  var el = document.getElementById('tools-container');
  if (!el) return;
  if (!tools.length) {
    el.innerHTML = '<div class="sb-empty">No tool updates available.</div>';
    return;
  }
  var grouped = {};
  var order = [];
  tools.forEach(function(t) {
    if (!grouped[t.tool]) { grouped[t.tool] = []; order.push(t.tool); }
    grouped[t.tool].push(t);
  });
  el.innerHTML = order.map(function(tool) {
    var rows = grouped[tool].slice(0, 3).map(function(i) {
      var title = String(i.title || '');
      if (/^v\d+\.\d+/.test(title)) title = tool + ' ' + title;
      if (title.length > 80) title = title.substring(0, 77) + '…';
      var href = safeUrl(i.link);
      var date = formatDate(i.date);
      var inner = '<span class="tool-item-title">' + esc(title) + '</span>' +
        (date ? '<span class="tool-item-date">' + esc(date) + '</span>' : '');
      return '<li>' + (href
        ? '<a class="tool-item" href="' + href + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
        : '<div class="tool-item">' + inner + '</div>') + '</li>';
    }).join('');
    return '<div class="tool-group">' +
      '<h3 class="tool-name"><span class="tool-mono" aria-hidden="true">' + esc(tool.charAt(0)) + '</span>' + esc(tool) + '</h3>' +
      '<ul class="tool-list">' + rows + '</ul></div>';
  }).join('');
}

// ── CALLOUTS ───────────────────────────────────────────────
function showCallout(prefix, item, badgeText) {
  var callout = document.getElementById(prefix + '-callout');
  if (!callout || !item) return;
  var titleEl = document.getElementById(prefix + '-title');
  var metaEl  = document.getElementById(prefix + '-meta');
  var linkEl  = document.getElementById(prefix + '-link');
  var badgeEl = document.getElementById(prefix + '-badge');
  if (titleEl) titleEl.textContent = item.title;
  if (metaEl)  metaEl.textContent = [cleanSource(item.source), formatDate(item.date, true)].filter(Boolean).join(' · ');
  if (badgeEl && badgeText) badgeEl.textContent = badgeText;
  var href = safeUrl(item.link);
  if (linkEl && href) linkEl.setAttribute('href', item.link);
  callout.hidden = false;
}

// Most recent ACSC Critical/High alert from the last 14 days.
function renderOfficialAlert(articles) {
  var cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  var alert = articles.filter(function(a) {
    var d = parseDate(a.date);
    return a.official && (a.threat === 'Critical' || a.threat === 'High') && d && d >= cutoff;
  })[0];
  if (!alert) return;
  showCallout('official', alert, 'ACSC ' + alert.threat + ' alert');
  var callout = document.getElementById('official-callout');
  if (callout) callout.classList.toggle('is-critical', alert.threat === 'Critical');
}

function renderScamOfWeek(articles) {
  // Only items that are about scams: Scamwatch itself, or a headline that says "scam".
  // (The Scams tag alone also catches enterprise phishing research.)
  var scams = articles.filter(function(a) {
    return (a.tags || []).indexOf('Scams') > -1 && a.link && a.title &&
      (/scamwatch/i.test(a.source || '') || /\bscam/i.test(a.title));
  });
  var fromScamwatch = scams.filter(function(a) { return /scamwatch/i.test(a.source || ''); });
  var s = (fromScamwatch.length ? fromScamwatch : scams)[0];
  if (!s) return;
  showCallout('scam', {
    title: String(s.title).replace(/\s*[-–|]\s*(Scamwatch|Scam\s+Watch|ACCC).*$/i, '').trim(),
    source: s.source, date: s.date, link: s.link
  });
}

// ── FEATURED STORY ─────────────────────────────────────────
// Selected server-side by cross-source coverage, not by AI —
// see select_trending_article() in scripts/fetch_cyber_news.py.
function renderFeaturedStory(f) {
  var el = document.getElementById('featured-story');
  if (!el || !f || !f.title) return;
  var href = safeUrl(f.link);
  var count = parseInt(f.source_count, 10) || 1;
  var meta = [cleanSource(f.source), count > 1 ? 'Covered by ' + count + ' sources' : ''].filter(Boolean).join(' · ');
  el.innerHTML =
    '<div class="fs-label">Today\'s story</div>' +
    (f.summary ? '<p class="fs-quote">' + esc(f.summary) + '</p>' : '') +
    (href ? '<a class="fs-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(f.title) + ' ↗</a>'
          : '<div class="fs-link">' + esc(f.title) + '</div>') +
    (meta ? '<div class="fs-source">' + esc(meta) + '</div>' : '');
  el.hidden = false;
}

// ── DATA LOAD ──────────────────────────────────────────────
function getJson(path) {
  return fetch(path, { cache: 'no-cache' }).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}

function loadData() {
  getJson('data/news.json').then(function(data) {
    allArticles = Array.isArray(data.items) ? data.items : [];
    var ts = formatDate(data.last_updated, true);
    var lu = document.getElementById('last-updated');
    var fu = document.getElementById('footer-updated');
    if (lu) lu.textContent = ts ? 'Updated ' + ts : '';
    if (fu) fu.textContent = ts ? 'Updated ' + ts : '';
    renderArticles();
    renderOfficialAlert(allArticles);
    renderScamOfWeek(allArticles);
  }).catch(function() {
    var c = document.getElementById('articles-container');
    if (c) c.innerHTML = '<div class="no-results"><div class="no-results-icon">—</div><p>Could not load the news feed. Try refreshing.</p></div>';
  });

  getJson('data/tool_updates.json').then(function(data) {
    renderTools(Array.isArray(data.items) ? data.items : []);
  }).catch(function() {
    var el = document.getElementById('tools-container');
    if (el) el.innerHTML = '<div class="sb-empty">Tool updates unavailable.</div>';
  });

  getJson('data/cve.json').then(function(data) {
    renderCVE(Array.isArray(data.items) ? data.items : []);
  }).catch(function() {
    var el = document.getElementById('cve-feed');
    if (el) el.innerHTML = '<li class="cve-loading">CVE data unavailable.</li>';
  });

  getJson('data/annual_report.json').then(function(data) {
    REPORT = data;
    renderReport(data);
    updateTracker();
  }).catch(function() {});

  getJson('data/briefing.json').then(function(data) {
    if (data.items && data.items.featured) renderFeaturedStory(data.items.featured);
  }).catch(function() {});
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initTrackerLabels();
  setInterval(updateTracker, 6000);
  initRotations();
  loadData();

  var clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);

  // One delegated handler for every filter button (article tags + active chips).
  document.addEventListener('click', function(e) {
    if (e.target.closest('#no-results-clear')) { clearAllFilters(); return; }
    var btn = e.target.closest('[data-filter-type]');
    if (btn) toggleFilter(btn.getAttribute('data-filter-type'), btn.getAttribute('data-filter-value'));
  });
});
