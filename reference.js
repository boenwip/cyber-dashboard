/* reference.js — pseudosec. Reference was split into three pages; send old #tab links to the right one. */
(function () {
  var h = location.hash.slice(1), owasp = { 'owasp-web': 'web', 'owasp-api': 'api', 'owasp-llm': 'llm' };
  if (h === 'e8') location.replace('essential-eight.html');
  else if (h === 'glossary') location.replace('glossary.html');
  else if (h.indexOf('letter-') === 0) location.replace('glossary.html#' + h);
  else if (owasp[h]) location.replace('owasp.html#' + owasp[h]);
})();
