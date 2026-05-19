# pseudosec. — Decision Log

Tracks every meaningful design, structural, and technical decision made on this project.
Format: decision → why. Newest first within each session.

---

## Session: 2026-05-19 / 2026-05-20

### AI Guide — Prompt audience and tone
**Decision:** Prompts written for "I wouldn't even know how to do that" — complete beginners, not IT staff. Mix of security-awareness prompts (top threats for everyday office workers) and general productivity/day-to-day prompts (improve your day, handle basic tasks). Not a power-user guide.
**Why:** The site is for everyone. If the content assumes competence it doesn't help the people who most need it.

### AI Guide — Tool filter behaviour
**Decision:** Selecting a tool filters ALL visible prompts to that tool. Not a jump-to-section — the whole prompt set changes.
**Why:** User confirmed this directly. Cleaner interaction model: one tool selected = one context, everything scoped to it.

### AI Guide — Tool selector at top
**Decision:** AI Tools section lives at the top of `ai-guide.html`, not as a separate page or nav item.
**Why:** User selects their tool first (Claude, ChatGPT, Copilot, Gemini, Canva, Zoom), then sees prompts in that context. Tool-first ordering matches how people actually approach AI — they have a tool, they want to know what to do with it. Keeps nav at 4 items.

### Navigation — Flat nav, internal tabs
**Decision:** Main nav stays flat at 4 links. Pages with multiple sections (Reference, AI Guide) use internal JS show/hide tabs — one URL, content switches in place.
**Why:** Dropdowns are a pain on mobile, add JS complexity, and obscure structure. Internal tabs are simpler, more accessible, and easier to build on a static site.

### Essential Eight — Moved to Reference page
**Decision:** Removed Essential Eight from the dashboard sidebar. Will live on the Reference page alongside OWASP.
**Why:** It's reference/framework content, not live data. Sitting next to Tool Updates (dynamic, timely) was the wrong context. Sidebar should be dynamic content only.

### Sidebar — Tool Updates only, sticky
**Decision:** Sidebar is now Tool Updates only. Sticky positioning (`top: 70px`) so it stays in view while the main feed scrolls.
**Why:** Cleaner, more purposeful. Dynamic content in a dedicated panel. Sticky sidebar is better UX than a fixed-height trapped container.

### Page scroll — Natural scroll, no fixed-height feed
**Decision:** Removed `height: calc(100vh - 460px)` from `#articles-container`. Articles now flow naturally and the page scrolls through them all.
**Why:** The fixed-height container created a "you hit the bottom quickly" feeling. Natural scroll gives the feed room to breathe and feels less like a widget.

### Reference page — Replaces Definitions
**Decision:** `definitions.html` becomes `reference.html` (or renamed in nav to "Reference"). Contains: OWASP Top 10 (Web), OWASP API Top 10, OWASP LLM Top 10, Essential Eight, Glossary — as tabbed sections.
**Why:** Definitions alone is thin. Grouping all reference/educational content in one place gives users a single destination for "I need to understand something."

### OWASP scope — All three Top 10 lists
**Decision:** Include OWASP Web Top 10 (2021), API Top 10, and LLM Top 10.
**Why:** Site assists people using AI, so LLM Top 10 is directly relevant. API Top 10 rounds out the reference for developers and IT professionals.

### Featured story — AI-picked, stored in briefing.json
**Decision:** `generate_featured_article()` in fetch script uses Claude Haiku to pick the most notable article from each run and write a one-sentence pull quote. Stored as `featured` in `briefing.json`.
**Why:** "Most popular" requires analytics. Day-seeded random risks dull picks. AI editorial selection gives quality and daily refresh without a backend.

### Tracker blurb — 7 rotating messages, day-seeded
**Decision:** `count-voice` paragraph cycles through 7 pre-written messages picked by day-of-epoch. Same message all day, new one each day.
**Why:** User wanted it to feel like new content daily. Static array + date seed is zero-dependency, fully offline, consistent within a day.

### Tracker blurb — Tone direction A+B
**Decision:** Blurbs blend contextualising the counter range (A) with demystifying cybercrime as opportunistic/preventable (B). Not dramatic, not Matrix-thriller, not robotic.
**Why:** "From a $30 phishing text to a ransomware attack on a hospital" contextualises range. "Most of it isn't sophisticated" demystifies. Together they say something real without performative drama.

### Count numeral font — Inter, tabular
**Decision:** `count-num` uses `'Inter'` (not Space Grotesk or Hack), 52px bold, `font-variant-numeric: tabular-nums`.
**Why:** Space Grotesk has a dotted zero. Hack is a code font — wrong register for a hero counter. Inter has clean zeros. Tabular numerals prevent width-jitter as the count ticks up.

