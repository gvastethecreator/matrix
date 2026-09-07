import assert from 'node:assert/strict';
import test from 'node:test';
import { ASCII, BINARY, EMOJIS, GREEK, KATAKANA, MATH, RUNES } from './constants.ts';
import { charsetFromConfig, createGlyphSetCache, resolveGlyphSet } from './glyphSet.ts';

test('ARC-02 named glyph sets resolve to published strings', () => {
  assert.equal(resolveGlyphSet('katakana', ''), KATAKANA);
  assert.equal(resolveGlyphSet('ascii', ''), ASCII);
  assert.equal(resolveGlyphSet('binary', ''), BINARY);
  assert.equal(resolveGlyphSet('runes', ''), RUNES);
  assert.equal(resolveGlyphSet('greek', ''), GREEK);
  assert.equal(resolveGlyphSet('math', ''), MATH);
  assert.equal(resolveGlyphSet('emojis', ''), EMOJIS);
});

test('ARC-02 custom text is returned when non-empty', () => {
  assert.equal(resolveGlyphSet('custom', 'ΔΨ'), 'ΔΨ');
});

test('ARC-02 custom empty or unknown set does not return an empty string', () => {
  assert.equal(resolveGlyphSet('custom', ''), '?');
  assert.equal(resolveGlyphSet('custom', '   '), '?');
  assert.equal(resolveGlyphSet('unknown', ''), KATAKANA);
  assert.notEqual(charsetFromConfig({ glyphSet: 'custom', customGlyphSet: '' }), '');
});

test('PERF-09 cache returns the same string reference until inputs change', () => {
  const cached = createGlyphSetCache();
  const first = cached('katakana', '');
  const second = cached('katakana', '');
  assert.equal(first, second);
  assert.equal(first === second, true);
  const third = cached('binary', '');
  assert.notEqual(third, first);
  assert.equal(third, BINARY);
});
