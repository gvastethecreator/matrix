# Matrix Digital Rain

Editor visual de lluvia digital con React, TypeScript, Three.js y Tweakpane. Permite ajustar el render WebGL en tiempo real, guardar la configuración y exportar una página HTML autónoma.

[Abrir la demo](https://gvastethecreator.github.io/matrix/).

La lluvia usa `WebGPURenderer` de three.js con shaders TSL: WebGPU cuando el navegador lo ofrece y WebGL2 como respaldo automático. Añade `?webgl` a la URL para forzar WebGL2; una etiqueta junto a la barra inferior muestra el backend activo. Las instancias calculan transformaciones, color, giro y efectos de cursor en el shader. Se dibuja en un búfer HDR y pasa por bloom multinivel, aberración cromática, scanlines, viñeta y grano. El juego Film usa katakana de media anchura en espejo, como la película, y es el predeterminado. Grid Lock fija los glifos a la rejilla; la profundidad Z añade niebla y desenfoque, y Camera Drift mueve la cámara para mostrar el volumen. Al cargar, la lluvia empieza a caer desde arriba. Un clic lanza una onda; el campo Message dibuja un texto con la propia lluvia. El control Density permite hasta 8.000 columnas, con un presupuesto total de 1.000.000 de glifos. El límite es de capacidad; la fluidez depende de la GPU, resolución, tamaño de los glifos y superposición.

Los presets **Lluvia Densa** y **Marea Digital** muestran mayor densidad y movimiento ondulado. El giro, la mutación de caracteres y el glitch se ajustan desde los controles existentes. La velocidad usa tiempo transcurrido para conservar el ritmo entre pantallas con distinta frecuencia.

## Requisitos

- Node.js 22.12 o posterior.
- pnpm 12 mediante Corepack o una instalación local.

## Inicio rápido

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

La app queda disponible en `http://127.0.0.1:3000`.

## Comandos

| Comando          | Uso                                                 |
| ---------------- | --------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo                              |
| `pnpm build`     | Build de producción en `dist/`                      |
| `pnpm start`     | Servidor de producción local; requiere build previo |
| `pnpm preview`   | Vista previa estática del build                     |
| `pnpm test`      | Pruebas de políticas y exportación                  |
| `pnpm deadcode`  | Archivos, exports y dependencias sin uso            |
| `pnpm typecheck` | TypeScript sin emitir archivos                      |
| `pnpm lint`      | Análisis con Oxlint                                 |
| `pnpm format`    | Formato con Oxfmt                                   |
| `pnpm check`     | Gate completo, incluido código muerto               |

## Arquitectura

- `App.tsx`: estado persistido, acciones de usuario y carga diferida del panel.
- `components/ParticleCanvas.tsx`: conecta React con el motor compartido de `utils/exportEngine.ts`.
- `components/TweakpanePanel.tsx`: controles imperativos conectados a React mediante referencias estables.
- `server.mjs`: servicio del build en producción local.
- `utils/exportHtml.ts`: exportador autónomo fijado a la misma versión de Three.js.

Más detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEPENDENCY_UPDATES.md](docs/DEPENDENCY_UPDATES.md) y [docs/QUALITY_AUDIT.md](docs/QUALITY_AUDIT.md).

## Operación

- `pnpm start` escucha en `127.0.0.1:4173` por defecto. `HOST` y `PORT` permiten cambiarlo.
- El HTML exportado carga Three.js desde un CDN; necesita conexión al abrirse por primera vez.

## GitHub Pages

Cada push a `main` publica la demo mediante `.github/workflows/pages.yml`. También se puede ejecutar desde Actions con **Run workflow**. El job instala las dependencias con pnpm 12, ejecuta `pnpm build --base=/matrix/` y publica `dist/`. Pages sirve archivos estáticos; no ejecuta `server.mjs`.

Para probar el mismo build antes de publicar:

```powershell
pnpm build --base=/matrix/
pnpm preview --base=/matrix/ --host 127.0.0.1
```

La vista previa queda disponible en `http://127.0.0.1:4173/matrix/`. El desarrollo con `pnpm dev` conserva la ruta `/`.
