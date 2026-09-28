#!/usr/bin/env python3
"""
check_annual_report.py — has ASD published the next Annual Cyber Threat Report?

Reads the financial year of the report currently used (data/annual_report.json,
"fy_slug", e.g. "2024-2025"), works out the next one ("2025-2026") and looks for it:
  1. its expected URL (ASD has used .../annual-cyber-threat-report-YYYY-YYYY for past reports)
  2. a link to it on ASD's reports-and-statistics listing page (in case the URL pattern changes)
  3. if cyber.gov.au can't be reached (it times out from GitHub Actions), a Google News
     search of cyber.gov.au for the report's title

Prints the result. Exit code: 0 = not published yet, 10 = published (URL printed), 1 = error.
Run daily by .github/workflows/annual_report_watch.yml, which opens a GitHub issue on 10.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LISTING = "https://www.cyber.gov.au/about-us/view-all-content/reports-and-statistics"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"


def next_slug(fy_slug):
    start, end = (int(x) for x in fy_slug.split("-"))
    return "%d-%d" % (start + 1, end + 1)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.status, resp.read().decode("utf-8", "replace")


def search_google_news(slug):
    """Link to the report if Google News has indexed it on cyber.gov.au, else None."""
    start, end = slug.split("-")
    short = "%s-%s" % (start, end[2:])  # 2025-26 (ASD titles use "2025–26")
    query = 'site:cyber.gov.au "annual cyber threat report" %s' % start
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": query, "hl": "en-AU", "gl": "AU", "ceid": "AU:en"})
    # Google News sometimes answers GitHub's runners with a 503 (rate limiting);
    # it usually clears within a minute.
    for wait in (20, 60, None):
        try:
            _, xml = fetch(url)
            break
        except urllib.error.HTTPError as e:
            if e.code != 503 or wait is None:
                raise
            print("Google News returned 503 — retrying in %ds" % wait)
            time.sleep(wait)
    for item in ET.fromstring(xml).iter("item"):
        title = (item.findtext("title") or "").replace("–", "-").lower()
        if "annual cyber threat report" in title and (short in title or slug in title):
            return item.findtext("link")
    return None


def main():
    with open(os.path.join(ROOT, "data", "annual_report.json"), encoding="utf-8") as f:
        current = json.load(f)["fy_slug"]
    slug = next_slug(current)
    expected = LISTING + "/annual-cyber-threat-report-" + slug
    print("Current report: %s — looking for %s" % (current, slug))

    try:
        status, _ = fetch(expected)
        if status == 200:
            print("PUBLISHED: " + expected)
            return 10
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print("Unexpected HTTP %d for %s" % (e.code, expected))
    except (urllib.error.URLError, TimeoutError) as e:
        print("Could not reach %s: %s" % (expected, e))
        return fallback(slug)

    try:
        _, page = fetch(LISTING)
    except (urllib.error.URLError, TimeoutError) as e:
        print("Could not reach listing page: %s" % e)
        return fallback(slug)
    m = re.search(r'href="([^"]*annual-cyber-threat-report-%s[^"]*)"' % re.escape(slug), page)
    if m:
        href = m.group(1)
        print("PUBLISHED: " + (href if href.startswith("http") else "https://www.cyber.gov.au" + href))
        return 10

    print("Not published yet.")
    return 0


def fallback(slug):
    print("cyber.gov.au unreachable — searching Google News instead")
    try:
        link = search_google_news(slug)
    except (urllib.error.URLError, TimeoutError, ET.ParseError) as e:
        print("Google News search failed too: %s" % e)
        return 1
    if link:
        print("PUBLISHED: " + link)
        return 10
    print("Not published yet (per Google News).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
