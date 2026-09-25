# fetch_cyber_news.py
# -------------------------------------------------------
# Fetches news from RSS feeds, tags each article, and saves:
#   - data/news.json         (Zone 1: Cyber & Sector news)
#   - data/tool_updates.json (Zone 2: Tool product updates)
#   - data/cve.json          (CISA Known Exploited Vulnerabilities)
#   - data/briefing.json     (Featured "Today's Story")
# All dates are stored as ISO 8601 UTC; the browser formats them
# in Australia/Sydney time.
#
# HOW TO RUN:
#   1. Install required library (only once):
#      pip install feedparser
#   2. Run from the repo root:
#      python scripts/fetch_cyber_news.py
# -------------------------------------------------------

import feedparser
import json
import datetime
import email.utils
import html
import re
import urllib.request
import urllib.error
import urllib.parse
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

def host_matches(link, domains):
    """True if the link's hostname is one of `domains` or a subdomain of one.
    Matching on the parsed hostname (not a substring of the URL) matters:
    "news.com.au" must not match "itnews.com.au"."""
    try:
        host = (urllib.parse.urlparse(link).hostname or "").lower()
    except ValueError:
        return False
    return any(host == d or host.endswith("." + d) for d in domains)


def is_blocked(link, title=""):
    """Return True if the article should be excluded based on source domain or title keywords."""
    if link and host_matches(link, BLOCKED_DOMAINS):
        return True
    title_lower = title.lower()
    return any(kw in title_lower for kw in BLOCKED_TITLE_KEYWORDS)


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
    "oaic.gov.au", "accc.gov.au",
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
}


NEWS_FEEDS = [
    # ── Government & Official ──
    # "official": always included and tagged AU Cyber, whatever the keywords say.
    # These are the only items that carry a threat level (see official_threat()).
    {
        "name": "ACSC Alerts",
        "url": "https://www.cyber.gov.au/rss/alerts",
        "official": True,
        "timeout": 30,
        "retries": 1,
    },
    {
        "name": "ACSC Advisories",
        "url": "https://www.cyber.gov.au/rss/advisories",
        "official": True,
        "timeout": 30,
        "retries": 1,
    },
    {
        "name": "Google News — ScamWatch",
        "url": "https://news.google.com/rss/search?q=site:scamwatch.gov.au&hl=en-AU&gl=AU&ceid=AU:en"
    },
    # ── Australian Cyber & Tech News (direct RSS — always trusted) ──
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
        "name": "Google News — Privacy & Compliance AU",
        "url": "https://news.google.com/rss/search?q=(site:abc.net.au+OR+site:theguardian.com)+privacy+act+australia&hl=en-AU&gl=AU&ceid=AU:en"
    },
]


# -------------------------------------------------------
# ZONE 2: TOOL UPDATE FEEDS
# -------------------------------------------------------

# cyber.gov.au often times out from cloud/datacentre networks (it does from GitHub
# Actions). When both direct ACSC feeds return nothing, this Google News search of
# the ACSC alerts-and-advisories section is used instead. Google News drops ACSC's
# "HIGH ALERT:" style prefixes, so these items are marked official with NO threat
# level — the site shows them as ACSC items without inventing a severity.
ACSC_FALLBACK_FEED = {
    "name": "ACSC (via Google News)",
    "url": "https://news.google.com/rss/search?q=site:cyber.gov.au/about-us/view-all-content/alerts-and-advisories&hl=en-AU&gl=AU&ceid=AU:en",
    "official": True,
    "severity_known": False,
}


