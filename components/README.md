# Componentes

- `ParticleCanvas.tsx`: contiene el motor Three.js y su wrapper React. Crea un único canvas, responde a `ResizeObserver`, actualiza la simulación sin remontarla y libera texturas, geometrías, materiales, listeners y contexto WebGL al desmontarse.
- `TweakpanePanel.tsx`: crea el panel una vez y sincroniza valores/callbacks mediante referencias para evitar reconstrucciones durante el uso de sliders. Se carga de forma diferida desde `App.tsx`.

No quedan componentes heredados ni implementaciones Canvas 2D paralelas.
