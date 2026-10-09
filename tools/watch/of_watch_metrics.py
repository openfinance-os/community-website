#!/usr/bin/env python3
"""Deterministic metrics recompute + self-consistency verifier for the Watch.

WHY THIS EXISTS
---------------
The weekly routine (tools/watch/routine-prompt.md) mandates recomputing EVERY
figure from the freshly downloaded logs each run and NEVER copying a number
forward. Historically that recompute was re-implemented ad-hoc in inline Python
each run, which let two bug classes creep in:

  1. Float money drift — payment values summed as float AED instead of integer
     fils, producing off-by-a-few-cents totals.
  2. Copy-forward / hand-edit error — e.g. a "$9 rounding correction" that was
     internally self-consistent (aggregate and monthly bucket both moved) yet
     no longer matched the raw source. The routine's own assertion (d)
     (`payActivity.allTime == sum(payActivity.vals)`) checks INTERNAL
     consistency, so it cannot catch a value that drifted from the log.

This module is the single, tested source of the log-derived numbers. `compute`
aggregates them from the three logs (money in integer fils); `verify`
recomputes from source and checks an existing payload.json to the digit —
catching both internal-consistency failures AND fidelity-to-source drift.

It covers only the purely log-derived block (headline, activity, payActivity,
payments, authPct, eco). The production board, tierMatrix and economics blocks
have their own tools (of_watch_production.py) / are assembled by the run.

API LOG FORMAT
--------------
As of 2026-09, `api-log.json` itself 200s with the site's HTML shell instead
of a flat JSON array — the log moved to a sharded, dictionary-encoded format:
`api-log-index.json` lists per-quarter shard filenames (e.g.
`api-log-q3-26.json`), each shaped `{v, fields, dicts, rows}` where `fields`
gives the column order and, for columns also present as a key in `dicts`,
each row stores an index into `dicts[<field>]` rather than the raw value.
`_get_api_rows` fetches the index + every shard and decodes them into the
same flat list-of-dicts shape `compute()` has always consumed, so callers
never see the wire format. It falls back to the legacy flat-array URL if the
index is ever retired, and a local `--api` snapshot may be either shape
(flat rows, or a single already-fetched shard dict) — both decode correctly.

USAGE
-----
    # recompute from the live logs, print the metric fragment
    python3 tools/watch/of_watch_metrics.py compute

    # recompute from local log snapshots (offline / testing)
    python3 tools/watch/of_watch_metrics.py compute \
        --api /tmp/api.json --auth /tmp/auth.json --pay /tmp/payments.json

    # verify a payload against a fresh recompute; exit 1 on any mismatch
    python3 tools/watch/of_watch_metrics.py verify --payload data/watch/payload.json

    # has the source data advanced since the last run? drives the early-exit
    python3 tools/watch/of_watch_metrics.py guard --state data/watch/state.json
        exit 0 = data advanced (do the full recompute + commit + history append;
                 also reset state["asOfDataSince"] to today when you write state.json)
        exit 3 = unchanged, and not stale (skip the heavy recompute/commit;
                 only daysLeft moves)
        exit 4 = unchanged AND stale — asOfData has not advanced in
                 --stale-days days (default 10) since state["asOfDataSince"].
                 Same skip behaviour as exit 3, but the caller should also
                 raise this as its own §2 alert (new the run it first crosses
                 the threshold; standing/escalating every run after, until
                 asOfData next advances) — it means the upstream Nebras log
                 feed itself may have stalled, not just that this run landed
                 on a quiet day. Use --today/--stale-days to override the
                 clock/threshold (e.g. for testing).
"""
import argparse
import json
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import date
from decimal import Decimal

API_URL = "https://nebras-open-finance.com/api/api-log.json"
API_INDEX_URL = "https://nebras-open-finance.com/api/api-log-index.json"
API_BASE_URL = "https://nebras-open-finance.com/api/"
AUTH_URL = "https://nebras-open-finance.com/api/auth-log.json"
PAY_URL = "https://nebras-open-finance.com/api/payments-log.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36")

MONTH_ABBR = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
VERSION_RE = re.compile(r"/v(\d+\.\d+)/")


