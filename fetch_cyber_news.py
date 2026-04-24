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
    # ── Australian Cyber & Tech News ──
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
        "name": "The Guardian — Cybersecurity",
        "url": "https://www.theguardian.com/technology/data-computer-security/rss"
    },
    {
        "name": "Krebs on Security",
        "url": "https://krebsonsecurity.com/feed/"
    },
    {
        "name": "Schneier on Security",
        "url": "https://www.schneier.com/feed/atom"
    },
    {
        "name": "Troy Hunt Blog",
        "url": "https://www.troyhunt.com/rss/"
    },
    # ── Google News: Cyber & Scams ──
    {
        "name": "Google News — AU Cyber",
        "url": "https://news.google.com/rss/search?q=cyber+attack+data+breach+australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — AU Scams",
        "url": "https://news.google.com/rss/search?q=scam+fraud+australia+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── Google News: RTO / VET / Education ──
    {
        "name": "Google News — ASQA / RTO",
        "url": "https://news.google.com/rss/search?q=ASQA+RTO+traineeship+vocational+training+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — VET Workforce",
        "url": "https://news.google.com/rss/search?q=VET+traineeship+apprenticeship+skills+shortage+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — TAFE Australia",
        "url": "https://news.google.com/rss/search?q=TAFE+Queensland+NSW+Australia+training&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — ITECA / Training Policy",
        "url": "https://news.google.com/rss/search?q=ITECA+vocational+training+policy+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Training.gov.au",
        "url": "https://news.google.com/rss/search?q=training.gov.au+qualifications+accreditation+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── Google News: AI, EdTech & Compliance ──
    {
        "name": "Google News — VET Funding & Policy",
        "url": "https://news.google.com/rss/search?q=VET+funding+fee-free+TAFE+skills+policy+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — AI & EdTech",
        "url": "https://news.google.com/rss/search?q=AI+tools+education+training+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — AI Workforce",
        "url": "https://news.google.com/rss/search?q=artificial+intelligence+workforce+Australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Privacy & Compliance",
        "url": "https://news.google.com/rss/search?q=Privacy+Act+compliance+Australia+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── Positive / Good News ──
    {
        "name": "Google News — AU Cyber Wins",
        "url": "https://news.google.com/rss/search?q=australia+cyber+security+policy+improvement+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — AI Progress",
        "url": "https://news.google.com/rss/search?q=AI+tools+productivity+education+Australia+2026&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── High quality international / AU sources ──
    {
        "name": "CyberDaily AU",
        "url": "https://www.cyberdaily.au/feed"
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
        "name": "Google News — CyberDaily AU",
        "url": "https://news.google.com/rss/search?q=site:cyberdaily.au&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Dark Reading",
        "url": "https://news.google.com/rss/search?q=site:darkreading.com+cyber+security&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — Risky Business",
        "url": "https://news.google.com/rss/search?q=site:risky.biz&hl=en-AU&gl=AU&ceid=AU:en"
    },
    {
        "name": "Google News — 404 Media",
        "url": "https://news.google.com/rss/search?q=site:404media.co+cyber+security&hl=en-AU&gl=AU&ceid=AU:en"
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

def filter_old_articles(articles, days=30):
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

            # Skip blocked sources
            if is_blocked(link, title):
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

def fetch_cves():
    """Fetch latest High/Critical CVEs from NIST NVD API."""
    import time
    cves = []
    urls = [
        "https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL&resultsPerPage=4",
        "https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=HIGH&resultsPerPage=4",
    ]
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; cyber-dashboard/1.0)',
                'Accept': 'application/json'
            })
            resp = urllib.request.urlopen(req, timeout=15)
            data = json.loads(resp.read().decode())
            vulns = data.get('vulnerabilities', [])
            for v in vulns:
                try:
                    cve = v['cve']
                    cve_id = cve['id']
                    desc = next((d['value'] for d in cve.get('descriptions', []) if d['lang'] == 'en'), '')
                    metrics = cve.get('metrics', {})
                    score = None
                    severity = 'High'
                    for key in ['cvssMetricV31', 'cvssMetricV30', 'cvssMetricV2']:
                        metric_list = metrics.get(key, [])
                        if metric_list:
                            score = metric_list[0].get('cvssData', {}).get('baseScore')
                            severity = metric_list[0].get('cvssData', {}).get('baseSeverity', severity)
                            break
                    published = cve.get('published', '')[:10]
                    refs = cve.get('references', [])
                    link = refs[0]['url'] if refs else 'https://nvd.nist.gov/vuln/detail/' + cve_id
                    cves.append({
                        'id': cve_id,
                        'description': desc[:200],
                        'score': score,
                        'severity': severity,
                        'published': published,
                        'link': link
                    })
                except Exception:
                    continue
            time.sleep(1)  # NVD rate limit
        except Exception as e:
            print(f"    CVE fetch error: {e}")
    # Deduplicate by ID, sort by score descending, take top 4
    seen = set()
    unique = []
    for c in cves:
        if c['id'] not in seen:
            seen.add(c['id'])
            unique.append(c)
    unique.sort(key=lambda x: x.get('score') or 0, reverse=True)
    return unique[:4]


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

    print("\n=== Fetching CVEs ===")
    cves = fetch_cves()
    save_json({'last_updated': datetime.datetime.now().strftime('%d-%m-%Y %I:%M %p'), 'items': cves}, 'cve.json')
    print(f"  Saved {len(cves)} CVEs to cve.json")

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
