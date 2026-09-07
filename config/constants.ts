import type { GlyphSet, MouseEffect, StreamDirection, StreamMovement, ColorMode } from '../types.ts';

// --- Conjuntos de Caracteres ---
export const KATAKANA =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
export const ASCII = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234456789!@#$%^&*()_+-=[]{}|;:",.<>/?`~';
export const BINARY = '01';
export const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
export const GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω';
export const MATH = '∀∂∃∄∅∇∈∉∋∌∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∮';
export const EMOJIS = '😂👍❤️😊🤔🔥🎉✨💯✅';

// --- Vectores de Dirección ---
export const directionVectors: Record<StreamDirection, [number, number]> = {
  down: [0, -1],
  up: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  'down-left': [-Math.SQRT1_2, -Math.SQRT1_2],
  'down-right': [Math.SQRT1_2, -Math.SQRT1_2],
  'up-left': [-Math.SQRT1_2, Math.SQRT1_2],
  'up-right': [Math.SQRT1_2, Math.SQRT1_2],
};

// --- Opciones para Aleatorización ---
export const glyphSets: readonly GlyphSet[] = [
  'katakana',
  'binary',
  'ascii',
  'runes',
  'greek',
  'math',
  'emojis',
  'custom',
];
export const mouseEffects: readonly MouseEffect[] = ['grow', 'attract', 'repel', 'swirl', 'none'];

// Added Zen Dots and other Sci-Fi fonts
export const fontFamilies: readonly string[] = [
  'monospace',
  'Zen Dots',
  'Orbitron',
  'Share Tech Mono',
  'Audiowide',
  'VT323',
  'Courier New',
  'Lucida Console',
  'Consolas',
  'Menlo',
  'Victor Mono',
  'Fira Code',
];

export const fontWeights: readonly string[] = ['normal', 'bold', '100', '300', '700', '900'];
export const streamDirections: readonly StreamDirection[] = [
  'down',
  'up',
  'left',
  'right',
  'down-left',
  'down-right',
  'up-left',
  'up-right',
];
export const streamMovements: readonly StreamMovement[] = ['linear', 'serpentine', 'zigzag', 'spiral'];
export const colorModes: readonly ColorMode[] = ['monochrome', 'rainbow-stream', 'screen-gradient', 'speed-based'];
