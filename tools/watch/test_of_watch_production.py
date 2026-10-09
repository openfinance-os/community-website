#!/usr/bin/env python3
"""Self-contained tests for of_watch_production.py — no network, no pytest.

Run:  python3 tools/watch/test_of_watch_production.py
Covers the dynamic two-full-months window (replacing the old hardcoded LAST2
constant, which went stale every time a month rolled over) and the grid build
against synthetic directory/log fixtures.
"""
import of_watch_production as p

LOG = [
    {"date": "2026-07-05", "lfinamekey": "uae-fabretail", "tppresponsecodegroup": "2xx",
     "url": "open-finance/account-information/v2.1/accounts/:id/balances", "totalapicalls": 5},
    {"date": "2026-08-10", "lfinamekey": "uae-fabretail", "tppresponsecodegroup": "2xx",
     "url": "open-finance/payment/v2.1/payments", "totalapicalls": 3},
    {"date": "2026-09-01", "lfinamekey": "uae-fabretail", "tppresponsecodegroup": "2xx",
     "url": "open-finance/payment/v2.1/payments", "totalapicalls": 999},  # partial month, excluded
]

DIRECTORY = [
    {"OrganisationName": "FAB", "Status": "Active", "AuthorisationServers": [
        {"ApiResources": [
            {"Status": "Active", "ApiFamilyType": "account-information", "ApiVersion": "2.1",
             "ApiDiscoveryEndpoints": [{"ApiEndpoint": "/open-finance/account-information/v2.1/accounts/:id/balances"}]},
            {"Status": "Active", "ApiFamilyType": "payment", "ApiVersion": "2.1",
             "ApiDiscoveryEndpoints": [{"ApiEndpoint": "/open-finance/payment/v2.1/payments"}]},
        ]}]},
]


def eq(name, got, want):
    assert got == want, f"{name}: got {got!r}, want {want!r}"
    print(f"  ok  {name} == {want!r}")


def main():
    # latest month present (2026-09) is always the partial month and excluded,
    # regardless of what today's calendar date is or which months a hardcoded
    # constant might have assumed.
    window = p._last2_full_months(LOG)
    eq("_last2_full_months excludes the partial month", window, {"2026-07", "2026-08"})
    eq("_window_label", p._window_label(window), "Jul-Aug 2026")
    eq("_window_label single month", p._window_label({"2026-08"}), "Aug 2026")
    eq("_window_label empty", p._window_label(set()), "no full months yet")

    # a log with only one month present has no full months at all (that one
    # month is the partial) -- must not crash, must return an empty window.
    eq("_last2_full_months with only a partial month", p._last2_full_months(
        [{"date": "2026-09-01", "lfinamekey": "x", "tppresponsecodegroup": "2xx", "url": "/x", "totalapicalls": 1}]),
       set())

    # build_grid, given synthetic fixtures directly (no network): FAB is
    # exposed (production directory) AND carries 2xx traffic in the dynamic
    # window on both AIS:balances and PIS:payments -> green, not blue/none.
    g = p.build_grid(directory=DIRECTORY, log=LOG)
    eq("window label reflects the log, not a hardcoded pair", g["window"], "2xx in Jul-Aug 2026 (last 2 full months)")
    fab_row = next(r for r in g["t1"] if r[0] == "First Abu Dhabi Bank")
    cols = dict(zip(g["cols"], fab_row[1]))
    eq("FAB AIS:balances -> green (exposed + traffic in window)", cols["AIS:balances"], "green")
    eq("FAB PIS:payments -> green (exposed + traffic in window)", cols["PIS:payments"], "green")
    eq("FAB CoP -> none (not exposed in directory)", cols["CoP"], "none")

    print("\nall of_watch_production tests passed")


if __name__ == "__main__":
    main()
