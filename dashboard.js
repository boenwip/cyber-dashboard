
// ── THEME ──
const savedTheme = localStorage.getItem('csi-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('theme-btn').textContent = savedTheme === 'dark' ? '☀' : '☽';

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('csi-theme', next);
  document.getElementById('theme-btn').textContent = next === 'dark' ? '☀' : '☽';
}

// ── TRACKER ──
const FY_START = new Date('2025-07-01T00:00:00+10:00');
const SECS_YEAR = 365.25 * 24 * 3600;

function getElapsed() {
  const now = new Date();
  const start = FY_START > now ? new Date('2024-07-01T00:00:00+10:00') : FY_START;
  return Math.max(0, (now - start) / 1000);
}

function fmt(n) { return Math.floor(n).toLocaleString('en-AU'); }

function updateTracker() {
  const e = getElapsed();
  document.getElementById('main-count').textContent = fmt(e * 84700 / SECS_YEAR);
  document.getElementById('incidents-count').textContent = fmt(e * 1200 / SECS_YEAR);
  const d = e * 334000000 / SECS_YEAR;
  document.getElementById('domains-count').textContent = d > 1e6 ? (d/1e6).toFixed(1)+'M' : fmt(d);
}

setTimeout(() => {
  document.getElementById('b-ransom').style.width = '11%';
  document.getElementById('b-id').style.width = '8%';
  document.getElementById('b-shop').style.width = '7%';
  document.getElementById('b-bank').style.width = '6%';
  document.getElementById('b-other').style.width = '68%';
}, 400);

const tickers = [
  'HIGH ALERT: Ongoing targeting of online code repositories — ACSC',
  'Ransomware most disruptive threat — 138 incidents in FY2024–25',
  'Critical infrastructure attacks up 111% year on year',
  'DoS/DDoS attacks rose 280% — over 200 incidents in FY2024–25',
  '42,500+ calls to the Cyber Security Hotline in FY2024–25 — up 16%',
  'Identity fraud remains #1 reported cybercrime for individuals',
  'Avg business loss $80,850 — up 50% year on year',
  '39% of ransomware victims didn\'t know they\'d been hit until ACSC told them',
];
let tickerIdx = 0;
const tickerEl = document.getElementById('ticker-txt');
tickerEl.textContent = tickers[0];
setInterval(() => {
  tickerEl.style.opacity = 0;
  setTimeout(() => {
    tickerIdx = (tickerIdx + 1) % tickers.length;
    tickerEl.textContent = tickers[tickerIdx];
    tickerEl.style.opacity = 1;
  }, 400);
}, 5000);

function updateStatStrip(data) {
  const items = data.items || [];
  const now = new Date();
  const twelveHrsAgo = new Date(now - 12 * 60 * 60 * 1000);

  // ACSC updates — count items from ACSC sources this week
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const acscCount = items.filter(a => {
    return (a.source || '').toLowerCase().includes('acsc') &&
      parseArticleDate(a.date) > weekAgo;
  }).length;

  // New in 12hrs
  const newCount = items.filter(a => parseArticleDate(a.date) > twelveHrsAgo).length;

  // Scam notices
  const scamCount = items.filter(a => (a.tags || []).includes('Scams')).length;

  function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  setEl('stat-acsc', acscCount || '—');
  setEl('stat-new', newCount || '—');
  setEl('stat-total', items.length);
  setEl('stat-scams', scamCount || '—');
  const ts = data.last_updated || '';
  if (ts) setEl('stat-updated', 'Updated ' + ts + ' AEST');
}

