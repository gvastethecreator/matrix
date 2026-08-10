# Arquitectura

## Flujo principal

1. `index.tsx` monta `App` y carga el CSS generado por Tailwind.
2. `App.tsx` recupera y sanea `matrix_config`, mantiene el estado y delega el render a `ParticleCanvas`.
3. `ParticleCanvas` conserva un controlador Three.js entre renders; los cambios ordinarios actualizan uniformes y solo los cambios estructurales reconstruyen atlas y streams con debounce.
4. `TweakpanePanel` se descarga como chunk separado y modifica el estado mediante callbacks estables.
5. La exportación serializa configuración y motor en un HTML autónomo.

## Límite Gemini

El navegador solo conoce `POST /api/glyphs`. En desarrollo, un middleware de Vite ejecuta `api/generateGlyphs.mjs`. En producción local, `server.mjs` sirve `dist/` y el mismo handler. Ambos leen `GEMINI_API_KEY` fuera del bundle, limitan método, tamaño y longitud del tema, y evitan cachear respuestas.

## Rendimiento

- `InstancedMesh` y buffers reutilizados evitan un draw call por glifo.
- El atlas se reconstruye únicamente al cambiar familia o conjunto de glifos.
- Las texturas anteriores se liberan después de cada reconstrucción.
- Tweakpane se carga de forma diferida; el chunk inicial bajó 152.59 kB minificados (884.24 → 731.65 kB).
- El límite de 60 000 glifos protege memoria GPU y costo por frame.

## Decisiones pendientes

- Three.js sigue dominando el bundle principal porque el exportador serializa el mismo motor y necesita el namespace `THREE`. Separarlo en un paquete de motor compartido podría reducir más el cliente, pero requiere rediseñar el contrato del HTML exportado y no es una limpieza segura.
