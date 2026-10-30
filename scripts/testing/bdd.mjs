import { createHash } from 'node:crypto';
import { Parser, AstBuilder, GherkinClassicTokenMatcher } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const clean = (text) => text.replace(/\u00a0/g, ' ').trim();
const identity = (text) => clean(text).replace(/\s+/g, ' ').toLowerCase();
export function parseGherkin(text) {
  return new Parser(new AstBuilder(IdGenerator.incrementing()), new GherkinClassicTokenMatcher()).parse(text);
}

// A bounded importer, not a permissive replacement for the Gherkin parser.
// Semantic repairs remain review proposals and never authorize execution.
export function normalizeMarkdown(text) {
  const output = [];
  const lines = text.split(/\r?\n/);
  const issues = [];
  const sourceLines = [];
  const details = {};
  let lastStepLine = null;
  let active = false;
  let inBackground = false;
  let stepSeen = false;
  let skipCredentials = false;
  const emit = (line, index) => { output.push(line); sourceLines.push(index + 1); };
  for (let index = 0; index < lines.length; index++) {
    const line = clean(lines[index]);
    if (/^```|^~~~/.test(line)) continue;
    if (/^#{1,6}\s/.test(line) && !/^# language:/.test(line)) { active = false; stepSeen = false; continue; }
    const heading = line.match(/^(Feature|Функционал|Функция|Свойство)\s*:?\s+(.+)$/i);
    if (heading) {
      active = true; stepSeen = false; skipCredentials = false;
      emit(`Feature: ${heading[2]}`, index); continue;
    }
    if (!active) {
      if (/^(Given|When|Then|And|Допустим|Когда|Тогда|И)\s*$/.test(line)) issues.push({ line: index + 1, code: 'orphan-empty-step' });
      continue;
    }
    if (/password|пароль/i.test(line) && line.startsWith('|')) {
      skipCredentials = true;
      issues.push({ line: index + 1, code: 'credential-table', message: 'Resolve account roles separately; credentials are omitted.' });
      continue;
    }
    if (skipCredentials && line.startsWith('|')) continue;
    if (line) skipCredentials = false;
    const background = line.match(/^Background\s*:?\s*(.*)$/i);
    if (background) {
      emit('Background:', index); inBackground = true; stepSeen = false;
      if (background[1]) { emit(`  Given ${background[1]}`, index); stepSeen = true; }
      continue;
    }
    const scenario = line.match(/^(Scenario Outline|Scenario Template|Scenarios|Scenario)\s*:?\s*(.*)$/i);
    if (scenario) {
      const keyword = /outline|template/i.test(scenario[1]) ? 'Scenario Outline' : 'Scenario';
      emit(`${keyword}: ${scenario[2] || 'Untitled scenario'}`, index);
      inBackground = false; stepSeen = false; continue;
    }
    const step = line.match(/^(Given|When|Then|And|But)\b\s*(.*)$/i);
    if (step) {
      emit(`  ${step[1][0].toUpperCase() + step[1].slice(1).toLowerCase()} ${step[2]}`, index);
      if (!step[2]) issues.push({ line: index + 1, code: 'empty-step' });
      lastStepLine = index + 1;
      stepSeen = true; continue;
    }
    if (/^Examples\s*:/.test(line) || line.startsWith('@') || /^# language:/.test(line)) { emit(line, index); continue; }
    if (line.startsWith('|')) { emit(`    ${line}`, index); continue; }
    if (!line) { emit('', index); continue; }
    if (stepSeen) {
      // Preserve unstructured details visibly instead of silently deleting assertions.
      emit(`    # Source detail: ${line}`, index);
      if (lastStepLine !== null) (details[lastStepLine] ??= []).push(line);
      issues.push({ line: index + 1, code: 'unstructured-detail', message: 'Convert this detail into explicit steps or a DataTable before approval.' });
    } else if (!inBackground) emit(`  ${line}`, index);
    else issues.push({ line: index + 1, code: 'unstructured-background' });
  }
  return { text: output.join('\n') + '\n', sourceLines, issues, details };
}