TOOL_FEEDS = [
    {
        "name": "Google Workspace Updates",
        "tool": "Google Workspace",
        "url": "https://workspaceupdates.googleblog.com/feeds/posts/default"
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
            "acsc", "asd", "cyber.gov", "auscert",
            "critical infrastructure", "ransomware",
            "phishing", "data breach", "vulnerability", "vulnerabilities", "cve",
            "malware", "threat actor", "exploit", "security patch",
            "security incident", "compromise", "security advisory",
            "cyber attack", "cyberwarfare", "cybercrime",
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
# THREAT LEVEL — official sources only
# ACSC alert titles carry their own severity ("CRITICAL ALERT: ...",
# "HIGH ALERT: ..."). Every other article gets no threat level: guessing
# severity from words like "critical" or "risk" in a headline mislabels
# product launches and podcasts as critical threats.
# -------------------------------------------------------

ACSC_PREFIX = re.compile(r"^\s*(CRITICAL|HIGH|MEDIUM|MODERATE|LOW)\s+ALERT\s*[:\-–]\s*", re.I)


def official_threat(title):
    """Return (threat_level, title_without_prefix) for an ACSC alert/advisory."""
    m = ACSC_PREFIX.match(title)
    if not m:
        return "Advisory", title
    level = m.group(1).capitalize()
    if level == "Moderate":
        level = "Medium"
    return level, title[m.end():].strip()


# -------------------------------------------------------
# HELPER: Dates
# Stored as ISO 8601 UTC ("2026-09-25T00:05:00Z"). The browser formats them
# in Australia/Sydney time, so daylight saving is handled correctly.
# -------------------------------------------------------

def iso_utc(dt):
    return dt.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def now_iso():
    return iso_utc(datetime.datetime.now(datetime.timezone.utc))


def parse_date(entry):
    """Return the entry's publish/update time as ISO 8601 UTC, or "" if unknown."""
    for key in ("published_parsed", "updated_parsed"):
        parsed = entry.get(key)
        if parsed:
            try:
                return iso_utc(datetime.datetime(*parsed[:6], tzinfo=datetime.timezone.utc))
            except (TypeError, ValueError):
                pass
    for key in ("published", "updated"):
        raw = entry.get(key)
        if raw:
            try:
                dt = email.utils.parsedate_to_datetime(raw)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=datetime.timezone.utc)
                return iso_utc(dt)
            except (TypeError, ValueError):
                pass
    return ""


def parse_iso(value):
    """Parse our ISO format back to an aware datetime; None if missing/invalid."""
    try:
        return datetime.datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)
    except (TypeError, ValueError):
        return None


# -------------------------------------------------------
# HELPER: Convert feed HTML to plain text
# Output is plain text only. Entities are decoded exactly once, after tags
# are removed, and the browser escapes everything on render, so no markup
# from a feed can reach the page as HTML.
# -------------------------------------------------------

def strip_html(text):
    text = re.sub(r"<[^>]*>", " ", text or "")
    text = html.unescape(text)
    return " ".join(text.split())


def https_link(link):
    """Feeds (e.g. Blogger) often publish http:// links; the site only renders https."""
    link = (link or "").strip()
    return "https://" + link[7:] if link.lower().startswith("http://") else link


def truncate(text, limit):
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(" ,.;:") + "…"


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

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"


def fetch_feed(url, timeout=10, retries=0):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as response:
                data = response.read()
            return feedparser.parse(data)
        except (urllib.error.URLError, socket.timeout) as e:
            print(f"    Could not reach (attempt {attempt + 1}/{retries + 1}): {e}")
        except Exception as e:
            print(f"    Skipping (unexpected error): {e}")
            break
    return feedparser.FeedParserDict({"entries": []})


# -------------------------------------------------------
# HELPER: Tagging
# -------------------------------------------------------

def _keyword_regex(keywords):
    # Whole-word/phrase matching: "ism" must not match "tourism", "ato" must
    # not match "senator". An optional trailing "s" lets "scam" match "scams";
    # irregular plurals ("vulnerabilities") need their own entry.
    alts = "|".join(re.escape(k.lower()) for k in sorted(keywords, key=len, reverse=True))
    return re.compile(r"(?<![a-z0-9])(?:" + alts + r")s?(?![a-z0-9])")


for _rule in TOPIC_TAG_RULES:
    _rule["regex"] = _keyword_regex(_rule["keywords"])


def get_topic_tags(combined):
    return [rule["tag"] for rule in TOPIC_TAG_RULES if rule["regex"].search(combined)]


# -------------------------------------------------------
# HELPER: Filter out articles older than N days
# Undated articles are kept (sorted last) rather than silently dropped.
# -------------------------------------------------------

def filter_old_articles(articles, days=30):
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    kept = []
    for article in articles:
        dt = parse_iso(article.get("date", ""))
        if dt is None or dt >= cutoff:
            kept.append(article)
    return kept


def sort_newest_first(items):
    # ISO 8601 UTC strings sort chronologically; "" (undated) sorts last.
    return sorted(items, key=lambda a: a.get("date") or "", reverse=True)


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

# Celebrity/entertainment content that slips through topic matching.
# Deliberately no bare "actor": in security news it almost always means "threat actor".
TITLE_BLOCKLIST = [
    "rebel wilson", "kardashian", "celebrity", "actress",
    "nude photo", "leaked photo", "snapchat hack celebrity",
    "reality tv", "influencer", "tiktok star", "youtube star",
]

# Section index pages (not alerts) that the ACSC Google News fallback can return
ACSC_INDEX_PAGES = {"alerts and advisories", "homepage | cyber.gov.au", "report", "report and recover"}

