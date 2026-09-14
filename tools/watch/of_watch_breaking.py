#!/usr/bin/env python3
"""Build the `breaking` payload block for the Open Finance Ecosystem Watcher.

WHY THIS EXISTS
---------------
The weekly watcher used to track only the *paths* of the api-specs
breaking-changes registers (state key specForwardSignals.breakingChangesRegister).
It never parsed them, so an accepted breaking change shipped *inside* an existing
errata label (e.g. the v2.1-errata2 Risk-object parity change) slipped through:
the errata label didn't bump and the tracked main SHA was static, so the watcher
reported "no change". This module closes that gap.

It fetches each register, extracts the accepted breaking changes, classifies each
by *which side of the integration must act*, and emits the `breaking` block the
ecosystem template renders:

    breaking = {
      "headline": str,
      "asOf": str,
      "tpp":     [[surface, version, whatBreaks, requiredAction, status, srcUrl], ...],
      "lfi":     [[surface, version, whatBreaks, requiredAction, status, srcUrl], ...],
      "pending": [[source, state, whatChanging, watch, status, srcUrl], ...],
      "note": str,
    }

CLASSIFICATION (the user's two axes)
------------------------------------
* breaking-changes/standards/**          -> "tpp"  (the contract TPPs build to;
                                                    LFIs also implement it, but the
                                                    TPP is the party that constructs
                                                    the request / consumes the response)
* breaking-changes/api-hub/**            -> "lfi"  (Hub control plane the LFI integrates)
* breaking-changes/ozone-connect/**      -> "lfi"  (LFI execution layer)

STATUS pills
------------
* live       merged to main under the current errata, enforced now
* behaviour  a deployed API Hub release-note change (no spec-file diff)
* doc        documentation-alignment only (spec now matches live wire) — low risk
* low        contract tightened but no real consumer could be affected
* staging    on a branch, not yet normative
* draft      register lives on a not-yet-final standards line (rc/draft/beta,
             or simply a newer major.minor than the current live version) —
             content is real but not enforced; always routed to `pending`,
             never `tpp`/`lfi` (see DRAFT DETECTION below)

DRAFT DETECTION
---------------
A register's *version segment* (the path component right after
`standards|api-hub|ozone-connect`, e.g. `v2.1-errata2` or `v2.2-rc1`) is
compared against `current_version` (the standards line that is actually live
today — pass `--current-version` or `--state`, which reads `standards.version`
from it). It counts as DRAFT when either:
  (a) the segment carries an explicit pre-release marker (-rc*, -draft, -beta,
      -alpha), or
  (b) its major.minor is newer than `current_version`'s (e.g. v2.2.x while
      v2.1 is still the live line).
This means a newly-discovered register on the next standards line lands in
`pending` automatically the first run it's seen, without a human having to
notice and hand-classify it (as happened the first time the v2.2-rc1 /
v2.2.x registers appeared).

Release-note behaviour changes have no register file, so they are listed in
RELEASE_NOTE_BEHAVIOUR below; refresh that list from the API Hub release notes
each run (it is small and changes rarely).

USAGE
-----
    # fetch the registers named in the tracker state and print the block
    python3 tools/of_watch_breaking.py --state .openfinance-tracker-state.json --out breaking.json

    # or point at an explicit api-specs ref / register list
    python3 tools/of_watch_breaking.py --ref main --out breaking.json
"""
import argparse, json, re, sys, urllib.request

RAW = "https://raw.githubusercontent.com/Nebras-Open-Finance/api-specs/{ref}/{path}"
WEB = "https://github.com/Nebras-Open-Finance/api-specs/blob/{ref}/{path}"

# Registers known on main today. The tracker state's
# specForwardSignals.breakingChangesRegister is the source of truth at runtime;
# this is the fallback when --state is not given.
DEFAULT_REGISTERS = [
    "supporting/breaking-changes/api-hub/v2.1.x/uae-api-hub-consent-manager-openapi/breaking-changes.yaml",
    "supporting/breaking-changes/standards/v2.1-errata2/uae-account-information-openapi/breaking-changes.yaml",
    "supporting/breaking-changes/standards/v2.1-errata2/uae-authorization-endpoints-openapi/breaking-changes.yaml",
    "supporting/breaking-changes/standards/v2.1-errata2/uae-bank-initiation-openapi/breaking-changes.yaml",
    "supporting/breaking-changes/standards/v2.1-errata2/uae-confirmation-of-payee-openapi/breaking-changes.yaml",
    "supporting/breaking-changes/standards/v2.1-errata2/uae-webhook-template-openapi/breaking-changes.yaml",
]

