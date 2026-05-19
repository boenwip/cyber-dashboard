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
    b.style.width = '11%';
    document.getElementById('b-id').style.width    = '8%';
    document.getElementById('b-shop').style.width  = '7%';
    document.getElementById('b-bank').style.width  = '6%';
    document.getElementById('b-other').style.width = '68%';
  }, 500);
}

// ── ROTATING BLURBS ────────────────────────────────────────
var BLURBS = [
  'From a $30 phishing text to a ransomware attack on a hospital — this counter catches all of it. Most of it isn\'t sophisticated. Most of it is preventable.',
  'The majority of these reports aren\'t headline events. They\'re opportunistic, automated, and aimed at ordinary Australians on an ordinary day.',
  'One number. Hundreds of types of crime. Everything from a compromised email to critical infrastructure — counted together.',
  'Behind every tick is someone navigating a system they didn\'t choose to become familiar with.',
  'Not every cybercrime makes the news. Most never do. But every one of them is counted here.',
  'The scale isn\'t the whole story. A single report can represent a business that didn\'t survive it.',
  'Most victims don\'t realise something went wrong until weeks later. The counter doesn\'t wait.'
];

function initBlurb() {
  var el = document.getElementById('count-voice');
  if (!el) return;
  var day = Math.floor(Date.now() / 86400000);
  el.textContent = BLURBS[day % BLURBS.length];
}

// ── THREAT MAP ─────────────────────────────────────────────
function toggleThreatMap() {
  var section = document.getElementById('threat-map-section');
  if (!section) return;
  var isHidden = section.hidden;
  section.hidden = !isHidden;
  document.body.classList.toggle('threat-map-open', isHidden);
  var btn = document.getElementById('threat-map-btn');
  if (btn) btn.textContent = isHidden ? '✕ Close' : '🌐 Threat Intel';
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
    return '<button class="active-filter-chip" data-remove-filter="' + v.replace(/"/g, '&quot;') + '" aria-label="Remove ' + v + ' filter">' +
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
    var summary = (a.summary || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (summary.length < 80 || (a.source || '').toLowerCase().indexOf('google news') > -1) summary = '';
    var href = (a.link && a.link.indexOf('http') === 0) ? a.link : '#';

    // Reading time from title + summary words
    var wordCount = (title + ' ' + summary).split(/\s+/).length;
    var mins = Math.max(1, Math.ceil(wordCount / 220));
    var readTime = mins + ' min read';

    // Tags — clickable to filter (data attributes, handled via event delegation)
    var tags = (a.tags || []).map(function(t) {
      var isActive = activeFilters.topic.indexOf(t) > -1;
      var cls = tagClass(t) + (isActive ? ' tag--active' : '');
      return '<span class="' + cls + '" ' +
        'data-filter-topic="' + t.replace(/"/g, '&quot;') + '" ' +
        'role="button" tabindex="0" aria-label="Filter by ' + t + '">' + t + '</span>';
    }).join('');

    // Threat tag — clickable
    var threatVal = a.threat || 'Advisory';
    var isThActive = activeFilters.threat.indexOf(threatVal) > -1;
    var threatBtn = '<span class="' + threatClass(a.threat) + (isThActive ? ' tag--active' : '') + '" ' +
      'data-filter-threat="' + threatVal.replace(/"/g, '&quot;') + '" ' +
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
        '<span class="cve-id">' + (c.id || '').replace(/</g,'&lt;') + '</span>' +
        '<span class="cve-sev ' + sevCls + '">● ' + sev + '</span>' +
        ransom +
      '</div>' +
      '<div class="cve-desc">' + desc.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' +
      (added ? '<div class="cve-date">Added ' + added + '</div>' : '') +
    '</a>';
  }).join('');
}

// ── RENDER TOOLS ───────────────────────────────────────────
var TOOL_ICON_MAP = {
  'google-workspace': 'https://cdn.simpleicons.org/google/4285F4',
  'google-chrome':    'https://cdn.simpleicons.org/googlechrome/4285F4',
  'microsoft-365':    'https://cdn.simpleicons.org/microsoft/D83B01',
  'asana':            'https://cdn.simpleicons.org/asana/F06A6A',
  'zoom':             'https://cdn.simpleicons.org/zoom/2D8CFF',
  'ai-tools':         'https://cdn.simpleicons.org/openai/10A37F',
  'canva':            'https://cdn.simpleicons.org/canva/00C4CC',
  'claude':           'https://cdn.simpleicons.org/anthropic/CC785C',
};

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
    var iconUrl = TOOL_ICON_MAP[toolKey] || '';
    var iconHtml = iconUrl
      ? '<img src="' + iconUrl + '" class="tool-icon" alt="" aria-hidden="true" width="14" height="14">'
      : '';
    return '<div class="tool-group"><div class="tool-name" data-tool="' + toolKey + '">' +
      iconHtml + tool.replace(/</g,'&lt;') + '</div>' + rows + '</div>';
  }).join('');
}

