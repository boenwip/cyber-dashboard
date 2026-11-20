# pseudosec. — Content Integrity Report

Overwritten by the Content Integrity Agent on each run; past runs are in this file's git history.

## 2026-11-21 (AEDT) — routine content check

**Data snapshot reviewed:** `origin/data` commit `b04de0d`, 2026-11-20T16:02:18Z (21-11-2026 03:02 AEDT) — current at review time, well under the 24h flag threshold.

**Needs attention**

1. **New, high-priority — AI grouping merged two unrelated breaches into one story.** `groups.json`'s second group (method `ai`, spend $1.006154 for 2026-11) pairs:
   - "JPMorgan, Visa, Mastercard say third-party vendors targeted in cyberattack" (iTnews, 2026-11-20T03:15Z, summary: "Non-payment information accessed")
   - "Second Norwegian Energy Company Breached in Two Days" (Dark Reading, 2026-11-19T20:14Z)

   These are not the same news: different victims (a cluster of payment networks' third-party vendors vs. a Norwegian energy company), different sectors, no shared facts in either summary/title. This breaks the grouping rule ("merge only when different outlets report the SAME news") and would show readers a false link between two unrelated incidents under one story — directly against "appeal with truth." No other items in this run's 66 touch Norwegian energy, so there's no legitimate alternate pairing being missed; this looks like a genuine AI grouping error, the kind `DECISIONS.md` (2026-10-08) already tightened the prompt for once before. Fix: either a stronger "different victim/sector = different story" instruction, or a code-level sanity check (e.g. require shared named entities) as a backstop.

2. **Carried forward, still unfixed (14th consecutive report, independently re-verified this run) — OWASP A01/A02 stats on `reference.html` are 2021-edition figures mislabelled as current.**
   - Line 85: "tested for in 94% of applications" — OWASP's current `A01_2025` figure is **100.00%**, not 94%.
   - Line 92: "90% of applications... in testing" — current figure is **100%**, not 90%.
   One-line number swap in each case; the surrounding "testing coverage, not a vulnerability claim" caveat is already correct.

3. **Carried forward — the "AU Cyber" tag is a generic cyber-incident keyword bucket, not an Australia filter** (`scripts/fetch_cyber_news.py:279-291`). No new concrete mistag found in this run's sample; mechanism unchanged, so recurrence is expected. Recommend renaming the tag or adding real Australia-signal logic, as previously suggested.

4. **Carried forward — Microsoft 365 Blog direct feed still stale.** Directly confirmed again this run: the Microsoft 365 Blog item in `tool_updates.json` is still "The AI advantage your company can keep" (2026-10-27), unchanged for the fourth report running. The Google News fallback is healthy and current (now "Office in Copilot availability", 2026-11-19), so the panel itself shows fresh content — only the direct-feed path is dead/stalled.

5. **Carried forward (now 27+ consecutive snapshots) — Troy Hunt, Guardian/Register/Privacy & Compliance Google News search feeds still producing zero items.** None of today's 66 items are from any of the four. Could not test directly again this run: `WebFetch` to `www.troyhunt.com`, `news.google.com` and even `krebsonsecurity.com` (a feed that *is* actively feeding the live site) all failed with DNS/host-not-allowed errors — confirming this is a sandbox network restriction on this session, not evidence about the feeds themselves. `WebSearch` substitute: Troy Hunt is still actively publishing (now up to Weekly Update 529, higher than last report's "high 520s"), so the blog is alive and the fetch/feed path remains the unverified problem.

6. **Carried forward, minor — vendor/personnel/launch filler persists.** "Checkmarx Appoints Kobi Sivilya as Chief Information Security Officer" (Dark Reading, 11-10, now 7th report flagging it, close to aging out of the 14-day window). New this run: "Strike Graph Launches Integration AI to Automate Continuous Compliance Evidence Using Any Existing Tool" (Dark Reading, 11-18) is a vendor product-launch announcement tagged AI & Tools + Compliance; the compliance tag is defensible but the content is PR, not analysis.

