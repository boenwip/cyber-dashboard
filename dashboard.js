/**
 * dashboard.js — pseudosec. Dashboard
 * A bento overview whose panels open a split-view explorer (list + detail).
 * Requires: shared.js (esc, safeUrl, formatDate, parseDate, pickForToday, renderWotd, SYDNEY),
 *           definitions.js (DEFINITIONS)
 */

var DAY = 24 * 60 * 60 * 1000;
var D = { news: [], cve: [], tools: [], report: null, featured: null };

// ── FINANCIAL YEAR TRACKER ─────────────────────────────────
// Projection only: the latest ASD annual rate (data/annual_report.json)
// applied from 1 July of the current Australian financial year.
function currentFy(now) {
  var year = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, year: 'numeric' }).format(now);
  var month = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, month: 'numeric' }).format(now);
  var start = month >= 7 ? year : year - 1;
  return {
    year: start,
    start: new Date(start + '-07-01T00:00:00+10:00'),
    end: new Date((start + 1) + '-07-01T00:00:00+10:00'),
    label: 'FY ' + start + '–' + String(start + 1).slice(2)
  };
}

function updateTracker() {
  var el = document.getElementById('main-count');
  if (!el || !D.report) return;
  var fy = currentFy(new Date());
  var secs = Math.max(0, (Date.now() - fy.start) / 1000);
  el.textContent = Math.floor(secs * D.report.reports_per_year / (365.25 * 86400)).toLocaleString('en-AU');
}

function renderTracker() {
  var fy = currentFy(new Date());
  var days = Math.round((fy.end - fy.start) / DAY);
  var day = Math.min(days, Math.floor((Date.now() - fy.start) / DAY) + 1);
  var pct = (day / days * 100).toFixed(1) + '%';
  setText('fy-label', fy.label);
  setText('fy-day', 'Day ' + day + ' of ' + days);
  document.getElementById('fy-fill').style.width = pct;
  document.getElementById('fy-here').style.left = pct;
  if (D.report) setText('report-interval', 'One report every ' + D.report.report_interval + ', at last year\'s rate.');
  updateTracker();
}

// ── HELPERS ────────────────────────────────────────────────
function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

var SHORT_SOURCE = {
  'Australian Cyber Security Magazine': 'AU Cyber Security Mag',
  'Security Brief Australia': 'Security Brief',
  'Bleeping Computer AU': 'BleepingComputer',
  'Guardian AU Cyber': 'The Guardian',
  'The Register AU': 'The Register',
  'ABC Tech': 'ABC',
  'Privacy & Compliance AU': 'Google News',
  'ACSC (via Google News)': 'ACSC'
};
function sourceName(s) {
  var name = String(s || '').replace(/^Google News\s*[—-]\s*/i, '');
  return SHORT_SOURCE[name] || name;
}
// Google News headlines end with the publisher ("… - bleepingcomputer.com", "… – BleepingComputer")
function headline(t, source) {
  var s = String(t || '').replace(/\s+[-–|]\s+(?:[\w.-]+\.(?:com|net|org|co|au)(?:\.au)?|The Guardian|The Register|ABC News|Cyber\.gov\.au)\s*$/i, '');
  var pub = sourceName(source).toLowerCase().replace(/\s+/g, '');
  var m = s.match(/^(.*\S)\s+[-–|]\s+([^-–|]{3,40})$/);
  return m && pub && m[2].toLowerCase().replace(/\s+/g, '') === pub ? m[1] : s;
}
function when(item) { return parseDate(item.latest || item.date); }
function within(item, days) { var d = when(item); return !!d && Date.now() - d < days * DAY; }

var SEV = { Critical: 'crit', High: 'high', Advisory: 'adv' };
function acscChip(threat) {
  if (!threat) return '<span class="chip">ACSC</span>';
  var label = threat === 'Advisory' ? 'ACSC advisory' : 'ACSC ' + threat.toLowerCase() + ' alert';
  return '<span class="chip chip--' + (SEV[threat] || 'adv') + '">' + esc(label) + '</span>';
}

