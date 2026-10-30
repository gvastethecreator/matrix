# AGENTS

Browser-only Matrix digital-rain editor. Keep the existing stack and the pnpm version pinned in `package.json`.

## Commands

- `pnpm dev`: Vite at `127.0.0.1:3000`.
- `pnpm build` then `pnpm start`: serve `dist/` at `127.0.0.1:4173`.
- `pnpm check`: types, lint, formatting, Knip, build, then tests. Building first keeps production-export checks current.
- Other commands live in `package.json`; `.vscode/tasks.json` mirrors daily tasks.

## Boundaries

- Tickets are local-only under `.scratch/matrix/issues/`, never `docs/`. Do not open GitHub Issues or enable Actions unless asked. The existing Pages deployment is authorized.
- Logs go under ignored `logs/`.
- Preserve `grow`, `attract`, `repel`, `swirl`, and splash.
- Keep `matrix_config` and `matrix_ui_visible` stable.
- The editor imports `engine/matrixRain.js`; the HTML export embeds its text with `?raw`. Keep that file free of imports (Three.js and lookup tables arrive as parameters). Do not serialize engine closures with `Function#toString()`.

## Code map

Read `docs/codemap/codemap.md` before module edits. Refresh `docs/codemap/{json,md,html,lock}` together when boundaries or flows change.
