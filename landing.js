/* landing.js — pseudosec. The home page: today's top 5 stories, the ACSC alert when there
   is one, and Swoop the lookout. Requires shared.js (esc, safeUrl, formatDate, parseDate, SYDNEY). */

// The old home page's #topic links now live on dashboard.html
if (/^#(year|news|scams|cve|learn|alerts|tools)$/.test(location.hash)) location.replace('dashboard.html' + location.hash);

var DAY = 86400000;
var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── SWOOP, the lookout ─────────────────────────────────────
// Frames are 23 x 16 pixels. K black, W white, G grey (beak).
var BASE = [
  '.......................', '................KKKK...', '...............KKKKKK..', '...............KKWKKKGG',
  '...............KKKKKGG.', '..............WWKKKK...', '............WWWWKKKK...', '........KKKKWWKKKKKK...',
  '.....KKKKKWWWKKKKKKK...', '...KKKKWWWWWKKKKKKK....', 'KKKKKKWWWWKKKKKKKK.....', 'KKKK..KKKKKKKKKKK......',
  'K........KKKKKKK.......', '..........K...K........', '..........K...K........', '.........KK..KK........'
];
var FRAMES = {
  idle: BASE,
  blink: BASE.map(function (r, y) { return y === 3 ? r.slice(0, 17) + 'K' + r.slice(18) : r; }),
  alert: ['................KKKK...', '...............KKKKKK..', '...............KKWKKKGG', '...............KKKKKGG.',
          '................KKKK...'].concat(BASE.slice(5)),
  fly: [
    '........KK.............', '........KKK.....KKKK...', '.........KKK...KKKKKK..', '.........KWKK..KKWKKKGG',
    '..........WWKK.KKKKKGG.', '..........WWWKKKKKK....', '...........WWKKKKKK....', '........KKKKKKKKKKKK...',
    '.....KKKKKKKKKKKKKK....', '...KKKKKWWWKKKKKKK.....', 'KKKKKKKWWKKKKKKK.......', 'KKKK.....KKKKK.........',
    'K......................', '.......................', '.......................', '.......................'
  ]
};
var FILL = { K: '#1a1a1a', W: '#ffffff', G: '#9a968d' };

function pixels(rows) {
  var r = '';
  rows.forEach(function (row, y) {
    row.split('').forEach(function (ch, x) { if (FILL[ch]) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + FILL[ch] + '"/>'; });
  });
  return '<svg viewBox="0 0 23 16" aria-hidden="true" shape-rendering="crispEdges">' + r + '</svg>';
}

var swoop, rest = 'idle', busy = false;
function pose(name) { swoop.querySelector('.bird').innerHTML = pixels(FRAMES[name]); }
// Play frames in order: [name, ms], then settle on the resting pose
function play(steps, done) {
  busy = true;
  (function next(i) {
    if (i === steps.length) { pose(rest); busy = false; if (done) done(); return; }
    pose(steps[i][0]);
    setTimeout(function () { next(i + 1); }, steps[i][1]);
  })(0);
}

// His mood comes from real data: a critical/high ACSC alert in the last two weeks, any alert, or none
function arrive(mood) {
  swoop.dataset.mood = mood;
  rest = mood === 'calm' ? 'idle' : 'alert';
  swoop.setAttribute('aria-label', mood === 'calm' ? 'Swoop, the lookout: a quiet day' :
    mood === 'alert' ? 'Swoop, the lookout: there is an ACSC alert' : 'Swoop, the lookout: there is a serious ACSC alert');
  if (REDUCED) { pose(rest); return; }
  if (mood === 'calm') play([['idle', 700], ['blink', 140], ['idle', 260], ['blink', 140]]);
  else if (mood === 'alert') { pose('idle'); setTimeout(function () { swoop.classList.add('ruffle'); play([['alert', 10]]); }, 500); }
  else {
    // One swoop across the top of the page, then he lands on his perch, alert
    swoop.classList.add('incoming');
    var flaps = [];
    for (var i = 0; i < 10; i++) flaps.push([i % 2 ? 'idle' : 'fly', 120]);
    void swoop.offsetWidth;   // apply the start position before the transition
    setTimeout(function () { swoop.classList.add('landing'); swoop.classList.remove('incoming'); }, 20);
    play(flaps.concat([['alert', 10]]), function () { swoop.classList.remove('landing'); swoop.classList.add('ruffle'); });
  }
}

function initSwoop(mood) {
  swoop = document.getElementById('swoop');
  pose('idle');
  arrive(mood);
  // He responds to you, and only to you
  function react() {
    if (busy || REDUCED) return;
    swoop.classList.remove('hop', 'ruffle'); void swoop.offsetWidth; swoop.classList.add('hop');
    play([['blink', 140], [rest, 10]]);
  }
  swoop.addEventListener('mouseenter', react);
  swoop.addEventListener('click', react);
}

// ── STORIES ────────────────────────────────────────────────
function topic(s) {
  var t = s.tags || [];
  if (s.official) return { key: 'acsc', label: 'ACSC' };
  if (t.indexOf('Scams') > -1) return { key: 'scams', label: 'Scams' };
  if (t.indexOf('AI & Tools') > -1) return { key: 'ai', label: 'AI and tools' };
  return { key: 'cyber', label: 'Cyber' };
}
function clean(t) { return String(t || '').replace(/\s+[-–|]\s+[^-–|]{2,40}$/, ''); }
function outlets(s) { return 1 + (s.coverage ? s.coverage.length : 0); }
function when(s) { return parseDate(s.latest || s.date); }
function within(d, days) { return d && Date.now() - d < days * DAY; }

function metaLine(s) {
  var n = outlets(s);
  return '<span class="tp">' + esc(topic(s).label) + '</span> ' + esc(s.source) + ', ' + esc(formatDate(s.latest || s.date)) + (n > 1 ? ', covered by ' + n + ' outlets' : '');
}

function renderTop(items, featured) {
  var week = items.filter(function (s) { return within(when(s), 7); });
  var list = (week.length ? week : items).slice().sort(function (a, b) { return outlets(b) - outlets(a) || when(b) - when(a); });
  if (featured) {
    var i = list.findIndex(function (s) { return s.link === featured.link; });
    if (i > 0) list.unshift(list.splice(i, 1)[0]);
  }
  var top = list.slice(0, 5), lead = top[0];
  if (!lead) { document.getElementById('lead').textContent = 'No stories this week.'; return; }
  var tp = topic(lead), href = safeUrl(lead.link);
  document.getElementById('lead').innerHTML =
    '<div class="lead-panel t-' + tp.key + '"><span class="rank">1</span><span class="topic">' + esc(tp.label) + '</span></div>' +
    '<div class="lead-text"><p class="meta">' + metaLine(lead) + '</p>' +
    '<h2><a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(clean(lead.title)) + '</a></h2>' +
    (lead.summary ? '<p class="lede">' + esc(lead.summary) + '</p>' : '') + '</div>';
  document.getElementById('more-stories').innerHTML = top.slice(1).map(function (s, i) {
    return '<li><a href="' + safeUrl(s.link) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="sq t-' + topic(s).key + '">' + (i + 2) + '</span>' +
      '<span class="txt"><b>' + esc(clean(s.title)) + '</b><small>' + metaLine(s) + '</small></span></a></li>';
  }).join('');
}

function findAlert(items) {
  var recent = items.filter(function (s) { return s.official && within(when(s), 14) && safeUrl(s.link); });
  return recent.filter(function (s) { return s.threat === 'Critical' || s.threat === 'High'; })[0] || recent[0] || null;
}
function showAlert(a) {
  var el = document.getElementById('alert');
  if (!a) { el.hidden = true; return; }
  el.hidden = false;
  el.href = a.link;
  el.innerHTML = '<b>' + esc(a.threat ? 'ACSC ' + a.threat.toLowerCase() + ' alert' : 'ACSC alert') + '</b><span>' + esc(clean(a.title)) + '</span>' +
    (a.date ? '<time>' + esc(formatDate(a.date)) + '</time>' : '');
}

// The one quiet line onward
function renderOnward(cves, report) {
  var fresh = cves.filter(function (c) { return within(parseDate(c.date_added + 'T00:00:00Z'), 7); }).length;
  document.getElementById('on-cve').textContent = fresh ? fresh + ' newly exploited ' + (fresh === 1 ? 'bug' : 'bugs') : 'Exploited bugs';
  if (!report) return;
  var month = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, month: 'numeric' }).format(new Date());
  var year = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, year: 'numeric' }).format(new Date());
  var start = new Date((month >= 7 ? year : year - 1) + '-07-01T00:00:00+10:00');
  var n = Math.floor((Date.now() - start) / 1000 * report.reports_per_year / (365.25 * 86400));
  document.getElementById('on-year').textContent = n.toLocaleString('en-AU') + ' reports this year';
}

