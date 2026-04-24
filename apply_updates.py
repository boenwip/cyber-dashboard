#!/usr/bin/env python3
"""
Run this script from inside ~/Documents/cyber-dashboard/
It applies all pending dashboard updates directly to your local files.
Usage: python apply_updates.py
"""
import re, os

print("Applying dashboard updates...")

# ── dashboard.js fixes ──────────────────────────────────────
with open('dashboard.js', 'r') as f:
    js = f.read()

# 1. Remove Good News from applyQuickView
js = js.replace(
    "  } else if (view === 'good') {\n    setFilter('topic', 'Good News');\n  }",
    "  }"
)

# 2. Rename Critical now -> Critical in any remaining references
js = js.replace("'Critical now'", "'Critical'")
js = js.replace("'Critical Now'", "'Critical'")

# 3. Make stat strip null-safe
if "document.getElementById('stat-acsc').textContent" in js:
    old = """  document.getElementById('stat-acsc').textContent = acscCount || '—';
  document.getElementById('stat-new').textContent = newCount || '—';
  document.getElementById('stat-total').textContent = items.length;
  document.getElementById('stat-scams').textContent = scamCount || '—';

  const ts = data.last_updated || '';
  if (ts) document.getElementById('stat-updated').textContent = 'Updated ' + ts + ' AEST';"""
    new = """  function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  setEl('stat-acsc', acscCount || '—');
  setEl('stat-new', newCount || '—');
  setEl('stat-total', items.length);
  setEl('stat-scams', scamCount || '—');
  const ts = data.last_updated || '';
  if (ts) setEl('stat-updated', 'Updated ' + ts + ' AEST');"""
    js = js.replace(old, new)
    print("  Fixed: stat strip null-safe")

# 4. Make DOM updates in loadData null-safe
if "document.getElementById('last-updated').textContent = ts" in js:
    old = """    const ts = data.last_updated ? formatDateAEST(data.last_updated) : '';
    document.getElementById('last-updated').textContent = ts ? 'Last updated: ' + ts + ' AEST' : '';
    document.getElementById('footer-updated').textContent = ts ? 'Updated: ' + ts + ' AEST' : '';
    renderArticles();"""
    new = """    const ts = data.last_updated ? formatDateAEST(data.last_updated) : '';
    var luEl = document.getElementById('last-updated');
    var fuEl = document.getElementById('footer-updated');
    if (luEl) luEl.textContent = ts ? 'Last updated: ' + ts + ' AEST' : '';
    if (fuEl) fuEl.textContent = ts ? 'Updated: ' + ts + ' AEST' : '';
    try { updateStatStrip(data); } catch(e) {}
    renderArticles();"""
    js = js.replace(old, new)
    print("  Fixed: loadData null-safe")

# 5. Ensure article cap at 20
if '.filter(passesFilters)' in js and '.slice(0, 20)' not in js:
    js = js.replace(
        '.filter(passesFilters)',
        '.filter(passesFilters)\n    .sort(function(a, b) { return parseArticleDate(b.date) - parseArticleDate(a.date); })\n    .slice(0, 20)'
    )
    print("  Fixed: article cap at 20")

# Validate JS
assert js.count('{') == js.count('}'), "JS braces unbalanced!"
assert js.count('(') == js.count(')'), "JS parens unbalanced!"
assert '`' not in js, "Backticks in JS!"
assert js.strip().endswith('loadData();'), "JS incomplete!"
print("  JS: all checks passed")

with open('dashboard.js', 'w') as f:
    f.write(js)

# ── dashboard.html fixes ─────────────────────────────────────
with open('dashboard.html', 'r') as f:
    html = f.read()

# 1. Remove Good News quick view button
html = html.replace(
    '\n  <button class="qv" onclick="applyQuickView(\'good\', this)">✦ Good News</button>',
    ''
)

# 2. Rename Critical now -> Critical
html = html.replace('>Critical now<', '>Critical<')
html = html.replace('>Critical Now<', '>Critical<')

# 3. Restructure live tab to 3 columns if still 2 columns
if 'grid-template-columns:1fr 1fr;' in html and 'grid-template-columns:1fr 1fr 1fr' not in html:
    html = html.replace(
        'grid-template-columns:1fr 1fr;',
        'grid-template-columns:1fr 1fr 1fr;'
    )
    print("  Fixed: live tab 3 columns")

# Validate HTML
assert html.strip().endswith('</html>'), "HTML incomplete!"
assert '<style>' not in html, "Inline style found!"
assert '<script>' not in html, "Inline script found!"
print("  HTML: all checks passed")

with open('dashboard.html', 'w') as f:
    f.write(html)

# ── dashboard.css fixes ──────────────────────────────────────
with open('dashboard.css', 'r') as f:
    css = f.read()

# Ensure filter bar is inline rows not 2x2 grid
if 'grid-template-columns: 1fr 1fr' in css:
    css = re.sub(
        r'\.filter-bar \{[^}]+grid-template-columns: 1fr 1fr;[^}]+\}',
        '''.filter-bar {
  padding: 6px 32px;
  border-bottom: 0.5px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 2px;
}''',
        css
    )
    print("  Fixed: filter bar inline")

# Ensure filter-row is horizontal
if 'flex-direction: column' in css and '.filter-row' in css:
    css = css.replace(
        '.filter-row {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}',
        '.filter-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding: 3px 0;\n}'
    )
    print("  Fixed: filter-row horizontal")

assert css.count('{') == css.count('}'), "CSS braces unbalanced!"
print("  CSS: all checks passed")

with open('dashboard.css', 'w') as f:
    f.write(css)

print("\nAll updates applied. Now run:")
print("  python fetch_cyber_news.py")
print("  git add .")
print('  git commit -m "apply all pending fixes"')
print("  git fetch origin && git merge origin/main -m merge && git push")
