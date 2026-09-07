# Development Journal

## 2026-09-07: retirada del generador de glifos

- Eliminados el endpoint, el cliente y la dependencia de generación de glifos.
- El editor queda en lluvia WebGL, panel Tweakpane, presets, persistencia y export HTML.

## 2026-09-06: políticas extraídas, pnpm 12 y pasada de 30 tickets

- `packageManager` queda en pnpm 12.0.0. README y tareas alineados.
- Dependencias in-stack: Vite 8.2.2, plugin React 6.1.1, knip 6.34, oxfmt 0.66, oxlint 1.81.
- Configuración, charset, movimiento, color, persistencia y exportación viven en módulos puros con `node --test`.
- UX additive: Escape para stealth, descarga HTML, aviso de charset vacío y fallo al guardar.
- Tickets locales en `.scratch/matrix/issues/` (`ARC-01`–`10`, `PERF-01`–`10`, `UX-01`–`10`).

## 2026-08-09: pnpm, Vite 8

- Migración canónica de npm a pnpm con lockfile.
- Actualización completa a React 19.2.8, Three.js r185, Vite 8, TypeScript 7.0.2 y Tailwind CSS 4.3.3.
- Sustitución del Tailwind CDN y del import map por dependencias compiladas.
- Eliminación de dos canvases/componentes heredados, sus tipos y constantes sin consumidores.
- Corrección de los efectos de cursor anunciados, activación real del splash y liberación del atlas anterior.
- Carga diferida de Tweakpane.
- Gate agregado con TypeScript, Oxlint, Oxfmt, pruebas y build.

## 2026-06-23: Runtime Boot and Shader Repair

- **WebGL Canvas Fix**: Updated `ParticleCanvas` to replace stale canvases, position the active canvas absolutely, and dispose Three.js resources/listeners during cleanup.
- **Shader Visibility**: Restored the visible Matrix rain by preventing a stale blank canvas from covering or displacing the active WebGL renderer.
- **Standalone Export**: Updated generated HTML to load Three.js through the ESM module path instead of the removed `three.min.js` build.

## 2024-05-21: Professional Audit & Refactor

- **Core Update**: Switched to a unified `InstancedMesh` system in Three.js, supporting up to 60k glyphs at 60fps.
- **Clean Up**: Purged legacy files (`simplex.ts`, `drawing.ts`, `math.ts`) to reduce technical debt.
- **UX**: Implemented a "Stealth Mode" UI and added `localStorage` persistence for custom playground configurations.
- **Optimization**: Added a debounced config update mechanism to prevent WebGL context jitter during rapid UI changes.
- **Visuals**: Enhanced fragment shader with scanline flicker and high-resolution texture atlas generation.

## 2024-05-22: Full Control Panel Expansion

- **UI Overhaul**: Expanded `TweakpanePanel` to expose 100% of the available engine parameters.
- **Categorization**: Organized controls into 8 distinct logic folders (System, Content, Optics, Chromatics, Post-FX, Kinematics, Dimension, Interaction) for better usability.
- **Dynamic Binding**: Implemented comprehensive bi-directional data binding for new fields like `fontFamily`, `fontWeight`, `streamMovement`, and advanced 3D perspective settings.
- **Refinement**: Added dynamic dropdown generation from system constants.
- **Fix**: Replaced deprecated `addSeparator()` with `addBlade({ view: 'separator' })` to resolve Tweakpane v4 runtime error.