# Index/listing pages that Google News returns for site: queries
LISTING_PAGE = re.compile(r"\b(browse news|news and alerts|alerts and news)\b|\bpage \d+\b", re.I)


def build_article(feed, entry):
    """Turn one feed entry into an article dict, or None if it should be skipped."""
    title = strip_html(entry.get("title", ""))
    summary = strip_html(entry.get("summary", ""))
    link = https_link(entry.get("link", ""))
    official = feed.get("official", False)

    if not title or title.lower().startswith("sponsored"):
        return None
    if is_blocked(link, title):
        return None
    if feed["url"].startswith("https://news.google.com") and not is_approved_gnews(title, feed["name"]):
        return None
    if any(term in title.lower() for term in TITLE_BLOCKLIST) or LISTING_PAGE.search(title):
        return None

    combined = (title + " " + summary).lower()
    topic_tags = get_topic_tags(combined)
    threat = None
    if official:
        if feed.get("severity_known", True):
            threat, title = official_threat(title)
        else:
            title = re.sub(r"\s+[-\u2013|]\s+Cyber\.gov\.au$", "", title, flags=re.I)
            if title.lower() in ACSC_INDEX_PAGES:
                return None
        if "AU Cyber" not in topic_tags:
            topic_tags.insert(0, "AU Cyber")
    if not topic_tags:
        return None

    article = {
        "source":    feed["name"],
        "title":     title,
        "link":      link,
        "summary":   truncate(summary, 300),
        "date":      parse_date(entry),
        "tags":      topic_tags,
    }
    if official:
        article["official"] = True
        if threat:
            article["threat"] = threat
    return article


def fetch_news():
    all_articles = []

    official_entries = 0
    for feed in NEWS_FEEDS:
        print(f"  Fetching: {feed['name']}...")
        parsed = fetch_feed(feed["url"], feed.get("timeout", 10), feed.get("retries", 0))
        if feed.get("official"):
            official_entries += len(parsed.entries)
        for entry in parsed.entries:
            article = build_article(feed, entry)
            if article:
                all_articles.append(article)

    if not official_entries:
        print(f"  Direct ACSC feeds unavailable — fetching: {ACSC_FALLBACK_FEED['name']}...")
        for entry in fetch_feed(ACSC_FALLBACK_FEED["url"]).entries:
            article = build_article(ACSC_FALLBACK_FEED, entry)
            if article:
                all_articles.insert(0, article)   # ahead of press coverage of the same alert in dedupe

    all_articles = deduplicate(all_articles)
    all_articles = filter_old_articles(all_articles, days=14)
    return sort_newest_first(all_articles)


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
            title = strip_html(entry.get("title", ""))
            title_key = title.lower()
            if not title or title_key in seen_titles:
                continue
            seen_titles.add(title_key)

            all_updates.append({
                "source":  feed["name"],
                "tool":    feed["tool"],
                "title":   title,
                "link":    https_link(entry.get("link", "")),
                "summary": truncate(strip_html(entry.get("summary", "")), 200),
                "date":    parse_date(entry),
            })

    return sort_newest_first(all_updates)


# -------------------------------------------------------
# FETCH: CISA Known Exploited Vulnerabilities
# KEV has no severity score, so none is invented here. What it does have
# (ransomware use, and CISA's remediation deadline) is passed through as-is.
# -------------------------------------------------------

KEV_SOURCES = [
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    "https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json",
]


def kev_item(v):
    cve_id = v.get("cveID", "")
    vendor = (v.get("vendorProject") or "").strip()
    product = (v.get("product") or "").strip()
    desc = (v.get("shortDescription") or v.get("vulnerabilityName") or "").strip()
    return {
        "id":          cve_id,
        "name":        " ".join(x for x in (vendor, product) if x),
        "description": truncate(desc, 200),
        "date_added":  v.get("dateAdded", ""),
        "due_date":    v.get("dueDate", ""),
        "ransomware":  v.get("knownRansomwareCampaignUse", "Unknown"),
        "link":        "https://nvd.nist.gov/vuln/detail/" + cve_id,
    }


def fetch_cves(limit=10):
    """Return the `limit` most recently added entries in the CISA KEV catalog."""
    for url in KEV_SOURCES:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            vulns = data.get("vulnerabilities", [])
            vulns.sort(key=lambda x: x.get("dateAdded", ""), reverse=True)
            cves = [kev_item(v) for v in vulns[:limit] if v.get("cveID")]
            if cves:
                print(f"    Fetched {len(cves)} CVEs from CISA KEV")
                return cves
        except Exception as e:
            print(f"    KEV source failed ({url[:50]}): {e}")

    print("    All CVE sources failed")
    return []


