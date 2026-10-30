import type { Config } from '../types.ts';
import { normalizeRange } from '../config/configState.ts';
import { streamDirections } from '../config/constants.ts';
import { paletteNames, sections, type Control } from '../config/controls.ts';

type Random = () => number;

// Controls that would ask for the camera or microphone, or wipe typed text, never mutate on their own.
const SKIPPED = new Set<string>(['revealSource', 'audioReactive', 'message', 'customGlyphSet']);

const pick = <T>(items: readonly T[], random: Random): T => items[Math.floor(random() * items.length)];

const hslToHex = (h: number, s: number, l: number): string => {
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

const mutate = (control: Control, config: Config, random: Random): Partial<Config> => {
  switch (control.kind) {
    case 'range': {
      const steps = Math.round((control.max - control.min) / control.step);
      const value = control.min + Math.round(random() * steps) * control.step;
      return { [control.key]: Number(value.toFixed(4)) };
    }
    case 'toggle':
      return { [control.key]: !config[control.key] };
    case 'choice':
    case 'select':
      return {
        [control.key]: pick(
          control.options.filter((o) => o !== config[control.key]),
          random,
        ),
      };
    case 'color': {
      const hue = random() * 360;
      // Backgrounds stay near black so a mutation never floods the screen with light.
      return {
        [control.key]:
          control.key === 'backgroundColor'
            ? hslToHex(hue, 0.6, 0.02 + random() * 0.06)
            : hslToHex(hue, 0.8 + random() * 0.2, 0.5 + random() * 0.2),
      };
    }
    case 'palette':
      return {
        palette: pick(
          paletteNames.filter((p) => p !== config.palette),
          random,
        ),
      };
    case 'direction':
      return {
        streamDirection: pick(
          streamDirections.filter((d) => d !== config.streamDirection),
          random,
        ),
      };
    default:
      return {};
  }
};

const labelOf = (control: Control) =>
  'label' in control ? control.label : control.kind === 'direction' ? 'Flow' : 'Palette';

/**
 * Changes a few randomly chosen controls (3 to 5) and keeps the rest, so each press is a variation
 * of the current look instead of a new one. Only controls visible for the current config are
 * candidates, so every change shows on screen.
 */
export const mutateConfig = (config: Config, random: Random = Math.random) => {
  const candidates = sections
    .flatMap((section) => section.controls)
    .filter((control) => control.kind !== 'text' && control.kind !== 'image')
    .filter((control) => !('key' in control && SKIPPED.has(control.key)))
    .filter((control) => !control.when || control.when(config));
  const count = Math.min(candidates.length, 3 + Math.floor(random() * 3));
  const chosen: Control[] = [];
  while (chosen.length < count) {
    const control = pick(candidates, random);
    if (!chosen.includes(control)) chosen.push(control);
  }

  const next: Config = { ...config };
  for (const control of chosen) Object.assign(next, mutate(control, next, random));
  delete next.preset;
  [next.minSpeed, next.maxSpeed] = normalizeRange(next.minSpeed, next.maxSpeed);
  [next.minTrailLength, next.maxTrailLength] = normalizeRange(next.minTrailLength, next.maxTrailLength);
  [next.minZ, next.maxZ] = normalizeRange(next.minZ, next.maxZ);
  return { config: next, changed: chosen.map(labelOf) };
};
