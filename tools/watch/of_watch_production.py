#!/usr/bin/env python3
"""Production adoption (blue/green) for the Open Finance Ecosystem Watcher.

THE MODEL
---------
The sandbox metrics logs (api-log.json) have no environment field, so a heatmap
built from them alone is a sandbox / pre-live picture. To show *production*
adoption honestly we combine TWO authoritative Nebras sources:

  1. PRODUCTION Trust Framework directory  (per-capability EXPOSURE)
       https://data.directory.openfinance.ae/participants
       -> each org's AuthorisationServers[].ApiResources[] with ApiFamilyType,
          ApiVersion and the actual ApiDiscoveryEndpoints (real endpoint paths).
       An org appearing here with an Active ApiResource for a capability has
       *exposed that capability in production*.

  2. Public traffic logs  (LIVE TRAFFIC)
       https://nebras-open-finance.com/api/api-log.json
       -> successful (2xx) calls per LFI x endpoint.

Per LFI x heatmap-column the production cell is then:

    green  = exposed in the production directory AND carrying live 2xx traffic
    blue   = exposed in the production directory but no live 2xx traffic
    none   = not exposed for that capability in the production directory (hatched)

This fixes the previous overstatement (reusing sandbox cells as "production")
and surfaces real gaps: e.g. an LFI that has published Payments in production but
whose payment initiation is returning only 5xx shows blue, not green.

"Live traffic" defaults to 2xx in the last two FULL months, computed dynamically
from whichever months are actually present in the log (the latest month found
is always treated as the current partial month and excluded, matching
of_watch_metrics.py's full/partial split) — never a hardcoded pair of months
that goes stale as time passes. Payments traffic is measured on initiation
(`POST .../payments`), not status reads, so a broken initiation flow is not
masked by status polling.

The traffic log is fetched via of_watch_metrics._get_api_rows, which knows how
to decode the sharded api-log-index.json format the feed moved to (see that
module's "API LOG FORMAT" note) — fetching LOG_URL directly here would get the
site's HTML shell, not data.

NOTE on environment of the traffic feed: Nebras publishes no per-environment
call volumes, so the green signal means "this production-exposed capability is
observed carrying successful traffic in the public logs". The exposure half
(blue vs none) is unambiguously production (production directory).

USAGE
-----
    python3 tools/of_watch_production.py                 # print the grid
    python3 tools/of_watch_production.py --payload p.json --out p.json  # annotate
"""
import argparse, json, re, sys, urllib.request
from collections import defaultdict

import of_watch_metrics as m

PROD_DIR_URL = "https://data.directory.openfinance.ae/participants"
LOG_URL = m.API_URL
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36")

COLS = ["Consent", "AIS:balances", "AIS:transactions", "AIS:parties",
        "PIS:payments", "CoP", "v2.1 uplift", "Insurance", "FX"]

# Production directory OrganisationName -> heatmap display name + tier bucket.
ORG = {
    "FAB": ("First Abu Dhabi Bank", "t1"),
    "Emirates NBD": ("Emirates NBD", "t1"),
    "ADCB": ("ADCB", "t1"),
    "DIB": ("Dubai Islamic Bank", "t1"),
    "Mashreq": ("Mashreq", "t1"),
    "ADIB": ("ADIB", "t1"),
    "HSBC": ("HSBC (Retail)", "t1"),
    "CBD": ("Commercial Bank of Dubai", "t1"),
    "WIO Bank": ("WIO Bank", "t2"),
    "LIVA": ("LIVA (insurer)", "ins"),
    "ADNIC": ("ADNIC (insurer)", "ins"),
}
# Heatmap display order for the Tier-1 block (matches the sandbox grid).
T1_ORDER = ["FAB", "Emirates NBD", "ADCB", "DIB", "Mashreq", "ADIB", "HSBC", "CBD"]

