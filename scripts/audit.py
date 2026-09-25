#!/usr/bin/env python3
"""
audit.py — pseudosec. pre-ship checks. Run from anywhere:  python scripts/audit.py

Checks real properties of the site rather than the presence of strings:
  HTML   every local link/asset exists; external links open safely; CSP present,
         no inline handlers/javascript: URLs, inline script hash allowed by CSP
  Assets no third-party hosts for scripts, styles or fonts
  CSS    text colour tokens meet WCAG AA (4.5:1) on every surface, both themes
  Data   data/*.json is valid, dates are ISO 8601 UTC, links are https, text has no markup
Exit code is non-zero if anything fails. Pipeline logic is covered by tests/ (pytest).
"""
import base64
import hashlib
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PAGES = ["index.html", "reference.html", "resources.html", "ai-guide.html", "sources.html"]
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")

failures = []


def check(label, ok, detail=""):
    print(("  ✓ " if ok else "  ✗ ") + label + ("" if ok else ("  — " + detail if detail else "")))
    if not ok:
        failures.append(label)


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []           # (tag, attrs dict)
        self.inline_scripts = []
        self._in_script = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        self._in_script = tag == "script" and "src" not in a

    def handle_endtag(self, tag):
        if tag == "script":
            self._in_script = False

    def handle_data(self, data):
        if self._in_script and data.strip():
            self.inline_scripts.append(data)


def local_target(url):
    """Return a repo-relative path for a local URL, or None for external/anchor/data URLs."""
    if not url or url.startswith(("#", "data:", "mailto:", "tel:")):
        return None
    p = urlparse(url)
    if p.scheme or p.netloc:
        return None
    return p.path or None


# ── HTML ────────────────────────────────────────────────────
print("\n── HTML")
for page in PAGES:
    src = read(page)
    doc = Page()
    doc.feed(src)
    tags = doc.tags

    html_tag = next((a for t, a in tags if t == "html"), {})
    check(page + ": <html lang>", bool(html_tag.get("lang")))
    metas = [a for t, a in tags if t == "meta"]
    check(page + ": meta description", any(m.get("name") == "description" and m.get("content") for m in metas))
    check(page + ": canonical link", any(t == "link" and a.get("rel") == "canonical" for t, a in tags))

    csp = next((m.get("content", "") for m in metas if m.get("http-equiv", "").lower() == "content-security-policy"), "")
    check(page + ": CSP meta present", bool(csp))
    directives = [d.strip().split()[0] for d in csp.split(";") if d.strip()]
    check(page + ": CSP has no duplicate directives", len(directives) == len(set(directives)), str(directives))
    script_src = next((d for d in csp.split(";") if d.strip().startswith("script-src")), "")
    check(page + ": CSP script-src has no 'unsafe-inline'", "'unsafe-inline'" not in script_src)
    check(page + ": CSP style-src has no 'unsafe-inline'", "'unsafe-inline'" not in
          next((d for d in csp.split(";") if d.strip().startswith("style-src")), ""))
    inline_styles = [t for t, a in tags if "style" in a] + (["<style>"] if "<style" in src else [])
    check(page + ": no inline style attributes or <style> blocks", not inline_styles, str(inline_styles[:3]))
    for body in doc.inline_scripts:
        digest = base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode()
        check(page + ": inline script hash allowed by CSP", ("'sha256-%s'" % digest) in script_src)

    handlers = [(t, k) for t, a in tags for k in a if k.startswith("on")]
    check(page + ": no inline event handlers", not handlers, str(handlers[:3]))
    js_urls = [a.get("href") for t, a in tags if (a.get("href") or "").lower().startswith("javascript:")]
    check(page + ": no javascript: URLs", not js_urls)

    unsafe_blank = [a.get("href") for t, a in tags
                    if a.get("target") == "_blank" and not {"noopener", "noreferrer"} <= set((a.get("rel") or "").split())]
    check(page + ': target=_blank links have rel="noopener noreferrer"', not unsafe_blank, str(unsafe_blank[:3]))

    missing = []
    for t, a in tags:
        for attr in ("href", "src"):
            path = local_target(a.get(attr))
            if path and not os.path.exists(os.path.join(ROOT, path)):
                missing.append(path)
    check(page + ": all local links and assets exist", not missing, str(missing[:5]))

    third_party = [a.get("src") or a.get("href") for t, a in tags
                   if (t == "script" and urlparse(a.get("src", "")).netloc)
                   or (t == "link" and a.get("rel") == "stylesheet" and urlparse(a.get("href", "")).netloc)]
    check(page + ": no third-party scripts or stylesheets", not third_party, str(third_party))

    ids = [a["id"] for t, a in tags if "id" in a]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    check(page + ": no duplicate ids", not dupes, str(dupes))

# ── CSS ─────────────────────────────────────────────────────
print("\n── CSS")
css_files = sorted(f for f in os.listdir(ROOT) if f.endswith(".css"))
for name in css_files:
    css = read(name)
    check(name + ": no @import", "@import" not in css)
    check(name + ": no external url()", not re.search(r"url\(\s*['\"]?https?:", css))
    check(name + ": braces balanced", css.count("{") == css.count("}"))

shared = read("shared.css")


def theme_tokens(selector_pattern):
    block = re.search(selector_pattern + r"\s*\{(.*?)\n\}", shared, re.S).group(1)
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", block))


