/* practise.js — pseudosec. Practise: "Show me things for" filters the list to everyone, just me,
   my business or a career in cyber. Sections with nothing left hide too. */

document.addEventListener('DOMContentLoaded', function () {
  var btns = document.querySelectorAll('[data-who]'), count = document.getElementById('who-count');
  var items = document.querySelectorAll('li[data-for]');
  function show(who) {
    var n = 0;
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.who === who); });
    items.forEach(function (li) {
      var on = !who || li.dataset.for.split(' ').indexOf(who) > -1;
      li.hidden = !on;
      n += on;
    });
    document.querySelectorAll('.col .part').forEach(function (s) { s.hidden = !s.querySelector('li:not([hidden])'); });
    count.textContent = n + ' of ' + items.length + ' shown';
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.who); }); });
  show('');
});
