import assert from 'node:assert/strict';
import test from 'node:test';
import { decideExportDelivery, downloadExportFilename } from './exportDelivery.ts';

test('ARC-06 clipboard success copies', () => {
  assert.deepEqual(decideExportDelivery(true, 1), { kind: 'copied' });
});

test('ARC-06 clipboard failure downloads a timestamped file', () => {
  const delivery = decideExportDelivery(false, 1700000000000);
  assert.equal(delivery.kind, 'download');
  if (delivery.kind === 'download') {
    assert.equal(delivery.filename.startsWith('matrix-digital-rain-'), true);
    assert.equal(delivery.filename.endsWith('.html'), true);
  }
});

test('UX-06 download filename matches the export pattern', () => {
  const name = downloadExportFilename(42);
  assert.equal(name, 'matrix-digital-rain-42.html');
});