7. **Carried forward — the garbled ABC Tech Google News item is still live, confirming it's a recurring pattern, not a one-off.** "The Business: What's behind the recent spate of cyber hacks The Business - ABC iview" (Google News — ABC Tech) is unchanged from last report and still the same mangled, duplicated string with no real article content. Worth a code-level check for this specific recurring upstream artifact (same title republished) rather than waiting for it to age out again.

8. **Carried forward, unfixed housekeeping — GitHub issue [#4](https://github.com/boenwip/cyber-dashboard/issues/4)**, re-confirmed via the GitHub API: still open, unchanged, now 24 days. `data/annual_report.json` already reflects the 2025-26 report correctly — close when comfortable.

**Resolved since last report**

- **404 Media volume concern** — a fresh 404 Media item is back in this run ("To Catch a Ransomware Scammer, FBI Posed as Both Victim and Attacker", 11-19), so the low-volume-feed-aging-out pattern flagged last report isn't currently biting.
- **Dark Reading share of items** — 34/66 (51.5%) this run, flat versus last report's 35/68 (51.5%) — no further growth, so downgrading from an active concern to "watch."

**Checked this run**

1. **Grouping sanity** — `groups.json`: `method: ai`, spend $1.006154 for 2026-11 (up from $0.957962, still under the $2 flag threshold). 3 groups total: Optimizely supply-chain story (Krebs/iTnews/Dark Reading, correctly grouped, no duplicate outlet, lead reputation correct) and the Patch Tuesday story (Krebs/Dark Reading, correctly grouped) are fine; the JPMorgan/Norwegian-energy group is wrong — see item 1 above. Scanned all 66 items for same-news-left-ungrouped by title/topic overlap — no missed pairings found. Featured story (`briefing.json`) is the Optimizely story (`source_count: 3`) — genuine and current.
2. **Live data sanity** — snapshot `b04de0d`, current (well under 24h). No ACSC-direct or ACSC-Google-News-fallback item this run (only secondhand ACSC coverage via Australian Cyber Security Magazine, correctly carrying no threat level) — nothing to check for prefix/level mismatch. Checked all 66 items' hostnames: all resolve to approved domains (`australiancybersecuritymagazine.com.au`, `krebsonsecurity.com`, `risky.biz`, `securitybrief.com.au`, `www.404media.co`, `www.darkreading.com`, `www.itnews.com.au`, `news.google.com`) — no `BLOCKED_DOMAINS` matches. CVE panel: 10 items, all `ransomware: Unknown` with a `due_date`, no severity score — correct by design. Tool-updates panel checked by tool/source — see item 4 above on Microsoft 365.
3. **Value and readability** — sampled the full current 66-item list for tag sanity and filler. Found one new vendor-PR filler item and reconfirmed the garbled ABC Tech item (items 6–7 above). Spot-checked tag assignments across the list (AI & Tools items requiring a security angle, Compliance items requiring a specific obligation) — no mistags found this run.
4. **Reference accuracy** — rotated to the Essential Eight tab (not re-checked recently): all 8 controls (Application Control, Patch Applications, Office Macro Settings, User Application Hardening, Restrict Admin Privileges, Patch OS, MFA, Regular Backups) read consistent with ASD's published Essential Eight strategies and maturity-model framing — no issues found. Did not re-check OWASP A01/A02 numerically this run beyond re-confirming the unfixed lines are still present (item 2); OWASP LLM Top 10 and annual report figures were independently verified last report and not re-checked this run.
5. **AI Guide safety** — `AU_HELP` constant confirmed unchanged and correct (ReportCyber, Scamwatch, IDCARE 1800 595 160, Australian Cyber Security Hotline 1300 292 371). Did not sample new prompts beyond re-confirming the constant this run — rotate to prompt sampling next run.
6. **Source health** — could not directly test Troy Hunt, Guardian, Register, Privacy & Compliance, or (as a control) Krebs on Security via `WebFetch` this run; all failed with DNS/host-not-allowed errors from this session's network sandbox, including the Krebs control which is demonstrably live (it's in today's data) — confirms the restriction is this session's, not the feeds'. Used `WebSearch` as a partial substitute for Troy Hunt (see item 5) — indirect only. No source met the "paywalled/dead, directly observed on 2+ articles" bar, so no PR proposed this run.
