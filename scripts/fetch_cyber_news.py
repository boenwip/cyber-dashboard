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
# SOURCE BLOCKLIST
# Articles from these domains are excluded regardless of feed
# Prioritises factual, credible sources only
# -------------------------------------------------------

BLOCKED_DOMAINS = [
    # Murdoch / News Corp Australia
    "theaustralian.com.au",
    "heraldsun.com.au",
    "dailytelegraph.com.au",
    "couriermail.com.au",
    "adelaidenow.com.au",
    "perthnow.com.au",
    "townsvillebulletin.com.au",
    "cairnspost.com.au",
    "goldcoastbulletin.com.au",
    "skynews.com.au",
    "foxnews.com",
    "nypost.com",
    # Nine Entertainment / tabloid
    "9news.com.au",
    "news.com.au",
    "dailymail.co.uk",
    # Seven West Media
    "7news.com.au",
    "7news.com",
    "thewest.com.au",
    # Low quality / clickbait
    "buzzfeed.com",
    "ladbible.com",
    "unilad.com",
    "viral.com",
    "loyaltylobby.com",
    "corbado.com",
    "oz-arab-media.com",
    "ozarabmedia.com",
    "vocal.media",
    "medium.com",
    "glam-adelaide.com.au",
    "glamadelaide.com.au",
]


# Keywords that indicate irrelevant celebrity/tabloid content
BLOCKED_TITLE_KEYWORDS = [
    "nude photo", "naked", "sex tape", "celebrity hack", "snapchat leak",
    "onlyfans", "nudes leaked", "intimate images", "revenge porn",
    "bachelor", "bachelorette", "reality tv", "kardashian", "taylor swift",
]

def is_blocked(link, title=""):
    """Return True if the article should be excluded based on source domain or title keywords."""
    if not link:
        return False
    link_lower = link.lower()
    for domain in BLOCKED_DOMAINS:
        if domain in link_lower:
            return True
    # Block irrelevant title content regardless of source
    title_lower = title.lower()
    for kw in BLOCKED_TITLE_KEYWORDS:
        if kw in title_lower:
            return True
    return False


# -------------------------------------------------------
# ZONE 1: NEWS FEEDS
# -------------------------------------------------------

# -------------------------------------------------------
# APPROVED DOMAINS — allowlist for Google News proxy results
# Articles via news.google.com links are only accepted if
# their title suffix or source name maps to one of these.
# Direct RSS feeds (non-Google-News) are always trusted.
# -------------------------------------------------------

APPROVED_DOMAINS = {
    # Government / authoritative
    "scamwatch.gov.au", "cyber.gov.au", "asd.gov.au", "cisa.gov",
    "asqa.gov.au", "employment.gov.au", "education.gov.au",
    # Specialist AU cyber / tech press
    "cyberdaily.au", "australiancybersecuritymagazine.com.au",
    "securitybrief.com.au", "itnews.com.au", "zdnet.com",
    # Reputable AU general tech / news
    "abc.net.au", "theguardian.com", "smh.com.au", "afr.com",
    "theconversation.com", "crikey.com.au",
    # High-quality international cyber
    "krebsonsecurity.com", "troyhunt.com", "risky.biz",
    "darkreading.com", "404media.co", "theregister.com",
    "arstechnica.com", "wired.com", "bleepingcomputer.com",
    "threatpost.com", "securityweek.com", "infosecurity-magazine.com",
    # Education / VET sector
    "tafequensland.edu.au", "tafensw.edu.au", "iteca.edu.au",
    "ncver.edu.au", "skillsignited.gov.au",
}


