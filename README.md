# pseudosec.

> Australian cyber security intelligence. Live, automated, no noise.

**[Live site →](https://boenwip.github.io/cyber-dashboard/)**

---

PseudoSec is a cyber security dashboard built for Australians — whether you're a security professional, an IT admin, a small business owner, or just someone who wants to know what's actually happening in the threat landscape without wading through tabloid tech journalism. It pulls from 20+ curated sources, filters out the rubbish, tags everything by topic and threat level, and refreshes automatically throughout the day. No ads. No accounts. No tracking.

---

## Pages

| Page | What's on it |
|---|---|
| **Dashboard** | Live threat tracker · CVE panel · AI briefing · scam alert · news feed · tool updates |
| **Definitions** | 51 cyber security terms explained in plain English — beginner to intermediate |
| **Resources** | Breach checker · report links · learning resources · security tools |
| **AI Guide** | Prompt library for everyday work tasks · AI safety rules · per-tool safety ratings |

---

## Features

**Live cybercrime tracker** — Counts estimated FY2025–26 cybercrime reports in real time, projected from the ACSC rate of 84,700 reports/year. Alongside: avg business loss ($80,850 ↑50%), avg individual loss ($36,633), significant incidents, and hotline calls. All sourced from the ACSC Annual Cyber Threat Report 2024–25.

**CVE panel** — 10 most recently added entries from the CISA Known Exploited Vulnerabilities catalog. Actively exploited only — not CVSS-scored CVEs from 1999. Ransomware-linked CVEs flagged with ⚠.

**AI daily briefing** — Plain English summary of the day's top Australian cyber stories, generated via the Anthropic API and saved as static JSON. Runs server-side in GitHub Actions — no API key exposed to the browser. Deduplicates clustered stories before summarising. Hides the panel gracefully if no briefing is available.

**Scam of the week** — The most recent ScamWatch article, surfaced automatically. Hidden if nothing recent.

**Word of the day** — Deterministic daily rotation through 51 cyber security definitions. Same term for everyone on the same AEST day.

**News feed** — Up to 30 articles from the last 7 days, sorted by date. Click any tag on an article to filter — active filters shown in a slim bar with one-click clear. Estimated reading time shown per article. Sources: ACSC, ScamWatch, AU Cyber Security Magazine, Security Brief AU, iTnews, ABC Technology, CyberDaily AU, Troy Hunt Blog, Risky Business, Dark Reading, 404 Media, Google News (AU-filtered). Murdoch/News Corp, Nine Entertainment, Seven West Media, and clickbait farms blocked automatically.

**Tool updates** — Changelog-style sidebar tracking releases and updates for Google Workspace, Chrome, Asana, Zoom, ChatGPT, Canva, Claude, and Microsoft 365.

**Breach checker** — Email breach lookup via HaveIBeenPwned. Read-only, not stored, not logged. Falls back to the HIBP site directly if the API blocks browser requests.

**Two themes** — Dark (yellow on near-black) and light (navy on warm parchment). Persisted via localStorage.

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
├── definitions.css/js      # Glossary styles, search, filter, render
├── resources.css/js        # Breach checker
├── ai-guide.css/js         # Prompt library
├── fetch_cyber_news.py     # RSS aggregation + AI briefing pipeline
├── apply_updates.py        # Tool updates pipeline
├── briefing.json           # AI briefing (auto-generated)
├── news.json               # Feed (auto-generated)
├── tool_updates.json       # Tool updates (auto-generated)
├── cve.json                # CVE feed (auto-generated)
└── .github/workflows/
    └── fetch_news.yml      # GitHub Actions schedule
```

---

## Automation

GitHub Actions runs the fetch pipeline on a schedule and commits updated JSON back to the repo. GitHub Pages serves everything statically — no server, no database.

| Window | Schedule |
|---|---|
| Weekdays (8am–6:30pm AEST) | Every 30 minutes |
| Daily morning | Once at 7am AEST |
| Weekends | Every 8 hours |

The workflow uses `--force-with-lease` — prevents push rejections when a local push races with an Actions commit, without the safety risk of `--force`.

The AI briefing requires `ANTHROPIC_API_KEY` set as a GitHub Actions secret. Without it, the briefing step is skipped gracefully.

---

## Running locally

```bash
pip install feedparser
python3 fetch_cyber_news.py
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`. For the AI briefing:

```bash
export ANTHROPIC_API_KEY=your_key_here
python3 fetch_cyber_news.py
```

---

## Audit

```bash
python3 audit.py
```

114 checks across content integrity, HTML structure, CSS, JavaScript, Python, and workflow configuration. Run before committing.

---

## Design

| | Dark | Light |
|---|---|---|
| Background | `#0d0f14` | `#f4f1eb` |
| Accent | `#f5c842` yellow | `#0D3B66` navy |
| Critical | `#e07878` | `#b83a3a` |
| High | `#d4a84a` | `#8a6020` |

Fonts: Inter (body + headings) · Hack (technical/terminal data). WCAG AA contrast throughout.

---

**Tech:** Python · feedparser · Anthropic API · vanilla HTML/CSS/JS · GitHub Pages · GitHub Actions

*Started as a personal news aggregator. Got out of hand.*
