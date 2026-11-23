#!/usr/bin/env python3
"""Self-contained tests for of_watch_metrics.compute — no network, no pytest.

Run:  python3 tools/watch/test_of_watch_metrics.py
Exits non-zero on the first failed assertion. Uses a tiny synthetic log so the
money-in-fils, accepted-only, and full-vs-partial-month rules are pinned down
independently of the live feed.
"""
import json
import os
import tempfile

import of_watch_metrics as m

# Two full months (Jan, Feb) + one partial (Mar). Amounts chosen so a naive
# float sum (0.1 + 0.2 == 0.30000000000000004) would drift but integer fils
# stays exact.
API = [
    {"date": "2026-01-05", "lfinamekey": "uae-mashrt", "tppname": "T1",
     "url": "open-finance/aisp/v1.2/accounts", "tppresponsecodegroup": "2xx", "totalapicalls": 100},
    {"date": "2026-01-06", "lfinamekey": "uae-mashrt", "tppname": "T1",
     "url": "open-finance/aisp/v1.2/accounts", "tppresponsecodegroup": "4xx", "totalapicalls": 10},
    {"date": "2026-02-05", "lfinamekey": "uae-dibrt", "tppname": "T2",
     "url": "open-finance/aisp/v2.1/accounts", "tppresponsecodegroup": "2xx", "totalapicalls": 40},
    {"date": "2026-03-01", "lfinamekey": "uae-dibrt", "tppname": "T2",
     "url": "open-finance/aisp/v2.1/accounts", "tppresponsecodegroup": "5xx", "totalapicalls": 7},
]
AUTH = [
    {"date": "2026-01-05", "lfinamekey": "uae-mashrt", "url": "/auth/x",
     "tppresponsecodegroup": "2xx", "totalapicalls": 3},
    {"date": "2026-02-05", "lfinamekey": "uae-dibrt", "url": "/auth/x",
     "tppresponsecodegroup": "3xx", "totalapicalls": 1},
]
PAY = [
    {"date": "2026-01-10", "lfinamekey": "uae-mashrt", "tppname": "T1",
     "status": "AcceptedSettlementCompleted", "amount": 0.1, "count": 1},
    {"date": "2026-01-11", "lfinamekey": "uae-mashrt", "tppname": "T1",
     "status": "AcceptedWithoutPosting", "amount": 0.2, "count": 1},
    {"date": "2026-01-12", "lfinamekey": "uae-mashrt", "tppname": "T1",
     "status": "Rejected", "amount": 999.0, "count": 1},  # excluded from value
    {"date": "2026-02-10", "lfinamekey": "uae-dibrt", "tppname": "T2",
     "status": "AcceptedCreditSettlementCompleted", "amount": 5.55, "count": 2},
    {"date": "2026-03-02", "lfinamekey": "uae-dibrt", "tppname": "T2",
     "status": "AcceptedSettlementCompleted", "amount": 1.0, "count": 1},  # partial month
]


def eq(name, got, want):
    assert got == want, f"{name}: got {got!r}, want {want!r}"
    print(f"  ok  {name} == {want!r}")


