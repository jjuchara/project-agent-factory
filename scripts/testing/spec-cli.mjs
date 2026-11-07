#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import manifestSchema from '../../assets/browser-testing/specification-manifest.schema.json' with { type: 'json' };
import registrySchema from '../../assets/browser-testing/bdd-registry.schema.json' with { type: 'json' };
import { checkCoverage, inspectSources } from './bdd.mjs';
import conversionSchema from '../../assets/browser-testing/bdd-conversion.schema.json' with { type: 'json' };
import { checkConversion, conversionHash } from './conversion.mjs';
export { checkConversion };

export { checkCoverage, inspectSources };

const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const validators = new Map();
export const validateSpecificationData = (type, value) => {
  const schema = type === 'specification-manifest' ? manifestSchema
    : type === 'bdd-registry' ? registrySchema : type === 'bdd-conversion' ? conversionSchema : null;
  if (!schema) throw new Error(`Unsupported specification data type: ${type}`);
  if (!validators.has(type)) validators.set(type, new Ajv({
    strict: false,
    formats: { uri: true, 'date-time': true },
  }).compile(schema));
  const validate = validators.get(type);
  return { valid: validate(value), errors: validate.errors ?? [] };
};

export const validateGitLabReference = (reference) => {
  const errors = [];
  if (!reference || typeof reference !== 'object') errors.push('Reference must be an object');
  else {
    if (!/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)+$/.test(reference.projectPath ?? '')) errors.push('projectPath must identify a GitLab namespace/project, not a URL or mutable ref');
    if (!/^[0-9a-f]{40}$/.test(reference.commitSha ?? '')) errors.push('commitSha must be a full 40-character immutable SHA');
    if (typeof reference.bundlePath !== 'string' || !reference.bundlePath || path.isAbsolute(reference.bundlePath) || /^[a-zA-Z]:[\\/]/.test(reference.bundlePath) || reference.bundlePath.split(/[\\/]/).includes('..')) errors.push('bundlePath must be a safe project-relative path');
    if (reference.branch || reference.tag || reference.ref) errors.push('Mutable branch, tag and ref fields are not approved handoff inputs');
  }
  return { valid: errors.length === 0, errors };
};

const artifactKind = (relativePath) => relativePath.endsWith('.feature') ? 'feature'
  : relativePath.endsWith('registry.json') ? 'registry'
    : relativePath.endsWith('diagnostics.json') ? 'diagnostics' : 'supporting';

const compareFeatureRegistry = (features, registry) => {
  const inspected = inspectSources(features.map((feature) => ({ path: feature.path, text: feature.content })));
  const errors = inspected.issues.map((issue) => `${issue.source}:${issue.line} ${issue.code}`);
  const expected = new Map(registry.scenarios.map((scenario) => [scenario.id, scenario.variants[0]?.signature]));
  const actual = new Map(inspected.scenarios.map((scenario) => [scenario.id, scenario.variants[0]?.signature]));
  if (expected.size !== registry.scenarios.length) errors.push('Registry contains duplicate scenario IDs');
  if (actual.size !== inspected.scenarios.length) errors.push('Feature set contains duplicate scenario IDs');
  for (const [id, signature] of expected) {
    if (!actual.has(id)) errors.push(`Feature set is missing ${id}`);
    else if (actual.get(id) !== signature) errors.push(`Feature signature mismatch: ${id}`);
  }
  for (const id of actual.keys()) if (!expected.has(id)) errors.push(`Feature set has unregistered scenario: ${id}`);
  return errors;
};

