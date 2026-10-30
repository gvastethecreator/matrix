import type {
  GlyphSet,
  MouseEffect,
  StreamDirection,
  StreamMovement,
  ColorMode,
  PaletteName,
  RevealSource,
} from '../types.ts';

const GLYPH_SET_TABLE: Record<Exclude<GlyphSet, 'custom'>, string> = {
  film: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z:・."=*+-<>¦｜',
  katakana:
    'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン',
  ascii: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234456789!@#$%^&*()_+-=[]{}|;:",.<>/?`~',
  binary: '01',
  runes: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ',
  greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω',
  math: '∀∂∃∄∅∇∈∉∋∌∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∮',
  emojis: '😂👍❤️😊🤔🔥🎉✨💯✅',
};

const MAX_GLYPHS = 1_000_000;
const MAX_STREAMS = 16_384;
const STRUCTURAL_REBUILD_MS = 100;

const directionVectors: Record<StreamDirection, [number, number]> = {
  down: [0, -1],
  up: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  'down-left': [-Math.SQRT1_2, -Math.SQRT1_2],
  'down-right': [Math.SQRT1_2, -Math.SQRT1_2],
  'up-left': [-Math.SQRT1_2, Math.SQRT1_2],
  'up-right': [Math.SQRT1_2, Math.SQRT1_2],
};

export const glyphSets: readonly GlyphSet[] = [
  'film',
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
export const streamMovements: readonly StreamMovement[] = ['linear', 'serpentine', 'zigzag', 'spiral', 'wave'];
export const colorModes: readonly ColorMode[] = [
  'monochrome',
  'rainbow-stream',
  'screen-gradient',
  'speed-based',
  'palette',
];
export const revealSources: readonly RevealSource[] = ['text', 'image', 'camera'];

// Three stops per palette; the 'palette' color mode spreads streams across them.
export const palettes: Record<PaletteName, readonly [string, string, string]> = {
  synthwave: ['#ff2a6d', '#b026ff', '#21e6c1'],
  ember: ['#ff3b00', '#ff9500', '#ffe066'],
  ice: ['#5ac8fa', '#a8f0ff', '#f2ffff'],
  toxic: ['#00ff9c', '#39ff14', '#c6ff00'],
  gold: ['#b8860b', '#ffd700', '#fff4b0'],
  blood: ['#5c0000', '#c1121f', '#ff8a8a'],
};

// Lookup data the shared engine receives as its `tables` argument; the export serializes it beside the engine text.
export const engineTables = {
  directionVectors,
  colorModes,
  mouseEffects,
  streamMovements,
  palettes,
  GLYPH_SET_TABLE,
  MAX_GLYPHS,
  MAX_STREAMS,
  STRUCTURAL_REBUILD_MS,
};