NEWS_FEEDS = [
    # ── Government & Official ──
    {
        "name": "ACSC Alerts",
        "url": "https://www.cyber.gov.au/rss/alerts"
    },
    {
        "name": "ACSC Advisories",
        "url": "https://www.cyber.gov.au/rss/advisories"
    },
    {
        "name": "Google News — ScamWatch",
        "url": "https://news.google.com/rss/search?q=site:scamwatch.gov.au&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── Australian Cyber & Tech News (direct RSS — always trusted) ──
    {
        "name": "CyberDaily AU",
        "url": "https://www.cyberdaily.au/feed"
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
        "name": "ABC News — Technology",
        "url": "https://www.abc.net.au/news/science-environment/technology/rss.xml"
    },
    {
        "name": "Troy Hunt Blog",
        "url": "https://www.troyhunt.com/rss/"
    },
    {
        "name": "404 Media",
        "url": "https://www.404media.co/rss"
    },
    {
        "name": "Risky Business",
        "url": "https://risky.biz/feeds/risky-business/"
    },
    {
        "name": "Dark Reading",
        "url": "https://www.darkreading.com/rss.xml"
    },
    {
        "name": "Krebs on Security",
        "url": "https://krebsonsecurity.com/feed/"
    },
    # ── Google News: site-scoped queries only (vetted outlets) ──
    {
        "name": "Google News — Guardian AU Cyber",
        "url": "https://news.google.com/rss/search?q=site:theguardian.com+australia+cyber+security&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — ABC Tech",
        "url": "https://news.google.com/rss/search?q=site:abc.net.au+cyber+security+scam&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Bleeping Computer AU",
        "url": "https://news.google.com/rss/search?q=site:bleepingcomputer.com+australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — The Register AU",
        "url": "https://news.google.com/rss/search?q=site:theregister.com+australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — ASQA / RTO",
        "url": "https://news.google.com/rss/search?q=site:asqa.gov.au+OR+site:iteca.edu.au&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Privacy & Compliance AU",
        "url": "https://news.google.com/rss/search?q=site:abc.net.au+OR+site:theguardian.com+privacy+act+australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
]


# -------------------------------------------------------
# ZONE 2: TOOL UPDATE FEEDS
# -------------------------------------------------------

TOOL_FEEDS = [
    {
        "name": "Google Workspace Updates",
        "tool": "Google Workspace",
        "url": "https://workspace.google.com/blog/feed"
    },
    {
        "name": "Google Chrome Releases",
        "tool": "Google Chrome",
        "url": "https://chromereleases.googleblog.com/feeds/posts/default"
    },
    {
        "name": "Microsoft 365 Blog",
        "tool": "Microsoft 365",
        "url": "https://www.microsoft.com/en-us/microsoft-365/blog/feed/"
    },
    {
        "name": "Google News — Microsoft 365",
        "tool": "Microsoft 365",
        "url": "https://news.google.com/rss/search?q=Microsoft+365+Word+Excel+update+feature+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Asana Product News",
        "tool": "Asana",
        "url": "https://blog.asana.com/category/product/feed"
    },
    {
        "name": "Zoom Blog",
        "tool": "Zoom",
        "url": "https://blog.zoom.us/feed/"
    },
    {
        "name": "Google News — ChatGPT Updates",
        "tool": "AI Tools",
        "url": "https://news.google.com/rss/search?q=ChatGPT+OpenAI+update+new+feature+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Canva Updates",
        "tool": "Canva",
        "url": "https://news.google.com/rss/search?q=Canva+new+feature+update+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Claude Code Releases",
        "tool": "Claude",
        "url": "https://github.com/anthropics/claude-code/releases.atom"
    },
    {
        "name": "Google News — Claude Updates",
        "tool": "Claude",
        "url": "https://news.google.com/rss/search?q=Anthropic+Claude+new+model+update+release&hl=en-AU&gl=AU&ceid=AU:en"
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
            "cyber attack", "cyberwarfare", "cybercrime",
        ]
    },
    {
        "tag": "RTO / VET",
        "keywords": [
            # Core sector identifiers
            "rto", "vet sector", "vocational education", "vocational training",
            "asqa", "tafe", "tafe queensland", "tafe nsw", "tafe sa",
            "tafe victoria", "tafe wa", "tafe tasmania",
            "training provider", "registered training organisation",
            "independent training provider", "private training",
            # Qualifications and frameworks
            "apprentice", "traineeship", "qualification",
            "certificate iii", "certificate iv", "diploma",
            "advanced diploma", "aqf", "australian qualifications framework",
            "training package", "unit of competency", "competency based",
            "nationally recognised training", "nrt",
            # Regulatory and policy
            "standards for rtos", "2025 standards", "vet quality framework",
            "national training", "vet quality", "training organisation",
            "skills australia", "jobs and skills australia",
            "department of employment", "jobs and skills",
            "ncver", "national centre for vocational education",
            "iteca", "independent tertiary education",
            "training.gov.au", "skills insight",
            # Funding and policy
            "fee-free tafe", "fee free tafe", "vet funding",
            "skills reform", "skills minister", "skills shortage australia",
            "workforce development", "workforce skills",
            "apprenticeship incentive", "traineeship incentive",
            "vet student loans", "vsl",
            # International students in VET
            "cricos", "international student", "student visa",
            "esos", "education services overseas",
            # Sector issues
            "vet provider", "college registration", "rto registration",
            "rto compliance", "rto audit", "asqa audit",
            "rto cancellation", "rto deregistration",
            "fake qualification", "certificate fraud",
        ]
    },
    {
        "tag": "Education",
        "keywords": [
            "education", "school", "university", "student",
            "teacher", "learning", "campus", "higher education",
            "k-12", "classroom", "curriculum",
        ]
    },
    {
        "tag": "EdTech",
        "keywords": [
            "edtech", "learning management", "lms", "canvas", "moodle",
            "online learning", "e-learning", "elearning", "digital learning",
            "learning platform", "virtual classroom", "learning technology",
            "instructional technology", "digital education",
            "ai in education", "ai in training", "generative ai learning",
        ]
    },
    {
        "tag": "AI & Tools",
        "keywords": [
            "artificial intelligence", "generative ai", "chatgpt", "copilot",
            "large language model", "llm", "ai tools", "machine learning",
            "automation", "ai workforce", "ai skills", "ai adoption",
            "openai", "anthropic", "google gemini", "ai productivity",
            "ai regulation", "ai governance", "responsible ai",
        ]
    },
    {
        "tag": "Scams",
        "keywords": [
            "scam", "fraud", "scamwatch", "phishing", "impersonation",
            "deepfake scam", "romance scam", "investment scam",
            "ato scam", "mygov scam", "centrelink scam",
            "bank scam", "text scam", "email scam", "phone scam",
            "social engineering", "identity theft", "money mule",
        ]
    },
    {
        "tag": "Compliance",
        "keywords": [
            "privacy act", "privacy law", "oaic", "notifiable data breach",
            "ndb scheme", "gdpr", "compliance", "regulation",
            "regulatory", "legislation", "legal requirement",
            "data protection", "information security policy",
            "ism", "essential eight", "iso 27001", "soc 2",
            "audit", "data governance", "data sovereignty",
        ]
    },
    {
        "tag": "Good News",
        "keywords": [
            "arrested", "charged", "convicted", "sentenced",
            "disrupted", "taken down", "seized", "shut down",
            "law enforcement", "crackdown", "busted",
            "positive outcome", "security milestone",
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
            "apprentice", "traineeship", "iteca",
            "ncver", "training.gov.au", "skills insight",
            "fee-free tafe", "fee free tafe", "vet funding",
            "certificate iii", "certificate iv",
            "aqf", "cricos", "esos", "vet student loans",
            "rto compliance", "rto audit", "rto registration",
            "competency based", "nationally recognised training",
            "skills reform", "jobs and skills australia",
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
    """Parse feed entry date, always return as AEST formatted string DD-MM-YYYY HH:MM AM/PM"""
    AEST_OFFSET = datetime.timezone(datetime.timedelta(hours=10))

    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            # published_parsed is UTC — convert to AEST
            dt_utc = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
            dt_aest = dt_utc.astimezone(AEST_OFFSET)
            return dt_aest.strftime("%d-%m-%Y %I:%M %p")
        except Exception:
            pass

    if hasattr(entry, "published") and entry.published:
        try:
            # Try to parse the raw string and convert
            import email.utils
            parsed = email.utils.parsedate_to_datetime(entry.published)
            dt_aest = parsed.astimezone(AEST_OFFSET)
            return dt_aest.strftime("%d-%m-%Y %I:%M %p")
        except Exception:
            return entry.published

    return datetime.datetime.now(AEST_OFFSET).strftime("%d-%m-%Y %I:%M %p")


# -------------------------------------------------------
# HELPER: Strip HTML tags from a string (for Google News summaries)
# -------------------------------------------------------

def strip_html(text):
    """Remove HTML tags and decode common entities."""
    import re as _re
    text = _re.sub(r'<[^>]+>', '', text)
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>') \
               .replace('&nbsp;', ' ').replace('&#39;', "'").replace('&quot;', '"')
    return ' '.join(text.split()).strip()


# -------------------------------------------------------
# HELPER: Check if a Google News proxied article is from an approved domain
# Google News RSS titles often end with "- Publisher Name"
# -------------------------------------------------------

def is_approved_gnews(title, source_name):
    """For Google News proxy articles, approve only if publisher is in APPROVED_DOMAINS."""
    title_lower = title.lower()
    for domain in APPROVED_DOMAINS:
        # Check if domain name appears in the title suffix (e.g., "- abc.net.au")
        name_part = domain.split('.')[0]  # e.g., "abc", "krebsonsecurity"
        if name_part in title_lower.split()[-3:]:
            return True
        if domain in title_lower:
            return True
    # Also approve site:-scoped queries unconditionally — the query itself is the vetting
    if 'site:' in source_name.lower():
        return True
    return False


# -------------------------------------------------------
# HELPER: Fetch a feed safely with timeout + User-Agent
# -------------------------------------------------------

def fetch_feed(url):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "cyber-dashboard/1.0 (github.com/boenwip/cyber-dashboard)"}
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

def filter_old_articles(articles, days=30):
    import email.utils
    AEST = datetime.timezone(datetime.timedelta(hours=10))
    cutoff = datetime.datetime.now(AEST).replace(tzinfo=None) - datetime.timedelta(days=days)
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

def _parse_date_for_sort(date_str):
    """Parse formatted date string for sort key; returns datetime.min on any failure."""
    if not date_str:
        return datetime.datetime.min
    try:
        return datetime.datetime.strptime(date_str, '%d-%m-%Y %I:%M %p')
    except (ValueError, TypeError):
        return datetime.datetime.min


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

        is_gnews = feed["url"].startswith("https://news.google.com")

        for entry in parsed.entries:
            title    = entry.get("title", "")
            summary  = strip_html(entry.get("summary", ""))
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

            # Skip blocked sources
            if is_blocked(link, title):
                continue

            # For Google News proxy feeds, only accept approved publishers
            if is_gnews and not is_approved_gnews(title, feed["name"]):
                continue

            # Skip celebrity/entertainment content that slips through
            TITLE_BLOCKLIST = [
                "rebel wilson", "kardashian", "celebrity", "actor", "actress",
                "nude photo", "leaked photo", "snapchat hack celebrity",
                "reality tv", "influencer", "tiktok star", "youtube star",
            ]
            if any(term in title.lower() for term in TITLE_BLOCKLIST):
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
    all_articles = filter_old_articles(all_articles, days=14)
    all_articles.sort(key=lambda a: _parse_date_for_sort(a.get('date', '')), reverse=True)

    return all_articles


# -------------------------------------------------------
# FETCH ZONE 2: Tool updates
# -------------------------------------------------------

def fetch_tool_updates():
    all_updates = []
    seen_titles = set()

    for feed in TOOL_FEEDS:
        print(f"  Fetching: {feed['name']}...")
        parsed = fetch_feed(feed["url"])

        for entry in parsed.entries[:5]:
            title   = entry.get("title", "")
            title_key = title.lower().strip()
            if title_key in seen_titles:
                continue
            if title_key:
                seen_titles.add(title_key)
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

    all_updates.sort(key=lambda a: _parse_date_for_sort(a.get('date', '')), reverse=True)

    return all_updates


# -------------------------------------------------------
# SAVE to JSON
# -------------------------------------------------------

def fetch_cves():
    """Fetch 4 most recently added CVEs from CISA Known Exploited Vulnerabilities catalog.
    Primary: CISA KEV JSON (authoritative, no key required)
    Fallback: GitHub mirror of same data
    """
    AEST = datetime.timezone(datetime.timedelta(hours=10))
    cves = []

    sources = [
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        "https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json",
    ]

    for url in sources:
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'cyber-dashboard/1.0 (github.com/boenwip/cyber-dashboard)',
                'Accept': 'application/json'
            })
            resp = urllib.request.urlopen(req, timeout=10)
            data = json.loads(resp.read().decode())
            vulns = data.get('vulnerabilities', [])

            # Sort by dateAdded descending — most recently added first
            vulns.sort(key=lambda x: x.get('dateAdded', '0000-00-00'), reverse=True)

            for v in vulns[:10]:
                try:
                    cve_id = v.get('cveID', '')
                    name = v.get('vulnerabilityName', '')
                    desc = v.get('shortDescription', '') or name
                    vendor = v.get('vendorProject', '')
                    product = v.get('product', '')
                    date_added = v.get('dateAdded', '')
                    ransomware = v.get('knownRansomwareCampaignUse', 'Unknown')
                    link = 'https://nvd.nist.gov/vuln/detail/' + cve_id

                    # Build concise description
                    full_desc = desc[:200] if desc else name
                    if vendor and product:
                        full_desc = vendor + ' ' + product + ' — ' + full_desc

                    cves.append({
                        'id': cve_id,
                        'description': full_desc,
                        'score': None,
                        'severity': 'CRITICAL' if ransomware == 'Known' else 'HIGH',
                        'published': date_added,
                        'link': link,
                        'vendor': vendor,
                        'product': product,
                        'ransomware': ransomware,
                    })
                except Exception:
                    continue

            if cves:
                print(f"    Fetched {len(cves)} CVEs from CISA KEV")
                return cves

        except Exception as e:
            print(f"    KEV source failed ({url[:50]}): {e}")
            continue

    print("    All CVE sources failed")
    return []


def save_json(data, filename):
    if isinstance(data, list):
        count = len(data)
    elif isinstance(data, dict) and isinstance(data.get('items'), list):
        count = len(data['items'])
    else:
        count = 0
    output = {
        "last_updated": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10))).strftime("%d-%m-%Y %I:%M %p"),
        "count":        count,
        "items":        data,
    }
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  Saved {count} items to {filename}")


