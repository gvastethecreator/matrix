import type { Config } from '../types.ts';

export const panelFallbackLabel = 'Cargando controles';

export const persistErrorMessage = 'No se pudo guardar la configuración en este navegador.';

export const readUiVisible = (raw: string | null): boolean => raw !== 'false';

export const customGlyphNotice = (config: Pick<Config, 'glyphSet' | 'customGlyphSet'>): string | null => {
  if (config.glyphSet !== 'custom') return null;
  if (config.customGlyphSet.trim()) return null;
  return 'El charset personalizado está vacío. Se usará un marcador hasta que añadas glifos.';
};

type ToggleKeyEvent = Pick<KeyboardEvent, 'key' | 'target' | 'ctrlKey' | 'metaKey' | 'altKey'>;

// Escape always toggles the panel; H does too unless the user is typing or pressing a shortcut chord.
export const isPanelToggleKey = (event: ToggleKeyEvent): boolean => {
  if (event.key === 'Escape') return true;
  if (event.key.toLowerCase() !== 'h' || event.ctrlKey || event.metaKey || event.altKey) return false;
  const target = event.target as Element | null;
  return !target?.closest?.('input, textarea, select, [contenteditable="true"]');
};
