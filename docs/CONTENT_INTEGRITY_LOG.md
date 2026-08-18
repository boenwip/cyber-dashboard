# pseudosec. — Content Integrity Agent Log

Dated entries from each run. Newest first. See the agent's standing brief for the full checklist.

---

## 2026-08-19 (AEST)

### Prior-run follow-up — all 5 items resolved
Checked every item flagged "needs human attention" in the 2026-08-18 entry against the current codebase. All resolved:
- Featured-story misattribution (the $2.18B quote) — structurally fixed. `select_trending_article()` in `scripts/fetch_cyber_news.py` replaced the AI pull-quote with the article's own RSS summary; `data/briefing.json`'s `featured` field now has no `quote` field at all, just `summary`. No AI-generated quote left to misattribute.
- OWASP Web Top 10 staleness — fixed. `reference.html` now presents the 2025 edition as current, explicitly notes "Updated from the 2021 edition following a 2026 review."
- OWASP A01 "94%" stat — fixed. Copy now reads "tested for in 94% of applications (that's testing coverage, not a claim that 94% of apps are vulnerable)."
- Essential Eight ML2 wording mismatch — fixed. `definitions.js` now correctly says "non-corporate Commonwealth government entities are required to achieve Maturity Level Two," matching `reference.html`.
- iview TV listing / noise leak — not currently reproducible. The Google News queries that produced it (Privacy & Compliance AU, ABC Tech, etc.) returned zero approved-source results this run, so nothing to check; query wording itself is unchanged in `fetch_cyber_news.py`, so this could resurface — not a guaranteed fix, just currently quiet.

### 1. Fact cross-reference of AI briefing (`data/briefing.json`, generated 19-08-2026 07:19 AM)
- **"CoSnitch" Copilot claim** — supported. WebSearch (Varonis report via Dark Reading) confirms the meta-hacking/social-engineering technique and that Microsoft shipped a patch 18-08-2026. Briefing's framing ("reminder to be cautious about what information AI tools can access") does not overstate the source.
- **"TwinLoot" claim** — supported. WebSearch (Ontinue Cyber Defense Center research, also covered by Computerworld/CSO Online) confirms a Python-based malware framework running its C2 entirely through Microsoft 365/Azure services (SharePoint dead-drop, Teams TURN relay, headless Edge). Briefing's plain-English translation ("running malicious activity entirely through Microsoft's own cloud services, making it harder for security tools to detect") is accurate and not dramatized.
- **🚩 Troy Hunt ransomware claim — unconfirmed, low confidence.** Briefing says Troy Hunt's "latest update also highlights ongoing ransomware risks for **Australian organisations**." The underlying article (`news.json`: "Weekly Update 517: Cyber Ransoms") is about ransomware/extortion economics generally (teenage threat actors, can't spend the money without getting caught) — its own RSS summary has no Australia-specific framing. WebSearch could not locate Update 517's full text (too recent to be indexed), so this can't be fully confirmed or refuted this run. Possible mild overreach in specificity — worth a human spot-check against the actual post.
- Rest of the briefing (ACSC reporting advice, general tip) is generic sound practice, not a factual claim requiring verification.

### 2. Paywall spot-check
**Not performed — 2nd consecutive run.** Tested `darkreading.com` and `securitybrief.com.au` via WebFetch this run; both returned `EGRESS_BLOCKED` from the network proxy (same failure mode as 2026-08-18, now confirmed not a one-off). No source can be marked paywalled without direct evidence, so none was.

### 3. Dead source check
**Not performed**, same reason as above.

### 4. Glossary / OWASP / Essential Eight accuracy
Rotated to a fresh sample (previous run checked CVE, Zero Trust, Vishing, Essential Eight, Secure Password): **Business Email Compromise, Multi-Factor Authentication, Credential Stuffing, SQL Injection, Man-in-the-Middle Attack, SIEM**.
- **🚩 Business Email Compromise entry overstates ACSC losses.** `definitions.js` says BEC "cost Australian businesses hundreds of millions of dollars in FY2024–25." WebSearch (two independent queries, consistent result citing the ACSC Annual Cyber Threat Report 2024-25) puts actual self-reported BEC losses at **just over $98 million**, average $64,000/report. "Hundreds of millions" overstates the real figure by roughly 2–3x — a real "appeal with truth" issue, not just rounding. Recommend correcting to "nearly $100 million" or similar.
- MFA, Credential Stuffing, SQL Injection, Man-in-the-Middle Attack, SIEM — all checked, factually sound and appropriately simplified for a lay reader. No issues found.

### 5. Value and dual-audience readability
Sampled current `news.json` (40 items, smaller pool than last run — several Google News queries returned nothing) and the briefing. Reads well for both audiences: technical items (CoSnitch, TwinLoot, VMware vCenter flaw, Fortinet/MFA bypass, Metabase zero-day) carry enough plain-English context for a lay reader while staying substantive for a professional. No filler/clickbait spotted in this run's sample (the previously-flagged iview listing and RecordPoint PR piece aren't present — see prior-run follow-up above).

### 6. Source-credibility / blocklist adherence
All 7 distinct sources currently live in `data/news.json` — Dark Reading, Australian Cyber Security Magazine, 404 Media, Risky Business, Krebs on Security, Troy Hunt Blog, Google News — ScamWatch — checked against `BLOCKED_DOMAINS` and the CHANGELOG blocklist. **No blocked domain present.** Clean.

### PRs opened this run
None. No direct evidence of a dead/paywalled source was gathered (egress blocked again — see item 2/3).

### Needs human attention (priority order)
1. **Business Email Compromise glossary entry overstates FY2024-25 losses** — "hundreds of millions" vs. actual ~$98M per ACSC (`definitions.js`, "Business Email Compromise" entry).
2. **Egress to publisher domains has now failed for 2 consecutive runs** (this run + 2026-08-18) — paywall and dead-source checks (checklist items 2 & 3) are structurally impossible under the current sandbox network policy. Worth checking whether this agent's environment can be given egress to the approved-domain list, since WebSearch alone can't substitute for a direct fetch (no truncation/paywall-wall visibility).
3. **Troy Hunt "Australian organisations" framing in the briefing is unconfirmed** — the source article's own summary doesn't obviously support the Australia-specific framing; too recent to verify via search this run. Low-confidence flag, worth a quick human read of the actual post.

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
