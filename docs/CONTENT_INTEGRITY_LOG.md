# pseudosec. — Content Integrity Agent Log

Dated entries from each run. Newest first. See the agent's standing brief for the full checklist.

---

## 2026-08-22 (AEST)

### Prior-run follow-up
- **BEC "hundreds of millions" overstatement (flagged 2026-08-19 through -21)** — still unfixed. `definitions.js` line 87 ("Business Email Compromise" entry) unchanged. 4th consecutive carry-forward.
- **"Google News — Privacy & Compliance AU" query noise leak (flagged 2026-08-18 through -21)** — still dormant this run; the query is absent from today's `data/news.json` sources again (see item 6). Query itself unchanged in `scripts/fetch_cyber_news.py` — still a live risk, not a fix.
- **Egress block (flagged 2026-08-18 through -21)** — still in effect, confirmed again this run, see item 2/3.

### 1. Fact cross-reference of AI content (`data/briefing.json`, generated 22-08-2026 07:19 AM)
Checked both factual claims in `briefing` against their `news.json` source articles and independent WebSearch:
- **Home batteries / rooftop battery cybersecurity compliance claim** — supported. WebSearch confirms the Cyber Security (Security Standards for Smart Devices) Rules 2025 took effect 4 March 2026 and bring home batteries/smart inverters into scope for mandatory baseline security requirements (no default passwords, vulnerability disclosure process, disclosed update lifespan); compromised inverters can manipulate grid power output. Briefing's framing ("connected hardware potentially creating vulnerabilities in broader networks") is a fair gloss, not dramatized.
- **GitLab / OpenAI "stronger controls around AI agent activity" claim** — supported. WebSearch confirms GitLab 19.3 shipped a Secrets Manager, AI spending caps, and a Dedicated AI Gateway for agentic workflows, matching the `news.json` source article. OpenAI's controls (referenced in the featured story) follow the Hugging Face incident per the Dark Reading source.
- **Featured story** (`featured.summary`, the "OpenAI Adds Controls" Dark Reading piece, `source_count: 1`) — verified as a verbatim 140-char truncation of the article's own `news.json` RSS summary. No misattribution.
- No dramatization, misattribution, or unsupported claims found — 3rd clean run in a row.

### 2. Paywall spot-check
**Not performed — 5th consecutive run.** Tested `en.wikipedia.org` (control) and `securitybrief.com.au` (allowlisted source) via WebFetch this run; both returned `EGRESS_BLOCKED`. Same blanket proxy policy block as the prior four runs.

### 3. Dead source check
**Not performed**, same reason as above.

### 4. Glossary / OWASP / Essential Eight accuracy
Rotated to a fresh sample: **Data Breach** glossary entry, plus `reference.html`'s OWASP Web Top 10 **A04–A10** (Cryptographic Failures, Injection, Insecure Design, Authentication Failures, Software/Data Integrity Failures, Security Logging and Alerting Failures, Mishandling of Exceptional Conditions).
- **Data Breach entry's NDB/OAIC claim** — supported. WebSearch (OAIC) confirms the Notifiable Data Breaches scheme requires reporting of "eligible" (significant) breaches to the OAIC — matches the entry's wording exactly.
- **`reference.html` A04–A10 category names, rankings, and rename notes** — all verified against the official OWASP Top 10:2025 list (finalised January 2026). Names match exactly (including the two new 2025 categories and three renames the site correctly flags). A04's "down two places" (was A02:2021) and A05's "supply chain and misconfiguration risks overtook it" (A02/A03:2025 now rank above A05 Injection) both check out against the official ordering.
- **Minor note, not urgent:** A09's "average time to detect a breach is over 200 days" is trending stale — IBM's most recent (2025) Cost of a Data Breach Report puts pure identification time at 181 days (down from ~204 in earlier years); the combined identify+contain figure is 241 days. The site's claim isn't fabricated (it matches older-vintage figures widely still cited) but "over 200 days" for *detection alone* is now arguably a touch high. Low-severity, worth a wording tweak next time this section is touched, not a standalone fix.
- No other issues found in this sample.

