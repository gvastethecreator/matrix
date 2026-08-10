# Matrix Digital Rain

Editor visual de lluvia digital con React, TypeScript, Three.js y Tweakpane. Permite ajustar el render WebGL en tiempo real, guardar la configuración, generar glifos temáticos con Gemini y exportar una página HTML autónoma.

## Requisitos

- Node.js 22.12 o posterior.
- pnpm 11.21.0 mediante Corepack o una instalación local.
- `GEMINI_API_KEY` solo si se usa la generación de glifos con IA.

## Inicio rápido

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

La app queda disponible en `http://127.0.0.1:3000`. La clave Gemini permanece en el proceso de Vite y las solicitudes del navegador pasan por `POST /api/glyphs`.

## Comandos

| Comando          | Uso                                                 |
| ---------------- | --------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo con API Gemini local         |
| `pnpm build`     | Build de producción en `dist/`                      |
| `pnpm start`     | Servidor de producción local; requiere build previo |
| `pnpm preview`   | Vista previa estática del build, sin API Gemini     |
| `pnpm test`      | Pruebas del límite HTTP de Gemini                   |
| `pnpm deadcode`  | Archivos, exports y dependencias sin uso            |
| `pnpm typecheck` | TypeScript sin emitir archivos                      |
| `pnpm lint`      | Análisis con Oxlint                                 |
| `pnpm format`    | Formato con Oxfmt                                   |
| `pnpm check`     | Gate completo, incluido código muerto               |

## Arquitectura

- `App.tsx`: estado persistido, acciones de usuario y carga diferida del panel.
- `components/ParticleCanvas.tsx`: motor WebGL, atlas de glifos, interacción y liberación de recursos GPU.
- `components/TweakpanePanel.tsx`: controles imperativos conectados a React mediante referencias estables.
- `api/generateGlyphs.mjs`: validación y llamada server-side a Gemini.
- `server.mjs`: servicio del build y de la API en producción local.
- `utils/exportHtml.ts`: exportador autónomo fijado a la misma versión de Three.js.

Más detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEPENDENCY_UPDATES.md](docs/DEPENDENCY_UPDATES.md) y [docs/QUALITY_AUDIT.md](docs/QUALITY_AUDIT.md).

## Seguridad y operación

- Nunca uses una variable `VITE_*` para la clave Gemini: Vite la expondría al cliente.
- `pnpm start` lee `GEMINI_API_KEY` en tiempo de ejecución y escucha en `127.0.0.1:4173` por defecto. `HOST` y `PORT` permiten cambiarlo.
- El HTML exportado carga Three.js desde un CDN; necesita conexión al abrirse por primera vez.
- `pnpm preview` sirve solo archivos estáticos. Para probar IA sobre el build usa `pnpm start`.
