import { readFileSync } from 'node:fs';
const asset = (name) => readFileSync(new URL(`../../assets/browser-testing/${name}`, import.meta.url), 'utf8');
export const testingWorkflows = () => [
  { id: 'project-test-infra', description: 'Audit and configure project Playwright/BDD infrastructure with an approved change plan.', body: asset('test-infra.md') },
  { id: 'project-bdd-tests', description: 'Analyze BDD requirements, generate Playwright-BDD steps, run acceptance tests and diagnose failures without changing product behavior.', body: asset('bdd-tests.md') },
];
export const testingArtifacts = () => [
  ...['cli.mjs', 'bdd.mjs', 'infra.mjs', 'results.mjs'].map((name) => ({ relativePath: `.projectAgents/testing/${name}`, content: readFileSync(new URL(name, import.meta.url), 'utf8'), ownership: 'managed' })),
  ...['testing-profile', 'bdd-registry', 'bdd-coverage', 'bdd-run'].map((name) => ({ relativePath: `.projectAgents/testing/schemas/${name}.schema.json`, content: asset(`${name}.schema.json`), ownership: 'managed' })),
  { relativePath: '.projectAgents/testing/references/bdd.md', content: asset('bdd-reference.md'), ownership: 'managed' },
  { relativePath: '.projectAgents/testing/references/infrastructure.md', content: asset('infrastructure-reference.md'), ownership: 'managed' },
];
