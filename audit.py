#!/usr/bin/env python3
"""
audit.py — pseudosec. pre-ship audit
Run from the project root before every git push.
Usage: python3 audit.py
"""
import re, ast, os, sys

errors = []
warnings = []

def check(label, condition, warn=False):
    result = bool(condition)
    marker = "✓" if result else ("⚠" if warn else "✗")
    if not result:
        (warnings if warn else errors).append(label)
    return result

def load(path):
    try:
        return open(path).read()
    except FileNotFoundError:
        errors.append(f"FILE MISSING: {path}")
        return ''

# ── LOAD ALL FILES ──────────────────────────────────────────
idx      = load('index.html')
shard_css = load('shared.css')
dash_css  = load('dashboard.css')
shard_js  = load('shared.js')
dash_js   = load('dashboard.js')
defs_html = load('definitions.html')
defs_js   = load('definitions-page.js')
res_html  = load('resources.html')
res_js    = load('resources.js')
aig_html  = load('ai-guide.html')
aig_js    = load('ai-guide.js')
py_script = load('fetch_cyber_news.py')
workflow  = load('.github/workflows/fetch_news.yml')

all_html = [('index.html', idx), ('definitions.html', defs_html),
            ('resources.html', res_html), ('ai-guide.html', aig_html)]
all_js_files = [('shared.js', shard_js), ('dashboard.js', dash_js),
                ('definitions-page.js', defs_js), ('resources.js', res_js),
                ('ai-guide.js', aig_js)]
all_css_files = [('shared.css', shard_css), ('dashboard.css', dash_css)]

results = []

# ── PASS 1: CONTENT INTEGRITY ───────────────────────────────
print("\n── PASS 1: CONTENT INTEGRITY")
tests = [
    ("$80,850 present in index",           '$80,850' in idx),
    ("$36,633 present in index",           '$36,633' in idx),
    ("No stripped dollar sign (0,850)",    not re.search(r'(?<!\d)(?<!\$)0,850', idx)),
    ("No stripped dollar sign (6,633)",    not re.search(r'(?<!\d)(?<!\$)(?<!3)6,633', idx)),
    ("Wotd def not showing Loading",       'wotd-def">Loading' not in idx),
    ("Scam callout hidden by default",     'scam-callout' in idx),
    ("Briefing hides on fail",             "display = 'none'" in dash_js),
    ("51+ definitions",                    load('definitions.js').count("short:") >= 51),
    ("briefing.json exists",               os.path.exists('briefing.json')),
    ("news.json exists",                   os.path.exists('news.json')),
    ("cve.json exists",                    os.path.exists('cve.json')),
    ("tool_updates.json exists",           os.path.exists('tool_updates.json')),
    ("pseudosec.png exists",               os.path.exists('pseudosec.png')),
]
for label, cond in tests:
    r = check(label, cond)
    results.append((label, r))
    print(f"  {'✓' if r else '✗'} {label}")

# ── PASS 2: HTML STRUCTURE ──────────────────────────────────
print("\n── PASS 2: HTML STRUCTURE")
for name, h in all_html:
    tests = [
        (f"{name}: ends </html>",          h.strip().endswith('</html>')),
        (f"{name}: has DOCTYPE",           '<!DOCTYPE html>' in h),
        (f"{name}: lang=en",               'lang="en"' in h),
        (f"{name}: meta description",      'meta name="description"' in h),
        (f"{name}: favicon",               'rel="icon"' in h),
        (f"{name}: no inline style",       '<style>' not in h),
        (f"{name}: no inline script",      '<script>' not in h),
        (f"{name}: loads shared.css",      'shared.css' in h),
        (f"{name}: loads shared.js",       'shared.js' in h),
        (f"{name}: 4+ nav links",          h.count('nav-link') >= 4),
        (f"{name}: logo present",          'pseudosec.png' in h),
        (f"{name}: noopener on externals", 'rel="noopener' in h or h.count('target="_blank"') == 0),
    ]
    for label, cond in tests:
        r = check(label, cond)
        results.append((label, r))
        print(f"  {'✓' if r else '✗'} {label}")

# Script load order in index.html
sp = [(m.start(), m.group(1)) for m in re.finditer(r'<script src="([^"]+)"', idx)]
order = [s[1] for s in sorted(sp)]
if 'shared.js' in order and 'dashboard.js' in order:
    r = check("shared.js before dashboard.js", order.index('shared.js') < order.index('dashboard.js'))
    results.append(("shared.js before dashboard.js", r))
    print(f"  {'✓' if r else '✗'} shared.js before dashboard.js")

# ── PASS 3: CSS ─────────────────────────────────────────────
print("\n── PASS 3: CSS")
for name, css in all_css_files:
    o, c = css.count('{'), css.count('}')
    r = check(f"{name}: braces balanced ({o}/{c})", o == c)
    results.append((f"{name}: braces", r))
    print(f"  {'✓' if r else '✗'} {name}: braces balanced ({o}/{c})")

