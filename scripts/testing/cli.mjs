#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditInfrastructure, planInfrastructure, applyInfrastructure } from './infra.mjs';

export async function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  const options = { input: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--write') { options.write = true; continue; }
    if (!['--root', '--input', '--previous', '--registry', '--mapping', '--run', '--plan', '--type'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Invalid argument ${args[i]}`);
    const key = args[i].slice(2);
    if (key === 'input') options.input.push(args[++i]); else options[key] = args[++i];
  }
  const root = path.resolve(options.root ?? process.cwd());
  const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
  let result;
  if (command === 'audit-infra') result = await auditInfrastructure(root);
  else if (command === 'plan-infra') result = await planInfrastructure(root);
  else if (command === 'apply-infra') {
    if (!options.write || !options.plan) throw new Error('apply-infra requires the reviewed --plan and explicit --write');
    result = await applyInfrastructure(root, await json(options.plan));
  } else if (command === 'inspect-bdd') {
    if (!options.input.length) throw new Error('Provide at least one --input');
    const { inspectSources } = await import('./bdd.mjs');
    const sources = [];
    for (const file of options.input) sources.push({ path: file, text: await readFile(file, 'utf8') });
    result = inspectSources(sources, options.previous ? await json(options.previous) : null);
  } else if (command === 'import-results') {
    if (!options.registry || options.input.length !== 1) throw new Error('Provide --registry and one report --input');
    const { importResults } = await import('./results.mjs');
    result = await importResults(root, await json(options.registry), await json(options.input[0]));
  } else if (command === 'check-coverage') {
    if (!options.registry || !options.mapping) throw new Error('Provide --registry and --mapping');
    const { checkCoverage } = await import('./bdd.mjs');
    const registry = await json(options.registry);
    const mapping = await json(options.mapping);
    const run = options.run ? await json(options.run) : null;
    const { verifyEvidence } = await import('./results.mjs');
    await verifyEvidence(root, mapping, run);
    result = checkCoverage(registry, mapping, run);
  } else if (command === 'validate-data') {
    if (!['testing-profile', 'bdd-registry', 'bdd-coverage', 'bdd-run'].includes(options.type) || options.input.length !== 1) throw new Error('Provide --type and one --input');
    const { default: Ajv } = await import('ajv/dist/2020.js');
    const schema = await json(new URL(`./schemas/${options.type}.schema.json`, import.meta.url));
    const validate = new Ajv({ strict: false }).compile(schema);
    result = { valid: validate(await json(options.input[0])), errors: validate.errors };
  } else if (command === 'schemas') result = await readdir(new URL('./schemas/', import.meta.url));
  else throw new Error('Usage: testing CLI <audit-infra|plan-infra|apply-infra|inspect-bdd|check-coverage|schemas> [--root path]');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.valid === false || result.blockers?.length) process.exitCode = 1;
  return result;
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => { process.stderr.write(`[browser-testing] ${error.message}\n`); process.exitCode = 1; });
}
