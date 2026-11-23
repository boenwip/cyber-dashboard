"""Probe the live feeds the pipeline uses, to check two hypotheses:
1. Google News items from The Guardian / The Register are rejected by is_approved_gnews().
2. The ACSC direct feeds and the Google News fallback produce no official items.
Usage: python -I probe_feeds.py <repo>/scripts
"""
import sys
from collections import Counter

sys.path.insert(0, sys.argv[1])
import fetch_cyber_news as f  # noqa: E402

def probe(feed, timeout=20):
    parsed = f.fetch_feed(feed["url"], timeout)
    entries = parsed.entries
    kept = [f.build_article(feed, e) for e in entries]
    kept = [a for a in kept if a]
    print(f"\n== {feed['name']}: {len(entries)} entries, {len(kept)} kept")
    if feed["url"].startswith("https://news.google.com"):
        approved = Counter(f.is_approved_gnews(f.strip_html(e.get("title", ""))) for e in entries)
        print("   is_approved_gnews:", dict(approved))
        for e in entries[:4]:
            t = f.strip_html(e.get("title", ""))
            src = (e.get("source") or {}).get("href", "")
            print(f"   - approved={f.is_approved_gnews(t)!s:5} source.href={src!r:32} {t[-70:]}")
    for a in kept[:3]:
        print(f"   kept: {a['date']} {a['title'][:80]}")

for name in ("ACSC Alerts", "ACSC Advisories", "Google News — Guardian AU Cyber",
             "Google News — The Register AU", "Google News — ScamWatch", "Troy Hunt Blog"):
    probe(next(x for x in f.NEWS_FEEDS if x["name"] == name))
probe(f.ACSC_FALLBACK_FEED)
