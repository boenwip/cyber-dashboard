/**
 * definitions-page.js — pseudosec.
 * Glossary page (glossary.html): search, filter, A-Z index, term cards
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
      // The example stays folded until asked for, so the list reads calmer
      var example = t.example ?
        '<button type="button" class="def-ex-btn" aria-expanded="false">Show an example</button>' +
        '<div class="def-example" hidden>' + esc(t.example) + '</div>' : '';
      return '<div class="def-card" role="listitem">' +
        '<div class="def-card-header">' +
          '<span class="def-term">' + esc(t.term) + '</span>' +
          levelBadge +
        '</div>' +
        '<div class="def-short">' + esc(t.short) + '</div>' +
        '<div class="def-full">' + esc(t.full) + '</div>' +
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

// Quiz me: a meaning and four words; Swoop hops when you're right and tilts his head when you're not
function initQuiz() {
  var box = document.getElementById('quiz'), sw = null, streak = 0;
  if (!box || typeof DEFINITIONS === 'undefined' || DEFINITIONS.length < 4) return;
  var q = document.getElementById('quiz-q'), opts = document.getElementById('quiz-opts'),
      result = document.getElementById('quiz-result'), next = document.getElementById('quiz-next');
  function pick(n) {
    var pool = DEFINITIONS.slice(), out = [];
    while (out.length < n) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }
  function ask() {
    var four = pick(4), answer = four[0];
    q.textContent = answer.short;
    opts.innerHTML = four.sort(function () { return Math.random() - .5; }).map(function (t) {
      return '<button type="button" data-right="' + (t === answer) + '">' + esc(t.term) + '</button>';
    }).join('');
    result.textContent = '';
    next.hidden = true;
  }
  opts.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || next.hidden === false) return;
    var right = b.dataset.right === 'true';
    opts.querySelectorAll('button').forEach(function (o) {
      o.disabled = true;
      if (o.dataset.right === 'true') o.classList.add('right');
    });
    if (!right) b.classList.add('wrong');
    streak = right ? streak + 1 : 0;
    result.textContent = right ? (streak > 1 ? 'Right, ' + streak + ' in a row.' : 'Right.') : 'Not quite: it’s ' + opts.querySelector('.right').textContent + '.';
    if (sw) sw.react(right ? 'hop' : 'tilt');
    next.hidden = false;
    next.focus();
  });
  next.addEventListener('click', ask);
  document.getElementById('quiz-start').addEventListener('click', function () {
    this.hidden = true;
    document.getElementById('quiz-body').hidden = false;
    if (!sw) sw = Swoop(document.getElementById('swoop'));
    ask();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof DEFINITIONS !== 'undefined' && DEFINITIONS.length) {
    renderAlpha(DEFINITIONS);
    renderDefs();
    initSearch();
    initQuiz();
  }
  document.getElementById('def-grid').addEventListener('click', function (e) {
    var b = e.target.closest('.def-ex-btn');
    if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open);
    b.textContent = open ? 'Hide the example' : 'Show an example';
    b.nextElementSibling.hidden = !open;
  });
  // An A-Z link, reloaded or shared: the letters only exist once rendered
  var letter = location.hash.indexOf('#letter-') === 0 && document.getElementById(location.hash.slice(1));
  if (letter) letter.scrollIntoView();

  document.querySelectorAll('.def-lvl-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { filterLevel(btn.dataset.level, btn); });
  });
});
