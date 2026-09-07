import type { Config } from '../types.ts';
import { CONFIG_STORAGE_KEY, parseStoredConfig, serializeConfig, shouldSkipPersist } from '../config/configState.ts';

export type KvStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type PersistResult = { ok: true; serialized: string } | { ok: false; error: unknown };

export type TimerFns = {
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (id: unknown) => void;
};

export const loadConfig = (storage: KvStorage): Config => parseStoredConfig(storage.getItem(CONFIG_STORAGE_KEY));

export const writeConfig = (storage: KvStorage, config: Config): PersistResult => {
  const serialized = serializeConfig(config);
  try {
    storage.setItem(CONFIG_STORAGE_KEY, serialized);
    return { ok: true, serialized };
  } catch (error) {
    return { ok: false, error };
  }
};

export const createPersistScheduler = (
  storage: KvStorage,
  options: { delayMs?: number; timers?: TimerFns; onResult?: (result: PersistResult) => void } = {},
) => {
  const delayMs = options.delayMs ?? 250;
  const timers: TimerFns = options.timers ?? {
    setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
    clearTimeout: (id) => {
      globalThis.clearTimeout(id as ReturnType<typeof globalThis.setTimeout>);
    },
  };
  const onResult = options.onResult;
  let lastSerialized: string | null = storage.getItem(CONFIG_STORAGE_KEY);
  let timer: unknown = null;
  let pending: Config | null = null;
  let lastResult: PersistResult = { ok: true, serialized: lastSerialized ?? '' };

  const flush = (): PersistResult => {
    if (timer !== null) {
      timers.clearTimeout(timer);
      timer = null;
    }
    if (!pending) {
      return lastResult;
    }
    const next = serializeConfig(pending);
    if (shouldSkipPersist(lastSerialized, next)) {
      pending = null;
      return lastResult;
    }
    lastResult = writeConfig(storage, pending);
    if (lastResult.ok) {
      lastSerialized = lastResult.serialized;
    }
    pending = null;
    onResult?.(lastResult);
    return lastResult;
  };

  return {
    push(config: Config): void {
      pending = config;
      if (timer !== null) {
        timers.clearTimeout(timer);
      }
      timer = timers.setTimeout(() => {
        timer = null;
        flush();
      }, delayMs);
    },
    flush,
    writesAvoided(config: Config): boolean {
      return shouldSkipPersist(lastSerialized, serializeConfig(config));
    },
  };
};
