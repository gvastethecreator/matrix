import assert from 'node:assert/strict';
import test from 'node:test';
import { glyphColorForMode } from './coloring.ts';

const base = {
  glyphColor: '#00ff41',
  leaderColor: '#c8ffc8',
  streamHue: 0,
  normalizedY: 0.25,
  speed: 4,
  minSpeed: 2,
  maxSpeed: 8,
};

test('ARC-10 monochrome leader matches leaderColor', () => {
  const rgb = glyphColorForMode({ ...base, colorMode: 'monochrome', isLeader: true });
  assert.ok(Math.abs(rgb.r - 200 / 255) < 0.01);
  assert.ok(Math.abs(rgb.g - 1) < 0.01);
  assert.ok(Math.abs(rgb.b - 200 / 255) < 0.01);
});

test('ARC-10 rainbow-stream hue 0 differs from hue 0.5', () => {
  const a = glyphColorForMode({ ...base, colorMode: 'rainbow-stream', isLeader: false, streamHue: 0 });
  const b = glyphColorForMode({ ...base, colorMode: 'rainbow-stream', isLeader: false, streamHue: 0.5 });
  assert.notDeepEqual(a, b);
});

test('ARC-10 speed-based with equal min and max does not throw', () => {
  const rgb = glyphColorForMode({
    ...base,
    colorMode: 'speed-based',
    isLeader: false,
    minSpeed: 5,
    maxSpeed: 5,
    speed: 5,
  });
  assert.equal(Number.isFinite(rgb.r), true);
  assert.equal(Number.isFinite(rgb.g), true);
  assert.equal(Number.isFinite(rgb.b), true);
});
