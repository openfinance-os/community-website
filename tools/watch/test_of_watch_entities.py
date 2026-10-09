#!/usr/bin/env python3
"""No-network tests for of_watch_entities.py + the registry file itself.

Run:  python3 tools/watch/test_of_watch_entities.py
"""
import of_watch_entities as E
import of_watch_production as p


def eq(name, got, want):
    assert got == want, f"{name}: got {got!r}, want {want!r}"
    print(f"  ok  {name} == {want!r}")


def main():
    reg = E.load()
    keys, orgs = E.log_keys(reg), E.orgs(reg)
    for k, v in keys.items():
        assert v["tier"] in ("t1", "t2", "other", "ins"), (k, v["tier"])
        assert v["kind"] in ("bank", "insurer"), (k, v["kind"])
        assert v.get("org") is None or v["org"] in orgs, (k, v.get("org"))
    eq("every t1Order org is a Tier-1 org", all(orgs[o]["tier"] == "t1" for o in E.t1_order(reg)), True)
    eq("8 Tier-1 banks", len(E.t1_order(reg)), 8)
    eq("Liv is a bank, not an insurer", keys["uae-livx"]["kind"], "bank")
    eq("NBF log key maps to its directory org", E.logkey_to_org(reg)["uae-nbfrt"], "National Bank of Fujairah PJSC")

    rows = [{"lfinamekey": "uae-mashrt"}, {"lfinamekey": "uae-newbank"}, {"lfinamekey": None}]
    eq("unknown log key is reported, not dropped", E.unmapped_log_keys(rows, reg), ["uae-newbank"])
    eq("unknown directory org is reported", E.unmapped_orgs([{"OrganisationName": "FAB"}, {"OrganisationName": "New Co"}], reg), ["New Co"])

    # the production grid picks NBF up from the registry (it used to be patched by hand)
    directory = [{"OrganisationName": "National Bank of Fujairah PJSC", "Status": "Active", "AuthorisationServers": [
        {"ApiResources": [{"Status": "Active", "ApiVersion": "2.1", "ApiDiscoveryEndpoints": [
            {"ApiEndpoint": "/open-finance/account-information/v2.1/accounts/:id/balances"}]}]}]}]
    log = [{"date": "2026-08-10", "lfinamekey": "uae-nbfrt", "tppresponsecodegroup": "2xx",
            "url": "open-finance/account-information/v2.1/accounts/:id/balances", "totalapicalls": 5},
           {"date": "2026-09-01", "lfinamekey": "uae-nbfrt", "tppresponsecodegroup": "2xx", "url": "/x", "totalapicalls": 1}]
    g = p.build_grid(directory=directory, log=log)
    row = next(r for r in g["other"] if r[0] == "National Bank of Fujairah")
    eq("NBF row tagged Tier-2", row[1], "Tier-2")
    eq("NBF AIS:balances green without a hand patch", dict(zip(g["cols"], row[2]))["AIS:balances"], "green")
    eq("no unmapped orgs", g["unmapped"], [])
    print("\nall of_watch_entities tests passed")


if __name__ == "__main__":
    main()
