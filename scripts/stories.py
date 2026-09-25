# stories.py
# -------------------------------------------------------
# Groups articles that report the same event (e.g. six outlets covering one
# breach) into a single story, so the feed shows each story once with its
# other coverage listed underneath.
#
# Primary method: one Claude Haiku call per run that returns only which
# article numbers belong together — it never writes any text shown on the
# site. The answer is validated before use. If there is no API key, the call
# fails, or nothing has changed since the last run, a cached grouping or a
# strict headline word-match is used instead (it misses some duplicates but
# never merges different stories).
# -------------------------------------------------------

import hashlib
import json
import math
import os
import re

MODEL = "claude-haiku-4-5"
# Haiku 4.5 pricing, USD per million tokens, used to track spend against the monthly cap
PRICE_IN, PRICE_OUT = 1.00, 5.00
MONTHLY_BUDGET_USD = float(os.environ.get("GROUPING_BUDGET_USD", "3"))
GROUPS_FILE = "data/groups.json"

SYSTEM_PROMPT = """You group news articles for an Australian cyber security news feed.

Each line is one article: id | source | date | headline | first sentence.

Group articles only when different outlets are reporting the same news: the same event AND the same development of it (the same breach disclosure, the same vulnerability, the same arrest or takedown, the same official alert or report). Readers should lose nothing by seeing just one of them.

Keep these separate:
- A follow-up that reports a new development (a new review, new victims, new statements, a new official response) is a separate story from the original report.
- Articles that only share a topic, company, product, threat type or theme. Two different OpenAI stories, two different phishing campaigns or two different ransomware attacks are separate stories.
- Two articles from the same outlet are never the same story. A group may contain at most one article per source.

Return only groups of two or more articles. Each id may appear in at most one group. When unsure, leave the articles ungrouped."""

SCHEMA = {
    "type": "object",
    "properties": {
        "groups": {
            "type": "array",
            "items": {"type": "array", "items": {"type": "integer"}},
        }
    },
    "required": ["groups"],
    "additionalProperties": False,
}


def lede(text, limit=200):
    return re.split(r"(?<=[.!?])\s", text or "", maxsplit=1)[0][:limit]


def clean_title(title):
    # Google News appends the publisher: "... - bleepingcomputer.com", "... - The Guardian"
    return re.sub(r"\s+[-–]\s+[^-–]{2,40}$", "", title) if " - " in title or " – " in title else title


# ── Validation ─────────────────────────────────────────────

def validate_groups(raw, count, sources=None):
    """Keep only well-formed groups: integer ids in range, each used once, at most one
    article per source (when `sources` is given), 2+ per group."""
    if not isinstance(raw, dict) or not isinstance(raw.get("groups"), list):
        return None
    seen, groups = set(), []
    for g in raw["groups"]:
        if not isinstance(g, list):
            continue
        ids, outlets = [], set()
        for i in g:
            if isinstance(i, int) and not isinstance(i, bool) and 0 <= i < count and i not in seen and i not in ids:
                outlet = sources[i] if sources else i
                if outlet in outlets:
                    continue          # same outlet twice: keep the first, leave the rest as their own stories
                outlets.add(outlet)
                ids.append(i)
        if len(ids) >= 2:
            seen.update(ids)
            groups.append(ids)
    return groups


# ── AI grouping ────────────────────────────────────────────

def article_lines(articles):
    return "\n".join(
        f"{i} | {a.get('source', '').replace('Google News — ', '')} | {(a.get('date') or '')[:10]} | "
        f"{clean_title(a.get('title', ''))} | {lede(a.get('summary', ''))}"
        for i, a in enumerate(articles)
    )


def ai_groups(articles, client=None, spend=None):
    """Return validated groups of article indices from Claude, or None if unavailable.
    `spend` (a dict) is updated with the call's estimated cost in USD."""
    if client is None:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("    No ANTHROPIC_API_KEY — skipping AI grouping")
            return None
        try:
            import anthropic
        except ImportError:
            print("    anthropic package not installed — skipping AI grouping")
            return None
        client = anthropic.Anthropic(timeout=60.0, max_retries=2)
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": article_lines(articles)}],
            output_config={"format": {"type": "json_schema", "schema": SCHEMA}},
        )
    except Exception as e:  # any API/network failure falls back to word matching
        print(f"    AI grouping failed ({type(e).__name__}): {e}")
        return None
    if getattr(response, "stop_reason", None) not in ("end_turn", "stop_sequence"):
        print(f"    AI grouping stopped early ({getattr(response, 'stop_reason', None)})")
        return None
    text = next((b.text for b in response.content if getattr(b, "type", "") == "text"), "")
    try:
        groups = validate_groups(json.loads(text), len(articles), [outlet(a) for a in articles])
    except ValueError:
        groups = None
    usage = getattr(response, "usage", None)
    if usage is not None:
        tin, tout = getattr(usage, "input_tokens", 0) or 0, getattr(usage, "output_tokens", 0) or 0
        cost = (tin * PRICE_IN + tout * PRICE_OUT) / 1_000_000
        if spend is not None:
            spend["usd"] = round(spend.get("usd", 0) + cost, 6)
        print(f"    AI grouping: {tin} in / {tout} out tokens (~${cost:.4f})")
    return groups


# ── Fallback: strict headline word match ───────────────────

STOP = set("""a an the to of in on for and or is are was were be been with at by from as after over amid how why what
its it this that than into more still has have had will not but their they them you your our we us new says said say
report reports week today year could would should may might can just about also out up one two three four five first
last most many much some any all via per vs""".split())
GENERIC = set("""security cyber cybersecurity attack attacks attacker attackers data breach breaches australia australian
australians government organisations organizations organisation organization company companies users user threat
threats hacker hackers hack hacked hacking warns warning alert risk risks agent website site model tool artificial
intelligence using get through including multiple people network incident disclosed access flaw vulnerability
researcher campaign malware""".split())