# ---------------------------------------------------------------- io helpers
def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                               "Accept": "application/json,*/*"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def _load(path, url):
    return json.load(open(path)) if path else _get(url)


def _decode_shard(shard):
    """A sharded api-log file: {v, fields, dicts, rows} -> flat list of dicts."""
    fields, dicts = shard["fields"], shard.get("dicts", {})
    out = []
    for row in shard["rows"]:
        rec = {}
        for i, f in enumerate(fields):
            v = row[i]
            rec[f] = dicts[f][v] if f in dicts else v
        out.append(rec)
    return out


def _rows_from_api_json(data):
    """Accept either the legacy flat row array or one decoded/raw shard dict."""
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "rows" in data and "fields" in data:
        return _decode_shard(data)
    raise ValueError("unrecognized api log format (expected a flat row array "
                      "or a {fields,dicts,rows} shard)")


def _get_api_rows(path, url):
    """Load the api-call log, transparently decoding the sharded format.

    A local --api snapshot may be a flat array or a single shard dict — both
    decode via _rows_from_api_json. A live fetch tries the sharded index
    first (the current wire format: api-log-index.json lists per-quarter
    shard files under the same /api/ path), concatenating every shard; if the
    index is unavailable it falls back to the legacy flat-array URL.
    """
    if path:
        return _rows_from_api_json(json.load(open(path)))
    try:
        index = _get(API_INDEX_URL)
    except Exception:
        index = None
    if isinstance(index, dict) and index.get("shards"):
        rows = []
        for shard_name in index["shards"]:
            rows.extend(_decode_shard(_get(API_BASE_URL + shard_name)))
        return rows
    return _rows_from_api_json(_get(url))


def _fils(amount):
    """AED amount -> integer fils, exactly (no binary-float rounding)."""
    return int((Decimal(str(amount)) * 100).to_integral_value())


def _months(rows):
    """(all months sorted, full months, partial month). Partial = latest month;
    full = every month strictly before it — the basis the routine mandates."""
    ms = sorted({r["date"][:7] for r in rows})
    partial = ms[-1]
    return ms, [m for m in ms if m < partial], partial


def _abbr(ym):
    return MONTH_ABBR[int(ym[5:7])]


def _mom(vals_full):
    if len(vals_full) < 2 or not vals_full[-2]:
        return 0.0
    return round(100 * (vals_full[-1] - vals_full[-2]) / vals_full[-2], 1)


