#!/usr/bin/env python3
"""Raw-based OpenAPI structural diff for the Watch (§3b) — no GitHub API needed.

WHY THIS EXISTS
---------------
The §3b structural diff wants to know how the api-specs OpenAPI files change at
the field level. The full flow uses the GitHub API (org/branch/commit
enumeration + git trees). But when a session's GitHub integration is scoped away
from the Nebras-Open-Finance org, api.github.com / github.com / codeload all
return 403 — yet **raw.githubusercontent.com stays reachable** (it serves public
blob content with no repo-scoping). And the diff basis the routine already
persists, `state.specFiles[path]`, is the git blob SHA-1 of each tracked file —
which is computable locally from the raw bytes with `git hash-object` framing,
i.e. `sha1("blob <len>\\0" + content)`. So the content-level diff needs no API:

  for each tracked path:
      raw-fetch at <ref> -> compute blob sha1 -> compare to state.specFiles[path]
      if changed: parse YAML, diff info.version + the operation set, report

WHAT IT CANNOT DO WITHOUT THE API (documented, not silently skipped)
  - discover BRAND-NEW spec files or repos (needs the git tree / repo list),
  - enumerate branches or read commit / PR history,
  - compute a commit-range compare URL.
These stay degraded until the session's GitHub scope includes the org (see the
routine README). This tool restores the field-level diff of the *known* surface,
which is the substance of §3b; it prints the tree URL so a human can eyeball for
new files.

USAGE
-----
    python3 tools/watch/of_watch_specdiff.py --state data/watch/state.json
    python3 tools/watch/of_watch_specdiff.py --state data/watch/state.json --out /tmp/specdiff.json
    # offline test: read files from a local dir mirroring the tracked paths
    python3 tools/watch/of_watch_specdiff.py --state ... --fixture-dir /tmp/specs
"""
import argparse
import hashlib
import json
import os
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

REPO = "Nebras-Open-Finance/api-specs"
RAW = "https://raw.githubusercontent.com/{repo}/{ref}/{path}"
BLOB = "https://github.com/{repo}/blob/{ref}/{path}"
TREE = "https://github.com/{repo}/tree/{ref}"
HTTP_METHODS = ("get", "put", "post", "delete", "patch", "head", "options")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36")


def _blob_sha1(raw_bytes):
    """git hash-object of the content — matches state.specFiles values."""
    return hashlib.sha1(b"blob %d\0" % len(raw_bytes) + raw_bytes).hexdigest()


def _fetch(repo, ref, path, fixture_dir):
    if fixture_dir:
        fp = os.path.join(fixture_dir, path)
        if not os.path.exists(fp):
            return None  # treated as missing/removed
        return open(fp, "rb").read()
    url = RAW.format(repo=repo, ref=ref, path=path)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def _operations(doc):
    """Sorted 'METHOD /path' set from an OpenAPI doc; [] if unparseable."""
    if not isinstance(doc, dict):
        return []
    ops = []
    for p, item in (doc.get("paths") or {}).items():
        if not isinstance(item, dict):
            continue
        for m in HTTP_METHODS:
            if m in item:
                ops.append(f"{m.upper()} {p}")
    return sorted(ops)


def _parse(raw_bytes):
    try:
        import yaml
        doc = yaml.safe_load(raw_bytes.decode("utf-8", "replace"))
    except Exception:
        return None, []
    version = None
    if isinstance(doc, dict):
        version = (doc.get("info") or {}).get("version")
    return version, _operations(doc)


def _split(path):
    """dist/<category>/<versionFolder>/<basename> -> (category, folder, base) or None."""
    parts = path.split("/")
    if len(parts) == 4 and parts[0] == "dist" and parts[3].endswith(".yaml"):
        return parts[1], parts[2], parts[3]
    return None


def _successor_folders(folder):
    """Deterministic next-version folder names for a known version folder.

    v2.1.x -> v2.2.x, v3.0.x ;  v2.1 -> v2.2, v3.0 ;  v2.1-errata2 -> v2.1-errata3.
    Only these convention-based successors are probed — no wild guessing.
    """
    m = re.match(r"^v(\d+)\.(\d+)(\.x)?$", folder)
    if m:
        maj, mn, suf = int(m.group(1)), int(m.group(2)), m.group(3) or ""
        return [f"v{maj}.{mn + 1}{suf}", f"v{maj + 1}.0{suf}"]
    m = re.match(r"^v(\d+)\.(\d+)-errata(\d+)$", folder)
    if m:
        maj, mn, n = m.group(1), m.group(2), int(m.group(3))
        return [f"v{maj}.{mn}-errata{n + 1}"]
    return []


