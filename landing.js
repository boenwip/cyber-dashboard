/* landing.js — pseudosec. The home page: today's top 5 stories, the ACSC alert when there
   is one, and Swoop the lookout. Requires shared.js (esc, safeUrl, formatDate, parseDate, SYDNEY). */

// The old home page's #topic links now live on dashboard.html
if (location.hash === '#scams') location.replace('play.html');
else if (location.hash === '#cve') location.replace('exploited.html');
else if (/^#(year|news|learn|alerts|tools)$/.test(location.hash)) location.replace('dashboard.html' + location.hash);

var DAY = 86400000;
var sw;   // Swoop, from swoop.js

// His mood comes from real data: a critical/high ACSC alert in the last two weeks, any alert, or none
function arrive(mood) {
  var swoop = sw.el;
  swoop.dataset.mood = mood;
  sw.rest = mood === 'calm' ? 'idle' : 'alert';
  swoop.setAttribute('aria-label', mood === 'calm' ? 'Swoop, the lookout: a quiet day' :
    mood === 'alert' ? 'Swoop, the lookout: there is an ACSC alert' : 'Swoop, the lookout: there is a serious ACSC alert');
  if (SWOOP_REDUCED) { sw.pose(sw.rest); return; }
  if (mood === 'calm') sw.play([['idle', 700], ['blink', 140], ['idle', 260], ['blink', 140]]);
  else if (mood === 'alert') { setTimeout(function () { swoop.classList.add('ruffle'); sw.play([['alert', 10]]); }, 500); }
  else {
    // One swoop across the top of the page, then he lands on his perch, alert
    swoop.classList.add('incoming');
    var flaps = [];
    for (var i = 0; i < 10; i++) flaps.push([i % 2 ? 'idle' : 'fly', 120]);
    void swoop.offsetWidth;   // apply the start position before the transition
    setTimeout(function () { swoop.classList.add('landing'); swoop.classList.remove('incoming'); }, 20);
    sw.play(flaps.concat([['alert', 10]]), function () { swoop.classList.remove('landing'); swoop.classList.add('ruffle'); });
  }
}

function initSwoop(mood) {
  sw = Swoop(document.getElementById('swoop'));
  arrive(mood);
  // He responds to you, and only to you
  function react() { sw.react('hop'); }
  sw.el.addEventListener('mouseenter', react);
  sw.el.addEventListener('click', react);
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
  return esc(s.source) + ', ' + esc(formatDate(s.latest || s.date)) + (n > 1 ? ', covered by ' + n + ' outlets' : '');
}
function tile(s, cls, inner) {
  return '<a class="tile ' + cls + ' t-' + topic(s).key + '" href="' + safeUrl(s.link) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>';
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
  document.getElementById('lead').outerHTML = tile(lead, 'lead',
    '<span class="topic">' + esc(topic(lead).label) + '</span><h2>' + esc(clean(lead.title)) + '</h2>' +
    (lead.summary ? '<p>' + esc(lead.summary) + '</p>' : '') + '<small>' + metaLine(lead) + '</small>');
  document.getElementById('tiles').insertAdjacentHTML('beforeend', top.slice(1).map(function (s, i) {
    return tile(s, '', '<span class="tile-top"><span class="n">' + (i + 2) + '</span><span class="topic">' + esc(topic(s).label) + '</span></span>' +
      '<h3>' + esc(clean(s.title)) + '</h3><small>' + metaLine(s) + '</small>');
  }).join(''));
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
  }).catch(function () { var l = document.getElementById('lead'); if (l) l.textContent = 'News is unavailable right now.'; });
  Promise.all([getJson('data/cve.json').catch(function () { return { items: [] }; }), getJson('data/annual_report.json').catch(function () { return null; })])
    .then(function (r) { renderOnward(r[0].items || [], r[1]); });
});