# Live API Hub release-note behaviour changes (no spec-file diff). Refresh from
# https://nebras-open-finance.com/tech/release-notes-and-erratas/ each run.
# audience: "tpp" = the caller must change; "lfi" = the LFI/Hub side must change.
RELEASE_NOTE_BEHAVIOUR = [
    {
        "audience": "tpp", "release": "2026.19.0 (live 9 Jun)", "version": "API Hub v8 · behaviour",
        "surface": "API Hub — Product API endpoints",
        "breaks": "x-fapi-customer-ip-address request header is now MANDATORY on Product API endpoints",
        "action": "Send x-fapi-customer-ip-address on every Product API call, or requests are rejected",
        "status": "behaviour",
        "src": "https://nebras-open-finance.com/tech/release-notes-and-erratas/",
    },
    {
        "audience": "tpp", "release": "2026.19.0 (live 9 Jun)", "version": "API Hub v8 · behaviour",
        "surface": "API Hub — authorization (FAPI 2.0)",
        "breaks": "Authorization-code lifetime cut to 60 seconds for FAPI 2.0 profiles",
        "action": "Exchange the auth code for a token within 60s of issuance",
        "status": "behaviour",
        "src": "https://nebras-open-finance.com/tech/release-notes-and-erratas/",
    },
]

# Branch-only reworks that foreshadow a future breaking change (not on main).
# NOTE: creditor-pii-sr2026 (previously pending here) MERGED to main via PR#19 on
# 2026-06-29 (commit 0383c8b3) — its SWIFT SR2026 international-PII restructuring is
# now enforced/live under authorization-endpoints + bank-initiation (v2.1-errata2) and
# is picked up automatically via DEFAULT_REGISTERS above.
PENDING = [
    [
        "api-specs branch creditor-debtor-reference-charset (NOT on main)", "staging · +1 ahead, 4 behind main",
        "Implements OFP-003 (approved 1 Jul 2026, decision DR-2026-003): adds a `pattern` regex "
        "(ISO 20022 / SWIFT “x” set — Latin letters, digits, space, and / - ? : ( ) . , ’ +; the "
        "Arabic block proposed originally was dropped) to AECreditorReference / AEDebtorReference across "
        "the API Hub Consent Manager, Ozone Connect bank-service-initiation + consent-events-actions, and the "
        "standards authorization-endpoints + bank-initiation specs, plus prepared breaking-changes register entries.",
        "A further payment-reference-format breaking change is staged — watch for merge to main under v2.1-errata2/3",
        "staging",
        "https://github.com/Nebras-Open-Finance/api-specs/compare/main...creditor-debtor-reference-charset",
    ],
]

# Friendly surface names per spec slug.
SURFACE = {
    "uae-bank-initiation-openapi": "Bank Service Initiation (uae-bank-initiation)",
    "uae-authorization-endpoints-openapi": "Authorization Endpoints (uae-authorization-endpoints)",
    "uae-account-information-openapi": "Account Information (uae-account-information)",
    "uae-confirmation-of-payee-openapi": "Confirmation of Payee (uae-confirmation-of-payee)",
    "uae-webhook-template-openapi": "Webhook Template (uae-webhook-template)",
    "uae-api-hub-consent-manager-openapi": "API Hub Consent Manager (uae-api-hub-consent-manager)",
}

RULE_PHRASE = {
    "request-body-additional-properties-removed": "object closed to undeclared properties (additionalProperties:false)",
    "request-property-additional-properties-removed": "nested object(s) closed to undeclared properties",
    "request-property-enum-value-removed": "request enum value(s) removed",
    "response-property-enum-value-removed": "response enum value(s) removed",
    "request-property-min-length-set": "request min-length now enforced",
    "request-property-max-length-set": "request max-length now enforced",
    "request-property-max-length-decreased": "request max-length decreased",
    "request-body-type-changed": "request body schema restructured",
    "request-property-type-changed": "request property type changed",
    "response-property-type-changed": "response property type changed",
    "response-body-one-of-added": "response remodelled as oneOf per variant",
    "response-body-type-changed": "response body type changed",
    "response-required-property-removed": "top-level required property moved into subschemas",
    "request-property-became-enum": "request property became an enum",
}


def _yaml_load(text):
    try:
        import yaml
        return yaml.safe_load(text)
    except Exception:
        return _mini_parse(text)


