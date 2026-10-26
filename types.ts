export type GlyphSet = 'film' | 'katakana' | 'binary' | 'ascii' | 'runes' | 'greek' | 'math' | 'emojis' | 'custom';
export type MouseEffect = 'grow' | 'attract' | 'repel' | 'swirl' | 'none';
export type StreamDirection = 'down' | 'up' | 'left' | 'right' | 'down-left' | 'down-right' | 'up-left' | 'up-right';
export type StreamMovement = 'linear' | 'serpentine' | 'zigzag' | 'spiral';
export type ColorMode = 'monochrome' | 'rainbow-stream' | 'screen-gradient' | 'speed-based';

export interface Config {
  // General
  numColumns: number;
  glyphSet: GlyphSet;
  customGlyphSet: string;
  message: string;
  preset?: string;

  // Appearance
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  backgroundColor: string;
  colorMode: ColorMode;
  glyphColor: string;
  leaderColor: string;
  fadeOutSpeed: number;
  characterSpacing: number;
  baseRotation: number;
  rotationSpeed: number;
  cellSnap: boolean;

  // Effects
  useGlow: boolean;
  glowColor: string;
  glowIntensity: number;
  useGhosting: boolean;
  ghostingIntensity: number;
  bloomRadius: number;
  chromaticAberration: number;
  scanlines: number;
  vignette: number;
  grain: number;

  // Behavior
  minSpeed: number;
  maxSpeed: number;
  glitchChance: number;
  characterSwapRate: number;
  minTrailLength: number;
  maxTrailLength: number;
  streamDirection: StreamDirection;
  streamMovement: StreamMovement;
  movementAmplitude: number;
  movementFrequency: number;

  // 3D
  useZAxis: boolean;
  perspective: number;
  minZ: number;
  maxZ: number;
  depthOfField: number;
  cameraDrift: number;

  // Interaction
  mouseEffect: MouseEffect;
  mouseRadius: number;
  mouseForce: number;
  useSplashEffect: boolean;
  splashRadius: number;
  splashForce: number;
}
