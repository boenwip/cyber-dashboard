"""Regression tests for scripts/fetch_cyber_news.py. Run: python -m pytest tests"""
import os
import sys

import feedparser

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import fetch_cyber_news as f  # noqa: E402

ACSC = {"name": "ACSC Alerts", "url": "https://www.cyber.gov.au/rss/alerts", "official": True}
DIRECT = {"name": "Dark Reading", "url": "https://www.darkreading.com/rss.xml"}


def entry(title, summary="", link="https://example.com/a", published="Thu, 24 Sep 2026 10:01:59 +1000"):
    return feedparser.FeedParserDict({"title": title, "summary": summary, "link": link, "published": published})


# ── Blocklist ──────────────────────────────────────────────

def test_blocklist_matches_hostname_not_substring():
    # "news.com.au" is blocked; "itnews.com.au" must not be.
    assert not f.is_blocked("https://www.itnews.com.au/news/ryuk-ransomware-raider-sentenced")
    assert f.is_blocked("https://www.news.com.au/technology/story")
    assert f.is_blocked("https://news.com.au/x")
    assert not f.is_blocked("https://example.com/?ref=news.com.au")


# ── Official ACSC items ────────────────────────────────────

def test_acsc_alert_kept_without_keywords_and_severity_from_prefix():
    a = f.build_article(ACSC, entry("HIGH ALERT: Risks of AI misalignment to Australian organisations"))
    assert a is not None
    assert a["threat"] == "High"
    assert a["title"] == "Risks of AI misalignment to Australian organisations"
    assert a["official"] is True
    assert "AU Cyber" in a["tags"]


def test_acsc_critical_prefix():
    a = f.build_article(ACSC, entry("CRITICAL ALERT: Critical vulnerabilities in Citrix NetScaler"))
    assert a["threat"] == "Critical"


def test_acsc_advisory_without_prefix():
    a = f.build_article(ACSC, entry("Digital camouflage: crypters make malware undetectable"))
    assert a["threat"] == "Advisory"


def test_non_official_articles_get_no_threat_level():
    a = f.build_article(DIRECT, entry("SpiderSilk Hunts External Threats", "Scans for zero-day vulnerabilities and critical risk"))
    assert a is not None
    assert "threat" not in a


# ── Keyword matching ───────────────────────────────────────

def test_keywords_match_whole_words_only():
    assert "Compliance" not in f.get_topic_tags("record tourism numbers and criticism of journalism")
    assert "Scams" not in f.get_topic_tags("senator discusses scampi exports")
    assert "Compliance" not in f.get_topic_tags("the regulator of tourism")
    assert "Compliance" in f.get_topic_tags("aligning with the ism and essential eight")
    assert "Scams" in f.get_topic_tags("text scams are rising")


def test_off_topic_article_dropped():
    assert f.build_article(DIRECT, entry("Kodak Alaris launches N2000 series scanners for offices")) is None


def test_listing_pages_dropped():
    gnews = {"name": "Google News — ScamWatch", "url": "https://news.google.com/rss/search?q=site:scamwatch.gov.au"}
    assert f.build_article(gnews, entry("Browse news and alerts - page 2 - Scamwatch", "scam")) is None


# ── Sanitising ─────────────────────────────────────────────

def test_strip_html_outputs_plain_text_decoded_once():
    assert f.strip_html("<p>Tom &amp; Jerry</p>") == "Tom & Jerry"
    # Double-encoded input stays literal text rather than becoming markup.
    assert f.strip_html("&amp;lt;img&amp;gt;") == "&lt;img&gt;"
    assert f.strip_html("It&apos;s &#8217;fine&#8217;") == "It's ’fine’"


def test_http_links_upgraded():
    assert f.https_link("http://chromereleases.googleblog.com/x") == "https://chromereleases.googleblog.com/x"
    assert f.https_link("https://a.example/") == "https://a.example/"


def test_truncate_breaks_on_word():
    assert f.truncate("one two three four", 9) == "one two…"
    assert f.truncate("short", 10) == "short"


# ── Dates ──────────────────────────────────────────────────

def test_dates_are_iso_utc():
    a = f.build_article(ACSC, entry("HIGH ALERT: x", published="Thu, 24 Sep 2026 10:01:59 +1000"))
    assert a["date"] == "2026-09-24T00:01:59Z"


def test_undated_entries_have_empty_date_and_sort_last():
    e = feedparser.FeedParserDict({"title": "t"})
    assert f.parse_date(e) == ""
    items = [{"date": ""}, {"date": "2026-09-24T00:00:00Z"}, {"date": "2026-09-25T00:00:00Z"}]
    assert [i["date"] for i in f.sort_newest_first(items)] == ["2026-09-25T00:00:00Z", "2026-09-24T00:00:00Z", ""]


# ── CVEs ───────────────────────────────────────────────────

def test_kev_item_has_no_invented_severity():
    item = f.kev_item({
        "cveID": "CVE-2026-1", "vendorProject": "WSO2", "product": "API Manager",
        "shortDescription": "Path traversal.", "dateAdded": "2026-09-24",
        "dueDate": "2026-10-15", "knownRansomwareCampaignUse": "Known",
    })
    assert "severity" not in item and "score" not in item
    assert item["due_date"] == "2026-10-15"
    assert item["ransomware"] == "Known"
    assert item["name"] == "WSO2 API Manager"
