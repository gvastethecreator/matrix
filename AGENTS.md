# AGENTS

Matrix digital-rain editor. React 19, TypeScript 7, Vite 8, Three.js r185, Tweakpane, pnpm 12.

## Commands

- `pnpm dev` — Vite at `127.0.0.1:3000`
- `pnpm build` then `pnpm start` — `dist/` at `127.0.0.1:4173`
- `pnpm test` — `node --test` (colocated policy tests)
- `pnpm check` — typecheck, lint, format, knip, test, build
- `pnpm deadcode` / `pnpm typecheck` / `pnpm lint` / `pnpm format`

## Boundaries

- Do not revert `packageManager` `pnpm@12.0.0`.
- Tickets live in `.scratch/matrix/issues/`. Never under `docs/`.
- Logs only under `logs/` (gitignored).
- Keep mouse effects `grow` / `attract` / `repel` / `swirl` plus splash.
- Local-only tracker. Do not open GitHub Issues or enable Actions unless asked.

## Map

Read `docs/codemap/codemap.md` before module edits. Refresh `docs/codemap/{json,md,html,lock}` together when boundaries or flows change.
