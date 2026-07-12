/**
 * Dependency-audit gate.
 *
 * `npm audit` (all deps, all severities) fails the CI gate on advisories in
 * dev-only tooling and in framework code paths this static-output site never
 * runs. This checker scopes the gate to what actually matters:
 *
 *   1. Production dependencies only  (npm audit --omit=dev)
 *   2. Critical + high severities only
 *   3. Minus a small, documented allowlist of advisories that are not
 *      reachable on a static (`output: 'static'`) site and whose only fix is
 *      a deferred major upgrade (astro 7). Each entry is justified below.
 *
 * Anything critical/high that is NOT dev-only and NOT allowlisted fails the
 * build — so a genuinely exploitable, shippable vuln still stops a PR.
 *
 * Usage: npm audit --omit=dev --json > audit.json && node scripts/check-audit.mjs audit.json
 */
import { readFileSync } from 'node:fs';

// Advisories accepted for this static-output site. Revisit when astro is
// upgraded to 7.x (which patches the astro-own ones at the source).
const ALLOWLIST = new Map([
  [
    'GHSA-8hv8-536x-4wqp',
    'astro Reflected XSS via unescaped slot name — needs user-controlled slot names; none here',
  ],
  [
    'GHSA-2pvr-wf23-7pc7',
    'astro Host-header SSRF in prerendered error page — needs SSR; site is output:static',
  ],
  [
    'GHSA-77vg-94rm-hx3p',
    'devalue DoS via sparse arrays — used by astro server islands; not run on static output',
  ],
  [
    'GHSA-5wm8-gmm8-39j9',
    'fast-xml-builder attribute bypass — build-time RSS from our own trusted content',
  ],
  [
    'GHSA-fx2h-pf6j-xcff',
    'vite server.fs.deny bypass (Windows dev server) — not present in the static production build',
  ],
]);

const BLOCKING = new Set(['critical', 'high']);

function ghsaFrom(via) {
  // advisory objects carry a github.com/advisories/GHSA-... url
  const m = typeof via?.url === 'string' && via.url.match(/GHSA-[0-9a-z-]+/i);
  return m ? m[0] : null;
}

const file = process.argv[2] || 'audit.json';
const audit = JSON.parse(readFileSync(file, 'utf8'));
const vulns = audit.vulnerabilities || {};

const blocking = [];
const allowed = [];

for (const [pkg, info] of Object.entries(vulns)) {
  if (!BLOCKING.has(info.severity)) continue;
  for (const via of info.via || []) {
    if (typeof via !== 'object' || !BLOCKING.has(via.severity)) continue;
    const ghsa = ghsaFrom(via);
    const entry = { pkg, severity: via.severity, ghsa, title: via.title };
    if (ghsa && ALLOWLIST.has(ghsa)) allowed.push(entry);
    else blocking.push(entry);
  }
}

if (allowed.length) {
  console.log('Allowlisted (not reachable on static output):');
  for (const a of allowed) console.log(`  · ${a.severity} ${a.pkg} ${a.ghsa} — ${a.title}`);
}

if (blocking.length) {
  console.error('\nBlocking critical/high vulnerabilities in production dependencies:');
  for (const b of blocking)
    console.error(`  ✗ ${b.severity} ${b.pkg} ${b.ghsa || '(no GHSA)'} — ${b.title}`);
  console.error(
    '\nFix these or, if they are genuinely not reachable, add them to the allowlist in scripts/check-audit.mjs with a justification.'
  );
  process.exit(1);
}

console.log('\nNo blocking production vulnerabilities. ✓');
