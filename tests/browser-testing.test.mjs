import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, symlink, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Ajv from 'ajv/dist/2020.js';
import { inspectSources, checkCoverage, parseGherkin } from '../scripts/testing/bdd.mjs';
import { auditInfrastructure, planInfrastructure, applyInfrastructure, defaultProfile, within } from '../scripts/testing/infra.mjs';
import { importResults, verifyEvidence } from '../scripts/testing/results.mjs';
import { buildArtifacts, generateKit, validateKit } from '../scripts/project-agents.mjs';
const temp = () => mkdtemp(path.join(os.tmpdir(), 'paf-browser-test-'));
const source = (text, name = 'requirements.md') => ({ path: name, text });
const scenario = (result = 'notification is visible') => `Feature Create item\nBackground User is authenticated\nScenarios 1.1 (Create item)\nGiven the editor is open\nWhen user saves\nThen ${result}\nAnd item is visible\n`;
const bp = { schemaVersion: 1, project: { name: 'Independent project', slug: 'independent-project', kind: 'software', summary: 'Browser acceptance', workingLanguage: 'Russian', capabilityPacks: ['browser-testing'] }, policies: { communicationLanguage: 'Russian', writeApproval: 'explicit', confidentiality: 'internal', sourceCitation: 'required', delegation: 'disabled' }, qualityCriteria: ['Approved acceptance outcomes pass.'], sources: [] };

