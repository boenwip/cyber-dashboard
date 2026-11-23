/* swoop.js — pseudosec. Swoop the magpie: his pixel frames and his moves.
   He moves once when a page loads, then only in answer to the reader; never on a loop,
   and not at all under reduced motion. Styles in swoop.css. */

var SWOOP_REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Frames are 23 x 16 pixels. K black, W white, G grey (beak).
var SWOOP_BASE = [
  '.......................', '................KKKK...', '...............KKKKKK..', '...............KKWKKKGG',
  '...............KKKKKGG.', '..............WWKKKK...', '............WWWWKKKK...', '........KKKKWWKKKKKK...',
  '.....KKKKKWWWKKKKKKK...', '...KKKKWWWWWKKKKKKK....', 'KKKKKKWWWWKKKKKKKK.....', 'KKKK..KKKKKKKKKKK......',
  'K........KKKKKKK.......', '..........K...K........', '..........K...K........', '.........KK..KK........'
];
var SWOOP_FRAMES = {
  idle: SWOOP_BASE,
  blink: SWOOP_BASE.map(function (r, y) { return y === 3 ? r.slice(0, 17) + 'K' + r.slice(18) : r; }),
  alert: ['................KKKK...', '...............KKKKKK..', '...............KKWKKKGG', '...............KKKKKGG.',
          '................KKKK...'].concat(SWOOP_BASE.slice(5)),
  fly: [
    '........KK.............', '........KKK.....KKKK...', '.........KKK...KKKKKK..', '.........KWKK..KKWKKKGG',
    '..........WWKK.KKKKKGG.', '..........WWWKKKKKK....', '...........WWKKKKKK....', '........KKKKKKKKKKKK...',
    '.....KKKKKKKKKKKKKK....', '...KKKKKWWWKKKKKKK.....', 'KKKKKKKWWKKKKKKK.......', 'KKKK.....KKKKK.........',
    'K......................', '.......................', '.......................', '.......................'
  ]
};
// Colours come from CSS classes (--swoop-k, --swoop-w) so dark mode can flip them
var SWOOP_FILL = { K: 'k', W: 'w', G: 'g' };

function swoopSvg(rows) {
  var r = '';
  rows.forEach(function (row, y) {
    row.split('').forEach(function (ch, x) { if (SWOOP_FILL[ch]) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" class="' + SWOOP_FILL[ch] + '"/>'; });
  });
  return '<svg viewBox="0 0 23 16" aria-hidden="true" shape-rendering="crispEdges">' + r + '</svg>';
}

// One Swoop: el is a .swoop element holding a .bird
function Swoop(el) {
  var me = { el: el, rest: 'idle', busy: false };
  me.pose = function (name) { el.querySelector('.bird').innerHTML = swoopSvg(SWOOP_FRAMES[name]); };
  // Play frames in order: [name, ms], then settle on the resting pose
  me.play = function (steps, done) {
    me.busy = true;
    (function next(i) {
      if (i === steps.length) { me.pose(me.rest); me.busy = false; if (done) done(); return; }
      me.pose(steps[i][0]);
      setTimeout(function () { next(i + 1); }, steps[i][1]);
    })(0);
  };
  // A one-off move (hop, ruffle or tilt, in shared.css) with a blink
  me.react = function (move) {
    if (me.busy || SWOOP_REDUCED) return;
    el.classList.remove('hop', 'ruffle', 'tilt'); void el.offsetWidth; el.classList.add(move || 'hop');
    me.play([['blink', 140], [me.rest, 10]]);
  };
  me.pose('idle');
  return me;
}
