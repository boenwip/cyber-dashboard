/**
 * definitions-page.js — PseudoSec
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

document.addEventListener('DOMContentLoaded', function() {
  renderAlpha(DEFINITIONS);
  renderDefs();
  initSearch();
  renderWotd(DEFINITIONS);
});
