# Matrix Playground — alcance de producto

## Objetivo

Ofrecer un editor de lluvia digital de alto rendimiento que permita explorar estilos, interacción y tipografía, y exportar el resultado sin depender del editor.

## Usuarios

- Desarrolladores que necesitan fondos animados.
- Artistas digitales que exploran estética generativa.
- Usuarios que quieren crear y compartir una configuración Matrix propia.

## Capacidades actuales

- Render WebGL con instancias y atlas de glifos.
- Presets, aleatorización y persistencia local.
- Controles de color, tipografía, movimiento, profundidad, rastro e interacción.
- Efectos de cursor `grow`, `attract`, `repel` y `swirl`, más efecto de salida `splash`.
- Glifos temáticos opcionales con Gemini mediante un límite server-side.
- Exportación de HTML autónomo con fallback de descarga si el portapapeles falla.

## Restricciones

- React 19.2, TypeScript 7, Three.js r185, Tailwind CSS 4.3 y Vite 8.
- La experiencia principal funciona sin Gemini; la IA requiere `GEMINI_API_KEY` en el servidor.
- La clave no puede compilarse ni persistirse en el navegador.
- La exportación autónoma usa Three.js desde CDN.
