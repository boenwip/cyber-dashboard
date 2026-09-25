# pseudosec.

> Australian cyber security intelligence. Live, automated, no noise.

**[Live site →](https://boenwip.github.io/cyber-dashboard/)**

---

PseudoSec is a cyber security dashboard built for Australians — whether you're a security professional, an IT admin, a small business owner, or just someone who wants to know what's actually happening in the threat landscape without wading through tabloid tech journalism. It pulls from ACSC, CISA and a curated set of security news feeds, filters out the rubbish, tags everything by topic, and refreshes automatically throughout the day. No ads. No accounts. No tracking.

---

## Pages

| Page | What's on it |
|---|---|
| **Dashboard** | ACSC alert banner · scam alert · cybercrime estimate · exploited CVEs · today's story · news feed · tool updates |
| **Reference** | OWASP Top 10 (Web, API, LLM) · Essential Eight · 51-term glossary — all in plain English |
| **Resources** | Breach check (via HaveIBeenPwned) · report links · learning resources · security tools |
| **AI Guide** | Prompt library for everyday work tasks · AI safety rules · per-tool data/training summary by plan |
| **Sources & Methodology** | How the site collects and presents data, what it isn't, and its limitations (footer link) |

`definitions.html` is a redirect stub to `reference.html#glossary` — kept for old links, not a real page.

---

## Features

**ACSC alert banner** — The newest ACSC Critical or High alert from the last 14 days, shown above everything else. ACSC items are the only ones with a threat level, taken from the ACSC's own title ("CRITICAL ALERT: …").

**Cybercrime estimate** — Projects the yearly cybercrime-report rate from ASD's latest Annual Cyber Threat Report across the current financial year (rolls over each 1 July), with that report's headline statistics and top reported crime types for individuals and businesses. Every figure lives in `data/annual_report.json` — see [New annual report](#new-annual-report).

**CVE panel** — The 10 most recently added entries in the CISA Known Exploited Vulnerabilities catalog, with ransomware use and CISA's fix-by date. KEV has no severity score, so none is shown.

**Today's Story** — Whichever recent article is being covered by the most distinct sources right now, picked by clustering articles on shared significant title words — not by AI. Falls back to the most recent article on a quiet news day.

**Scam alert** — The most recent Scamwatch item, surfaced automatically. Hidden if nothing recent.

**Word of the day / tip / blurb** — Deterministic daily rotations that all change at Sydney midnight.

**News feed** — Up to 30 articles from the last 7 days, newest first. Click any tag to filter (AU Cyber, AI & Tools, Scams, Compliance). Sources: ACSC, Scamwatch (via Google News), AU Cyber Security Magazine, Security Brief AU, iTnews, Troy Hunt, Krebs on Security, Risky Business, Dark Reading, 404 Media, plus site-scoped Google News searches (Guardian, ABC, BleepingComputer, The Register). News Corp, Nine, Seven West Media and clickbait farms are blocked by hostname.

**Tool updates** — Recent releases for Google Workspace, Chrome, Microsoft 365, Canva, Claude and AI tools, grouped by tool.

**Breach check** — Links to HaveIBeenPwned. (HIBP's email-search API needs a paid key sent from a server, so an in-page checker can't work on a static site.)

**Two themes** — Dark and light; follows the OS setting until you choose, then remembers your choice.

---

## Architecture

```
pseudosec/
├── index.html              # Dashboard
├── reference.html          # OWASP Top 10s, Essential Eight, glossary (tabbed)
├── resources.html          # Breach checker + links
├── ai-guide.html           # Prompt library + AI safety
├── sources.html            # Sources & methodology
├── definitions.html        # Redirect stub -> reference.html#glossary
├── shared.css/js           # Design system, theme, nav, esc()/safeUrl(), Sydney-time dates, daily rotations
├── dashboard.css/js        # Dashboard
├── reference.css           # Reference page styles
├── definitions.css/js      # Glossary data + render (reused by reference.html)
├── definitions-page.js     # Reference page's tab/glossary controller
├── resources.css           # Resources page
├── ai-guide.css/js         # Prompt library
├── sources.css             # Sources page styles
├── assets/
│   ├── pseudosec.png       # Logo
│   └── fonts/              # Self-hosted Inter, Space Grotesk, Hack (woff2)
├── scripts/
│   ├── fetch_cyber_news.py # RSS aggregation, tool updates, CVEs, featured story
│   ├── check_annual_report.py # Detects a newly published ASD annual report
│   └── audit.py            # Site checks: links, CSP, contrast, data schema
├── tests/
│   └── test_fetch.py       # Pipeline regression tests (pytest)
├── data/
│   ├── annual_report.json  # ASD annual report figures (hand-maintained)
│   ├── briefing.json       # Featured story (auto-generated)
│   ├── news.json           # Feed (auto-generated)
│   ├── tool_updates.json   # Tool updates (auto-generated)
│   └── cve.json            # CVE feed (auto-generated)
├── docs/                   # CHANGELOG, DECISIONS, REVIEW, this file
└── .github/workflows/
    ├── fetch_news.yml      # Scheduled fetch → tests → commit
    ├── annual_report_watch.yml # Daily: opens an issue when a new ASD report is out
    └── ci.yml              # Tests + audit on push/PR
```

---

## Automation

GitHub Actions runs the fetch pipeline on a schedule and commits updated JSON back to the repo. GitHub Pages serves everything statically — no server, no database, no API keys.

| Window (Sydney time, AEST or AEDT) | Schedule |
|---|---|
| Weekdays 8am–6:30pm | Every 30 minutes |
| Weekends | Every 8 hours |

The job runs the pipeline tests before fetching, uses least-privilege `permissions: contents: write`, pins actions to commit SHAs, and rebases onto any newer commit instead of force-pushing. All dates in `data/*.json` are ISO 8601 UTC; the browser formats them in Sydney time.

---

## New annual report

ASD publishes its Annual Cyber Threat Report each year (the 2024–25 edition came out in October 2025). `annual_report_watch.yml` checks daily and opens a GitHub issue with a checklist when the next one appears. To update:

1. Edit `data/annual_report.json` — title, FY, URL, yearly report count, interval, stats and crime types. It's the only place these figures live; the dashboard renders from it.
2. Check glossary entries that quote the previous year (search for the old FY).
3. Run `python3 scripts/audit.py` (it validates the file) and look at the dashboard.

---

## Running locally

```bash
pip install feedparser
python3 scripts/fetch_cyber_news.py
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`.

---

## Checks

```bash
pip install feedparser pytest
python3 -m pytest tests        # pipeline: blocklist, ACSC handling, tagging, sanitising, dates, KEV
python3 scripts/audit.py       # site: local links, CSP + inline-script hash, no third-party hosts, AA contrast, data schema
```

Both run in CI (`.github/workflows/ci.yml`) on every push and pull request.

---

## Design

| | Dark | Light |
|---|---|---|
| Background | `#0f0d0b` | `#f4f1eb` |
| Accent | `#f8ce2a` yellow | `#c85200` amber |
| Critical | `#e07878` | `#b83a3a` |
| High | `#d4a84a` | `#8a6020` |

Fonts (self-hosted): Inter (body) · Space Grotesk (headings) · Hack (technical data). All four text tokens meet WCAG AA (4.5:1) on every surface in both themes — enforced by `audit.py`.

---

**Tech:** Python · feedparser · vanilla HTML/CSS/JS · GitHub Pages · GitHub Actions

*Started as a personal news aggregator. Got out of hand.*
