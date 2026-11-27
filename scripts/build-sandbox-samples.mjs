#!/usr/bin/env node
/**
 * Extracts the small synthetic sample the /data-sandbox page shows.
 *
 * Source: a built checkout of openfinance-os/data-sandbox
 * (`npm ci && npm run build:spec && npm run build:fixtures` there first).
 *
 *   node scripts/build-sandbox-samples.mjs ../data-sandbox
 *
 * Every envelope keeps the generator's `_watermark` exactly as emitted.
 * Lists are shortened and identity blocks are left out; each such cut is
 * recorded in `excerpt` so the page can say what was removed.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import prettier from 'prettier';

const sandboxRoot = resolve(process.argv[2] ?? '../data-sandbox');
const pkg = join(sandboxRoot, 'packages/sandbox-fixtures');
const LFI = 'median';
const TRANSACTION_LIMIT = 6;

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Keep the wire envelope and the watermark; drop the bulky provenance block. */
function wire(envelope) {
  const { Data, Links, Meta, _watermark } = envelope;
  if (typeof _watermark !== 'string' || !_watermark.startsWith('SYNTHETIC')) {
    throw new Error('Fixture is missing its SYNTHETIC watermark');
  }
  return { Data, ...(Links ? { Links } : {}), ...(Meta ? { Meta } : {}), _watermark };
}

const PERSONAS = [
  { id: 'salaried_expat_mid', banking: true, insurance: null },
  { id: 'sme_cash_heavy', banking: true, insurance: null },
  { id: 'motor_comprehensive_mid', banking: false, insurance: 'motor' },
];

const personas = PERSONAS.map(({ id, banking, insurance }) => {
  const manifest = read(join(pkg, 'personas', `${id}.json`));
  const seed = manifest.default_seed;
  const dir = join(pkg, 'bundles', id, LFI, `seed-${seed}`);
  const file = (name) => read(join(dir, `${name}.json`));

  const views = {};

  if (banking) {
    const accounts = file('accounts');
    const firstAccount = accounts.Data.Account[0].AccountId;
    const balances = file(`accounts__${firstAccount}__balances`);
    const transactions = file(`accounts__${firstAccount}__transactions`);
    const allTransactions = transactions.Data.Transaction;
    const recent = [...allTransactions]
      .sort((x, y) => y.BookingDateTime.localeCompare(x.BookingDateTime))
      .slice(0, TRANSACTION_LIMIT);

    views.accounts = { path: '/accounts', envelope: wire(accounts), excerpt: null };
    views.balances = {
      path: '/accounts/{AccountId}/balances',
      envelope: wire(balances),
      excerpt: null,
    };
    views.transactions = {
      path: '/accounts/{AccountId}/transactions',
      envelope: wire({
        ...transactions,
        Data: { ...transactions.Data, Transaction: recent },
      }),
      excerpt: `Latest ${recent.length} of ${allTransactions.length} transactions in the fixture.`,
    };
  }

  if (insurance) {
    const list = file(`${insurance}-insurance-policies`);
    const policyId = list.Data.Policies[0].InsurancePolicyId;
    const detail = file(`${insurance}-insurance-policies__${policyId}`);
    // PolicyHolder and Identity carry identity-shaped synthetic values
    // (names, phone, Emirates ID format). They are not republished here.
    const { PolicyHolder: _holder, Identity: _identity, ...rest } = detail.Data;
    views.policies = {
      path: `/${insurance}-insurance-policies`,
      envelope: wire(list),
      excerpt: null,
    };
    views.policy = {
      path: `/${insurance}-insurance-policies/{InsurancePolicyId}`,
      envelope: wire({ ...detail, Data: rest }),
      excerpt: 'PolicyHolder and Identity blocks are left out of this excerpt.',
    };
  }

  return {
    id,
    name: manifest.name,
    segment: manifest.segment,
    domains: manifest.domains ?? [manifest.domain],
    lfi: LFI,
    seed,
    views,
  };
});

const sourceCommit = execFileSync('git', ['-C', sandboxRoot, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const scenario = read(
  join(pkg, 'bundles', personas[0].id, LFI, `seed-${personas[0].seed}`, 'accounts.json')
)._scenario;

const out = {
  source: {
    repository: 'https://github.com/openfinance-os/data-sandbox',
    commit: sourceCommit,
    corpusVersion: scenario.corpusVersion,
    referenceDate: scenario.referenceDate,
    spec: {
      banking: {
        version: scenario.specProvenance.banking.version,
        commit: scenario.specProvenance.banking.commit,
      },
      insurance: {
        version: scenario.specProvenance.insurance.version,
        commit: scenario.specProvenance.insurance.commit,
      },
    },
  },
  personas,
};

const target = resolve('data/sandbox/samples.json');
writeFileSync(target, await prettier.format(JSON.stringify(out), { parser: 'json' }));
console.log(`wrote ${target} (${personas.length} personas)`);