function getJson(p) { return fetch(p, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }

// His mood: no alert is calm, a critical or high alert is critical, anything else is alert
function moodFor(a) { return !a ? 'calm' : (a.threat === 'Critical' || a.threat === 'High') ? 'critical' : 'alert'; }

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('date').textContent = new Date().toLocaleDateString('en-AU', { timeZone: SYDNEY, weekday: 'long', day: 'numeric', month: 'long' });
  var news = getJson('data/news.json'), brief = getJson('data/briefing.json').catch(function () { return {}; });
  Promise.all([news, brief]).then(function (r) {
    var items = Array.isArray(r[0].items) ? r[0].items : [], a = findAlert(items), ts = formatDate(r[0].last_updated, true);
    document.getElementById('last-updated').textContent = document.getElementById('footer-updated').textContent = ts ? 'Updated ' + ts : '';
    renderTop(items, r[1].items && r[1].items.featured);
    showAlert(a);
    initSwoop(moodFor(a));
  }).catch(function () { document.getElementById('lead').textContent = 'News is unavailable right now.'; });
  Promise.all([getJson('data/cve.json').catch(function () { return { items: [] }; }), getJson('data/annual_report.json').catch(function () { return null; })])
    .then(function (r) { renderOnward(r[0].items || [], r[1]); });
});
