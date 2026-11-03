/**
 * dashboard.js — pseudosec. Dashboard
 * A stage that shows one topic at a time in that topic's colour, a switch between
 * topics, and a reader (list + detail) for the open topic.
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

function countNow() {
  var fy = currentFy(new Date());
  var secs = Math.max(0, (Date.now() - fy.start) / 1000);
  return D.report ? Math.floor(secs * D.report.reports_per_year / (365.25 * 86400)).toLocaleString('en-AU') : '—';
}

function updateTracker() {
  var el = document.getElementById('main-count');
  if (el && D.report && !el.dataset.decoding) el.textContent = countNow();
}

function fyDay() {
  var fy = currentFy(new Date());
  var days = Math.round((fy.end - fy.start) / DAY);
  return 'Day ' + Math.min(days, Math.floor((Date.now() - fy.start) / DAY) + 1) + ' of ' + days;
}

function renderTracker() {
  setText('d-year', fyDay());
  if (!D.report) return;
  setText('report-interval', 'That\'s one every ' + D.report.report_interval + ', at last year\'s rate.');
  var el = document.getElementById('main-count');
  el.dataset.decoding = '1';
  decode(el, countNow(), 620, '0123456789', function () { delete el.dataset.decoding; });
}

// ── HELPERS ────────────────────────────────────────────────
function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

var STILL = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Terminal-style reveal: letters settle from left to right
function decode(el, text, ms, chars, done) {
  if (STILL) { el.textContent = text; if (done) done(); return; }
  var start = performance.now();
  (function frame(now) {
    var t = Math.min(1, Math.max(0, (now - start) / ms)), n = Math.floor(t * text.length), out = text.slice(0, n);
    for (var i = n; i < text.length; i++) out += /[\s,]/.test(text[i]) ? text[i] : chars[Math.floor(Math.random() * chars.length)];
    el.textContent = out;
    if (t < 1) { requestAnimationFrame(frame); return; }
    el.textContent = text;
    if (done) done();
  })(start);
}

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

// ── STAGE SCREENS ──────────────────────────────────────────
function officialItems() { return D.news.filter(function (s) { return s.official; }); }
function scamStories() { return D.news.filter(function (s) { return (s.tags || []).indexOf('Scams') > -1; }); }

function renderAlert() {
  var recent = officialItems().filter(function (s) { return within(s, 14); });
  var alert = recent.filter(function (s) { return s.threat === 'Critical' || s.threat === 'High'; })[0] || recent[0];
  var label = document.getElementById('alert-label');
  if (!alert) {
    setText('alert-title', 'No ACSC alerts in the last two weeks.');
    return;
  }
  setText('alert-title', headline(alert.title, alert.source));
  setText('alert-when', formatDate(alert.date));
  label.textContent = !alert.threat ? 'ACSC' : alert.threat === 'Advisory' ? 'ACSC advisory' : 'ACSC ' + alert.threat.toLowerCase() + ' alert';
  label.classList.toggle('is-sev', alert.threat === 'Critical' || alert.threat === 'High');
}

// The latest report's headline figures, and its most reported crime types
function renderReport() {
  var r = D.report;
  if (!r) return;
  var link = document.getElementById('report-link'), href = safeUrl(r.url);
  link.textContent = r.title;
  if (href) link.setAttribute('href', r.url);
  document.getElementById('report-stats').innerHTML = (r.stats || []).map(function (s) {
    return '<div><b>' + esc(s.value) + '</b>' + esc(s.label) + '</div>';
  }).join('');
  var crime = document.getElementById('crime-bars');
  crime.innerHTML = (r.crime_types || []).map(function (g) {
    return '<div class="bars"><b>' + esc(g.group) + ', FY' + esc(r.crime_types_fy || r.fy) + '</b>' + g.items.map(function (it) {
      return '<span><span class="row"><span>' + esc(it.name) + '</span><b>' + esc(it.pct) + '%</b></span><span class="track"><i data-w="' + (+it.pct || 0) + '"></i></span></span>';
    }).join('') + '</div>';
  }).join('');
  sizeBars(crime);
}

function renderCve() {
  var week = D.cve.filter(function (c) { return c.date_added && Date.now() - parseDate(c.date_added + 'T00:00:00+10:00') < 7 * DAY; });
  var list = week.length ? week : D.cve;
  setText('cve-count', String(list.length));
  setText('d-cve', list.length + (week.length ? ' this week' : ' recently'));
  setText('cve-sub', 'flaws attackers are already using, added to CISA\'s list ' + (week.length ? 'in the last 7 days.' : 'recently.'));
  document.getElementById('cve-rows').innerHTML = list.slice(0, 7).map(function (c) {
    var href = safeUrl(c.link);
    return href ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(c.name || c.id) + '<small>' + esc(c.id) + '</small></a>' : '';
  }).join('');
}

function storyRow(s) {
  var href = safeUrl(s.link);
  return href ? '<a class="story" href="' + href + '" target="_blank" rel="noopener noreferrer"><small><b>' + esc(sourceName(s.source)) + '</b> ' + esc(formatDate(s.latest || s.date)) + '</small>' +
    '<div><h3>' + esc(headline(s.title, s.source)) + '</h3>' + (hasSummary(s) ? '<p>' + esc(s.summary) + '</p>' : '') + '</div></a>' : '';
}

function renderNews() {
  var week = D.news.filter(function (s) { return within(s, 7); });
  var list = (week.length ? week : D.news).slice();
  if (D.featured) {
    var i = list.findIndex(function (s) { return s.link === D.featured.link; });
    if (i > 0) list.unshift(list.splice(i, 1)[0]);
  }
  setText('d-news', week.length + ' stories this week');
  var lead = list[0], a = document.getElementById('news-lead');
  if (!lead) { setText('news-lead-title', 'No stories this week.'); return; }
  var href = safeUrl(lead.link);
  if (href) a.setAttribute('href', lead.link);
  setText('news-lead-title', headline(lead.title, lead.source));
  setText('news-lead-summary', hasSummary(lead) ? lead.summary : '');
  document.getElementById('news-pair').innerHTML = list.slice(1, 4).map(function (s) {
    var h = safeUrl(s.link);
    return h ? '<a href="' + h + '" target="_blank" rel="noopener noreferrer">' + esc(headline(s.title, s.source)) + '<small>' + esc(sourceName(s.source)) + ', ' + esc(formatDate(s.date)) + '</small></a>' : '';
  }).join('');
  document.getElementById('latest').innerHTML = list.slice(0, 8).map(storyRow).join('');
}

function renderTools() {
  var seen = {}, rows = [];
  D.tools.forEach(function (t) { if (!seen[t.tool] && rows.length < 4) { seen[t.tool] = 1; rows.push(t); } });
  document.getElementById('tools-rows').innerHTML = rows.map(function (t) {
    var href = safeUrl(t.link);
    return href ? '<a class="update" href="' + href + '" target="_blank" rel="noopener noreferrer"><b>' + esc(t.tool) + ', ' + esc(formatDate(t.date)) + '</b>' + esc(t.title) + '</a>' : '';
  }).join('');
}

function renderLearn() {
  var tip = pickForToday(TIPS);
  setText('tip-title', 'Tip of the day: ' + tip[0].toLowerCase());
  setText('tip-text', tip[1]);
  if (typeof DEFINITIONS === 'undefined') return;
  renderWotd(DEFINITIONS);
  setText('d-learn', pickForToday(DEFINITIONS).term);
}

function sizeBars(root) {
  root.querySelectorAll('i[data-w]').forEach(function (i) { i.style.width = Math.min(100, +i.getAttribute('data-w')) + '%'; });
}

// ── SPOT THE SCAM ──────────────────────────────────────────
// One hand-written message a day from data/puzzles.json. Progress (streak,
// correct count, today's answer) is stored in this browser only.
var LAUNCH_DAY = 20751;   // 25 Oct 2026 — puzzle #1
var RANKS = [
  { name: 'Curious',         at: 0 },
  { name: 'Alert',           at: 3 },
  { name: 'Scam Spotter',    at: 10 },
  { name: 'Family Guardian', at: 25 }
];
var PUZZLE_KEY = 'csi-puzzle';
var puzzle = null;
var puzzleNo = 0;

function loadStore(key, fallback) {
  try { var v = JSON.parse(localStorage.getItem(key)); return v && typeof v === 'object' ? v : fallback; }
  catch (e) { return fallback; }
}
function saveStore(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

function puzzleState() {
  return loadStore(PUZZLE_KEY, { last: null, streak: 0, correct: 0, played: 0, today: null });
}

function renderPhone(p) {
  var top = p.channel === 'email'
    ? '<div class="phone-top"><span class="sender">' + esc(p.from) + '</span><span class="addr">' + esc(p.address || '') + '</span></div>' +
      '<p class="mail-subject">' + esc(p.subject || '') + '</p>'
    : '<div class="phone-top"><span class="sender">Text from ' + esc(p.from) + '</span><span>Today ' + esc(p.time || '') + '</span><span>Would you trust it?</span></div>';
  var body = p.body.map(function (seg) {
    var cls = [];
    if (seg.g != null) cls.push('hl');
    if (seg.link) cls.push('fake-link');
    var text = esc(seg.t).replace(/\n/g, '<br>');
    if (seg.g != null) text += '<sup>' + (seg.g + 1) + '</sup>';
    return cls.length ? '<span class="' + cls.join(' ') + '"' + (seg.g != null ? ' data-g="' + seg.g + '"' : '') + '>' + text + '</span>' : text;
  }).join('');
  var el = document.getElementById('puzzle-phone');
  el.className = 'phone phone--' + (p.channel === 'email' ? 'email' : 'sms');
  el.setAttribute('aria-label', p.channel === 'email' ? 'Example email' : 'Example text message');
  el.innerHTML = top + '<div class="bubble">' + body + '</div>';
}

function rankFor(correct) {
  var r = 0;
  RANKS.forEach(function (k, i) { if (correct >= k.at) r = i; });
  return r;
}

function renderProgress(st) {
  var streakEl = document.getElementById('puzzle-streak');
  var r = rankFor(st.correct);
  var next = RANKS[r + 1];
  var parts = [];
  if (st.streak > 0) parts.push('<strong>' + st.streak + '-day streak</strong>');
  else parts.push('<strong>Start a streak today</strong>');
  if (next) {
    var left = next.at - st.correct;
    parts.push('<span>' + left + ' more right ' + (left === 1 ? 'answer' : 'answers') + ' to reach ' + esc(next.name) + '</span>');
  } else {
    parts.push('<span>Top rank reached. Keep the streak going.</span>');
  }
  streakEl.innerHTML = parts.join('');
  document.getElementById('puzzle-ranks').innerHTML = RANKS.map(function (k, i) {
    var cls = i <= r ? 'rank done' : (i === r + 1 ? 'rank next' : 'rank');
    var label = esc(k.name) + (i <= r ? '<span class="visually-hidden"> (reached)</span>' : (i === r + 1 ? '<span class="visually-hidden"> (next)</span>' : ''));
    return '<li class="' + cls + '">' + label + '</li>';
  }).join('');
  document.getElementById('puzzle-share').hidden = st.last !== sydneyDayNumber();
}

function showResult(choice) {
  var right = choice === puzzle.answer;
  var res = document.getElementById('puzzle-result');
  var scam = puzzle.answer === 'scam';
  var head = right
    ? (scam ? 'Nice spot. This one\'s a scam.' : 'Good call. This one\'s real.')
    : (scam ? 'This one fools lots of people. Here\'s the giveaway.' : 'Fair enough to be careful. This one\'s real.');
  res.className = 'result ' + (right ? 'result--good' : 'result--bad');
  res.innerHTML = '<p class="result-h">' + esc(head) + '</p>' +
    '<p class="result-lead">' + (scam ? (right ? '' : 'It\'s a scam. ') + 'The giveaways are highlighted in the message:' : 'What makes it trustworthy:') + '</p>' +
    '<ol>' + puzzle.giveaways.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ol>';
  res.hidden = false;
  document.getElementById('puzzle-panel').classList.add('is-answered');
  document.querySelectorAll('#puzzle-phone .hl').forEach(function (h) { h.classList.add('on'); });
  document.querySelectorAll('#puzzle-choices .choice').forEach(function (b) {
    b.disabled = true;
    b.setAttribute('aria-pressed', b.dataset.answer === choice ? 'true' : 'false');
  });
}

function answerPuzzle(choice) {
  var st = puzzleState();
  var today = sydneyDayNumber();
  if (st.last === today) return;
  var right = choice === puzzle.answer;
  st.streak = st.last === today - 1 ? st.streak + 1 : 1;
  st.last = today;
  st.played += 1;
  if (right) st.correct += 1;
  st.today = { day: today, choice: choice, right: right };
  saveStore(PUZZLE_KEY, st);
  showResult(choice);
  renderProgress(st);
  if (right) hopSwoop();
}

function sharePuzzle() {
  var st = puzzleState();
  var t = st.today || {};
  var text = 'Spot the scam #' + puzzleNo + ': ' + (t.right ? 'got it right' : 'got caught out') +
    (st.streak > 1 ? ', ' + st.streak + '-day streak' : '') + '. Try today\'s: ' + siteUrl();
  var done = document.getElementById('puzzle-share-done');
  if (canNativeShare()) {
    navigator.share({ title: 'Spot the scam', text: text }).catch(function () {});
    return;
  }
  copyText(text).then(function () { done.textContent = 'Copied. Paste it anywhere.'; },
                      function () { done.textContent = text; });
}

function initPuzzle() {
  var panel = document.getElementById('puzzle-panel');
  if (!panel) return;
  fetch('data/puzzles.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      var items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) return;
      var today = sydneyDayNumber();
      puzzleNo = Math.max(1, today - LAUNCH_DAY + 1);
      puzzle = items[(puzzleNo - 1) % items.length];
      setText('d-scams', 'Puzzle ' + puzzleNo);
      var ctx = document.getElementById('puzzle-context');
      ctx.hidden = !puzzle.context;
      if (puzzle.context) ctx.textContent = puzzle.context;
      renderPhone(puzzle);

      var st = puzzleState();
      if (st.last != null && st.last < today - 1) st.streak = 0;   // missed a day
      if (st.today && st.today.day === today) showResult(st.today.choice);
      renderProgress(st);

      panel.addEventListener('click', function (e) {
        var b = e.target.closest('.choice');
        if (b && !b.disabled) { answerPuzzle(b.dataset.answer); return; }
        if (e.target.closest('#puzzle-share-btn')) sharePuzzle();
      });
      panel.hidden = false;
      document.getElementById('puzzle-unavailable').hidden = true;
    })
    .catch(function () { setText('puzzle-unavailable', 'Today\'s message is unavailable right now.'); });
}

// ── READER TOPICS ────────────────────────────────────────
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
  return { k: sourceName(s.source) + ' · ' + formatDate(s.latest || s.date) + cov, sev: s.official ? (SEV[s.threat] || '') : '', t: headline(s.title, s.source), tags: (s.tags || []).concat(s.official ? [ALERTS] : []), view: function () { return storyView(s); } };
}

var ALERTS = 'ACSC alerts', TOOLS = 'Tool updates';

function buildTopics() {
  var r = D.report;
  var fy = currentFy(new Date());
  var topics = {
    cve: { label: 'all exploited flaws', jump: 'All flaws', items: D.cve.map(function (c) {
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
    news: { label: 'all stories', jump: 'All stories', filters: ['All', ALERTS, 'AU Cyber', 'AI & Tools', 'Scams', 'Compliance', TOOLS], items: D.news.map(storyItem).concat(toolItems()), empty: 'No stories match.' },
    scams: { label: 'scam stories', jump: 'Scam stories', items: scamStories().map(storyItem), empty: 'No scam stories this week.' },
    year: { label: 'report figures', jump: 'All report figures', items: r ? [
      { k: fy.label + ' · projection', t: 'Estimated cybercrime reports so far', view: function () {
        return '<span class="chip">Estimate</span><h2>' + esc(countNow()) + ' estimated reports since 1 July</h2>' +
          '<p class="body">A projection, not a live count. ASD received ' + esc(r.reports_per_year.toLocaleString('en-AU')) + ' cybercrime reports in FY' + esc(r.fy) +
          ', about one every ' + esc(r.report_interval) + '. This spreads that rate across the current financial year. ASD notes that most cybercrime is never reported at all.</p>' +
          '<div class="facts"><div><b>' + esc(fyDay()) + '</b>of the financial year</div><div><b>' +
          esc(r.reports_per_year.toLocaleString('en-AU')) + '</b>reports in FY' + esc(r.fy) + '</div><div><b>' + esc(r.report_interval) + '</b>between reports</div></div>' +
          '<p class="aside">Source: ' + esc(r.title) + '. <a href="sources.html#tracker-methodology">How the estimate works</a></p>';
      } },
      { k: 'FY' + r.fy + ' · ASD report', t: 'Headline figures', view: function () {
        return '<span class="chip">FY' + esc(r.fy) + '</span><h2>Headline figures</h2><div class="facts">' + r.stats.map(function (s) {
          return '<div><b>' + esc(s.value) + '</b>' + esc(s.label) + '</div>';
        }).join('') + '</div>' + linkButton(r.url, 'Read the full report');
      } },
      { k: 'FY' + (r.crime_types_fy || r.fy) + ' · ASD report', t: 'The most reported types of cybercrime', view: function () {
        return '<span class="chip">FY' + esc(r.crime_types_fy || r.fy) + '</span><h2>The most reported types of cybercrime</h2>' + r.crime_types.map(function (g) {
          return '<div class="bars"><b>' + esc(g.group) + '</b>' + g.items.map(function (it) {
            return '<span><span class="row"><span>' + esc(it.name) + '</span><b>' + esc(it.pct) + '%</b></span><span class="track"><i data-w="' + (+it.pct || 0) + '"></i></span></span>';
          }).join('') + '</div>';
        }).join('') + '<p class="aside">' + esc(r.crime_types_note || '') + '</p>' +
          (r.crime_types_url && r.crime_types_url !== r.url ? linkButton(r.crime_types_url, 'Read the FY' + r.crime_types_fy + ' report') : '');
      } }
    ].concat(r.ai ? [
      { k: 'FY' + r.fy + ' · ASD report', t: r.ai.title, view: function () {
        return '<span class="chip">FY' + esc(r.fy) + '</span><h2>' + esc(r.ai.title) + '</h2><p class="body">' + esc(r.ai.summary) + '</p>' +
          r.ai.points.map(function (p) { return '<p class="body">' + esc(p) + '</p>'; }).join('') +
          (r.ai.facts && r.ai.facts.length ? '<div class="facts">' + r.ai.facts.map(function (s) {
            return '<div><b>' + esc(s.value) + '</b>' + esc(s.label) + '</div>';
          }).join('') + '</div>' : '') +
          (r.ai.advice ? '<p class="body">' + esc(r.ai.advice) + '</p>' : '') +
          '<p class="aside">' + esc(r.ai.note || '') + '</p>' + linkButton(r.url, 'Read the full report');
      } }
    ] : []) : [], empty: 'Report figures are unavailable right now.' },
    learn: { label: 'tips and terms', jump: 'All tips', items: learnItems(), empty: '' }
  };
  return topics;
}

// Tool updates live under News, behind their own filter
function toolItems() {
  return D.tools.map(function (t) {
    return { k: t.tool + ' · ' + formatDate(t.date), t: t.title, tags: [TOOLS], filterOnly: true, view: function () {
      return '<span class="chip">' + esc(t.tool) + '</span><h2>' + esc(t.title) + '</h2><div class="meta"><span>' + esc(t.source) + '</span><span>' + esc(formatDate(t.date, true)) + '</span></div>' +
        (t.summary && t.summary.length > 40 ? '<p class="body">' + esc(t.summary) + '</p>' : '') + linkButton(t.link, 'Read the update');
    } };
  });
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

// ── READER ─────────────────────────────────────────────────
var TOPICS = null;
var state = { cat: 'year', idx: 0, filter: 'All' };
var reader, list, pane;

function visibleItems() {
  var t = TOPICS[state.cat];
  return t.items.filter(function (it) { return state.filter === 'All' ? !it.filterOnly : !!it.tags && it.tags.indexOf(state.filter) > -1; });
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

function narrow() { return matchMedia('(max-width: 960px)').matches; }

function renderPane() {
  var it = visibleItems()[state.idx];
  // On narrow screens the list and the item take turns; this button goes back to the list.
  pane.innerHTML = it ? '<button type="button" class="pane-back" id="pane-back">Back to ' + esc(TOPICS[state.cat].label) + '</button>' + it.view() : '';
  sizeBars(pane);
  pane.scrollTop = 0;
}

function showReader(cat, filter) {
  if (!TOPICS) return;
  state.cat = cat;
  state.filter = filter || 'All';
  state.idx = 0;
  reader.classList.remove('show-item');
  var label = TOPICS[cat].label;
  setText('reader-cmd', label.charAt(0).toUpperCase() + label.slice(1));
  setText('jump', TOPICS[cat].jump);
  renderList(); renderPane();
}

// Opens an item under This year: 2 is the crime breakdown, 3 the AI summary
function openFigure(idx) {
  flood('year', null, null, function () {
    state.idx = Math.min(idx, visibleItems().length - 1);
    renderList(); renderPane();
    scrollToReader();
  });
}

function scrollToReader() { reader.scrollIntoView({ block: 'start', behavior: STILL ? 'auto' : 'smooth' }); }

// ── THE SWITCH ─────────────────────────────────────────────
var COLOURS = { year: '#f7d768', news: '#3d4fe0', scams: '#fb9a7e', cve: '#8fe6cc', learn: '#f5c4e3' };
var COMMANDS = { year: 'this year', news: 'news', scams: 'spot the scam', cve: 'exploited', learn: 'learn' };
var current = 'year', wiping = false;
var stage, screenEl, below, switchBar, tabs;

function markTab(topic) {
  tabs.forEach(function (b) {
    var on = b.dataset.t === topic;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
}

function fillStage(topic, filter) {
  document.querySelectorAll('[data-screen]').forEach(function (s) { s.hidden = s.dataset.screen !== topic; });
  decode(document.getElementById('cmd'), COMMANDS[topic], 260, 'abcdefgh/_-');
  below.classList.toggle('is-news', topic === 'news');
  below.classList.toggle('is-year', topic === 'year');
  showReader(topic, filter);
  if (topic === 'year') renderTracker();
}

function setHash(topic) {
  try { history.replaceState(null, '', topic === 'year' ? location.pathname + location.search : '#' + topic); } catch (e) {}
}

function stuck() { return switchBar.classList.contains('is-stuck'); }

// The colour change: blocks the shape of the logo's cursor spread from the topic you picked
function flood(topic, from, filter, then) {
  if (topic === current) { showReader(topic, filter); if (then) then(); return; }
  if (wiping) return;
  current = topic;
  setHash(topic);
  markTab(topic);

  if (STILL || stuck() || !from) {
    document.body.dataset.topic = topic;
    fillStage(topic, filter);
    placeSwoop(false);
    if (stuck() && !then) reader.scrollIntoView({ block: 'start' });
    if (then) then();
    return;
  }

  wiping = true;
  screenEl.classList.add('is-swapping');
  placeSwoop(true);
  var canvas = document.getElementById('wipe'), ctx = canvas.getContext('2d');
  var box = stage.getBoundingClientRect(), W = 32, H = 52, dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = box.width * dpr; canvas.height = box.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = COLOURS[topic];
  var fb = from.getBoundingClientRect(), ox = fb.left + fb.width / 2 - box.left, oy = fb.top + fb.height / 2 - box.top;
  var cells = [], far = 0;
  for (var y = 0; y < box.height; y += H) for (var x = 0; x < box.width; x += W) {
    var d = Math.sqrt(Math.pow(x + W / 2 - ox, 2) + Math.pow(y + H / 2 - oy, 2)) + Math.random() * 150;
    if (d > far) far = d;
    cells.push({ x: x, y: y, d: d });
  }
  cells.sort(function (a, b) { return a.d - b.d; });
  var start = performance.now(), MS = 380, i = 0, swapped = false;
  (function frame(now) {
    var t = Math.min(1, Math.max(0, (now - start) / MS)), reach = t * far;
    while (i < cells.length && cells[i].d <= reach) { ctx.fillRect(cells[i].x, cells[i].y, W + .5, H + .5); i++; }
    if (!swapped && t > .5) { swapped = true; document.body.dataset.topic = topic; }
    if (t < 1) { requestAnimationFrame(frame); return; }
    fillStage(topic, filter);
    ctx.clearRect(0, 0, box.width, box.height);
    screenEl.classList.remove('is-swapping');
    wiping = false;
    if (then) then();
  })(start);
}

// ── SWOOP ──────────────────────────────────────────────────
// A small pixel magpie, made of the same blocks as the logo's cursor. It stands above
// the open topic, hops when the topic changes, and hops when you spot today's scam.
var SWOOP = [
  '................KKKK...',
  '...............KKKKKK..',
  '...............KKWKKKGG',
  '...............KKKKKGG.',
  '..............WWKKKK...',
  '............WWWWKKKK...',
  '........KKKKWWKKKKKK...',
  '.....KKKKKWWWKKKKKKK...',
  '...KKKKWWWWWKKKKKKK....',
  'KKKKKKWWWWKKKKKKKK.....',
  'KKKK..KKKKKKKKKKK......',
  'K........KKKKKKK.......',
  '..........K...K........',
  '..........K...K........',
  '.........KK..KK........'
];
var swoopEl, swoopX = null;

function drawSwoop() {
  var fill = { K: '#000', W: '#fff', G: '#c9c9c9' }, rects = '';
  SWOOP.forEach(function (row, y) {
    row.split('').forEach(function (ch, x) { if (fill[ch]) rects += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + fill[ch] + '"/>'; });
  });
  swoopEl.querySelector('.swoop-in').innerHTML = '<svg viewBox="0 0 23 15">' + rects + '</svg>';
}

function hopSwoop() {
  swoopEl.classList.remove('is-hop');
  void swoopEl.offsetWidth;
  swoopEl.classList.add('is-hop');
}

function placeSwoop(hop) {
  var tab = document.getElementById('tab-' + current), r = tab.getBoundingClientRect(), bar = switchBar.getBoundingClientRect();
  var x = Math.round(r.right - bar.left - swoopEl.offsetWidth - Math.min(14, r.width * .1));
  if (hop && swoopX !== null && x !== swoopX) {
    swoopEl.classList.toggle('is-left', x < swoopX);
    hopSwoop();
  }
  swoopX = x;
  // Only a hop travels; anything else (first paint, a resize) puts Swoop straight there
  if (!hop) swoopEl.style.transition = 'none';
  swoopEl.style.transform = 'translateX(' + x + 'px)';
  if (!hop) { void swoopEl.offsetWidth; swoopEl.style.transition = ''; }
}

// ── DATA ───────────────────────────────────────────────────
function getJson(path) {
  return fetch(path, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}

function loadAll() {
  var report = getJson('data/annual_report.json').then(function (d) { D.report = d; renderTracker(); renderReport(); })
    .catch(function () { setText('report-interval', 'Report figures are unavailable right now.'); });
  var news = getJson('data/news.json').then(function (d) {
    D.news = Array.isArray(d.items) ? d.items : [];
    var ts = formatDate(d.last_updated, true);
    setText('last-updated', ts ? 'Updated ' + ts : '');
    setText('footer-updated', ts ? 'Updated ' + ts : '');
  }).catch(function () { D.news = []; setText('news-lead-title', 'News is unavailable right now.'); });
  var featured = getJson('data/briefing.json').then(function (d) { D.featured = d.items && d.items.featured; }).catch(function () {});
  var cve = getJson('data/cve.json').then(function (d) { D.cve = Array.isArray(d.items) ? d.items : []; renderCve(); })
    .catch(function () { setText('cve-sub', 'CVE data is unavailable right now.'); });
  var tools = getJson('data/tool_updates.json').then(function (d) { D.tools = Array.isArray(d.items) ? d.items : []; renderTools(); })
    .catch(function () {});

  Promise.all([news, featured]).then(function () { renderAlert(); renderNews(); });
  Promise.all([report, news, featured, cve, tools]).then(function () {
    TOPICS = buildTopics();
    // #alerts and #tools are older links: both now live under News
    var hash = location.hash.replace('#', ''), filter = hash === 'alerts' ? ALERTS : hash === 'tools' ? TOOLS : null;
    var topic = filter ? 'news' : hash;
    if (COMMANDS[topic] && topic !== 'year') {
      current = topic;
      document.body.dataset.topic = topic;
      markTab(topic);
      fillStage(topic, filter);
      placeSwoop(false);
    } else showReader('year');
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  stage = document.getElementById('stage');
  screenEl = document.getElementById('screen');
  below = document.getElementById('below');
  switchBar = document.getElementById('switch');
  swoopEl = document.getElementById('swoop');
  tabs = Array.prototype.slice.call(switchBar.querySelectorAll('[role="tab"]'));
  reader = document.getElementById('reader');
  list = document.getElementById('list');
  pane = document.getElementById('pane');

  renderTracker();
  setInterval(updateTracker, 6000);
  renderLearn();
  loadAll();
  initPuzzle();

  drawSwoop();
  placeSwoop(false);
  window.addEventListener('resize', function () { placeSwoop(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeSwoop(false); });
  new IntersectionObserver(function (e) { switchBar.classList.toggle('is-stuck', !e[0].isIntersecting); }).observe(stage);

  tabs.forEach(function (b, n) {
    b.addEventListener('click', function () { flood(b.dataset.t, b); });
    b.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var next = tabs[(n + step + tabs.length) % tabs.length];
      next.focus();
      flood(next.dataset.t, next);
    });
  });
  document.getElementById('jump').addEventListener('click', scrollToReader);
  document.getElementById('alert').addEventListener('click', function (e) { flood('news', e.currentTarget, ALERTS, scrollToReader); });
  document.getElementById('all-stories').addEventListener('click', function () { flood('news', null, 'All', scrollToReader); });
  document.getElementById('all-crime').addEventListener('click', function () { openFigure(2); });
  document.getElementById('report-ai').addEventListener('click', function () { openFigure(3); });
  document.getElementById('all-tools').addEventListener('click', function () { flood('news', null, TOOLS, scrollToReader); });

  list.addEventListener('click', function (e) {
    var f = e.target.closest('[data-filter]');
    if (f) { state.filter = f.dataset.filter; state.idx = 0; renderList(); renderPane(); return; }
    var b = e.target.closest('[data-idx]');
    if (!b) return;
    state.idx = +b.dataset.idx;
    list.querySelectorAll('.item').forEach(function (x) { if (x === b) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
    renderPane();
    if (narrow()) {
      reader.classList.add('show-item');
      reader.scrollIntoView({ block: 'start' });
      var back = document.getElementById('pane-back');
      if (back) back.focus();
    }
  });
  pane.addEventListener('click', function (e) {
    if (!e.target.closest('#pane-back')) return;
    reader.classList.remove('show-item');
    var cur = list.querySelector('[aria-current="true"]');
    if (cur) { cur.focus(); cur.scrollIntoView({ block: 'center' }); }
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
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') reader.classList.remove('show-item');
  });
});
