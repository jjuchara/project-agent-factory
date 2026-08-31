import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildArtifacts,
  generateKit,
  inspectDocumentation,
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
  ...(overrides.claude ? { claude: overrides.claude } : {}),
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

test('validates optional Claude Code agent settings', () => {
  const configured = validateBlueprint(blueprint({
    claude: { agentModel: 'sonnet', agentEffort: 'high', agentMaxTurns: 12 },
  }));
  assert.equal(configured.claude.agentModel, 'sonnet');
  assert.throws(
    () => validateBlueprint(blueprint({ claude: { agentModel: 'gpt-5' } })),
    /Claude alias or full model ID/,
  );
  assert.throws(
    () => validateBlueprint(blueprint({ claude: { agentMaxTurns: 0 } })),
    /positive integer/,
  );
});

test('builds analytical roles and workflows without coding assumptions', () => {
  const built = buildArtifacts(blueprint());
  assert.ok(built.agents.some((agent) => agent.id === 'project-analyst'));
  assert.ok(built.agents.some((agent) => agent.id === 'document-specialist'));
  assert.ok(built.workflows.some((workflow) => workflow.id === 'project-research'));
  assert.ok(!built.agents.some((agent) => agent.id === 'test-engineer'));
  assert.ok(!built.workflows.some((workflow) => workflow.id === 'project-debug'));
  assert.ok(built.artifacts.some((item) => item.relativePath.endsWith('-claude-plugin/.claude-plugin/plugin.json')));
  assert.ok(built.artifacts.some((item) => item.relativePath.endsWith('-claude-plugin/agents/project-analyst.md')));
});

