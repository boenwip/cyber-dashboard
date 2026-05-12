# pseudosec. — Changelog

Decisions and changes, most recent first. The git log tells you *what* changed. This tells you *why*.

---

## May 2026 — Multi-page rebuild

### Architecture

**Split into four pages**
- `index.html` — dashboard (renamed from `dashboard.html`)
- `definitions.html` — cyber security glossary
- `resources.html` — breach checker and links
- `ai-guide.html` — prompt library and AI safety
- `shared.css` / `shared.js` — design system and utilities shared across all pages

**Decision:** single-page approach was holding back feature development. Filters were persisting across "pages" because everything was on one page. Each section now has its own scope, its own JS, and its own purpose.

### Features added

**Word of the day** — deterministic daily rotation through 51 terms. Uses AEST date to ensure same term for all users on the same day. Displays in a centred strip below the header.

**AI daily briefing** — generated via Anthropic API in GitHub Actions, saved as `briefing.json`. Runs server-side — no API key exposed to browser. Deduplicates clustered stories before summarising. Falls back to hidden panel if no briefing available.

**Scam of the week** — surfaces most recent ScamWatch article automatically. Hidden if no scam articles in feed.

**Clickable tag filters** — removed the separate filter bar entirely. Tags on each article are clickable and trigger filtering. Active filters shown in a slim bar above the feed with one-click clear.

**51 cyber security definitions** — mix of beginner and intermediate. Each has: short definition, full explanation, real-world example, difficulty level badge. Searchable, filterable by level, A-Z indexed.

**HIBP breach checker** — email breach lookup on resources page. Read-only, not stored. Privacy disclaimer on-page. Graceful fallback if HIBP API blocks browser requests (redirects to haveibeenpwned.com directly).

**25+ AI prompts** — across writing, email, learning, admin, security categories. Each copyable with one click. Clipboard API with execCommand fallback for older browsers.

**Reading time on articles** — estimated from word count at 220wpm. Shown in article meta row.

### Design system changes

**Colour system rationalised** — down from 79 unique colour values to a clean 4-level text hierarchy:
- `--text` primary (14:1 contrast)
- `--text-2` secondary (8:1)
- `--text-3` tertiary (4.8:1 — WCAG AA minimum)
- `--text-4` disabled/decorative only

**Dark theme accent** — changed from slate blue (`#7E9DC4`) to yellow (`#f5c842`). Matches brand logo.

**Light theme accent** — changed to navy (`#0D3B66`) on warm parchment (`#f4f1eb`).

**IBM Plex Mono added** — used for all technical content: CVE IDs, timestamps, stat numbers, source labels, code elements. Distinguishes data from prose.

**Logo** — transparent PNG, 44px height in header. Black background removed programmatically.

**Sticky header** — header is now `position: sticky` so nav is always accessible.

### Tracker changes

**Removed four-tab structure** — FY2025-26, FY2024-25, Threat Map, Cyber Awareness tabs eliminated. Replaced with a single 3-column panel: live counter / key stats / CVE feed.

**Report summary strip** — FY2024-25 key stats condensed to a single line strip with link to full ACSC report.

**Threat Map** — now a header button that toggles an inline iframe section. Removed from tabs.

**Cyber Awareness** — moved to dedicated resources.html page.

### CVE panel

**Switched from CIRCL to CISA KEV** — CIRCL was returning CVEs from 1999 sorted by CVSS score. CISA KEV catalog contains only actively exploited vulnerabilities, sorted by date added. Far more relevant.

**Ransomware flag** — CVEs known to be used in ransomware campaigns marked with ⚠ indicator.

**10 CVEs fetched, 3 visible** — scrollable panel with max-height constraint.

### Feed changes

**Sources added:** CyberDaily AU, Dark Reading (AU-filtered), 404 Media (AU-filtered), Risky Business, Microsoft 365 tool updates

**Sources removed:** Schneier on Security (US-only), SBS News (too broad), ABC News Business (fuel/commodity stories not relevant), Guardian Australia broad feed (replaced with AU cyber-filtered Google News query)

