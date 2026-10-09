#!/usr/bin/env python3
"""Entity registry for the Watch: who each log key / directory org is.

Reads data/watch/entities.json — the one place that maps an api-log
`lfinamekey` or a production-directory `OrganisationName` to a display name
and CBUAE tier. Every tool imports this instead of keeping its own dict, so a
new participant is added once, and an identifier missing from the registry is
reported as unmapped rather than silently dropped or guessed.

    python3 tools/watch/of_watch_entities.py            # check live log + directory
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.normpath(os.path.join(HERE, "..", "..", "data", "watch", "entities.json"))

_cache = None


def load(path=None):
    global _cache
    if path:
        return json.load(open(path))
    if _cache is None:
        _cache = json.load(open(PATH))
    return _cache


def log_keys(reg=None):
    return (reg or load())["logKeys"]


def orgs(reg=None):
    return (reg or load())["orgs"]


def t1_order(reg=None):
    return (reg or load())["t1Order"]


def logkey_to_org(reg=None):
    """lfinamekey -> production-directory OrganisationName (only mapped keys)."""
    return {k: v["org"] for k, v in log_keys(reg).items() if v.get("org")}


def unmapped_log_keys(rows, reg=None):
    known = log_keys(reg)
    return sorted({r.get("lfinamekey") for r in rows if r.get("lfinamekey")} - set(known))


def unmapped_orgs(directory, reg=None):
    known = orgs(reg)
    return sorted({o.get("OrganisationName") for o in directory} - set(known))


def main():
    import of_watch_metrics as m
    import of_watch_production as p
    rows = m._get_api_rows(None, m.API_URL)
    directory = p._get(p.PROD_DIR_URL)
    lk, og = unmapped_log_keys(rows), unmapped_orgs(directory)
    print("unmapped log keys:", lk or "none")
    print("unmapped directory orgs:", og or "none")
    sys.exit(1 if (lk or og) else 0)


if __name__ == "__main__":
    main()
