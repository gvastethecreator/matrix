import type { Config } from '../types.ts';
import { initialConfig } from './initialConfig.ts';
import { presets } from './presets.ts';

export const CONFIG_STORAGE_KEY = 'matrix_config';
export const UI_VISIBLE_STORAGE_KEY = 'matrix_ui_visible';

const POSITIVE_NUMBER_KEYS = [
  'numColumns',
  'fontSize',
  'perspective',
  'maxSpeed',
  'maxTrailLength',
  'minTrailLength',
  'characterSpacing',
] as const;

const NON_NEGATIVE_NUMBER_KEYS = ['minSpeed'] as const;

const COLOR_KEYS = ['glyphColor', 'leaderColor', 'backgroundColor'] as const;

export const normalizeRange = (min: number, max: number): [number, number] => (min > max ? [max, min] : [min, max]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeNumbers = (merged: Config): void => {
  for (const key of POSITIVE_NUMBER_KEYS) {
    if (typeof merged[key] !== 'number' || !Number.isFinite(merged[key]) || merged[key] <= 0) {
      merged[key] = initialConfig[key];
    }
  }
  for (const key of NON_NEGATIVE_NUMBER_KEYS) {
    if (typeof merged[key] !== 'number' || !Number.isFinite(merged[key]) || merged[key] < 0) {
      merged[key] = initialConfig[key];
    }
  }
  const [minSpeed, maxSpeed] = normalizeRange(merged.minSpeed, merged.maxSpeed);
  merged.minSpeed = minSpeed;
  merged.maxSpeed = maxSpeed;
  const [minTrailLength, maxTrailLength] = normalizeRange(merged.minTrailLength, merged.maxTrailLength);
  merged.minTrailLength = minTrailLength;
  merged.maxTrailLength = maxTrailLength;
};

const sanitizeColors = (merged: Config): void => {
  for (const key of COLOR_KEYS) {
    if (!merged[key] || typeof merged[key] !== 'string') {
      merged[key] = initialConfig[key];
    }
  }
};

export const mergeStoredConfig = (raw: unknown): Config => {
  if (!isRecord(raw)) {
    return { ...initialConfig };
  }
  const merged = { ...initialConfig, ...raw } as Config;
  sanitizeNumbers(merged);
  sanitizeColors(merged);
  if (typeof merged.customGlyphSet !== 'string') {
    merged.customGlyphSet = '';
  }
  if (typeof merged.revealImage !== 'string') {
    merged.revealImage = '';
  }
  return merged;
};

export const parseStoredConfig = (text: string | null): Config => {
  if (!text) {
    return { ...initialConfig };
  }
  try {
    return mergeStoredConfig(JSON.parse(text));
  } catch {
    return { ...initialConfig };
  }
};

export const serializeConfig = (config: Config): string => JSON.stringify(config);

export const shouldSkipPersist = (previousSerialized: string | null, nextSerialized: string): boolean =>
  previousSerialized === nextSerialized;

export const factoryConfig = (): Config => ({ ...initialConfig });

export const applyPreset = (config: Config, name: string): Config => {
  const preset = presets[name];
  if (!preset) {
    return config;
  }
  return { ...config, ...preset, preset: name };
};
