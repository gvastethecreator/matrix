import assert from 'node:assert/strict';
import test from 'node:test';
import { generateRandomConfig } from './random.ts';

test('ARC-04 random configs keep ordered positive ranges', () => {
  for (let i = 0; i < 100; i += 1) {
    const config = generateRandomConfig();
    assert.ok(config.minSpeed <= config.maxSpeed, `speed ${config.minSpeed} ${config.maxSpeed}`);
    assert.ok(config.minTrailLength <= config.maxTrailLength);
    assert.ok(config.minZ <= config.maxZ);
    assert.ok(config.numColumns > 0);
    assert.ok(config.fontSize > 0);
  }
});