test('names generated skills after the project plugin while preserving logical workflow ids', () => {
  const built = buildArtifacts(blueprint());
  assert.ok(built.workflows.some((workflow) => workflow.id === 'project-help'));
  const help = built.artifacts.find((item) => item.relativePath.endsWith('skills/evidence-workspace-help/SKILL.md'));
  assert.ok(help);
  assert.match(help.content, /^---\nname: evidence-workspace-help\n/m);
  const entrypoint = built.artifacts.find((item) => item.relativePath.endsWith('skills/evidence-workspace/SKILL.md'));
  assert.ok(entrypoint);
  assert.match(entrypoint.content, /^---\nname: evidence-workspace\n/m);
  assert.ok(built.artifacts.some((item) => item.relativePath.endsWith('skills/evidence-workspace-memory/SKILL.md')));
  assert.ok(built.artifacts.some((item) => item.relativePath.endsWith('skills/evidence-workspace-self-learning/SKILL.md')));
  const stopHook = built.artifacts.find((item) => item.relativePath.endsWith('hooks/project-learn-on-stop.mjs'));
  assert.match(stopHook.content, /invoke the evidence-workspace-learn skill/);
  const projectAgents = built.artifacts.find((item) => item.relativePath === '.projectAgents/AGENTS.md');
  assert.ok(projectAgents);
  assert.match(projectAgents.content, /## Available agent roles/);
  assert.match(projectAgents.content, /## Logical workflows/);
  assert.match(projectAgents.content, /\| `project-help` \| `\$evidence-workspace-help` \|/);
  assert.match(projectAgents.content, /Agent roles are logical identities, not user-invoked commands/);
});

test('maps logical agent permissions to Claude Code tools', () => {
  const built = buildArtifacts(blueprint({
    claude: { agentModel: 'haiku', agentEffort: 'medium', agentMaxTurns: 8 },
  }));
  const scout = built.artifacts.find((item) => item.relativePath.endsWith('-claude-plugin/agents/project-scout.md'));
  const reviewer = built.artifacts.find((item) => item.relativePath.endsWith('-claude-plugin/agents/project-reviewer.md'));
  const analyst = built.artifacts.find((item) => item.relativePath.endsWith('-claude-plugin/agents/project-analyst.md'));
  assert.match(scout.content, /tools: Read, Grep, Glob\n/);
  assert.doesNotMatch(scout.content, /Write|Edit|Bash/);
  assert.match(reviewer.content, /tools: Read, Grep, Glob\n/);
  assert.doesNotMatch(reviewer.content, /tools: .*Bash/);
  assert.match(analyst.content, /tools: Read, Grep, Glob, Write, Edit\n/);
  assert.match(analyst.content, /model: haiku\neffort: medium\nmaxTurns: 8/);
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
  assert.match(manifest.version, /^0\.1\.0\+project\.[a-f0-9]{12}$/);
  assert.match(await readFile(path.join(root, '.codex/agents/project-analyst.toml'), 'utf8'), /sandbox_mode = "workspace-write"/);
  const claudeManifest = JSON.parse(
    await readFile(
      path.join(root, '.projectAgents/plugins/evidence-workspace-claude-plugin/.claude-plugin/plugin.json'),
      'utf8',
    ),
  );
  assert.equal(claudeManifest.name, 'evidence-workspace-claude-plugin');
  assert.equal(claudeManifest.version, manifest.version);
  assert.match(
    await readFile(
      path.join(root, '.projectAgents/plugins/evidence-workspace-claude-plugin/hooks/hooks.json'),
      'utf8',
    ),
    /node .*CLAUDE_PLUGIN_ROOT.*session-start\.mjs/,
  );
  const codexHooks = await readFile(
    path.join(root, '.projectAgents/plugins/evidence-workspace-codex-plugin/hooks/hooks.json'),
    'utf8',
  );
  assert.match(codexHooks, /node .*PLUGIN_ROOT.*session-start\.mjs/);
  assert.match(codexHooks, /"Stop"/);
  assert.match(codexHooks, /project-learn-on-stop\.mjs/);
  const stopHook = await readFile(
    path.join(root, '.projectAgents/plugins/evidence-workspace-codex-plugin/hooks/project-learn-on-stop.mjs'),
    'utf8',
  );
  assert.match(stopHook, /stop_hook_active/);
  assert.match(stopHook, /evidence-workspace-learn skill/);
  const sessionHookPath = path.join(root, '.projectAgents/plugins/evidence-workspace-codex-plugin/hooks/session-start.mjs');
  const sessionHook = spawnSync(process.execPath, [sessionHookPath], { cwd: root, encoding: 'utf8' });
  assert.equal(sessionHook.status, 0, sessionHook.stderr);
  assert.match(sessionHook.stdout, /<project-agent-plugin>/);
  const stopHookPath = path.join(root, '.projectAgents/plugins/evidence-workspace-codex-plugin/hooks/project-learn-on-stop.mjs');
  const stopHookResult = spawnSync(process.execPath, [stopHookPath], { cwd: root, input: '{}', encoding: 'utf8' });
  assert.equal(stopHookResult.status, 0, stopHookResult.stderr);
  assert.equal(JSON.parse(stopHookResult.stdout).decision, 'block');
  const guardedStopHook = spawnSync(process.execPath, [stopHookPath], {
    cwd: root,
    input: '{"stop_hook_active":true}',
    encoding: 'utf8',
  });
  assert.equal(guardedStopHook.status, 0, guardedStopHook.stderr);
  assert.deepEqual(JSON.parse(guardedStopHook.stdout), {});
  assert.match(
    await readFile(path.join(root, '.projectAgents/scripts/claude-plugin-init.mjs'), 'utf8'),
    /plugin', 'install'.*--scope', 'local/,
  );
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

test('removes an unmodified stale managed skill during a naming migration', async () => {
  const root = await temporaryProject();
  await generateKit({ root, blueprint: blueprint(), write: true });
  const relativePath = '.projectAgents/plugins/evidence-workspace-codex-plugin/skills/project-help/SKILL.md';
  const staleContent = 'legacy project-help skill\n';
  const stalePath = path.join(root, relativePath);
  await mkdir(path.dirname(stalePath), { recursive: true });
  await writeFile(stalePath, staleContent, 'utf8');
  const statePath = path.join(root, '.projectAgents/generation-state.json');
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  state.files.push({
    path: relativePath,
    ownership: 'managed',
    sha256: createHash('sha256').update(staleContent).digest('hex'),
  });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  const plan = await generateKit({ root, blueprint: blueprint() });
  assert.ok(plan.changes.some((change) => change.relativePath === relativePath && change.action === 'delete'));
  await generateKit({ root, blueprint: blueprint(), write: true });
  await assert.rejects(readFile(stalePath, 'utf8'), /ENOENT/);
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

test('maps documentation structure and issues without assigning authority or copying bodies', async () => {
  const root = await temporaryProject();
  await mkdir(path.join(root, 'docs'), { recursive: true });
  await writeFile(
    path.join(root, 'README.md'),
    '# Project overview\n\nStart here. SHOULD-NOT-BE-COPIED.\n\n[Architecture](docs/architecture.md)\n[Missing](docs/missing.md)\n[External file](/outside/docs.md)\n',
    'utf8',
  );
  await writeFile(path.join(root, 'docs/architecture.md'), '# Architecture\n\n[[decision]]\n', 'utf8');
  await writeFile(path.join(root, 'docs/decision.md'), '# Decision\n', 'utf8');
  await writeFile(path.join(root, 'docs/copy-a.md'), '# Duplicate\n', 'utf8');
  await writeFile(path.join(root, 'docs/copy-b.md'), '# Duplicate\n', 'utf8');
  await writeFile(path.join(root, 'docs/manual.pdf'), '%PDF-1.4\n', 'utf8');

  const map = await inspectDocumentation(root);
  assert.equal(map.summary.documentationCandidates, 6);
  assert.equal(map.summary.structureAnalysed, 5);
  assert.equal(map.summary.metadataOnly, 1);
  assert.equal(map.documents.every((document) => document.authority === 'unknown'), true);
  assert.equal(map.documents.every((document) => document.status === 'observed'), true);
  const readme = map.documents.find((document) => document.path === 'README.md');
  assert.equal(readme.title, 'Project overview');
  assert.equal(readme.links.find((link) => link.target === 'docs/architecture.md').status, 'resolved');
  assert.equal(readme.links.find((link) => link.target === '/outside/docs.md').status, 'external-file');
  assert.ok(map.issues.some((issue) => issue.type === 'broken-local-link' && issue.target === 'docs/missing.md'));
  assert.ok(map.duplicateGroups.some((group) =>
    group.paths.includes('docs/copy-a.md') && group.paths.includes('docs/copy-b.md')));
  assert.equal(map.routes.find((route) => route.id === 'entrypoints').documents[0].path, 'README.md');
  assert.equal(map.suggestedReadingOrder[0], 'README.md');
  assert.doesNotMatch(JSON.stringify(map), /SHOULD-NOT-BE-COPIED/);
  const limited = await inspectDocumentation(root, { maxDocuments: 2 });
  assert.equal(limited.summary.truncated, true);
  assert.ok(limited.issues.some((issue) => issue.type === 'candidate-limit-reached'));
  await assert.rejects(inspectDocumentation(root, { maxDocuments: 0 }), /between 1 and 1000/);
});
