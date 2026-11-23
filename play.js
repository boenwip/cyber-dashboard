/* play.js — pseudosec. Spot the scam: one hand-written message a day from data/puzzles.json.
   You tap the parts that look suspicious, then decide; the answer shows which giveaways you found.
   Progress (streak, right answers, today's answer) is stored in this browser only.
   Requires shared.js (esc, sydneyDayNumber, siteUrl, canNativeShare, copyText) and swoop.js. */

// shortcut: dashboard.js keeps an older copy of this puzzle for its Scams tab, until the old dashboard goes
var LAUNCH_DAY = 20751;   // 25 Oct 2026, puzzle #1
var RANKS = [
  { name: 'Curious',         at: 0 },
  { name: 'Alert',           at: 3 },
  { name: 'Scam Spotter',    at: 10 },
  { name: 'Family Guardian', at: 25 }
];
var PUZZLE_KEY = 'csi-puzzle';   // shared with the old dashboard puzzle, so streaks carry over
var puzzle = null, puzzleNo = 0, sw = null;

function loadState() {
  var fallback = { last: null, streak: 0, correct: 0, played: 0, today: null };
  try { var v = JSON.parse(localStorage.getItem(PUZZLE_KEY)); return v && typeof v === 'object' ? v : fallback; }
  catch (e) { return fallback; }
}
function saveState(v) { try { localStorage.setItem(PUZZLE_KEY, JSON.stringify(v)); } catch (e) {} }

// Every piece of the message can be tapped, so the real giveaways aren't given away
function renderMsg(p) {
  var top = p.channel === 'email'
    ? '<div class="msg-top"><b class="sender">' + esc(p.from) + '</b><span class="addr">' + esc(p.address || '') + '</span></div>' +
      (p.subject ? '<p class="subject">' + esc(p.subject) + '</p>' : '')
    : '<div class="msg-top"><b class="sender">Text from ' + esc(p.from) + '</b><span class="addr">Today ' + esc(p.time || '') + '</span></div>';
  var body = p.body.map(function (seg, i) {
    var text = esc(seg.t).replace(/\n/g, '<br>');
    if (!seg.t.trim()) return text;
    return '<span class="seg' + (seg.link ? ' fake-link' : '') + '" role="button" tabindex="0" aria-pressed="false" data-i="' + i + '">' + text + '</span>';
  }).join('');
  var el = document.getElementById('msg');
  el.setAttribute('aria-label', p.channel === 'email' ? 'Example email' : 'Example text message');
  el.innerHTML = top + '<p class="body" id="msg-body">' + body + '</p>';
}

