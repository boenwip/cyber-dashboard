# pseudosec.

> Australian cyber security intelligence. Live, automated, no noise.

**Live site:** https://boenwip.github.io/cyber-dashboard/

---

## What it is

A personal project that became something more useful than intended.

PseudoSec is a live cyber security intelligence dashboard built for Australians — whether you work in security, IT, education, small business, or you're just someone who wants to know what's actually happening in the threat landscape without wading through tabloid tech journalism.

It pulls from 20+ curated Australian and international sources, filters out the noise, tags everything by topic and threat level, and updates automatically throughout the day. No ads, no accounts, no tracking.

---

## Pages

| Page | What's on it |
|---|---|
| **Dashboard** | Live threat tracker, CVE panel, AI briefing, scam alert, news feed, tool updates |
| **Definitions** | 51 cyber security terms explained in plain English — beginner to intermediate |
| **Resources** | Breach checker, report links, learning resources, security tools |
| **AI Guide** | Prompt library for everyday work tasks, AI safety rules, per-tool safety ratings |

---

## Features

**Live tracker** — Counts estimated FY2025–26 cybercrime reports in real time, projected from the ACSC annual rate of 84,700 reports/year. Alongside: avg business loss ($80,850), avg individual loss ($36,633), significant incidents, hotline calls. All sourced from the ACSC Annual Cyber Threat Report 2024–25.

**CVE panel** — 10 most recently added entries from the CISA Known Exploited Vulnerabilities catalog. Actively exploited CVEs only. Flags ransomware-linked CVEs.

**AI daily briefing** — Plain English summary of the day's top Australian cyber stories, generated via the Anthropic API and saved as static JSON. Runs server-side via GitHub Actions — no API key exposed to the browser. Deduplicates clustered stories before summarising.

**Scam of the week** — Surfaces the most recent ScamWatch article automatically.

**Word of the day** — Deterministic daily rotation through 51 cyber security definitions. Same term for everyone on the same AEST day.

**News feed** — Up to 30 articles from the last 7 days, sorted by date. Click any tag on an article to filter. Clear with one button.

**Tool updates sidebar** — Changelog-style feed for Google Workspace, Chrome, Asana, Zoom, ChatGPT, Canva, Claude, and Microsoft 365.

**Breach checker** — Email breach lookup via HaveIBeenPwned. Read-only, not stored, not logged.

**Two themes** — Dark (yellow on near-black) and light (navy `#0D3B66` on warm parchment). Persisted via localStorage.

---

## Sources

### News (Zone 1)

Australian-focused. Global sources are AU-filtered via Google News.

- ACSC Updates & Advisories
- ScamWatch (ACCC)
- Australian Cyber Security Magazine
- Security Brief Australia
- iTnews · ABC Technology · CyberDaily AU
- Troy Hunt Blog · Risky Business
- Dark Reading · 404 Media (AU-filtered)
- Google News — AU Cyber, Scams, ASQA/RTO, VET, AI & EdTech, Privacy, Funding

### Tool Updates (Zone 2)

Google Workspace · Chrome · Asana · Zoom · ChatGPT · Canva · Claude · Microsoft 365

### CVE

CISA Known Exploited Vulnerabilities catalog · cisagov/kev-data (fallback)

### Blocklist

Murdoch/News Corp, Nine Entertainment, Seven West Media, and clickbait farms excluded automatically.

---

## Architecture

```
pseudosec/
├── index.html              # Dashboard
├── definitions.html        # Glossary
├── resources.html          # Breach checker + links
├── ai-guide.html           # Prompt library + AI safety
├── shared.css              # Design system
├── shared.js               # Theme, nav, date utils, word of the day
├── dashboard.css/js        # Dashboard
├── definitions.css/js      # Glossary
├── definitions-page.js     # Search, filter, render
├── resources.css/js        # Breach checker
├── ai-guide.css/js         # Prompt library
├── fetch_cyber_news.py     # Python pipeline
├── briefing.json           # AI briefing (auto-generated)
├── news.json               # Feed output (auto)
├── tool_updates.json       # Tool feed output (auto)
├── cve.json                # CVE output (auto)
└── .github/workflows/
    └── fetch_news.yml      # GitHub Actions schedule
```

---

## Automation

GitHub Actions runs `fetch_cyber_news.py` on a schedule and commits updated JSON back to the repo. GitHub Pages serves everything statically.

**Schedule:** weekdays every 30 minutes (8am–7pm AEST) · nightly refresh · weekends every 8 hours.

The AI briefing requires `ANTHROPIC_API_KEY` as a GitHub Actions secret. Without it, the step is skipped gracefully.

---

## Running locally

```bash
pip install feedparser
python3 fetch_cyber_news.py
python3 -m http.server 8000
# Open http://localhost:8000/index.html
```

With briefing:

```bash
export ANTHROPIC_API_KEY=your_key_here
python3 fetch_cyber_news.py
```

---

## Design

| | Dark | Light |
|---|---|---|
| Background | `#0d0f14` | `#f4f1eb` |
| Accent | `#f5c842` yellow | `#0D3B66` navy |
| Critical | `#e07878` | `#b83a3a` |
| High | `#d4a84a` | `#8a6020` |

Fonts: IBM Plex Sans · IBM Plex Mono · Fraunces. WCAG AA contrast throughout.

---

## Tech

Python · feedparser · Anthropic API · vanilla HTML/CSS/JS · GitHub Pages · GitHub Actions

---

*Started as a personal news aggregator. Got out of hand.*
