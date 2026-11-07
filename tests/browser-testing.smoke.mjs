// Explicit integration check: npm run test:browser (requires installed Chromium).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { conversionFixture, approveConversion } from './fixtures/conversion.mjs';
import { generateKit } from '../scripts/project-agents.mjs';
import { planInfrastructure, applyInfrastructure } from '../scripts/testing/infra.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'paf-browser-smoke-'));
const bp = { schemaVersion: 1, project: { name: 'Acceptance demo', slug: 'acceptance-demo', kind: 'software', summary: 'Isolated browser testing', workingLanguage: 'English', capabilityPacks: ['browser-testing'] }, policies: { communicationLanguage: 'English', writeApproval: 'explicit', confidentiality: 'internal', sourceCitation: 'required', delegation: 'disabled' }, qualityCriteria: ['Every accepted outcome is verified'], sources: [] };
await generateKit({ root, blueprint: bp, write: true });
await applyInfrastructure(root, await planInfrastructure(root));
const html = await readFile(new URL('./fixtures/browser-testing/application.html', import.meta.url), 'utf8');
const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const env = { ...process.env, E2E_BASE_URL: `http://127.0.0.1:${server.address().port}`, CI: '1' };
const run = (command, args, extra = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd: root, env: { ...env, ...extra }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Smoke command timed out')); }, 60000);
  child.stdout.on('data', (data) => { output += data; }); child.stderr.on('data', (data) => { output += data; });
  child.on('error', (error) => { clearTimeout(timer); reject(error); });
  child.on('close', (code) => { clearTimeout(timer); resolve({ code, output }); });
});
let mcp;
try {
  const install = await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund']);
  assert.equal(install.code, 0, install.output);
  const feature = `Feature: View removal\n  @bdd-111111111111\n  Scenario: Preserve linked record\n    Given an isolated view linked to a record\n    When the view is removed\n    Then the view is absent\n    And the linked record remains\n`;
  await writeFile(path.join(root, 'tests/e2e/features/removal.feature'), feature);
  const steps = `import { expect } from '@playwright/test';\nimport { Given, When, Then } from '../fixtures';\nGiven('an isolated view linked to a record', async ({ page }) => { await page.goto(process.env.PAF_DEMO_BUG ? '/?bug=1' : '/'); });\nWhen('the view is removed', async ({ page }) => { await page.getByRole('button', { name: 'Remove view' }).click(); });\nThen('the view is absent', async ({ page }) => { await expect(page.getByRole('region', { name: 'Views', exact: true }).getByRole('article')).toHaveCount(0); });\nThen('the linked record remains', async ({ page }) => { await expect(page.getByRole('region', { name: 'Records', exact: true }).getByRole('article')).toHaveText('Example record', { timeout: 1000 }); });\n`;
  await writeFile(path.join(root, 'tests/e2e/steps/removal.ts'), steps);
  const cli = path.join(root, '.projectAgents/testing/cli.mjs');
  // Separate analyst repository: questions -> clarified technical draft -> explicit simulated
  // approval -> portable bundle -> consumer validation -> real browser execution below.
  const analystRoot = await mkdtemp(path.join(os.tmpdir(), 'paf-analyst-smoke-'));
  await generateKit({ root: analystRoot, blueprint: { ...bp, project: { ...bp.project, kind: 'analysis', capabilityPacks: ['bdd-specification'] } }, write: true });
  const original = path.join(analystRoot, 'requirements.md');
  const { report, sources } = conversionFixture('Remove only the view. The linked record must remain.', feature, original, 'features/removal.feature');
  await writeFile(original, sources[0].text);
  const conversionFile = path.join(analystRoot, 'conversion.json');
  const analystCli = path.join(analystRoot, '.projectAgents/testing/specification-cli.mjs');
  const checkArgs = [analystCli, 'check-bdd', '--conversion', conversionFile, '--input', original];
  const blocked = structuredClone(report); blocked.status = 'needs-clarification'; blocked.technicalDraft = [];
  blocked.questions = [{ id: 'Q1', source: original, line: 1, question: 'Delete the record too?', reason: 'Entity boundary must be explicit' }];
  await writeFile(conversionFile, JSON.stringify(blocked));
  const questions = await run(process.execPath, checkArgs);
  assert.notEqual(questions.code, 0); assert.equal(JSON.parse(questions.output).registry, undefined);
  report.decisions = [{ questionId: 'Q1', answer: 'Preserve the record', confirmedBy: 'Synthetic analyst' }];
  await writeFile(conversionFile, JSON.stringify(report));
  const checked = await run(process.execPath, checkArgs);
  assert.equal(checked.code, 0, checked.output);
  const result = JSON.parse(checked.output); assert.equal(result.status, 'needs-approval');
  const approval = approveConversion(result);
  const approvalFile = path.join(analystRoot, 'approval.json'); await writeFile(approvalFile, JSON.stringify(approval));
  assert.equal(JSON.parse((await run(process.execPath, [...checkArgs, '--approval', approvalFile])).output).specReady, true);
  const metadataFile = path.join(analystRoot, 'metadata.json');
  await writeFile(metadataFile, JSON.stringify({ gitlab: { projectPath: 'demo/analyst-specifications', commitSha: 'a'.repeat(40), bundlePath: 'bdd/removal' }, approval: { owner: approval.owner, status: approval.status, approvedAt: approval.approvedAt }, sources: report.sources }));
  const registryFile = path.join(analystRoot, 'registry.json'); await writeFile(registryFile, JSON.stringify(result.registry));
  const diagnosticsFile = path.join(analystRoot, 'diagnostics.json'); await writeFile(diagnosticsFile, '{}');
  const featureFile = path.join(analystRoot, 'removal.feature'); await writeFile(featureFile, feature);
  const bundle = path.join(analystRoot, 'bundle');
  const prepared = await run(process.execPath, [analystCli, 'prepare-bundle', '--conversion', conversionFile, '--approval', approvalFile, '--input', original, '--metadata', metadataFile, '--registry', registryFile, '--diagnostics', diagnosticsFile, '--feature', featureFile, '--output', bundle, '--write']);
  assert.equal(prepared.code, 0, prepared.output);
  const handoff = await run(process.execPath, [path.join(root, '.projectAgents/testing/specification-cli.mjs'), 'validate-bundle', '--bundle', bundle]);
  assert.equal(handoff.code, 0, handoff.output);
  const registry = result.registry;
  await writeFile(path.join(root, 'registry.json'), JSON.stringify(registry));
  const record = registry.scenarios[0];
  const mapping = { schemaVersion: 1, projects: ['bdd-chromium'], scenarios: [{ id: record.id, approvedSignature: record.variants[0].signature, assertions: record.variants[0].expectations.map((item) => ({ expectationId: item.id, file: 'tests/e2e/steps/removal.ts', symbol: item.text })) }] };
  await writeFile(path.join(root, 'mapping.json'), JSON.stringify(mapping));
  const generate = await run(process.execPath, ['node_modules/playwright-bdd/dist/cli/index.js', 'test', '-c', 'playwright.bdd.config.ts']);
  assert.equal(generate.code, 0, generate.output);
  const testArgs = ['node_modules/playwright/cli.js', 'test', '-c', 'playwright.bdd.config.ts', '--project=bdd-chromium'];
  const good = await run(process.execPath, testArgs);
  assert.equal(good.code, 0, good.output);
  const imported = await run(process.execPath, [cli, 'import-results', '--registry', 'registry.json', '--input', 'test-results/results.json']);
  assert.equal(imported.code, 0, imported.output);
  await writeFile(path.join(root, 'run.json'), imported.output);
  const coverage = await run(process.execPath, [cli, 'check-coverage', '--registry', 'registry.json', '--mapping', 'mapping.json', '--run', 'run.json']);
  assert.equal(coverage.code, 0, coverage.output);
  const broken = await run(process.execPath, testArgs, { PAF_DEMO_BUG: '1' });
  assert.notEqual(broken.code, 0, 'Intentional application defect must fail');
  const brokenImport = await run(process.execPath, [cli, 'import-results', '--registry', 'registry.json', '--input', 'test-results/results.json']);
  assert.equal(brokenImport.code, 0, brokenImport.output);
  assert.equal(JSON.parse(brokenImport.output).scenarios[0].status, 'failed');
  await writeFile(path.join(root, 'failed-run.json'), brokenImport.output);
  const failedCoverage = await run(process.execPath, [cli, 'check-coverage', '--registry', 'registry.json', '--mapping', 'mapping.json', '--run', 'failed-run.json']);
  assert.notEqual(failedCoverage.code, 0);
  // Exercise the actual specialized Test Agents MCP over stdio, without any platform install.
  mcp = spawn(process.execPath, ['node_modules/playwright/cli.js', 'run-test-mcp-server', '--headless', '-c', 'playwright.bdd.config.ts'], { cwd: root, env, stdio: ['pipe', 'pipe', 'pipe'] });
  let sequence = 0, buffer = '', errors = '';
  const pending = new Map();
  mcp.stderr.on('data', (data) => { errors += data; });
  mcp.stdout.on('data', (data) => {
    buffer += data;
    while (buffer.includes('\n')) {
      const newline = buffer.indexOf('\n'); const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
      try { const message = JSON.parse(line); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); } } catch { /* non-protocol log */ }
    }
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`MCP timeout: ${method}: ${errors}`)); }, 30000);
    pending.set(id, (message) => { clearTimeout(timer); if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result); });
    mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
  await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'paf-smoke', version: '1.0.0' } });
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const tools = await request('tools/list', {});
  assert.ok(tools.tools.some((tool) => tool.name === 'planner_setup_page'));
  const setup = await request('tools/call', { name: 'planner_setup_page', arguments: { project: 'exploration', seedFile: 'tests/e2e/exploration/seed.spec.ts' } });
  assert.ok(!setup.isError, JSON.stringify(setup));
  const snapshot = await request('tools/call', { name: 'browser_snapshot', arguments: {} });
  assert.ok(!snapshot.isError, JSON.stringify(snapshot));
  assert.ok(JSON.stringify(snapshot).includes('Remove view'));
  await request('tools/call', { name: 'browser_close', arguments: {} });
  console.log(JSON.stringify({ valid: true, root, conversion: 'questions, answers, approval and separate-repository bundle handoff passed', bdd: 'passed', intentionalDefect: 'failed-as-expected', coverage: 'passed-and-failed-as-expected', mcp: 'initialized, seed executed, browser snapshot inspected', platformSessions: 'not-run' }, null, 2));
} finally {
  mcp?.kill('SIGTERM');
  await new Promise((resolve) => server.close(resolve));
}