def _mini_parse(text):
    """Dependency-free fallback: extract entries good enough for display.

    Captures, per top-level list item: rule/rules, endpoints (method+path) and
    the first sentence of the rationale. Not a full YAML parser.
    """
    entries, cur = [], None
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        ln = lines[i]
        if re.match(r"^-\s", ln) or re.match(r"^- ", ln):
            if cur:
                entries.append(cur)
            cur = {"rules": [], "endpoints": [], "rationale": ""}
        if cur is not None:
            mr = re.search(r"^\s*-?\s*rule:\s*(\S+)", ln)
            if mr:
                cur["rules"].append(mr.group(1))
            if re.search(r"^\s+-\s+[A-Za-z-]+$", ln) and "rule" in lines[max(0, i - 1)] + lines[max(0, i - 2)]:
                cur["rules"].append(ln.strip("- ").strip())
            mp = re.search(r"path:\s*(\S+)", ln)
            mm = re.search(r"method:\s*(\S+)", ln)
            if mm and mp:
                cur["endpoints"].append({"method": mm.group(1), "path": mp.group(1)})
            elif mp:
                cur["endpoints"].append({"path": mp.group(1)})
        i += 1
    if cur:
        entries.append(cur)
    return entries


def _fetch(ref, path):
    url = RAW.format(ref=ref, path=path)
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read().decode("utf-8")


def _layer(path):
    if "/breaking-changes/standards/" in path:
        return "tpp"
    if "/breaking-changes/api-hub/" in path or "/breaking-changes/ozone-connect/" in path:
        return "lfi"
    return "tpp"


def _spec_slug(path):
    m = re.search(r"/([a-z0-9-]+-openapi)/breaking-changes\.yaml$", path)
    return m.group(1) if m else path


def _version_segment(path):
    m = re.search(r"/breaking-changes/(?:standards|api-hub|ozone-connect)/([^/]+)/", path)
    return m.group(1) if m else ""


def _version_label(path, draft=False):
    v = _version_segment(path)
    return v + (" · DRAFT, not yet enforced" if draft else " · merged")


DRAFT_MARKER_RE = re.compile(r"-(rc|draft|beta|alpha)\d*\b", re.I)
VERSION_NUM_RE = re.compile(r"v(\d+)\.(\d+)")


def _version_num(v):
    """'v2.1-errata2' -> (2, 1); 'v2.2-rc1' -> (2, 2); 'v2.1.x' -> (2, 1)."""
    m = VERSION_NUM_RE.match(v or "")
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)


def _is_draft(path, current_version):
    """See "DRAFT DETECTION" in the module docstring."""
    seg = _version_segment(path)
    if DRAFT_MARKER_RE.search(seg):
        return True
    return _version_num(seg) > _version_num(current_version)


def _severity(rationale, rules):
    """Map an accepted breaking change to a display severity.

    Order matters. "low" (no live consumer can be affected) and "doc" (spec now
    matches the live wire) are asserted by the change author and take precedence.
    Otherwise a *request-side* tightening (server now rejects) is "live"; a
    *response-only* narrowing cannot break a conforming client at the transport
    level (oasdiff treats it as a warning), so it defaults to "doc".
    """
    r = (rationale or "").lower()
    rules = rules or []
    low_markers = [
        "affects no existing consumer", "never a live", "were not live", "not live in the previous version",
        "no real consumer", "any real consumer", "no known implementation", "no consumer could have relied",
        "matches all known production", "has ever been created", "never live",
    ]
    doc_markers = [
        "documentation-level change only", "no functional change", "no behavioural change",
        "aligns the specification with the actual behaviour", "already observe in production",
        "have always received", "remain unaffected",
    ]
    if any(x in r for x in low_markers):
        return "low"
    if any(x in r for x in doc_markers):
        return "doc"
    if rules and all(str(x).startswith("response-") for x in rules):
        return "doc"
    return "live"


def _endpoints_label(endpoints):
    seen, out = set(), []
    for e in endpoints or []:
        key = (e.get("method", ""), e.get("path", ""))
        if key in seen:
            continue
        seen.add(key)
        out.append((e.get("method", "") + " " + e.get("path", "")).strip())
    return ", ".join(out)


def _first_sentence(rationale):
    if not rationale:
        return ""
    txt = " ".join(rationale.split())
    m = re.search(r"(.+?[.])(\s|$)", txt)
    return (m.group(1) if m else txt)[:240]


DEFAULT_CURRENT_VERSION = "v2.1-final"