test('deduplicates source variants and preserves conflicts, provenance and independent outcomes', () => {
  const registry = inspectSources([source(scenario()), source(scenario(), 'copy.md'), source(scenario('different message'), 'conflict.md')]);
  assert.equal(registry.scenarios.length, 1);
  const item = registry.scenarios[0];
  assert.equal(item.conflict, true);
  assert.equal(item.variants.length, 2);
  assert.equal(item.variants[0].sources.length, 2);
  assert.equal(item.variants[0].expectations.length, 2);
  assert.equal(item.variants[0].sources[0].line, 3);
});
test('reimport preserves identity but invalidates approval and evidence for changed outcomes', () => {
  const old = inspectSources([source(scenario())]);
  const current = inspectSources([source(scenario('new expectation'))], old);
  assert.equal(old.scenarios[0].id, current.scenarios[0].id);
  assert.notEqual(old.scenarios[0].variants[0].signature, current.scenarios[0].variants[0].signature);
  assert.equal(checkCoverage(current, { scenarios: [{ id: old.scenarios[0].id, approvedSignature: old.scenarios[0].variants[0].signature, assertions: [] }] }).valid, false);
});
test('keeps unstructured details in signatures and excludes empty templates from previous scenarios', () => {
  const a = scenario() + '\t"Save"\n## Template\nGiven\nWhen\nThen\n';
  const b = scenario() + '\t"Cancel"\n';
  const registry = inspectSources([source(a), source(b, 'second.md')]);
  assert.equal(registry.scenarios.length, 1);
  assert.equal(registry.scenarios[0].conflict, true);
  assert.equal(registry.scenarios[0].variants[0].steps.length, 5);
  assert.ok(registry.issues.some((item) => item.code === 'orphan-empty-step'));
});
test('omits credential table values and flags incomplete requirements', () => {
  const registry = inspectSources([source('Feature Auth\nBackground logged in\n|User|Password|\n|some-user|not-for-output|\nScenario Test\nGiven\nWhen\nThen\n')]);
  assert.ok(!JSON.stringify(registry).includes('not-for-output'));
  assert.ok(registry.issues.some((item) => item.code === 'credential-table'));
  assert.ok(registry.issues.some((item) => item.code === 'empty-step'));
});
test('parses strict localized Gherkin and retains feature tags and stable IDs across renames', () => {
  const text = '# language: ru\n@domain\nФункция: Проверка\n @bdd-123456789abc\n Сценарий: Результат\n  Допустим открыта форма\n  Когда сохранено\n  Тогда виден результат\n';
  const registry = inspectSources([source(text, 'valid.feature')]);
  assert.equal(registry.issues.length, 0);
  assert.equal(registry.scenarios[0].id, 'bdd-123456789abc');
  assert.equal(registry.scenarios[0].variants[0].expectations.length, 1);
  const renamed = inspectSources([source(text.replace('Результат', 'Другой заголовок'), 'moved.feature')]);
  assert.equal(renamed.scenarios[0].id, registry.scenarios[0].id);
  assert.notEqual(renamed.scenarios[0].variants[0].signature, registry.scenarios[0].variants[0].signature);
  assert.notEqual(inspectSources([source(text.replace('@domain', '@changed'), 'valid.feature')]).scenarios[0].variants[0].signature, registry.scenarios[0].variants[0].signature);
});
test('compares outline examples by values rather than source line positions', () => {
  const text = 'Feature: Matrix\n Scenario Outline: Value\n  Given a value <value>\n  Then it is valid\n Examples:\n |value|\n |1|\n';
  const a = inspectSources([source(text, 'a.feature')]);
  const b = inspectSources([source('\n\n' + text, 'b.feature')]);
  assert.equal(a.scenarios[0].variants[0].signature, b.scenarios[0].variants[0].signature);
  assert.notEqual(inspectSources([source(text.replace('|1|', '|2|'), 'c.feature')]).scenarios[0].variants[0].signature, a.scenarios[0].variants[0].signature);
});
test('coverage requires every outcome, approval and all execution instances to pass', () => {
  const registry = inspectSources([source(scenario())]);
  const record = registry.scenarios[0];
  const variant = record.variants[0];
  const entry = { id: record.id, approvedSignature: variant.signature, assertions: variant.expectations.map((item) => ({ expectationId: item.id, file: 'tests/steps.ts', symbol: item.text })) };
  const run = { scenarios: [{ id: record.id, signature: variant.signature, instance: 'one', project: 'bdd-chromium', status: 'passed' }] };
  assert.equal(checkCoverage(registry, { projects: ['bdd-chromium'], scenarios: [entry] }, run).valid, true);
  entry.assertions.pop();
  assert.equal(checkCoverage(registry, { projects: ['bdd-chromium'], scenarios: [entry] }, run).valid, false);
  entry.assertions.push({ expectationId: variant.expectations[1].id, file: 'steps.ts', symbol: 'assert' });
  run.scenarios.push({ id: record.id, signature: variant.signature, instance: 'two', project: 'bdd-chromium', status: 'blocked' });
  assert.equal(checkCoverage(registry, { projects: ['bdd-chromium'], scenarios: [entry] }, run).valid, false);
});
test('clean infrastructure plan is read-only, additive, idempotent and rejects stale plans before writes', async () => {
  const root = await temp();
  const plan = await planInfrastructure(root);
  assert.deepEqual(await readdir(root), []);
  assert.deepEqual(plan.blockers, []);
  await applyInfrastructure(root, plan);
  assert.deepEqual((await planInfrastructure(root)).changes, []);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json')));
  assert.equal(pkg.devDependencies['playwright-bdd'], '9.2.1');
  assert.equal((await auditInfrastructure(root)).liveChecks.browser, 'not-run');
  const staleRoot = await temp();
  const stalePlan = await planInfrastructure(staleRoot);
  await writeFile(path.join(staleRoot, 'package.json'), '{"private":true}');
  await assert.rejects(applyInfrastructure(staleRoot, stalePlan), /Stale plan/);
  assert.deepEqual(await readdir(staleRoot), ['package.json']);
});
test('existing Playwright config, fixtures, scripts and workspace cannot be overwritten by scaffold', async () => {
  const root = await temp();
  await writeFile(path.join(root, 'playwright.config.ts'), 'custom config');
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ scripts: { 'test:e2e': 'custom-test' } }));
  const plan = await planInfrastructure(root);
  assert.ok(plan.blockers.length >= 2);
  await assert.rejects(applyInfrastructure(root, plan), /blockers/);
  assert.equal(await readFile(path.join(root, 'playwright.config.ts'), 'utf8'), 'custom config');
});
test('rejects symlink escapes, traversal and tampered plan paths', async () => {
  const root = await temp(); const outside = await temp();
  await symlink(outside, path.join(root, 'tests'));
  await assert.rejects(planInfrastructure(root), /Symlink escapes/);
  await assert.rejects(within(root, '../outside'), /Unsafe/);
  const safe = await temp(); const plan = await planInfrastructure(safe);
  plan.changes.push({ path: 'arbitrary-file', beforeHash: null, content: 'no' });
  await assert.rejects(applyInfrastructure(safe, plan), /Invalid plan/);
  assert.deepEqual(await readdir(safe), []);
});
test('generated capability is opt-in, autonomous and keeps project artifacts out of managed generation', async () => {
  const built = buildArtifacts(bp);
  assert.deepEqual(built.workflows.slice(-2).map((item) => item.id), ['project-test-infra', 'project-bdd-tests']);
  assert.ok(built.artifacts.some((item) => item.relativePath === '.agents/skills/independent-project-bdd-tests/SKILL.md'));
  assert.ok(built.artifacts.some((item) => item.relativePath.includes('-claude-plugin/skills/independent-project-test-infra/')));
  assert.ok(!built.artifacts.some((item) => item.relativePath === '.projectAgents/testing/profile.json'));
  assert.ok(!built.artifacts.some((item) => item.relativePath === '.mcp.json' || item.relativePath === 'package.json'));
  assert.ok(!buildArtifacts({ ...bp, project: { ...bp.project, capabilityPacks: [] } }).artifacts.some((item) => item.relativePath.startsWith('.projectAgents/testing/')));
  const root = await temp();
  await generateKit({ root, blueprint: bp, write: true });
  const applied = await planInfrastructure(root); await applyInfrastructure(root, applied);
  await writeFile(path.join(root, 'tests/e2e/fixtures.ts'), '// project fixture\n');
  await generateKit({ root, blueprint: bp, write: true });
  assert.equal(await readFile(path.join(root, 'tests/e2e/fixtures.ts'), 'utf8'), '// project fixture\n');
  assert.equal((await validateKit(root)).valid, true);
});
test('JSON schemas validate actual registry/profile/mapping rather than only parsing as JSON', async () => {
  const ajv = new Ajv({ strict: false });
  for (const [name, value] of [['testing-profile', defaultProfile()], ['bdd-registry', inspectSources([source(scenario())])], ['bdd-coverage', { schemaVersion: 1, projects: ['bdd-chromium'], scenarios: [] }]]) {
    const schema = JSON.parse(await readFile(new URL(`../assets/browser-testing/${name}.schema.json`, import.meta.url)));
    const validate = ajv.compile(schema);
    assert.equal(validate(value), true, JSON.stringify(validate.errors));
    assert.equal(validate({ ...value, schemaVersion: 99 }), false);
  }
});
test('report import rejects old/global-error reports and keeps skipped/flaky outcomes visible', async () => {
  const root = await temp();
  const registry = inspectSources([source(scenario())]); const id = registry.scenarios[0].id;
  const report = { stats: { startTime: new Date().toISOString() }, suites: [{ specs: [{ id: 'test-instance-1', title: 'Acceptance', tags: ['@' + id], tests: [{ expectedStatus: 'passed', status: 'expected', results: [{ status: 'passed' }] }] }] }] };
  const run = await importResults(root, registry, report);
  assert.equal(run.scenarios[0].status, 'passed');
  report.suites[0].specs[0].tests[0].results.push({ status: 'failed' });
  assert.equal((await importResults(root, registry, report)).scenarios[0].status, 'failed');
  report.errors = [{ message: 'unavailable' }];
  await assert.rejects(importResults(root, registry, report), /global errors/);
  await writeFile(path.join(root, 'package.json'), '{}');
  await assert.rejects(verifyEvidence(root, { scenarios: [] }, run), /Stale run/);
  await assert.rejects(importResults(root, registry, { ...report, errors: [], stats: { startTime: '2000-01-01T00:00:00Z' } }), /predates/);
});