def luminance(hex_colour):
    c = [int(hex_colour[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


for theme, pattern in (("light", r':root, :root\[data-theme="light"\]'), ("dark", r':root\[data-theme="dark"\]')):
    tok = theme_tokens(pattern)
    for text in ("text", "text-2", "text-3", "text-4"):
        for surface in ("bg", "surface", "surface2"):
            ratio = contrast(tok[text], tok[surface])
            check("%s: --%s on --%s ≥ 4.5:1" % (theme, text, surface), ratio >= 4.5, "%.2f:1" % ratio)

# ── JAVASCRIPT ──────────────────────────────────────────────
print("\n── JavaScript")
js_files = sorted(f for f in os.listdir(ROOT) if f.endswith(".js"))
for name in js_files:
    js = read(name)
    check(name + ": no eval / new Function / document.write",
          not re.search(r"\beval\(|new Function\(|document\.write\(", js))
for name in js_files + css_files + PAGES:
    check(name + ": no stray control characters", not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", read(name)))
check("dashboard.js renders feed data through esc()/safeUrl()",
      "esc(" in read("dashboard.js") and "safeUrl(" in read("dashboard.js"))

# ── DATA ────────────────────────────────────────────────────
print("\n── Data")


GENERATED = {"data/news.json", "data/tool_updates.json", "data/cve.json", "data/briefing.json"}


def load_json(path):
    # Feed data is generated at deploy time and isn't in the repo; skip it when absent
    # (e.g. on pull requests). Run scripts/fetch_cyber_news.py first to check it locally.
    if path in GENERATED and not os.path.exists(os.path.join(ROOT, path)):
        print("  – " + path + ": not generated here, skipped")
        return None
    try:
        return json.loads(read(path))
    except (OSError, ValueError) as e:
        check(path + ": valid JSON", False, str(e))
        return None


def check_items(path, items, date_keys, text_keys, link_key="link"):
    bad_dates = [i.get(k) for i in items for k in date_keys if i.get(k) and not ISO.match(i[k])]
    check(path + ": dates are ISO 8601 UTC", not bad_dates, str(bad_dates[:3]))
    bad_links = [i.get(link_key) for i in items if i.get(link_key) and not i[link_key].startswith("https://")]
    check(path + ": links are https", not bad_links, str(bad_links[:3]))
    markup = [i.get(k) for i in items for k in text_keys if re.search(r"<[a-zA-Z/!]", i.get(k) or "")]
    check(path + ": text fields contain no markup", not markup, str(markup[:2]))


news = load_json("data/news.json")
if news:
    items = news.get("items", [])
    check("data/news.json: has articles", len(items) > 0)
    check("data/news.json: last_updated is ISO", bool(ISO.match(news.get("last_updated", ""))))
    check_items("data/news.json", items, ["date"], ["title", "summary", "source"])
    coverage = [c for i in items for c in i.get("coverage", [])]
    check_items("data/news.json (coverage)", coverage, ["date"], ["title", "source"])
    invented = [i["title"] for i in items if i.get("threat") and not i.get("official")]
    check("data/news.json: only official items carry a threat level", not invented, str(invented[:2]))

tools = load_json("data/tool_updates.json")
if tools:
    check_items("data/tool_updates.json", tools.get("items", []), ["date"], ["title", "summary"])

cve = load_json("data/cve.json")
if cve:
    items = cve.get("items", [])
    check("data/cve.json: has CVEs", len(items) > 0)
    check("data/cve.json: every CVE has an id", all(re.match(r"^CVE-\d{4}-\d+$", i.get("id", "")) for i in items))
    check("data/cve.json: no invented severity", not any("severity" in i for i in items))
    check_items("data/cve.json", items, [], ["description", "name"])

report = load_json("data/annual_report.json")
if report:
    check("data/annual_report.json: required fields",
          all(report.get(k) for k in ("title", "fy", "fy_slug", "url", "reports_per_year", "report_interval", "stats", "crime_types")))
    check("data/annual_report.json: fy_slug is YYYY-YYYY", bool(re.match(r"^\d{4}-\d{4}$", report.get("fy_slug", ""))))
    check("data/annual_report.json: url is https on cyber.gov.au",
          urlparse(report.get("url", "")).scheme == "https" and urlparse(report.get("url", "")).hostname == "www.cyber.gov.au")
    check("data/annual_report.json: reports_per_year is a positive number",
          isinstance(report.get("reports_per_year"), (int, float)) and report["reports_per_year"] > 0)
    check("data/annual_report.json: every stat has value + label",
          all(s.get("value") and s.get("label") for s in report.get("stats", [])))
    pcts = [i.get("pct") for g in report.get("crime_types", []) for i in g.get("items", [])]
    check("data/annual_report.json: crime-type percentages are 0–100",
          bool(pcts) and all(isinstance(p, (int, float)) and 0 <= p <= 100 for p in pcts))

briefing = load_json("data/briefing.json")
if briefing:
    featured = (briefing.get("items") or {}).get("featured")
    if featured:
        check_items("data/briefing.json", [featured], ["date"], ["title", "summary"])

# ── RESULT ──────────────────────────────────────────────────
print("\n" + "=" * 50)
if failures:
    print("✗ %d check(s) failed" % len(failures))
    sys.exit(1)
print("✓ All checks passed")
