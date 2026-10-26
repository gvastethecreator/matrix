import type { GlyphSet, MouseEffect, StreamDirection, StreamMovement, ColorMode } from '../types.ts';

export const GLYPH_SET_TABLE: Record<Exclude<GlyphSet, 'custom'>, string> = {
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

export const MAX_GLYPHS = 1_000_000;
export const MAX_STREAMS = 16_384;
export const STRUCTURAL_REBUILD_MS = 100;

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
export const streamMovements: readonly StreamMovement[] = ['linear', 'serpentine', 'zigzag', 'spiral'];
export const colorModes: readonly ColorMode[] = ['monochrome', 'rainbow-stream', 'screen-gradient', 'speed-based'];
