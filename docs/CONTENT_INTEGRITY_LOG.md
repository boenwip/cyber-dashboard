# pseudosec. — Content Integrity Agent Log

Dated entries from each run. Newest first. See the agent's standing brief for the full checklist.

---

## 2026-08-18 (AEST)

### Environment note (read first)
This run's network egress was blocked by organisation policy for **all** direct fetches (WebFetch and `curl` alike) to every publisher/reference domain tried — including securitybrief.com.au, darkreading.com, australiancybersecuritymagazine.com.au, 404media.co, risky.biz, krebsonsecurity.com, and even generic sites like wikipedia.org and cyber.gov.au (all `403 policy denial` at the proxy). Only the WebSearch tool worked (it doesn't route through the blocked egress). Per the agent proxy's own guidance, policy denials are not to be retried or routed around. **Net effect: item 2 (paywall spot-check) and item 3 (dead source check) could not be performed this run** — no direct article fetch or feed-liveness check was possible. No source removal PR was opened; the hard rule requires direct evidence gathered this run, and none could be gathered. Fact-checking and glossary/OWASP checks below relied on WebSearch instead, which was sufficient to get real answers.

### 1. Fact cross-reference of AI briefing (data/briefing.json, generated 18-08-2026 07:21 AM)
Checked every factual claim in `briefing` and `featured` against the underlying Security Brief Australia articles (via WebSearch, since direct fetch was blocked) and independent sources.

- **Bugtri / AI vulnerability spam** claim — supported. Independently verified via WebSearch (Quilter profile of founder Jacob Riggs): Sydney-based, filters AI-generated/duplicate vulnerability reports, human review for uncertain cases. No overstatement found.
- **"Only 5% of staff use generative AI effectively"** — supported. Independently verified: NROC Security quarterly study, 4,800 business users / 139,000 GenAI interactions sampled, 5% effective vs 31% active use. Briefing text matches.
- **🚩 Featured pull-quote — misattribution, needs human review.** `featured.quote` reads: *"Australians lost $2.18B to scams in 2025 via fake myGov and invoice fraud."* WebSearch cross-check (National Anti-Scam Centre "Targeting Scams" 2025 report, ACCC release) confirms **$2.18B is the total national scam-loss figure across all scam categories for 2025** (up 7.8–8% on 2024). It is *not* a myGov/invoice-scam-specific figure — the largest single category by far is investment scams ($837.7M), with payment redirection, romance, phishing and remote-access scams making up the rest. myGov/invoice fraud isn't broken out as its own reported category at all. The AI briefing generator appears to have taken a "total 2025 losses" figure mentioned as background context in the Proofpoint source article and compressed it into a quote that implies the $2.18B was caused by myGov/invoice scams specifically. This is a dramatization/misattribution beyond what the source supports — exactly the "appeal with truth" failure mode. **Needs human edit or removal of the featured quote.**
- Main `briefing` paragraph itself doesn't repeat the $2.18B figure and is otherwise consistent with sources — only the `featured.quote` field is affected.

### 2. Paywall spot-check
**Not performed** — network egress blocked, see note above. No source can be marked paywalled from this run.

### 3. Dead source check
**Not performed** — network egress blocked, see note above. No source can be marked dead from this run.

