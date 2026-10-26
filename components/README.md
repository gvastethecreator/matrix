# Componentes

- `ParticleCanvas.tsx`: conecta React con el motor compartido de `utils/exportEngine.ts`. Crea un único canvas, actualiza su configuración sin remontarlo y destruye el controlador al desmontarse. El motor gestiona el tamaño y libera sus recursos GPU y listeners.
- `TweakpanePanel.tsx`: crea el panel una vez y sincroniza valores/callbacks mediante referencias para evitar reconstrucciones durante el uso de sliders. Se carga de forma diferida desde `App.tsx`.

No quedan componentes heredados ni implementaciones Canvas 2D paralelas.
