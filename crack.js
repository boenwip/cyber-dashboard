/* crack.js — pseudosec. "How fast could this be cracked?" on Check a breach.
   A rough guide, worked out in the browser: nothing typed here is sent or stored. */

// Attackers try these (and these plus a number) first
var CRACK_COMMON = ['password', 'qwerty', 'qwertyuiop', 'asdfgh', 'abc', 'iloveyou', 'admin', 'welcome', 'letmein', 'monkey',
  'dragon', 'football', 'baseball', 'sunshine', 'princess', 'master', 'login', 'starwars', 'trustno', 'hello', 'freedom',
  'whatever', 'superman', 'shadow', 'secret', 'summer', 'winter', 'spring', 'autumn', 'australia', 'aussie', 'sydney',
  'melbourne', 'brisbane', 'perth', 'adelaide', 'kangaroo', 'footy', 'cricket', 'pass', 'test', 'user', 'love'];
var CRACK_RATE = 1e10;   // guesses a second: one gaming graphics card against a leaked, quickly-hashed password

// Seconds to find pw, on average, trying the likeliest guesses first
function crackSeconds(pw) {
  if (!pw) return 0;
  // Strip numbers and symbols off the ends, then undo swaps like P@ssw0rd
  var base = pw.toLowerCase().replace(/[\d\W_]+$/, '').replace(/^[\d\W_]+/, '')
    .replace(/[0@4]/g, function (c) { return c === '0' ? 'o' : 'a'; })
    .replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's');
  var guesses;
  var words = pw.split(/[\s\-_.]+/).filter(Boolean);
  if (/^\d+$/.test(pw)) guesses = Math.pow(10, pw.length);                     // all digits: a PIN or a date
  else if (words.length > 1 && words.every(function (w) { return /^[a-z]+$/i.test(w); }))
    guesses = Math.pow(50000, words.length);                                    // a passphrase: attackers guess whole words
  else if (CRACK_COMMON.indexOf(base) > -1) guesses = 1e4 * Math.pow(10, pw.length - base.length);
  else {
    var pool = (/[a-z]/.test(pw) ? 26 : 0) + (/[A-Z]/.test(pw) ? 26 : 0) + (/\d/.test(pw) ? 10 : 0) +
      (/[^a-zA-Z\d]/.test(pw) ? 33 : 0);
    // Repeats and runs (aaaa, abcd, 1234) add almost nothing, so they barely count
    var len = 1;
    for (var i = 1; i < pw.length; i++) {
      var step = pw.charCodeAt(i) - pw.charCodeAt(i - 1);
      len += step === 0 || step === 1 || step === -1 ? .2 : 1;
    }
    guesses = Math.pow(pool, len);
  }
  return guesses / 2 / CRACK_RATE;
}

function crackWords(s) {
  var units = [[31557600e9, 'billion years'], [31557600e6, 'million years'], [31557600e3, 'thousand years'],
    [31557600, 'years'], [86400, 'days'], [3600, 'hours'], [60, 'minutes'], [1, 'seconds']];
  if (s < 1) return 'Instantly';
  if (s > 31557600e12) return 'Longer than the universe has existed, many times over';
  for (var i = 0; i < units.length; i++) {
    if (s >= units[i][0]) {
      var n = Math.floor(s / units[i][0]);
      return 'About ' + n.toLocaleString('en-AU') + ' ' + (n === 1 ? units[i][1].replace(/s$/, '') : units[i][1]);
    }
  }
}

function crackTip(pw, s) {
  if (!pw) return 'Try a made-up password, or three random words.';
  if (s < 86400 && CRACK_COMMON.some(function (w) { return pw.toLowerCase().indexOf(w) > -1; }))
    return 'That contains one of the most common passwords. Attackers try those first, with numbers and symbols added.';
  if (pw.length < 12) return 'Make it longer. Length counts for more than symbols.';
  if (s < 31557600) return 'Getting there. Another random word would put it out of reach.';
  return 'Strong. Now make it different for every site: a password manager can remember them for you.';
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('crack-input');
  if (!input) return;
  var out = document.getElementById('crack-time'), tip = document.getElementById('crack-tip'), fill = document.getElementById('crack-fill');
  function show() {
    var pw = input.value, s = crackSeconds(pw);
    out.textContent = pw ? crackWords(s) : '–';
    tip.textContent = crackTip(pw, s);
    // The bar runs from instant to a thousand years, on a log scale
    var pct = pw ? Math.max(4, Math.min(100, Math.log10(Math.max(s, 1)) / 10.5 * 100)) : 0;
    fill.style.width = pct + '%';
    fill.className = s < 86400 ? 'weak' : s < 31557600 ? 'fair' : 'strong';
  }
  input.addEventListener('input', show);
  document.getElementById('crack-try').addEventListener('click', function () { input.value = 'magpie toaster rainbow ladder'; show(); input.focus(); });
  show();
});

if (typeof module !== 'undefined') module.exports = { crackSeconds: crackSeconds, crackWords: crackWords, crackTip: crackTip };