### Heading font — Space Grotesk
**Decision:** `h1–h4` use Space Grotesk (400–700, loaded from Google Fonts). Body stays Inter.
**Why:** Space Grotesk adds character to headings without competing with the logo. Geometric, modern, personality without quirk.

### Logo — No change to asset
**Decision:** The `pseudosec.png` logo stays as-is. The 3D extrusion is part of the brand.
**Why:** The converging perspective is inherent to the logo artwork. Header gap (column-gap removed, logo stays centred) addresses perceived crowding in CSS, not the image.

### Favicon — Branded SVG
**Decision:** Inline SVG favicon: dark rounded square (#0f0d0b), bold lowercase "p" in yellow (#f8ce2a) with orange (#e07830) offset shadow — mimics the logo's 3D extrusion at small scale.
**Why:** The shield emoji was completely off-brand. The "p" with orange shadow is recognisable at 16px and directly references the logo mark.

### Colour — Orange as secondary accent (#e07830)
**Decision:** `--orange: #e07830` added as a second accent token. Used for hover states, interactive moments, warning-adjacent UI. Distinct from `--accent` (yellow, reserved for active/selected states).
**Why:** Orange comes directly from the logo extrusion — it's already in the brand, just unused. Gives hover states warmth and creates a two-colour interactive language (yellow = selected, orange = hover/active).

### Colour — Dark theme backgrounds warmed
**Decision:** `--bg: #0f0d0b`, surface layers follow. Cold-blue-black (#0d0f14) replaced with warm near-black.
**Why:** Cold dark backgrounds fought the warm yellow/orange logo. Warm dark lets the brand colours breathe and feel intentional rather than dropped onto a generic dark theme.

### Colour — Light theme accent shifted to warm amber
**Decision:** Light mode `--accent: #c85200`, text family shifted from navy (#0D3B66) to warm dark brown (#1a1208).
**Why:** Navy on warm cream backgrounds (light mode) created a hot/cold clash. The brand identity is warm. Amber accent + warm brown text coheres with the logo's yellow/orange family.

### Tracker — Natural column height with sticky voice
**Decision:** `tracker-body` uses `align-items: stretch`. `count-voice` uses `margin-top: auto` to anchor to the bottom of the hero column. Hero column is `display: flex; flex-direction: column`.
**Why:** `align-items: start` left empty space at the bottom of the hero column when the CVE column was taller. Stretch + auto margin fills the gap purposefully — data at top, human voice at bottom.

### Tracker — Merged crime chart, human voice
**Decision:** Crime type distribution chart merged into the tracker section (`.tracker-crime`). Removed standalone `.crime-chart`. Added `.count-voice` paragraph with human-register writing.
**Why:** Two separate sections covering the same dataset felt redundant. Merged gives the tracker completeness. Human voice makes the counter feel real rather than just a number.

### Source quality — APPROVED_DOMAINS allowlist
**Decision:** Google News proxy articles only accepted if publisher is in `APPROVED_DOMAINS`. Direct RSS feeds always trusted.
**Why:** Broad Google News keyword queries pulled low-quality/irrelevant content. Allowlist ensures only credible, relevant publications reach the feed.

### File structure — Organised into subdirectories
**Decision:** `data/`, `scripts/`, `assets/`, `docs/` subdirectories. All JSON data files in `data/`, Python scripts in `scripts/`, images in `assets/`.
**Why:** Root was cluttered with a mix of HTML, CSS, JS, JSON, Python. Subfolders make the project navigable and separate concerns.

### Threat map — Replaced iframe with Threat Intel panel
**Decision:** Removed `cyberattackmap.net` iframe (unreliable, CSP issues). Replaced with 4-card curated Threat Intel panel linking to Cloudflare Radar, CISA KEV, ASD Advisories, Shodan.
**Why:** The external embed was flaky and blocked by CSP. Curated links are more reliable and more actionable. Cloudflare Radar embed can be swapped in later when the user retrieves the embed code.

### Header — 3-column CSS grid
**Decision:** `site-header` uses `grid-template-columns: 1fr auto 1fr` with logo centred in the auto column.
**Why:** Flex-based header couldn't reliably centre the logo. Grid gives explicit column control — nav fills left 1fr, logo sits in the auto centre column, utility buttons fill right 1fr.

---

## Pending decisions (open)

- **AI Guide tab names** — situation-based categories needed (current activity-based categories to be replaced)
- **AI Guide audience toggle** — "Everyone / Security-focused" toggle confirmed in concept, design TBD
- **Sidebar empty space** — Essential Eight removed, nothing replaced it yet. Could be stats, a "did you know" panel, or left as breathing room for Tool Updates
- **Cloudflare Radar embed** — user to retrieve embed code from Radar UI; swap into Threat Intel panel
- **Light mode** — still some rough edges, needs another pass
