import assert from 'node:assert/strict';
import test from 'node:test';
import { factoryConfig } from '../config/configState.ts';
import { mutateConfig } from './random.ts';

test('ARC-04 mutations change only a few controls and keep ordered positive ranges', () => {
  let config = factoryConfig();
  for (let i = 0; i < 200; i += 1) {
    const { config: next, changed } = mutateConfig(config);
    const differing = (Object.keys(next) as (keyof typeof next)[]).filter((key) => next[key] !== config[key]);
    assert.ok(changed.length >= 3 && changed.length <= 5, `changed ${changed.length}`);
    // Re-ordering a min/max pair can touch its partner, so allow one extra key per pair.
    assert.ok(differing.length <= changed.length + 3, `${differing.join(', ')} for ${changed.join(', ')}`);
    assert.ok(next.minSpeed <= next.maxSpeed, `speed ${next.minSpeed} ${next.maxSpeed}`);
    assert.ok(next.minTrailLength <= next.maxTrailLength);
    assert.ok(next.minZ <= next.maxZ);
    assert.ok(next.numColumns > 0);
    assert.ok(next.fontSize > 0);
    assert.equal(next.revealSource, config.revealSource, 'never asks for the camera');
    assert.equal(next.audioReactive, config.audioReactive, 'never asks for the microphone');
    config = next;
  }
});
