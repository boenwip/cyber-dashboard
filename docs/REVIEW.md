# pseudosec. — Review Process

Every change goes through this checklist before it ships. No exceptions.

The five lenses exist because each catches different things. A senior engineer won't notice that "Loading..." is a bad first impression. A UX designer won't notice a missing `rel="noopener"`. Run all five every time.

---

## How to use this

Before any `git push`:

1. Work through each lens below
2. Mark each item ✓ (pass), ✗ (fail — fix before shipping), or N/A
3. All items must be ✓ or N/A before committing
4. If something fails, fix it, re-run the automated audit, then re-check

For code changes, run the automated checks first (CI runs the same on every push/PR):

```bash
python3 -m pytest tests
python3 scripts/audit.py
```

Then work through the human lenses.

---

## Lens 1 — End User

*Imagine someone who has never seen this site, is not technical, and found it via a link from a colleague.*

- [ ] Does the page load within 3 seconds on a normal connection?
- [ ] Is it immediately clear what this site is and who it's for?
- [ ] Are all panels showing real content — not "Loading...", "—", or empty states?
- [ ] Does clicking every interactive element do something visible?
- [ ] Are article titles readable and not truncated awkwardly?
- [ ] Does the theme toggle work in both directions?
- [ ] Is the mobile layout usable on a phone?
- [ ] Are all external links opening in a new tab?
- [ ] Is the word of the day showing a real term, not a dash?
- [ ] Are the ACSC alert and scam callouts either hidden or showing real content?

**Fail conditions:** anything that would make a non-technical person think the site is broken.

---

## Lens 2 — Investor / Leadership

*Imagine someone evaluating this as a product or portfolio piece. They spend 30 seconds on it.*

- [ ] Does the branding look intentional and consistent across all pages?
- [ ] Are the statistics accurate, sourced, and labelled with the right measure (e.g. per individual vs overall)?
- [ ] Does the live tracker convey urgency and relevance?
- [ ] Is the value proposition clear without needing to scroll?
- [ ] Does "Today's Story" (when present) read as credible and relevant?
- [ ] Are all four pages reachable from the navigation?
- [ ] Does the site look like something that required real effort to build?
- [ ] Is there no obvious placeholder content ("Coming soon", "Lorem ipsum", etc.)?
- [ ] Does the logo display correctly — transparent background, correct size?

**Fail conditions:** anything that undermines credibility in the first 30 seconds.

---

## Lens 3 — Senior Software Engineer

*Code quality, correctness, and maintainability.*

**HTML**
- [ ] All pages have DOCTYPE, lang="en", meta description, canonical, favicon (audit checks)
- [ ] The only inline script is the `<head>` theme snippet, and its hash is in the CSP (audit checks)
- [ ] All external links have `rel="noopener noreferrer"` and `target="_blank"` (audit checks)
- [ ] Interactive things are real `<button>`s / `<a>`s — no clickable spans, no buttons inside links
- [ ] `aria-live` only on regions that change because of the user — never on something that updates on a timer
- [ ] Scripts loaded at end of body, in correct order (shared.js → definitions.js → page.js)

**CSS**
- [ ] No `@import` or third-party URLs (audit checks)
- [ ] Colours come from theme tokens, so they work in both themes
- [ ] No dead selectors referencing removed elements
- [ ] Mobile breakpoints tested at 768px and 480px

**JavaScript**
- [ ] Every value from `data/*.json` goes through `esc()` (text) or `safeUrl()` (links) before it reaches an HTML string
- [ ] Prefer `textContent` over `innerHTML` when there is no markup
- [ ] `DOMContentLoaded` wraps all init calls
- [ ] No `eval()`, no `document.write()`
- [ ] Graceful error handling on all `fetch()` calls
- [ ] Loading states never left visible if data fails — panels hide or show fallback

**Python**
- [ ] Syntax valid (`python3 -c "import ast; ast.parse(open('fetch_cyber_news.py').read())"`)
- [ ] Stored dates are ISO 8601 UTC — never a fixed +10 offset (Sydney has daylight saving)
- [ ] Feed text is stored as plain text (`strip_html()`), never HTML
- [ ] New filtering/tagging behaviour has a test in `tests/`
- [ ] All HTTP requests have timeout and User-Agent set