test('partial outline runs cannot claim a passed scenario', () => {
  const registry = inspectSources([source('Feature: Matrix\n Scenario Outline: Roles\n  Given role <role>\n  Then access is correct\n Examples:\n |role|\n |owner|\n |member|\n', 'roles.feature')]);
  const record = registry.scenarios[0];
  assert.equal(record.expectedInstances, 2);
  const mapping = { projects: ['bdd-chromium'], scenarios: [{ id: record.id, approvedSignature: record.variants[0].signature, assertions: record.variants[0].expectations.map((outcome) => ({ expectationId: outcome.id, file: 'steps.ts', symbol: 'expect' })) }] };
  const run = { scenarios: [{ id: record.id, signature: record.variants[0].signature, project: 'bdd-chromium', instance: 'owner', status: 'passed' }] };
  assert.equal(checkCoverage(registry, mapping, run).scenarios[0].execution, 'blocked');
  run.scenarios.push({ ...run.scenarios[0], instance: 'member' });
  assert.equal(checkCoverage(registry, mapping, run).valid, true);
});
test('fingerprint follows shared relative helper imports outside test directories', async () => {
  const root = await temp();
  await mkdir(path.join(root, 'tests/e2e'), { recursive: true });
  await writeFile(path.join(root, 'tests/e2e/steps.ts'), "import '../../shared-fixture.ts';\n");
  await writeFile(path.join(root, 'shared-fixture.ts'), 'export const value = 1;\n');
  const registry = inspectSources([source(scenario())]);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const run = await importResults(root, registry, { stats: { startTime: new Date().toISOString() }, suites: [] });
  await writeFile(path.join(root, 'shared-fixture.ts'), 'export const value = 2;\n');
  await assert.rejects(verifyEvidence(root, { scenarios: [] }, run), /Stale run/);
});