### 4. Glossary / OWASP / Essential Eight accuracy
Spot-checked via WebSearch against owasp.org and cyber.gov.au equivalents (couldn't fetch either directly, but WebSearch returned clear primary-source snippets):

- **🚩 OWASP Web Top 10 is out of date, needs human review.** `reference.html` presents "OWASP Top 10 for Web Applications (2021)" as the current framework (tab label, intro text, and footer all say "OWASP Web 2021"). WebSearch confirms **OWASP Top 10:2025 was finalised and published in early 2026** and is now the current official edition, superseding 2021. The site is now presenting a supersede framework as current, un-flagged. This is a straightforward accuracy/staleness issue, not a judgement call — recommend updating to the 2025 edition (or clearly labelling the 2021 content as the prior edition) as a priority human task.
- **🚩 OWASP A01 "Broken Access Control" stat is overstated in reference.html.** Site copy: *"The #1 risk — found in over 94% of tested applications."* Actual OWASP figure: 94% of applications **were tested for** some form of broken access control, with an **average incidence rate of 3.81%** — i.e. 94% is a testing-coverage stat, not a prevalence-of-vulnerability stat. The site's phrasing reads as "94% of apps have this vulnerability," which overstates the real number by roughly 25x. This is a good example of a widely-repeated misreading of the OWASP dataset — worth a precise rewrite (e.g. "the most frequently occurring risk category, tested in 94% of applications").
- **Essential Eight — minor inconsistency between two pages, not clearly wrong but worth tightening.** `reference.html` says ACSC "recommends" ML2 for all Australian organisations (accurate — it is a recommendation for the broader market). `definitions.js` glossary entry says "Government entities and critical infrastructure operators are required to achieve Maturity Level Two" — the actual mandate (via PSPF, since 1 July 2022) applies specifically to non-corporate Commonwealth entities, not "critical infrastructure operators" as a category (which have separate SOCI Act obligations, not an Essential Eight ML2 mandate). Low-severity but worth a wording fix so the two pages agree and don't overstate who's legally required to comply.
- Essential Eight 8-strategy list itself (application control, patch apps, macro settings, user app hardening, restrict admin privileges, patch OS, MFA, backups) matches ASD's official list exactly — no issue.
- Spot-checked glossary terms CVE, Zero Trust, Vishing, Essential Eight, Secure Password — all factually sound, appropriately simplified for a lay reader, no inaccuracies found.

### 5. Value and dual-audience readability
Sampled current `news.json` (51 items) and the briefing:

- **🚩 Noise leak in "Google News — Privacy & Compliance AU" query.** Item *"Australian Story: S2026 The Final Act — iview.abc.net.au"* is an ABC iview TV programme listing with zero cyber/privacy content, picked up by the `site:abc.net.au OR site:theguardian.com privacy act australia` query and tagged "AU Cyber" / "AU General". Pure filler — actively hurts the "does this filter noise well" test for a professional reader. Query needs tightening by a human (not something this agent can safely fix — could affect matching logic broadly).
- Borderline filler: *"RecordPoint names Christian Lucarelli Chief Revenue Officer"* — a personnel-appointment PR piece with a compliance-software angle bolted on. Low value to either audience; candidate for tighter relevance filtering but not clearly wrong content.
- Sampled articles otherwise read well for both audiences — e.g. the Proofpoint myGov/invoice piece, the Bugtri piece, and the Dark Reading vulnerability items all have jargon explained or are written at an accessible level, with technical items (VMware vCenter flaw, Fortinet/MFA bypass) providing enough context for a lay reader while still being useful to a professional.

### 6. Source-credibility / blocklist adherence
Checked all 9 distinct sources currently live in `data/news.json` (Dark Reading, Australian Cyber Security Magazine, Security Brief Australia, 404 Media, Google News — ScamWatch, Risky Business, Krebs on Security, Google News — Privacy & Compliance AU, Google News — Bleeping Computer AU) against `BLOCKED_DOMAINS` in `scripts/fetch_cyber_news.py` and the CHANGELOG blocklist (Murdoch/News Corp, Nine, Seven West, buzzfeed, ladbible, vocal.media, loyaltylobby, etc.). **No blocked domain present.** Clean.

### PRs opened this run
None. No direct evidence of a dead/paywalled source was gathered (network egress blocked — see note above).

### Needs human attention (priority order)
1. **Featured briefing quote misattributes the $2.18B total 2025 scam-loss figure to myGov/invoice fraud specifically** — inaccurate, should be corrected or removed (`data/briefing.json` → `items.featured.quote`).
2. **OWASP Web Top 10 content is stale** — 2025 edition has been current since early 2026; site still presents 2021 as current (`reference.html`).
3. **OWASP A01 "94%" stat is misstated** — that's test-coverage, not vulnerability prevalence (`reference.html`).
4. **"Australian Story" iview TV listing leaked into the AU Cyber feed** via the Privacy & Compliance Google News query — query needs tightening (`scripts/fetch_cyber_news.py`).
5. Minor: Essential Eight ML2 mandate wording differs between `reference.html` and `definitions.js` and both slightly overstate/miscategorise who's legally required — worth aligning.
6. Paywall and dead-source checks are now overdue a real pass — this run and (per lack of prior log) possibly prior runs too could not verify source health directly. Worth confirming egress policy allows these domains, or running that check from an environment that does.
