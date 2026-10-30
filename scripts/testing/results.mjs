import { builtinModules } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { within, readOptional } from './infra.mjs';

export async function testInputs(root) {
  const profileText = await readOptional(path.join(root, '.projectAgents/testing/profile.json'));
  const profile = profileText ? JSON.parse(profileText) : {};
  const paths = new Set();
  const pkg = JSON.parse(await readOptional(path.join(root, 'package.json')) ?? '{}');
  const external = new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }));
  const walk = async (relative) => {
    const target = await within(root, relative);
    let info;
    try { info = await stat(target); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (info.isDirectory()) {
      for (const item of await readdir(target, { withFileTypes: true })) {
        if (item.isSymbolicLink()) throw new Error('Symlink in test inputs requires explicit adaptation');
        if (!['node_modules', '.git', '.features-gen', 'test-results', 'playwright-report', '.auth'].includes(item.name)) await walk(`${relative}/${item.name}`);
      }
    } else {
      if (paths.has(relative)) return;
      paths.add(relative);
      if (/\.[cm]?[jt]sx?$/.test(relative)) {
        const source = await readFile(target, 'utf8');
        const imports = [...source.matchAll(/(?:from\s*|import\s*\(\s*|require\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map((match) => match[1]);
        for (const specifier of imports) {
          if (!specifier.startsWith('.')) {
            const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
            if (!specifier.startsWith('node:') && !builtinModules.includes(packageName) && !external.has(packageName) && !(profile.additionalInputs?.length)) throw new Error(`Declare additionalInputs for unresolved import: ${specifier}`);
            continue;
          }
          const base = path.posix.normalize(path.posix.join(path.posix.dirname(relative), specifier));
          let resolved;
          for (const candidate of [base, ...(base.endsWith('.js') ? [base.slice(0, -3) + '.ts'] : []), ...['.ts', '.tsx', '.js', '.mjs', '.mts', '.cts', '/index.ts', '/index.js'].map((ext) => base + ext)]) {
            const candidatePath = await within(root, candidate);
            try { if ((await stat(candidatePath)).isFile()) { resolved = candidate; break; } } catch (error) { if (error.code !== 'ENOENT') throw error; }
          }
          if (!resolved) throw new Error(`Unresolved test input: ${specifier}`);
          await walk(resolved);
        }
      }
      if (paths.size > 2000 || info.size > 2 * 1024 * 1024) throw new Error('Test-input fingerprint limit exceeded');
    }
  };
  for (const relative of new Set(['tests/e2e', ...(profile.additionalInputs ?? []), profile.features, profile.steps, profile.seed, profile.config, 'playwright.bdd.config.ts', '.projectAgents/testing/profile.json', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].filter(Boolean))) await walk(relative);
  const hash = createHash('sha256');
  let newest = 0;
  for (const relative of [...paths].sort()) {
    const file = await within(root, relative);
    hash.update(relative + '\0'); hash.update(await readFile(file));
    newest = Math.max(newest, (await stat(file)).mtimeMs);
  }
  return { fingerprint: hash.digest('hex'), newest, files: [...paths].sort() };
}
export async function importResults(root, registry, report) {
  const inputs = await testInputs(root);
  const startedAt = Date.parse(report.stats?.startTime);
  if (!Number.isFinite(startedAt) || inputs.newest > startedAt) throw new Error('Report predates current test inputs; rerun tests');
  if (report.errors?.length) throw new Error('Report contains global errors; report environment as blocked');
  const scenarios = [];
  const untagged = [];
  const walk = (suites) => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        const ids = (spec.tags ?? []).map((tag) => tag.replace(/^@/, '')).filter((tag) => /^bdd-[a-f0-9]{12}$/.test(tag));
        if (!ids.length) { untagged.push(spec.title); continue; }
        if (ids.length !== 1) throw new Error('Each test needs exactly one registry ID tag');
        const record = registry.scenarios.find((item) => item.id === ids[0]);
        if (!record || record.conflict) throw new Error('Report tag has no unambiguous registry scenario');
        for (const test of spec.tests ?? []) {
          const results = test.results ?? [];
          const passed = test.expectedStatus === 'passed' && test.status === 'expected' && results.length === 1 && results[0].status === 'passed';
          if (!spec.id) throw new Error('Report test instance ID is missing');
          scenarios.push({ id: record.id, instance: spec.id, signature: record.variants[0].signature, title: spec.title, project: test.projectName ?? '', status: passed ? 'passed' : results.some((result) => ['failed', 'timedOut'].includes(result.status)) ? 'failed' : 'blocked' });
        }
      }
      walk(suite.suites);
    }
  };
  walk(report.suites);
  return { schemaVersion: 1, kind: 'run-evidence', fingerprint: inputs.fingerprint, startedAt: report.stats.startTime, scenarios, untagged };
}
export async function verifyEvidence(root, mapping, run) {
  for (const entry of mapping.scenarios ?? []) for (const assertion of entry.assertions ?? []) {
    const text = await readFile(await within(root, assertion.file), 'utf8');
    if (!assertion.symbol || !text.includes(assertion.symbol)) throw new Error(`Missing assertion location: ${assertion.file}`);
  }
  if (run && run.fingerprint !== (await testInputs(root)).fingerprint) throw new Error('Stale run evidence: test inputs changed');
}