test('Rule context keeps similarly named scenarios distinct and invalidates changed rule meaning', () => {
  const text = 'Feature: Permissions\n Rule: Owner\n  Scenario: Preserve\n   Given a view\n   Then object remains\n Rule: Member\n  Scenario: Preserve\n   Given a view\n   Then object remains\n';
  const registry = inspectSources([source(text, 'rules.feature')]);
  assert.equal(registry.scenarios.length, 2);
  assert.notEqual(registry.scenarios[0].id, registry.scenarios[1].id);
  assert.notEqual(registry.scenarios[0].variants[0].signature, registry.scenarios[1].variants[0].signature);
});

test('excluded malformed requirements block an otherwise passing coverage gate', () => {
  const registry = inspectSources([source(scenario()), source('Feature: Broken\n Scenario: Invalid\n  Random text\n  Then outcome\n  Examples not valid\n', 'broken.feature')]);
  assert.ok(registry.issues.length > 0);
  const record = registry.scenarios[0];
  const mapping = { projects: ['bdd-chromium'], scenarios: [{ id: record.id, approvedSignature: record.variants[0].signature, assertions: record.variants[0].expectations.map((outcome) => ({ expectationId: outcome.id, file: 'steps.ts', symbol: 'expect' })) }] };
  const run = { scenarios: [{ id: record.id, signature: record.variants[0].signature, project: 'bdd-chromium', instance: 'one', status: 'passed' }] };
  assert.equal(checkCoverage(registry, mapping, run).valid, false);
  assert.ok(checkCoverage(registry, mapping, run).unresolved.length > 0);
});
