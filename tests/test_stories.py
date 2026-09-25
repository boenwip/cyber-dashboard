"""Tests for scripts/stories.py (story grouping). Run: python -m pytest tests"""
import json
import os
import sys
from types import SimpleNamespace

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import stories as st  # noqa: E402


def art(title, source="Outlet", date="2026-09-24T01:00:00Z", summary="", link=None, **kw):
    return dict(title=title, source=source, date=date, summary=summary,
                link=link or "https://example.com/" + str(abs(hash(title))), tags=kw.pop("tags", ["AU Cyber"]), **kw)


MEDICARE = [
    art("OpenAI Breaches Australian Government Database", "Security Brief Australia", summary="Weak controls left Australia's Medicare database exposed after an AI agent pressed past access restrictions."),
    art("OpenAI hacked Australian Medicare govt site, probed data providers - bleepingcomputer.com", "Google News — Bleeping Computer AU"),
    art("Australian Medicare data portal \"infiltrated\" by OpenAI agent", "iTnews", summary="An OpenAI agent infiltrated a Medicare statistics portal and accessed non-public files."),
    art("Ropes & Gray develops OpenAI tool for deal diligence", "Security Brief Australia", tags=["AI & Tools"]),
]


class FakeClient:
    def __init__(self, payload, stop="end_turn"):
        self.payload, self.stop, self.calls = payload, stop, 0
        self.messages = self

    def create(self, **kwargs):
        self.calls += 1
        self.kwargs = kwargs
        return SimpleNamespace(stop_reason=self.stop, usage=SimpleNamespace(input_tokens=100, output_tokens=10),
                               content=[SimpleNamespace(type="text", text=json.dumps(self.payload))])


# ── Validation ─────────────────────────────────────────────

def test_validate_drops_bad_ids_duplicates_and_singletons():
    raw = {"groups": [[0, 1, 1, 99], [1, 2], [3], ["x", 4, True]]}
    assert st.validate_groups(raw, 5) == [[0, 1]]


def test_validate_rejects_wrong_shape():
    assert st.validate_groups({"clusters": []}, 3) is None
    assert st.validate_groups([[0, 1]], 3) is None


# ── AI grouping ────────────────────────────────────────────

def test_ai_groups_uses_haiku_with_json_schema():
    client = FakeClient({"groups": [[0, 1, 2]]})
    assert st.ai_groups(MEDICARE, client) == [[0, 1, 2]]
    assert client.kwargs["model"] == "claude-haiku-4-5"
    assert client.kwargs["output_config"]["format"]["type"] == "json_schema"
    # Headlines are sent without the Google News publisher suffix
    assert "bleepingcomputer.com" not in client.kwargs["messages"][0]["content"]


def test_ai_groups_rejects_truncated_output():
    assert st.ai_groups(MEDICARE, FakeClient({"groups": [[0, 1]]}, stop="max_tokens")) is None


def test_ai_groups_without_key_returns_none(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert st.ai_groups(MEDICARE) is None


# ── Fallback word matching ─────────────────────────────────

def test_word_groups_never_merges_different_stories():
    groups = st.word_groups(MEDICARE)
    assert all(3 not in g for g in groups)   # Ropes & Gray stays separate


# ── Cache ──────────────────────────────────────────────────

def test_unchanged_articles_reuse_cached_ai_grouping(tmp_path):
    path = str(tmp_path / "groups.json")
    first = FakeClient({"groups": [[0, 1, 2]]})
    assert st.choose_groups(MEDICARE, first, path) == ([[0, 1, 2]], "ai")
    second = FakeClient({"groups": []})
    groups, method = st.choose_groups(MEDICARE, second, path)
    assert (groups, method, second.calls) == ([[0, 1, 2]], "ai-cached", 0)


def test_new_article_triggers_a_fresh_call(tmp_path):
    path = str(tmp_path / "groups.json")
    st.choose_groups(MEDICARE, FakeClient({"groups": [[0, 1, 2]]}), path)
    again = FakeClient({"groups": [[0, 1, 2]]})
    st.choose_groups(MEDICARE + [art("Unrelated new story")], again, path)
    assert again.calls == 1


def test_failed_ai_call_falls_back_to_words(tmp_path):
    class Broken:
        class messages:
            @staticmethod
            def create(**kw):
                raise RuntimeError("down")
    groups, method = st.choose_groups(MEDICARE, Broken(), str(tmp_path / "g.json"))
    assert method == "words"


# ── Building stories ───────────────────────────────────────

def test_build_stories_collapses_group_and_prefers_direct_feed_as_lead():
    items = st.build_stories(MEDICARE, [[0, 1, 2]])
    assert len(items) == 2
    story = next(s for s in items if s.get("coverage"))
    assert not story["source"].startswith("Google News")
    assert len(story["coverage"]) == 2
    assert {c["source"] for c in story["coverage"]} | {story["source"]} == {a["source"] for a in MEDICARE[:3]}


def test_official_item_leads_its_story():
    items = [art("Press coverage", "iTnews", summary="x" * 200), art("ACSC alert", "ACSC Alerts", official=True, threat="High")]
    story = st.build_stories(items, [[0, 1]])[0]
    assert story["official"] and story["coverage"][0]["source"] == "iTnews"


def test_developing_story_sorts_by_latest_coverage():
    items = [art("Old lead", date="2026-09-20T00:00:00Z"), art("Fresh single", date="2026-09-23T00:00:00Z"),
             art("Newest follow-up", date="2026-09-24T00:00:00Z")]
    ordered = st.build_stories(items, [[0, 2]])
    assert ordered[0]["coverage"]


def test_word_groups_skip_same_outlet_series_titles():
    eps = [art("Risky Business #854 -- We're Jevpilled", "Risky Business"),
           art("Risky Business #853 -- We're all gonna die, apparently", "Risky Business")]
    assert st.word_groups(eps) == []
