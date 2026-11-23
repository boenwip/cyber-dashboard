/* year.js — pseudosec. This year: ASD's Annual Cyber Threat Report in plain numbers, from
   data/annual_report.json (hand-maintained), plus a running estimate of reports since 1 July.
   Requires shared.js (esc, safeUrl, SYDNEY). */

var DAY = 86400000, report = null;

// The current Australian financial year, 1 July to 30 June
function fy(now) {
  var year = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, year: 'numeric' }).format(now);
  var month = +new Intl.DateTimeFormat('en-AU', { timeZone: SYDNEY, month: 'numeric' }).format(now);
  var start = month >= 7 ? year : year - 1;
  return { start: new Date(start + '-07-01T00:00:00+10:00'), end: new Date((start + 1) + '-07-01T00:00:00+10:00') };
}

// A projection, not a live count: last year's rate spread from 1 July
function estimate() {
  var f = fy(new Date()), secs = Math.max(0, (Date.now() - f.start) / 1000);
  return Math.floor(secs * report.reports_per_year / (365.25 * 86400)).toLocaleString('en-AU');
}
function fyDay() {
  var f = fy(new Date()), days = Math.round((f.end - f.start) / DAY);
  return 'Day ' + Math.min(days, Math.floor((Date.now() - f.start) / DAY) + 1) + ' of ' + days + '.';
}

function stat(s) { return '<div class="stat"><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></div>'; }

function chart(g) {
  return '<figure class="chart"><figcaption>' + esc(g.group) + '</figcaption><ul>' + g.items.map(function (it) {
    var pct = Math.max(0, Math.min(100, +it.pct || 0));
    return '<li><span class="row"><span>' + esc(it.name) + '</span><b>' + pct + '%</b></span><span class="track"><i data-w="' + pct + '"></i></span></li>';
  }).join('') + '</ul></figure>';
}

// Write the estimate; digits that changed since last time roll up (year.css)
function showCount() {
  var el = document.getElementById('count'), old = el.textContent, t = estimate();
  el.innerHTML = t.split('').map(function (c, i) {
    return old.length === t.length && c !== old[i] ? '<span class="roll">' + c + '</span>' : c;
  }).join('');
}

// Bars grow in once, the first time the charts are on screen
function growBars(charts) {
  var bars = charts.querySelectorAll('i[data-w]');
  function grow() { bars.forEach(function (i) { i.style.width = i.getAttribute('data-w') + '%'; }); }
  if (!('IntersectionObserver' in window)) return grow();
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); grow(); } }, { threshold: .3 });
  io.observe(charts);
}

function text(id, t) { var el = document.getElementById(id); el.textContent = t || ''; el.hidden = !t; }

function render(r) {
  report = r;
  text('source', 'From ASD\'s ' + r.title);
  showCount();
  text('how', 'ASD received ' + r.reports_per_year.toLocaleString('en-AU') + ' cybercrime reports in FY' + r.fy +
    ', about one every ' + r.report_interval + '. This spreads that rate across the current financial year. Most cybercrime is never reported at all.');
  document.getElementById('fy-day').textContent = fyDay();
  document.getElementById('stats').innerHTML = (r.stats || []).map(stat).join('');
  text('crimes', r.top_crimes);
  var charts = document.getElementById('charts');
  charts.innerHTML = (r.breakdowns || []).map(chart).join('');
  growBars(charts);
  text('breakdown-note', r.breakdown_note);
  if (r.ai) {
    document.getElementById('ai').hidden = false;
    text('ai-title', r.ai.title);
    text('ai-summary', r.ai.summary);
    document.getElementById('ai-points').innerHTML = (r.ai.points || []).map(function (p) {
      var m = String(p).match(/^([^:]{2,30}):\s+(.*)$/);   // "Scams and phishing: ..." gets a bold label
      return '<li>' + (m ? '<b>' + esc(m[1]) + ':</b> ' + esc(m[2]) : esc(p)) + '</li>';
    }).join('');
    document.getElementById('ai-facts').innerHTML = (r.ai.facts || []).map(stat).join('');
    text('ai-advice', r.ai.advice);
    text('ai-note', r.ai.note);
  }
  var link = document.getElementById('report-link'), href = safeUrl(r.url);
  if (href) link.href = href; else link.hidden = true;
  document.getElementById('report').hidden = false;
  setInterval(showCount, 6000);
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/annual_report.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch(function () { document.getElementById('unavailable').hidden = false; });
});
