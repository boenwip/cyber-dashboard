/**
 * definitions-page.js — pseudosec.
 * Glossary page: search, filter, A-Z index, term cards
 */

var currentLevel  = 'all';
var currentSearch = '';

function renderAlpha(terms) {
  var letters = {};
  terms.forEach(function(t) {
    var l = t.term[0].toUpperCase();
    if (!letters[l]) letters[l] = 0;
    letters[l]++;
  });
  var el = document.getElementById('def-alpha');
  if (!el) return;
  var allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  el.innerHTML = allLetters.map(function(l) {
    var has = letters[l] > 0;
    return '<a class="alpha-link' + (has ? '' : ' alpha-link--empty') + '" ' +
      (has ? 'href="#letter-' + l + '"' : '') + ' aria-label="' + l + '">' + l + '</a>';
  }).join('');
}

function renderDefs() {
  var grid = document.getElementById('def-grid');
  var countEl = document.getElementById('def-count');
  if (!grid) return;

  var filtered = DEFINITIONS.filter(function(t) {
    var matchLevel  = currentLevel === 'all' || t.level === currentLevel;
    var matchSearch = !currentSearch ||
      t.term.toLowerCase().indexOf(currentSearch) > -1 ||
      t.short.toLowerCase().indexOf(currentSearch) > -1 ||
      (t.full || '').toLowerCase().indexOf(currentSearch) > -1;
    return matchLevel && matchSearch;
  }).sort(function(a, b) { return a.term.localeCompare(b.term); });

  if (countEl) countEl.textContent = filtered.length + ' term' + (filtered.length !== 1 ? 's' : '');

  if (!filtered.length) {
    grid.innerHTML = '<div class="def-empty">No terms match your search.</div>';
    return;
  }

  // Group by first letter
  var byLetter = {};
  filtered.forEach(function(t) {
    var l = t.term[0].toUpperCase();
    if (!byLetter[l]) byLetter[l] = [];
    byLetter[l].push(t);
  });

  grid.innerHTML = Object.keys(byLetter).sort().map(function(letter) {
    var cards = byLetter[letter].map(function(t) {
      var levelBadge = '<span class="def-level def-level--' + t.level + '">' + t.level + '</span>';
      var example = t.example ?
        '<div class="def-example"><span class="def-example-label">Example</span>' +
        t.example.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' : '';
      return '<div class="def-card" role="listitem">' +
        '<div class="def-card-header">' +
          '<span class="def-term">' + t.term.replace(/</g,'&lt;') + '</span>' +
          levelBadge +
        '</div>' +
        '<div class="def-short">' + t.short.replace(/</g,'&lt;') + '</div>' +
        '<div class="def-full">' + (t.full || '').replace(/</g,'&lt;') + '</div>' +
        example +
      '</div>';
    }).join('');
    return '<div class="def-letter-section" id="letter-' + letter + '">' +
      '<div class="def-letter-head">' + letter + '</div>' +
      cards +
    '</div>';
  }).join('');
}

function filterLevel(level, btn) {
  currentLevel = level;
  document.querySelectorAll('.def-lvl-btn').forEach(function(b) {
    b.classList.remove('def-lvl-btn--active');
  });
  btn.classList.add('def-lvl-btn--active');
  renderDefs();
}

function initSearch() {
  var input = document.getElementById('def-search');
  if (!input) return;
  var timer;
  input.addEventListener('input', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      currentSearch = input.value.toLowerCase().trim();
      renderDefs();
    }, 200);
  });
}

// ── REFERENCE PAGE TABS (OWASP / Essential Eight / Glossary) ──
function initRefTabs() {
  var tabs   = document.querySelectorAll('.ref-tab-btn');
  var panels = document.querySelectorAll('.ref-panel');
  if (!tabs.length) return;

  function activate(tabId) {
    tabs.forEach(function(t) {
      var on = t.dataset.tab === tabId;
      t.classList.toggle('ref-tab-btn--active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function(p) {
      p.classList.toggle('ref-panel--active', p.id === 'panel-' + tabId);
    });
    history.replaceState(null, '', '#' + tabId);
  }

  tabs.forEach(function(btn) {
    btn.addEventListener('click', function() { activate(btn.dataset.tab); });
  });

  var glossaryLink = document.getElementById('wotd-glossary-link');
  if (glossaryLink) {
    glossaryLink.addEventListener('click', function(e) {
      e.preventDefault();
      activate('glossary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hash = location.hash.replace('#', '');
  var valid = ['owasp-web','owasp-api','owasp-llm','e8','glossary'];
  if (hash && valid.indexOf(hash) !== -1) activate(hash);
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof DEFINITIONS === 'undefined' || !DEFINITIONS.length) return;
  renderAlpha(DEFINITIONS);
  renderDefs();
  initSearch();
  renderWotd(DEFINITIONS);
  initRefTabs();

  document.querySelectorAll('.def-lvl-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { filterLevel(btn.dataset.level, btn); });
  });
});
