
export type GlyphSet = 'katakana' | 'binary' | 'ascii' | 'runes' | 'greek' | 'math' | 'emojis' | 'custom';
export type MouseEffect = 'ripple' | 'vortex' | 'explosion' | 'dna' | 'invert' | 'grow' | 'attract' | 'follow' | 'repel' | 'distort' | 'swirl' | 'none';
export type StreamDirection = 'down' | 'up' | 'left' | 'right' | 'down-left' | 'down-right' | 'up-left' | 'up-right';
export type StreamMovement = 'linear' | 'serpentine' | 'zigzag' | 'spiral';
export type ColorMode = 'monochrome' | 'rainbow-stream' | 'screen-gradient' | 'speed-based';

export interface Glyph {
  char: string;
  x: number;
  vx: number;
  y: number;
  vy: number;
  scale: number;
  angle: number;
  rotSpeed: number;
}

export interface Stream {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  glyphs: Glyph[];
  length: number;
  mutationRate: number;
  directionMultiplier: number;
  currentDir: [number, number];
  hue: number;
}

export interface Config {
  // General
  numColumns: number;
  glyphSet: GlyphSet;
  customGlyphSet: string;
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

  // Effects
  useGlow: boolean;
  glowColor: string;
  glowIntensity: number;
  useGhosting: boolean;
  ghostingIntensity: number;

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

  // Interaction
  mouseEffect: MouseEffect;
  mouseRadius: number;
  mouseForce: number;
  useSplashEffect: boolean;
  splashRadius: number;
  splashForce: number;
}

// Added legacy types to fix external component errors
export enum CharSetType {
  MATRIX = 'MATRIX',
  BINARY = 'BINARY',
  HEX = 'HEX',
  ALPHA = 'ALPHA',
  CUSTOM = 'CUSTOM',
}

export interface MatrixConfig {
  color: string;
  fontSize: number;
  speed: number;
  density: number;
  fadeFactor: number;
  charSet: CharSetType;
  customChars: string;
  glow: boolean;
  bloom: number;
  perspective: boolean;
}

export interface Preset {
  id: string;
  name: string;
  config: MatrixConfig;
}
