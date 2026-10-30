export type GlyphSet = 'film' | 'katakana' | 'binary' | 'ascii' | 'runes' | 'greek' | 'math' | 'emojis' | 'custom';
export type MouseEffect = 'grow' | 'attract' | 'repel' | 'swirl' | 'none';
export type StreamDirection = 'down' | 'up' | 'left' | 'right' | 'down-left' | 'down-right' | 'up-left' | 'up-right';
export type StreamMovement = 'linear' | 'serpentine' | 'zigzag' | 'spiral' | 'wave';
export type ColorMode = 'monochrome' | 'rainbow-stream' | 'screen-gradient' | 'speed-based' | 'palette';
export type PaletteName = 'synthwave' | 'ember' | 'ice' | 'toxic' | 'gold' | 'blood';
export type RevealSource = 'text' | 'image' | 'camera';

export interface Config {
  // General
  numColumns: number;
  glyphSet: GlyphSet;
  customGlyphSet: string;
  message: string;
  revealSource: RevealSource;
  /** Downscaled JPEG data URL used when revealSource is 'image'. */
  revealImage: string;
  revealInvert: boolean;
  preset?: string;

  // Appearance
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  backgroundColor: string;
  colorMode: ColorMode;
  glyphColor: string;
  leaderColor: string;
  palette: PaletteName;
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
  /** 0 keeps continuous depth; 2 or more snaps streams to that many parallax planes. */
  depthLayers: number;
  depthOfField: number;
  cameraDrift: number;

  // Audio
  /** Drives speed, brightness, bloom, and beat splashes from the microphone. */
  audioReactive: boolean;
  audioSensitivity: number;

  // Interaction
  mouseEffect: MouseEffect;
  mouseRadius: number;
  mouseForce: number;
  useSplashEffect: boolean;
  splashRadius: number;
  splashForce: number;
}
