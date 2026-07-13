#!/usr/bin/env python3
"""Self-contained tests for of_watch_specdiff.diff — no network.

Run:  python3 tools/watch/test_of_watch_specdiff.py
Builds a fixture dir on disk and drives diff() through the --fixture-dir path so
the blob-SHA-1 match, the YAML change parse, and the missing-file case are pinned
down without touching raw.githubusercontent.com.
"""
import os
import tempfile

import of_watch_specdiff as sd

UNCHANGED_YAML = b"""openapi: 3.0.1
info:
  title: Kept
  version: v1.0.0
paths:
  /a:
    get: {summary: a}
"""

CHANGED_YAML = b"""openapi: 3.0.1
info:
  title: Moved
  version: v2.1.9
paths:
  /x:
    get: {summary: x}
  /y:
    post: {summary: y}
"""


def eq(name, got, want):
    assert got == want, f"{name}: got {got!r}, want {want!r}"
    print(f"  ok  {name} == {want!r}")


def main():
    d = tempfile.mkdtemp()
    p_keep = "dist/keep-openapi.yaml"
    p_chg = "dist/changed-openapi.yaml"
    p_gone = "dist/removed-openapi.yaml"          # tracked but absent -> missing
    for rel, data in ((p_keep, UNCHANGED_YAML), (p_chg, CHANGED_YAML)):
        full = os.path.join(d, rel)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "wb").write(data)

    state = {
        "specFiles": {
            p_keep: sd._blob_sha1(UNCHANGED_YAML),      # matches -> unchanged
            p_chg: "0" * 40,                            # differs -> changed
            p_gone: "1" * 40,                           # absent  -> missing
        },
        "specActiveInventory": {
            p_chg: {"specVersion": "v2.0.0", "endpointCount": 1},
            p_gone: {"specVersion": "v1.2.0", "endpointCount": 3},
        },
    }

    r = sd.diff(state, ref="main", fixture_dir=d)

    eq("trackedCount", r["trackedCount"], 3)
    eq("unchangedCount", r["unchangedCount"], 1)
    eq("changed count", len(r["changed"]), 1)
    eq("missing count", len(r["missing"]), 1)

    c = r["changed"][0]
    eq("changed.path", c["path"], p_chg)
    eq("changed.prevVersion", c["prevVersion"], "v2.0.0")
    eq("changed.newVersion", c["newVersion"], "v2.1.9")
    eq("changed.prevEndpointCount", c["prevEndpointCount"], 1)
    eq("changed.newEndpointCount", c["newEndpointCount"], 2)
    eq("changed.operations", c["operations"], ["GET /x", "POST /y"])
    eq("changed.newSha", c["newSha"], sd._blob_sha1(CHANGED_YAML))
    assert c["blobUrl"].endswith(p_chg), c["blobUrl"]
    print(f"  ok  changed.blobUrl -> {c['blobUrl']}")

    eq("missing.path", r["missing"][0]["path"], p_gone)

    # blob-sha1 framing must equal `git hash-object` (empty blob is the canonical check)
    eq("empty-blob sha1", sd._blob_sha1(b""),
       "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391")

    print("\nall specdiff tests passed")


if __name__ == "__main__":
    main()
