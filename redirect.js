/* redirect.js — pseudosec. Retired pages (dashboard, reference, resources) send old links,
   and their #sections, to the page that took them over. */
(function () {
  var MAP = {
    'dashboard.html': { '': 'index.html', news: 'stories.html', alerts: 'stories.html#alerts', tools: 'stories.html#tools',
      scams: 'play.html', cve: 'exploited.html', year: 'year.html', learn: 'learn.html' },
    'reference.html': { '': 'learn.html', e8: 'essential-eight.html', glossary: 'glossary.html',
      'owasp-web': 'owasp.html#web', 'owasp-api': 'owasp.html#api', 'owasp-llm': 'owasp.html#llm' },
    'resources.html': { '': 'safe.html' }
  };
  var map = MAP[location.pathname.split('/').pop()] || {}, h = location.hash.slice(1);
  location.replace(h.indexOf('letter-') === 0 ? 'glossary.html#' + h : map[h] || map[''] || 'index.html');
})();
