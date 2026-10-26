import type { Config, GlyphSet } from '../types.ts';
import { ASCII, BINARY, EMOJIS, FILM, GREEK, KATAKANA, MATH, RUNES } from './constants.ts';

export const GLYPH_SET_TABLE: Record<Exclude<GlyphSet, 'custom'>, string> = {
  film: FILM,
  katakana: KATAKANA,
  ascii: ASCII,
  binary: BINARY,
  runes: RUNES,
  greek: GREEK,
  math: MATH,
  emojis: EMOJIS,
};

export const resolveGlyphSet = (
  glyphSet: string,
  customGlyphSet: string | undefined,
  table: Record<string, string> = GLYPH_SET_TABLE,
): string => {
  if (glyphSet === 'custom') {
    const custom = typeof customGlyphSet === 'string' ? customGlyphSet : '';
    return custom.trim() ? custom : '?';
  }
  return table[glyphSet] || table.katakana;
};

export const createGlyphSetCache = (table: Record<string, string> = GLYPH_SET_TABLE) => {
  let lastSet = '';
  let lastCustom = '';
  let lastValue = '';
  return (glyphSet: string, customGlyphSet: string | undefined) => {
    const custom = customGlyphSet ?? '';
    if (glyphSet === lastSet && custom === lastCustom && lastValue !== '') {
      return lastValue;
    }
    lastSet = glyphSet;
    lastCustom = custom;
    lastValue = resolveGlyphSet(glyphSet, custom, table);
    return lastValue;
  };
};

export const charsetFromConfig = (config: Pick<Config, 'glyphSet' | 'customGlyphSet'>): string =>
  resolveGlyphSet(config.glyphSet, config.customGlyphSet);