var TIPS = [
  ['Start with your email', 'Turn on multi-factor authentication for your email first. It\'s where every password-reset link goes, so it\'s the key to everything else. An authenticator app or a passkey is stronger than text-message codes.'],
  ['Use a password manager', 'You remember one strong passphrase and it creates and fills the rest. Most phones and browsers include one for free.'],
  ['Hang up and call back', 'A bank, telco or government agency won\'t ask for your password, PIN or one-time code over the phone. Hang up and call back on a number you find yourself.'],
  ['Check for breaches', 'See whether your email has appeared in a data breach at haveibeenpwned.com. If it has, change that password everywhere you used it.'],
  ['Keep things updated', 'Most attacks use flaws that already have a fix. Turn on automatic updates for your phone, computer and browser.'],
  ['Don\'t reuse passwords', 'If one site is breached, attackers try the same email and password everywhere else. A different password per site keeps one breach to one account.'],
  ['Type the address yourself', 'Don\'t use links in unexpected texts or emails to log in. Open the app or type the website address yourself; scammers rely on you clicking.'],
  ['Back up what matters', 'Keep a copy of important files somewhere separate, like an external drive or cloud storage. With a backup, ransomware is an inconvenience rather than a disaster.'],
  ['Lock your phone', 'Use a PIN, fingerprint or face unlock. A swipe pattern can often be guessed from the smudges on your screen.'],
  ['Trust your gut', 'If a call, email or message feels off, stop. Contact the organisation through details you find yourself. Legitimate organisations won\'t mind.']
];

// ── OVERVIEW PANELS ────────────────────────────────────────
function officialItems() { return D.news.filter(function (s) { return s.official; }); }

function renderAlertPanel() {
  var recent = officialItems().filter(function (s) { return within(s, 14); });
  var alert = recent.filter(function (s) { return s.threat === 'Critical' || s.threat === 'High'; })[0] || recent[0];
  if (!alert) {
    setText('alert-title', 'No ACSC alerts in the last two weeks.');
    document.getElementById('alert-chip').innerHTML = '';
    return;
  }
  setText('alert-title', headline(alert.title, alert.source));
  setText('alert-meta', 'ACSC · ' + formatDate(alert.date));
  document.getElementById('alert-chip').innerHTML = acscChip(alert.threat);
}

function renderCvePanel() {
  var week = D.cve.filter(function (c) { return c.date_added && Date.now() - parseDate(c.date_added + 'T00:00:00+10:00') < 7 * DAY; });
  setText('cve-count', String(week.length || D.cve.length));
  setText('cve-sub', week.length ? 'vulnerabilities added to CISA\'s list in the last 7 days' : 'recently added to CISA\'s list');
}

function scamStories() { return D.news.filter(function (s) { return (s.tags || []).indexOf('Scams') > -1; }); }

function renderScamPanel() {
  var pick = scamStories().filter(function (s) { return /scamwatch/i.test(s.source || '') || /\bscam/i.test(s.title || ''); })[0] || scamStories()[0];
  setText('scam-title', pick ? headline(pick.title, pick.source) : 'No scam stories this week.');
  setText('scam-src', pick ? sourceName(pick.source) : '');
}

function newsPreview() {
  var week = D.news.filter(function (s) { return within(s, 7); });
  var list = week.slice();
  if (D.featured) {
    var i = list.findIndex(function (s) { return s.link === D.featured.link; });
    if (i > 0) list.unshift(list.splice(i, 1)[0]);
  }
  setText('news-count', week.length + ' stories this week');
  document.getElementById('news-preview').innerHTML = list.slice(0, 7).map(function (s) {
    var more = s.coverage && s.coverage.length ? '<span class="more">+' + s.coverage.length + ' more</span>' : '';
    return '<span><span>' + esc(headline(s.title, s.source)) + '</span><span class="src">' + esc(sourceName(s.source)) + more + '</span></span>';
  }).join('') || '<span class="small">No stories this week.</span>';
}

