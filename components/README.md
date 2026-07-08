# Componentes de la Aplicación

Esta carpeta contiene los componentes de React que construyen la interfaz de usuario.

## `ParticleCanvas.tsx`

Componente wrapper que conecta React con la lógica imperativa de Three.js.
- Mantiene el ciclo de vida del canvas.
- Utiliza `utils/animationLogic.ts` para renderizar la escena.

## `TweakpanePanel.tsx`

Panel de control flotante generado con `tweakpane`.
- **Features**: Binding bidireccional, presets, botón de reset, drag & drop del panel.
- **Refactor**: Se ha aislado la lógica de estado mutable para evitar re-renders innecesarios en React mientras se manipulan los sliders.

## ⚠️ Archivos Deprecados

Los siguientes archivos han sido identificados como innecesarios o vacíos durante la auditoría y **deben ser eliminados** para mantener limpio el proyecto:
- `simplex.ts`: No utilizado en la implementación actual.