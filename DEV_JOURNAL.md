# Development Journal

## 2026-08-09: pnpm, Vite 8 y límite seguro de Gemini

- Migración canónica de npm a pnpm 11.21.0 con lockfile y builds de dependencias autorizados explícitamente.
- Actualización completa a React 19.2.8, Three.js r185, Vite 8.2.1, TypeScript 7.0.2 y Tailwind CSS 4.3.3.
- Eliminación de la clave Gemini del bundle; el cliente ahora usa un endpoint server-side validado.
- Sustitución del Tailwind CDN y del import map por dependencias compiladas.
- Eliminación de dos canvases/componentes heredados, sus tipos y constantes sin consumidores.
- Corrección de los efectos de cursor anunciados, activación real del splash y liberación del atlas anterior.
- Carga diferida de Tweakpane: el bundle inicial bajó de 884.24 kB a 731.65 kB.
- Gate agregado con TypeScript, Oxlint, Oxfmt, pruebas de API y build.

## 2026-06-23: Runtime Boot and Shader Repair

- **App Boot Fix**: Made `GeminiService` initialize lazily so the app can render without a configured Gemini API key; AI glyph generation now fails only when that feature is invoked.
- **WebGL Canvas Fix**: Updated `ParticleCanvas` to replace stale canvases, position the active canvas absolutely, and dispose Three.js resources/listeners during cleanup.
- **Shader Visibility**: Restored the visible Matrix rain by preventing a stale blank canvas from covering or displacing the active WebGL renderer.
- **Standalone Export**: Updated generated HTML to load Three.js through the r164 ESM module path instead of the removed `three.min.js` build.

## 2024-05-21: Professional Audit & Refactor

- **Core Update**: Switched to a unified `InstancedMesh` system in Three.js, supporting up to 60k glyphs at 60fps.
- **AI Integration**: Updated `GeminiService` to use `gemini-3-flash-preview` for near-instant thematic glyph generation.
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