# ------------------------------------------------------------------ compute
def compute(api, auth, pay):
    ms, full, partial = _months(api)
    fullset = set(full)
    is_full = lambda r: r["date"][:7] in fullset

    # -- transaction activity (weight by totalapicalls, all response groups) --
    per_month = defaultdict(float)
    for r in api:
        per_month[r["date"][:7]] += r["totalapicalls"]
    vals = [int(per_month[m]) for m in ms]
    full_vals = [int(per_month[m]) for m in full]
    total_all = int(sum(per_month.values()))
    total_full = int(sum(per_month[m] for m in full))

    err_full = sum(r["totalapicalls"] for r in api
                   if is_full(r) and r["tppresponsecodegroup"] in ("4xx", "5xx"))
    err_pct = round(100 * err_full / total_full, 1) if total_full else 0.0

    ver = defaultdict(float)
    for r in api:
        if not is_full(r):
            continue
        m = VERSION_RE.search(r["url"])
        if m:
            ver["v" + m.group(1)] += r["totalapicalls"]
    by_version = [[v, round(100 * c / total_full, 1)]
                  for v, c in sorted(ver.items(), key=lambda kv: -kv[1])]

    live_lfis = len({r["lfinamekey"] for r in api
                     if is_full(r) and r["totalapicalls"] > 0})
    live_tpps = len({r["tppname"] for r in api if is_full(r) and r["tppname"]})

    activity = _series(ms, full, vals, full_vals, total_all, total_full, partial,
                       money=False)

    # -- payments: value is accepted-only, integer fils; counts full-months ---
    accepted = lambda r: r["status"].startswith("Accepted")
    pay_month_fils = defaultdict(int)
    for r in pay:
        if accepted(r):
            pay_month_fils[r["date"][:7]] += _fils(r["amount"])
    pay_vals = [round(pay_month_fils[m] / 100, 2) for m in ms]
    pay_full_vals = [round(pay_month_fils[m] / 100, 2) for m in full]
    pay_all_fils = sum(pay_month_fils[m] for m in ms)
    pay_full_fils = sum(pay_month_fils[m] for m in full)

    status_ct = defaultdict(float)
    tot_ct = 0.0
    acc_ct = 0.0
    for r in pay:
        if not is_full(r):
            continue
        status_ct[r["status"]] += r["count"]
        tot_ct += r["count"]
        if accepted(r):
            acc_ct += r["count"]
    rows = [[s, int(c)] for s, c in sorted(status_ct.items(), key=lambda kv: -kv[1])]
    success_pct = round(100 * acc_ct / tot_ct, 1) if tot_ct else 0.0

    payments = {"rows": rows, "successPct": success_pct,
                "valueAED": round(pay_full_fils / 100, 2)}
    pay_activity = _series(ms, full, pay_vals, pay_full_vals,
                           round(pay_all_fils / 100, 2), round(pay_full_fils / 100, 2),
                           partial, money=True)
    pay_activity["ccy"] = "AED"

    # -- auth 2xx share (full-months, weight by totalapicalls) ---------------
    a2 = sum(r["totalapicalls"] for r in auth
             if is_full(r) and r["tppresponsecodegroup"] == "2xx")
    a_tot = sum(r["totalapicalls"] for r in auth if is_full(r))
    auth_pct = round(100 * a2 / a_tot, 1) if a_tot else 0.0

    # -- concentration (attributed traffic, full-months) ---------------------
    tpp_calls = defaultdict(float)
    for r in api:
        if is_full(r) and r["tppname"]:
            tpp_calls[r["tppname"]] += r["totalapicalls"]
    attributed = sum(tpp_calls.values())
    top1 = max(tpp_calls, key=tpp_calls.get)
    top1_share = round(100 * tpp_calls[top1] / attributed, 1)
    hhi = round(sum((100 * v / attributed) ** 2 for v in tpp_calls.values()))

    return {
        "asOfData": max(r["date"][:10] for r in api),
        "months": full,
        "curPartial": partial,
        "headline": {"totalAll": total_all, "totalFull": total_full,
                     "errPct": err_pct, "byVersion": by_version,
                     "liveLFIs": live_lfis, "liveTPPs": live_tpps},
        "activity": activity,
        "payments": payments,
        "payActivity": pay_activity,
        "authPct": auth_pct,
        "eco": {"top1": top1, "top1share": top1_share, "hhi": hhi,
                "attributed": round(attributed, 1)},
    }


def _series(ms, full, vals, full_vals, all_total, full_total, partial, money):
    r2 = (lambda x: round(x, 2)) if money else (lambda x: int(x))
    peak_i = max(range(len(full_vals)), key=lambda i: full_vals[i]) if full_vals else 0
    avg3 = None
    if not money and full_vals:
        tail = full_vals[-3:]
        avg3 = int(sum(tail) / len(tail))
    out = {
        "months": [_abbr(m) for m in ms],
        "vals": [r2(v) for v in vals],
        "partialIdx": len(ms) - 1,
        "lastFullLabel": _abbr(full[-1]) if full else "",
        "lastFullVal": r2(full_vals[-1]) if full_vals else r2(0),
        "momPct": _mom(full_vals),
        "peakLabel": _abbr(full[peak_i]) if full_vals else "",
        "peakVal": r2(full_vals[peak_i]) if full_vals else r2(0),
        "allTime": r2(all_total),
        "fullTotal": r2(full_total),
        "partialLabel": _abbr(partial),
        "partialVal": r2(vals[-1]) if vals else r2(0),
    }
    if not money:
        out["monthsFull"] = list(full)
        out["avg3"] = avg3
    return out


# ------------------------------------------------------------------- verify
def _cmp(checks, name, payload_val, computed_val):
    checks.append((name, payload_val == computed_val, payload_val, computed_val))


