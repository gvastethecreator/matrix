import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG_STORAGE_KEY, factoryConfig, serializeConfig } from '../config/configState.ts';
import { createPersistScheduler, loadConfig, writeConfig } from './persist.ts';

const memory = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem(key: string) {
      return Object.hasOwn(data, key) ? data[key] : null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
};

test('ARC-05 storage key is matrix_config', () => {
  assert.equal(CONFIG_STORAGE_KEY, 'matrix_config');
});

test('ARC-05 roundtrip keeps known fields', () => {
  const storage = memory();
  const config = factoryConfig();
  const written = writeConfig(storage, config);
  assert.equal(written.ok, true);
  const loaded = loadConfig(storage);
  assert.equal(loaded.numColumns, config.numColumns);
  assert.equal(loaded.glyphSet, config.glyphSet);
});

test('ARC-05 corrupt JSON does not throw', () => {
  const storage = memory({ [CONFIG_STORAGE_KEY]: '{broken' });
  assert.equal(loadConfig(storage).numColumns, factoryConfig().numColumns);
});

test('ARC-05 write failure is reported', () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('quota');
    },
  };
  const result = writeConfig(storage, factoryConfig());
  assert.equal(result.ok, false);
});

test('PERF-01 debounce writes the last value once', () => {
  const storage = memory();
  let writes = 0;
  const wrapped = {
    getItem: storage.getItem,
    setItem(key: string, value: string) {
      writes += 1;
      storage.setItem(key, value);
    },
  };
  const queued: Array<{ fn: () => void } | null> = [];
  const persist = createPersistScheduler(wrapped, {
    delayMs: 250,
    timers: {
      setTimeout(fn) {
        queued.push({ fn });
        return queued.length - 1;
      },
      clearTimeout(id) {
        queued[id as number] = null;
      },
    },
  });
  const a = { ...factoryConfig(), numColumns: 11 };
  const b = { ...factoryConfig(), numColumns: 12 };
  const c = { ...factoryConfig(), numColumns: 13 };
  persist.push(a);
  persist.push(b);
  persist.push(c);
  assert.equal(writes, 0);
  for (const item of queued) item?.fn();
  assert.equal(writes, 1);
  assert.equal(JSON.parse(storage.data[CONFIG_STORAGE_KEY]).numColumns, 13);
});

test('PERF-02 identical JSON skips the second write', () => {
  const config = factoryConfig();
  const storage = memory({ [CONFIG_STORAGE_KEY]: serializeConfig(config) });
  let writes = 0;
  const wrapped = {
    getItem: storage.getItem,
    setItem(key: string, value: string) {
      writes += 1;
      storage.setItem(key, value);
    },
  };
  const persist = createPersistScheduler(wrapped, { delayMs: 0 });
  persist.push(config);
  persist.flush();
  assert.equal(writes, 0);
  persist.push({ ...config, numColumns: 80 });
  persist.flush();
  assert.equal(writes, 1);
});