export function inspectSources(sources, previous = null) {
  const records = new Map();
  const issues = [];
  const drafts = [];
  const usedIds = new Set();
  for (const source of sources) {
    if (Buffer.byteLength(source.text) > 1024 * 1024) throw new Error('BDD source exceeds 1 MiB');
    const strict = /\.feature$/i.test(source.path);
    const normalized = strict ? { text: source.text, sourceLines: source.text.split('\n').map((_, i) => i + 1), issues: [] } : normalizeMarkdown(source.text);
    issues.push(...normalized.issues.map((issue) => ({ source: source.path, ...issue })));
    // Multiple Feature blocks in one Markdown document become separate Gherkin documents.
    const blocks = strict ? [normalized.text] : normalized.text.split(/(?=^Feature:)/m).filter((part) => part.trim());
    if (!blocks.length) issues.push({ source: source.path, line: 1, code: 'no-feature' });
    let offset = 0;
    for (const block of blocks) {
      let ast;
      try { ast = parseGherkin(block); }
      catch (error) {
        issues.push({ source: source.path, line: normalized.sourceLines[offset] ?? 1, code: 'invalid-gherkin', message: error.message });
        offset += block.split('\n').length - 1; continue;
      }
      const feature = ast.feature;
      if (!feature) { issues.push({ source: source.path, line: 1, code: 'no-feature' }); continue; }
      drafts.push({ source: source.path, feature: feature.name, text: block });
      const collect = (children, inherited = [], rules = []) => {
        const background = children.filter((child) => child.background).flatMap((child) => child.background.steps);
        for (const child of children) {
          if (child.rule) { collect(child.rule.children, [...inherited, ...background], [...rules, { name: child.rule.name, description: child.rule.description, tags: child.rule.tags.map((tag) => tag.name) }]); continue; }
          if (!child.scenario) continue;
          const scenario = child.scenario;
          const explicitId = scenario.tags.find((tag) => /^@bdd-[a-f0-9]{12}$/.test(tag.name))?.name.slice(1);
          const key = explicitId ?? identity([feature.name, ...rules.map((rule) => rule.name), scenario.name].join('::'));
          const steps = [...inherited, ...background, ...scenario.steps].map((step) => ({
            keyword: step.keyword.trim(), text: step.text,
            line: normalized.sourceLines[offset + step.location.line - 1] ?? step.location.line,
            ...(normalized.details?.[normalized.sourceLines[offset + step.location.line - 1]] ? { details: normalized.details[normalized.sourceLines[offset + step.location.line - 1]] } : {}),
            ...(step.dataTable ? { table: step.dataTable.rows.map((row) => row.cells.map((cell) => cell.value)) } : {}),
            ...(step.docString ? { docString: step.docString.content } : {}),
          }));
          const signature = hash(JSON.stringify({ feature: feature.name, featureDescription: feature.description, rules, title: scenario.name, description: scenario.description, steps: steps.map(({ line, ...step }) => step), examples: scenario.examples.map((example) => ({ name: example.name, tags: example.tags.map((tag) => tag.name), header: example.tableHeader?.cells.map((cell) => cell.value), rows: example.tableBody.map((row) => row.cells.map((cell) => cell.value)) })), tags: [...feature.tags, ...scenario.tags].map((tag) => tag.name) }));
          const prior = previous?.scenarios?.find((item) => item.key === key);
          const id = explicitId ?? prior?.id ?? `bdd-${hash(key).slice(0, 12)}`;
          if (!records.has(key) && usedIds.has(id)) throw new Error('Duplicate scenario ID in previous registry');
          usedIds.add(id);
          let phase = '';
          const expectations = [];
          for (const step of steps) {
            if (/^(Then|Тогда|То)$/i.test(step.keyword)) phase = 'then';
            else if (!/^(And|But|И|Но|А)$/i.test(step.keyword)) phase = 'other';
            if (phase === 'then') expectations.push({ id: `${id}-e${expectations.length + 1}`, text: step.text, line: step.line });
          }
          const origin = { path: source.path, line: normalized.sourceLines[offset + scenario.location.line - 1] ?? scenario.location.line, sha256: hash(source.text) };
          const variant = { signature, steps, expectations, sources: [origin] };
          if (records.has(key)) {
            const record = records.get(key);
            const same = record.variants.find((entry) => entry.signature === signature);
            if (same) same.sources.push(origin);
            else { record.variants.push(variant); record.conflict = true; }
          } else records.set(key, { id, key, feature: feature.name, rules: rules.map((rule) => rule.name), title: scenario.name, expectedInstances: scenario.examples.length ? scenario.examples.reduce((total, example) => total + example.tableBody.length, 0) : 1, review: 'needs-review', conflict: false, variants: [variant] });
        }
      };
      collect(feature.children);
      offset += block.split('\n').length - 1;
    }
  }
  return { schemaVersion: 1, scenarios: [...records.values()], issues, drafts };
}

export function checkCoverage(registry, mapping, run = null) {
  const results = registry.scenarios.map((scenario) => {
    const entry = mapping.scenarios?.find((item) => item.id === scenario.id);
    const signature = scenario.variants[0].signature;
    const expected = scenario.variants[0].expectations;
    const covered = expected.filter((item) => entry?.assertions?.some((assertion) => assertion.expectationId === item.id && assertion.file && assertion.symbol));
    const complete = !scenario.conflict && entry?.approvedSignature === signature && expected.length > 0 && covered.length === expected.length;
    // Execution evidence must be bound to the exact approved scenario revision.
    const executions = run?.scenarios?.filter((item) => item.id === scenario.id && item.signature === signature) ?? [];
    const projects = mapping.projects ?? [];
    const fullScope = projects.length > 0 && projects.every((project) => {
      const instances = executions.filter((item) => item.project === project);
      return instances.length === scenario.expectedInstances && new Set(instances.map((item) => item.instance)).size === scenario.expectedInstances;
    });
    const execution = !complete || !executions.length ? 'not-run'
      : !fullScope ? 'blocked'
      : executions.every((item) => item.status === 'passed') ? 'passed'
      : executions.some((item) => item.status === 'failed') ? 'failed' : 'blocked';
    return { id: scenario.id, specification: scenario.conflict ? 'conflict' : entry?.approvedSignature === signature ? 'approved' : 'needs-review', coverage: complete ? 'complete' : 'incomplete', expected: expected.length, covered: covered.length, execution };
  });
  const unresolved = (registry.issues ?? []).map(({ source, line, code }) => ({ source, line, code }));
  return { schemaVersion: 1, unresolved, valid: unresolved.length === 0 && results.length > 0 && results.every((item) => item.coverage === 'complete' && item.execution === 'passed'), scenarios: results, note: 'Assertion mappings and run evidence require review; metadata alone does not prove semantic correctness.' };
}
