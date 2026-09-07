# Code map · matrix

generated: 2026-09-07T01:30:05Z
commit: 23e1ab48d347
scope: .

counts: 10 nodes · 16 edges · 0 flows · 0 unknown

## Modules

- `app` · `App.tsx` · module · App
  callers: index (imports)
  callees: components (imports), config (imports), external-dependencies (imports), types (imports), utils (imports)
  tests: (none)
  entry: App.tsx:TweakpanePanel

- `components` · `components` · interface · Components
  callers: app (imports)
  callees: config (imports), external-dependencies (imports), types (imports)
  tests: (none)
  entry: components/ParticleCanvas.tsx:EngineController

- `config` · `config` · module · Config
  callers: app (imports), components (imports), utils (imports)
  callees: types (imports)
  tests: (none)
  entry: config/constants.ts:KATAKANA

- `external-dependencies` · `App.tsx` · external · External
  callers: app (imports), components (imports), index (imports), utils (imports), vite-config (imports)
  callees: (none)
  tests: (none)
  entry: App.tsx:react

- `index` · `index.tsx` · module · Index
  callers: (none)
  callees: app (imports), external-dependencies (imports)
  tests: (none)
  entry: index.tsx:rootElement

- `repository` · `package.json` · module · Repository
  callers: (none)
  callees: server (calls)
  tests: (none)
  entry: package.json:{

- `server` · `server.mjs` · service · Server
  callers: repository (calls)
  callees: (none)
  tests: (none)
  entry: server.mjs:root

- `types` · `types.ts` · module · Types
  callers: app (imports), components (imports), config (imports), utils (imports)
  callees: (none)
  tests: (none)
  entry: types.ts:GlyphSet

- `utils` · `utils` · module · Utils
  callers: app (imports)
  callees: config (imports), external-dependencies (imports), types (imports)
  tests: (none)
  entry: utils/exportHtml.ts:generateStandaloneHtml

- `vite-config` · `vite.config.ts` · module · Vite.Config
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: vite.config.ts:import path from 'node:path';

## Edges

- app -> components · imports
- app -> config · imports
- app -> external-dependencies · imports
- app -> types · imports
- app -> utils · imports
- components -> config · imports
- components -> external-dependencies · imports
- components -> types · imports
- config -> types · imports
- index -> app · imports
- index -> external-dependencies · imports
- repository -> server · calls
- utils -> config · imports
- utils -> external-dependencies · imports
- utils -> types · imports
- vite-config -> external-dependencies · imports

## Unknown

- none

## Flows

- none