### 5. Value and dual-audience readability
Sampled current `data/news.json` (45 items, generated 22-08-2026 07:19 AM) and the briefing:
- Reads well for both audiences this run — home batteries, N-able N-central active exploitation, Quest Apartment Hotels breach, and the AI-agent-controls cluster (GitLab/OpenAI/CUSTODY framework) all carry plain-English framing for lay readers while staying substantive for professionals.
- **Minor tagging quibble:** *"Google adds Antigravity to Gemini Enterprise subscriptions"* is tagged "Compliance" — it's a product-feature rollout (coding agent, pooled budgets, audit logs) with only a light compliance angle; "AI & Tools" would fit better. Not inaccurate, just a borderline auto-tag — not something this agent edits.
- No off-topic noise or clickbait spotted in this run's sample.

### 6. Source-credibility / blocklist adherence
All 8 distinct sources currently live in `data/news.json` (Dark Reading, Security Brief Australia, Australian Cyber Security Magazine, 404 Media, Troy Hunt Blog, Google News — ScamWatch, Risky Business, Krebs on Security) checked against `BLOCKED_DOMAINS` and the CHANGELOG blocklist. **No blocked domain present.** Clean.

### PRs opened this run
None. No direct evidence of a dead/paywalled source was gathered (egress blocked — see item 2/3).

### Needs human attention (priority order)
1. **Business Email Compromise glossary entry still overstates FY2024-25 losses** — "hundreds of millions" vs. actual ~$98M per ACSC (`definitions.js`, "Business Email Compromise" entry, line 87). Flagged 2026-08-19, unfixed for 4 consecutive runs now.
2. **Egress to publisher/reference domains has now failed for 5 consecutive runs** (2026-08-18 through -22), reconfirmed this run via a Wikipedia control plus an allowlisted publisher, both `EGRESS_BLOCKED`. Paywall and dead-source checks (items 2 & 3) remain structurally impossible under the current sandbox network policy. Recommend a one-time human decision on granting this agent's environment egress to the approved-domain list.
3. **"Google News — Privacy & Compliance AU" query** — still dormant (no results this run either), but the overly broad query in `scripts/fetch_cyber_news.py` is unchanged and will likely leak off-topic content again when it next returns results.
4. Minor: A09 (Security Logging and Alerting Failures) "over 200 days" detection-time stat in `reference.html` is trending stale against the latest (2025) IBM figures — low priority wording tweak.

---

## 2026-08-21 (AEST)

### Prior-run follow-up
- **BEC "hundreds of millions" overstatement (flagged 2026-08-19, -20)** — still unfixed. `definitions.js` "Business Email Compromise" entry unchanged. 3rd consecutive carry-forward.
- **"Google News — Privacy & Compliance AU" query noise leak (flagged 2026-08-18, -19, -20)** — not reproduced this run; the query returned zero results in today's fetch (source not present in current `data/news.json` at all — only 8 distinct sources live, see item 6). Query itself is still unchanged in `scripts/fetch_cyber_news.py`, so this remains a dormant risk, not a fix.
- **Egress block (flagged 2026-08-18, -19, -20)** — still in effect, confirmed again this run, see item 2/3.

