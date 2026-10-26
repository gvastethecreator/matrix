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

- El motor usa `WebGPURenderer` (`three/webgpu`) y nodos TSL, así que un solo código compila a WGSL en WebGPU y a GLSL en el respaldo WebGL2. `?webgl` fuerza el respaldo. El HTML exportado importa `three.webgpu.js`.
- `InstancedBufferGeometry` dibuja la lluvia en una llamada. Una `DataTexture` de floats guarda ocho números por columna (carril, distancia recorrida, semillas y tono); cada glifo los lee con `textureLoad`, porque WebGPU no tiene divisor de instancias.
- El índice de cada glifo sale de `instanceIndex`. El shader calcula profundidad, longitud, posición, color, carácter, giro, glitch e interacción. Velocidad, longitud y profundidad son uniformes, así que cambiarlas no reconstruye buffers. JavaScript solo avanza la distancia de cada columna por frame.
- La lluvia se acumula en un búfer HDR con mezcla premultiplicada; el fundido multiplica ese búfer. No se usa `MAX` porque el backend WebGL2 de three r185 no traduce `MinEquation`/`MaxEquation`. Después corren seis niveles de bloom (dual filter) y una composición con fondo, aberración, scanlines, viñeta, grano y glitch.
- El mensaje es una máscara de canvas. Una rejilla instanciada dibuja solo las celdas dentro de la máscara, con gotas analíticas por columna.
- El atlas agrupa grafemas Unicode en una cuadrícula con celdas acolchadas. Se reconstruye al cambiar charset, familia o peso; cambiar el tamaño solo modifica un uniforme.
- Las texturas anteriores se liberan después de cada reconstrucción.
- La persistencia agrupa escrituras; la animación se pausa con la pestaña oculta.
- El límite de 1.000.000 de glifos recorta columnas antes de reservar buffers. Es un límite de capacidad, no una garantía de FPS; el tamaño de los glifos y la superposición pueden saturar el llenado de píxeles.
- Movimiento, suavizado del cursor y desvanecimiento usan tiempo transcurrido. Al volver de una pestaña oculta se reinicia el reloj para evitar saltos. Se limita el paso a 50 ms tras una pausa larga.
- Tweakpane se carga de forma diferida. La fuente de exportación se construye al exportar, no al importar el canvas.

## Decisiones pendientes

- Three.js sigue dominando el bundle principal porque el exportador serializa el mismo motor y necesita el namespace `THREE`. Separarlo en un paquete de motor compartido podría reducir más el cliente, pero requiere rediseñar el contrato del HTML exportado y no es una limpieza segura.