def discover(state, ref, repo=REPO, fixture_dir=None, workers=8):
    """Convention-based probe for NEW spec files raw cannot enumerate.

    Derives (category -> known basenames) and (category -> version folders) from
    the tracked paths, then probes each category's successor version/errata
    folders for its known basenames. A 200 on a path absent from state.specFiles
    is a NEW-FILE candidate. This is deterministic (reuses real basenames in
    successor folders), not exhaustive — a brand-new *family* filename or a
    non-conventional path won't be found; §4 release-notes / §5 Confluence remain
    the authoritative 'new standard' signal.
    """
    spec_files = state.get("specFiles", {})
    tracked = {k for k in spec_files if not k.startswith("site:")}
    bases, folders = {}, {}
    for path in tracked:
        s = _split(path)
        if not s:
            continue
        cat, folder, base = s
        bases.setdefault(cat, set()).add(base)
        folders.setdefault(cat, set()).add(folder)

    candidates = []
    for cat, flds in folders.items():
        succ = {sf for f in flds for sf in _successor_folders(f)} - flds
        for folder in succ:
            for base in bases.get(cat, ()):
                p = f"dist/{cat}/{folder}/{base}"
                if p not in spec_files:
                    candidates.append(p)

    def probe(path):
        raw = _fetch(repo, ref, path, fixture_dir)
        return path if raw is not None else None

    found = []
    if candidates:
        with ThreadPoolExecutor(max_workers=workers) as ex:
            for hit in ex.map(probe, candidates):
                if hit:
                    found.append({"path": hit, "blobUrl": BLOB.format(repo=repo, ref=ref, path=hit),
                                  "note": "new spec file at a convention-derived successor version/errata folder"})
    return {"probed": len(candidates), "newCandidates": sorted(found, key=lambda c: c["path"])}


def diff(state, ref, repo=REPO, fixture_dir=None, workers=8):
    spec_files = state.get("specFiles", {})
    inv = state.get("specActiveInventory", {})
    # main-ref keys only (site: keys are the website branch, handled separately)
    paths = [k for k in spec_files if not k.startswith("site:")]

    def work(path):
        raw = _fetch(repo, ref, path, fixture_dir)
        if raw is None:
            return ("missing", path, None)
        return ("ok", path, raw)

    changed, missing, unchanged = [], [], 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for kind, path, raw in ex.map(work, paths):
            if kind == "missing":
                missing.append({
                    "path": path,
                    "wasSha": spec_files.get(path),
                    "prevVersion": (inv.get(path) or {}).get("specVersion"),
                    "note": "tracked file no longer at this ref (removed/renamed/branch-moved)",
                    "treeUrl": TREE.format(repo=repo, ref=ref),
                })
                continue
            new_sha = _blob_sha1(raw)
            if new_sha == spec_files.get(path):
                unchanged += 1
                continue
            new_version, ops = _parse(raw)
            prev = inv.get(path) or {}
            changed.append({
                "path": path,
                "oldSha": spec_files.get(path),
                "newSha": new_sha,
                "prevVersion": prev.get("specVersion"),
                "newVersion": new_version,
                "prevEndpointCount": prev.get("endpointCount"),
                "newEndpointCount": len(ops) if ops else None,
                "operations": ops,
                "blobUrl": BLOB.format(repo=repo, ref=ref, path=path),
            })

    return {
        "ref": ref,
        "repo": repo,
        "changed": sorted(changed, key=lambda c: c["path"]),
        "missing": missing,
        "unchangedCount": unchanged,
        "trackedCount": len(paths),
        "note": ("Content-level diff of the TRACKED spec surface via "
                 "raw.githubusercontent.com (no GitHub API). Brand-new files, "
                 "new branches, and commit/PR history are NOT observable here — "
                 "check the tree URL manually until the session's GitHub scope "
                 "includes the org."),
        "treeUrl": TREE.format(repo=repo, ref=ref),
        "compareUrlNote": ("commit-range compare URL requires the GitHub API "
                           "(unavailable); per-file blobUrl is provided instead"),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--state", required=True)
    ap.add_argument("--ref", default="main")
    ap.add_argument("--repo", default=REPO)
    ap.add_argument("--fixture-dir", help="read specs from a local dir (offline test)")
    ap.add_argument("--probe", action="store_true",
                    help="also probe convention-derived successor folders for NEW spec files")
    ap.add_argument("--out")
    a = ap.parse_args()

    state = json.load(open(a.state))
    result = diff(state, a.ref, a.repo, a.fixture_dir)
    if a.probe:
        result["discovery"] = discover(state, a.ref, a.repo, a.fixture_dir)

    text = json.dumps(result, ensure_ascii=False, indent=1)
    if a.out:
        open(a.out, "w").write(text)
    else:
        print(text)

    sys.stderr.write(
        f"\nspecdiff @ {a.repo}#{a.ref}: {len(result['changed'])} changed, "
        f"{len(result['missing'])} missing, {result['unchangedCount']}/"
        f"{result['trackedCount']} unchanged\n")
    for c in result["changed"]:
        sys.stderr.write(f"  CHANGED {c['path']}  "
                         f"{c['prevVersion']} -> {c['newVersion']}  "
                         f"endpoints {c['prevEndpointCount']} -> {c['newEndpointCount']}\n")
    for mss in result["missing"]:
        sys.stderr.write(f"  MISSING {mss['path']}\n")
    if "discovery" in result:
        dsc = result["discovery"]
        sys.stderr.write(f"  probe: {len(dsc['newCandidates'])} new candidate(s) "
                         f"from {dsc['probed']} convention-derived path(s)\n")
        for c in dsc["newCandidates"]:
            sys.stderr.write(f"  NEW-FILE {c['path']}\n")


if __name__ == "__main__":
    main()