def main():
    c = m.compute(API, AUTH, PAY)

    # full months = Jan, Feb; partial = Mar
    eq("months(full)", c["months"], ["2026-01", "2026-02"])
    eq("curPartial", c["curPartial"], "2026-03")

    # transactions: full = 100+10+40 = 150; all = +7 = 157
    eq("totalFull", c["headline"]["totalFull"], 150)
    eq("totalAll", c["headline"]["totalAll"], 157)
    # errors full-months only: 10 of 150 = 6.7%
    eq("errPct", c["headline"]["errPct"], 6.7)
    eq("liveLFIs", c["headline"]["liveLFIs"], 2)
    eq("liveTPPs", c["headline"]["liveTPPs"], 2)
    eq("byVersion", c["headline"]["byVersion"],
       [["v1.2", round(100 * 110 / 150, 1)], ["v2.1", round(100 * 40 / 150, 1)]])

    # money: accepted-only, integer fils. Jan = 0.10 + 0.20 = 0.30 exactly
    # (float would give 0.30000000000000004). Feb = 5.55. Rejected 999 excluded.
    eq("payActivity.vals", c["payActivity"]["vals"], [0.30, 5.55, 1.00])
    eq("payments.valueAED (full)", c["payments"]["valueAED"], 5.85)   # 0.30 + 5.55
    eq("payActivity.fullTotal", c["payActivity"]["fullTotal"], 5.85)
    eq("payActivity.allTime", c["payActivity"]["allTime"], 6.85)      # + 1.00 partial

    # payment success counts, full months: 2 accepted-rows counts (1+1) + Feb 2;
    # Rejected count 1. accepted=1+1+2=4, total=5 -> 80.0%
    eq("payments.successPct", c["payments"]["successPct"], 80.0)

    # auth 2xx share full months: 3 of (3+1) = 75.0%
    eq("authPct", c["authPct"], 75.0)

    # concentration: T1=110, T2=40 attributed (full) -> top1 73.3%
    eq("eco.top1", c["eco"]["top1"], "T1")
    eq("eco.attributed", c["eco"]["attributed"], 150.0)
    eq("eco.top1share", c["eco"]["top1share"], round(100 * 110 / 150, 1))

    # partial month to date (Mar): 7 calls, all 5xx; one accepted payment of 1.00
    eq("partial.month", c["partial"]["month"], "2026-03")
    eq("partial.calls", c["partial"]["calls"], 7)
    eq("partial.errPct", c["partial"]["errPct"], 100.0)
    eq("partial.paySuccessPct", c["partial"]["paySuccessPct"], 100.0)
    eq("partial.valueAED", c["partial"]["valueAED"], 1.0)
    eq("partial.calls==activity.partialVal", c["partial"]["calls"], c["activity"]["partialVal"])

    # sectors + consent funnel, with an explicit kind map (insurer = uae-dibrt)
    AUTH2 = [
        {"date": "2026-02-01", "lfinamekey": "uae-mashrt", "url": "/auth",
         "tppresponsecodegroup": "2xx", "totalapicalls": 8},
        {"date": "2026-02-01", "lfinamekey": "uae-mashrt", "url": "/auth",
         "tppresponsecodegroup": "4xx", "totalapicalls": 2},
        {"date": "2026-02-01", "lfinamekey": "uae-mashrt", "url": "/auth/:interactionId/doConfirm",
         "tppresponsecodegroup": "3xx", "totalapicalls": 5},
        {"date": "2026-02-01", "lfinamekey": "uae-mashrt", "url": "/auth/:interactionId/doConfirm",
         "tppresponsecodegroup": "4xx", "totalapicalls": 1},
        {"date": "2026-02-01", "lfinamekey": "uae-mashrt", "url": "/auth/:interactionId/doFail",
         "tppresponsecodegroup": "3xx", "totalapicalls": 1},
        {"date": "2026-02-01", "lfinamekey": "uae-dibrt", "url": "/auth/:interactionId/doConfirm",
         "tppresponsecodegroup": "3xx", "totalapicalls": 50},  # insurer: excluded
        {"date": "2026-03-01", "lfinamekey": "uae-mashrt", "url": "/auth",
         "tppresponsecodegroup": "2xx", "totalapicalls": 4},
        {"date": "2026-03-01", "lfinamekey": "uae-mashrt", "url": "/auth/:interactionId/doConfirm",
         "tppresponsecodegroup": "3xx", "totalapicalls": 3},
    ]
    k = {"uae-mashrt": "bank", "uae-dibrt": "insurer"}
    c2 = m.compute(API, AUTH2, PAY, kinds=k)
    eq("sectors.bank.fullCalls", c2["sectors"]["bank"]["fullCalls"], 110)
    eq("sectors.insurer.fullCalls", c2["sectors"]["insurer"]["fullCalls"], 40)
    eq("sectors.insurer.allCalls", c2["sectors"]["insurer"]["allCalls"], 47)
    eq("sectors.insurer.partialCalls", c2["sectors"]["insurer"]["partialCalls"], 7)
    eq("sectors.bank.fullErrors", c2["sectors"]["bank"]["fullErrors"], 10)
    # requests 10 (any group), consents 6 (3xx + 4xx), cancelled 1
    eq("consent.full", {x: c2["consent"]["full"][x] for x in ("requests", "consents", "cancelled", "convPct", "cancelPct")},
       {"requests": 10, "consents": 6, "cancelled": 1, "convPct": 60.0, "cancelPct": 10.0})
    eq("consent.lastFull.month", c2["consent"]["lastFull"]["month"], "2026-02")
    eq("consent.partial", (c2["consent"]["partial"]["requests"], c2["consent"]["partial"]["consents"],
                           c2["consent"]["partial"]["convPct"]), (4, 3, 75.0))

    # internal consistency the verifier relies on
    eq("sum(vals)==allTime", sum(c["activity"]["vals"]), c["activity"]["allTime"])
    eq("sum(pay vals)==allTime", round(sum(c["payActivity"]["vals"]), 2),
       c["payActivity"]["allTime"])

    print("\nall metrics tests passed")

    # ---------------------------------------------------------------- guard
    # advanced: asOfData moved -> stale_days is None regardless of today
    advanced, reasons, stale = m.guard({"asOfData": "2026-02-05"}, c, today="2026-03-10")
    assert advanced and stale is None, (advanced, reasons, stale)
    print("  ok  guard: advanced when asOfData moves, stale_days is None")

    # unchanged, under threshold: same asOfData, only 5 days since asOfDataSince,
    # default threshold 10 -> not stale
    state = {"asOfData": _asof(c), "asOfDataSince": "2026-03-01"}
    advanced, reasons, stale = m.guard(state, c, today="2026-03-06")
    assert not advanced and stale == 5, (advanced, reasons, stale)
    print("  ok  guard: unchanged + 5 days since asOfDataSince -> stale_days=5, under default threshold")

    # unchanged, at/over threshold -> caller should alert
    advanced, reasons, stale = m.guard(state, c, today="2026-03-11", stale_days_threshold=10)
    assert not advanced and stale == 10, (advanced, reasons, stale)
    print("  ok  guard: unchanged + 10 days since asOfDataSince -> stale_days=10, meets threshold")

    # falls back to asOfData itself when asOfDataSince is absent (state written
    # before this field existed)
    advanced, reasons, stale = m.guard({"asOfData": _asof(c)}, c, today="2026-03-06")
    assert not advanced and stale == 5, (advanced, reasons, stale)
    print("  ok  guard: falls back to asOfData when asOfDataSince is missing from state")

    print("\nall guard tests passed")

    # -------------------------------------------------------- shard decoding
    shard = {
        "v": 1,
        "fields": ["date", "lfinamekey", "tppname", "httpmethod", "url",
                   "tppresponsecodegroup", "totalapicalls", "executiontime"],
        "dicts": {
            "date": ["2026-07-01", "2026-07-02"],
            "lfinamekey": ["uae-mashrt"],
            "tppname": ["T1"],
            "httpmethod": ["GET"],
            "url": ["open-finance/aisp/v1.2/accounts"],
            "tppresponsecodegroup": ["2xx"],
        },
        # row = [date_idx, lfi_idx, tpp_idx, method_idx, url_idx, code_idx, calls, exectime]
        "rows": [[0, 0, 0, 0, 0, 0, 5, 100], [1, 0, 0, 0, 0, 0, 9, 120]],
    }
    decoded = m._decode_shard(shard)
    eq("decode_shard row count", len(decoded), 2)
    eq("decode_shard row 0", decoded[0],
       {"date": "2026-07-01", "lfinamekey": "uae-mashrt", "tppname": "T1",
        "httpmethod": "GET", "url": "open-finance/aisp/v1.2/accounts",
        "tppresponsecodegroup": "2xx", "totalapicalls": 5, "executiontime": 100})
    print("  ok  _decode_shard maps dict-indexed columns and passes raw ints through")

    # _rows_from_api_json accepts both the legacy flat array and a raw shard
    eq("_rows_from_api_json(flat list)", m._rows_from_api_json(API), API)
    eq("_rows_from_api_json(shard dict)", m._rows_from_api_json(shard), decoded)
    try:
        m._rows_from_api_json({"unexpected": "shape"})
        raise AssertionError("expected ValueError for an unrecognized api log shape")
    except ValueError:
        pass
    print("  ok  _rows_from_api_json decodes both known shapes, rejects unknown ones")

    # _get_api_rows(path=...) reads a local file of either shape with no network
    with tempfile.TemporaryDirectory() as d:
        flat_path = os.path.join(d, "flat.json")
        shard_path = os.path.join(d, "shard.json")
        json.dump(API, open(flat_path, "w"))
        json.dump(shard, open(shard_path, "w"))
        eq("_get_api_rows(flat file)", m._get_api_rows(flat_path, "unused://"), API)
        eq("_get_api_rows(shard file)", m._get_api_rows(shard_path, "unused://"), decoded)
    print("  ok  _get_api_rows reads a local snapshot without touching the network")


def _asof(computed):
    return computed["asOfData"]


if __name__ == "__main__":
    main()
