# fetch_cyber_news.py
# -------------------------------------------------------
# Fetches news from RSS feeds, tags each article,
# and saves two separate JSON files:
#   - news.json         (Zone 1: Cyber & Sector news)
#   - tool_updates.json (Zone 2: Tool product updates)
#
# HOW TO RUN:
#   1. Install required library (only once):
#      pip install feedparser
#   2. Run:
#      python fetch_cyber_news.py
# -------------------------------------------------------

import feedparser
import json
import datetime
import urllib.request
import urllib.error
import socket


# -------------------------------------------------------
# ZONE 1: NEWS FEEDS
# -------------------------------------------------------

NEWS_FEEDS = [
    {
        "name": "ACSC Alerts",
        "url": "https://www.cyber.gov.au/rss/alerts"
    },
    {
        "name": "ACSC Advisories",
        "url": "https://www.cyber.gov.au/rss/advisories"
    },
    {
        "name": "Australian Cyber Security Magazine",
        "url": "https://australiancybersecuritymagazine.com.au/feed"
    },
    {
        "name": "Security Brief Australia",
        "url": "https://securitybrief.com.au/feed"
    },
    {
        "name": "iTnews",
        "url": "https://www.itnews.com.au/RSS/rss.ashx"
    },
    {
        "name": "ABC News Business",
        "url": "https://www.abc.net.au/news/feed/104217374/rss.xml"
    },
    {
        "name": "Google News — ASQA / RTO",
        "url": "https://news.google.com/rss/search?q=ASQA+RTO+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — VET Workforce",
        "url": "https://news.google.com/rss/search?q=VET+workforce+skills+training+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — AU Cyber",
        "url": "https://news.google.com/rss/search?q=cyber+breach+australia+banking+energy&hl=en-AU&gl=AU&ceid=AU:en"
    },
]


# -------------------------------------------------------
# ZONE 2: TOOL UPDATE FEEDS
# -------------------------------------------------------

TOOL_FEEDS = [
    {
        "name": "Microsoft 365 Roadmap",
        "tool": "Microsoft",
        "url": "https://www.microsoft.com/microsoft-365/RoadmapFeatureRSS"
    },
    {
        "name": "Google Workspace Updates",
        "tool": "Google",
        "url": "https://workspace.google.com/blog/feed"
    },
    {
        "name": "Asana Product News",
        "tool": "Asana",
        "url": "https://blog.asana.com/category/product/feed"
    },
    {
        "name": "OpenAI Blog",
        "tool": "AI Tools",
        "url": "https://openai.com/blog/rss"
    },
    {
        "name": "Canva Newsroom",
        "tool": "AI Tools",
        "url": "https://www.canva.com/newsroom/feed"
    },
]


# -------------------------------------------------------
# TAGGING RULES — TOPIC
# An article can match multiple topic tags
# -------------------------------------------------------

TOPIC_TAG_RULES = [
    {
        "tag": "AU Cyber",
        "keywords": [
            "australia", "australian", "acsc", "asd", "cyber.gov",
            "auscert", "critical infrastructure", "ransomware",
            "phishing", "data breach", "vulnerability", "cve",
            "malware", "threat actor", "exploit", "patch",
            "incident", "compromise", "advisory", "alert",
        ]
    },
    {
        "tag": "RTO / VET",
        "keywords": [
            "rto", "vet sector", "vocational", "asqa", "tafe",
            "training provider", "registered training",
            "apprentice", "traineeship", "qualification",
            "standards for rtos", "national training",
            "vet quality", "training package", "skills australia",
            "department of employment", "jobs and skills",
            "2025 standards", "training organisation",
        ]
    },
    {
        "tag": "Education",
        "keywords": [
            "education", "school", "university", "student",
            "teacher", "learning", "campus", "higher education",
            "k-12", "edtech", "classroom", "curriculum",
        ]
    },
]


# -------------------------------------------------------
# TAGGING RULES — THREAT LEVEL
# First match wins (most severe first)
# -------------------------------------------------------

THREAT_LEVEL_RULES = [
    {
        "level": "Critical",
        "keywords": [
            "critical", "high alert", "active exploitation",
            "actively exploited", "patch immediately", "zero-day",
            "zero day", "emergency", "ransomware attack",
            "data breach confirmed", "systems compromised",
        ]
    },
    {
        "level": "High",
        "keywords": [
            "high", "urgent", "severe", "significant vulnerability",
            "strongly recommended", "targeted attack", "nation state",
            "state-sponsored", "supply chain attack",
        ]
    },
    {
        "level": "Medium",
        "keywords": [
            "medium", "moderate", "warning", "risk", "threat",
            "vulnerability", "exposure", "weaknesses", "flaw",
        ]
    },
    {
        "level": "Advisory",
        "keywords": [
            "advisory", "guidance", "awareness", "recommended practice",
            "best practice", "reminder", "update", "information",
        ]
    },
]