# -------------------------------------------------------
# FEATURED STORY
# -------------------------------------------------------

TRENDING_STOPWORDS = {
    'the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'is', 'are',
    'with', 'at', 'by', 'from', 'as', 'after', 'over', 'amid', 'how', 'why',
    'what', 'its', 'it', 'this', 'that', 'than', 'into', 'more', 'still',
    'be', 'has', 'have', 'was', 'were', 'will', 'not', 'but', 'their',
}


def select_trending_article(articles):
    """Pick whichever recent story is being covered by the most distinct sources right
    now — a real cross-source signal instead of an AI's subjective pick. No API key
    needed.

    Different outlets almost never use near-identical headlines for the same event,
    so this can't reuse deduplicate()'s strict substring matching (that stays as-is —
    it's tuned for feed correctness, not topic clustering). Instead, group articles by
    shared significant title words: two articles from different sources count as the
    same story if they share at least half the meaningful words in the shorter title.

    Falls back to the single most recent article if nothing today clears that bar
    (quiet news day, or every outlet phrased it differently).
    """
    if not articles:
        return None

    candidates = articles[:40]
    word_sets = []
    for a in candidates:
        words = set(w.strip('.,:;\'"()') for w in (a.get('title') or '').lower().split())
        word_sets.append(words - TRENDING_STOPWORDS)

    best_idx, best_count = 0, 1
    for i, a in enumerate(candidates):
        if not word_sets[i]:
            continue
        cluster_sources = {a.get('source', '')}
        for j, b in enumerate(candidates):
            if i == j or not word_sets[j] or b.get('source', '') in cluster_sources:
                continue
            overlap = len(word_sets[i] & word_sets[j]) / max(len(word_sets[i]), len(word_sets[j]))
            if overlap >= 0.5:
                cluster_sources.add(b.get('source', ''))
        if len(cluster_sources) > best_count:
            best_idx, best_count = i, len(cluster_sources)

    best = candidates[best_idx] if best_count > 1 else articles[0]
    source_count = best_count if best_count > 1 else 1

    print('    Featured: {}... ({} source{})'.format(
        best.get('title', '')[:60], source_count, '' if source_count == 1 else 's'
    ))

    return {
        'title':        best.get('title', ''),
        'link':         best.get('link', ''),
        'source':       best.get('source', ''),
        'date':         best.get('date', ''),
        'summary':      truncate(best.get('summary', '') or '', 140),
        'source_count': source_count,
    }


# -------------------------------------------------------
# SAVE to JSON
# -------------------------------------------------------

def previous_count(filename):
    try:
        with open(filename, encoding="utf-8") as f:
            items = json.load(f).get("items")
        return len(items) if isinstance(items, list) else 0
    except (OSError, ValueError, AttributeError):
        return 0


def save_json(data, filename):
    # An outage upstream shouldn't blank a panel: if this run found nothing but the
    # last saved file has items, keep that file (and its older last_updated).
    if isinstance(data, list) and not data and previous_count(filename):
        print(f"  Nothing fetched for {filename} — keeping the previous file")
        return
    count = len(data) if isinstance(data, list) else 0
    output = {
        "last_updated": now_iso(),
        "count":        count,
        "items":        data,
    }
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"  Saved {count} items to {filename}")


# -------------------------------------------------------
# RUN
# -------------------------------------------------------

def print_breakdown(label, values, order=None):
    counts = {}
    for v in values:
        counts[v] = counts.get(v, 0) + 1
    print(f"\n--- {label} ---")
    for key in (order or counts):
        print(f"  {key}: {counts.get(key, 0)} articles")


if __name__ == "__main__":
    print("\n=== Fetching news feeds (Zone 1) ===")
    news = fetch_news()
    save_json(news, "data/news.json")

    print("\n=== Fetching tool updates (Zone 2) ===")
    save_json(fetch_tool_updates(), "data/tool_updates.json")

    print("\n=== Fetching CVEs ===")
    save_json(fetch_cves(), "data/cve.json")

    print("\n=== Selecting featured article ===")
    featured = select_trending_article(news)
    if featured:
        save_json({"featured": featured}, "data/briefing.json")

    print_breakdown("Tag breakdown", [t for a in news for t in a["tags"]])
    print_breakdown("Official threat levels", [a["threat"] for a in news if a.get("official")],
                    ["Critical", "High", "Medium", "Low", "Advisory"])
    print("\nDone!")
