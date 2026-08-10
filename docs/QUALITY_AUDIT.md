# Auditoría de calidad — 2026-08-09

## Diez pasadas

1. **Operación:** npm se reemplazó por pnpm y el lockfile es reproducible.
2. **Dependencias:** versiones directas actualizadas y sin pendientes en `pnpm outdated`.
3. **Seguridad:** la clave Gemini dejó de compilarse en el navegador.
4. **Arquitectura:** cliente, handler IA y servidor de producción tienen límites explícitos.
5. **Rendimiento:** panel en chunk diferido y textura anterior liberada al regenerar atlas.
6. **Código muerto:** retirados `Controls`, `MatrixCanvas`, `constants.ts` y sus tipos legacy.
7. **Comportamiento:** efectos no implementados dejaron de anunciarse; attract, swirl y splash funcionan.
8. **UX:** fallo de IA visible y descartable; exportación muestra estado de descarga y etiquetas accesibles.
9. **Tooling:** TypeScript, Oxlint, Oxfmt, Knip, pruebas y build forman un solo gate.
10. **Documentación:** README, PRD, diario, arquitectura, dependencias, tareas y `.gitignore` reflejan el estado real.

## Autopsia

- **Fallo encontrado:** la configuración de Vite sustituía `process.env.API_KEY` por `GEMINI_API_KEY`, exponiendo el secreto en el JS del navegador. **Causa:** scaffold client-only de AI Studio. **Prevención:** endpoint same-origin y prueba que comprueba que la clave no aparece en la respuesta.
- **Fallo encontrado:** el selector ofrecía diez efectos sin implementación. **Causa:** contrato UI más amplio que el motor. **Prevención:** opciones derivadas del tipo soportado y ramas implementadas para cada valor visible.
- **Fallo encontrado:** cada regeneración de atlas abandonaba una textura GPU. **Causa:** reemplazo sin `dispose`. **Prevención:** conservar y liberar la textura anterior después del swap.
- **Fallo encontrado:** el repositorio contenía dos implementaciones visuales antiguas y tipos creados solo para compilarlas. **Causa:** refactor incompleto. **Prevención:** búsqueda de consumidores antes de eliminar y lint sin valores muertos.
- **Fallo encontrado:** npm y dependencias CDN hacían el build no reproducible. **Causa:** mezcla de scaffold y paquete local. **Prevención:** una sola fuente de versiones: `package.json` + `pnpm-lock.yaml`.

## Evidencia

- `pnpm typecheck`: pasa con TypeScript 7.0.2.
- `pnpm lint`: pasa sin diagnósticos.
- `pnpm test`: 3/3 pruebas pasan.
- `pnpm build`: pasa con Vite 8.2.1.
- Chromium real: 1440×900 y 390×844, un canvas principal, ancho del documento igual al viewport, sin errores de página/consola, panel y exportación visibles, alternancia Stealth operativa y error Gemini sin clave mostrado mediante `role="alert"`.