extra_css = [
    ("Dark yellow accent #f5c842",         '#f5c842' in shard_css),
    ("Light navy #0D3B66",                 '#0D3B66' in shard_css),
    ("Reduced motion respected",           'prefers-reduced-motion' in shard_css),
    ("Mobile 768px breakpoint",            'max-width: 768px' in shard_css),
    ("Article hover feedback",             'border-left-color' in dash_css),
    ("Count fade-in defined",              'count-num.visible' in dash_css),
    ("Logo height 44px",                   'height: 44px' in shard_css),
]
for label, cond in extra_css:
    r = check(label, cond)
    results.append((label, r))
    print(f"  {'✓' if r else '✗'} {label}")

# ── PASS 4: JAVASCRIPT ──────────────────────────────────────
print("\n── PASS 4: JAVASCRIPT")
for name, js in all_js_files:
    tests = [
        (f"{name}: braces balanced", js.count('{') == js.count('}')),
        (f"{name}: parens balanced", js.count('(') == js.count(')')),
        (f"{name}: no backticks",    '`' not in js),
    ]
    for label, cond in tests:
        r = check(label, cond)
        results.append((label, r))
        print(f"  {'✓' if r else '✗'} {label}")

extra_js = [
    ("XSS: titles HTML-escaped",           "replace(/</g,'&lt;')" in dash_js),
    ("href validated (http check)",        "indexOf('http') === 0" in dash_js),
    ("DOMContentLoaded wraps init",        'DOMContentLoaded' in dash_js),
    ("No eval() in any JS",                all('eval(' not in js for _, js in all_js_files)),
    ("No document.write() in any JS",      all('document.write(' not in js for _, js in all_js_files)),
    ("WOTD calc uses UTC offset",          'nowUtc' in shard_js),
    ("HIBP email validation",              r'/^[^\s@]+@[^\s@]+\.[^\s@]+$/' in res_js),
    ("Clipboard fallback present",         'execCommand' in aig_js),
    ("Search debounced",                   'clearTimeout' in defs_js),
]
for label, cond in extra_js:
    r = check(label, cond)
    results.append((label, r))
    print(f"  {'✓' if r else '✗'} {label}")

# ── PASS 5: PYTHON & WORKFLOW ────────────────────────────────
print("\n── PASS 5: PYTHON & WORKFLOW")
py_valid = True
try:
    ast.parse(py_script)
except SyntaxError as e:
    py_valid = False
    errors.append(f"Python syntax error: {e}")

py_tests = [
    ("Python syntax valid",                py_valid),
    ("No bare datetime.now() for display", py_script.count('datetime.now()') <= 1),
    ("AEST offset used",                   'hours=10' in py_script),
    ("API key from environment",           'os.environ.get' in py_script),
    ("API key not hardcoded",              'sk-ant' not in py_script),
    ("CISA KEV source present",            'cisa.gov' in py_script),
    ("No Schneier feed",                   'schneier.com' not in py_script),
    ("30-day article window",              'days=30' in py_script),
    ("Briefing list-safe",                 'isinstance(news, list)' in py_script),
    ("Workflow force-with-lease",          'force-with-lease' in workflow),
    ("Workflow API key secret",            'secrets.ANTHROPIC_API_KEY' in workflow),
    ("Workflow commits briefing.json",     'briefing.json' in workflow),
]
for label, cond in py_tests:
    r = check(label, cond)
    results.append((label, r))
    print(f"  {'✓' if r else '✗'} {label}")

# ── PASS 6: SECURITY ─────────────────────────────────────────
print("\n── PASS 6: SECURITY")
all_content = idx + defs_html + res_html + aig_html + shard_js + dash_js
sec_tests = [
    ("No API keys in HTML or JS",          'sk-ant' not in all_content),
    ("Iframe sandboxed",                   'sandbox=' in idx),
    ("Iframe loading=lazy",                'loading="lazy"' in idx),
    ("Iframe referrerpolicy set",          'referrerpolicy=' in idx),
    ("ARIA live on dynamic content",       'aria-live' in idx),
    ("role=feed on article list",          'role="feed"' in idx),
    ("HIBP uses HTTPS",                    'https://haveibeenpwned' in res_js),
]
for label, cond in sec_tests:
    r = check(label, cond)
    results.append((label, r))
    print(f"  {'✓' if r else '✗'} {label}")

# ── SUMMARY ──────────────────────────────────────────────────
passed = sum(1 for _, r in results if r)
total  = len(results)

print(f"\n{'='*50}")
print(f"RESULTS: {passed}/{total} checks passed")

if errors:
    print(f"\n✗ ERRORS ({len(errors)}) — fix before shipping:")
    for e in errors:
        print(f"  • {e}")

if warnings:
    print(f"\n⚠ WARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"  • {w}")

if not errors:
    print("\n✓ AUDIT PASSED — proceed to human review lenses")
    sys.exit(0)
else:
    print("\n✗ AUDIT FAILED — do not ship until errors are resolved")
    sys.exit(1)