# -------------------------------------------------------
# TAGGING RULES — AUDIENCE
# An article can match multiple audience tags
# -------------------------------------------------------

AUDIENCE_RULES = [
    {
        "audience": "Critical Infra",
        "keywords": [
            "critical infrastructure", "energy", "power grid", "water",
            "hospital", "health system", "transport", "telecommunications",
            "telco", "defence", "government network", "operational technology",
            "ot security", "scada", "industrial control",
        ]
    },
    {
        "audience": "Enterprise",
        "keywords": [
            "enterprise", "corporate", "organisation", "corporation",
            "asx", "listed company", "financial services", "bank",
            "insurance", "qantas", "optus", "medibank", "telstra",
            "supply chain", "third party", "managed service",
        ]
    },
    {
        "audience": "SMB",
        "keywords": [
            "small business", "medium business", "smb", "sme",
            "rto", "tafe", "training provider", "school", "charity",
            "not-for-profit", "local government", "council",
        ]
    },
    {
        "audience": "Consumer",
        "keywords": [
            "consumer", "personal", "individual", "customer data",
            "scam", "fraud", "identity theft", "credit card",
            "bank account", "mygovid", "mygov", "medicare",
            "tax office", "ato", "social media", "phishing email",
        ]
    },
]


# -------------------------------------------------------
# TAGGING RULES — RELEVANCE
# How directly applicable is this to your RTO context?
# First match wins (most specific to least specific)
# Falls back to "Global" if nothing matches
# -------------------------------------------------------

RELEVANCE_RULES = [
    {
        "relevance": "Direct",
        "keywords": [
            "rto", "asqa", "tafe", "registered training",
            "training provider", "vet sector", "vocational",
            "training organisation", "2025 standards",
            "training package", "national training",
            "apprentice", "traineeship",
        ]
    },
    {
        "relevance": "Sector",
        "keywords": [
            "education", "school", "university", "campus",
            "student data", "learning management", "edtech",
            "higher education", "skills australia",
        ]
    },
    {
        "relevance": "AU General",
        "keywords": [
            "australia", "australian", "acsc", "asd",
            "auscert", "medibank", "optus", "telstra", "qantas",
            "mygovid", "mygov", "ato", "medicare",
            "critical infrastructure",
        ]
    },
]


# -------------------------------------------------------
# HELPER: Parse a date from an RSS entry
# RSS feeds use inconsistent date formats, so we try
# a few approaches and fall back gracefully
# Date formatted as DD-MM-YYYY HH:MM AM/PM (AEST)
# -------------------------------------------------------

def parse_date(entry):
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            dt = datetime.datetime(*entry.published_parsed[:6])
            return dt.strftime("%d-%m-%Y %I:%M %p")
        except Exception:
            pass

    if hasattr(entry, "published") and entry.published:
        return entry.published

    return datetime.datetime.now().strftime("%d-%m-%Y %I:%M %p")


# -------------------------------------------------------
# HELPER: Fetch a feed safely with timeout + User-Agent
# -------------------------------------------------------

def fetch_feed(url):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read()
        return feedparser.parse(data)
    except (urllib.error.URLError, socket.timeout) as e:
        print(f"    Skipping (could not reach): {e}")
        return feedparser.FeedParserDict({"entries": []})
    except Exception as e:
        print(f"    Skipping (unexpected error): {e}")
        return feedparser.FeedParserDict({"entries": []})


# -------------------------------------------------------
# HELPER: Get topic tags (can match multiple)
# -------------------------------------------------------

def get_topic_tags(combined):
    tags = []
    for rule in TOPIC_TAG_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in combined:
                tags.append(rule["tag"])
                break
    return tags


# -------------------------------------------------------
# HELPER: Get threat level (first match wins)
# -------------------------------------------------------

def get_threat_level(combined):
    for rule in THREAT_LEVEL_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in combined:
                return rule["level"]
    return "Advisory"


# -------------------------------------------------------
# HELPER: Get audience tags (can match multiple)
# -------------------------------------------------------

def get_audience_tags(combined):
    audiences = []
    for rule in AUDIENCE_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in combined:
                audiences.append(rule["audience"])
                break
    return audiences


# -------------------------------------------------------
# HELPER: Get relevance level (first match wins)
# Falls back to "Global" if nothing matches
# -------------------------------------------------------

def get_relevance(combined):
    for rule in RELEVANCE_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in combined:
                return rule["relevance"]
    return "Global"


# -------------------------------------------------------
# HELPER: Filter out articles older than N days
# Keeps your feed current and removes stale Google News results
# -------------------------------------------------------

