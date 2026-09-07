import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { THREE_MODULE_VERSION } from './enginePin.ts';

test('ARC-03 Three.js pin matches package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    dependencies: { three: string };
  };
  assert.equal(pkg.dependencies.three.replace(/^\^/, ''), THREE_MODULE_VERSION);
});
