import { readFileSync } from 'node:fs';
const asset = (name) => readFileSync(new URL(`../../assets/browser-testing/${name}`, import.meta.url), 'utf8');
export const specificationWorkflows = () => [
  { id: 'project-bdd-spec', description: 'Validate, normalize and hand off approved BDD specifications without changing business meaning.', body: asset('bdd-spec.md') },
];
export const executionWorkflows = () => [
  { id: 'project-test-infra', description: 'Audit and configure project Playwright/BDD infrastructure with an approved change plan.', body: asset('test-infra.md') },
  { id: 'project-bdd-tests', description: 'Analyze BDD requirements, generate Playwright-BDD steps, run acceptance tests and diagnose failures without changing product behavior.', body: asset('bdd-tests.md') },
];
const managed = (relativePath, content) => ({ relativePath, content, ownership: 'managed' });
export const specificationArtifacts = () => [
  managed('.projectAgents/testing/specification-cli.mjs', asset('specification-runtime.mjs')),
  managed('.projectAgents/testing/NOTICES.md', asset('specification-runtime-NOTICES.md')),
  ...['bdd-registry', 'specification-manifest'].map((name) => managed(`.projectAgents/testing/schemas/${name}.schema.json`, asset(`${name}.schema.json`))),
  managed('.projectAgents/testing/references/specification.md', asset('specification-reference.md')),
];
export const executionArtifacts = () => [
  ...['cli.mjs', 'infra.mjs', 'results.mjs'].map((name) => managed(`.projectAgents/testing/${name}`, readFileSync(new URL(name, import.meta.url), 'utf8'))),
  ...['testing-profile', 'bdd-coverage', 'bdd-run'].map((name) => managed(`.projectAgents/testing/schemas/${name}.schema.json`, asset(`${name}.schema.json`))),
  managed('.projectAgents/testing/references/bdd.md', asset('bdd-reference.md')),
  { relativePath: '.projectAgents/testing/references/infrastructure.md', content: asset('infrastructure-reference.md'), ownership: 'managed' },
];

// Compatibility exports for factory consumers; dependency expansion prevents duplicates.
export const testingWorkflows = () => [...specificationWorkflows(), ...executionWorkflows()];
export const testingArtifacts = () => [...specificationArtifacts(), ...executionArtifacts()];
