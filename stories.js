/* stories.js — pseudosec. All stories: every story in the feed, newest first, grouped by day,
   with one row of topic filters. The filter lives in the address (#scams), so it can be shared.
   Requires shared.js (esc, safeUrl, formatDate, parseDate, SYDNEY, sourceName, headline, hasSummary). */

var FILTERS = [
  { key: 'all',        label: 'All',          test: function () { return true; } },
  { key: 'cyber',      label: 'Cyber',        test: function (s) { return tagged(s, 'Cyber'); } },
  { key: 'scams',      label: 'Scams',        test: function (s) { return tagged(s, 'Scams'); } },
  { key: 'ai',         label: 'AI and tools', test: function (s) { return tagged(s, 'AI & Tools'); } },
  { key: 'acsc',       label: 'ACSC alerts',  test: function (s) { return !!s.official; } },
  { key: 'compliance', label: 'Compliance',   test: function (s) { return tagged(s, 'Compliance'); } },
  { key: 'tools',      label: 'Tool updates', tools: true }
];
var stories = [], tools = [];

function tagged(s, t) { return (s.tags || []).indexOf(t) > -1; }
// The one topic a story's dot shows, as on the home page
function topic(s) {
  if (s.official) return { key: 'acsc', label: 'ACSC' };
  if (tagged(s, 'Scams')) return { key: 'scams', label: 'Scams' };
  if (tagged(s, 'AI & Tools')) return { key: 'ai', label: 'AI and tools' };
  return { key: 'cyber', label: 'Cyber' };
}
function when(s) { return parseDate(s.latest || s.date); }
var dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit' });
function dayLabel(d) {
  var k = dayKey.format(d), today = new Date();
  if (k === dayKey.format(today)) return 'Today';
  if (k === dayKey.format(new Date(today - 86400000))) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { timeZone: SYDNEY, weekday: 'long', day: 'numeric', month: 'long' });
}

function storyRow(s) {
  var href = safeUrl(s.link), t = topic(s), cov = s.coverage || [];
  if (!href) return '';
  return '<article class="story t-' + t.key + '">' +
    '<p class="meta"><span class="topic">' + esc(s.official && s.threat ? 'ACSC ' + s.threat.toLowerCase() : t.label) + '</span>' +
      '<span>' + esc(sourceName(s.source)) + ', ' + esc(formatDate(s.latest || s.date, true)) + '</span></p>' +
    '<h3><a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(headline(s.title, s.source)) + '</a></h3>' +
    (hasSummary(s) ? '<p class="sum">' + esc(s.summary) + '</p>' : '') +
    (cov.length ? '<details><summary>Also covered by ' + cov.length + (cov.length === 1 ? ' outlet' : ' outlets') + '</summary><ul>' + cov.map(function (c) {
      var h = safeUrl(c.link);
      return h ? '<li><a href="' + h + '" target="_blank" rel="noopener noreferrer">' + esc(headline(c.title, c.source)) + '</a> <span>' + esc(sourceName(c.source)) + ', ' + esc(formatDate(c.date)) + '</span></li>' : '';
    }).join('') + '</ul></details>' : '') +
    '</article>';
}

function toolRow(u) {
  var href = safeUrl(u.link);
  if (!href) return '';
  return '<article class="story t-ai"><p class="meta"><span class="topic">' + esc(u.tool) + '</span><span>' + esc(formatDate(u.date, true)) + '</span></p>' +
    '<h3><a href="' + href + '" target="_blank" rel="noopener noreferrer">' + esc(u.title) + '</a></h3>' +
    (u.summary && u.summary.length > 40 ? '<p class="sum">' + esc(u.summary) + '</p>' : '') + '</article>';
}

function current() {
  var k = location.hash.slice(1);
  if (k === 'alerts') k = 'acsc';   // older dashboard link
  return FILTERS.filter(function (f) { return f.key === k; })[0] || FILTERS[0];
}

function render() {
  var f = current();
  var items = f.tools ? tools : stories.filter(f.test);
  var row = f.tools ? toolRow : storyRow;
  document.getElementById('filters').innerHTML = FILTERS.map(function (g) {
    var n = g.tools ? tools.length : stories.filter(g.test).length;
    if (!n && g !== f) return '';
    return '<a href="#' + g.key + '"' + (g === f ? ' aria-current="true"' : '') + '>' + esc(g.label) + ' <span>' + n + '</span></a>';
  }).join('');
  var groups = [];
  items.slice().sort(function (a, b) { return (when(b) || 0) - (when(a) || 0); }).forEach(function (s) {
    var d = when(s), label = d ? dayLabel(d) : 'Undated', g = groups[groups.length - 1];
    if (!g || g.label !== label) groups.push(g = { label: label, html: '' });
    g.html += row(s);
  });
  document.getElementById('days').innerHTML = groups.length ? groups.map(function (g) {
    return '<section class="day"><h2>' + esc(g.label) + '</h2>' + g.html + '</section>';
  }).join('') : '<p class="empty">Nothing under ' + esc(f.label) + ' right now. <a href="#all">See all stories</a></p>';
  // On phones the filters scroll sideways; keep the chosen one in view
  var on = document.querySelector('#filters [aria-current]');
  if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function getJson(p) { return fetch(p, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(p); return r.json(); }); }

document.addEventListener('DOMContentLoaded', function () {
  window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
  Promise.all([getJson('data/news.json'), getJson('data/tool_updates.json').catch(function () { return { items: [] }; })])
    .then(function (r) {
      stories = Array.isArray(r[0].items) ? r[0].items : [];
      tools = Array.isArray(r[1].items) ? r[1].items : [];
      var ts = formatDate(r[0].last_updated, true);
      document.getElementById('updated').textContent = ts ? 'Updated ' + ts : '';
      document.getElementById('last-updated').textContent = document.getElementById('footer-updated').textContent = ts ? 'Updated ' + ts : '';
      render();
    })
    .catch(function () { document.getElementById('days').innerHTML = '<p class="empty">News is unavailable right now.</p>'; });
});
