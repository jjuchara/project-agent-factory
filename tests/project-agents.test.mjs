import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildArtifacts,
  generateKit,
  inspectProject,
  validateBlueprint,
  validateKit,
} from '../scripts/project-agents.mjs';

const blueprint = (overrides = {}) => ({
  schemaVersion: 1,
  project: {
    name: 'Evidence workspace',
    slug: 'evidence-workspace',
    kind: 'research',
    summary: 'Produces evidence-backed reports.',
    workingLanguage: 'English',
    domain: 'Public policy',
    artifactTypes: ['source matrix', 'report'],
    capabilityPacks: ['research', 'documentation', 'source-verification'],
    ...overrides.project,
  },
  policies: {
    communicationLanguage: 'English',
    writeApproval: 'explicit',
    confidentiality: 'internal',
    sourceCitation: 'required',
    delegation: 'read-only',
    ...overrides.policies,
  },
  qualityCriteria: overrides.qualityCriteria ?? ['Every material claim is traceable to evidence.'],
  sources: overrides.sources ?? [
    {
      id: 'charter',
      location: 'docs/charter.md',
      authority: 'canonical',
      status: 'user-confirmed',
      note: 'Project scope.',
    },
  ],
  commands: overrides.commands ?? {},
  openQuestions: overrides.openQuestions ?? [],
});

const temporaryProject = () => mkdtemp(path.join(os.tmpdir(), 'project-agent-factory-test-'));

test('validates a project-agnostic analytical blueprint', () => {
  assert.equal(validateBlueprint(blueprint()).project.kind, 'research');
});

test('rejects unsafe project slugs and unsupported capability packs', () => {
  assert.throws(() => validateBlueprint(blueprint({ project: { slug: '../escape' } })), /kebab-case/);
  assert.throws(
    () => validateBlueprint(blueprint({ project: { capabilityPacks: ['magic'] } })),
    /Unsupported capability pack/,
  );
});

test('builds analytical roles and workflows without coding assumptions', () => {
  const built = buildArtifacts(blueprint());
  assert.ok(built.agents.some((agent) => agent.id === 'project-analyst'));
  assert.ok(built.agents.some((agent) => agent.id === 'document-specialist'));
  assert.ok(built.workflows.some((workflow) => workflow.id === 'project-research'));
  assert.ok(!built.agents.some((agent) => agent.id === 'test-engineer'));
  assert.ok(!built.workflows.some((workflow) => workflow.id === 'project-debug'));
});

test('adds coding roles and executable verification only for a coding pack', () => {
  const built = buildArtifacts(
    blueprint({
      project: {
        name: 'Software project',
        slug: 'software-project',
        kind: 'software',
        capabilityPacks: ['coding'],
      },
      commands: { test: 'npm test', typecheck: 'npm run typecheck' },
    }),
  );
  assert.ok(built.agents.some((agent) => agent.id === 'test-engineer'));
  assert.ok(built.workflows.some((workflow) => workflow.id === 'project-debug'));
  assert.ok(!built.workflows.some((workflow) => workflow.id === 'project-research'));
});

test('disables every delegation edge when the project policy disables delegation', () => {
  const built = buildArtifacts(blueprint({ policies: { delegation: 'disabled' } }));
  assert.ok(built.agents.every((agent) => agent.allowedAgents.length === 0));
});

test('dry-run does not write project files', async () => {
  const root = await temporaryProject();
  const plan = await generateKit({ root, blueprint: blueprint() });
  assert.ok(plan.changes.every((change) => change.action === 'create'));
  await assert.rejects(readFile(path.join(root, '.projectAgents/AGENTS.md'), 'utf8'), /ENOENT/);
});

