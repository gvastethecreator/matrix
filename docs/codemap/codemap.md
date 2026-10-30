# Code map: matrix

Generated: 2026-10-30T01:51:49Z | Commit: `d39923e85e34` | Schema: 2
Generation: `cb14aa4d95d5db248f2e0d98e13d1d6d16fd3a2243c9e0dd72e7b554d0aac780`
Scope: . | Inventory: working-tree
Nodes: 43 | Edges: 131 | Flows: 0

## Coverage

- Analysis: **partial**; 28 analyzed of 31 included files.
- Configuration files: 1; omitted untracked files: 0.
- Unresolved references and analysis limits: 110.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `App.tsx` | module | Repository | callers: index.tsx | callees: components/ParticleCanvas.tsx, components/TweakpanePanel.tsx, config/configState.ts, config/configState.ts | tests: 0 | entry: none
- `components/ParticleCanvas.tsx` | module | Repository | callers: App.tsx | callees: config/constants.ts, engine/matrixRain.js, engine/matrixRain.js, external:javascript:react | tests: 0 | entry: none
- `components/TweakpanePanel.tsx` | module | Repository | callers: App.tsx | callees: config/configState.ts, config/configState.ts, config/constants.ts, external:javascript:react | tests: 0 | entry: none
- `config/configState.test.ts` | module | Repository | callers: none | callees: config/configState.ts, config/configState.ts, config/initialConfig.ts, external:javascript:node:assert | tests: 0 | entry: none
- `config/configState.ts` | module | Repository | callers: App.tsx, App.tsx, components/TweakpanePanel.tsx, components/TweakpanePanel.tsx | callees: config/initialConfig.ts, config/presets.ts, types.ts | tests: 4 | entry: none
- `config/constants.ts` | module | Repository | callers: components/ParticleCanvas.tsx, components/TweakpanePanel.tsx, engine/matrixRain.test.ts, utils/exportHtml.ts | callees: types.ts | tests: 1 | entry: none
- `config/enginePin.test.ts` | module | Repository | callers: none | callees: config/enginePin.ts, external:javascript:node:assert, external:javascript:node:fs, external:javascript:node:fs | tests: 0 | entry: none
- `config/enginePin.ts` | module | Repository | callers: config/enginePin.test.ts, utils/exportHtml.test.ts, utils/exportHtml.ts | callees: none | tests: 2 | entry: none
- `config/initialConfig.ts` | module | Repository | callers: config/configState.test.ts, config/configState.ts, config/presets.ts | callees: types.ts | tests: 1 | entry: none
- `config/presets.ts` | module | Repository | callers: App.tsx, config/configState.ts | callees: config/initialConfig.ts, types.ts | tests: 0 | entry: none
- `engine/matrixRain.js` | module | Repository | callers: App.tsx, components/ParticleCanvas.tsx, components/ParticleCanvas.tsx | callees: none | tests: 0 | entry: none
- `engine/matrixRain.test.ts` | module | Repository | callers: none | callees: config/configState.ts, config/configState.ts, config/constants.ts, external:javascript:node:assert | tests: 0 | entry: none
- `external:javascript:@tailwindcss/vite` | external | External | callers: vite.config.ts, vite.config.ts | callees: none | tests: 0 | entry: none
- `external:javascript:@vitejs/plugin-react` | external | External | callers: vite.config.ts, vite.config.ts | callees: none | tests: 0 | entry: none
- `external:javascript:node:assert` | external | External | callers: config/configState.test.ts, config/enginePin.test.ts, engine/matrixRain.test.ts, utils/editorUx.test.ts | callees: none | tests: 8 | entry: none
- `external:javascript:node:fs` | external | External | callers: config/enginePin.test.ts, config/enginePin.test.ts, engine/matrixRain.test.ts, engine/matrixRain.test.ts | callees: none | tests: 3 | entry: none
- `external:javascript:node:http` | external | External | callers: server.mjs, server.mjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:path` | external | External | callers: engine/matrixRain.test.ts, engine/matrixRain.test.ts, server.mjs, vite.config.ts | callees: none | tests: 1 | entry: none
- `external:javascript:node:test` | external | External | callers: config/configState.test.ts, config/configState.test.ts, config/enginePin.test.ts, config/enginePin.test.ts | callees: none | tests: 8 | entry: none
- `external:javascript:node:url` | external | External | callers: engine/matrixRain.test.ts, engine/matrixRain.test.ts, server.mjs, server.mjs | callees: none | tests: 1 | entry: none
- Showing 20 of 43 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `App.tsx` -> `components/ParticleCanvas.tsx` | imports
- `App.tsx` -> `components/TweakpanePanel.tsx` | imports
- `App.tsx` -> `config/configState.ts` | calls
- `App.tsx` -> `config/configState.ts` | imports
- `App.tsx` -> `config/presets.ts` | imports
- `App.tsx` -> `engine/matrixRain.js` | imports
- `App.tsx` -> `external:javascript:react` | calls
- `App.tsx` -> `external:javascript:react` | imports
- `App.tsx` -> `types.ts` | imports (type only)
- `App.tsx` -> `utils/editorUx.ts` | calls
- `App.tsx` -> `utils/editorUx.ts` | imports
- `App.tsx` -> `utils/exportDelivery.ts` | calls
- `App.tsx` -> `utils/exportDelivery.ts` | imports
- `App.tsx` -> `utils/exportHtml.ts` | calls
- `App.tsx` -> `utils/exportHtml.ts` | imports
- `App.tsx` -> `utils/persist.ts` | calls
- `App.tsx` -> `utils/persist.ts` | imports
- `App.tsx` -> `utils/random.ts` | calls
- `App.tsx` -> `utils/random.ts` | imports
- `App.tsx` -> `utils/revealImage.ts` | calls
- `App.tsx` -> `utils/revealImage.ts` | imports
- `components/ParticleCanvas.tsx` -> `config/constants.ts` | imports
- `components/ParticleCanvas.tsx` -> `engine/matrixRain.js` | calls
- `components/ParticleCanvas.tsx` -> `engine/matrixRain.js` | imports
- `components/ParticleCanvas.tsx` -> `external:javascript:react` | calls
- `components/ParticleCanvas.tsx` -> `external:javascript:react` | imports
- `components/ParticleCanvas.tsx` -> `external:javascript:three` | imports
- `components/ParticleCanvas.tsx` -> `types.ts` | imports (type only)
- `components/TweakpanePanel.tsx` -> `config/configState.ts` | calls
- `components/TweakpanePanel.tsx` -> `config/configState.ts` | imports
- `components/TweakpanePanel.tsx` -> `config/constants.ts` | imports
- `components/TweakpanePanel.tsx` -> `external:javascript:react` | calls
- `components/TweakpanePanel.tsx` -> `external:javascript:react` | imports
- `components/TweakpanePanel.tsx` -> `external:javascript:tweakpane` | imports
- `components/TweakpanePanel.tsx` -> `types.ts` | imports (type only)
- `config/configState.test.ts` -> `config/configState.ts` | calls
- `config/configState.test.ts` -> `config/configState.ts` | imports
- `config/configState.test.ts` -> `config/initialConfig.ts` | imports
- `config/configState.test.ts` -> `external:javascript:node:assert` | imports
- `config/configState.test.ts` -> `external:javascript:node:test` | calls
- `config/configState.test.ts` -> `external:javascript:node:test` | imports
- `config/configState.ts` -> `config/initialConfig.ts` | imports
- `config/configState.ts` -> `config/presets.ts` | imports
- `config/configState.ts` -> `types.ts` | imports (type only)
- `config/constants.ts` -> `types.ts` | imports (type only)
- `config/enginePin.test.ts` -> `config/enginePin.ts` | imports
- `config/enginePin.test.ts` -> `external:javascript:node:assert` | imports
- `config/enginePin.test.ts` -> `external:javascript:node:fs` | calls
- `config/enginePin.test.ts` -> `external:javascript:node:fs` | imports
- `config/enginePin.test.ts` -> `external:javascript:node:test` | calls
- Showing 50 of 131 edges; JSON contains every edge and its evidence.

## Unknown

- `App.tsx:20`: object-member-call-not-resolved (React)
- `config/configState.test.ts:7`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:12`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:13`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:14`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:15`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:16`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:21`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:22`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:27`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:28`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:29`: object-member-call-not-resolved (assert)

## Flows

- no source-backed call path from a recognized trigger

## Architecture changes

- Nodes: +0 / -0; edges: +0 / -0.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.
