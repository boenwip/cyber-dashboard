# pseudosec.

> Australian cyber security intelligence. Live, automated, no noise.

**[Live site →](https://boenwip.github.io/cyber-dashboard/)**

---

PseudoSec is a cyber security dashboard built for Australians — whether you're a security professional, an IT admin, a small business owner, or just someone who wants to know what's actually happening in the threat landscape without wading through tabloid tech journalism. It pulls from ACSC, CISA and a curated set of security news feeds, filters out the rubbish, shows each story once however many outlets cover it, and refreshes automatically throughout the day. No ads. No accounts. No tracking.

---

## Pages

| Page | What's on it |
|---|---|
| **Dashboard** | A bento overview (cybercrime estimate · ACSC alert · exploited CVEs · scam to know · news · crime types · tip · tool updates · word of the day). Each panel opens a split-view explorer: a list on the left, the full item on the right. |
| **Reference** | OWASP Top 10 (Web, API, LLM) · Essential Eight · 51-term glossary — all in plain English |
| **Resources** | Breach check (via HaveIBeenPwned) · report links · learning resources · security tools |
| **AI Guide** | 47 general prompts that work in any AI chat tool · what not to share · how to write your own prompt |
| **Sources & Methodology** | How the site collects and presents data, what it isn't, and its limitations (footer link) |

`definitions.html` is a redirect stub to `reference.html#glossary` — kept for old links, not a real page.

---

## Features

**Layout** — The dashboard opens as a grid of panels, each showing one thing at a glance. Clicking a panel opens the explorer at that topic (ACSC alerts, exploited CVEs, news, scams, this year, tool updates, learn), with tabs to move between topics and a smooth transition back to the overview. Topics can be linked directly: `index.html#news`, `#alerts`, `#cve`, `#scams`, `#year`, `#tools`, `#learn`.

**Official ACSC alert** — The newest ACSC alert from the last 14 days, Critical or High first. ACSC items are the only ones with a threat level, taken from ACSC's own title ("CRITICAL ALERT: …"). cyber.gov.au times out from GitHub's servers, so the pipeline falls back to a Google News search of ACSC's alerts section; those items are labelled "ACSC" with no level rather than a guessed one.

**Cybercrime estimate** — Projects the yearly cybercrime-report rate from ASD's latest Annual Cyber Threat Report across the current financial year (rolls over each 1 July), with that report's headline statistics and top reported crime types for individuals and businesses. Every figure lives in `data/annual_report.json` — see [New annual report](#new-annual-report).

**CVE panel** — The 10 most recently added entries in the CISA Known Exploited Vulnerabilities catalog, with ransomware use and CISA's fix-by date. KEV has no severity score, so none is shown.

**One entry per story** — Coverage of the same event by several outlets is grouped into one story, with the other outlets listed under it. Each refresh, Claude Haiku 4.5 is asked only which articles describe the same event (JSON-schema output, validated; it writes no site text; ~3,500 input tokens per call, skipped when nothing changed). Without a key or on failure, a strict headline match is used. The story covered by the most outlets leads the news panel.

**Scam to know** — The most recent Scamwatch item or scam headline.

**Tip / word of the day** — Deterministic daily rotations that change at Sydney midnight.

**News** — Stories from the last 7 days in the overview; every stored story in the explorer, filterable by tag (AU Cyber, AI & Tools, Scams, Compliance). Sources: ACSC, Scamwatch (via Google News), AU Cyber Security Magazine, Security Brief AU, iTnews, Troy Hunt, Krebs on Security, Risky Business, Dark Reading, 404 Media, plus site-scoped Google News searches (Guardian, ABC, BleepingComputer, The Register). News Corp, Nine, Seven West Media and clickbait farms are blocked by hostname.

**Tool updates** — Recent releases for Google Workspace, Chrome, Microsoft 365, Canva, Claude and AI tools, grouped by tool.

**Breach check** — Links to HaveIBeenPwned. (HIBP's email-search API needs a paid key sent from a server, so an in-page checker can't work on a static site.)

**Two themes** — Light and dark; follows the OS setting until you choose with the header toggle, then remembers your choice.

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
├── dashboard.css/js        # Bento overview + split-view explorer
├── reference.css           # Reference page styles
├── definitions.css/js      # Glossary data + render (reused by reference.html)
├── definitions-page.js     # Reference page's tab/glossary controller
├── resources.css           # Resources page
├── ai-guide.css/js         # Prompt library
├── sources.css             # Sources page styles
├── assets/
│   ├── pseudosec.png       # Logo
│   └── fonts/              # Self-hosted Host Grotesk, Spline Sans Mono (woff2)
├── scripts/
│   ├── fetch_cyber_news.py # RSS aggregation, tool updates, CVEs, featured story
│   ├── stories.py          # Groups coverage of the same event (Claude Haiku, word-match fallback)
│   ├── check_annual_report.py # Detects a newly published ASD annual report
│   └── audit.py            # Site checks: links, CSP, contrast, data schema
├── tests/
│   ├── test_fetch.py       # Pipeline regression tests (pytest)
│   └── test_stories.py     # Story grouping tests
├── data/
│   ├── annual_report.json  # ASD annual report figures (hand-maintained, committed)
│   └── news/cve/tool_updates/briefing.json  # Generated at deploy time — not in main;
│                                            # snapshots live on the `data` branch
├── docs/                   # CHANGELOG, DECISIONS, REVIEW, this file
└── .github/workflows/
    ├── deploy.yml          # Tests → fetch → audit → publish to Pages → data snapshot
    ├── annual_report_watch.yml # Daily: opens an issue when a new ASD report is out
    └── ci.yml              # Tests + audit on pull requests
```

---

## Automation

`deploy.yml` builds and publishes the site with GitHub Actions — no server, no database, no API keys, and no bot commits on `main`. Each run:

1. runs the pipeline tests;
2. starts from the latest data snapshot on the **`data` branch**;
3. fetches the feeds (if a source returns nothing, the previous file is kept rather than blanking a panel);
4. runs the audit and publishes the site to GitHub Pages;
5. commits the new snapshot back to the `data` branch (a history of what was live).

It runs on every push to `main` (except docs-only changes), on demand, and on this schedule:

| Window (Sydney time, AEST or AEDT) | Schedule |
|---|---|
| Weekdays 8am–6:30pm | Every 30 minutes |
| Weekends | Every 8 hours |

GitHub runs schedules on a best-effort basis, so gaps can be longer. Actions are pinned to commit SHAs with least-privilege permissions. All dates in the data are ISO 8601 UTC; the browser shows them in Sydney time.

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
python3 scripts/fetch_cyber_news.py   # generates data/*.json (git-ignored)
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`. To start from exactly what's live instead of fetching: `git fetch origin data && git checkout origin/data -- data && git restore --staged data`.

---

## Checks

```bash
pip install feedparser pytest
python3 -m pytest tests        # pipeline: blocklist, ACSC handling, tagging, sanitising, dates, KEV
python3 scripts/audit.py       # site: local links, CSP + inline-script hash, no third-party hosts, AA contrast, data schema
```

Both run on every pull request (`ci.yml`) and before every deploy (`deploy.yml`).

---

## Design

Soft paper-and-ink palette with the logo kept as the one playful element. The logo's yellow becomes a pale butter tint (the estimate panel) and its orange a small accent (links, the financial-year ruler, focus rings).

| | Light | Dark |
|---|---|---|
| Background / panels | `#f3f3f0` / `#ffffff` | `#121314` / `#1b1c1f` |
| Text | `#1b1c1e` | `#ecece6` |
| Accent | `#b14718` (dot `#e4642c`) | `#f08a55` |
| Butter panel | `#fbf3c8` | `#2a2716` |
| Critical / High | `#a3231a` / `#8a5a0b` | `#f59a8f` / `#f3c46a` |

Fonts (self-hosted): Host Grotesk (everything) · Spline Sans Mono (small data: dates, IDs). Severity is shown with diamond chips, not colour alone. No emoji icons, no tiny letter-spaced capitals, no hairline borders. All text tokens meet WCAG AA (4.5:1) on every surface in both themes — enforced by `audit.py`.

---

**Tech:** Python · feedparser · Claude API (story grouping only) · vanilla HTML/CSS/JS · GitHub Pages · GitHub Actions

*Started as a personal news aggregator. Got out of hand.*
