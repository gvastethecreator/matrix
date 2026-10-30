# Contributor architecture overview

The editor and standalone exports run the same Three.js engine. React owns editor state; the engine owns rendering and GPU resources. The app has no application API or database.

## Module ownership

| Path                                           | Responsibility                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `App.tsx`                                      | Configuration state, side panel, idle fade, keyboard toggle, reveal image upload, export.  |
| `components/ParticleCanvas.tsx`                | Canvas and engine-controller lifecycle. Configuration updates keep the controller mounted. |
| `components/TweakpanePanel.tsx`                | Lazy-loaded controls with stable callback and value references.                            |
| `config/initialConfig.ts`, `config/presets.ts` | Defaults and partial named presets.                                                        |
| `config/constants.ts`                          | Glyph strings, selectable options, direction vectors, and renderer budgets.                |
| `config/configState.ts`                        | Stored-config parsing, defaults, numeric range normalization, and preset application.      |
| `utils/persist.ts`                             | Debounced storage writes, duplicate-write suppression, flush, and write-error results.     |
| `engine/matrixRain.js`                         | Shared WebGPU/WebGL2 renderer, shader effects, reveal masks, pointer input, and cleanup.   |
| `utils/exportHtml.ts`, `config/enginePin.ts`   | Standalone document generation and the Three.js CDN version pin.                           |
| `utils/exportDelivery.ts`, `utils/editorUx.ts` | Export delivery, stored panel visibility, panel toggle keys, and editor notices.           |
| `utils/revealImage.ts`                         | Downscales an uploaded reveal image to a small JPEG data URL.                              |
| `utils/random.ts`                              | Random configurations with ordered speed, trail, and depth ranges.                         |
| `server.mjs`                                   | Local serving of an existing `dist/` build. GitHub Pages does not use this server.         |

## Configuration and persistence

`App` owns the active `Config`. The panel sends changes to React; it does not own a second saved configuration. `configState` combines saved values with defaults and normalizes the numeric ranges it validates.

The saved keys are `matrix_config` and `matrix_ui_visible`. Keep them stable. Persistence batches rapid edits, skips unchanged serialized values, and flushes pending changes during cleanup. Write failures are reported to the user. Custom glyph text uses a visible placeholder when empty or invalid.

## Rendering and export

`engine/matrixRain.js` is a plain JavaScript module with no imports. `runMatrixAnimation(THREE, canvas, config, tables)` receives Three.js and the lookup data from `engineTables` in `config/constants.ts`. The editor imports the module. The export embeds the file text through Vite's `?raw` import, removes `export`, and serializes `engineTables` beside it; standalone HTML imports the pinned `three.webgpu.js` module. Keep the file self-contained and do not replace the text with `Function#toString()`; minification would change that contract.

One TSL graph supports both WebGPU and the WebGL2 fallback. Each stream slot gets a fixed trail length when streams are built, and a per-instance slot attribute maps every drawn instance to a live glyph; the GPU never processes hidden trail slots. Reveal masks come from text, an uploaded image, or the camera; the shader reads their luminance. The optional audio mode reads microphone loudness with a Web Audio analyser each frame; loudness raises speed, glyph brightness, and bloom, and sudden energy jumps trigger a splash and a short glitch burst. Glyph transforms and visual effects run in the shader. Font or character-set changes rebuild the glyph atlas; ordinary visual changes update uniforms. The engine observes canvas size, pauses while the document is hidden, and disposes its resources and listeners when destroyed.

Preserve `grow`, `attract`, `repel`, `swirl`, splash, and the direct download path. Rendering limits are capacity bounds; they do not promise a frame rate.

## Verification

`pnpm check` builds before running tests so the export test can inspect the fresh production bundle. The existing tests cover saved configuration, random ranges, persistence, export documents, and engine instance limits and lifecycle. Renderer or interaction changes also need a rendered browser check.

The generated [code map](codemap/codemap.md) contains static source relationships. Its unresolved references remain visible; it is not runtime proof.
