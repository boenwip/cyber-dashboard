# pseudosec. — Content Integrity Report

Overwritten by the Content Integrity Agent on each run; past runs are in this file's git history.

## 2026-10-08 (09:19 AEDT) — routine content check

**Data snapshot reviewed:** `origin/data` commit `3861be6`, 2026-10-06T13:34:12Z (07-10-2026 00:34 AEDT) — unchanged since yesterday's run. This is now **~32.75 hours old** on what is currently a weekday (Thursday), well past the ~24h threshold, because the pipeline itself is broken — see finding #1.

**Needs attention**

1. **CRITICAL, new: the deploy pipeline has been failing on every scheduled run for over 24h — the live site has stopped updating.** Three consecutive scheduled `deploy.yml` runs (run #44 2026-10-07T00:37Z, #45 05:42Z, #46 13:10Z — the most recent) all failed the same audit check: `✗ data/tool_updates.json: text fields contain no markup — ["What's changed Added --marketplace <source> to claude plugin install : adds the marketplace if needed..."]`. Because `audit.py` runs before the Pages publish and before the `data` branch snapshot commit in the same job, every one of these runs aborted before publishing or committing — no new data has reached either `main`'s deployed site or the `data` branch since the last success (run #43, 2026-10-06T13:32Z). At least 3 scheduled runs (and likely more that should have fired since 13:10Z given the weekday 30-min schedule) have been silently failing.
   **Root cause traced:** `fetch_cyber_news.py`'s `strip_html()` (line 394-397) does regex tag-stripping *before* `html.unescape()`. The "Claude Code Releases" feed (`https://github.com/anthropics/claude-code/releases.atom`, in `TOOL_FEEDS`) contains release-note markdown like `` `--marketplace <source>` ``, which GitHub's Atom feed renders as HTML with the angle brackets entity-escaped (`&lt;source&gt;`) inside a real `<code>` tag. `strip_html` strips the real `<code>` tag first (no entities to decode yet), *then* unescapes `&lt;source&gt;` into a literal `<source>` — producing fresh angle-bracket text the tag-stripping step never sees. `audit.py`'s markup check (`re.search(r"<[a-zA-Z/!]", ...)`) then correctly flags that literal `<source>` as unstripped markup and fails the build. This will keep failing every run until that Claude Code release item ages out of the feed's top 5 entries or the escape order is fixed — this is a code bug, not a content call, so outside what I can change (report only), but it is blocking every deploy until fixed.
   **Impact:** the public dashboard has been serving the same news/CVE/tool-update snapshot for 32+ hours and will keep doing so on every future run until this is fixed, regardless of anything else in this report.

2. **Carried forward, unchanged (3rd+ run, re-confirmed today against ACSC's own page via WebSearch): Essential Eight page overstates ACSC's guidance.** `reference.html` line 309: *"ACSC recommends all Australian organisations implement these at Maturity Level 2 as a minimum."* ACSC's actual Essential Eight Maturity Model guidance is risk-based — organisations pick a target level based on their own threat exposure and the consequences of a breach, implementing all eight strategies to the same level before moving higher. There is no blanket "Level 2 minimum for all organisations" statement in ACSC's own material.

3. **Carried forward (4th+ run, now ~11+ days open): no new snapshot exists since yesterday, so the following items from the 2026-10-07 report are unchanged and still open** (not re-derived today — same `groups.json`/`news.json`, see finding #1 for why):
   - OpenAI/Medicare government-breach cluster mis-merged (a Home Affairs stocktake "new official response" folded into the original breach-disclosure story as its lead; the original disclosure itself is still split, ungrouped, across ACM/Google News-Register/BleepingComputer).
   - NetScaler story possibly paired with the wrong ACM follow-up (code's one-article-per-outlet rule forced apart two same-day ACM pieces; the later, more escalated headline was kept over the next-day one that was confirmed correct last run).
   - `AU Cyber` tag gap on the OpenAI/government-breach cluster (keyword list still lacks "breach," "hacked," "accessed," "legacy system," "compromised").
   - Recurring low-value/off-topic filler tagged `AI & Tools` (404 Media's LLM-torture and fake-witness pieces, iTnews' "OpenAI takes on Meta with dots agent").
   - Security Brief Australia's TA419 phishing piece over-tagged `Compliance` via a bare "regulation" keyword match.

**Resolved since last run**

- Nothing new resolved — no new snapshot/code changes landed on `main` since yesterday's report besides this file.

**Checked this run**

1. **Grouping sanity** — no new snapshot to check; `groups.json` unchanged (`method: ai`, spend $0.072939/month, well under the $2 flag). See finding #3 for carried-forward items.
2. **Live data sanity** — the headline finding this run: the pipeline that produces this data has been broken for 32+ hours (finding #1). Traced via GitHub Actions run history and job logs, not assumed.
3. **Value and readability** — not re-sampled; no new articles since yesterday's full sample of 8.
4. **Reference accuracy** — re-verified the Essential Eight Maturity Level claim (finding #2) against ACSC's own Essential Eight Maturity Model guidance via WebSearch (WebFetch to cyber.gov.au was blocked by the egress proxy, consistent with every prior run). Confirmed still overstated.
5. **AI Guide safety** — `AU_HELP` constant in `ai-guide.js` (lines 17-19) re-confirmed correct and unchanged: ReportCyber (cyber.gov.au/report), Scamwatch (scamwatch.gov.au), IDCARE (1800 595 160), Australian Cyber Security Hotline (1300 292 371). Comment at line 17 says contacts were "verified September 2026" — still accurate.
6. **Source health** — WebFetch blocked by the network egress proxy for every domain attempted (cyber.gov.au, risky.biz) — consistent with every prior run; reads as an organisation-policy domain block, not a transient tool outage. No dead/paywalled source confirmed this run, so no removal PR opened.