// ── SCAM OF THE WEEK ───────────────────────────────────────
function renderScamOfWeek(articles) {
  var callout = document.getElementById('scam-callout');
  if (!callout) return;
  var GENERIC = ['browse news', 'news and alerts', 'alerts and news'];
  function usable(a) {
    var t = (a.title || '').toLowerCase();
    return !GENERIC.some(function(g) { return t.indexOf(g) > -1; });
  }
  var byDate = function(a, b) { return parseArticleDate(b.date) - parseArticleDate(a.date); };
  var scams = articles
    .filter(function(a) {
      return (a.tags || []).indexOf('Scams') > -1 && a.link && a.title &&
        a.source && a.source.toLowerCase().indexOf('scamwatch') > -1;
    })
    .filter(usable)
    .sort(byDate);
  if (!scams.length) {
    scams = articles
      .filter(function(a) {
        return (a.tags || []).indexOf('Scams') > -1 && a.link && a.title;
      })
      .filter(usable)
      .sort(byDate);
  }
  if (!scams.length) {
    callout.style.display = 'none';
    return;
  }
  var s = scams[0];
  var titleEl = document.getElementById('scam-title');
  var metaEl  = document.getElementById('scam-meta');
  var linkEl  = document.getElementById('scam-link');
  var cleanTitle = (s.title || '').replace(/\s*[-–|]\s*(Scamwatch|Scam\s+Watch|ACCC).*$/i, '').trim();
  if (titleEl) titleEl.textContent = cleanTitle;
  var src = (s.source || '').replace(/^Google News\s*[—-]\s*/i, '');
  if (metaEl) metaEl.textContent = (src ? src + ' · ' : '') + (s.date || '');
  if (linkEl && s.link && s.link.indexOf('http') === 0) linkEl.href = s.link;
  callout.style.display = 'flex';
}

