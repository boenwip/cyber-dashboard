# Site map (agreed 2026-11-23)

One job per page. The menu groups pages by what the reader came to do.

## Menu

Desktop: **Today, Play, Stay safe, Learn**, plus a **Get help** button (orange) at the right.
Phone tab bar: **Today, Play, Stay safe, Learn, Help**. "More" goes away.

## Pages

| Group | Page | File | Its one job | Comes from | Status |
|---|---|---|---|---|---|
| Today | Today | `index.html` | Today's top 5 stories, the ACSC alert when there is one | (now) | Done |
| Today | All stories | `stories.html` | Every story, newest first, filter by topic | Dashboard News tab | Done |
| Today | Exploited | `exploited.html` | Flaws attackers are using right now | Dashboard Exploited tab | Done |
| Today | This year | `year.html` | ASD's yearly figures: the running estimate, headline numbers, breakdown, AI findings | Dashboard This year tab | Done |
| Play | Spot the scam | `play.html` | Today's puzzle | Dashboard Scams tab | Done |
| Stay safe | Stay safe | `safe.html` | Four doors, nothing else | New | Done |
| Stay safe | I've been scammed | `help.html` | What to do first, and who to call | Resources: Report a scam | Done |
| Stay safe | Check a breach | `breach.html` | Is my email in a leak? | Resources: breach check | Done |
| Stay safe | Essential Eight | `essential-eight.html` | The eight basics, in plain English | Reference: Essential Eight | Done |
| Stay safe | Using AI safely | `ai-guide.html` | What not to share, writing prompts, prompt library | (now) | Restyle |
| Learn | Learn | `learn.html` | Three doors, plus the word and tip of the day | New; word and tip from the Dashboard | Done |
| Learn | Glossary | `glossary.html` | 51 terms, searchable A to Z | Reference: Glossary | Done |
| Learn | OWASP Top 10 | `owasp.html` | Web, API and LLM lists, for technical readers | Reference: OWASP | Done |
| Learn | Practise | `practise.html` | Courses, tools, practice games, Australian organisations | Resources: Learn, Tools, CTF, Organisations | Done |
| Footer | About and sources | `sources.html` | How the site works | (now) | Restyle |

## Retired

`dashboard.html`, `reference.html` and `resources.html` are short redirect pages (`redirect.js`), so old links and their `#sections` land on the new page. Done.

## Trade-offs

- Exploited and This year leave the phone tab bar. They stay one tap from Today's onward row. They suit technical readers more than the general public.
- Two hub pages (Stay safe, Learn) add a tap, but keep the menu to four words and give phones somewhere simple to land.
- "Get help" is on every page, because someone who has just been scammed shouldn't have to hunt.

## Build order (replaces steps 5 to 7)

1. All stories (finish)
2. This year
3. I've been scammed and Check a breach (Resources split)
4. Essential Eight, Glossary and OWASP (Reference split)
5. Practise
6. Stay safe and Learn hubs, the new menu and tab bar, redirects for retired pages
7. Colours, picked in a live playground, applied site-wide (done: lemon and milk chocolate)
8. Restyle AI Guide and Sources
