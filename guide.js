/* guide.js — pseudosec. Tick-off steps on guide pages (I've been scammed, Essential Eight).
   Ticks are kept in this browser only. The rail shows how many are done and what's next,
   and Swoop reacts to each tick. Requires swoop.js. */

document.addEventListener('DOMContentLoaded', function () {
  var list = document.querySelector('.steps[data-track]');
  if (!list) return;
  var key = 'csi-track-' + list.dataset.track, items = [].slice.call(list.children), done = {};
  try { done = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
  if (typeof done !== 'object') done = {};

  var swoopEl = document.getElementById('swoop'), sw = swoopEl && Swoop(swoopEl);
  var countEl = document.getElementById('track-count'), fill = document.getElementById('track-fill');
  var ring = document.getElementById('track-ring'), next = document.getElementById('track-next');

  items.forEach(function (li, i) {
    li.id = li.id || list.dataset.track + '-' + (i + 1);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tick';
    b.textContent = list.dataset.label || 'Done';
    b.addEventListener('click', function () {
      done[i] = !done[i];
      li.classList.toggle('just', done[i]);
      try { localStorage.setItem(key, JSON.stringify(done)); } catch (e) {}
      update(true);
    });
    li.appendChild(b);
  });

  function update(acted) {
    var n = 0, first = null;
    items.forEach(function (li, i) {
      var on = !!done[i];
      n += on;
      li.classList.toggle('done', on);
      li.querySelector('.tick').setAttribute('aria-pressed', on);
      if (!on && !first) first = li;
    });
    var pct = Math.round(n / items.length * 100);
    if (countEl) countEl.textContent = n;
    if (fill) fill.style.width = pct + '%';
    if (ring) ring.style.strokeDashoffset = 100 - pct;
    if (next) {
      next.parentNode.hidden = !first;
      if (first) { next.href = '#' + first.id; next.textContent = first.querySelector('h2').textContent; }
    }
    document.getElementById('track-all').hidden = !!first;
    if (acted && sw) sw.react(first ? 'ruffle' : 'hop');
  }
  update(false);
});