**Blocklist tightened:** added tabloid and clickbait domain blocklist. Murdoch/News Corp, Nine Entertainment, Seven West Media, vocal.media, buzzfeed, ladbible, loyaltylobby excluded.

**7-day feed window** — articles older than 7 days excluded from feed display. 30-day window for storage in `news.json`.

### Bug fixes

**Ticker null crash** — `tickerEl` reference was crashing JS before `loadData()` could run, causing nothing to load. Removed ticker entirely, wrapped init in `DOMContentLoaded`.

**Dollar signs stripped** — bash heredoc was interpolating `$80,850` and `$36,633` as shell variables. Fixed by writing files via Python instead of heredoc.

**AEST timestamps** — all `datetime.datetime.now()` calls replaced with `datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=10)))` to ensure timestamps are AEST on GitHub Actions UTC runners.

**Nested CVE JSON** — CIRCL was returning data that got double-wrapped. Fixed with isinstance guard.

**Stat strip null crash** — `updateStatStrip` was calling getElementById on elements that don't exist. Replaced with null-safe `setEl()` wrapper.

### Workflow

**`--force-with-lease`** — added to workflow push to prevent rejection when local push races with Actions commit.

**`briefing.json` added** to workflow committed files.

**`ANTHROPIC_API_KEY`** passed as GitHub Actions secret. Not hardcoded anywhere.

---

## April 2026 — Initial build

### Architecture

Single-page dashboard (`dashboard.html`) with Python RSS aggregation pipeline.

**Tech stack:** Python + feedparser, vanilla HTML/CSS/JS, GitHub Pages, GitHub Actions

**Decision to avoid frameworks:** Python is being learned concurrently — the project serves double duty as coursework and portfolio. Keeping JS vanilla and Python simple means the builder understands every line.

### Initial features

- Live cybercrime counter (ACSC rate-based projection from 1 July 2025)
- News feed with topic/threat/audience/relevance tagging
- Crime type distribution bar chart (ACSC 2024-25 data)
- Tool updates sidebar (Google Workspace, Chrome, Asana, Zoom, ChatGPT, Canva)
- Dark/light theme toggle
- Filter pills: topic, audience, relevance, threat level

### Data sources (initial)

Zone 1 — News: ACSC, ScamWatch, AU Cyber Security Magazine, Security Brief AU, iTnews, ABC Tech, Troy Hunt Blog, Google News AU queries

Zone 2 — Tools: Google Workspace, Chrome, Asana, Zoom, ChatGPT, Canva

### Stats (verified against ACSC Annual Cyber Threat Report 2024-25)

- 84,700 cybercrime reports FY24-25
- One report every 6 minutes
- $80,850 avg business loss (↑50%)
- $36,633 avg individual loss (national — not NSW $33k which was initially wrong)
- 42,500+ calls to Cyber Security Hotline
- 1,200+ significant incidents (↑11%)
- 334M malicious domains blocked (↑307%)

---

## Decisions log

| Decision | Rationale |
|---|---|
| No frameworks (React, Vue etc.) | Learning Python concurrently — vanilla keeps it understandable |
| GitHub Pages over Netlify/Vercel | Free, simple, already using GitHub Actions |
| CISA KEV over CIRCL/NIST NVD | CIRCL returned 1999 CVEs; NVD rate-limits aggressively; CISA KEV is curated and current |
| Yellow accent on dark theme | Matches brand logo; distinctive in the space; high contrast |
| Navy #0D3B66 on light theme | Requested by project owner; professional, readable |
| IBM Plex Mono for technical text | Differentiates data from prose; gives dashboard aesthetic |
| Fraunces for display text | Editorial quality; distinctive; works at both large and small sizes |
| Clickable tags over filter bar | More intuitive; less visual noise; filters are contextual |
| AI briefing server-side only | API key never exposed to browser; cost controlled |
| `--force-with-lease` in workflow | Prevents push rejection without the safety risk of `--force` |
| Removed "Good News" topic tag | Was matching unrelated articles (power price rises); no reliable signal |
| Removed Schneier on Security | US-focused; no Australian content relevance |
| 7-day feed window | Keeps feed urgent and current; 30-day storage window for history |