# -------------------------------------------------------
# RUN
# -------------------------------------------------------


def generate_briefing(articles):
    """Generate AI daily briefing using Anthropic API. Requires ANTHROPIC_API_KEY env var."""
    import os, json, urllib.request, urllib.error, datetime

    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        print("    No ANTHROPIC_API_KEY — skipping briefing generation")
        return None

    AEST = datetime.timezone(datetime.timedelta(hours=10))
    today = datetime.datetime.now(AEST).strftime('%d %B %Y')

    # Get most recent articles, deduplicated by topic cluster
    # articles already sorted chronologically by fetch_news() — preserve that order
    recent = [a for a in articles if a.get('date')]

    # Simple dedup — skip articles whose title is 80%+ similar to one already included
    seen_words = []
    deduped = []
    for a in recent[:40]:
        words = set((a.get('title') or '').lower().split())
        if not words: continue
        is_dup = any(len(words & s) / max(len(words), len(s)) > 0.7 for s in seen_words)
        if not is_dup:
            deduped.append(a)
            seen_words.append(words)
        if len(deduped) >= 8:
            break

    if not deduped:
        return None

    articles_text = '\n'.join([
        f"- [{a.get('source','')}] {a.get('title','')} ({a.get('date','')})"
        for a in deduped
    ])

    prompt = f"""You are writing a daily cyber security briefing for Australian staff at a registered training organisation. Today is {today} AEST.

Based on the following recent articles, write a 1-2 paragraph plain English briefing (80-100 words maximum).
- Focus only on what is directly relevant to Australian organisations or individuals
- Use clear, non-technical language suitable for non-security professionals
- Do not repeat the same story twice
- Do not make up or embellish facts
- End with one short practical tip

Articles:
{articles_text}

Write the briefing now. No title, no sign-off — just 1-2 short paragraphs."""

    payload = json.dumps({
        "model": "claude-sonnet-4-6",
        "max_tokens": 200,
        "messages": [{"role": "user", "content": prompt}]
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        method="POST"
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read().decode())
        briefing_text = result.get("content", [{}])[0].get("text", "").strip()
        if briefing_text:
            print(f"    AI briefing generated ({len(briefing_text)} chars)")
            return briefing_text
    except Exception as e:
        print(f"    Briefing generation failed: {e}")

    return None

def generate_featured_article(articles):
    """Use AI to select the most notable article and write a one-sentence pull quote."""
    import os, re as _re
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key or not articles:
        return None

    candidates = articles[:15]
    numbered = '\n'.join([
        '{}: [{}] {} — {}'.format(i, a.get('source', ''), a.get('title', ''), a.get('summary', '')[:100])
        for i, a in enumerate(candidates)
    ])
    prompt = (
        'From these recent cybersecurity articles, pick the single most significant or interesting story for an Australian audience.\n\n'
        + numbered
        + '\n\nReturn ONLY valid JSON:\n{"index": <number 0-'
        + str(len(candidates) - 1)
        + '>, "quote": "<one plain-English sentence, max 18 words, explaining why this story matters>"}'
    )
    payload = json.dumps({
        'model': 'claude-haiku-4-5-20251001',
        'max_tokens': 100,
        'messages': [{'role': 'user', 'content': prompt}]
    }).encode()
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=payload,
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        method='POST'
    )
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        result = json.loads(resp.read().decode())
        text = result.get('content', [{}])[0].get('text', '').strip()
        match = _re.search(r'\{[^}]+\}', text, _re.DOTALL)
        if match:
            data = json.loads(match.group())
            idx = int(data.get('index', 0))
            quote = str(data.get('quote', '')).strip()
            if 0 <= idx < len(candidates) and quote:
                a = candidates[idx]
                print('    Featured: {}...'.format(a.get('title', '')[:60]))
                return {
                    'title':  a.get('title', ''),
                    'link':   a.get('link', ''),
                    'source': a.get('source', ''),
                    'date':   a.get('date', ''),
                    'quote':  quote,
                }
    except Exception as e:
        print('    Featured article selection failed: {}'.format(e))
    return None


