import type { Config } from '../types.ts';

export const panelFallbackLabel = 'Cargando controles';

export const persistErrorMessage = 'No se pudo guardar la configuración en este navegador.';

export const readUiVisible = (raw: string | null): boolean => raw !== 'false';

export const customGlyphNotice = (config: Pick<Config, 'glyphSet' | 'customGlyphSet'>): string | null => {
  if (config.glyphSet !== 'custom') return null;
  if (config.customGlyphSet.trim()) return null;
  return 'El charset personalizado está vacío. Se usará un marcador hasta que añadas glifos.';
};
