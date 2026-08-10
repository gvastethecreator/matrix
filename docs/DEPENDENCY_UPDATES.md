# Actualización de dependencias — 2026-08-09

Todas las dependencias directas quedaron en la última versión publicada al momento de la revisión. `pnpm outdated` no devuelve pendientes.

| Paquete                                       |         Antes |                               Ahora | Cambio relevante para Matrix                                                                       |
| --------------------------------------------- | ------------: | ----------------------------------: | -------------------------------------------------------------------------------------------------- |
| `@google/genai`                               |         2.9.0 |                              2.16.0 | Cliente actual y correcciones acumuladas; ahora se ejecuta solo del lado servidor.                 |
| `react`, `react-dom`                          |        19.2.0 |                              19.2.8 | Correcciones 19.2 y soporte estable de `lazy`/`Suspense` usado por el panel.                       |
| `three`                                       |       0.164.1 |                             0.185.1 | Cambios acumulados de WebGL, liberación de recursos y tipos; el exportador quedó alineado en r185. |
| `tweakpane`                                   |         4.0.3 |                               4.0.5 | Correcciones del panel; `@tweakpane/core` 2.0.5 se declara para completar sus tipos publicados.    |
| `vite`                                        |         6.2.0 |                               8.2.1 | Migración a Rolldown/Oxc, build unificado y Node 22.12 mínimo documentado.                         |
| `@vitejs/plugin-react`                        |         5.0.0 |                               6.0.5 | React Refresh con Oxc y menor instalación al retirar Babel por defecto.                            |
| `typescript`                                  |         5.8.2 |                               7.0.2 | Nuevo compilador nativo y validación más rápida; el proyecto pasa sin compatibilidad heredada.     |
| `tailwindcss`, `@tailwindcss/vite`            | CDN sin fijar |                               4.3.3 | CSS local reproducible, utilidades de scrollbar y eliminación del script CDN en producción.        |
| `oxlint`, `oxfmt`, `knip`                     |             — |            1.77.0 / 0.62.0 / 6.32.0 | Gate rápido para lint, formato y código muerto.                                                    |
| tipos (`node`, `react`, `react-dom`, `three`) |     parciales | 26.2.0 / 19.2.18 / 19.2.4 / 0.185.4 | Tipos alineados con los runtimes y TypeScript 7.                                                   |

## Changelogs revisados

- [Google GenAI SDK releases](https://github.com/googleapis/js-genai/releases)
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2) y [changelog de React](https://github.com/facebook/react/blob/main/CHANGELOG.md)
- [Three.js releases](https://github.com/mrdoob/three.js/releases) y [guía de migración](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- [Tweakpane releases](https://github.com/cocopon/tweakpane/releases)
- [Vite 8](https://vite.dev/blog/announcing-vite8) y [plugin React](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md)
- [Tailwind CSS 4.3](https://tailwindcss.com/blog/tailwindcss-v4-3)
- [TypeScript 7](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Oxlint estable](https://oxc.rs/blog/2025-06-10-oxlint-stable) y [releases Oxc](https://github.com/oxc-project/oxc/releases)
- [Configuración segura de builds de pnpm 11](https://pnpm.io/settings/build)

## Migraciones aplicadas

- npm → pnpm 11.21.0; se eliminó `package-lock.json` y se generó `pnpm-lock.yaml`.
- Tailwind CDN/import map → plugin oficial de Vite.
- `process.env` inyectado por Vite → API server-side.
- `__dirname` emulado → `import.meta.dirname`.
- Builds de dependencias restringidos con `allowBuilds` para `@google/genai` y `protobufjs`.
