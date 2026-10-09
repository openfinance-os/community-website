# Principal user tasks — 8 October 2026

This local batch follows the approved codebase and user-value review and uses the UAE Open Finance skill's separation of directory metadata, consent/security responsibilities and operational evidence. It builds on the credibility batch on `codex/credibility-and-access`.

## File-specific plan

- Add a typed, validated directory access layer and pure coverage helpers in `src/lib/`. Keep production and sandbox observations separate, retain every resource version and unknown family, and fail a build on malformed current observations.
- Add `/observatory/coverage/` with environment, family, version and name/ID filters; sorting; comparison of up to three registrations; persistent URL state; citations; and a filtered CSV export. Show source dates and declarations. Operational activity and go-live approval remain unknown in this directory dataset.
- Add shared Observatory navigation to overview, coverage, briefing, profile and data views. Add a comparison handoff from profiles.
- Extend the existing snapshot-derived changelog to both environments and resource/role removals and resource declaration changes. Add dated profile timelines with explicit collection-gap and schema-change caveats.
- Render the saved Watch summary at build time on the homepage and an integrated briefing page, with run date, operational cutoff and links to the full evidence. Preserve the full Watch and its underlying calculations.
- Validate filtering and export semantics, identity, timeline derivation, URL restoration, comparison limits, mobile layout and no-JavaScript reading. Run the repository's pinned Node checks, unit tests, Chromium checks and build.

This batch does not establish improved task-completion rates; practitioner testing remains an external validation step. The public feedback destination is still pending. This note records local validation before release; pull request checks and merge status are recorded separately in GitHub.

## Results

- **Coverage and comparison:** `/observatory/coverage/` filters environment, family, version, name/ID and issuer publication, and sorts names, resource counts or observation dates. Family and version must match the same resource. Production and sandbox IDs remain separate rows. Up to three selections persist when filters change and are restored from the URL. Filtered CSV exports preserve every matching version and its source/date, with spreadsheet-formula protection.
- **Evidence:** comparison shows declared roles, resource versions, certification and completeness. Go-live approval and operational activity are explicitly unknown in the directory dataset; no name-based join to Watch traffic was inferred. Missing declarations remain distinct from false flags. The shared access layer rejects malformed dates, counts, identities, source environments and publication flags instead of synthesizing fresh observations.
- **Timelines and datasets:** both environments now derive profile timelines from their dated archives. Role removals, family removals and resource declaration changes are additional changelog event types; existing types remain available. Production and sandbox changelog JSON explain observation dates and the 8 October collector coverage correction. No historical snapshots were rewritten.
- **Briefing and navigation:** the homepage and `/observatory/briefing/` render the saved Watch summary at build time. The visible dates distinguish its 5 October run from operational logs through 29 September. Standards copy identifies the Nebras community documentation site explicitly. Shared navigation reaches coverage, briefing, full Watch, datasets and methodology; the full Watch has a main landmark and a summary fallback without JavaScript. Site search includes both new destinations.
- **Mobile:** comparison controls have 44px label hit areas. At 390px the filters use two columns where appropriate, the document has no horizontal overflow, and each table scrolls within a labeled region with a visible scroll hint. Profiles link directly to a selected comparison.

## Validation

Used Node 20.20.2 and the committed dependency lockfile. No dependencies were added.

- Astro: zero errors and warnings; 32 existing informational hints.
- Unit tests: 153 passed across ten files, including resource matching, cross-environment identity, URL state, CSV escaping, missing declarations, snapshot validation and timeline derivation. Coverage: 96.84% lines/statements, 80.76% branches and 94.87% functions.
- Chromium: all 43 tests passed. After the mobile and footer polish, the 12 relevant coverage and navigation tests passed again. Coverage scenarios include filtered downloads, selection limits, refresh restoration, profile handoff, search discovery, mobile overflow and reading without JavaScript.
- Static build: 311 pages. Updated source formatting and `git diff --check` passed.
- Visual review: the insurance filter shows ADNIC and LIVA as two production registrations with version 2.1 declarations; their comparison includes the source dates and explicit evidence gaps. Desktop and 390px views were inspected. Browser behavior checks are not a claim of full accessibility conformance or measured user satisfaction.

## Review locally

Open `/observatory/coverage/` or `/observatory/briefing/` in a local preview to inspect the implementation.

Supporting desktop and mobile screenshots are retained in the local `.playwright-mcp/` directory outside the tracked source files.

Practitioner task sessions and the public feedback destination remain pending. Claims about improved completion time, adoption or satisfaction require that validation.

Shared URLs restore filters and IDs against the latest saved observations; they are not frozen historical reports. The page explains this distinction and offers dated CSV exports to retain the observed values. Historical archives remain preserved, with date-bound public views left for a later batch.
