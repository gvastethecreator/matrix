# Contributor architecture overview

The editor and standalone exports run the same Three.js engine. React owns editor state; the engine owns rendering and GPU resources. The app has no application API or database.

## Module ownership

| Path                                           | Responsibility                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `App.tsx`                                      | Configuration state, backend status, clipboard/download actions, and control visibility.   |
| `components/ParticleCanvas.tsx`                | Canvas and engine-controller lifecycle. Configuration updates keep the controller mounted. |
| `components/TweakpanePanel.tsx`                | Lazy-loaded controls with stable callback and value references.                            |
| `config/initialConfig.ts`, `config/presets.ts` | Defaults and partial named presets.                                                        |
| `config/constants.ts`                          | Glyph strings, selectable options, direction vectors, and renderer budgets.                |
| `config/configState.ts`                        | Stored-config parsing, defaults, numeric range normalization, and preset application.      |
| `utils/persist.ts`                             | Debounced storage writes, duplicate-write suppression, flush, and write-error results.     |
| `utils/exportEngine.ts`                        | Shared WebGPU/WebGL2 renderer, shader effects, pointer interaction, resize, and cleanup.   |
| `utils/exportHtml.ts`, `config/enginePin.ts`   | Standalone document generation and the Three.js CDN version pin.                           |
| `utils/exportDelivery.ts`, `utils/editorUx.ts` | Export delivery decisions, stored visibility parsing, and editor notices.                  |
| `utils/random.ts`                              | Random configurations with ordered speed, trail, and depth ranges.                         |
| `server.mjs`                                   | Local serving of an existing `dist/` build. GitHub Pages does not use this server.         |

## Configuration and persistence

`App` owns the active `Config`. The panel sends changes to React; it does not own a second saved configuration. `configState` combines saved values with defaults and normalizes the numeric ranges it validates.

The saved keys are `matrix_config` and `matrix_ui_visible`. Keep them stable. Persistence batches rapid edits, skips unchanged serialized values, and flushes pending changes during cleanup. Write failures are reported to the user. Custom glyph text uses a visible placeholder when empty or invalid.

## Rendering and export

`getAnimationLogicString()` returns engine source with `THREE` as a parameter. The editor injects its local Three.js namespace. Standalone HTML imports the pinned `three.webgpu.js` module. Keep this source independent of surrounding closures and do not replace it with `Function#toString()`; minification would change that contract.

One TSL graph supports both WebGPU and the WebGL2 fallback. Glyph transforms and visual effects run in the shader. Font or character-set changes rebuild the glyph atlas; ordinary visual changes update uniforms. The engine observes canvas size, pauses while the document is hidden, and disposes its resources and listeners when destroyed.

Preserve `grow`, `attract`, `repel`, `swirl`, splash, and the direct download path. Rendering limits are capacity bounds; they do not promise a frame rate.

## Verification

`pnpm check` builds before running tests so the export test can inspect the fresh production bundle. The existing tests cover saved configuration, random ranges, persistence, export documents, and engine instance limits and lifecycle. Renderer or interaction changes also need a rendered browser check.

The generated [code map](codemap/codemap.md) contains static source relationships. Its unresolved references remain visible; it is not runtime proof.
