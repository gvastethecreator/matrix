import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import test from 'node:test';
import { createGlyphsHandler } from './generateGlyphs.mjs';

const request = (method, body = '') => Object.assign(Readable.from([Buffer.from(body)]), { method });

const response = () => {
  const result = { headers: {}, status: 0, body: '' };
  return {
    result,
    setHeader(name, value) {
      result.headers[name] = value;
    },
    writeHead(status, headers) {
      result.status = status;
      Object.assign(result.headers, headers);
    },
    end(body) {
      result.body = body;
    },
  };
};

test('rejects requests when the server key is missing', async () => {
  const output = response();
  await createGlyphsHandler({ apiKey: '' })(request('POST', '{}'), output);
  assert.equal(output.result.status, 503);
});

test('validates the theme before calling Gemini', async () => {
  let calls = 0;
  const output = response();
  await createGlyphsHandler({
    apiKey: 'test',
    generate: async () => {
      calls += 1;
    },
  })(request('POST', JSON.stringify({ theme: ' '.repeat(4) })), output);
  assert.equal(output.result.status, 400);
  assert.equal(calls, 0);
});

test('returns generated glyphs without exposing the server key', async () => {
  const output = response();
  await createGlyphsHandler({
    apiKey: 'server-secret',
    generate: async (theme, key) => {
      assert.equal(theme, 'cyber forest');
      assert.equal(key, 'server-secret');
      return '森∆⌁';
    },
  })(request('POST', JSON.stringify({ theme: 'cyber forest' })), output);

  assert.equal(output.result.status, 200);
  assert.deepEqual(JSON.parse(output.result.body), { glyphs: '森∆⌁' });
  assert.equal(output.result.body.includes('server-secret'), false);
});
