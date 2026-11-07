import { createHash } from 'node:crypto';
import Ajv from 'ajv/dist/2020.js';
import schema from '../../assets/browser-testing/bdd-conversion.schema.json' with { type: 'json' };
import { inspectSources } from './bdd.mjs';

export const conversionHash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sourceHash = (text) => createHash('sha256').update(text).digest('hex');
const validate = new Ajv({ strict: false }).compile(schema);
const safePath = (value) => !value.startsWith('/') && !/^[a-z]:/i.test(value)
  && !value.split(/[\\/]/).some((part) => part === '..' || part === '.' || part === '');

// This validates an agent-authored semantic review; it cannot prove business meaning.
export function checkConversion(report, sources, previous = null, approval = null) {
  const errors = [];
  const fail = (message) => errors.push(message);
  if (!validate(report)) return { valid: false, status: 'blocked', specReady: false, errors: validate.errors.map((item) => `${item.instancePath} ${item.message}`), questions: [] };
  if (new Set(report.checks.map((item) => item.id)).size !== 8) fail('Every readiness check must occur exactly once');
  if (new Set(report.sources.map((item) => item.path)).size !== report.sources.length) fail('Duplicate source paths');
  if (new Set(report.questions.map((item) => item.id)).size !== report.questions.length) fail('Duplicate question IDs');
  const inputs = new Map(sources.map((item) => [item.path, item]));
  if (inputs.size !== sources.length || inputs.size !== report.sources.length) fail('Source set does not match conversion inputs');
  for (const item of report.sources) {
    if (!inputs.has(item.path) || sourceHash(inputs.get(item.path).text) !== item.sha256) fail(`Stale or missing source: ${item.path}`);
  }
  const checkReference = (item) => {
    const source = inputs.get(item.source);
    if (!source || item.line > source.text.split('\n').length) fail(`Invalid source reference: ${item.source}:${item.line}`);
  };
  for (const item of report.questions) checkReference(item);
  if (report.status === 'needs-clarification') {
    if (!report.questions.length) fail('Clarification requires at least one question');
    if (report.technicalDraft.length) fail('Blocked conversion must not publish technical drafts');
    return { valid: false, status: errors.length ? 'blocked' : 'needs-clarification', specReady: false, errors, questions: report.questions };
  }
  if (report.questions.length || report.checks.some((item) => item.status === 'unresolved')) fail('Unresolved questions or readiness checks');
  if (!report.technicalDraft.length) fail('Ready conversion requires a technical draft');
  const paths = report.technicalDraft.map((item) => item.path);
  if (new Set(paths).size !== paths.length || paths.some((item) => !safePath(item))) fail('Unsafe or duplicate technical draft paths');
  for (const draft of report.technicalDraft) {
    const lines = draft.content.split('\n');
    for (const item of draft.traceability) {
      checkReference(item);
      if (item.technicalLine > lines.length) fail(`Invalid technical reference: ${draft.path}:${item.technicalLine}`);
    }
    for (const [index, line] of lines.entries()) {
      if (/^\s*(?:(?:Given|When|Then|And|But)\s+|Examples:|\||""")/.test(line) && !draft.traceability.some((item) => item.technicalLine === index + 1)) fail(`Missing step traceability: ${draft.path}:${index + 1}`);
    }
  }
  if (errors.length) return { valid: false, status: 'blocked', specReady: false, errors, questions: [] };
  const registry = inspectSources(report.technicalDraft.map((item) => ({ path: item.path, text: item.content })), previous);
  for (const issue of registry.issues) fail(`${issue.source}:${issue.line} ${issue.code}`);
  if (!registry.scenarios.length) fail('No scenarios');
  for (const item of registry.scenarios) {
    if (item.conflict) fail(`Conflicting scenario: ${item.id}`);
    if (!item.variants[0].expectations.length) fail(`No observable outcomes: ${item.id}`);
    if (item.expectedInstances < 1) fail(`Empty Examples: ${item.id}`);
  }
  const signatures = registry.scenarios.map((item) => ({ id: item.id, signature: item.variants[0].signature }));
  const digest = conversionHash(report);
  let approved = false;
  if (approval) {
    approved = approval.status === 'approved' && typeof approval.owner === 'string' && approval.owner.trim().length > 0
      && typeof approval.approvedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(approval.approvedAt) && Number.isFinite(Date.parse(approval.approvedAt))
      && approval.conversionHash === digest && JSON.stringify(approval.scenarios) === JSON.stringify(signatures);
    if (!approved) fail('Approval must identify an analyst and bind the current conversion hash and scenario signatures');
  }
  const valid = errors.length === 0;
  return { valid, status: !valid ? 'blocked' : approved ? 'ready-for-handoff' : 'needs-approval', specReady: valid && approved, errors, questions: [], conversionHash: digest, scenarios: signatures, registry };
}
