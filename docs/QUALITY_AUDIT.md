# Auditoría de calidad — 2026-09-07

## Pasadas

1. **Operación:** pnpm y lockfile reproducibles.
2. **Dependencias:** versiones directas actualizadas en el stack actual.
3. **Arquitectura:** políticas de configuración, charset, movimiento, color y exportación detrás de interfaces comprobables.
4. **Rendimiento:** panel en chunk diferido y textura anterior liberada al regenerar atlas.
5. **Comportamiento:** attract, swirl, splash y grow funcionan.
6. **UX:** exportación muestra estado de descarga y etiquetas accesibles; stealth con teclado.
7. **Tooling:** TypeScript, Oxlint, Oxfmt, Knip, pruebas y build forman un solo gate.
8. **Documentación:** README, PRD, diario, arquitectura, dependencias, tareas y `.gitignore` reflejan el estado real.

## Autopsia

- **Fallo encontrado:** el selector ofrecía diez efectos sin implementación. **Causa:** contrato UI más amplio que el motor. **Prevención:** opciones derivadas del tipo soportado y ramas implementadas para cada valor visible.
- **Fallo encontrado:** cada regeneración de atlas abandonaba una textura GPU. **Causa:** reemplazo sin `dispose`. **Prevención:** conservar y liberar la textura anterior después del swap.
- **Fallo encontrado:** el repositorio contenía dos implementaciones visuales antiguas y tipos creados solo para compilarlas. **Causa:** refactor incompleto. **Prevención:** búsqueda de consumidores antes de eliminar y lint sin valores muertos.
- **Fallo encontrado:** npm y dependencias CDN hacían el build no reproducible. **Causa:** mezcla de scaffold y paquete local. **Prevención:** una sola fuente de versiones: `package.json` + `pnpm-lock.yaml`.

## Evidencia

- `pnpm typecheck`: pasa con TypeScript 7.0.2.
- `pnpm lint`: pasa sin diagnósticos.
- `pnpm test`: suite `node --test` de políticas y exportación.
- `pnpm build`: Vite 8.2.2.
