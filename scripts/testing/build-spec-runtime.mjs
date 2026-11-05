#!/usr/bin/env node
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../../assets/browser-testing/specification-runtime.mjs', import.meta.url));
const check = process.argv.includes('--check');
const result = await build({
  entryPoints: [fileURLToPath(new URL('spec-cli.mjs', import.meta.url))],
  outfile: output,
  write: false,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  banner: { js: '// Bundled by Project Agent Factory. Includes MIT-licensed Cucumber and Ajv runtime; see docs/browser-testing.md.' },
  legalComments: 'eof',
});
const expected = result.outputFiles[0].text.replace(/[ \t]+$/gm, '');
if (check) {
  const current = await readFile(output, 'utf8');
  if (current !== expected) throw new Error('Bundled specification runtime is stale; run npm run build:spec-runtime');
} else await writeFile(output, expected, 'utf8');