def build(ref="main", registers=None, current_version=DEFAULT_CURRENT_VERSION):
    registers = registers or DEFAULT_REGISTERS
    tpp, lfi, pending = [], [], list(PENDING)
    for path in registers:
        layer = _layer(path)
        slug = _spec_slug(path)
        surface = SURFACE.get(slug, slug)
        draft = _is_draft(path, current_version)
        version = _version_label(path, draft=draft)
        src = WEB.format(ref=ref, path=path)
        try:
            doc = _yaml_load(_fetch(ref, path))
        except Exception as e:
            sys.stderr.write("WARN could not fetch %s: %s\n" % (path, e))
            continue
        for entry in doc or []:
            rules = entry.get("rules") or ([entry["rule"]] if entry.get("rule") else [])
            rationale = entry.get("rationale", "")
            eps = _endpoints_label(entry.get("endpoints"))
            phrases = "; ".join(dict.fromkeys(RULE_PHRASE.get(x, x) for x in rules))
            what = phrases + (" — " + _first_sentence(rationale) if rationale else "")
            sev = "draft" if draft else _severity(rationale, rules)
            action = _remedy(rationale, sev)
            row = [surface + (" — " + eps if eps else ""), version, what[:300], action, sev, src]
            if draft:
                pending.append(row)
            else:
                (tpp if layer == "tpp" else lfi).append(row)

    for b in RELEASE_NOTE_BEHAVIOUR:
        row = [b["surface"] + "  (" + b["release"] + ")", b["version"], b["breaks"], b["action"], b["status"], b["src"]]
        (tpp if b["audience"] == "tpp" else lfi).append(row)

    live = sum(1 for r in tpp + lfi if r[4] in ("live", "behaviour"))
    block = {
        "headline": "%d enforced/live breaking change%s — %d TPP-facing, %d LFI/API-Hub"
                    % (live, "" if live == 1 else "s", len(tpp), len(lfi)),
        "asOf": "api-specs %s · current errata register" % ref,
        "tpp": tpp,
        "lfi": lfi,
        "pending": pending,
        "note": "Parsed from api-specs supporting/breaking-changes/** (each entry oasdiff-signed-off by Nebras) "
                "plus API Hub release-note behaviour changes. Standards-spec breaks are TPP-facing (the contract "
                "TPPs build to); api-hub / Ozone-Connect breaks are LFI / API-Hub-facing. SupplementaryData blocks "
                "stay open as extension points. Status: Enforced now = merged to main under the current errata; "
                "Live behaviour = deployed API Hub release; Doc-align = spec now matches live wire; Staging = on a "
                "branch; Draft = register lives on a not-yet-final standards line (current_version=%s) — always in "
                "pending, auto-detected by version-line comparison, not hand-classified." % current_version,
    }
    return block


def _remedy(rationale, sev):
    """Pull the author's stated remedy ('The remedy is ...') else a sane default."""
    if rationale:
        m = re.search(r"(remedy is[^.]*\.)", " ".join(rationale.split()), re.I)
        if m:
            return m.group(1)[:200].capitalize()
        m = re.search(r"(consumers should[^.]*\.)", " ".join(rationale.split()), re.I)
        if m:
            return m.group(1)[:200].capitalize()
    return {
        "doc": "Align your parser to the documented (live-wire) shape; no behaviour change.",
        "low": "No action for live integrations; align before the feature goes live.",
        "behaviour": "Update the integration to the new platform behaviour.",
        "staging": "Watch for merge to main.",
    }.get(sev, "Update the integration to the corrected contract.")


def _registers_from_state(state_path):
    with open(state_path) as f:
        st = json.load(f)
    regs = (st.get("specForwardSignals") or {}).get("breakingChangesRegister")
    return regs or None


def _current_version_from_state(state_path):
    with open(state_path) as f:
        st = json.load(f)
    return (st.get("standards") or {}).get("version")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", default="main", help="api-specs git ref (default main)")
    ap.add_argument("--state", help="tracker state json; reads specForwardSignals.breakingChangesRegister "
                    "and, unless --current-version is also given, standards.version")
    ap.add_argument("--current-version", help="the currently-final standards line (e.g. v2.1-final) that "
                     "draft detection compares register version segments against; defaults to "
                     "state.standards.version when --state is given, else %r" % DEFAULT_CURRENT_VERSION)
    ap.add_argument("--out", help="write the breaking block here (else stdout)")
    a = ap.parse_args()
    registers = _registers_from_state(a.state) if a.state else None
    current_version = a.current_version or (a.state and _current_version_from_state(a.state)) or DEFAULT_CURRENT_VERSION
    block = build(ref=a.ref, registers=registers, current_version=current_version)
    js = json.dumps(block, indent=2, ensure_ascii=False)
    if a.out:
        open(a.out, "w").write(js)
        sys.stderr.write("wrote %s — %s\n" % (a.out, block["headline"]))
    else:
        print(js)


if __name__ == "__main__":
    main()
