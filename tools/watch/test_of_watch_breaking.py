#!/usr/bin/env python3
"""Self-contained tests for of_watch_breaking.py — no network, no pytest.

Run:  python3 tools/watch/test_of_watch_breaking.py
Covers draft/RC version-line detection (replacing hand-classification of
registers on a not-yet-final standards line, which is how the v2.2-rc1 /
v2.2.x registers were first found and classified manually).
"""
import of_watch_breaking as b


def eq(name, got, want):
    assert got == want, f"{name}: got {got!r}, want {want!r}"
    print(f"  ok  {name} == {want!r}")


def main():
    eq("_version_num errata", b._version_num("v2.1-errata2"), (2, 1))
    eq("_version_num rc", b._version_num("v2.2-rc1"), (2, 2))
    eq("_version_num patch-line", b._version_num("v2.1.x"), (2, 1))
    eq("_version_num unrecognized", b._version_num("nonsense"), (0, 0))

    # explicit pre-release markers are draft regardless of version-number comparison
    for seg in ["v2.1-rc1", "v2.1-draft", "v2.1-beta", "v2.1-alpha2"]:
        path = f"supporting/breaking-changes/standards/{seg}/uae-x-openapi/breaking-changes.yaml"
        eq(f"_is_draft({seg!r}) via marker", b._is_draft(path, "v2.1-final"), True)

    # a newer major.minor than the live line is draft even with no rc/draft marker
    eq("_is_draft(v2.2.x) newer than live v2.1", b._is_draft(
        "supporting/breaking-changes/api-hub/v2.2.x/uae-api-hub-consent-manager-openapi/breaking-changes.yaml",
        "v2.1-final"), True)

    # the live line and its errata/patch releases are never draft
    eq("_is_draft(v2.1-errata3) is not draft", b._is_draft(
        "supporting/breaking-changes/standards/v2.1-errata3/uae-bank-initiation-openapi/breaking-changes.yaml",
        "v2.1-final"), False)
    eq("_is_draft(v2.1.x) is not draft", b._is_draft(
        "supporting/breaking-changes/api-hub/v2.1.x/uae-api-hub-consent-manager-openapi/breaking-changes.yaml",
        "v2.1-final"), False)

    eq("_version_label merged", b._version_label(
        "supporting/breaking-changes/standards/v2.1-errata3/x/breaking-changes.yaml"),
       "v2.1-errata3 · merged")
    eq("_version_label draft", b._version_label(
        "supporting/breaking-changes/standards/v2.2-rc1/x/breaking-changes.yaml", draft=True),
       "v2.2-rc1 · DRAFT, not yet enforced")

    # ---------------------------------------------------------------- build()
    # Stub _fetch so build() runs with no network, mixing one live-line
    # register with one draft-line register discovered for the first time.
    REGISTERS = [
        "supporting/breaking-changes/standards/v2.1-errata3/uae-bank-initiation-openapi/breaking-changes.yaml",
        "supporting/breaking-changes/api-hub/v2.2.x/uae-api-hub-consent-manager-openapi/breaking-changes.yaml",
    ]
    FAKE_DOCS = {
        REGISTERS[0]: [{"rule": "request-property-pattern-added",
                         "rationale": "Adds a pattern. The remedy is to sanitise the value first.",
                         "endpoints": [{"method": "POST", "path": "/payments"}]}],
        REGISTERS[1]: [{"rule": "request-property-type-changed",
                         "rationale": "Still draft, not yet enforced.",
                         "endpoints": [{"method": "POST", "path": "/consents"}]}],
    }
    orig_fetch = b._fetch
    b._fetch = lambda ref, path: "stub"  # replaced by _yaml_load stub below
    orig_yaml_load = b._yaml_load
    b._yaml_load = lambda text: None  # overridden per-call below via closure trick

    def fake_fetch(ref, path):
        return path  # pass the path through so _yaml_load can key off it

    def fake_yaml_load(path):
        return FAKE_DOCS.get(path, [])

    b._fetch = fake_fetch
    b._yaml_load = fake_yaml_load
    try:
        block = b.build(ref="main", registers=REGISTERS, current_version="v2.1-final")
    finally:
        b._fetch = orig_fetch
        b._yaml_load = orig_yaml_load

    # build() also always appends the two hardcoded RELEASE_NOTE_BEHAVIOUR rows
    # to tpp/lfi regardless of `registers` -- isolate the register-derived rows.
    bank_initiation_rows = [r for r in block["tpp"] if "Bank Service Initiation" in r[0]]
    eq("build(): live-line register lands in tpp (standards layer)", len(bank_initiation_rows), 1)
    eq("build(): tpp row status is not draft", bank_initiation_rows[0][4], "live")
    # the v2.2.x register is api-hub -> lfi layer, but DRAFT overrides layer
    # routing entirely: it must land in pending, not lfi.
    consent_manager_in_lfi = [r for r in block["lfi"] if "Consent Manager" in r[0]]
    eq("build(): draft-line register never lands in lfi", len(consent_manager_in_lfi), 0)
    pending_from_registers = [r for r in block["pending"] if "api-hub-consent-manager" in r[5]]
    eq("build(): draft-line register lands in pending", len(pending_from_registers), 1)
    eq("build(): pending row status is draft", pending_from_registers[0][4], "draft")
    eq("build(): pending row version label", pending_from_registers[0][1],
       "v2.2.x · DRAFT, not yet enforced")
    # the hand-maintained PENDING list is still carried through unchanged
    for hand_row in b.PENDING:
        assert hand_row in block["pending"], "hand-maintained PENDING entry dropped"
    print("  ok  build() routes draft-line registers to pending automatically, "
          "live-line registers to tpp/lfi, and keeps the hand-maintained PENDING list")

    print("\nall of_watch_breaking tests passed")


if __name__ == "__main__":
    main()