function parseArticleDate(dateStr) {
  if (!dateStr) return new Date(0);
  try {
    // DD-MM-YYYY HH:MM AM/PM
    const m = dateStr.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (m) {
      let h = parseInt(m[4]);
      if (m[6].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (m[6].toUpperCase() === 'AM' && h === 12) h = 0;
      return new Date(parseInt(m[3]), parseInt(m[2])-1, parseInt(m[1]), h, parseInt(m[5]));
    }
  } catch(e) {}
  return new Date(0);
}

function switchTrackerTab(tab, el) {
  document.querySelectorAll('.ttab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tpanel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tpanel-' + tab).classList.add('active');
}

updateTracker();
setInterval(updateTracker, 6000);

function switchMapTab(map, btn) {
  ['kaspersky','checkpoint','fortinet'].forEach(m => {
    const view = document.getElementById('mapview-' + m);
    const tab = document.getElementById('maptab-' + m);
    if (view) view.style.display = m === map ? 'block' : 'none';
    if (tab) {
      tab.style.borderBottomColor = m === map ? 'var(--accent)' : 'transparent';
      tab.style.color = m === map ? 'var(--text)' : 'var(--hint)';
    }
  });
}

// ── DATA & FILTERS ──
let allArticles = [];
let allTools = [];
let activeFilters = { topic: [], audience: [], threat: [], relevance: [] };

function formatDateAEST(isoStr) {
  if (!isoStr) return '';
  // Dates from Python are already formatted as DD-MM-YYYY HH:MM AM/PM - return as-is
  if (/^\d{2}-\d{2}-\d{4}/.test(isoStr)) return isoStr;
  try {
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr;
    return d.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch(e) { return isoStr; }
}

async function loadData() {
  document.getElementById('last-updated').textContent = 'Refreshing...';
  try {
    const res = await fetch('news.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allArticles = data.items || [];
    const ts = data.last_updated ? formatDateAEST(data.last_updated) : '';
    var luEl = document.getElementById('last-updated');
    var fuEl = document.getElementById('footer-updated');
    if (luEl) luEl.textContent = ts ? 'Last updated: ' + ts + ' AEST' : '';
    if (fuEl) fuEl.textContent = ts ? 'Updated: ' + ts + ' AEST' : '';
    try { updateStatStrip(data); } catch(e) {}
    renderArticles();
  } catch(e) {
    document.getElementById('articles-container').innerHTML =
      '<div class="no-results"><div style="font-size:24px;opacity:0.3">—</div><p>Could not load news.json.<br>' + e.message + '</p></div>';
    document.getElementById('last-updated').textContent = 'Failed to load';
  }
  try {
    const res2 = await fetch('tool_updates.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res2.ok) throw new Error('HTTP ' + res2.status);
    const data2 = await res2.json();
    allTools = data2.items || [];
    renderTools();
  } catch(e) {}
  try {
    const res3 = await fetch('cve.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res3.ok) throw new Error('HTTP ' + res3.status);
    const data3 = await res3.json();
    renderCVE(data3.items || []);
  } catch(e) {
    var el = document.getElementById('cve-feed');
    if (el) el.innerHTML = '<div style="font-size:14px;color:var(--hint);font-style:italic;">CVE data unavailable.</div>';
  }
}

// ── QUICK VIEWS ──
function applyQuickView(view, btn) {
  document.querySelectorAll('.qv').forEach(q => q.classList.remove('active'));
  btn.classList.add('active');
  clearAllFilters();
  if (view === 'forme') {
    setFilter('relevance', 'Direct');
    setFilter('relevance', 'Sector');
  } else if (view === 'industry') {
    setFilter('relevance', 'AU General');
    setFilter('relevance', 'Sector');
  } else if (view === 'critical') {
    setFilter('threat', 'Critical');
    setFilter('threat', 'High');
  } else if (view === 'scams') {
    setFilter('topic', 'Scams');
  } else if (view === 'good') {
    setFilter('topic', 'Good News');
  }
  renderArticles();
}

function clearAllFilters() {
  activeFilters = { topic: [], audience: [], threat: [], relevance: [] };
  document.querySelectorAll('.pill').forEach(p => p.className = 'pill');
}

function setFilter(type, value) {
  if (!activeFilters[type].includes(value)) activeFilters[type].push(value);
  var pill = document.querySelector('.pill[data-filter-type="' + type + '"][data-value="' + value + '"]');
  if (pill) {
    if (type === 'topic') {
      if (value === 'AU Cyber') pill.classList.add('active-topic');
      else if (value === 'RTO / VET') pill.classList.add('active-rto');
      else if (value === 'EdTech') pill.classList.add('active-edtech');
      else if (value === 'AI & Tools') pill.classList.add('active-ai');
      else if (value === 'Scams') pill.classList.add('active-scam');
      else if (value === 'Compliance') pill.classList.add('active-compliance');
      else if (value === 'Good News') pill.classList.add('active-good');
      else pill.classList.add('active-edu');
    } else if (type === 'audience') {
      pill.classList.add('active-aud');
    } else if (type === 'relevance') {
      if (value === 'Direct') pill.classList.add('active-rel-direct');
      else if (value === 'Sector') pill.classList.add('active-rel-sector');
      else if (value === 'AU General') pill.classList.add('active-rel-au');
      else pill.classList.add('active-rel-global');
    } else {
      if (value === 'Critical') pill.classList.add('active-threat');
      else if (value === 'High') pill.classList.add('active-high');
      else if (value === 'Medium') pill.classList.add('active-med');
      else pill.classList.add('active-adv');
    }
  }
}

function toggleFilter(pill) {
  document.querySelectorAll('.qv').forEach(q => q.classList.remove('active'));
  document.querySelector('.qv[onclick*="all"]').classList.add('active');

  const type  = pill.dataset.filterType;
  const value = pill.dataset.value;
  const idx   = activeFilters[type].indexOf(value);

  if (idx > -1) {
    activeFilters[type].splice(idx, 1);
    pill.className = 'pill';
  } else {
    activeFilters[type].push(value);
    if (type === 'topic') {
      if (value === 'AU Cyber') pill.classList.add('active-topic');
      else if (value === 'RTO / VET') pill.classList.add('active-rto');
      else if (value === 'EdTech') pill.classList.add('active-edtech');
      else if (value === 'AI & Tools') pill.classList.add('active-ai');
      else if (value === 'Scams') pill.classList.add('active-scam');
      else if (value === 'Compliance') pill.classList.add('active-compliance');
      else if (value === 'Good News') pill.classList.add('active-good');
      else pill.classList.add('active-edu');
    } else if (type === 'audience') {
      pill.classList.add('active-aud');
    } else if (type === 'relevance') {
      if (value === 'Direct') pill.classList.add('active-rel-direct');
      else if (value === 'Sector') pill.classList.add('active-rel-sector');
      else if (value === 'AU General') pill.classList.add('active-rel-au');
      else pill.classList.add('active-rel-global');
    } else {
      if (value === 'Critical') pill.classList.add('active-threat');
      else if (value === 'High') pill.classList.add('active-high');
      else if (value === 'Medium') pill.classList.add('active-med');
      else pill.classList.add('active-adv');
    }
  }
  renderArticles();
}

function passesFilters(article) {
  const { topic, audience, threat, relevance } = activeFilters;
  if (topic.length     && !topic.some(t    => (article.tags || []).includes(t)))      return false;
  if (audience.length  && !audience.some(a => (article.audience || []).includes(a)))  return false;
  if (threat.length    && !threat.includes(article.threat))                           return false;
  if (relevance.length && !relevance.includes(article.relevance))                     return false;
  return true;
}

function tagClass(tag) {
  if (tag === 'AU Cyber') return 'tag tag-cyber';
  if (tag === 'RTO / VET') return 'tag tag-rto';
  if (tag === 'Education') return 'tag tag-edu';
  if (tag === 'EdTech') return 'tag tag-edtech';
  if (tag === 'AI & Tools') return 'tag tag-ai';
  if (tag === 'Scams') return 'tag tag-scam';
  if (tag === 'Compliance') return 'tag tag-compliance';
  if (tag === 'Good News') return 'tag tag-good';
  return 'tag';
}

function relClass(rel) {
  if (rel === 'Direct')     return 'tag tag-rel-direct';
  if (rel === 'Sector')     return 'tag tag-rel-sector';
  if (rel === 'AU General') return 'tag tag-rel-au';
  return 'tag tag-rel-global';
}

function threatClass(t) {
  if (t === 'Critical') return 'threat-badge t-critical';
  if (t === 'High')     return 'threat-badge t-high';
  if (t === 'Medium')   return 'threat-badge t-medium';
  return 'threat-badge t-advisory';
}

function threatDot(t) {
  if (t === 'Critical') return '● Critical';
  if (t === 'High')     return '● High';
  if (t === 'Medium')   return '● Medium';
  return '● Advisory';
}

function renderArticles() {
  var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  var filtered = allArticles
    .filter(passesFilters)
    .filter(function(a) { return !a.date || parseArticleDate(a.date) >= sevenDaysAgo; })
    .sort(function(a, b) { return parseArticleDate(b.date) - parseArticleDate(a.date); })
    .slice(0, 20);
  if (!filtered.length) {
    document.getElementById('articles-container').innerHTML =
      '<div class="no-results"><div style="font-size:24px;opacity:0.3">—</div><p>No articles match the current filters.</p></div>';
    return;
  }

  const html = filtered.map(function(a) {
    if (a.title.toLowerCase().startsWith('sponsored')) return '';
    var tags = (a.tags || []).map(function(t) {
      return '<span class="' + tagClass(t) + '">' + t + '</span>';
    }).join('');
    var auds = (a.audience || []).slice(0,2).map(function(au) {
      return '<span class="tag-aud">' + au + '</span>';
    }).join('');
    var rel = a.relevance ? '<span class="' + relClass(a.relevance) + '">' + a.relevance + '</span>' : '';
    var summary = (a.summary || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    if (summary.length < 80 || a.source.toLowerCase().indexOf('google news') !== -1) summary = '';
    var dateStr = a.date ? formatDateAEST(a.date) : '';
    var datePart = dateStr ? '<span class="dot">·</span><span class="art-date">' + dateStr + '</span>' : '';
    var summaryPart = summary ? '<div class="art-summary">' + summary + '</div>' : '';
    var href = a.link && a.link.startsWith('http') ? a.link : '#';
    return '<a class="article" href="' + href + '" target="_blank" rel="noopener">' +
      '<div class="art-meta">' +
        '<span class="source">' + a.source + '</span>' +
        datePart +
        '<span class="dot">·</span>' +
        tags + auds + rel +
        '<span class="' + threatClass(a.threat) + '">' + threatDot(a.threat) + '</span>' +
      '</div>' +
      '<div class="art-title">' + a.title + '</div>' +
      summaryPart +
    '</a>';
  }).join('');

  document.getElementById('articles-container').innerHTML = html || '<div class="no-results"><div style="font-size:24px;opacity:0.3">-</div><p>No articles match the current filters.</p></div>';
}

function renderCVE(items) {
  var el = document.getElementById('cve-feed');
  if (!el) return;
  var cveItems = items.slice(0, 4);
  if (!cveItems.length) {
    el.innerHTML = '<div style="font-size:14px;color:var(--hint);font-style:italic;">No CVE data available.</div>';
    return;
  }
  el.innerHTML = cveItems.map(function(c) {
    var sev = (c.severity || 'High');
    var sevColor = sev === 'CRITICAL' || sev === 'Critical' ? 'var(--crit)' : 'var(--high)';
    var score = c.score ? c.score.toFixed(1) : '';
    var desc = (c.description || '').substring(0, 120) + (c.description && c.description.length > 120 ? '...' : '');
    var link = c.link || ('https://nvd.nist.gov/vuln/detail/' + c.id);
    return '<a href="' + link + '" target="_blank" rel="noopener" style="display:block;padding:10px 0;border-bottom:0.5px solid var(--border);text-decoration:none;">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">' +
        '<span style="font-size:13px;font-family:monospace;color:var(--accent);">' + (c.id || '') + '</span>' +
        (score ? '<span style="font-size:12px;font-weight:600;color:' + sevColor + ';">● ' + sev + ' ' + score + '</span>' : '') +
      '</div>' +
      '<div style="font-size:14px;color:var(--muted);line-height:1.5;">' + desc + '</div>' +
      (c.published ? '<div style="font-size:11px;color:var(--hint);margin-top:4px;">' + c.published + '</div>' : '') +
    '</a>';
  }).join('');
}

function initBarChart() {
  setTimeout(function() {
    var b = document.getElementById('b-ransom');
    if (b) {
      document.getElementById('b-ransom').style.width = '11%';
      document.getElementById('b-id').style.width = '8%';
      document.getElementById('b-shop').style.width = '7%';
      document.getElementById('b-bank').style.width = '6%';
      document.getElementById('b-other').style.width = '68%';
    }
  }, 400);
}

function renderTools() {
  if (!allTools.length) {
    var el = document.getElementById('tools-container');
    if (el) el.innerHTML = '<div style="padding:12px 16px;font-size:12px;color:var(--hint);font-style:italic;">No tool updates available.</div>';
    return;
  }
  var grouped = {};
  allTools.forEach(function(t) {
    if (!grouped[t.tool]) grouped[t.tool] = [];
    grouped[t.tool].push(t);
  });
  var html = Object.entries(grouped).map(function(entry) {
    var tool = entry[0];
    var items = entry[1].slice(0, 3);
    var itemsHtml = items.map(function(i) {
      var title = i.title || '';
      // Clean up version-only titles from GitHub releases
      if (/^v\d+\.\d+/.test(title)) {
        title = tool + ' ' + title;
      }
      // Truncate long titles
      if (title.length > 80) title = title.substring(0, 77) + '...';
      var datePart = i.date ? '<div class="tool-item-date">' + i.date + '</div>' : '';
      return '<a class="tool-item" href="' + i.link + '" target="_blank" rel="noopener">' +
        '<div class="tool-item-title">' + title + '</div>' +
        datePart +
      '</a>';
    }).join('');
    return '<div class="tool-group"><div class="tool-name">' + tool + '</div>' + itemsHtml + '</div>';
  }).join('');
  var el = document.getElementById('tools-container');
  if (el) el.innerHTML = html;
}

loadData();
