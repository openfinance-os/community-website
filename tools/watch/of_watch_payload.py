#!/usr/bin/env python3
"""Structural lint for data/watch/payload.json — no network.

`of_watch_metrics.py verify` proves the NUMBERS match the source logs; this
proves the SHAPE is fit to publish:

  * neutrality — no field is named after a single institution (e.g. a
    per-bank history column or a named economics card); institutions appear
    only as rows/values, never as keys;
  * reader text stays short — long working notes go in `audit` fields, which
    the page shows only inside collapsed "details" panels;
  * every change item carries a machine-readable status + since date, so the
    page derives NEW vs STANDING from dates instead of a typed "CHANGED" label
    that can outlive the change;
  * nothing that goes stale between runs is stored (countdowns are computed by
    the page from the mandate dates);
  * the 5-line "This week" summary is present.

    python3 tools/watch/of_watch_payload.py data/watch/payload.json
"""
import json
import os
import re
import sys

STATUSES = {"new", "changed", "standing", "nochange"}
SUMMARY_AREAS = ["Standards", "Operations", "Adoption", "Deadlines", "Alerts"]
HISTORY_KEYS = {"runDate", "totalFull", "errPct", "paySucc", "authPct", "top1Share",
                "topTppShare", "hhi", "liveLFIs", "liveTPPs", "websiteSpecBranch"}
# Keys may never start with an institution identifier as a whole camelCase word
# ("adcbCalls", "leanTotal", "wio") — "liveLFIs" is fine: "liv" is followed by "e".
INSTITUTIONS = ("adcb", "adib", "dib", "fab", "enbd", "emiratesnbd", "mashreq", "wio", "hsbc",
                "cbd", "nbf", "liv", "lean", "adnic", "aaic", "orient", "awnic", "nymcard",
                "payten", "spare")
INSTITUTION_KEY = re.compile(r"^(?i:" + "|".join(INSTITUTIONS) + r")(?=[A-Z0-9_]|$)")
TYPED_LABEL = re.compile(r"^\s*(NEW|CHANGED|STANDING|MAJOR|UNCHANGED)\b", re.I)
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")
YM = re.compile(r"^\d{4}-\d{2}$")

CAPS = {  # reader-facing text -> max characters
    "summary.text": 200, "alerts.text": 220, "changeLog.text": 280, "board.note": 200,
    "impact.headline": 160, "impact.crossLayer": 320, "impact.what": 420, "impact.effect": 420,
    "breaking.note": 320, "tiers.t2": 260, "tiers.ins": 260, "adoptionNote": 320,
    "fillBasisNote": 300, "repos.note": 200,
}


def _keys(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield f"{path}.{k}" if path else k, k
            yield from _keys(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from _keys(v, f"{path}[{i}]")


REF = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "watch",
                                   "references", "cbuae-of-market-adoption-timeline-2026-01.json"))


def _annexure(path=REF):
    """'<section>: <req>' -> (tier1, tier2) from the CBUAE Annexure reference file."""
    d = json.load(open(path))
    return {f"{sec}: {t['req']}": (t["tier1"], t["tier2"])
            for sec, v in d.items() if isinstance(v, dict) and "timeline" in v for t in v["timeline"]}


