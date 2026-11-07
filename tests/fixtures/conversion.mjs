import { createHash } from 'node:crypto';
export function conversionFixture(text, feature, sourcePath = 'requirements.md', featurePath = 'features/ready.feature') {
  const sources = [{ path: sourcePath, text }];
  const ids = ['source-authority', 'roles-and-state', 'data-and-variants', 'actions-and-outcomes', 'observable-oracles', 'isolation-and-cleanup', 'terminology-and-ui', 'traceability'];
  const report = {
    schemaVersion: 1, status: 'ready',
    sources: [{ path: sourcePath, sha256: createHash('sha256').update(text).digest('hex') }],
    checks: ids.map((id) => ({ id, status: 'confirmed', evidence: `Synthetic analyst decision: ${id}; ${sourcePath}:1` })),
    questions: [], decisions: [],
    technicalDraft: [{ path: featurePath, content: feature, traceability: feature.split('\n').flatMap((line, index) => line.trim() ? [{ source: sourcePath, line: 1, technicalLine: index + 1 }] : []) }],
  };
  return { report, sources };
}
export const approveConversion = (result) => ({ status: 'approved', owner: 'Synthetic analyst', approvedAt: '2026-11-07T10:00:00Z', conversionHash: result.conversionHash, scenarios: result.scenarios });
