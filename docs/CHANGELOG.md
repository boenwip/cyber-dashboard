# pseudosec. — Changelog

Decisions and changes, most recent first. The git log tells you *what* changed. This tells you *why*.

---

## November 2026 — Reference split: Essential Eight, Glossary, OWASP

**Added**
- Essential Eight (`essential-eight.html`): ASD's eight controls as one readable column, each with what it stops, plus links to ASD's guide and how it's changing
- Glossary (`glossary.html`): the searchable A to Z glossary on its own page. Shared `#letter-X` links still land on the letter
- OWASP Top 10s (`owasp.html`): the web, API and AI/LLM lists on one page, one after another, with jump links instead of tabs

**Changed**
- Reference (`reference.html`) is now a short list of the three pages. Old `reference.html#e8`, `#glossary`, `#letter-X` and `#owasp-*` links redirect to the right page
- `definitions.html` now redirects to `glossary.html`; the dashboard's Essential Eight and glossary links point to the new pages
- The word of the day no longer shows on Reference. It stays on the dashboard until the Learn hub takes it

**Removed**
- `reference.css` (its OWASP styles live on in `owasp.css`), the tab code in `definitions-page.js`, and the unused tab-button styles

---

## November 2026 — I've been scammed, and Check a breach

**Added**
- I've been scammed (`help.html`): what to do first, in order. It leads with "call your bank now" and the 24-hour Australian Cyber Security Hotline, then six numbered steps (stop contact, bank, secure accounts, report, ID support, watch for recovery scams) and a list of who to call, each with a tap-to-call button
- Check a breach (`breach.html`): the Have I Been Pwned check, then what to do if your email is in a breach, what to do if ID documents were leaked, and how to hear about future breaches

**Changed**
- Resources no longer holds the breach check or the report links. A "Need help now?" section points to the two new pages
- The National Anti-Scam Centre card is gone: it explained the centre rather than giving a reader something to do, and Scamwatch reports feed it anyway

---

## November 2026 — This year page

**Added**
- This year has its own page (`year.html`): ASD's Annual Cyber Threat Report in one readable column. It opens with the running estimate of cybercrime reports since 1 July, in lemon, with how it's worked out. Then the headline figures, the most reported crimes, all three breakdowns as bar charts (techniques, states, sectors), what the report says about AI, and a link to the full report
- All three breakdowns are shown in full. The old dashboard showed the first three rows of two of them

**Changed**
- This year in the menu, the tab bar and the home page's report count now go to the new page. Old `#year` links redirect there

---

## November 2026 — All stories page

**Added**
- All stories has its own page (`stories.html`): every story in the feed, newest first, grouped by day ("Today", "Yesterday", then the date), in one readable column. Each story shows its topic, source and time, the headline, the full summary, and the other outlets that covered it, behind "Also covered by"
- Filters for Cyber, Scams, AI and tools, ACSC alerts, Compliance and Tool updates, each with a count. The filter is in the address (`stories.html#scams`), so it can be shared. On phones the filters scroll sideways
- `docs/site-map.md`: the agreed site map. Pages are grouped into Today, Play, Stay safe and Learn, with a Get help button on every page

**Changed**
- The home page's "All stories" button goes to the new page. Old `#news`, `#alerts` and `#tools` links redirect there

---

## November 2026 — Exploited page (redesign step 4)

**Added**
- Exploited right now has its own page (`exploited.html`): the newest flaws on CISA's Known Exploited Vulnerabilities list, grouped by the day they were added. The latest day's flaws are chocolate tiles, older ones plain. Each shows the product, the CVE number, what the flaw does, CISA's fix-by date, and whether it's known to be used in ransomware, and links to the details on NVD
- A lemon summary beside the list says how many were added in the last 7 days, what the list is, and what to do about it. On wide screens it stays in view as you scroll

**Changed**
- Exploited in the menu, the tab bar and the home page's link now go to the new page. Old `#cve` links redirect there

---

## November 2026 — Play page (redesign step 3)

**Added**
- Spot the scam has its own page, Play (`play.html`). The day's message sits in a frame with the question beside it on wide screens, and stacks on phones
- Find the clues: tap anything in the message that looks suspicious before you decide. The answer then numbers every giveaway, marks the ones you found in lemon and the ones you missed with an orange dashed line, and says how many you spotted
- Swoop perches on the message. He hops when you're right and tilts his head when you're wrong

**Changed**
- Play in the menu, the tab bar and the home page's "Today's puzzle" link now go to the new page. Old `#scams` links redirect there
- Your streak and rank carry over from the old puzzle

---

## November 2026 — Lemon and chocolate

