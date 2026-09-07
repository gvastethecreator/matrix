import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  customGlyphNotice,
  panelFallbackLabel,
  persistErrorMessage,
  readUiVisible,
  stealthPressed,
  toggleStealth,
  writeUiVisible,
} from './editorUx.ts';

test('UX-01 stealth toggle and aria-pressed', () => {
  assert.equal(toggleStealth(true), false);
  assert.equal(toggleStealth(false), true);
  assert.equal(stealthPressed(true), true);
  assert.equal(stealthPressed(false), false);
});

test('UX-02 panel fallback label is non-empty', () => {
  assert.ok(panelFallbackLabel.length > 0);
});

test('UX-04 stealth persistence parses booleans', () => {
  assert.equal(readUiVisible(null), true);
  assert.equal(readUiVisible('false'), false);
  assert.equal(writeUiVisible(true), 'true');
  assert.equal(writeUiVisible(false), 'false');
});

test('UX-07 empty custom charset notice', () => {
  assert.ok(customGlyphNotice({ glyphSet: 'custom', customGlyphSet: '' }));
  assert.equal(customGlyphNotice({ glyphSet: 'katakana', customGlyphSet: '' }), null);
});

test('UX-09 persist error message tells the user it could not save', () => {
  assert.ok(persistErrorMessage.includes('guardar'));
});

test('UX surface: App wires fallback, download, stealth, and notices', () => {
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.equal(app.includes('panelFallbackLabel'), true);
  assert.equal(app.includes('Descargar HTML'), true);
  assert.equal(app.includes('aria-pressed'), true);
  assert.equal(app.includes("event.key !== 'Escape'"), true);
  assert.equal(app.includes('persistErrorMessage'), true);
  assert.equal(app.includes('customGlyphNotice'), true);
  const panel = readFileSync(new URL('../components/TweakpanePanel.tsx', import.meta.url), 'utf8');
  assert.equal(panel.includes('activePreset'), true);
  assert.equal(panel.includes('factoryConfig()'), true);
});