### 1. Fact cross-reference of AI content (`data/briefing.json`, generated 21-08-2026 07:23 AM)
`briefing` field (`select_trending_article()`'s output is not AI-generated per the 2026-08-18 decision, but the `briefing` paragraph itself still is). Checked all three factual claims against their `news.json` source articles and independent WebSearch:
- **Quest Apartment Hotels data breach** — supported. WebSearch (ABC News, Cyber Daily, The Register, Australian Cyber Security Magazine) confirms a real breach disclosed ~19-08-2026, traced to a third-party database vulnerability, 1.5M+ potentially affected records. Briefing's framing ("your data can be exposed even when the organisation you deal with directly has done nothing wrong") is accurate to what's known — no overstatement.
- **Merchant internal fraud blind spot claim** — supported. WebSearch confirms the Chargebacks911 2026 Chargeback Field Report: ~1 in 4 merchants has experienced employee-initiated fraud, fewer than 4 in 10 of those actively monitor for it. Briefing's plain-English gloss ("staff with access to financial systems pose a real risk that is often overlooked") matches, not dramatized.
- **Document redaction risk claim** — supported. WebSearch confirms visual-only redaction (black boxes, highlighting) in PDFs/Word docs does not remove underlying text/metadata and is recoverable — a widely-documented 2026 issue. Briefing's practical tip is accurate guidance, not overstated.
- **Featured story** (`featured.summary`, the "Money and Mindset" Dark Reading policing article, `source_count: 1`) — summary is a direct truncation of the article's own `news.json` RSS summary (matches verbatim up to the 140-char cutoff). No misattribution — consistent with `select_trending_article()` no longer using an AI-written quote (per 2026-08-18 decision).
- No dramatization, misattribution, or unsupported claims found in this run's briefing — clean result, 2nd clean run in a row.

### 2. Paywall spot-check
**Not performed — 4th consecutive run.** Tested `en.wikipedia.org` (control, non-publisher) and `securitybrief.com.au` (an allowlisted source not yet paywall-tested in this log's history) via WebFetch this run; both returned `EGRESS_BLOCKED`. Confirms the blanket proxy policy block persists unchanged from the prior three runs — not narrowing to specific domains, not resolved.

### 3. Dead source check
**Not performed**, same reason as above.

### 4. Glossary / OWASP / Essential Eight accuracy
Rotated to a fresh sample (previous four runs covered BEC, MFA, Credential Stuffing, SQL Injection, MITM, SIEM, CVE, Zero Trust, Vishing, Essential Eight, Secure Password, Ransomware, Two-Factor Authentication, Zero-Day, Botnet, DDoS, and OWASP A01): **Patch** (Essential Eight patching timeframe claim), **Incident Response** (ACSC hotline number), **Identity Theft** (IDCARE hotline number), plus fresh OWASP entries **A02 Security Misconfiguration** and **A03 Software Supply Chain Failures** in `reference.html`.
- **Patch entry's "48 hours for critical vulnerabilities and two weeks for others"** — supported. WebSearch confirms Essential Eight patch timeframes: 48 hours when a working exploit exists, two weeks otherwise (for internet-facing services / ML2+). Accurate, appropriately simplified.
- **Incident Response entry's "1300 CYBER1"** — supported. WebSearch confirms this is the correct, current ACSC 24/7 Cyber Security Hotline number (1300 292 371).
- **Identity Theft entry's "IDCARE (1800 595 160)"** — supported. WebSearch confirms this is IDCARE's correct current contact number.
- **`reference.html` OWASP A02 "90% of applications had some form of misconfiguration"** — supported. WebSearch found this exact figure cited by an independent OWASP Top 10:2025 secondary source (alongside a higher 100%/3.00%-incidence variant cited elsewhere) — site's figure is a real, sourced statistic, not fabricated.
- **`reference.html` OWASP A03 "Software Supply Chain Failures... already the category with the highest reported incidence rate"** — supported. WebSearch confirms A03 is new for 2025 and independently reported to have the highest incidence rate (5.19%) of any 2025 category.
- No issues found in this sample.

### 5. Value and dual-audience readability
Sampled current `data/news.json` (47 items, generated 21-08-2026 07:23 AM) and the briefing:
- No off-topic noise this run (Privacy & Compliance AU query absent — see prior-run follow-up above).
- Borderline filler (not wrong, just thin, same recurring pattern as previously-flagged RecordPoint/Daon pieces): *"Strike Graph launches Atlas AI adviser for compliance"* — a vendor product-launch piece with a compliance angle. Low value to either audience but not inaccurate.
- Otherwise reads well for both audiences — Quest Apartment Hotels breach, merchant fraud blind spot, document redaction risk, N-able N-central active exploitation warning, and the Kriminal/CoSnitch/TwinLoot items all carry plain-English framing for lay readers while remaining substantive for professionals.

### 6. Source-credibility / blocklist adherence
All 8 distinct sources currently live in `data/news.json` (Dark Reading, Security Brief Australia, Australian Cyber Security Magazine, 404 Media, Troy Hunt Blog, Google News — ScamWatch, Risky Business, Krebs on Security) checked against `BLOCKED_DOMAINS` and the CHANGELOG blocklist. **No blocked domain present.** Clean.

### PRs opened this run
None. No direct evidence of a dead/paywalled source was gathered (egress blocked — see item 2/3).

### Needs human attention (priority order)
1. **Business Email Compromise glossary entry still overstates FY2024-25 losses** — "hundreds of millions" vs. actual ~$98M per ACSC (`definitions.js`, "Business Email Compromise" entry). Flagged 2026-08-19, unfixed for 3 consecutive runs now.
2. **Egress to publisher/reference domains has now failed for 4 consecutive runs** (2026-08-18 through -21), confirmed again this run via a Wikipedia control plus an allowlisted publisher, both `EGRESS_BLOCKED`. Paywall and dead-source checks (items 2 & 3) remain structurally impossible under the current sandbox network policy. Recommend a one-time human decision on granting this agent's environment egress to the approved-domain list, since WebSearch cannot substitute for direct observation of paywalls/dead feeds.
3. **"Google News — Privacy & Compliance AU" query** — dormant this run (no results), but the overly broad `(site:abc.net.au OR site:theguardian.com) privacy act australia` query in `scripts/fetch_cyber_news.py` is still unchanged and will likely leak off-topic content again when it next returns results. Still needs tightening by a human.

---

## 2026-08-20 (AEST)

### Prior-run follow-up
- **Business Email Compromise "hundreds of millions" overstatement (flagged 2026-08-19)** — still unfixed. `definitions.js` line 87 is unchanged; still needs the ~$98M correction. Carrying forward.
- **Troy Hunt "Australian organisations" framing (flagged 2026-08-19)** — moot this run. Today's `briefing.json` no longer references Troy Hunt/Weekly Update 517 at all (briefing content has fully rotated to different stories), so nothing left to check on that specific claim.
- **Egress block (flagged 2026-08-18, 2026-08-19)** — still in effect, see item 2/3 below.

### 1. Fact cross-reference of AI briefing (`data/briefing.json`, generated 20-08-2026 07:21 AM)
Checked all three factual claims in `briefing` against their `news.json` source articles and independent WebSearch:
- **"Kriminal" AI platform claim** — supported. WebSearch (SiliconANGLE/ThreatDown, 19-08-2026) confirms Kriminal is a real guardrail-free AI service offering social engineering/OSINT/cybercrime assistance (it's actually a jailbroken wrapper around xAI's Grok rather than its own model, but the briefing doesn't claim otherwise — no overstatement).
- **"73% of ransomware victims are mid-market"** — supported. WebSearch confirms Black Kite's "Mid-Market Is the Routine Target" report (published 18-08-2026), 73% of ransomware victims in North America/Europe are mid-market ($10M–$1B revenue), matching the Security Brief Australia source article exactly.
- **Clop/Windchill exploit claim** — supported. WebSearch (The Hacker News, BleepingComputer) confirms CVE-2026-12569, a real PTC Windchill flaw (CVSS 9.3) exploited by a Clop-linked custom web shell, matching the source article.
- **Featured story** (`featured.summary`, the Kriminal article) — matches its Dark Reading source, no misattribution.
- No dramatization or unsupported claims found in this run's briefing — a clean result, unlike the two prior runs.

### 2. Paywall spot-check
**Not performed — 3rd consecutive run.** Retested with different targets this run: `krebsonsecurity.com`, `troyhunt.com`, and (as a control, non-publisher) `en.wikipedia.org` — all three returned `EGRESS_BLOCKED` from the network proxy. The Wikipedia control confirms this is a blanket egress policy block, not something specific to publisher domains — so rotating to different sources each run will not resolve it. Per the agent proxy's own guidance, did not retry further or attempt workarounds.

### 3. Dead source check
**Not performed**, same reason as above.

### 4. Glossary / OWASP / Essential Eight accuracy
Rotated to a fresh sample (previous two runs covered BEC, MFA, Credential Stuffing, SQL Injection, MITM, SIEM, CVE, Zero Trust, Vishing, Essential Eight, Secure Password): **Ransomware, Two-Factor Authentication, Zero-Day, Botnet, DDoS, Zero Trust** (re-checked Zero Trust's specific "mandated for federal agencies" claim, not previously verified).
- **Ransomware entry's "ACSC recorded ransomware as the most disruptive cybercrime type in FY2024–25"** — supported. WebSearch confirms ACSC's Annual Cyber Threat Report 2024-25 describes ransomware as the most disruptive cybercrime threat, consistent with the entry.
- **Zero Trust entry's "Australian government has mandated Zero Trust architecture for federal agencies"** — supported. WebSearch confirms the Protective Security Policy Framework (PSPF) 2025 Annual Release formally mandates zero trust principles for government agencies.
- Two-Factor Authentication, Zero-Day, Botnet, DDoS — general/definitional content, no specific factual claims requiring external verification; all accurate and appropriately simplified.
- No issues found in this sample.

### 5. Value and dual-audience readability
Sampled current `news.json` (51 items):
- **🚩 Noise leak recurs in "Google News — Privacy & Compliance AU" query.** *"Inquiry finds Catholic school discriminated against staff over sexual orientation - abc.net.au"* (tagged "Education") has zero privacy/compliance/cyber content — it's an employment discrimination story picked up by the broad `privacy act australia` query. This is the same root cause flagged 2026-08-18 (the iview TV listing) and noted as "not currently reproducible" on 2026-08-19 — it has now reproduced with a different example, confirming the query itself still needs tightening by a human.
- Borderline filler (not wrong, just thin): *"Daon wins Frost & Sullivan recognition for biometric model"* — a vendor-award piece with a security angle bolted on, similar to the previously-flagged RecordPoint appointment piece. Low value to either audience.
- Otherwise reads well for both audiences this run — CoSnitch, TwinLoot, Metabase SQL zero-day, Fortinet/MFA bypass, and the Kriminal/mid-market ransomware/Clop briefing items all carry plain-English context for lay readers while staying substantive for professionals.

### 6. Source-credibility / blocklist adherence
All 10 distinct sources currently live in `data/news.json` (Dark Reading, Security Brief Australia, Google News — Privacy & Compliance AU, Google News — ABC Tech, Australian Cyber Security Magazine, Dark Reading, 404 Media, Troy Hunt Blog, Google News — ScamWatch, Risky Business, Krebs on Security) checked against `BLOCKED_DOMAINS` and the CHANGELOG blocklist. **No blocked domain present.** Clean.

### PRs opened this run
None. No direct evidence of a dead/paywalled source was gathered (egress blocked — see item 2/3).

### Needs human attention (priority order)
1. **Business Email Compromise glossary entry still overstates FY2024-25 losses** — "hundreds of millions" vs. actual ~$98M per ACSC (`definitions.js`, "Business Email Compromise" entry). Flagged 2026-08-19, still unfixed.
2. **"Google News — Privacy & Compliance AU" query keeps leaking off-topic content** — 3rd occurrence across 3 runs (iview TV listing → quiet → Catholic school discrimination story). The `(site:abc.net.au OR site:theguardian.com) privacy act australia` query in `scripts/fetch_cyber_news.py` is too broad and needs tightening by a human — this agent won't touch matching logic per its remit.
3. **Egress to publisher/reference domains has now failed for 3 consecutive runs** (2026-08-18, -19, -20), confirmed this run to be a blanket proxy policy block (a Wikipedia control also failed) rather than a publisher-specific issue. Paywall and dead-source checks (items 2 & 3) remain structurally impossible under the current sandbox network policy — worth a one-time human decision on whether to grant this agent's environment egress to the approved-domain list, since this will keep recurring every run otherwise.

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
