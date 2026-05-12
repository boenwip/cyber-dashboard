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

For code changes, run the automated audit first:

```bash
python3 audit.py
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
- [ ] Is the scam callout either hidden or showing real content (never showing "—")?

**Fail conditions:** anything that would make a non-technical person think the site is broken.

---

## Lens 2 — Investor / Leadership

*Imagine someone evaluating this as a product or portfolio piece. They spend 30 seconds on it.*

- [ ] Does the branding look intentional and consistent across all pages?
- [ ] Are the statistics accurate and sourced?
- [ ] Does the live tracker convey urgency and relevance?
- [ ] Is the value proposition clear without needing to scroll?
- [ ] Does the AI briefing (when present) read as credible and useful?
- [ ] Are all four pages reachable from the navigation?
- [ ] Does the site look like something that required real effort to build?
- [ ] Is there no obvious placeholder content ("Coming soon", "Lorem ipsum", etc.)?
- [ ] Does the logo display correctly — transparent background, correct size?

**Fail conditions:** anything that undermines credibility in the first 30 seconds.

---

## Lens 3 — Senior Software Engineer

*Code quality, correctness, and maintainability.*

**HTML**
- [ ] All pages have DOCTYPE, lang="en", meta description, favicon
- [ ] No inline `<style>` or `<script>` blocks
- [ ] All external links have `rel="noopener noreferrer"` and `target="_blank"`
- [ ] ARIA labels on interactive elements
- [ ] `aria-live` on dynamic content regions
- [ ] Scripts loaded at end of body, in correct order (shared.js → definitions.js → page.js)

**CSS**
- [ ] All CSS files have balanced braces (run `audit.py` to verify)
- [ ] No hardcoded pixel values that should be CSS variables
- [ ] No dead selectors referencing removed elements
- [ ] Mobile breakpoints tested at 768px and 480px

**JavaScript**
- [ ] No backticks (GitHub Pages truncation risk)
- [ ] All braces and parens balanced
- [ ] All dynamic content HTML-escaped before insertion (`replace(/</g,'&lt;')`)
- [ ] All external `href` values validated (`indexOf('http') === 0`)
- [ ] `DOMContentLoaded` wraps all init calls
- [ ] No `eval()`, no `document.write()`
- [ ] Graceful error handling on all `fetch()` calls
- [ ] Loading states never left visible if data fails — panels hide or show fallback

**Python**
- [ ] Syntax valid (`python3 -c "import ast; ast.parse(open('fetch_cyber_news.py').read())"`)
- [ ] All timestamps use AEST offset (`datetime.timezone(datetime.timedelta(hours=10))`)
- [ ] No bare `datetime.datetime.now()` for displayed timestamps
- [ ] API key loaded from environment, never hardcoded
- [ ] All HTTP requests have timeout and User-Agent set

**Fail conditions:** any syntax error, unbalanced brackets, or security issue.

---

## Lens 4 — Senior UX Designer

*This is the most important lens. Design is the first thing people experience.*

**Visual hierarchy**
- [ ] The most important information is visually dominant — not buried
- [ ] Section labels are visually subordinate to their content
- [ ] Font sizes create a clear hierarchy (display → heading → body → meta)
- [ ] Colour is used to convey meaning consistently (red = critical, amber = high, green = safe)

**Spacing and layout**
- [ ] Consistent horizontal padding throughout (40px desktop, 20px mobile)
- [ ] Nothing feels edge-to-edge or cramped
- [ ] The sidebar has enough width for tool titles to display without truncating
- [ ] The CVE panel scrolls cleanly with max-height respected

**Interaction design**
- [ ] Every clickable element has a visible hover state
- [ ] Tags on articles respond visibly when clicked
- [ ] Active filters are visible and dismissible with one click
- [ ] The theme toggle is reachable and labelled
- [ ] The threat map toggle shows/hides cleanly

**Typography**
- [ ] Body text is readable at current size (no smaller than 13px for secondary text)
- [ ] Monospace font (IBM Plex Mono) used only for technical content — CVE IDs, timestamps, stats
- [ ] Fraunces used only for display/headline — article titles, stat numbers, page titles
- [ ] No text is invisible against its background (WCAG AA: 4.5:1 minimum)

**Empty and loading states**
- [ ] No panel shows "Loading..." permanently — all panels hide gracefully if data is absent
- [ ] The word of the day either shows a real term or is hidden — never shows "—" or "Loading..."
- [ ] The scam callout is hidden until it has real content
- [ ] The briefing panel is hidden if no briefing is available

**Cross-theme**
- [ ] Dark theme: yellow accent (`#f5c842`) on near-black (`#0d0f14`)
- [ ] Light theme: navy (`#0D3B66`) on warm parchment (`#f4f1eb`)
- [ ] All text meets contrast ratios in both themes
- [ ] Theme preference persists across page navigation

**Fail conditions:** anything that makes the design look unfinished, inconsistent, or inaccessible.

---

## Lens 5 — DevSecOps

*Security, deployment integrity, and automation reliability.*

**Secrets and credentials**
- [ ] No API keys in any HTML, CSS, JS, or committed files
- [ ] `ANTHROPIC_API_KEY` loaded from GitHub Actions secret only
- [ ] No sensitive information in git history

**Content security**
- [ ] All user-facing dynamic content is HTML-escaped
- [ ] iframe has `sandbox`, `loading="lazy"`, `referrerpolicy="no-referrer"`
- [ ] No `eval()` in any JavaScript

**Deployment**
- [ ] `shared.css` and `shared.js` are committed to the repo (not just local)
- [ ] `pseudosec.png` is committed to the repo
- [ ] All new files referenced in HTML are committed
- [ ] `briefing.json` exists in repo (even if placeholder)
- [ ] Workflow file uses `--force-with-lease`
- [ ] Workflow adds `briefing.json` to committed files
- [ ] GitHub Pages source is set to root of `main` branch

**JSON data files**
- [ ] `news.json` is present and not empty
- [ ] `cve.json` is present and not empty
- [ ] `tool_updates.json` is present and not empty
- [ ] `briefing.json` is present (placeholder acceptable)
- [ ] Timestamps in all JSON files are in AEST, not UTC

**Fail conditions:** any exposed secret, missing file, or broken deployment.

---

## Automated audit

Run before every ship:

```bash
python3 audit.py
```

This checks: braces balanced, dollar signs present, script load order, noopener, ARIA, backticks, XSS escaping, logo transparency, and Python syntax. All checks must pass before proceeding to human lenses.

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