def headline_tokens(title):
    out = set()
    for w in re.findall(r"[a-z0-9][a-z0-9'’-]*", clean_title(title).lower()):
        w = w.replace("’", "'").split("'")[0].strip("-")
        if len(w) > 4 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        if len(w) >= 3 and w not in STOP and w not in GENERIC:
            out.add({"govt": "government", "infiltrated": "infiltrate"}.get(w, w))
    return out


def word_groups(articles):
    """Conservative: two headlines match only when they share 2+ meaningful words, one of them rare,
    and come from different outlets (one outlet's series titles, e.g. podcast episodes, repeat words)."""
    titles = [headline_tokens(a.get("title", "")) for a in articles]
    df = {}
    for t in titles:
        for w in t:
            df[w] = df.get(w, 0) + 1
    clusters = []
    for i in range(len(articles)):
        best = None
        for c in clusters:
            hits = sum(1 for j in c if outlet(articles[i]) != outlet(articles[j])
                       and len(titles[i] & titles[j]) >= 2 and any(df[w] <= 3 for w in titles[i] & titles[j]))
            if hits and hits * 2 >= len(c) and (best is None or hits > best[1]):
                best = (c, hits)
        if best:
            best[0].append(i)
        else:
            clusters.append([i])
    return [c for c in clusters if len(c) > 1]


# ── Cache (avoid a paid call when nothing changed) ─────────

def fingerprint(articles):
    # Includes the grouping instructions, so changing the rules forces a fresh grouping
    key = SYSTEM_PROMPT + "\n" + "\n".join(sorted(a.get("link", "") + a.get("title", "") for a in articles))
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def load_cache(path=GROUPS_FILE):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_cache(fp, groups, method, articles, path=GROUPS_FILE, spend=None):
    data = {"fingerprint": fp, "method": method,
            "groups": [[articles[i].get("link", "") for i in g] for g in groups],
            "spend": spend or {}}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def cached_groups(cache, articles):
    index = {a.get("link", ""): i for i, a in enumerate(articles)}
    raw = {"groups": [[index[l] for l in g if l in index] for g in cache.get("groups", [])]}
    return validate_groups(raw, len(articles), [outlet(a) for a in articles]) or []


def month_spend(cache, month):
    spend = cache.get("spend") or {}
    return spend if spend.get("month") == month else {"month": month, "usd": 0.0}


def choose_groups(articles, client=None, cache_path=GROUPS_FILE, month=None):
    import datetime as dt
    month = month or dt.datetime.now(dt.timezone.utc).strftime("%Y-%m")
    fp = fingerprint(articles)
    cache = load_cache(cache_path)
    spend = month_spend(cache, month)
    if cache.get("fingerprint") == fp and cache.get("method") == "ai":
        print("    Articles unchanged since last run — reusing AI grouping")
        save_cache(fp, cached_groups(cache, articles), "ai", articles, cache_path, spend)
        return cached_groups(cache, articles), "ai-cached"
    groups = None
    if spend["usd"] >= MONTHLY_BUDGET_USD:
        print(f"    Monthly AI budget reached (${spend['usd']:.2f} of ${MONTHLY_BUDGET_USD:.2f}) — using word matching")
    else:
        groups = ai_groups(articles, client, spend)
    method = "ai"
    if groups is None:
        groups, method = word_groups(articles), "words"
    save_cache(fp, groups, method, articles, cache_path, spend)
    return groups, method


# ── Build stories ──────────────────────────────────────────

# Which outlet leads a story when several cover it: official sources first, then outlets
# with strong editorial standards and original reporting, then specialist trade press.
# (No traffic data is available from the feeds, so reputation is the signal.)
REPUTATION = [
    ("ACSC", 0), ("Scamwatch", 0), ("ScamWatch", 0),
    ("ABC", 1), ("Guardian", 1), ("iTnews", 1), ("Krebs", 1), ("Troy Hunt", 1),
    ("Bleeping", 2), ("Register", 2), ("Risky Business", 2), ("404 Media", 2), ("Dark Reading", 2),
    ("Australian Cyber Security Magazine", 3), ("Security Brief", 3),
]


def outlet(a):
    return a.get("source", "").replace("Google News — ", "")


def reputation(a):
    if a.get("official"):
        return 0
    name = outlet(a)
    return next((tier for key, tier in REPUTATION if key.lower() in name.lower()), 4)


def lead_rank(a):
    """Which article represents the story: best reputation, then a direct feed with a real summary, then earliest."""
    direct = not a.get("source", "").startswith("Google News")
    return (reputation(a), 0 if direct else 1, -len(a.get("summary", "")), a.get("date") or "9")


def build_stories(articles, groups):
    """Collapse each group into one story: the lead article plus a `coverage` list of the others."""
    grouped = {i for g in groups for i in g}
    stories = [dict(a) for i, a in enumerate(articles) if i not in grouped]
    for g in groups:
        members = sorted((articles[i] for i in g), key=lead_rank)
        lead = dict(members[0])
        others = sorted(members[1:], key=lambda a: a.get("date") or "", reverse=True)
        lead["coverage"] = [{"source": o.get("source", ""), "title": o.get("title", ""),
                             "link": o.get("link", ""), "date": o.get("date", "")} for o in others]
        lead["tags"] = list(dict.fromkeys(t for m in members for t in m.get("tags", [])))
        # Sort by the latest coverage, so a developing story stays near the top
        lead["latest"] = max((m.get("date") or "" for m in members), default="")
        stories.append(lead)
    return sorted(stories, key=lambda s: s.get("latest") or s.get("date") or "", reverse=True)

