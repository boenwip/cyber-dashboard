/* learn.js — pseudosec. Learn: the word of the day (from definitions.js) and the tip of the day.
   Requires shared.js (esc, pickForToday, renderWotd) and definitions.js. */

var TIPS = [
  ['Start with your email', 'Turn on multi-factor authentication for your email first. It\'s where every password-reset link goes, so it\'s the key to everything else. An authenticator app or a passkey is stronger than text-message codes.'],
  ['Use a password manager', 'You remember one strong passphrase and it creates and fills the rest. Most phones and browsers include one for free.'],
  ['Hang up and call back', 'A bank, telco or government agency won\'t ask for your password, PIN or one-time code over the phone. Hang up and call back on a number you find yourself.'],
  ['Check for breaches', 'See whether your email has appeared in a data breach at haveibeenpwned.com. If it has, change that password everywhere you used it.'],
  ['Keep things updated', 'Most attacks use flaws that already have a fix. Turn on automatic updates for your phone, computer and browser.'],
  ['Don\'t reuse passwords', 'If one site is breached, attackers try the same email and password everywhere else. A different password per site keeps one breach to one account.'],
  ['Type the address yourself', 'Don\'t use links in unexpected texts or emails to log in. Open the app or type the website address yourself; scammers rely on you clicking.'],
  ['Back up what matters', 'Keep a copy of important files somewhere separate, like an external drive or cloud storage. With a backup, ransomware is an inconvenience rather than a disaster.'],
  ['Lock your phone', 'Use a PIN, fingerprint or face unlock. A swipe pattern can often be guessed from the smudges on your screen.'],
  ['Trust your gut', 'If a call, email or message feels off, stop. Contact the organisation through details you find yourself. Legitimate organisations won\'t mind.']
];

document.addEventListener('DOMContentLoaded', function () {
  if (typeof DEFINITIONS !== 'undefined') {
    renderWotd(DEFINITIONS);
    var word = pickForToday(DEFINITIONS);
    if (word) document.getElementById('wotd-link').href = 'glossary.html#letter-' + word.term[0].toUpperCase();
  }
  var tip = pickForToday(TIPS);
  document.getElementById('tip-title').textContent = tip[0];
  document.getElementById('tip-text').textContent = tip[1];
  document.getElementById('tips').innerHTML = TIPS.map(function (t) { return '<li><b>' + esc(t[0]) + '.</b> ' + esc(t[1]) + '</li>'; }).join('');
});
