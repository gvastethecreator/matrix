# Utilidades

- `exportEngine.ts`: fuente del motor de exportación. `THREE` entra como argumento; el texto no sale de `Function#toString()`.
- `exportHtml.ts`: genera un documento HTML autónomo a partir de la configuración y de la fuente del motor. No importa ParticleCanvas.
- `exportDelivery.ts`: decide copiar o descargar el HTML.
- `persist.ts`: lee y escribe `matrix_config` con debounce.
- `editorUx.ts`: stealth, avisos y validación de tema.
- `random.ts`: helpers puros de selección, números, colores y configuración aleatoria con rangos ordenados.

El canvas ejecuta la misma fuente que el HTML exportado, inyectando el namespace `THREE` del editor.