export const prepareSpecificationBundle = async ({ metadata, registry, features, diagnostics, outputRoot, conversion = null, conversionApproval = null, conversionSources = [] }) => {
  const bundleRoot = path.resolve(outputRoot);
  const registryCheck = validateSpecificationData('bdd-registry', registry);
  if (!registryCheck.valid) throw new Error(`Invalid registry: ${JSON.stringify(registryCheck.errors)}`);
  if (!features.length) throw new Error('At least one normalized .feature is required');
  const referenceCheck = validateGitLabReference(metadata.gitlab);
  if (!referenceCheck.valid) throw new Error(`Invalid GitLab handoff: ${referenceCheck.errors.join('; ')}`);
  const featureErrors = compareFeatureRegistry(features, registry);
  if (featureErrors.length) throw new Error(`Feature/registry mismatch: ${featureErrors.join('; ')}`);
  const registryIssues = registry.issues ?? [];
  const conflicts = registry.scenarios.filter((scenario) => scenario.conflict).length;
  if (conversion) {
    const readiness = checkConversion(conversion, conversionSources, null, conversionApproval);
    if (!readiness.specReady) throw new Error(`Conversion is not ready for handoff: ${readiness.errors.join('; ') || readiness.status}`);
    const expected = conversion.technicalDraft;
    if (expected.length !== features.length || expected.some((draft) => !features.some((feature) => feature.path === draft.path && feature.content === draft.content))) throw new Error('Features differ from approved conversion');
    if (JSON.stringify(metadata.sources) !== JSON.stringify(conversion.sources)) throw new Error('Metadata sources differ from conversion');
    const signatures = registry.scenarios.map((item) => ({ id: item.id, signature: item.variants[0]?.signature }));
    if (JSON.stringify(signatures) !== JSON.stringify(readiness.scenarios)) throw new Error('Registry differs from approved conversion');
    if (metadata.approval.owner !== conversionApproval.owner || metadata.approval.approvedAt !== conversionApproval.approvedAt || metadata.approval.status !== 'approved') throw new Error('Metadata approval differs from conversion');
  }
  const files = [
    ...(conversion ? [{ path: 'conversion.json', content: stableJson(conversion) }, { path: 'conversion-approval.json', content: stableJson(conversionApproval) }] : []),
    { path: 'registry.json', content: stableJson(registry) },
    { path: 'diagnostics.json', content: stableJson({ ...diagnostics, issues: registryIssues, conflicts }) },
    ...features.map((feature, index) => ({ path: feature.path || `features/specification-${index + 1}.feature`, content: feature.content })),
  ];
  const structuralErrors = registryIssues.filter((issue) => ['invalid-gherkin', 'no-feature'].includes(issue.code)).length;
  const missingOutcomes = registry.scenarios.filter((scenario) => !(scenario.variants[0]?.expectations?.length)).length;
  const unresolvedIssues = registryIssues.filter((issue) => issue.code !== 'credential-table').length + conflicts + missingOutcomes;
  const diagnosticSummary = {
    errors: Math.max(Number(diagnostics.errors ?? 0), structuralErrors),
    warnings: Number(diagnostics.warnings ?? 0),
    infos: Number(diagnostics.infos ?? 0),
    unresolved: Math.max(Number(diagnostics.unresolved ?? 0), unresolvedIssues),
  };
  const approved = metadata.approval?.status === 'approved';
  const manifest = {
    schemaVersion: 1,
    runtimeVersion: '1.1.0',
    ...(conversion ? { conversion: { report: 'conversion.json', approval: 'conversion-approval.json' } } : {}),
    gitlab: metadata.gitlab,
    approval: metadata.approval,
    sources: metadata.sources,
    scenarios: registry.scenarios.map((scenario) => ({
      id: scenario.id,
      signature: scenario.variants[0]?.signature,
    })),
    diagnostics: diagnosticSummary,
    specReady: approved && diagnosticSummary.errors === 0 && diagnosticSummary.unresolved === 0,
    artifacts: files.map((file) => ({ path: file.path, kind: artifactKind(file.path), sha256: sha256(file.content) })),
  };
  const check = validateSpecificationData('specification-manifest', manifest);
  if (!check.valid) throw new Error(`Invalid specification manifest: ${JSON.stringify(check.errors)}`);
  const pending = [...files, { path: 'manifest.json', content: stableJson(manifest) }];
  for (const file of pending) {
    const target = path.resolve(bundleRoot, file.path);
    if (path.relative(bundleRoot, target).startsWith('..')) throw new Error(`Unsafe bundle path: ${file.path}`);
    try {
      const current = await readFile(target, 'utf8');
      if (current !== file.content) throw new Error(`Refusing to overwrite project-owned bundle artifact: ${file.path}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (const file of pending) {
    const target = path.resolve(bundleRoot, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content, 'utf8');
  }
  return manifest;
};

export const validateSpecificationBundle = async (root) => {
  const bundleRoot = path.resolve(root);
  const manifest = JSON.parse(await readFile(path.join(bundleRoot, 'manifest.json'), 'utf8'));
  const check = validateSpecificationData('specification-manifest', manifest);
  const errors = check.errors.map((error) => `${error.instancePath || '/'} ${error.message}`);
  const featureSources = [];
  let registry = null;
  const supporting = new Map();
  for (const artifact of manifest.artifacts ?? []) {
    const target = path.resolve(bundleRoot, artifact.path);
    if (path.relative(bundleRoot, target).startsWith('..')) errors.push(`Unsafe artifact path: ${artifact.path}`);
    else {
      try {
        const content = await readFile(target);
        if (sha256(content) !== artifact.sha256) errors.push(`Hash mismatch: ${artifact.path}`);
        else if (artifact.kind === 'feature') featureSources.push({ path: artifact.path, content: content.toString('utf8') });
        else if (artifact.kind === 'registry') registry = JSON.parse(content.toString('utf8'));
        else if (artifact.kind === 'supporting' && manifest.conversion && [manifest.conversion.report, manifest.conversion.approval].includes(artifact.path)) supporting.set(artifact.path, JSON.parse(content.toString('utf8')));
      } catch (error) {
        errors.push(`Cannot read ${artifact.path}: ${error.message}`);
      }
    }
  }
  if (registry && featureSources.length) errors.push(...compareFeatureRegistry(featureSources, registry));
  else errors.push('Bundle must contain registry and feature artifacts');
  if (manifest.conversion) {
    const report = supporting.get(manifest.conversion.report);
    const approval = supporting.get(manifest.conversion.approval);
    const reportCheck = report ? validateSpecificationData('bdd-conversion', report) : { valid: false };
    if (!reportCheck.valid || !approval) errors.push('Missing or invalid conversion artifacts');
    else {
      if (report.status !== 'ready' || report.questions.length || report.checks.some((item) => item.status === 'unresolved') || new Set(report.checks.map((item) => item.id)).size !== 8) errors.push('Unresolved conversion');
      if (approval.status !== 'approved' || approval.conversionHash !== conversionHash(report) || approval.owner !== manifest.approval.owner || approval.approvedAt !== manifest.approval.approvedAt || JSON.stringify(approval.scenarios) !== JSON.stringify(manifest.scenarios)) errors.push('Stale conversion approval');
      if (JSON.stringify(report.sources) !== JSON.stringify(manifest.sources)) errors.push('Conversion source mismatch');
      if (report.technicalDraft.length !== featureSources.length || report.technicalDraft.some((draft) => !featureSources.some((feature) => feature.path === draft.path && feature.content === draft.content))) errors.push('Conversion feature mismatch');
    }
  }
  if (manifest.gitlab && !validateGitLabReference(manifest.gitlab).valid) errors.push(...validateGitLabReference(manifest.gitlab).errors);
  return { valid: errors.length === 0 && manifest.specReady === true, specReady: manifest.specReady === true, errors, manifest };
};

const parseArgs = (argv) => {
  const [command, ...args] = argv;
  const options = { input: [], feature: [] };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === '--write') { options.write = true; continue; }
    if (!['--input', '--previous', '--type', '--bundle', '--metadata', '--registry', '--diagnostics', '--feature', '--output', '--conversion', '--approval'].includes(flag) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Invalid argument ${flag}`);
    const key = flag.slice(2);
    if (key === 'input' || key === 'feature') options[key].push(args[++index]);
    else options[key] = args[++index];
  }
  return { command, options };
};

export async function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
  let result;
  if (command === 'check-bdd') {
    if (!options.conversion || !options.input.length) throw new Error('check-bdd requires --conversion and original --input paths; an AI workflow produces the conversion report first');
    result = checkConversion(await json(options.conversion), await Promise.all(options.input.map(async (file) => ({ path: file, text: await readFile(file, 'utf8') }))), options.previous ? await json(options.previous) : null, options.approval ? await json(options.approval) : null);
  } else if (command === 'inspect-bdd') {
    if (!options.input.length) throw new Error('Provide at least one --input');
    const sources = await Promise.all(options.input.map(async (file) => ({ path: file, text: await readFile(file, 'utf8') })));
    result = inspectSources(sources, options.previous ? await json(options.previous) : null);
  } else if (command === 'validate-data') {
    if (options.input.length !== 1) throw new Error('Provide one --input');
    result = validateSpecificationData(options.type, await json(options.input[0]));
  } else if (command === 'validate-gitlab-ref') {
    if (options.input.length !== 1) throw new Error('Provide one --input');
    result = validateGitLabReference(await json(options.input[0]));
  } else if (command === 'validate-bundle') {
    if (!options.bundle) throw new Error('Provide --bundle');
    result = await validateSpecificationBundle(path.resolve(options.bundle));
  } else if (command === 'prepare-bundle') {
    if (!options.write || !options.metadata || !options.registry || !options.diagnostics || !options.feature.length || !options.output) throw new Error('prepare-bundle requires --metadata, --registry, --diagnostics, --feature, --output and explicit --write');
    result = await prepareSpecificationBundle({
      metadata: await json(options.metadata),
      registry: await json(options.registry),
      diagnostics: await json(options.diagnostics),
      features: await Promise.all(options.feature.map(async (file) => ({ path: `features/${path.basename(file)}`, content: await readFile(file, 'utf8') }))),
      outputRoot: path.resolve(options.output),
      conversion: options.conversion ? await json(options.conversion) : null,
      conversionApproval: options.approval ? await json(options.approval) : null,
      conversionSources: await Promise.all(options.input.map(async (file) => ({ path: file, text: await readFile(file, 'utf8') }))),
    });
  } else throw new Error('Usage: specification CLI <check-bdd|inspect-bdd|validate-data|validate-gitlab-ref|prepare-bundle|validate-bundle>');
  process.stdout.write(stableJson(result));
  if (result.valid === false) process.exitCode = 1;
  return result;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => { process.stderr.write(`[bdd-specification] ${error.message}\n`); process.exitCode = 1; });
}