def lint(p, annexure=None):
    out = []
    annexure = annexure if annexure is not None else _annexure()

    def cap(name, text, where):
        if text is not None and len(str(text)) > CAPS[name]:
            out.append(f"{where} is {len(str(text))} chars (max {CAPS[name]}) — move detail to an audit field")

    def typed(text, where):
        if TYPED_LABEL.match(str(text or "")):
            out.append(f"{where} starts with a typed status label — use the status/since fields instead")

    def item(it, where, need_url=False):
        if not isinstance(it, dict):
            out.append(f"{where} must be an object with status/since/text")
            return
        if it.get("status") not in STATUSES:
            out.append(f"{where}.status {it.get('status')!r} not in {sorted(STATUSES)}")
        if not ISO.match(str(it.get("since", ""))):
            out.append(f"{where}.since {it.get('since')!r} is not an ISO date")
        elif p.get("checked", {}).get("date") and it["since"] > p["checked"]["date"]:
            out.append(f"{where}.since {it['since']} is after checked.date")
        elif it.get("status") in ("new", "changed") and p.get("runDate") and it["since"] < p["runDate"]:
            out.append(f"{where} is labelled {it['status']!r} but dates from {it['since']}, before this "
                       f"run ({p['runDate']}) — relabel it 'standing'")
        typed(it.get("text"), f"{where}.text")
        if need_url and it.get("status") != "nochange" and not it.get("url"):
            out.append(f"{where} has no source url")

    # neutrality
    for path, key in _keys(p):
        if INSTITUTION_KEY.match(key):
            out.append(f"institution-specific field name: {path}")

    # freshness
    ck = p.get("checked")
    if not isinstance(ck, dict) or not ISO.match(str(ck.get("date", ""))):
        out.append("checked.date missing — the page cannot say when the watch last looked")
    elif p.get("runDate") and ck["date"] < p["runDate"]:
        out.append("checked.date is before runDate")

    # summary
    s = p.get("summary") or []
    if [x.get("area") for x in s] != SUMMARY_AREAS:
        out.append(f"summary must have exactly these areas in order: {SUMMARY_AREAS}")
    for i, x in enumerate(s):
        if x.get("status") not in STATUSES:
            out.append(f"summary[{i}].status {x.get('status')!r} invalid")
        cap("summary.text", x.get("text"), f"summary[{i}].text")

    for i, a in enumerate(p.get("alerts") or []):
        item(a, f"alerts[{i}]", need_url=True)
        if isinstance(a, dict):
            cap("alerts.text", a.get("text"), f"alerts[{i}].text")
    for i, c in enumerate(p.get("changeLog") or []):
        item(c, f"changeLog[{i}]", need_url=True)
        if isinstance(c, dict):
            cap("changeLog.text", c.get("text"), f"changeLog[{i}].text")

    for i, b in enumerate(p.get("board") or []):
        for stale in ("t1DaysLeft", "t2DaysLeft", "band"):
            if stale in b:
                out.append(f"board[{i}].{stale} is stored — countdowns/bands must be computed by the page")
        for due in ("t1Due", "t2Due"):
            if b.get(due) not in (None, "N/A") and not YM.match(str(b.get(due))):
                out.append(f"board[{i}].{due} {b.get(due)!r} is not YYYY-MM")
        ref = annexure.get(b.get("ref"))
        if ref is None:
            out.append(f"board[{i}].ref {b.get('ref')!r} does not name a line in the CBUAE Annexure reference")
        elif (b.get("t1Due"), b.get("t2Due")) != ref:
            out.append(f"board[{i}] due dates {b.get('t1Due')}/{b.get('t2Due')} differ from the Annexure ({ref[0]}/{ref[1]})")
        if "status" in b or "since" in b:
            item(b, f"board[{i}]")
        typed(b.get("note"), f"board[{i}].note")
        cap("board.note", b.get("note"), f"board[{i}].note")

    imp = p.get("impact") or {}
    cap("impact.headline", imp.get("headline"), "impact.headline")
    cap("impact.crossLayer", imp.get("crossLayer"), "impact.crossLayer")
    for i, r in enumerate(imp.get("rows") or []):
        typed(r[0], f"impact.rows[{i}][0]")
        cap("impact.what", r[2], f"impact.rows[{i}][2]")
        cap("impact.effect", r[3], f"impact.rows[{i}][3]")
    cap("breaking.note", (p.get("breaking") or {}).get("note"), "breaking.note")
    for k in ("t2", "ins"):
        cap(f"tiers.{k}", (p.get("tiers") or {}).get(k), f"tiers.{k}")
    cap("adoptionNote", p.get("adoptionNote"), "adoptionNote")
    cap("fillBasisNote", p.get("fillBasisNote"), "fillBasisNote")
    for i, r in enumerate(p.get("repos") or []):
        cap("repos.note", r[2], f"repos[{i}][2]")

    for i, h in enumerate(p.get("history") or []):
        extra = set(h) - HISTORY_KEYS
        if extra:
            out.append(f"history[{i}] has non-ecosystem fields {sorted(extra)}")
    if "status" in p:
        out.append("top-level 'status' prose belongs in audit.run")
    if "note" in (p.get("eco") or {}):
        out.append("eco.note is free text naming an institution — the page builds this sentence from eco.top1")
    return out


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "data/watch/payload.json"
    problems = lint(json.load(open(path)))
    for x in problems:
        print("  FAIL ", x)
    print(f"{path}: {len(problems)} problem(s)")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
