# Arquitectura

## Flujo principal

1. `index.tsx` monta `App` y carga el CSS generado por Tailwind.
2. `App.tsx` carga y persiste `matrix_config` a través de la política de configuración, mantiene el estado y delega el render a `ParticleCanvas`.
3. `ParticleCanvas` conserva un controlador Three.js entre renders. Los cambios visuales actualizan uniformes. El motor observa el tamaño del canvas tanto en el editor como en el HTML exportado. Charset/fuente reconstruyen el atlas; densidad, longitud, velocidad y profundidad reconstruyen streams con debounce.
4. `TweakpanePanel` se descarga como chunk separado y modifica el estado mediante callbacks estables.
5. La exportación incrusta `getAnimationLogicString()`, un texto del motor donde `THREE` es un parámetro. El minificador no puede reescribir esos identificadores porque no salen de `Function#toString()`.

## Módulos de política

La validación y el cálculo que el editor y las pruebas comparten viven detrás de pocas interfaces:

- Combinar, sanear y aplicar presets.
- Resolver charset, movimiento, color y presupuesto de glifos.
- Persistencia con debounce y omisión de escrituras iguales.
- Entrega del HTML (copiar o descargar).

## Rendimiento

- `InstancedBufferGeometry` dibuja la lluvia en una llamada. Dos atributos de cuatro números guardan posición, longitud, dirección, velocidad y tono por columna. El divisor de cada atributo comparte estos datos entre todos sus glifos.
- El índice de cada glifo se carga una vez. El shader calcula su posición, color, carácter, giro, glitch e interacción. JavaScript solo recorre las columnas por frame; no crea objetos ni sube matrices por carácter.
- El atlas agrupa grafemas Unicode en una cuadrícula con celdas acolchadas. Se reconstruye al cambiar charset, familia o peso; cambiar el tamaño solo modifica un uniforme.
- Las texturas anteriores se liberan después de cada reconstrucción.
- La persistencia agrupa escrituras; la animación se pausa con la pestaña oculta.
- El límite de 200.000 glifos recorta columnas antes de reservar buffers. Es un límite de capacidad, no una garantía de FPS; el tamaño de los glifos y la superposición pueden saturar el llenado de píxeles.
- Movimiento, suavizado del cursor y desvanecimiento usan tiempo transcurrido. Al volver de una pestaña oculta se reinicia el reloj para evitar saltos. Se limita el paso a 50 ms tras una pausa larga.
- Tweakpane se carga de forma diferida. La fuente de exportación se construye al exportar, no al importar el canvas.

## Decisiones pendientes

- Three.js sigue dominando el bundle principal porque el exportador serializa el mismo motor y necesita el namespace `THREE`. Separarlo en un paquete de motor compartido podría reducir más el cliente, pero requiere rediseñar el contrato del HTML exportado y no es una limpieza segura.