function picked() {
  return [].map.call(document.querySelectorAll('#msg .seg[aria-pressed="true"]'), function (s) { return +s.dataset.i; });
}
function toggle(seg) {
  if (!seg.hasAttribute('tabindex')) return;   // answered: the message is locked
  seg.setAttribute('aria-pressed', seg.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
}

// After the answer: number every giveaway, mark the ones you found and the ones you missed
function reveal(found) {
  var n = 0;
  document.querySelectorAll('#msg .seg').forEach(function (s) {
    var seg = puzzle.body[+s.dataset.i], mine = found.indexOf(+s.dataset.i) > -1;
    s.removeAttribute('role'); s.removeAttribute('tabindex'); s.removeAttribute('aria-pressed');
    if (seg.g == null) return;
    n += 1;
    s.classList.add('clue', mine ? 'got' : 'missed');
    s.insertAdjacentHTML('beforeend', '<sup>' + (seg.g + 1) + '</sup>');
  });
  return { n: n, got: document.querySelectorAll('#msg .clue.got').length };
}

function rankFor(correct) {
  var r = 0;
  RANKS.forEach(function (k, i) { if (correct >= k.at) r = i; });
  return r;
}

function renderProgress(st) {
  var r = rankFor(st.correct), next = RANKS[r + 1];
  var line = st.streak > 0 ? '<b>' + st.streak + '-day streak</b>' : '<b>Start a streak today</b>';
  if (next) { var left = next.at - st.correct; line += ' ' + left + ' more right ' + (left === 1 ? 'answer' : 'answers') + ' to reach ' + esc(next.name) + '.'; }
  else line += ' Top rank reached. Keep the streak going.';
  document.getElementById('streak').innerHTML = line;
  document.getElementById('ranks').innerHTML = RANKS.map(function (k, i) {
    var cls = i <= r ? 'done' : (i === r + 1 ? 'next' : '');
    return '<li class="' + cls + '">' + esc(k.name) + (i <= r ? '<span class="visually-hidden"> (reached)</span>' : i === r + 1 ? '<span class="visually-hidden"> (next)</span>' : '') + '</li>';
  }).join('');
  document.getElementById('share').hidden = st.last !== sydneyDayNumber();
}

function showResult(choice, found) {
  var right = choice === puzzle.answer, scam = puzzle.answer === 'scam';
  var score = reveal(found || []);
  var head = right
    ? (scam ? 'Nice spot. This one\'s a scam.' : 'Good call. This one\'s real.')
    : (scam ? 'This one fools lots of people. It\'s a scam.' : 'Fair enough to be careful. This one\'s real.');
  var lead = scam
    ? 'You spotted ' + score.got + ' of ' + score.n + ' giveaways. Here they are:'
    : 'What makes it trustworthy:';
  var res = document.getElementById('result');
  res.className = 'result ' + (right ? 'good' : 'bad');
  res.innerHTML = '<p class="result-h">' + esc(head) + '</p><p>' + esc(lead) + '</p>' +
    '<ol>' + puzzle.giveaways.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ol>';
  res.hidden = false;
  document.getElementById('how').hidden = true;
  document.getElementById('puzzle').classList.add('answered');
  document.querySelectorAll('#choices .choice').forEach(function (b) {
    b.disabled = true;
    b.setAttribute('aria-pressed', b.dataset.answer === choice ? 'true' : 'false');
  });
}

function answer(choice) {
  var st = loadState(), today = sydneyDayNumber();
  if (st.last === today) return;
  var right = choice === puzzle.answer, found = picked();
  st.streak = st.last === today - 1 ? st.streak + 1 : 1;
  st.last = today;
  st.played += 1;
  if (right) st.correct += 1;
  st.today = { day: today, choice: choice, right: right, found: found };
  saveState(st);
  showResult(choice, found);
  renderProgress(st);
  document.getElementById('result').focus();
  sw.react(right ? 'hop' : 'tilt');
}

function share() {
  var st = loadState(), t = st.today || {};
  var text = 'Spot the scam #' + puzzleNo + ': ' + (t.right ? 'got it right' : 'got caught out') +
    (st.streak > 1 ? ', ' + st.streak + '-day streak' : '') + '. Try today\'s: ' + siteUrl();
  var done = document.getElementById('share-done');
  if (canNativeShare()) { navigator.share({ title: 'Spot the scam', text: text }).catch(function () {}); return; }
  copyText(text).then(function () { done.textContent = 'Copied. Paste it anywhere.'; },
                      function () { done.textContent = text; });
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/puzzles.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      var items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) throw new Error('no puzzles');
      var today = sydneyDayNumber();
      puzzleNo = Math.max(1, today - LAUNCH_DAY + 1);
      puzzle = items[(puzzleNo - 1) % items.length];
      document.getElementById('puzzle-no').textContent = 'Puzzle ' + puzzleNo + ', ' +
        new Date().toLocaleDateString('en-AU', { timeZone: SYDNEY, weekday: 'long', day: 'numeric', month: 'long' });
      var ctx = document.getElementById('context');
      ctx.hidden = !puzzle.context;
      if (puzzle.context) ctx.textContent = puzzle.context;
      renderMsg(puzzle);

      var st = loadState();
      if (st.last != null && st.last < today - 1) st.streak = 0;   // missed a day
      if (st.today && st.today.day === today) showResult(st.today.choice, st.today.found);
      renderProgress(st);

      var msg = document.getElementById('msg');
      msg.addEventListener('click', function (e) { var s = e.target.closest('.seg'); if (s) toggle(s); });
      msg.addEventListener('keydown', function (e) {
        var s = e.target.closest('.seg');
        if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(s); }
      });
      document.getElementById('choices').addEventListener('click', function (e) {
        var b = e.target.closest('.choice');
        if (b && !b.disabled) answer(b.dataset.answer);
      });
      document.getElementById('share-btn').addEventListener('click', share);

      sw = Swoop(document.getElementById('swoop'));
      if (!SWOOP_REDUCED) sw.play([['idle', 600], ['blink', 140], ['idle', 220], ['blink', 140]]);
      sw.el.addEventListener('click', function () { sw.react('hop'); });

      document.getElementById('puzzle').hidden = false;
      document.getElementById('puzzle-unavailable').hidden = true;
    })
    .catch(function () { document.getElementById('puzzle-unavailable').textContent = 'Today\'s message is unavailable right now.'; });
});
