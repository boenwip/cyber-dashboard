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
        "name": "Risky Biz News",
        "url": "https://risky.biz/feeds/risky-business-news/"
    },
    {
        "name": "Bleeping Computer",
        "url": "https://www.bleepingcomputer.com/feed/"
    },
    {
        "name": "The Hacker News",
        "url": "https://feeds.feedburner.com/TheHackersNews"
    },
    {
        "name": "The Educator Australia",
        "url": "https://theeducatoronline.com/k12/rss"
    },
    {
    "name": "Google News — ASQA / RTO",
    "url": "https://news.google.com/rss/search?q=ASQA+RTO+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    }
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
# TAGGING RULES FOR ZONE 1
# -------------------------------------------------------

TAG_RULES = [
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
# HELPER: Fetch a feed safely with timeout + User-Agent
# If the feed fails for any reason, returns empty entries
# rather than crashing the whole script
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
# HELPER: Tag a single article based on its text
# -------------------------------------------------------

def get_tags(title, summary):
    combined = (title + " " + summary).lower()
    tags = []

    for rule in TAG_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in combined:
                tags.append(rule["tag"])
                break

    return tags


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

            tags = get_tags(title, summary)

            if tags:
                all_articles.append({
                    "source":  feed["name"],
                    "title":   title,
                    "link":    link,
                    "summary": summary[:300],
                    "tags":    tags,
                })

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

            all_updates.append({
                "source":  feed["name"],
                "tool":    feed["tool"],
                "title":   title,
                "link":    link,
                "summary": summary[:200],
            })

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

    print("\nDone!")