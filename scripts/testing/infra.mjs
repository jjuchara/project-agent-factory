import { createHash } from 'node:crypto';
import { access, readFile, readdir, realpath, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

export const VERSIONS = Object.freeze({ '@playwright/test': '1.64.1', 'playwright-bdd': '9.2.1', '@cucumber/gherkin': '42.0.1', '@cucumber/messages': '32.0.0', 'ajv': '8.20.0' });
const hash = (text) => createHash('sha256').update(text).digest('hex');
export async function readOptional(file) { try { return await readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
export async function within(root, relative) {
  if (!relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) throw new Error(`Unsafe project path: ${relative}`);
  const base = await realpath(root);
  const target = path.resolve(base, relative);
  let parent = target;
  while (true) {
    try {
      const resolved = await realpath(parent);
      if (resolved !== base && !resolved.startsWith(base + path.sep)) throw new Error(`Symlink escapes project: ${relative}`);
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      parent = path.dirname(parent);
    }
  }
  return target;
}
export async function auditInfrastructure(root) {
  const entries = await readdir(root);
  const packageText = await readOptional(path.join(root, 'package.json'));
  const pkg = packageText ? JSON.parse(packageText) : {};
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  const configurations = entries.filter((name) => /^playwright.*\.config\.[cm]?[jt]s$/.test(name) || /^playwright\.config\.[cm]?[jt]s$/.test(name));
  const managers = [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['package-lock.json', 'npm'], ['bun.lock', 'bun'], ['bun.lockb', 'bun']];
  const locks = managers.filter(([file]) => entries.includes(file));
  const declared = pkg.packageManager?.split('@')[0];
  const manager = declared ?? (locks.length === 1 ? locks[0][1] : locks.length > 1 ? 'ambiguous' : 'npm');
  const profile = await readOptional(path.join(root, '.projectAgents/testing/profile.json'));
  const installed = {};
  for (const name of Object.keys(VERSIONS)) {
    const installedText = await readOptional(path.join(root, 'node_modules', name, 'package.json'));
    installed[name] = installedText ? JSON.parse(installedText).version : null;
  }
  return {
    schemaVersion: 1, packageManager: manager, lockfiles: locks.map(([file]) => file), workspace: Boolean(pkg.workspaces || entries.includes('pnpm-workspace.yaml')),
    dependencies: Object.fromEntries(Object.keys(VERSIONS).map((name) => [name, dependencies[name] ?? null])), installed,
    configurations, scripts: Object.keys(pkg.scripts ?? {}), profile: profile ? JSON.parse(profile) : null,
    integrations: { claudeMcp: entries.includes('.mcp.json'), codexConfig: await readOptional(path.join(root, '.codex/config.toml')) !== null },
    ci: { github: await readable(path.join(root, '.github/workflows')), gitlab: entries.includes('.gitlab-ci.yml') },
    liveChecks: { browser: 'not-run', application: 'not-run', authentication: 'not-run', dataIsolation: 'not-run', ci: 'not-run' },
    note: 'Static audit only. No config, package script, process, credentials or browser has been executed/read. Select the application workspace before planning in a monorepo.',
  };
}
async function readable(file) { try { await access(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }

export const defaultProfile = () => ({ schemaVersion: 1, runner: 'playwright-bdd', browser: 'chromium', adapter: 'playwright-test-mcp', config: 'playwright.bdd.config.ts', features: 'tests/e2e/features', steps: 'tests/e2e/steps', seed: 'tests/e2e/exploration/seed.spec.ts', baseURLVariable: 'E2E_BASE_URL', authentication: 'unconfigured', dataIsolation: 'unconfigured', repairAttempts: 2 });

export function scaffoldFiles() {
  return {
    'playwright.bdd.config.ts': `import { defineConfig, devices } from '@playwright/test';\nimport { defineBddConfig } from 'playwright-bdd';\nconst baseURL = process.env.E2E_BASE_URL;\nif (!baseURL) throw new Error('E2E_BASE_URL is required');\nconst testDir = defineBddConfig({ features: 'tests/e2e/features/**/*.feature', steps: ['tests/e2e/steps/**/*.ts', 'tests/e2e/fixtures.ts'], outputDir: '.features-gen', missingSteps: 'fail-on-gen', sourceMaps: true });\nexport default defineConfig({\n  forbidOnly: !!process.env.CI, retries: 0, reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],\n  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },\n  projects: [\n    { name: 'exploration', testDir: 'tests/e2e/exploration', use: { ...devices['Desktop Chrome'] } },\n    { name: 'bdd-chromium', testDir, use: { ...devices['Desktop Chrome'] } },\n  ],\n});\n`,
    'tests/e2e/fixtures.ts': `export { expect } from '@playwright/test';\nimport { test as base, createBdd } from 'playwright-bdd';\nexport const test = base.extend({});\nexport const { Given, When, Then } = createBdd(test);\n`,
    'tests/e2e/exploration/seed.spec.ts': `import { test, expect } from '../fixtures';\ntest('exploration seed', async ({ page }) => {\n  const response = await page.goto('/');\n  expect(response?.ok()).toBeTruthy();\n});\n`,
    'tests/e2e/features/infrastructure.feature': `@infrastructure\nFeature: Browser infrastructure\n  Scenario: Application is reachable\n    Given the configured application is open\n    Then the application document is visible\n`,
    'tests/e2e/steps/infrastructure.ts': `import { expect } from '@playwright/test';\nimport { Given, Then } from '../fixtures';\nGiven('the configured application is open', async ({ page }) => {\n  const response = await page.goto('/');\n  expect(response?.ok()).toBeTruthy();\n});\nThen('the application document is visible', async ({ page }) => {\n  await expect(page.locator('body')).toBeVisible();\n});\n`,
    '.env.e2e.example': 'E2E_BASE_URL=http://127.0.0.1:3000\n',
  };
}
export async function planInfrastructure(root) {
  const audit = await auditInfrastructure(root);
  const blockers = [];
  if (!['npm', 'pnpm', 'yarn'].includes(audit.packageManager)) blockers.push('Choose a supported package manager in the application workspace.');
  if (audit.workspace) blockers.push('Choose the application package; adapt shared workspace configuration explicitly.');
  const profile = audit.profile ?? defaultProfile();
  const changes = [];
  const add = async (relative, content, existingAllowed = false) => {
    const file = await within(root, relative);
    const before = await readOptional(file);
    if (before === content) return;
    if (before !== null && !existingAllowed) { blockers.push(`Preserve and adapt existing ${relative}; automatic replacement is disabled.`); return; }
    changes.push({ path: relative, beforeHash: before === null ? null : hash(before), content });
  };
  const pkg = JSON.parse(await readOptional(path.join(root, 'package.json')) ?? '{"private":true}');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, version] of Object.entries(VERSIONS)) {
    if (!deps[name]) { pkg.devDependencies ??= {}; pkg.devDependencies[name] = version; }
  }
  const scripts = { 'test:e2e:generate': 'bddgen -c playwright.bdd.config.ts', 'test:e2e': 'bddgen -c playwright.bdd.config.ts && playwright test -c playwright.bdd.config.ts --project=bdd-chromium', 'test:e2e:seed': 'playwright test -c playwright.bdd.config.ts --project=exploration' };
  pkg.scripts ??= {};
  for (const [name, command] of Object.entries(scripts)) {
    if (pkg.scripts[name] && pkg.scripts[name] !== command) blockers.push(`Existing script ${name} needs explicit adaptation.`);
    else pkg.scripts[name] = command;
  }
  const existingOtherConfig = audit.configurations.filter((file) => file !== 'playwright.bdd.config.ts');
  if (existingOtherConfig.length) blockers.push(`Adapt existing Playwright configuration first: ${existingOtherConfig.join(', ')}. Reuse fixtures, projects and authentication.`);
  if (audit.profile && JSON.stringify(audit.profile) !== JSON.stringify(defaultProfile())) blockers.push('Project testing profile differs from the scaffold; adapt it explicitly.');
  await add('package.json', JSON.stringify(pkg, null, 2) + '\n', true);
  await add('.projectAgents/testing/profile.json', JSON.stringify(profile, null, 2) + '\n');
  for (const [file, content] of Object.entries(scaffoldFiles())) await add(file, content);
  const ignorePath = path.join(root, '.gitignore');
  let ignore = await readOptional(ignorePath) ?? '';
  for (const pattern of ['node_modules/', '**/.features-gen/**/*.spec.js', 'playwright-report/', 'test-results/', 'playwright/.auth/', '.env.e2e', '.env.e2e.local']) {
    if (!ignore.split(/\r?\n/).includes(pattern)) ignore = ignore.replace(/\n?$/, '\n') + pattern + '\n';
  }
  await add('.gitignore', ignore, true);
  return { schemaVersion: 1, kind: 'infrastructure-plan', root: await realpath(root), blockers, changes,
    nextSteps: ['Approve this exact diff before apply.', 'Install dependencies with the selected package manager and update its lockfile.', 'Install Chromium using the locally installed Playwright CLI.', 'Configure application URL, authentication and isolated data; run seed and BDD smoke.', 'Preview MCP configuration separately, then obtain integration approval.', 'Adapt existing CI or add a reviewed provider-specific job; never overwrite an existing pipeline.'] };
}
const allowed = new Set(['package.json', '.gitignore', '.projectAgents/testing/profile.json', ...Object.keys(scaffoldFiles())]);
export async function applyInfrastructure(root, plan) {
  if (plan.kind !== 'infrastructure-plan' || plan.schemaVersion !== 1 || plan.root !== await realpath(root)) throw new Error('Plan does not belong to this project');
  if (!Array.isArray(plan.blockers) || plan.blockers.length || !Array.isArray(plan.changes)) throw new Error('Resolve plan blockers before applying');
  const seen = new Set();
  for (const change of plan.changes) {
    if (!allowed.has(change.path) || seen.has(change.path) || typeof change.content !== 'string') throw new Error('Invalid plan path/content');
    seen.add(change.path);
    const before = await readOptional(await within(root, change.path));
    if ((before === null ? null : hash(before)) !== change.beforeHash) throw new Error(`Stale plan: ${change.path}`);
  }
  // Validate all preconditions before the first write. No install, shell or config execution.
  for (const change of plan.changes) {
    const file = await within(root, change.path);
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = file + `.paf-${process.pid}`;
    await writeFile(temporary, change.content, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, file);
  }
  return { written: plan.changes.map((change) => change.path), executed: [] };
}
