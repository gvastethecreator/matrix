import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { factoryConfig } from '../config/configState.ts';
import { THREE_MODULE_VERSION } from '../config/enginePin.ts';
import { generateStandaloneHtml } from './exportHtml.ts';

const stub = 'const runMatrixAnimation = () => {};';

test('ARC-03 invalid numColumns returns the error comment', () => {
  const html = generateStandaloneHtml({ ...factoryConfig(), numColumns: 0 }, stub);
  assert.equal(html.startsWith('<!-- ERROR:'), true);
  assert.equal(html.includes('<html'), false);
});

test('ARC-03 valid export includes canvas and Three pin', () => {
  const html = generateStandaloneHtml(factoryConfig(), stub);
  assert.equal(html.includes('id="matrix-canvas"'), true);
  assert.equal(html.includes(`three@${THREE_MODULE_VERSION}`), true);
});

test('PERF-06 export JSON is compact and parseable', () => {
  const config = factoryConfig();
  const html = generateStandaloneHtml(config, stub);
  assert.equal(html.includes('\n  "numColumns"'), false);
  const marker = 'const initialConfig = ';
  const start = html.indexOf(marker) + marker.length;
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i += 1) {
    const char = html[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const parsed = JSON.parse(html.slice(start, end)) as { numColumns: number; glyphSet: string };
  assert.equal(parsed.numColumns, config.numColumns);
  assert.equal(parsed.glyphSet, config.glyphSet);
});

test('PERF-10 ParticleCanvas binds the export engine instead of Function#toString', () => {
  const source = readFileSync(new URL('../components/ParticleCanvas.tsx', import.meta.url), 'utf8');
  assert.equal(source.includes('getAnimationLogicString'), true);
  assert.equal(source.includes('export const animationLogicString'), false);
  assert.equal(source.includes('.toString()'), false);
});
