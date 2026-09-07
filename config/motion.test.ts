import assert from 'node:assert/strict';
import test from 'node:test';
import { initialConfig } from './initialConfig.ts';
import {
  clampGlyphBudget,
  getStreamBounds,
  MAX_GLYPHS,
  movementOffset,
  shouldRebuildAtlas,
  shouldRunAnimation,
  shouldUpdateCamera,
  STRUCTURAL_REBUILD_MS,
} from './motion.ts';

test('ARC-09 stream bounds are finite and positive', () => {
  const { w, h } = getStreamBounds(800, 600, 150, 0);
  assert.equal(Number.isFinite(w), true);
  assert.equal(Number.isFinite(h), true);
  assert.ok(w > 0);
  assert.ok(h > 0);
});

test('ARC-09 linear movement is zero and others are not', () => {
  assert.deepEqual(movementOffset('linear', 1, 10, 0.2, 3), [0, 0]);
  const serpentine = movementOffset('serpentine', 1, 10, 0.2, 3);
  const zigzag = movementOffset('zigzag', 1, 10, 0.2, 3);
  const spiral = movementOffset('spiral', 1, 10, 0.2, 3);
  assert.notDeepEqual(serpentine, [0, 0]);
  assert.notDeepEqual(zigzag, [0, 0]);
  assert.notDeepEqual(spiral, [0, 0]);
});

test('PERF-03 atlas rebuilds for charset or font, not for color', () => {
  const nextColor = { ...initialConfig, glyphColor: '#ffffff' };
  assert.equal(shouldRebuildAtlas(initialConfig, nextColor), false);
  assert.equal(shouldRebuildAtlas(initialConfig, { ...initialConfig, fontWeight: 'bold' }), true);
  assert.equal(shouldRebuildAtlas(initialConfig, { ...initialConfig, customGlyphSet: 'XYZ' }), true);
});

test('PERF-04 glyph budget never exceeds the instance cap', () => {
  assert.ok(clampGlyphBudget(400, 200, 60_000) * 200 <= 60_000);
  assert.equal(clampGlyphBudget(10, 10, 60_000), 10);
  assert.equal(MAX_GLYPHS, 60_000);
});

test('PERF-05 animation pauses while hidden', () => {
  assert.equal(shouldRunAnimation(true), false);
  assert.equal(shouldRunAnimation(false), true);
});

test('PERF-07 camera updates only when perspective changes', () => {
  assert.equal(shouldUpdateCamera({ perspective: 150 }, { perspective: 150 }), false);
  assert.equal(shouldUpdateCamera({ perspective: 150 }, { perspective: 200 }), true);
});

test('PERF-08 structural rebuild delay is 100ms', () => {
  assert.equal(STRUCTURAL_REBUILD_MS, 100);
});
