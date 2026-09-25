# pseudosec. — Content Integrity Report

Overwritten by the Content Integrity Agent on each run; past runs are in this file's git history.
The previous append-only log (to 2026-09-24) is in git history as `docs/CONTENT_INTEGRITY_LOG.md` (last version: commit `c985a91`).

## 2026-09-25 — handover after the full site review

**Needs attention**
1. **Agent web access.** WebFetch/curl to external sites has been blocked in this agent's environment since 2026-08-18, so paywall and dead-source checks can only be approximated with WebSearch. Needs a decision on the routine's environment network settings.

**Resolved on 2026-09-25 (don't re-flag)**
- iTnews missing from the feed — blocklist matched `news.com.au` inside `itnews.com.au`; now matched by hostname.
- Keyword-guessed threat badges (e.g. "Risky Business" → Medium, product launches → Critical) — only official ACSC items carry a threat level now, from ACSC's own title.
- ACSC alerts silently dropped by the topic filter — official feeds are always included.
- Glossary: Business Email Compromise figure, Patch timeframes, SolarWinds scale, brute-force "billions of years", Apache version (2.4.49) — corrected.
- OWASP A01 "five editions", A08 name/scope, A09 detection time (IBM 2025: 181 days); LLM03 name; Essential Eight user-application hardening (no Flash) — corrected.
- Tracker stats checked against the ASD 2024–25 report PDF: individual average is $33,000 (↑8%); $36,633 is the overall average. Crime chart now shows the report's top-3 types for individuals and businesses.
- AI-generated briefing removed from the pipeline; no AI-written text remains on the site.
- Audience is anyone (RTO/VET targeting removed). Live data now lives on the `data` branch, not `main`.