# api-log lfinamekey -> production-directory OrganisationName.
LOGKEY = {
    "uae-adcbrt": "ADCB", "uae-adibrt": "ADIB", "uae-cbdrt": "CBD", "uae-dibrt": "DIB",
    "uae-enbdx": "Emirates NBD", "uae-fabretail": "FAB", "uae-hsbcrt": "HSBC",
    "uae-hsbcws": "HSBC", "uae-mashrt": "Mashreq", "uae-wioretail": "WIO Bank",
}

def _get(url):
    return json.loads(urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json,*/*"}),
        timeout=40).read())


def _fetch_log(path=None):
    """Load the api-call log, decoding the sharded format if that's what's live."""
    return m._get_api_rows(path, LOG_URL)


def _last2_full_months(log):
    """The two most recent FULL months present in the log — the latest month is
    always the current partial month and is excluded, matching
    of_watch_metrics.compute()'s full/partial split. Replaces a hardcoded
    month pair, which went stale every time a month rolled over."""
    ms = sorted({r["date"][:7] for r in log})
    full = ms[:-1] if ms else []
    return set(full[-2:])


def _window_label(window):
    ms = sorted(window)
    if not ms:
        return "no full months yet"
    year = ms[-1][:4]
    if len(ms) == 1:
        return f"{m._abbr(ms[0])} {year}"
    return f"{m._abbr(ms[0])}-{m._abbr(ms[-1])} {year}"


def _cols_for_path(p):
    """Map a discovery / log endpoint path to heatmap columns (excluding v2.1)."""
    c = []
    if re.search(r"(account-access-consents|payment-consents|insurance-consents)", p):
        c.append("Consent")
    if "/balances" in p:
        c.append("AIS:balances")
    if "/transactions" in p:
        c.append("AIS:transactions")
    if "/parties" in p:
        c.append("AIS:parties")
    if re.search(r"/payment/v[0-9.]+/(file-)?payments$", p):
        c.append("PIS:payments")
    if "confirmation-of-payee" in p:
        c.append("CoP")
    if "insurance" in p:
        c.append("Insurance")
    if "/fx" in p or "foreign-exchange" in p:
        c.append("FX")
    return c


def exposure(directory=None):
    """Per production org -> set of exposed heatmap columns (from the prod directory)."""
    directory = directory if directory is not None else _get(PROD_DIR_URL)
    exposed = defaultdict(set)
    meta = {}
    for o in directory:
        nm = o["OrganisationName"]
        has21 = False
        for a in o.get("AuthorisationServers", []):
            for r in a.get("ApiResources", []):
                if r.get("Status") != "Active":
                    continue
                if str(r.get("ApiVersion", "")).startswith("2.1"):
                    has21 = True
                for e in r.get("ApiDiscoveryEndpoints", []):
                    for c in _cols_for_path(e.get("ApiEndpoint", "")):
                        exposed[nm].add(c)
        if has21:
            exposed[nm].add("v2.1 uplift")
        meta[nm] = {"status": o.get("Status")}
    return exposed, meta


def live_traffic(log=None, window=None):
    """Per org -> set of heatmap columns with 2xx traffic in the window.

    Payments counts initiation only (path ending /payments), so status polling
    does not mask a broken initiation flow. `window` defaults to the two most
    recent full months found in `log` itself (see _last2_full_months) rather
    than a fixed pair of months.
    """
    log = log if log is not None else _fetch_log()
    if window is None:
        window = _last2_full_months(log)
    traffic = defaultdict(set)
    for r in log:
        if r.get("tppresponsecodegroup") != "2xx" or r.get("date", "")[:7] not in window:
            continue
        nm = LOGKEY.get(r.get("lfinamekey"))
        if not nm:
            continue
        u = r.get("url", "")
        cs = _cols_for_path(u)
        if re.search(r"/v2\.1/", u):
            cs.append("v2.1 uplift")
        for c in cs:
            traffic[nm].add(c)
    return traffic


def _cells(org_key, exposed, traffic):
    out = []
    ex, tr = exposed.get(org_key, set()), traffic.get(org_key, set())
    for c in COLS:
        if c in ex:
            out.append("green" if c in tr else "blue")
        else:
            out.append("none")
    return out


def build_grid(directory=None, log=None):
    directory = directory if directory is not None else _get(PROD_DIR_URL)
    log = log if log is not None else _fetch_log()
    exposed, meta = exposure(directory)
    window = _last2_full_months(log)
    traffic = live_traffic(log, window)
    present = {o["OrganisationName"] for o in directory}

    t1 = [[ORG[k][0], _cells(k, exposed, traffic)] for k in T1_ORDER if k in present]
    other = []
    for k, (disp, tier) in ORG.items():
        if tier in ("t2", "ins") and k in present:
            other.append([disp, ("Tier-2" if tier == "t2" else "Insurer"), _cells(k, exposed, traffic)])

    def count(state):
        n = 0
        for row in t1:
            n += row[1].count(state)
        for row in other:
            n += row[2].count(state)
        return n

    banks = sum(1 for o in directory if o["OrganisationName"] in ORG and ORG[o["OrganisationName"]][1] in ("t1", "t2"))
    return {
        "cols": COLS,
        "t1": t1,
        "other": other,
        "counts": {"prodOrgs": len(directory), "banks": banks,
                   "t1": len(t1), "green": count("green"), "blue": count("blue")},
        "window": f"2xx in {_window_label(window)} (last 2 full months)",
        "source": PROD_DIR_URL,
        "trafficSource": LOG_URL,
        "note": ("Green = capability exposed in the production Trust Framework directory AND carrying "
                 "live 2xx traffic in the public logs. Blue = exposed in production but no live 2xx "
                 "traffic in the window. Hatched = not exposed for that capability in the production "
                 "directory. Exposure is unambiguously production (production directory); Nebras "
                 "publishes no per-environment volumes, so 'live' means observed successful traffic on "
                 "the capability. Payments traffic is measured on initiation, so a 5xx-only initiation "
                 "flow shows blue, not green."),
    }


def annotate(payload, directory=None, log=None):
    grid = build_grid(directory, log)
    tm = payload.setdefault("tierMatrix", {})
    tm["prodGrid"] = grid
    # keep a light entity-level flag on the sandbox rows too (production = in prod directory)
    prod_disp = {r[0] for r in grid["t1"]} | {r[0] for r in grid["other"]}
    for r in tm.get("t1", []):
        flag = r[0] in prod_disp
        (r.__setitem__(3, flag) if len(r) >= 4 else r.append(flag))
    for r in tm.get("t2", []):
        flag = r[0] in prod_disp
        (r.__setitem__(3, flag) if len(r) >= 4 else r.append(flag))
    return grid


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--payload")
    ap.add_argument("--out")
    a = ap.parse_args()
    directory = _get(PROD_DIR_URL)
    if a.payload:
        payload = json.load(open(a.payload))
        g = annotate(payload, directory)
        json.dump(payload, open(a.out or a.payload, "w"), ensure_ascii=False)
        sys.stderr.write("annotated %s — prod orgs %s · Tier-1 %s · green %s / blue %s cells\n" % (
            a.out or a.payload, g["counts"]["prodOrgs"], g["counts"]["t1"], g["counts"]["green"], g["counts"]["blue"]))
    else:
        g = build_grid(directory)
        sym = {"green": "GREEN", "blue": "BLUE ", "none": "  -  "}
        print("Production adoption grid (%s):\n" % g["window"])
        print("LFI".ljust(26) + " ".join(c[:5].rjust(6) for c in g["cols"]))
        for r in g["t1"]:
            print(r[0].ljust(26) + " ".join(sym[x].rjust(6) for x in r[1]))
        for r in g["other"]:
            print(("%s [%s]" % (r[0], r[1])).ljust(26) + " ".join(sym[x].rjust(6) for x in r[2]))
        print("\ncounts:", g["counts"])


if __name__ == "__main__":
    main()
