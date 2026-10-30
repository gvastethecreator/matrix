import type { Config } from '../types.ts';
import {
  colorModes,
  fontFamilies,
  fontWeights,
  glyphSets,
  mouseEffects,
  palettes,
  revealSources,
  streamMovements,
} from './constants.ts';

type Visible = { when?: (config: Config) => boolean };
type KeysOf<T> = { [K in keyof Config]-?: Config[K] extends T ? K : never }[keyof Config];

export type Control = Visible &
  (
    | { kind: 'range'; key: KeysOf<number>; label: string; min: number; max: number; step: number }
    | { kind: 'toggle'; key: KeysOf<boolean>; label: string }
    | { kind: 'choice'; key: KeysOf<string>; label: string; options: readonly string[] }
    | { kind: 'select'; key: KeysOf<string>; label: string; options: readonly string[] }
    | { kind: 'color'; key: KeysOf<string>; label: string }
    | { kind: 'text'; key: KeysOf<string>; label: string; placeholder: string; multiline?: boolean }
    | { kind: 'palette' }
    | { kind: 'direction' }
    | { kind: 'image' }
  );

export type Section = { id: string; title: string; controls: readonly Control[] };

const range = (key: KeysOf<number>, label: string, min: number, max: number, step: number, when?: Visible['when']) =>
  ({ kind: 'range', key, label, min, max, step, when }) as const;
const toggle = (key: KeysOf<boolean>, label: string, when?: Visible['when']) =>
  ({ kind: 'toggle', key, label, when }) as const;

const imageOrCamera = (c: Config) => c.revealSource !== 'text';

// The panel renders these sections in order; presets live in their own tab outside this list.
export const sections: readonly Section[] = [
  {
    id: 'glyph',
    title: 'Glyphs',
    controls: [
      { kind: 'choice', key: 'glyphSet', label: 'Charset', options: glyphSets },
      {
        kind: 'text',
        key: 'customGlyphSet',
        label: 'Custom glyphs',
        placeholder: 'Type the characters to rain',
        multiline: true,
        when: (c) => c.glyphSet === 'custom',
      },
      { kind: 'select', key: 'fontFamily', label: 'Font', options: fontFamilies },
      { kind: 'choice', key: 'fontWeight', label: 'Weight', options: fontWeights },
      range('numColumns', 'Density', 10, 8000, 1),
      range('fontSize', 'Glyph size', 8, 64, 1),
      range('characterSpacing', 'Line height', 0.5, 2, 0.01),
      toggle('cellSnap', 'Grid lock'),
      range('baseRotation', 'Angle', 0, 360, 1),
      range('rotationSpeed', 'Spin', -20, 20, 0.1),
    ],
  },
  {
    id: 'reveal',
    title: 'Reveal',
    controls: [
      { kind: 'choice', key: 'revealSource', label: 'Source', options: revealSources },
      {
        kind: 'text',
        key: 'message',
        label: 'Message',
        placeholder: 'WAKE UP, NEO',
        when: (c) => c.revealSource === 'text',
      },
      { kind: 'image', when: (c) => c.revealSource === 'image' },
      toggle('revealInvert', 'Invert light', imageOrCamera),
    ],
  },
  {
    id: 'color',
    title: 'Color',
    controls: [
      { kind: 'choice', key: 'colorMode', label: 'Mode', options: colorModes },
      { kind: 'palette', when: (c) => c.colorMode === 'palette' },
      { kind: 'color', key: 'glyphColor', label: 'Glyph' },
      { kind: 'color', key: 'leaderColor', label: 'Leader' },
      { kind: 'color', key: 'backgroundColor', label: 'Void' },
      range('fadeOutSpeed', 'Fade', 0.01, 0.5, 0.01),
    ],
  },
  {
    id: 'motion',
    title: 'Motion',
    controls: [
      { kind: 'direction' },
      { kind: 'choice', key: 'streamMovement', label: 'Path', options: streamMovements },
      range('movementAmplitude', 'Amplitude', 0, 100, 1, (c) => c.streamMovement !== 'linear'),
      range('movementFrequency', 'Frequency', 0.01, 2, 0.01, (c) => c.streamMovement !== 'linear'),
      range('minSpeed', 'Min speed', 0.1, 30, 0.1),
      range('maxSpeed', 'Max speed', 1, 50, 0.1),
      range('minTrailLength', 'Min trail', 1, 50, 1),
      range('maxTrailLength', 'Max trail', 10, 200, 1),
      range('characterSwapRate', 'Swap rate', 0, 1, 0.01),
      range('glitchChance', 'Glitch', 0, 1, 0.01),
    ],
  },
  {
    id: 'depth',
    title: 'Depth',
    controls: [
      toggle('useZAxis', 'Z depth'),
      range('perspective', 'Perspective', 10, 1000, 1),
      range('minZ', 'Near', -200, 100, 1, (c) => c.useZAxis),
      range('maxZ', 'Far', 0, 1000, 1, (c) => c.useZAxis),
      range('depthLayers', 'Layers', 0, 6, 1, (c) => c.useZAxis),
      range('depthOfField', 'Depth blur', 0, 1, 0.01, (c) => c.useZAxis),
      range('cameraDrift', 'Camera drift', 0, 1, 0.01),
    ],
  },
  {
    id: 'fx',
    title: 'FX',
    controls: [
      toggle('useGlow', 'Bloom'),
      { kind: 'color', key: 'glowColor', label: 'Bloom tint', when: (c) => c.useGlow },
      range('glowIntensity', 'Intensity', 0, 10, 0.1, (c) => c.useGlow),
      range('bloomRadius', 'Spread', 0, 1, 0.01, (c) => c.useGlow),
      range('chromaticAberration', 'Aberration', 0, 1, 0.01),
      range('scanlines', 'Scanlines', 0, 1, 0.01),
      range('vignette', 'Vignette', 0, 1, 0.01),
      range('grain', 'Grain', 0, 1, 0.01),
      toggle('useGhosting', 'Ghosting'),
      range('ghostingIntensity', 'Persistence', 0, 0.99, 0.01, (c) => c.useGhosting),
    ],
  },
  {
    id: 'input',
    title: 'Input',
    controls: [
      { kind: 'choice', key: 'mouseEffect', label: 'Cursor', options: mouseEffects },
      range('mouseRadius', 'Radius', 10, 500, 1, (c) => c.mouseEffect !== 'none'),
      range('mouseForce', 'Force', 0, 50, 0.1, (c) => c.mouseEffect !== 'none'),
      toggle('useSplashEffect', 'Click splash'),
      range('splashRadius', 'Splash radius', 10, 500, 1, (c) => c.useSplashEffect),
      range('splashForce', 'Splash force', 0, 50, 0.1, (c) => c.useSplashEffect),
      toggle('audioReactive', 'Mic reactive'),
      range('audioSensitivity', 'Sensitivity', 0.2, 4, 0.05, (c) => c.audioReactive),
    ],
  },
];

export const paletteNames = Object.keys(palettes) as Config['palette'][];
