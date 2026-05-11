/**
 * resources.js — PseudoSec
 * Breach checker (HaveIBeenPwned v3 API)
 */

var HIBP_CHECKING = false;

function checkBreach() {
  if (HIBP_CHECKING) return;
  var emailEl = document.getElementById('hibp-email');
  var resultEl = document.getElementById('hibp-result');
  var btn = document.getElementById('hibp-btn');
  if (!emailEl || !resultEl) return;

  var email = emailEl.value.trim();

  // Client-side email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    resultEl.className = 'hibp-result hibp-result--error';
    resultEl.textContent = 'Please enter a valid email address.';
    return;
  }

  HIBP_CHECKING = true;
  btn.disabled = true;
  btn.textContent = 'Checking...';
  resultEl.className = 'hibp-result hibp-result--loading';
  resultEl.textContent = 'Checking against known breaches...';

  // HIBP v3 — no API key required for basic breach check
  var url = 'https://haveibeenpwned.com/api/v3/breachedaccount/' +
    encodeURIComponent(email) + '?truncateResponse=false';

  fetch(url, {
    headers: {
      'hibp-api-key': '',
      'User-Agent': 'PseudoSec-Dashboard'
    }
  })
  .then(function(r) {
    if (r.status === 404) {
      // Not found in any breach
      resultEl.className = 'hibp-result hibp-result--safe';
      resultEl.innerHTML =
        '<span class="hibp-icon">✓</span>' +
        '<div>' +
          '<strong>Good news — no breaches found.</strong><br>' +
          '<span>Your email address was not found in any known data breaches. ' +
          'Keep using strong, unique passwords and enable 2FA on all accounts.</span>' +
        '</div>';
      return null;
    }
    if (r.status === 429) {
      resultEl.className = 'hibp-result hibp-result--error';
      resultEl.textContent = 'Rate limit reached. Please wait a moment and try again.';
      return null;
    }
    if (!r.ok) {
      resultEl.className = 'hibp-result hibp-result--error';
      resultEl.textContent = 'Could not complete the check. Please try again shortly.';
      return null;
    }
    return r.json();
  })
  .then(function(data) {
    if (!data) return;
    // Found in breaches
    var count = data.length;
    var breachList = data
      .sort(function(a, b) { return new Date(b.BreachDate) - new Date(a.BreachDate); })
      .slice(0, 5)
      .map(function(b) {
        return '<li><strong>' + (b.Name || '').replace(/</g,'&lt;') + '</strong>' +
          (b.BreachDate ? ' · ' + b.BreachDate.substring(0,4) : '') +
          (b.PwnCount ? ' · ' + Number(b.PwnCount).toLocaleString() + ' accounts' : '') +
          '</li>';
      }).join('');
    resultEl.className = 'hibp-result hibp-result--pwned';
    resultEl.innerHTML =
      '<span class="hibp-icon">⚠</span>' +
      '<div>' +
        '<strong>Found in ' + count + ' data breach' + (count !== 1 ? 'es' : '') + '.</strong><br>' +
        '<span>You should change your password anywhere you used the same credentials. Enable 2FA immediately.</span>' +
        '<ul class="hibp-breach-list">' + breachList + '</ul>' +
        (count > 5 ? '<span class="hibp-more">...and ' + (count - 5) + ' more. <a href="https://haveibeenpwned.com/account/' + encodeURIComponent(email) + '" target="_blank" rel="noopener">View all on HIBP ↗</a></span>' : '') +
      '</div>';
  })
  .catch(function(err) {
    // HIBP blocks direct browser requests — direct user to the site
    resultEl.className = 'hibp-result hibp-result--info';
    resultEl.innerHTML =
      '<span class="hibp-icon">ℹ</span>' +
      '<div>' +
        '<strong>Check directly on HaveIBeenPwned</strong><br>' +
        'The HIBP API requires server-side access. Visit ' +
        '<a href="https://haveibeenpwned.com" target="_blank" rel="noopener">haveibeenpwned.com</a> ' +
        'to check your email directly — it\'s free and takes 10 seconds.' +
      '</div>';
  })
  .finally(function() {
    HIBP_CHECKING = false;
    btn.disabled = false;
    btn.textContent = 'Check';
  });
}

// Allow Enter key in email input
document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('hibp-email');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') checkBreach();
    });
  }
});
