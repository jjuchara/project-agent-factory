import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkConversion, prepareSpecificationBundle, validateSpecificationBundle } from '../scripts/testing/spec-cli.mjs';
import { inspectSources } from '../scripts/testing/bdd.mjs';
import { generateKit, validateKit } from '../scripts/project-agents.mjs';
import { conversionFixture, approveConversion } from './fixtures/conversion.mjs';
const feature = 'Feature: Creation\n @analytic-id-CREATE-001\n Scenario: Create item\n  Given the form is open\n  When the user opens the type list\n  Then the type list is visible\n  When the user selects type "Task"\n  And the user saves\n  Then the task exists\n';
const fixture = () => conversionFixture('Create a task: show type list, choose Task, save; task exists.', feature);

test('блокирует модель до ответов аналитика и не публикует технический черновик', () => {
  const { report, sources } = fixture();
  report.status = 'needs-clarification'; report.technicalDraft = [];
  report.questions = [{ id: 'Q1', source: sources[0].path, line: 1, question: 'Which task type?', reason: 'Required to select the creation branch' }];
  report.checks[2].status = 'unresolved';
  const result = checkConversion(report, sources);
  assert.equal(result.status, 'needs-clarification'); assert.equal(result.specReady, false); assert.equal(result.registry, undefined);
  assert.equal(result.questions.length, 1);
  report.technicalDraft = fixture().report.technicalDraft;
  assert.equal(checkConversion(report, sources).status, 'blocked');
});

test('сохраняет промежуточные проверки и аналитический ID после уточнения', () => {
  const { report, sources } = fixture();
  report.decisions = [{ questionId: 'Q1', answer: 'Task', confirmedBy: 'Analyst' }];
  const result = checkConversion(report, sources);
  assert.equal(result.status, 'needs-approval'); assert.equal(result.specReady, false);
  assert.deepEqual(result.registry.scenarios[0].variants[0].expectations.map((item) => item.text), ['the type list is visible', 'the task exists']);
  const renamed = structuredClone(report); renamed.technicalDraft[0].content = feature.replace('Create item', 'New title');
  assert.equal(checkConversion(renamed, sources).scenarios[0].id, result.scenarios[0].id);
  const moved = inspectSources([{ path: 'moved.feature', text: feature.replace('Create item', 'Other title') }]);
  assert.equal(moved.scenarios[0].id, result.scenarios[0].id);
});

test('отклоняет устаревшие исходники, ответы и утверждение другой технической версии', () => {
  const { report, sources } = fixture(); const result = checkConversion(report, sources); const approval = approveConversion(result);
  assert.equal(checkConversion(report, sources, null, approval).specReady, true);
  assert.equal(checkConversion(report, [{ ...sources[0], text: 'changed' }], null, approval).valid, false);
  report.decisions.push({ questionId: 'Q1', answer: 'Updated answer', confirmedBy: 'Analyst' });
  assert.equal(checkConversion(report, sources, null, approval).specReady, false);
  const other = fixture(); other.report.technicalDraft[0].content = feature.replace('task exists', 'task is selected');
  assert.equal(checkConversion(other.report, other.sources, null, approval).specReady, false);
});

test('блокирует пропущенные категории, трассировку, небезопасные пути и неверный Gherkin', () => {
  for (const mutate of [
    (r) => { r.checks[0] = r.checks[1]; },
    (r) => { r.questions.push({ id: 'Q', source: 'requirements.md', line: 1, question: 'Unresolved?', reason: 'Missing fact' }); },
    (r) => { r.technicalDraft[0].traceability = r.technicalDraft[0].traceability.filter((item) => item.technicalLine !== 5); },
    (r) => { r.technicalDraft[0].traceability[0].line = 1000; },
    (r) => { r.technicalDraft[0].path = '../escape.feature'; },
    (r) => { r.technicalDraft[0].content = 'not gherkin'; },
  ]) {
    const { report, sources } = fixture(); mutate(report);
    assert.equal(checkConversion(report, sources).valid, false);
  }
});

test('передаёт утверждённую конвертацию в bundle и выявляет подмену evidence', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'paf-conversion-bundle-'));
  const { report, sources } = fixture(); const result = checkConversion(report, sources); const approval = approveConversion(result);
  const metadata = { gitlab: { projectPath: 'demo/requirements', commitSha: 'a'.repeat(40), bundlePath: 'bdd/ready' }, approval: { owner: approval.owner, status: approval.status, approvedAt: approval.approvedAt }, sources: report.sources };
  const args = { metadata, registry: result.registry, features: report.technicalDraft.map(({ path, content }) => ({ path, content })), diagnostics: {}, outputRoot: root, conversion: report, conversionSources: sources, conversionApproval: approval };
  await assert.rejects(prepareSpecificationBundle({ ...args, conversionApproval: null }), /not ready/);
  await assert.rejects(prepareSpecificationBundle({ ...args, features: [{ path: 'features/ready.feature', content: feature.replace('exists', 'changed') }] }), /mismatch|differ/);
  const manifest = await prepareSpecificationBundle(args);
  assert.equal(manifest.specReady, true); assert.equal((await validateSpecificationBundle(root)).valid, true);
  await writeFile(path.join(root, 'conversion.json'), JSON.stringify({ ...report, status: 'needs-clarification' }));
  assert.equal((await validateSpecificationBundle(root)).valid, false);
});

test('автономный analyst kit выполняет check-bdd без node_modules и обновляется без потери project-owned файлов', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'paf-conversion-kit-'));
  const bp = { schemaVersion: 2, project: { name: 'Analysts', slug: 'analysts', kind: 'analysis', summary: 'Acceptance requirements', workingLanguage: 'Russian', capabilityPacks: ['bdd-specification'] }, policies: { communicationLanguage: 'Russian', writeApproval: 'explicit', confidentiality: 'internal', sourceCitation: 'required', delegation: 'disabled' }, qualityCriteria: ['Approved specification'], sources: [] };
  await generateKit({ root, blueprint: bp, write: true });
  const { report, sources } = fixture();
  await writeFile(path.join(root, 'requirements.md'), sources[0].text); await writeFile(path.join(root, 'conversion.json'), JSON.stringify(report));
  const cli = path.join(root, '.projectAgents/testing/specification-cli.mjs');
  const run = (...extra) => spawnSync(process.execPath, [cli, 'check-bdd', '--conversion', 'conversion.json', '--input', 'requirements.md', ...extra], { cwd: root, encoding: 'utf8' });
  const first = run(); assert.equal(first.status, 0, first.stderr); const result = JSON.parse(first.stdout); assert.equal(result.status, 'needs-approval');
  await writeFile(path.join(root, 'approval.json'), JSON.stringify(approveConversion(result)));
  assert.equal(JSON.parse(run('--approval', 'approval.json').stdout).specReady, true);
  await generateKit({ root, blueprint: bp, write: true });
  assert.equal(await readFile(path.join(root, 'conversion.json'), 'utf8'), JSON.stringify(report));
  assert.equal((await validateKit(root)).valid, true);
  await writeFile(path.join(root, 'requirements.md'), 'changed');
  const stale = run('--approval', 'approval.json'); assert.equal(stale.status, 1); assert.equal(JSON.parse(stale.stdout).status, 'blocked');
});
