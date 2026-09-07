import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { factoryConfig } from '../config/configState.ts';
import type { Glyph, Stream } from '../types.ts';
import { getAnimationLogicString } from './exportEngine.ts';
import { generateStandaloneHtml } from './exportHtml.ts';

test('PERF-10 engine source is injected text with THREE.*, not Function#toString closures', () => {
  const source = getAnimationLogicString();
  assert.match(source, /function runMatrixAnimation\(THREE, canvas, initialConfig\)/);
  assert.match(source, /new THREE\.Scene\(/);
  assert.match(source, /new THREE\.WebGLRenderer\(/);
  assert.match(source, /new THREE\.InstancedMesh\(/);
  assert.match(source, /new THREE\.ShaderMaterial\(/);
  assert.match(source, /THREE\.DynamicDrawUsage/);
  assert.equal(source.includes('.toString()'), false);
  assert.equal(source.includes('resolveGlyphSet.toString'), false);
  const kind = new Function(`${source}\nreturn typeof runMatrixAnimation;`)();
  assert.equal(kind, 'function');
  const glyphKeys: Array<keyof Glyph> = ['char', 'x', 'y', 'scale'];
  for (const key of glyphKeys) {
    assert.equal(source.includes(`${key}:`), true, `engine writes Glyph.${key}`);
  }
  const streamKeys: Array<keyof Stream> = ['glyphs', 'currentDir', 'hue'];
  for (const key of streamKeys) {
    assert.equal(source.includes(key), true, `engine writes Stream.${key}`);
  }
});

const distAssets = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets');
const distIndex =
  existsSync(distAssets) && readdirSync(distAssets).find((name) => name.startsWith('index-') && name.endsWith('.js'));

test('production index bundle keeps injected THREE.* engine text', { skip: !distIndex }, () => {
  const bundle = readFileSync(join(distAssets, distIndex as string), 'utf8');
  assert.equal(bundle.includes('function runMatrixAnimation(THREE, canvas, initialConfig)'), true);
  assert.equal(bundle.includes('new THREE.Scene('), true);
  assert.equal(bundle.includes('new THREE.WebGLRenderer('), true);
  assert.equal(bundle.includes('animationLogic.toString'), false);
  assert.equal(bundle.includes('glyphColorForMode.toString'), false);
});

test('ARC-03 standalone HTML calls the injected THREE engine', () => {
  const html = generateStandaloneHtml(factoryConfig(), getAnimationLogicString());
  assert.match(html, /runMatrixAnimation\(THREE, canvas, initialConfig\)/);
  assert.match(html, /new THREE\.Scene\(/);
  assert.match(html, /import \* as THREE from 'https:\/\/unpkg\.com\/three@/);
});
