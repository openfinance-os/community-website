#!/usr/bin/env python3
"""No-network tests for of_watch_payload.lint.

Run:  python3 tools/watch/test_of_watch_payload.py
"""
import copy
import of_watch_payload as L

AREAS = ["Standards", "Operations", "Adoption", "Deadlines", "Alerts"]
GOOD = {
    "runDate": "2026-09-21",
    "checked": {"date": "2026-09-28", "result": "no change"},
    "summary": [{"area": a, "status": "nochange", "text": "No change."} for a in AREAS],
    "alerts": [{"status": "standing", "since": "2026-09-01", "text": "Corporate mandate passed.", "url": "https://x"}],
    "changeLog": [{"title": "Specs", "layer": "standards", "status": "nochange", "since": "2026-08-24", "text": "No change."}],
    "board": [{"rel": "Retail R1", "ref": "openBanking: Retail Payments & Data – R1", "t1Due": "2025-09", "t2Due": "2026-09", "note": "8/8 live."}],
    "history": [{"runDate": "2026-09-21", "totalFull": 1, "errPct": 1.0}],
    "eco": {"top1": "TPP A", "top1share": 86.0},
    "economics": {"head": {"topTpp": {"name": "TPP A"}, "topLfis": []}},
}


def expect(name, payload, needle):
    probs = L.lint(payload)
    hit = [p for p in probs if needle in p]
    assert hit, f"{name}: expected a problem containing {needle!r}, got {probs}"
    print(f"  ok  {name}")


def main():
    GOOD["history"][0]["liveLFIs"] = 16  # starts with "liv" but is not an institution key
    assert L.lint(GOOD) == [], L.lint(GOOD)
    print("  ok  well-formed payload passes")

    p = copy.deepcopy(GOOD); p["history"][0]["adcbCalls"] = 5
    expect("single-bank history column rejected", p, "non-ecosystem fields")
    p = copy.deepcopy(GOOD); p["economics"]["head"]["leanTotal"] = 1
    expect("named economics card rejected", p, "institution-specific field name")
    p = copy.deepcopy(GOOD); p["board"][0]["t1DaysLeft"] = -20
    expect("stored countdown rejected", p, "computed by the page")
    p = copy.deepcopy(GOOD); p["alerts"] = ["STANDING: legacy string alert"]
    expect("untyped alert rejected", p, "must be an object")
    p = copy.deepcopy(GOOD); p["alerts"][0]["status"] = "CHANGED"
    expect("free-text status rejected", p, "status 'CHANGED'")
    p = copy.deepcopy(GOOD); p["alerts"][0]["since"] = "2026-10-01"
    expect("future since date rejected", p, "after checked.date")
    p = copy.deepcopy(GOOD); p["alerts"][0]["status"] = "new"
    expect("NEW label that outlived its run rejected", p, "relabel it 'standing'")
    p = copy.deepcopy(GOOD); del p["alerts"][0]["url"]
    expect("change without a source link rejected", p, "no source url")
    p = copy.deepcopy(GOOD); p["board"][0]["note"] = "x" * 400
    expect("long reader note rejected", p, "max 200")
    p = copy.deepcopy(GOOD); p["summary"] = p["summary"][:4]
    expect("incomplete summary rejected", p, "summary must have")
    p = copy.deepcopy(GOOD); p["board"][0]["note"] = "CHANGED: FAB registered bulk"
    expect("typed status prefix in a note rejected", p, "typed status label")
    p = copy.deepcopy(GOOD); del p["checked"]
    expect("missing heartbeat rejected", p, "checked.date missing")
    p = copy.deepcopy(GOOD); p["eco"]["note"] = "TPP A handles 86%"
    expect("free-text concentration note rejected", p, "eco.note")
    p = copy.deepcopy(GOOD); p["board"][0]["t1Due"] = "Sep-2025"
    expect("non-ISO due month rejected", p, "not YYYY-MM")
    p = copy.deepcopy(GOOD); p["board"][0]["t2Due"] = "2026-10"
    expect("due date that disagrees with the CBUAE Annexure rejected", p, "differ from the Annexure")
    p = copy.deepcopy(GOOD); p["board"][0]["ref"] = "made up"
    expect("board row without an Annexure line rejected", p, "does not name a line")
    print("\nall of_watch_payload tests passed")


if __name__ == "__main__":
    main()
