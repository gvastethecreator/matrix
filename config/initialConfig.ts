import type { Config } from '../types.ts';

export const initialConfig: Config = {
  // General
  numColumns: 100,
  glyphSet: 'katakana',
  customGlyphSet: '01',

  // Appearance
  fontSize: 16,
  fontFamily: 'monospace',
  fontWeight: 'normal',
  backgroundColor: '#000000',

  colorMode: 'monochrome',
  glyphColor: '#00ff41',
  leaderColor: '#c8ffc8',

  fadeOutSpeed: 0.1,
  characterSpacing: 1.0,
  baseRotation: 0,
  rotationSpeed: 0,

  // Glow Effect
  useGlow: true,
  glowColor: '#33ff77',
  glowIntensity: 1.5,

  // Ghosting Effect
  useGhosting: false,
  ghostingIntensity: 0.5,

  // Behavior
  minSpeed: 2,
  maxSpeed: 8,
  glitchChance: 0.01,
  characterSwapRate: 0.02,
  minTrailLength: 10,
  maxTrailLength: 40,
  streamDirection: 'down',
  streamMovement: 'linear',
  movementAmplitude: 10,
  movementFrequency: 0.1,

  // 3D Effect
  useZAxis: true,
  perspective: 150,
  minZ: 0,
  maxZ: 50,

  // Interactivity
  mouseEffect: 'grow',
  mouseRadius: 150,
  mouseForce: 8,
  useSplashEffect: true,
  splashRadius: 100,
  splashForce: 5,
};
