# Utilidades

- `exportHtml.ts`: genera un documento HTML autónomo con la configuración actual y el motor serializado. Mantiene Three.js fijado a r185 para no desalinearse del editor.
- `random.ts`: helpers puros de selección, números, colores y configuración aleatoria.

El motor de animación vive en `components/ParticleCanvas.tsx` porque comparte el ciclo de vida del canvas y también expone la representación serializable usada por el exportador.
