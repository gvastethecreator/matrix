import type { Config, StreamMovement } from '../types.ts';

export const MAX_GLYPHS = 60_000;
export const STRUCTURAL_REBUILD_MS = 100;

export const getStreamBounds = (width: number, height: number, perspective: number, z: number) => {
  const aspect = width / height;
  const distance = Math.max(1, perspective + z);
  const h = distance * (height / (2 * perspective));
  const w = h * aspect;
  return { w, h };
};

export const movementOffset = (
  kind: StreamMovement,
  time: number,
  amplitude: number,
  frequency: number,
  id: number,
): [number, number] => {
  if (kind === 'linear' || amplitude === 0) {
    return [0, 0];
  }
  const phase = time * frequency * 6 + id * 0.35;
  if (kind === 'serpentine') {
    return [Math.sin(phase) * amplitude, 0];
  }
  if (kind === 'zigzag') {
    return [Math.sign(Math.sin(phase)) * amplitude, 0];
  }
  return [Math.cos(phase) * amplitude, Math.sin(phase) * amplitude];
};

export const shouldRebuildAtlas = (prev: Config, next: Config): boolean =>
  prev.glyphSet !== next.glyphSet ||
  prev.customGlyphSet !== next.customGlyphSet ||
  prev.fontFamily !== next.fontFamily ||
  prev.fontWeight !== next.fontWeight ||
  prev.fontSize !== next.fontSize;

export const shouldUpdateCamera = (prev: Pick<Config, 'perspective'>, next: Pick<Config, 'perspective'>): boolean =>
  prev.perspective !== next.perspective;

export const shouldRunAnimation = (hidden: boolean): boolean => !hidden;

export const clampGlyphBudget = (numColumns: number, maxTrailLength: number, maxGlyphs = 60_000): number => {
  const trail = Math.max(1, maxTrailLength);
  const columns = Math.max(1, Math.floor(numColumns));
  const product = columns * trail;
  if (product <= maxGlyphs) {
    return columns;
  }
  return Math.max(1, Math.floor(maxGlyphs / trail));
};
