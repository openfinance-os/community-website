#!/usr/bin/env python3
"""Self-contained tests for of_watch_metrics.compute — no network, no pytest.

Run:  python3 tools/watch/test_of_watch_metrics.py
Exits non-zero on the first failed assertion. Uses a tiny synthetic log so the
money-in-fils, accepted-only, and full-vs-partial-month rules are pinned down
independently of the live feed.
"""
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

    # internal consistency the verifier relies on
    eq("sum(vals)==allTime", sum(c["activity"]["vals"]), c["activity"]["allTime"])
    eq("sum(pay vals)==allTime", round(sum(c["payActivity"]["vals"]), 2),
       c["payActivity"]["allTime"])

    print("\nall metrics tests passed")


def test_shard_decode():
    """nebras-open-finance.com/api/api-log.json was retired in favour of a
    shard index + dictionary-encoded {v,fields,dicts,rows} shards (2026-08).
    Pin the decoder against a tiny synthetic shard shaped like the real ones."""
    shard = {
        "v": 1,
        "fields": m.API_FIELDS,
        "dicts": {
            "date": ["2026-01-05", "2026-01-06", "2026-02-01"],
            "lfinamekey": ["uae-mashrt"],
            "tppname": ["T1"],
            "httpmethod": ["GET"],
            "url": ["open-finance/aisp/v1.2/accounts"],
            "tppresponsecodegroup": ["2xx", "4xx"],
        },
        "rows": [
            [0, 0, 0, 0, 0, 0, 100, 250],   # date=Jan-05, 2xx, 100 calls
            [1, 0, None, 0, 0, 1, 10, 300],  # date=Jan-06, unattributed, 4xx, 10 calls
            [2, 0, 0, 0, 0, 0, 5, 200],      # date=Feb-01 (partial month), 2xx, 5 calls
        ],
    }
    assert m._is_shard_doc(shard)
    assert not m._is_shard_doc(API)
    rows = m._decode_shard(shard)
    eq("decoded row count", len(rows), 3)
    eq("decoded row[0]", rows[0], {
        "date": "2026-01-05", "lfinamekey": "uae-mashrt", "tppname": "T1",
        "httpmethod": "GET", "url": "open-finance/aisp/v1.2/accounts",
        "tppresponsecodegroup": "2xx", "totalapicalls": 100, "executiontime": 250,
    })
    eq("decoded row[1].tppname (unattributed -> None)", rows[1]["tppname"], None)
    eq("decoded row[1].tppresponsecodegroup", rows[1]["tppresponsecodegroup"], "4xx")
    # compute() must run identically over decoded shard rows as over a flat feed
    c = m.compute(rows, [], [])
    eq("shard-decoded headline.totalAll", c["headline"]["totalAll"], 115)
    eq("shard-decoded headline.totalFull", c["headline"]["totalFull"], 110)
    print("\nshard decoder tests passed")


if __name__ == "__main__":
    main()
    test_shard_decode()
