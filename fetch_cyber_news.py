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
        "name": "Risky Biz News",
        "url": "https://risky.biz/feeds/risky-business-news/"
    },
    {
        "name": "The Educator Australia",
        "url": "https://theeducatoronline.com/k12/rss"
    },
    {
        "name": "Google News — ASQA / RTO",
        "url": "https://news.google.com/rss/search?q=ASQA+RTO+Australia&hl=en-AU&gl=AU&ceid=AU:en"
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
# Assigned in order — first match wins
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
# HELPER: Parse a date from an RSS entry
# RSS feeds use inconsistent date formats, so we try
# a few approaches and fall back gracefully
# -------------------------------------------------------

def parse_date(entry):
    # feedparser gives us a 'published_parsed' tuple if it can parse the date
    # It's a time.struct_time object we can convert to a datetime
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            dt = datetime.datetime(*entry.published_parsed[:6])
            return dt.strftime("%Y-%m-%d %H:%M")
        except Exception:
            pass

    # Fall back to the raw published string if parsing failed
    if hasattr(entry, "published") and entry.published:
        return entry.published

    # If no date at all, use now
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M")


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
# HELPER: Get topic tags
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
    return "Advisory"   # default if nothing matches


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
# HELPER: Deduplicate articles by title similarity
# Compares lowercase, stripped titles — if two titles
# are identical or one contains the other, drop the dupe
# -------------------------------------------------------

def deduplicate(articles):
    seen_titles = []
    unique = []

    for article in articles:
        title = article["title"].lower().strip()

        # Check if this title is too similar to one we've already kept
        is_dupe = False
        for seen in seen_titles:
            # Exact match
            if title == seen:
                is_dupe = True
                break
            # One title contains the other (handles slight variations)
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
            title   = entry.get("title", "")
            summary = entry.get("summary", "")
            link    = entry.get("link", "")
            date    = parse_date(entry)

            combined = (title + " " + summary).lower()

            topic_tags  = get_topic_tags(combined)
            threat      = get_threat_level(combined)
            audiences   = get_audience_tags(combined)

            # Only include if it matched at least one topic tag
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
                })

    # Remove duplicates before sorting
    all_articles = deduplicate(all_articles)

    # Sort by date — most recent first
    # Articles without a parseable date will sort to the end
    all_articles.sort(
        key=lambda a: a["date"],
        reverse=True
    )

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

    # Sort tool updates by date too
    all_updates.sort(key=lambda a: a["date"], reverse=True)

    return all_updates


# -------------------------------------------------------
# SAVE to JSON
# -------------------------------------------------------

def save_json(data, filename):
    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
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

    print("\n--- Tag breakdown (Zone 1) ---")
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
        count = threat_counts.get(level, 0)
        print(f"  {level}: {count} articles")

    print("\n--- Audience breakdown ---")
    audience_counts = {}
    for article in news:
        for a in article["audience"]:
            audience_counts[a] = audience_counts.get(a, 0) + 1

    for audience, count in audience_counts.items():
        print(f"  {audience}: {count} articles")

    print("\nDone!")