// ── FEATURED STORY ─────────────────────────────────────────
function renderFeaturedStory(f) {
  var el = document.getElementById('featured-story');
  if (!el || !f || !f.quote) return;
  var title  = (f.title  || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var quote  = (f.quote  || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var source = (f.source || '').replace(/^Google News\s*[—\-]\s*/i, '').replace(/</g, '&lt;');
  var href   = (f.link && f.link.indexOf('http') === 0) ? f.link : '#';
  el.innerHTML =
    '<div class="fs-label">Today\'s story</div>' +
    '<p class="fs-quote">' + quote + '</p>' +
    '<a class="fs-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + title + ' ↗</a>' +
    (source ? '<div class="fs-source">' + source + '</div>' : '');
  el.hidden = false;
}

// ── AI BRIEFING ────────────────────────────────────────────
function toggleBriefing() {
  var popup    = document.getElementById('briefing-popup');
  var backdrop = document.getElementById('briefing-backdrop');
  var btn      = document.getElementById('briefing-btn');
  if (!popup) return;
  var isOpen = popup.classList.contains('briefing-popup--open');
  if (isOpen) {
    popup.classList.remove('briefing-popup--open');
    if (backdrop) backdrop.classList.remove('briefing-backdrop--open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    popup.setAttribute('aria-hidden', 'true');
  } else {
    popup.classList.add('briefing-popup--open');
    if (backdrop) backdrop.classList.add('briefing-backdrop--open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    popup.setAttribute('aria-hidden', 'false');
  }
}

function loadBriefing() {
  var textEl = document.getElementById('briefing-text');
  var dateEl = document.getElementById('briefing-date');
  if (!textEl) return;
  fetch('data/briefing.json?t=' + Date.now(), { cache: 'no-cache' })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      var item = (data.items && typeof data.items === 'object' && !Array.isArray(data.items))
        ? data.items : data;
      if (item.featured) renderFeaturedStory(item.featured);
      if (item.briefing) {
        // Render paragraph breaks for readability
        var paras = item.briefing.split(/\n\n+/);
        textEl.innerHTML = paras.map(function(p) {
          return '<p style="margin:0 0 12px 0;">' + p.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,' ') + '</p>';
        }).join('');
        if (dateEl && item.date) dateEl.textContent = item.date;
      } else {
        var btn = document.getElementById('briefing-btn');
        if (btn) btn.style.display = 'none';
      }
    })
    .catch(function() {
      var btn = document.getElementById('briefing-btn');
      if (btn) btn.style.display = 'none';
    });
}

// ── WORD OF THE DAY ────────────────────────────────────────
function initWotd() {
  if (typeof DEFINITIONS === 'undefined' || !DEFINITIONS.length) return;
  renderWotd(DEFINITIONS);
}

// ── DATA LOAD ──────────────────────────────────────────────
async function loadData() {
  var luEl = document.getElementById('last-updated');
  var fuEl = document.getElementById('footer-updated');

  // 1. News feed
  try {
    var res  = await fetch('data/news.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    allArticles = Array.isArray(data.items) ? data.items : [];
    var ts = data.last_updated ? formatDateAEST(data.last_updated) : '';
    if (luEl) { luEl.textContent = ts ? 'Updated ' + ts : ''; }
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
    var res2  = await fetch('data/tool_updates.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res2.ok) throw new Error('HTTP ' + res2.status);
    var data2 = await res2.json();
    allTools  = Array.isArray(data2.items) ? data2.items : [];
    renderTools();
  } catch(e) {}

  // 3. CVE feed
  try {
    var res3  = await fetch('data/cve.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res3.ok) throw new Error('HTTP ' + res3.status);
    var data3 = await res3.json();
    var cveItems = Array.isArray(data3.items) ? data3.items
      : (data3.items && Array.isArray(data3.items.items)) ? data3.items.items : [];
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
  initBlurb();
  loadBriefing();
  loadData();

  // Static button listeners — replaces inline onclick attributes
  var briefingBtn = document.getElementById('briefing-btn');
  if (briefingBtn) briefingBtn.addEventListener('click', toggleBriefing);

  var briefingClose = document.querySelector('.briefing-popup-close');
  if (briefingClose) briefingClose.addEventListener('click', toggleBriefing);

  var briefingBackdrop = document.getElementById('briefing-backdrop');
  if (briefingBackdrop) briefingBackdrop.addEventListener('click', toggleBriefing);

  var threatMapBtn = document.getElementById('threat-map-btn');
  if (threatMapBtn) threatMapBtn.addEventListener('click', toggleThreatMap);

  var threatMapClose = document.querySelector('.threat-map-close');
  if (threatMapClose) threatMapClose.addEventListener('click', toggleThreatMap);

  var clearFiltersBtn = document.querySelector('.clear-filters-btn');
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);

  // Event delegation — article tag filters
  var feed = document.getElementById('articles-container');
  if (feed) {
    feed.addEventListener('click', function(e) {
      var el = e.target.closest('[data-filter-topic]');
      if (el) { e.preventDefault(); toggleTagFilter('topic', el.dataset.filterTopic); return; }
      el = e.target.closest('[data-filter-threat]');
      if (el) { e.preventDefault(); toggleTagFilter('threat', el.dataset.filterThreat); }
    });
    feed.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest('[data-filter-topic]');
      if (el) { e.preventDefault(); toggleTagFilter('topic', el.dataset.filterTopic); return; }
      el = e.target.closest('[data-filter-threat]');
      if (el) { e.preventDefault(); toggleTagFilter('threat', el.dataset.filterThreat); }
    });
  }

  // Event delegation — active filter chips
  var filterTags = document.getElementById('active-filter-tags');
  if (filterTags) {
    filterTags.addEventListener('click', function(e) {
      var chip = e.target.closest('[data-remove-filter]');
      if (chip) removeFilter(chip.dataset.removeFilter);
    });
  }
});