function renderCrimePanel() {
  var group = D.report && D.report.crime_types && D.report.crime_types[0];
  if (!group) return;
  var el = document.getElementById('crime-bars');
  el.innerHTML = group.items.map(function (it) {
    return '<span><span class="row"><span>' + esc(it.name) + '</span><b>' + esc(it.pct) + '%</b></span><span class="track"><i data-w="' + (+it.pct || 0) + '"></i></span></span>';
  }).join('');
  sizeBars(el);
}

function sizeBars(root) {
  root.querySelectorAll('i[data-w]').forEach(function (i) { i.style.width = Math.min(100, +i.getAttribute('data-w')) + '%'; });
}

function renderToolsPanel() {
  var seen = {}, rows = [];
  D.tools.forEach(function (t) { if (!seen[t.tool] && rows.length < 3) { seen[t.tool] = 1; rows.push(t); } });
  document.getElementById('tools-preview').innerHTML = rows.map(function (t) {
    return '<span><b>' + esc(t.tool) + '</b><i>' + esc(t.title) + '</i></span>';
  }).join('') || '<span class="small">No updates right now.</span>';
}

// ── EXPLORER TOPICS ────────────────────────────────────────
function linkButton(url, label) {
  var href = safeUrl(url);
  return href ? '<a class="go" href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>' : '';
}