def verify(payload, computed):
    """Return a list of (name, ok, payload_value, computed_value) checks.

    Covers (1) fidelity — every log-derived payload field equals the fresh
    recompute — and (2) the routine's internal-consistency assertions (a),(b),(d).
    """
    c = []
    h, ch = payload["headline"], computed["headline"]
    _cmp(c, "headline.totalAll", h["totalAll"], ch["totalAll"])
    _cmp(c, "headline.totalFull", h["totalFull"], ch["totalFull"])
    _cmp(c, "headline.errPct", h["errPct"], ch["errPct"])
    _cmp(c, "headline.byVersion", h["byVersion"], ch["byVersion"])
    _cmp(c, "headline.liveLFIs", h["liveLFIs"], ch["liveLFIs"])
    _cmp(c, "headline.liveTPPs", h["liveTPPs"], ch["liveTPPs"])
    _cmp(c, "authPct", payload["authPct"], computed["authPct"])

    for k in ("top1", "top1share", "hhi", "attributed"):
        _cmp(c, f"eco.{k}", payload["eco"][k], computed["eco"][k])

    pp, cp = payload["payments"], computed["payments"]
    _cmp(c, "payments.successPct", pp["successPct"], cp["successPct"])
    _cmp(c, "payments.valueAED", pp["valueAED"], cp["valueAED"])
    _cmp(c, "payments.rows", pp["rows"], cp["rows"])

    for block in ("activity", "payActivity"):
        pv, cv = payload[block], computed[block]
        for key in ("vals", "allTime", "fullTotal", "momPct", "lastFullVal",
                    "peakVal", "partialVal", "partialIdx"):
            _cmp(c, f"{block}.{key}", pv.get(key), cv.get(key))

    # internal-consistency assertions from the routine (independent of source)
    a = payload["activity"]
    _cmp(c, "assert(a): totalAll==activity.allTime==sum(vals)",
         h["totalAll"] == a["allTime"] == sum(a["vals"]), True)
    _cmp(c, "assert(b): totalFull==activity.fullTotal==sum(full vals)",
         h["totalFull"] == a["fullTotal"] == sum(a["vals"][:a["partialIdx"]]), True)
    pa = payload["payActivity"]
    _cmp(c, "assert(d): payActivity.allTime==sum(vals) & fullTotal==sum(full)",
         round(pa["allTime"], 2) == round(sum(pa["vals"]), 2)
         and round(pa["fullTotal"], 2) == round(sum(pa["vals"][:pa["partialIdx"]]), 2),
         True)
    return c


# -------------------------------------------------------------------- guard
# Headline signals that, together with asOfData, decide whether a run carries
# any new information. If none moved, the run is a no-op beyond the daily
# daysLeft re-stamp: skip the heavy recompute/commit and the history append.
# Each entry bridges the computed (payload-shaped) value to its state.metrics
# key, since state.json stores metrics under its own names.
GUARD_KEYS = [
    ("headline.totalFull", ["headline", "totalFull"], ["metrics", "totalCallsFullMonthsOnly"]),
    ("headline.errPct", ["headline", "errPct"], ["metrics", "errorRatePct"]),
    ("payments.successPct", ["payments", "successPct"], ["metrics", "paymentSuccessRatePct"]),
    ("authPct", ["authPct"], ["metrics", "authSuccess2xxPct"]),
]


def _dig(d, path):
    for k in path:
        if not isinstance(d, dict) or k not in d:
            return None
        d = d[k]
    return d