**Changed**
- New colours, chosen by the owner in a live playground: lemon (#FFE14D) for the lead story, chocolate (#4A2F25) for the other tiles and buttons, the logo's orange (#E8692C) as the small accent on cursors and hovers, on a warm grey page (#EBE7E1)
- Topics are now a small coloured dot beside the label, so no single topic colours the page
- A block cursor in the logo's orange follows the page heading, and marks the current page in the menu

**Fixed**
- Swoop no longer disappears in dark mode: his colours flip there (light body, dark patches)

---

## November 2026 — New home page (redesign step 2)

**Changed**
- The home page now does one job: today's top 5 stories, as rounded tiles in one pastel per topic (butter for cyber, coral for scams, periwinkle for AI, mint for ACSC). The lead takes a big tile, the other four sit beside it, and all five fit on one screen. The ACSC alert bar shows only when there is an alert. One row links on to exploited bugs, today's puzzle and the year's report count
- Swoop is the lookout on the lead story. His mood follows the real ACSC alert: calm, alert, or one swoop across the page for a critical or high alert. He moves once on load, then only when you hover or tap him, and stays still under reduced motion
- Every page has a cool concrete background (#E6E8E5) and a plain header. The menu marks where you are with the logo's cursor
- The site's font is now Geist, with Geist Mono for dates and IDs, both self-hosted. Host Grotesk and Spline Sans Mono are removed
- On phones a tab bar sits at the bottom: Today, Play, Exploited, This year, More. More opens the full menu. It replaces the menu button in the header
- The old topic dashboard moved to `dashboard.html` until its pages are rebuilt. Old links such as `#scams` and `#cve` on the home page go there

---

## November 2026 — Lean cleanups

**Changed**
- One list of blocked headline words instead of two overlapping ones. Same headlines are dropped as before
- One date parser for the site's ISO dates, shared by the fetch and grouping scripts
- Removed an empty comment header, a repeated import, and a comment that still described the old Google News check

---

## November 2026 — Quick fixes from the review

**Fixed**
- OWASP Top 10: A01 and A02 quote OWASP's 2025 figures. The glossary no longer says Zero Trust is mandated for federal agencies
- The "AU Cyber" filter is now "Cyber", since it covers cyber news from anywhere
- Home page: fast arrow keys on the topic tabs no longer leave focus on a different tab from the one shown. Picking a filter keeps focus on it. Escape on a phone returns to the story list with focus on the story. "1 story this week" reads correctly. The three stories under the lead show their latest coverage date
- On narrow phones, the "This year" tab no longer wraps its cursor onto a second line
- Reference: A–Z glossary links still open the glossary after a reload or when shared. The tabs work with the arrow keys, and still work if the glossary fails to load
- Copy buttons fall back to another copy method when the browser refuses clipboard access

---

## November 2026 — Unrelated stories no longer merged

**Fixed**
- Stories grouped together must now name something in common, such as a company, product or figure. Before, unrelated stories were sometimes shown as one story covered by two outlets. A few real pairs that share no name may now appear as two stories

---

## November 2026 — More sources reach the news feed

**Fixed**
- ACSC alerts reach the site again when ACSC's own feeds time out. Google News started labelling them "cyber.gov", and the site was dropping every one
- The Guardian and The Register appear again. A publisher check that matched words in headlines rejected them and could let unapproved sites through; it now checks the publisher's website
- Troy Hunt's posts appear again. Most have no tag keyword in the title, so they were filtered out
- Scamwatch alerts appear. The search returned old pages from 2015–2024 instead of recent alerts
- ABC iview TV episode pages no longer appear as news

**Changed**
- The tool-update searches no longer have "2026" written into them, so they keep working next year
- The alert bar says "No ACSC alerts found" rather than "No ACSC alerts", and says when alerts can't be loaded

---

## November 2026 — Report breakdown uses only 2025–26 figures

**Changed**
- The home page panel and Report figures no longer show the 2024–25 crime-type percentages. The 2025–26 report names the most reported types without percentages, so they now appear in words, next to the breakdowns it does publish: techniques seen in incidents, cybercrime reports by state, and incidents by sector

---

## November 2026 — New look across the site

**Changed**
- The home page now shows one topic at a time, each in its own colour, instead of a grid of panels
- A switch of five topics stays in reach while you read; changing topic spreads blocks of the logo's cursor across the screen
- The reader below the stage replaces the explorer. ACSC alerts and tool updates are now filters under News
- Spot the Scam gets its own screen, with its streak, ranks and sharing kept
- Swoop, a small pixel magpie, stands above the open topic
- Reference, Resources, AI Guide and Sources take the same look: one colour per page, big plain headings, thin rules instead of cards, content in a central column on large monitors

---

## October 2026 — ASD Annual Cyber Threat Report 2025–26

**Changed**
- Tracker rate, headline stats and report link updated to the 2025–26 report (82,000+ reports, one every 6 minutes; 1,500+ incidents ↑20%; business average $93,500 ↑16%; individual average steady at $33,000; 37,500+ hotline calls ↓12%; 564M+ domains blocked)
- Crime-type chart keeps the 2024–25 percentages, now labelled with their own year: the 2025–26 report names the top types but publishes no percentages
- Report watcher also checks ASD's new `/publication/annual-cyber-threat-report-YYYY-YY` URL (this year it only found the report through the Google News fallback)
- Ransomware glossary entry quotes the 2025–26 report

**Added**
- "What the report says about AI" in the This year explorer: the report's central theme, in plain language, with the related phishing and vulnerability figures (from the optional `ai` block in `annual_report.json`)

---

## September 2026 — Review fixes

**Fixed**
- Tracker rolls over each 1 July (it was still counting FY2025–26 in FY2026–27)
- iTnews no longer blocked (hostname-based blocklist); ACSC alerts no longer dropped
- Threat badges only on ACSC items, from ACSC's own severity; no invented CVE severity
- Stored-XSS path through feed summaries; every render now escapes via `esc()`/`safeUrl()`
- CSP: no `'unsafe-inline'` scripts, duplicate `frame-src` removed
- Dates correct during daylight saving (ISO UTC stored, Sydney time displayed)
- Tracker stats and crime chart corrected against the ASD 2024–25 report
- AI tool privacy summary corrected (Claude consumer plans train unless opted out; ChatGPT Plus too)
- OWASP A01/A08/A09, LLM03, Essential Eight app hardening, and five glossary entries corrected
- Text contrast meets WCAG AA in both themes; counter no longer announced every 6 seconds
- Broken tool icons (3 of 6 returned 404) replaced

**Added**
- New dashboard: bento overview whose panels open a split-view explorer; light/dark toggle; new soft visual style across all pages
- One entry per story: the same news from different outlets grouped by AI (Claude Haiku), led by the most reputable outlet; follow-ups stay separate; US$3/month cap
- Centred logo; lighter phone layout with news near the top and a tap-through explorer
- ACSC items via a Google News fallback when cyber.gov.au is unreachable from GitHub
- ACSC Critical/High alert banner; CISA fix-by dates on CVEs
- Theme follows the OS setting until chosen; no theme flash on load
- Pipeline tests, a rewritten audit, and a CI workflow
- Deploys via GitHub Actions; feed data kept on a `data` branch instead of `main`; empty fetches keep the previous data
- AI Guide: 47 tool-agnostic prompts rewritten for safety and accuracy, plus a "Writing your own prompt" guide
- `data/annual_report.json`: single source for all ASD report figures, plus a daily watcher that opens an issue when the next report is published

**Removed**
- AI Guide tool filter, per-tool cards and Zoom/Copilot/Canva-specific prompts
- RTO/VET, EdTech and Education targeting (site is for anyone); unused audience/relevance fields
- Unused AI briefing generation (and the API key), weather widget, non-working breach checker, threat-intel toggle, reading time, robots.txt (ignored under a sub-path)

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

**Dark theme accent** — changed from slate blue (`#7E9DC4`) to yellow (`#f8ce2a`). Matches brand logo. Dark background later warmed from cold `#0d0f14` to `#0f0d0b` so it wouldn't fight the warm yellow/orange logo.

**Light theme accent** — initially navy (`#0D3B66`) on warm parchment (`#f4f1eb`); revised to amber (`#c85200`) with warm brown text (`#1a1208`) — navy on the warm cream background created a hot/cold clash against the logo's warm palette.

**IBM Plex Mono added** — used for all technical content: CVE IDs, timestamps, stat numbers, source labels, code elements. Distinguishes data from prose. Replaced by Hack (commit `85b06f3`, 2026-05-12, "Inter + Hack font system") — headings moved to Space Grotesk in the same font pass, Fraunces removed entirely.

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

**7-day feed window** — articles older than 7 days excluded from feed display (JS-side, `dashboard.js`). Storage window in `news.json` (Python-side) was originally 90 days, then reduced — currently 14 days (commit `280e02d`, 2026-05-12, "shrink news.json"), not 30.

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
| Amber #c85200 on light theme | Initial navy #0D3B66 clashed (hot/cold) against warm parchment background and logo; amber coheres with the yellow/orange brand palette |
| Hack for technical text (was IBM Plex Mono) | Differentiates data from prose; gives dashboard aesthetic |
| Space Grotesk for headings (Fraunces removed) | Adds character to headings without competing with the logo; geometric, modern |
| Clickable tags over filter bar | More intuitive; less visual noise; filters are contextual |
| AI briefing server-side only | API key never exposed to browser; cost controlled |
| `--force-with-lease` in workflow | Prevents push rejection without the safety risk of `--force` |
| Removed "Good News" topic tag | Was matching unrelated articles (power price rises); no reliable signal |
| Removed Schneier on Security | US-focused; no Australian content relevance |
| 7-day feed display window | Keeps feed urgent and current; 14-day storage window in `news.json` for history |