**Fail conditions:** any syntax error, unbalanced brackets, or security issue.

---

## Lens 4 — Senior UX Designer

*This is the most important lens. Design is the first thing people experience.*

**Visual hierarchy**
- [ ] The most important information is visually dominant — not buried
- [ ] Section labels are visually subordinate to their content
- [ ] Font sizes create a clear hierarchy (display → heading → body → meta)
- [ ] Severity colours only appear where a real source gave a severity (ACSC alerts) — never guessed

**Spacing and layout**
- [ ] Consistent horizontal padding throughout (40px desktop, 20px mobile)
- [ ] Nothing feels edge-to-edge or cramped
- [ ] Bento panels and explorer work at 1300px, 960px and phone width
- [ ] The CVE panel scrolls cleanly with max-height respected

**Interaction design**
- [ ] Every clickable element has a visible hover state
- [ ] Tags on articles respond visibly when clicked
- [ ] Active filters are visible and dismissible with one click
- [ ] The theme toggle is reachable and labelled

**Typography**
- [ ] Body text is readable at current size (no smaller than 13px for secondary text)
- [ ] Spline Sans Mono only for small technical data (dates, IDs); Host Grotesk for everything else
- [ ] No emoji icons, tiny letter-spaced capitals, hairline borders or accent rails
- [ ] Text tokens meet WCAG AA 4.5:1 on every surface (audit checks)

**Empty and loading states**
- [ ] No panel shows "Loading..." permanently — all panels hide gracefully if data is absent
- [ ] The word of the day either shows a real term or is hidden — never shows "—" or "Loading..."
- [ ] The scam callout is hidden until it has real content
- [ ] The "Today's Story" card stays hidden if no featured article is available

**Cross-theme**
- [ ] Light and dark themes both checked; the header toggle switches and remembers
- [ ] All text meets contrast ratios in both themes
- [ ] Theme preference persists across page navigation

**Fail conditions:** anything that makes the design look unfinished, inconsistent, or inaccessible.

---

## Lens 5 — DevSecOps

*Security, deployment integrity, and automation reliability.*

**Secrets and credentials**
- [ ] No secrets in any committed file (the pipeline needs none)
- [ ] Workflows declare least-privilege `permissions:` and pin actions to commit SHAs

**Content security**
- [ ] CSP has no `'unsafe-inline'` in `script-src` and no duplicate directives (audit checks)
- [ ] No new third-party hosts — if one is truly needed, add it to the CSP deliberately
- [ ] No `eval()` in any JavaScript (audit checks)

**Deployment**
- [ ] All files referenced in HTML exist (audit checks local links and assets)
- [ ] New public files are copied into `_site` by the "Assemble site" step in `deploy.yml`
- [ ] GitHub Pages source is set to **GitHub Actions**; the `data` branch is only written by `deploy.yml`

**JSON data files**
- [ ] `news.json` is present and not empty
- [ ] `cve.json` is present and not empty
- [ ] `tool_updates.json` is present and not empty
- [ ] Dates in all JSON files are ISO 8601 UTC (audit checks)

**Fail conditions:** any exposed secret, missing file, or broken deployment.

---

## Automated audit

Run before every ship:

```bash
python3 -m pytest tests
python3 scripts/audit.py
```

`tests/` covers the pipeline (blocklist, ACSC handling, tagging, sanitising, dates, KEV). `audit.py` covers the site (local links, CSP and inline-script hash, no third-party hosts, AA contrast from the real tokens, data schema). Both must pass before the human lenses.

---

## Sign-off

| Lens | Status | Notes |
|---|---|---|
| End User | | |
| Investor / Leadership | | |
| Senior Engineer | | |
| Senior UX Designer | | |
| DevSecOps | | |

**Ship when:** all five rows show ✓ Pass.
**Do not ship if:** any row shows ✗ Fail — fix and re-review.
