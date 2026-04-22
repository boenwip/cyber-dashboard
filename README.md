# Cyber & Sector Awareness Dashboard

A live cyber security and sector intelligence dashboard built for Australian RTO/VET professionals. Aggregates news from Australian government, cyber security and sector sources — filtered, tagged, and updated automatically.

**Live dashboard:** https://boenwip.github.io/cyber-dashboard/dashboard.html

---

## What it does

**Stat strip** — live counts pulled from loaded data on every page load: ACSC updates this week, new articles in the last 12 hours, total tracked, scam notices, and the ACSC average SMB loss figure ($80,850 per incident).

**News feed** — capped at 20 most recent articles with internal scroll. Credible sources only — tabloid and clickbait domains are blocked automatically.

**Threat tracker** — four tabs:
- FY 2025–26 live projection (counting from 1 July 2025, based on ACSC rate of 84,700 reports/year)
- FY 2024–25 official ACSC Annual Report statistics with crime type distribution chart
- Live threat map links (Kaspersky, Check Point, Fortinet — tabbed, open in new tab)
- Cyber Awareness — six tip cards covering scams, phishing, passwords, safe browsing, AI safety, reporting

**Quick views** — Everything, For Me, Industry, Critical Now, ⚠ Scam Watch, ✦ Good News

**Filter system** — topic, audience, relevance and threat level pills

**Tool updates sidebar** — Google Workspace, Chrome, Asana, Zoom, ChatGPT, Canva

**Two themes** — light default (warm parchment) and dark (deep navy-black)

---

## Tagging system

| Dimension | Values |
|---|---|
| Topic | AU Cyber, RTO / VET, Education, EdTech, AI & Tools, Scams, Compliance, Good News |
| Threat level | Critical, High, Medium, Advisory |
| Audience | Small Business, Enterprise, Consumer, Critical Infrastructure |
| Relevance | Direct, Sector, AU General, Global |

---

## News sources

### Zone 1 — News feeds

| Source | Focus |
|---|---|
| ACSC Updates | Australian government cyber advisories |
| ACSC Advisories | Australian government advisories |
| Google News — ScamWatch | Official scam alerts |
| Australian Cyber Security Magazine | AU cyber industry |
| Security Brief Australia | AU enterprise security |
| iTnews | AU enterprise IT |
| ABC News Business | National business and tech |
| SBS News | National news |
| The Guardian Australia | Independent Australian news |
| Google News — AU Cyber | Cyber attack and data breach |
| Google News — AU Scams | Australian scam and fraud |
| Google News — ASQA / RTO | VET sector and compliance |
| Google News — VET Workforce | Skills and training workforce |
| Google News — VET Funding & Policy | Funding and policy |
| Google News — AI & EdTech | AI in education |
| Google News — AI Workforce | AI impact on workforce |
| Google News — Privacy & Compliance | Privacy Act and regulatory |
| Google News — AU Cyber Wins | Positive cyber outcomes |
| Google News — AI Progress | Positive AI developments |

### Zone 2 — Tool feeds

| Source | Tool |
|---|---|
| Google Workspace Updates | Google |
| Chrome Releases | Google |
| Asana Product Blog | Asana |
| Zoom Blog | Zoom |
| Google News — ChatGPT Updates | AI Tools |
| Google News — Canva Updates | Canva |

### Source blocklist

Murdoch/News Corp, Nine Entertainment, Seven West Media, and clickbait domains are automatically excluded — 7news, 9news, news.com.au, heraldsun, dailytelegraph, couriermail, skynews, theaustralian, foxnews, dailymail, vocal.media, buzzfeed, ladbible, loyaltylobby, and others.

---

## Automation

**Schedule:**
- Weekdays 8am–7pm AEST — every 30 minutes
- Nightly 11pm AEST — overnight refresh
- Weekends — every 6 hours

GitHub Actions runs `fetch_cyber_news.py` and commits updated JSON back to the repo automatically.

---

## Colour palette

| | Light (default) | Dark |
|---|---|---|
| Background | #F5F2EC | #13141A |
| Surface | #FDFAF5 | #1C1E26 |
| Accent | #3D6B9E slate blue | #7E9DC4 |
| RTO / VET | #6B4A9E purple | #9B78C8 |
| Critical | #A8443E | #C8706A |
| Teal / scam | #3A7A6E | #6BA898 |
| Amber / high | #8C6E2A | #C4A35A |

---

## Project structure

```
cyber-dashboard/
├── dashboard.html              # Frontend
├── fetch_cyber_news.py         # Python pipeline
├── news.json                   # Auto-generated
├── tool_updates.json           # Auto-generated
├── .github/workflows/
│   └── fetch_news.yml          # Actions schedule
└── README.md
```

---

## Running locally

```bash
pip install feedparser
python fetch_cyber_news.py
python -m http.server 8000
# Open http://localhost:8000/dashboard.html
```

---

## Planned

- Permanent Actions fix — git pull before commit to prevent JSON conflicts
- Left sidebar navigation
- CVE feed panel (NIST NVD, High/Critical only)
- Resources — Learn & Awareness page
- Resources — IT Tools page (Shodan, OSINT, cheat sheets)
- AI Guide page (prompt library, safety tips, model updates)
- Background mesh — Canva asset (bg-dark.png, bg-light.png)
- ASQA dedicated page

---

## Tech

Python · feedparser · vanilla HTML/CSS/JS · IBM Plex Sans + Fraunces · GitHub Pages · GitHub Actions

---

*Built alongside a Python university course. Started as a personal cyber news aggregator — evolving into a staff resource for Skills Generation, an Australian RTO delivering traineeships, VET in Schools, and regional training programs.*
