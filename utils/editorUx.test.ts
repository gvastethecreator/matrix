import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { customGlyphNotice, isPanelToggleKey, persistErrorMessage, readUiVisible } from './editorUx.ts';

test('UX-04 stealth persistence parses booleans', () => {
  assert.equal(readUiVisible(null), true);
  assert.equal(readUiVisible('false'), false);
  assert.equal(readUiVisible('true'), true);
  assert.equal(readUiVisible('invalid'), true);
});

test('UX-07 empty custom charset notice', () => {
  assert.ok(customGlyphNotice({ glyphSet: 'custom', customGlyphSet: '' }));
  assert.equal(customGlyphNotice({ glyphSet: 'katakana', customGlyphSet: '' }), null);
});

test('UX-09 persist error message tells the user it could not save', () => {
  assert.ok(persistErrorMessage.includes('guardar'));
});

test('UX surface: App wires download, collapsible panel, and notices', () => {
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.equal(app.includes('handleDownloadHtml'), true);
  assert.equal(app.includes('inert={!isUiVisible}'), true);
  assert.equal(app.includes('isPanelToggleKey(event)'), true);
  assert.equal(app.includes('persistErrorMessage'), true);
  assert.equal(app.includes('customGlyphNotice'), true);
  const panel = readFileSync(new URL('../components/ControlPanel.tsx', import.meta.url), 'utf8');
  assert.equal(panel.includes('factoryConfig()'), true);
});

const toggles = (key: string, target: unknown, ctrlKey = false) =>
  isPanelToggleKey({ key, target: target as EventTarget, ctrlKey, metaKey: false, altKey: false });

test('UX-01 Escape or H toggles the panel, but H is ignored while typing or in chords', () => {
  const field = { closest: (selector: string) => (selector.includes('input') ? {} : null) };
  const canvas = { closest: () => null };
  assert.equal(toggles('Escape', field), true);
  assert.equal(toggles('h', canvas), true);
  assert.equal(toggles('H', null), true);
  assert.equal(toggles('h', field), false);
  assert.equal(toggles('h', canvas, true), false);
  assert.equal(toggles('j', canvas), false);
  const slider = { closest: (selector: string) => (selector.includes(':not(') ? null : {}) };
  assert.equal(toggles('h', slider), true);
});