function storyView(s) {
  var cov = s.coverage || [];
  return '<div class="meta">' + (s.official ? acscChip(s.threat) : '') + (s.tags || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
    '<h2>' + esc(headline(s.title, s.source)) + '</h2>' +
    '<div class="meta"><span>' + esc(sourceName(s.source)) + '</span><span>' + esc(formatDate(s.date, true)) + '</span>' +
      (cov.length ? '<span>Covered by ' + (cov.length + 1) + ' outlets</span>' : '') + '</div>' +
    (hasSummary(s) ? '<p class="body">' + esc(s.summary) + '</p>' : '') +
    linkButton(s.link, 'Read on ' + sourceName(s.source)) +
    (cov.length ? '<div class="coverage"><h3>Also covered by</h3>' + cov.map(function (c) {
      var href = safeUrl(c.link);
      var inner = esc(headline(c.title, c.source)) + '<span>' + esc(sourceName(c.source)) + ' · ' + esc(formatDate(c.date)) + '</span>';
      return href ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>' : '<div>' + inner + '</div>';
    }).join('') + '</div>' : '');
}

// Google News "summaries" only repeat the headline and publisher, so they're not shown.
function hasSummary(s) {
  return !!s.summary && s.summary.length > 60 && !/Google News/i.test(s.source || '');
}

function storyItem(s) {
  var cov = s.coverage && s.coverage.length ? ' · +' + s.coverage.length : '';
  return { k: sourceName(s.source) + ' · ' + formatDate(s.latest || s.date) + cov, sev: s.official ? (SEV[s.threat] || '') : '', t: headline(s.title, s.source), tags: s.tags || [], view: function () { return storyView(s); } };
}

function buildTopics() {
  var r = D.report;
  var fy = currentFy(new Date());
  var topics = {
    alerts: { label: 'ACSC alerts', items: officialItems().map(function (s) {
      var it = storyItem(s); it.k = (s.threat || 'ACSC') + ' · ' + formatDate(s.date); return it;
    }), empty: 'No ACSC alerts or advisories in the last two weeks.' },
    cve: { label: 'Exploited now', items: D.cve.map(function (c) {
      return { k: c.id + ' · fix by ' + formatDate(c.due_date + 'T00:00:00+10:00'), sev: 'high', t: c.name || c.id, view: function () {
        return '<span class="chip chip--high">Actively exploited</span><h2>' + esc(c.name || c.id) + '</h2>' +
          '<div class="meta"><span>' + esc(c.id) + '</span>' + (c.ransomware === 'Known' ? '<span>Used in ransomware</span>' : '') + '</div>' +
          '<p class="body">' + esc(c.description) + '</p>' +
          '<div class="facts"><div><b>' + esc(formatDate(c.date_added + 'T00:00:00+10:00')) + '</b>added to CISA\'s list</div>' +
          '<div><b>' + esc(formatDate(c.due_date + 'T00:00:00+10:00')) + '</b>CISA fix-by deadline</div>' +
          '<div><b>' + (c.ransomware === 'Known' ? 'Yes' : 'Not known') + '</b>used in ransomware</div></div>' +
          linkButton(c.link, 'Details on NVD') +
          '<p class="aside">If your organisation runs this product, apply the vendor\'s fix now. The fix-by date is the deadline CISA sets for US federal agencies; it\'s a good guide to urgency anywhere.</p>';
      } };
    }), empty: 'CVE data is unavailable right now.' },
    news: { label: 'News', filters: ['All', 'AU Cyber', 'AI & Tools', 'Scams', 'Compliance'], items: D.news.map(storyItem), empty: 'No stories match.' },
    scams: { label: 'Scams', items: scamStories().map(storyItem), empty: 'No scam stories this week.' },
    year: { label: 'This year', items: r ? [
      { k: fy.label + ' · projection', t: 'Estimated cybercrime reports so far', view: function () {
        return '<span class="chip">Estimate</span><h2>' + esc(document.getElementById('main-count').textContent) + ' estimated reports since 1 July</h2>' +
          '<p class="body">A projection, not a live count. ASD received ' + esc(r.reports_per_year.toLocaleString('en-AU')) + ' cybercrime reports in FY' + esc(r.fy) +
          ', about one every ' + esc(r.report_interval) + '. This spreads that rate across the current financial year. ASD notes that most cybercrime is never reported at all.</p>' +
          '<div class="facts"><div><b>' + esc(document.getElementById('fy-day').textContent) + '</b>of the financial year</div><div><b>' +
          esc(r.reports_per_year.toLocaleString('en-AU')) + '</b>reports in FY' + esc(r.fy) + '</div><div><b>' + esc(r.report_interval) + '</b>between reports</div></div>' +
          '<p class="aside">Source: ' + esc(r.title) + '. <a href="sources.html#tracker-methodology">How the estimate works</a></p>';
      } },
      { k: 'FY' + r.fy + ' · ASD report', t: 'Headline figures', view: function () {
        return '<span class="chip">FY' + esc(r.fy) + '</span><h2>Headline figures</h2><div class="facts">' + r.stats.map(function (s) {
          return '<div><b>' + esc(s.value) + '</b>' + esc(s.label) + '</div>';
        }).join('') + '</div>' + linkButton(r.url, 'Read the full report');
      } },
      { k: 'FY' + r.fy + ' · ASD report', t: 'The most reported types of cybercrime', view: function () {
        return '<span class="chip">FY' + esc(r.fy) + '</span><h2>The most reported types of cybercrime</h2>' + r.crime_types.map(function (g) {
          return '<div class="bars"><b>' + esc(g.group) + '</b>' + g.items.map(function (it) {
            return '<span><span class="row"><span>' + esc(it.name) + '</span><b>' + esc(it.pct) + '%</b></span><span class="track"><i data-w="' + (+it.pct || 0) + '"></i></span></span>';
          }).join('') + '</div>';
        }).join('') + '<p class="aside">' + esc(r.crime_types_note || '') + '</p>';
      } }
    ] : [], empty: 'Report figures are unavailable right now.' },
    tools: { label: 'Tool updates', items: D.tools.map(function (t) {
      return { k: t.tool + ' · ' + formatDate(t.date), t: t.title, view: function () {
        return '<span class="chip">' + esc(t.tool) + '</span><h2>' + esc(t.title) + '</h2><div class="meta"><span>' + esc(t.source) + '</span><span>' + esc(formatDate(t.date, true)) + '</span></div>' +
          (t.summary && t.summary.length > 40 ? '<p class="body">' + esc(t.summary) + '</p>' : '') + linkButton(t.link, 'Read the update');
      } };
    }), empty: 'No tool updates right now.' },
    learn: { label: 'Learn', items: learnItems(), empty: '' }
  };
  return topics;
}

function learnItems() {
  var today = pickForToday(TIPS);
  var items = [{ k: 'Tip of the day', t: today[0], view: function () { return '<span class="chip">Tip of the day</span><h2>' + esc(today[0]) + '</h2><p class="body">' + esc(today[1]) + '</p>'; } }];
  var term = typeof DEFINITIONS !== 'undefined' ? pickForToday(DEFINITIONS) : null;
  if (term) items.push({ k: 'Word of the day', t: term.term, view: function () {
    return '<span class="chip">Word of the day</span><h2>' + esc(term.term) + '</h2><p class="body">' + esc(term.full || term.short) + '</p>' +
      (term.example ? '<p class="aside"><b>Example:</b> ' + esc(term.example) + '</p>' : '') +
      '<a class="go" href="reference.html#glossary">Open the glossary</a>';
  } });
  TIPS.forEach(function (t) {
    if (t !== today) items.push({ k: 'Tip', t: t[0], view: function () { return '<span class="chip">Tip</span><h2>' + esc(t[0]) + '</h2><p class="body">' + esc(t[1]) + '</p>'; } });
  });
  return items;
}

// ── EXPLORER ───────────────────────────────────────────────
var ORDER = ['alerts', 'cve', 'news', 'scams', 'year', 'tools', 'learn'];
var TOPICS = null;
var state = { cat: 'news', idx: 0, filter: 'All' };
var fromPanel = null;
var overview, explore, tabs, list, pane;

function visibleItems() {
  var t = TOPICS[state.cat];
  return t.items.filter(function (it) { return state.filter === 'All' || !it.tags || it.tags.indexOf(state.filter) > -1; });
}

function renderTabs() {
  tabs.innerHTML = ORDER.map(function (id) {
    var sel = id === state.cat;
    return '<button type="button" role="tab" data-cat="' + id + '" aria-selected="' + sel + '" aria-controls="list">' +
      esc(TOPICS[id].label) + '<span class="n">' + TOPICS[id].items.length + '</span></button>';
  }).join('');
}

function renderList() {
  var t = TOPICS[state.cat], items = visibleItems();
  list.innerHTML = (t.filters ? '<div class="list-tools">' + t.filters.map(function (f) {
    return '<button type="button" data-filter="' + esc(f) + '" aria-pressed="' + (f === state.filter) + '">' + esc(f) + '</button>';
  }).join('') + '</div>' : '') + (items.length ? items.map(function (it, i) {
    return '<button type="button" class="item" data-idx="' + i + '"' + (i === state.idx ? ' aria-current="true"' : '') + '>' +
      '<span class="k"><span class="sev ' + (it.sev || '') + '"></span>' + esc(it.k) + '</span><span class="t">' + esc(it.t) + '</span></button>';
  }).join('') : '<p class="empty">' + esc(t.empty) + '</p>');
}

function renderPane() {
  var it = visibleItems()[state.idx];
  pane.innerHTML = it ? it.view() : '';
  sizeBars(pane);
  pane.scrollTop = 0;
}

function show(cat, idx) {
  state.cat = TOPICS[cat] ? cat : 'news';
  state.filter = 'All';
  state.idx = Math.min(idx || 0, Math.max(0, TOPICS[state.cat].items.length - 1));
  renderTabs(); renderList(); renderPane();
  try { history.replaceState(null, '', '#' + state.cat); } catch (e) {}
}

function withTransition(fn) {
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(fn);
  else fn();
}

function openExplore(cat, idx, panel) {
  if (!TOPICS) return;
  fromPanel = panel || null;
  if (panel) panel.style.viewTransitionName = 'stage';
  withTransition(function () {
    if (panel) panel.style.viewTransitionName = '';
    show(cat, idx);
    overview.hidden = true;
    explore.hidden = false;
    explore.style.viewTransitionName = 'stage';
  });
  setTimeout(function () { var s = list.querySelector('[aria-current="true"]') || tabs.querySelector('[aria-selected="true"]'); if (s) s.focus(); }, 360);
}

function closeExplore() {
  if (explore.hidden) return;
  withTransition(function () {
    explore.hidden = true;
    overview.hidden = false;
    explore.style.viewTransitionName = '';
    if (fromPanel) fromPanel.style.viewTransitionName = 'stage';
  });
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  setTimeout(function () { if (fromPanel) { fromPanel.style.viewTransitionName = ''; fromPanel.focus(); } }, 360);
}

// ── DATA ───────────────────────────────────────────────────
function getJson(path) {
  return fetch(path, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}

function loadAll() {
  var report = getJson('data/annual_report.json').then(function (d) { D.report = d; renderTracker(); renderCrimePanel(); })
    .catch(function () { setText('report-interval', 'Report figures are unavailable right now.'); });
  var news = getJson('data/news.json').then(function (d) {
    D.news = Array.isArray(d.items) ? d.items : [];
    var ts = formatDate(d.last_updated, true);
    setText('last-updated', ts ? 'Updated ' + ts : '');
    setText('footer-updated', ts ? 'Updated ' + ts : '');
  }).catch(function () { D.news = []; setText('news-count', 'unavailable'); });
  var featured = getJson('data/briefing.json').then(function (d) { D.featured = d.items && d.items.featured; }).catch(function () {});
  var cve = getJson('data/cve.json').then(function (d) { D.cve = Array.isArray(d.items) ? d.items : []; renderCvePanel(); })
    .catch(function () { setText('cve-sub', 'CVE data is unavailable right now.'); });
  var tools = getJson('data/tool_updates.json').then(function (d) { D.tools = Array.isArray(d.items) ? d.items : []; renderToolsPanel(); })
    .catch(function () { document.getElementById('tools-preview').innerHTML = '<span class="small">Unavailable right now.</span>'; });

  Promise.all([news, featured]).then(function () { renderAlertPanel(); renderScamPanel(); newsPreview(); });
  Promise.all([report, news, featured, cve, tools]).then(function () {
    TOPICS = buildTopics();
    var hash = location.hash.replace('#', '');
    if (TOPICS[hash]) openExplore(hash, 0, null);
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  overview = document.getElementById('overview');
  explore = document.getElementById('explore');
  tabs = document.getElementById('tabs');
  list = document.getElementById('list');
  pane = document.getElementById('pane');

  renderTracker();
  setInterval(updateTracker, 6000);
  setText('tip-text', pickForToday(TIPS)[1]);
  if (typeof DEFINITIONS !== 'undefined') renderWotd(DEFINITIONS);
  loadAll();

  overview.addEventListener('click', function (e) {
    var p = e.target.closest('.panel');
    if (p) openExplore(p.dataset.go, +(p.dataset.pick || 0), p);
  });
  document.getElementById('back').addEventListener('click', closeExplore);
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (b) show(b.dataset.cat, 0); });
  list.addEventListener('click', function (e) {
    var f = e.target.closest('[data-filter]');
    if (f) { state.filter = f.dataset.filter; state.idx = 0; renderList(); renderPane(); return; }
    var b = e.target.closest('[data-idx]');
    if (!b) return;
    state.idx = +b.dataset.idx;
    list.querySelectorAll('.item').forEach(function (x) { if (x === b) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
    renderPane();
    if (matchMedia('(max-width: 960px)').matches) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  list.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.item'));
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    var next = items[Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    next.focus(); next.click();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeExplore(); });
});
