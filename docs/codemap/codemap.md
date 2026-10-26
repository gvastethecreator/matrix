# Code map: matrix

Generated: 2026-10-26T06:38:10Z | Commit: `33302d930a9c` | Schema: 2
Generation: `29b0b4c68d67bdfeae24d4392777b43f0ddebc8f24750257a75f11dd43175700`
Scope: . | Inventory: working-tree
Nodes: 48 | Edges: 155 | Flows: 0

## Coverage

- Analysis: **partial**; 33 analyzed of 34 included files.
- Configuration files: 1; omitted untracked files: 0.
- Unresolved references and analysis limits: 161.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `App.tsx` | module | Repository | callers: index.tsx | callees: components/ParticleCanvas.tsx, components/TweakpanePanel.tsx, config/configState.ts, config/configState.ts | tests: 0 | entry: none
- `components/ParticleCanvas.tsx` | module | Repository | callers: App.tsx | callees: external:javascript:react, external:javascript:react, external:javascript:three, types.ts | tests: 0 | entry: none
- `components/TweakpanePanel.tsx` | module | Repository | callers: App.tsx | callees: config/configState.ts, config/configState.ts, config/constants.ts, external:javascript:react | tests: 0 | entry: none
- `config/coloring.test.ts` | module | Repository | callers: none | callees: config/coloring.ts, config/coloring.ts, external:javascript:node:assert, external:javascript:node:test | tests: 0 | entry: none
- `config/coloring.ts` | module | Repository | callers: config/coloring.test.ts, config/coloring.test.ts | callees: types.ts | tests: 1 | entry: none
- `config/configState.test.ts` | module | Repository | callers: none | callees: config/configState.ts, config/configState.ts, config/initialConfig.ts, external:javascript:node:assert | tests: 0 | entry: none
- `config/configState.ts` | module | Repository | callers: App.tsx, App.tsx, components/TweakpanePanel.tsx, components/TweakpanePanel.tsx | callees: config/initialConfig.ts, config/presets.ts, types.ts | tests: 4 | entry: none
- `config/constants.ts` | module | Repository | callers: components/TweakpanePanel.tsx, config/glyphSet.test.ts, config/glyphSet.ts, utils/exportEngine.ts | callees: types.ts | tests: 1 | entry: none
- `config/enginePin.test.ts` | module | Repository | callers: none | callees: config/enginePin.ts, external:javascript:node:assert, external:javascript:node:fs, external:javascript:node:fs | tests: 0 | entry: none
- `config/enginePin.ts` | module | Repository | callers: config/enginePin.test.ts, utils/exportHtml.test.ts, utils/exportHtml.ts | callees: none | tests: 2 | entry: none
- `config/glyphSet.test.ts` | module | Repository | callers: none | callees: config/constants.ts, config/glyphSet.ts, config/glyphSet.ts, external:javascript:node:assert | tests: 0 | entry: none
- `config/glyphSet.ts` | module | Repository | callers: config/glyphSet.test.ts, config/glyphSet.test.ts, utils/exportEngine.ts | callees: config/constants.ts, types.ts | tests: 1 | entry: none
- `config/initialConfig.ts` | module | Repository | callers: config/configState.test.ts, config/configState.ts, config/motion.test.ts, config/presets.ts | callees: types.ts | tests: 2 | entry: none
- `config/motion.test.ts` | module | Repository | callers: none | callees: config/initialConfig.ts, config/motion.ts, config/motion.ts, external:javascript:node:assert | tests: 0 | entry: none
- `config/motion.ts` | module | Repository | callers: config/motion.test.ts, config/motion.test.ts, utils/exportEngine.ts | callees: types.ts | tests: 1 | entry: none
- `config/presets.ts` | module | Repository | callers: App.tsx, config/configState.ts | callees: config/initialConfig.ts, types.ts | tests: 0 | entry: none
- `external:javascript:@tailwindcss/vite` | external | External | callers: vite.config.ts, vite.config.ts | callees: none | tests: 0 | entry: none
- `external:javascript:@vitejs/plugin-react` | external | External | callers: vite.config.ts, vite.config.ts | callees: none | tests: 0 | entry: none
- `external:javascript:node:assert` | external | External | callers: config/coloring.test.ts, config/configState.test.ts, config/enginePin.test.ts, config/glyphSet.test.ts | callees: none | tests: 11 | entry: none
- `external:javascript:node:fs` | external | External | callers: config/enginePin.test.ts, config/enginePin.test.ts, server.mjs, server.mjs | callees: none | tests: 4 | entry: none
- Showing 20 of 48 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `App.tsx` -> `components/ParticleCanvas.tsx` | imports
- `App.tsx` -> `components/TweakpanePanel.tsx` | imports
- `App.tsx` -> `config/configState.ts` | calls
- `App.tsx` -> `config/configState.ts` | imports
- `App.tsx` -> `config/presets.ts` | imports
- `App.tsx` -> `external:javascript:react` | calls
- `App.tsx` -> `external:javascript:react` | imports
- `App.tsx` -> `types.ts` | imports (type only)
- `App.tsx` -> `utils/editorUx.ts` | calls
- `App.tsx` -> `utils/editorUx.ts` | imports
- `App.tsx` -> `utils/exportDelivery.ts` | calls
- `App.tsx` -> `utils/exportDelivery.ts` | imports
- `App.tsx` -> `utils/exportEngine.ts` | calls
- `App.tsx` -> `utils/exportEngine.ts` | imports
- `App.tsx` -> `utils/exportHtml.ts` | calls
- `App.tsx` -> `utils/exportHtml.ts` | imports
- `App.tsx` -> `utils/persist.ts` | calls
- `App.tsx` -> `utils/persist.ts` | imports
- `App.tsx` -> `utils/random.ts` | calls
- `App.tsx` -> `utils/random.ts` | imports
- `components/ParticleCanvas.tsx` -> `external:javascript:react` | calls
- `components/ParticleCanvas.tsx` -> `external:javascript:react` | imports
- `components/ParticleCanvas.tsx` -> `external:javascript:three` | imports
- `components/ParticleCanvas.tsx` -> `types.ts` | imports (type only)
- `components/ParticleCanvas.tsx` -> `utils/exportEngine.ts` | calls
- `components/ParticleCanvas.tsx` -> `utils/exportEngine.ts` | imports
- `components/TweakpanePanel.tsx` -> `config/configState.ts` | calls
- `components/TweakpanePanel.tsx` -> `config/configState.ts` | imports
- `components/TweakpanePanel.tsx` -> `config/constants.ts` | imports
- `components/TweakpanePanel.tsx` -> `external:javascript:react` | calls
- `components/TweakpanePanel.tsx` -> `external:javascript:react` | imports
- `components/TweakpanePanel.tsx` -> `external:javascript:tweakpane` | imports
- `components/TweakpanePanel.tsx` -> `types.ts` | imports (type only)
- `config/coloring.test.ts` -> `config/coloring.ts` | calls
- `config/coloring.test.ts` -> `config/coloring.ts` | imports
- `config/coloring.test.ts` -> `external:javascript:node:assert` | imports
- `config/coloring.test.ts` -> `external:javascript:node:test` | calls
- `config/coloring.test.ts` -> `external:javascript:node:test` | imports
- `config/coloring.ts` -> `types.ts` | imports (type only)
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
- Showing 50 of 155 edges; JSON contains every edge and its evidence.

## Unknown

- `App.tsx:21`: object-member-call-not-resolved (React)
- `config/coloring.test.ts:17`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:18`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:19`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:25`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:37`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:38`: object-member-call-not-resolved (assert)
- `config/coloring.test.ts:39`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:7`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:12`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:13`: object-member-call-not-resolved (assert)
- `config/configState.test.ts:14`: object-member-call-not-resolved (assert)

## Flows

- no source-backed call path from a recognized trigger

## Architecture changes

- Nodes: +0 / -0; edges: +0 / -0.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.
