import assert from 'node:assert/strict';
import test from 'node:test';
import { applyPreset, factoryConfig, mergeStoredConfig, normalizeRange, parseStoredConfig } from './configState.ts';
import { initialConfig } from './initialConfig.ts';

test('ARC-01 empty object yields the initial config', () => {
  assert.deepEqual(mergeStoredConfig({}), initialConfig);
});

test('ARC-01 invalid numeric fields fall back to initial values', () => {
  const merged = mergeStoredConfig({ numColumns: 0, fontSize: '12', perspective: -1, minSpeed: -2, maxSpeed: 0 });
  assert.equal(merged.numColumns, initialConfig.numColumns);
  assert.equal(merged.fontSize, initialConfig.fontSize);
  assert.equal(merged.perspective, initialConfig.perspective);
  assert.equal(merged.minSpeed, initialConfig.minSpeed);
  assert.ok(merged.maxSpeed > 0);
});

test('ARC-01 invalid stored custom glyph text becomes an empty charset', () => {
  const restored = parseStoredConfig('{"glyphSet":"custom","customGlyphSet":null}');
  assert.equal(restored.customGlyphSet, '');
  assert.equal(mergeStoredConfig({ customGlyphSet: 'ΔΨ' }).customGlyphSet, 'ΔΨ');
});

test('ARC-01 missing colors fall back to initial values', () => {
  const merged = mergeStoredConfig({ glyphColor: null, leaderColor: 12, backgroundColor: '' });
  assert.equal(merged.glyphColor, initialConfig.glyphColor);
  assert.equal(merged.leaderColor, initialConfig.leaderColor);
  assert.equal(merged.backgroundColor, initialConfig.backgroundColor);
});

test('ARC-01 non-object JSON uses the initial config', () => {
  assert.deepEqual(parseStoredConfig('[]'), initialConfig);
  assert.deepEqual(parseStoredConfig('not-json'), initialConfig);
  assert.deepEqual(parseStoredConfig(null), initialConfig);
});

test('ARC-08 known preset merges and records its name', () => {
  const next = applyPreset(factoryConfig(), 'Caída Binaria');
  assert.equal(next.preset, 'Caída Binaria');
  assert.equal(next.glyphSet, 'binary');
});

test('ARC-08 unknown preset leaves the input unchanged', () => {
  const start = factoryConfig();
  const next = applyPreset(start, 'no-existe');
  assert.equal(next, start);
  assert.equal(start.glyphSet, initialConfig.glyphSet);
});

test('ARC-08 factoryConfig clones initialConfig', () => {
  const clone = factoryConfig();
  assert.deepEqual(clone, initialConfig);
  assert.notEqual(clone, initialConfig);
  const columns = initialConfig.numColumns;
  clone.numColumns = columns + 1;
  assert.equal(initialConfig.numColumns, columns);
});

test('UX-10 normalizeRange keeps both values in order', () => {
  assert.deepEqual(normalizeRange(8, 2), [2, 8]);
  assert.deepEqual(normalizeRange(3, 3), [3, 3]);
});

test('UX-10 inverted stored speeds are ordered', () => {
  const merged = mergeStoredConfig({ minSpeed: 9, maxSpeed: 3, minTrailLength: 40, maxTrailLength: 8 });
  assert.ok(merged.minSpeed <= merged.maxSpeed);
  assert.ok(merged.minTrailLength <= merged.maxTrailLength);
});