def filter_old_articles(articles, days=180):
    import email.utils
    cutoff = datetime.datetime.now() - datetime.timedelta(days=days)
    filtered = []
    for article in articles:
        kept = False
        date_str = article.get("date", "")

        # Try our formatted DD-MM-YYYY HH:MM AM/PM
        try:
            dt = datetime.datetime.strptime(date_str, "%d-%m-%Y %I:%M %p")
            if dt >= cutoff:
                filtered.append(article)
            kept = True
        except ValueError:
            pass

        if not kept:
            # Try raw RSS date string e.g. "Mon, 21 Apr 2025 08:00:00 +0000"
            try:
                parsed = email.utils.parsedate(date_str)
                if parsed:
                    dt = datetime.datetime(*parsed[:6])
                    if dt >= cutoff:
                        filtered.append(article)
                    kept = True
            except Exception:
                pass

        if not kept:
            # Can't parse date at all — keep it
            filtered.append(article)

    return filtered


# -------------------------------------------------------
# HELPER: Deduplicate articles by title similarity
# -------------------------------------------------------

def deduplicate(articles):
    seen_titles = []
    unique = []

    for article in articles:
        title = article["title"].lower().strip()
        is_dupe = False

        for seen in seen_titles:
            if title == seen:
                is_dupe = True
                break
            if len(title) > 20 and (title in seen or seen in title):
                is_dupe = True
                break

        if not is_dupe:
            seen_titles.append(title)
            unique.append(article)

    return unique


# -------------------------------------------------------
# FETCH ZONE 1: News articles
# -------------------------------------------------------

def fetch_news():
    all_articles = []

    for feed in NEWS_FEEDS:
        print(f"  Fetching: {feed['name']}...")
        parsed = fetch_feed(feed["url"])

        for entry in parsed.entries:
            title    = entry.get("title", "")
            summary  = entry.get("summary", "")
            link     = entry.get("link", "")
            date     = parse_date(entry)

            combined = (title + " " + summary).lower()

            topic_tags = get_topic_tags(combined)
            threat     = get_threat_level(combined)
            audiences  = get_audience_tags(combined)
            relevance  = get_relevance(combined)

            # Skip sponsored content
            if title.lower().startswith("sponsored"):
                continue

            if topic_tags:
                all_articles.append({
                    "source":    feed["name"],
                    "title":     title,
                    "link":      link,
                    "summary":   summary[:300],
                    "date":      date,
                    "tags":      topic_tags,
                    "threat":    threat,
                    "audience":  audiences,
                    "relevance": relevance,
                })

    all_articles = deduplicate(all_articles)
    all_articles = filter_old_articles(all_articles, days=90)
    all_articles.sort(key=lambda a: a["date"], reverse=True)

    return all_articles


# -------------------------------------------------------
# FETCH ZONE 2: Tool updates
# -------------------------------------------------------

def fetch_tool_updates():
    all_updates = []

    for feed in TOOL_FEEDS:
        print(f"  Fetching: {feed['name']}...")
        parsed = fetch_feed(feed["url"])

        for entry in parsed.entries[:5]:
            title   = entry.get("title", "")
            link    = entry.get("link", "")
            summary = entry.get("summary", "")
            date    = parse_date(entry)

            all_updates.append({
                "source":  feed["name"],
                "tool":    feed["tool"],
                "title":   title,
                "link":    link,
                "summary": summary[:200],
                "date":    date,
            })

    all_updates.sort(key=lambda a: a["date"], reverse=True)

    return all_updates


# -------------------------------------------------------
# SAVE to JSON
# -------------------------------------------------------

def save_json(data, filename):
    output = {
        "last_updated": datetime.datetime.now().strftime("%d-%m-%Y %I:%M %p"),
        "count":        len(data),
        "items":        data,
    }
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)

    print(f"  Saved {len(data)} items to {filename}")


# -------------------------------------------------------
# RUN
# -------------------------------------------------------

if __name__ == "__main__":
    print("\n=== Fetching news feeds (Zone 1) ===")
    news = fetch_news()
    save_json(news, "news.json")

    print("\n=== Fetching tool updates (Zone 2) ===")
    tools = fetch_tool_updates()
    save_json(tools, "tool_updates.json")

    print("\n--- Tag breakdown ---")
    tag_counts = {}
    for article in news:
        for tag in article["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    for tag, count in tag_counts.items():
        print(f"  {tag}: {count} articles")

    print("\n--- Threat level breakdown ---")
    threat_counts = {}
    for article in news:
        t = article["threat"]
        threat_counts[t] = threat_counts.get(t, 0) + 1
    for level in ["Critical", "High", "Medium", "Advisory"]:
        print(f"  {level}: {threat_counts.get(level, 0)} articles")

    print("\n--- Audience breakdown ---")
    audience_counts = {}
    for article in news:
        for a in article["audience"]:
            audience_counts[a] = audience_counts.get(a, 0) + 1
    for audience, count in audience_counts.items():
        print(f"  {audience}: {count} articles")

    print("\n--- Relevance breakdown ---")
    relevance_counts = {}
    for article in news:
        r = article.get("relevance", "Global")
        relevance_counts[r] = relevance_counts.get(r, 0) + 1
    for level in ["Direct", "Sector", "AU General", "Global"]:
        print(f"  {level}: {relevance_counts.get(level, 0)} articles")

    print("\nDone!")