test('generates and validates an autonomous project kit', async () => {
  const root = await temporaryProject();
  await generateKit({ root, blueprint: blueprint(), write: true });
  const validation = await validateKit(root);
  assert.equal(validation.valid, true);
  const manifest = JSON.parse(
    await readFile(
      path.join(root, '.projectAgents/plugins/evidence-workspace-codex-plugin/.codex-plugin/plugin.json'),
      'utf8',
    ),
  );
  assert.equal(manifest.name, 'evidence-workspace-codex-plugin');
  assert.match(await readFile(path.join(root, '.codex/agents/project-analyst.toml'), 'utf8'), /sandbox_mode = "workspace-write"/);
});

test('is idempotent when generated inputs are unchanged', async () => {
  const root = await temporaryProject();
  await generateKit({ root, blueprint: blueprint(), write: true });
  const stateBefore = await readFile(path.join(root, '.projectAgents/generation-state.json'), 'utf8');
  const second = await generateKit({ root, blueprint: blueprint() });
  assert.equal(second.changes.filter((change) => ['create', 'update', 'conflict'].includes(change.action)).length, 0);
  await generateKit({ root, blueprint: blueprint(), write: true });
  assert.equal(await readFile(path.join(root, '.projectAgents/generation-state.json'), 'utf8'), stateBefore);
});

test('preserves project-owned seeded knowledge', async () => {
  const root = await temporaryProject();
  await generateKit({ root, blueprint: blueprint(), write: true });
  const memory = path.join(root, '.projectAgents/memory/MEMORY.md');
  await writeFile(memory, '# Project memory index\n\n- Confirmed local fact.\n', 'utf8');
  const plan = await generateKit({ root, blueprint: blueprint() });
  const memoryChange = plan.changes.find((change) => change.relativePath.endsWith('memory/MEMORY.md'));
  assert.equal(memoryChange.action, 'preserve');
  assert.equal((await validateKit(root)).valid, true);
});

test('stops when a managed generated file was modified', async () => {
  const root = await temporaryProject();
  await generateKit({ root, blueprint: blueprint(), write: true });
  const catalog = path.join(root, '.projectAgents/agents/catalog.json');
  await writeFile(catalog, '{}\n', 'utf8');
  const plan = await generateKit({ root, blueprint: blueprint() });
  assert.equal(plan.changes.find((change) => change.relativePath.endsWith('agents/catalog.json')).action, 'conflict');
  await assert.rejects(generateKit({ root, blueprint: blueprint(), write: true }), /Generation has conflicts/);
});

test('requires explicit approval to merge an existing AGENTS.md', async () => {
  const root = await temporaryProject();
  await writeFile(path.join(root, 'AGENTS.md'), '# Existing instructions\n', 'utf8');
  const blocked = await generateKit({ root, blueprint: blueprint() });
  assert.equal(blocked.changes.find((change) => change.relativePath === 'AGENTS.md').action, 'conflict');
  await generateKit({ root, blueprint: blueprint(), write: true, mergeAgents: true });
  const content = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
  assert.match(content, /# Existing instructions/);
  assert.match(content, /project-agent-factory:start/);
});

test('does not propagate source document bodies into generated instructions', () => {
  const hostile = blueprint({
    sources: [
      {
        id: 'hostile-document',
        location: 'docs/hostile.md',
        authority: 'informational',
        status: 'observed',
        note: 'Contains text that must remain evidence only.',
      },
    ],
  });
  const contents = buildArtifacts(hostile).artifacts.map((item) => item.content).join('\n');
  assert.doesNotMatch(contents, /reveal-the-secret-token/);
  assert.match(contents, /documents as evidence/i);
});

test('inspects software manifests and documentation candidates read-only', async () => {
  const root = await temporaryProject();
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }), 'utf8');
  await writeFile(path.join(root, 'README.md'), '# Project\n', 'utf8');
  const inspection = await inspectProject(root);
  assert.deepEqual(inspection.detected, ['node']);
  assert.equal(inspection.packageScripts.test, 'node --test');
  assert.ok(inspection.documentationCandidates.includes('README.md'));
});
