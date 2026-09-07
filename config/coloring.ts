import type { ColorMode } from '../types.ts';

export type Rgb = { r: number; g: number; b: number };

// Nested helpers stay with this function so tests and the engine copy stay aligned.
export const glyphColorForMode = (input: {
  colorMode: ColorMode;
  isLeader: boolean;
  glyphColor: string;
  leaderColor: string;
  streamHue: number;
  normalizedY: number;
  speed: number;
  minSpeed: number;
  maxSpeed: number;
}): Rgb => {
  /* oxlint-disable unicorn/consistent-function-scoping */
  const hexToRgb = (hex: string): Rgb => {
    const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
    const packed = Number.parseInt(normalized.padEnd(6, '0').slice(0, 6), 16);
    if (!Number.isFinite(packed)) {
      return { r: 0, g: 1, b: 0.25 };
    }
    return {
      r: ((packed >> 16) & 255) / 255,
      g: ((packed >> 8) & 255) / 255,
      b: (packed & 255) / 255,
    };
  };
  const hslToRgb = (h: number, s: number, l: number): Rgb => {
    const hue = ((h % 1) + 1) % 1;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    const sector = Math.floor(hue * 6);
    if (sector === 0) {
      r = c;
      g = x;
      b = 0;
    } else if (sector === 1) {
      r = x;
      g = c;
      b = 0;
    } else if (sector === 2) {
      r = 0;
      g = c;
      b = x;
    } else if (sector === 3) {
      r = 0;
      g = x;
      b = c;
    } else if (sector === 4) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }
    return { r: r + m, g: g + m, b: b + m };
  };

  if (input.colorMode === 'rainbow-stream') {
    return hslToRgb(input.streamHue, 0.85, input.isLeader ? 0.72 : 0.48);
  }
  if (input.colorMode === 'screen-gradient') {
    const y = Math.min(1, Math.max(0, input.normalizedY));
    return hslToRgb(y * 0.7, 0.8, input.isLeader ? 0.7 : 0.45);
  }
  if (input.colorMode === 'speed-based') {
    const span = input.maxSpeed - input.minSpeed;
    const t = span === 0 ? 0.5 : Math.min(1, Math.max(0, (input.speed - input.minSpeed) / span));
    return hslToRgb(0.35 - t * 0.35, 0.9, input.isLeader ? 0.7 : 0.4 + t * 0.2);
  }
  return hexToRgb(input.isLeader ? input.leaderColor : input.glyphColor);
  /* oxlint-enable unicorn/consistent-function-scoping */
};
