# Dependency security review — 8 October 2026

Compatible lockfile updates reduce the production audit from 14 vulnerable package entries (one critical, 11 high, one moderate, one low) to three (one critical, one high, one low). The existing critical/high gate drops from 19 blocking advisories to four and still fails. Package declarations, framework version, audit checker and allowlist are unchanged.

## Compatible updates

Versions were checked against official npm registry metadata, existing parent dependency ranges and the public GitHub Advisory API. These updates stay within those parent ranges. Newly resolved child dependencies, including SVGO's CSS selector libraries, follow the updated parents' declared ranges. `npm ls --all` reports no dependency errors.

| Package | Previous → updated | Relevant high advisory boundaries |
| --- | --- | --- |
| devalue | 5.7.1 → 5.9.4 | [Shared-memory serialization](https://github.com/advisories/GHSA-j22f-vq7h-c4qm) and [repeated strings](https://github.com/advisories/GHSA-mcm9-63f2-9j32): affected through 5.9.2 |
| fast-xml-builder | 1.1.4 → 1.3.1 | [Attribute bypass](https://github.com/advisories/GHSA-5wm8-gmm8-39j9): affected through 1.1.6; previously allowlisted |
| http-cache-semantics | 4.2.0 → 4.3.0 | [Cross-user cached-response disclosure](https://github.com/advisories/GHSA-ch52-4w7c-c8xp): affected through 4.2.0; the advisory does not name a first patched version |
| js-yaml | 4.1.1 → 4.3.2 | [4.3.0 boundary](https://github.com/advisories/GHSA-52cp-r559-cp3m), [4.3.1 boundary](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj), [4.3.2 boundary](https://github.com/advisories/GHSA-2883-xcg3-v3hh) |
| nanoid | 3.3.11 → 3.3.20 | Fixed 3.x boundaries: [3.3.12](https://github.com/advisories/GHSA-xwg4-73v4-xw9w), [3.3.16](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), [3.3.18](https://github.com/advisories/GHSA-2v37-7h3g-55p8) |
| postcss | 8.5.6 → 8.5.29 | [First high fix at 8.5.12](https://github.com/advisories/GHSA-6g55-p6wh-862q), [second at 8.5.18](https://github.com/advisories/GHSA-r28c-9q8g-f849) |
| smol-toml | 1.6.1 → 1.9.0 | [High advisory](https://github.com/advisories/GHSA-7w5x-hrqm-74c2): affected through 1.7.0 |
| source-map-js | 1.2.1 → 1.2.2 | [High advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q): affected below 1.2.2 |
| svgo | 4.0.1 → 4.1.0 | [First high fix at 4.0.2](https://github.com/advisories/GHSA-2p49-hgcm-8545), [second at 4.1.0](https://github.com/advisories/GHSA-w27v-7q3p-w38r) |
| vite | 6.4.2 → 6.4.4 | [Windows development-server advisory](https://github.com/advisories/GHSA-fx2h-pf6j-xcff): affected 6.x through 6.4.2; previously allowlisted |
| fast-xml-parser | 5.5.12 → 5.11.2 | Compatible RSS parser refresh also clears its moderate advisory |

Registry source: `https://registry.npmjs.org/<package>` and exact version metadata. Installation used the official registry, existing version constraints and `--ignore-scripts`; no forced major upgrade or override was applied. These packages are build/framework dependencies of a static site. Passing an audit range check does not establish whether a particular input was exploitable.

## Remaining gate failures and exposure

| Package/advisory | Locked version | Required boundary |
| --- | --- | --- |
| Astro [AVIF image optimization RCE](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) | 5.18.1 | Astro 7.2.8 or later |
| Sharp [libvips vulnerabilities](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | 0.34.5 | Sharp 0.35.0 or later |
| Sharp [libheif vulnerabilities](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) | 0.34.5 | Sharp 0.35.4 or later |
| Sharp [librsvg vulnerability](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) | 0.34.5 | Sharp 0.35.5 or later |

Astro's advisory requires processing an attacker-controlled AVIF through the default Sharp image service. The Sharp advisories concern native decoding of untrusted image inputs; the libheif and librsvg reports describe possible RCE under particular glibc Linux/runtime conditions.

This checkout has `output: 'static'`, no SSR adapter, no `astro:assets` imports, no Astro `Image`/`Picture` components or remote image optimizer configuration, no checked-in AVIF/HEIF/HEIC input, and no generated `_image` endpoint. Images use ordinary HTML URLs. The added social image is a checked-in PNG generated from existing trusted branding. Inspection therefore found no public request-to-native-decoder path in the current static build. This is a source/build exposure assessment, not proof about all CI inputs or future image-processing changes; it does not clear the audit gate or justify an automatic allowlist addition.

Astro 5 declares optional Sharp `^0.34.0`; 0.34.5 is the newest compatible stable version. Even the available Astro 5.18.2 patch keeps that range and remains affected by the Astro advisory. Sharp 0.35.5 is outside the parent range. An override would need explicit compatibility validation and would still leave Astro's own advisory entry unresolved.

## Major-upgrade scope

The official registry's current Astro 7.3.7 metadata requires Node `>=22.12.0`, Vite `^8.3.1`, the Rust compiler package `@astrojs/compiler-rs` and optional Sharp `^0.35.4`. A separate migration should resolve Sharp to at least 0.35.5, update the repository/CI Node 20 baseline, check Astro integrations and compiler/runtime APIs used by the component-rendering tests, and rerun validation, coverage, static routes/sitemap/RSS and browser checks. Review the static output and deployment runtime requirements before deployment. No framework migration or production setting change is included here.

The remaining low esbuild advisory concerns a Windows development-server file-read path and is outside this critical/high fix scope. Two pre-existing Astro high advisory exceptions remain in the unchanged checker.

## Validation contract

The residual integration is based on the merged credibility, coverage and briefing changes in #592. Validation uses an isolated, checksum-verified Node 20.20.2 runtime matching the existing CI baseline. Required checks are type/format validation, dependency-tree verification, unit coverage, all Watch Python suites, static build, Chromium browser tests and the unchanged production critical/high audit checker.

The four remaining advisories above block normal merge. This compatible dependency refresh does not clear that gate or establish production acceptance. A separately approved Astro/Node migration and its compatibility/deployment validation are required before a clean security gate can be claimed.
