# Arquitectura

## Flujo principal

1. `index.tsx` monta `App` y carga el CSS generado por Tailwind.
2. `App.tsx` carga y persiste `matrix_config` a través de la política de configuración, mantiene el estado y delega el render a `ParticleCanvas`.
3. `ParticleCanvas` conserva un controlador Three.js entre renders. Los cambios ordinarios actualizan uniformes. Atlas y streams se reconstruyen con debounce solo cuando el predicado estructural lo pide.
4. `TweakpanePanel` se descarga como chunk separado y modifica el estado mediante callbacks estables.
5. La exportación incrusta `getAnimationLogicString()`, un texto del motor donde `THREE` es un parámetro. El minificador no puede reescribir esos identificadores porque no salen de `Function#toString()`.

## Módulos de política

La validación y el cálculo que el editor y las pruebas comparten viven detrás de pocas interfaces:

- Combinar, sanear y aplicar presets.
- Resolver charset, movimiento, color y presupuesto de glifos.
- Persistencia con debounce y omisión de escrituras iguales.
- Entrega del HTML (copiar o descargar).

## Rendimiento

- `InstancedMesh` y buffers reutilizados evitan un draw call por glifo.
- El atlas se reconstruye al cambiar charset, familia, peso o tamaño de fuente.
- Las texturas anteriores se liberan después de cada reconstrucción.
- La persistencia agrupa escrituras; la animación se pausa con la pestaña oculta.
- El límite de 60 000 glifos recorta columnas antes de crear streams.
- Tweakpane se carga de forma diferida. La fuente de exportación se construye al exportar, no al importar el canvas.

## Decisiones pendientes

- Three.js sigue dominando el bundle principal porque el exportador serializa el mismo motor y necesita el namespace `THREE`. Separarlo en un paquete de motor compartido podría reducir más el cliente, pero requiere rediseñar el contrato del HTML exportado y no es una limpieza segura.