def guard(state, computed, today=None, stale_days_threshold=10):
    """(advanced, reasons, stale_days). advanced=True if the source data moved
    since the stored state. asOfData (a new data cutoff) is the primary,
    authoritative signal; the headline metrics are a secondary safety net for
    the case where the feed is corrected in place without advancing the date.

    stale_days is None when advanced (the caller should reset
    state["asOfDataSince"] to `today`) or when staleness can't be computed
    (no `today` given, or state has no asOfDataSince/asOfData to anchor on).
    Otherwise it is the number of days since the CURRENT asOfData value was
    first observed (state["asOfDataSince"], falling back to state["asOfData"]
    for state written before this field existed) — i.e. how long the upstream
    Nebras log feed itself has gone without posting a new date, as opposed to
    just this run happening to land on a quiet day. A caller should treat
    stale_days >= stale_days_threshold as its own alert (the feed may have
    stalled upstream), independent of whether any other §2 alert fired."""
    reasons = []
    prev_asof = state.get("asOfData")
    if prev_asof != computed["asOfData"]:
        reasons.append(f"asOfData {prev_asof} -> {computed['asOfData']}")
    for label, cpath, spath in GUARD_KEYS:
        pv, cv = _dig(state, spath), _dig(computed, cpath)
        if pv is not None and pv != cv:
            reasons.append(f"{label} {pv} -> {cv}")
    advanced = bool(reasons)
    stale_days = None
    if not advanced and today:
        since = state.get("asOfDataSince") or state.get("asOfData")
        if since:
            stale_days = (date.fromisoformat(today) - date.fromisoformat(since)).days
    return (advanced, reasons, stale_days)


# --------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("compute", "verify", "guard"):
        s = sub.add_parser(name)
        s.add_argument("--api")
        s.add_argument("--auth")
        s.add_argument("--pay")
        if name == "compute":
            s.add_argument("--out")
        elif name == "verify":
            s.add_argument("--payload", required=True)
        else:
            s.add_argument("--state", required=True)
            s.add_argument("--today", help="ISO date to compute staleness against (default: today)")
            s.add_argument("--stale-days", type=int, default=10,
                            help="alert if asOfData hasn't advanced in this many days (default: 10)")
    a = ap.parse_args()

    api = _get_api_rows(a.api, API_URL)
    auth = _load(a.auth, AUTH_URL)
    pay = _load(a.pay, PAY_URL)
    computed = compute(api, auth, pay)

    if a.cmd == "compute":
        text = json.dumps(computed, ensure_ascii=False, indent=1)
        if a.out:
            open(a.out, "w").write(text)
            sys.stderr.write(f"wrote {a.out}\n")
        else:
            print(text)
        return

    if a.cmd == "guard":
        state = json.load(open(a.state))
        today = a.today or date.today().isoformat()
        advanced, reasons, stale_days = guard(state, computed, today=today,
                                               stale_days_threshold=a.stale_days)
        if advanced:
            print("ADVANCED — full recompute + commit + history append:")
            for r in reasons:
                print(f"  - {r}")
            print(f"  (reset asOfDataSince -> {today} in state.json)")
            return
        print(f"UNCHANGED since state (asOfData={computed['asOfData']}); "
              "skip heavy recompute/commit and history append — only daysLeft moves.")
        if stale_days is not None and stale_days >= a.stale_days:
            print(f"STALE SOURCE: asOfData has not advanced in {stale_days} day(s) "
                  f"(>= {a.stale_days}-day threshold as of {today}) -- the upstream "
                  "Nebras log feed itself may have stalled, not just been quiet this "
                  "run. Surface this as its own alert (new the first run it crosses "
                  "the threshold, standing/escalating on every run after that until "
                  "asOfData next advances).")
            sys.exit(4)
        sys.exit(3)

    payload = json.load(open(a.payload))
    checks = verify(payload, computed)
    import of_watch_entities
    unmapped = of_watch_entities.unmapped_log_keys(api)
    checks.append(("entities: every log key is in entities.json", not unmapped, unmapped, []))
    import of_watch_payload
    for problem in of_watch_payload.lint(payload):
        checks.append((f"lint: {problem}", False, None, None))
    width = max(len(n) for n, *_ in checks)
    failed = 0
    for name, ok, pv, cv in checks:
        flag = "PASS" if ok else "FAIL"
        if ok:
            print(f"  {flag}  {name.ljust(width)}")
        else:
            failed += 1
            print(f"  {flag}  {name.ljust(width)}  payload={pv!r}  source={cv!r}")
    print(f"\n{len(checks) - failed}/{len(checks)} checks passed; asOfData={computed['asOfData']}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