if __name__ == "__main__":
    print("\n=== Fetching news feeds (Zone 1) ===")
    news = fetch_news()
    save_json(news, "data/news.json")

    print("\n=== Fetching tool updates (Zone 2) ===")
    tools = fetch_tool_updates()
    save_json(tools, "data/tool_updates.json")

    print("\n=== Fetching CVEs ===")
    cves = fetch_cves()
    if isinstance(cves, dict):
        cves = cves.get('items', [])
    save_json(cves, 'data/cve.json')

    print("\n=== Generating AI briefing ===")
    AEST = datetime.timezone(datetime.timedelta(hours=10))
    news_list = news if isinstance(news, list) else (news.get('items', []) if isinstance(news, dict) else [])
    briefing_text = generate_briefing(news_list)

    print("\n=== Selecting featured article ===")
    featured = generate_featured_article(news_list)

    briefing_data = {
        'date':      datetime.datetime.now(AEST).strftime('%d %B %Y'),
        'briefing':  briefing_text or '',
        'generated': datetime.datetime.now(AEST).strftime('%d-%m-%Y %I:%M %p')
    }
    if featured:
        briefing_data['featured'] = featured
    if briefing_text or featured:
        save_json(briefing_data, 'data/briefing.json')
        print("  Briefing saved to data/briefing.json")
    else:
        print("  Briefing skipped (no API key or no articles)")

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
