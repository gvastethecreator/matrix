# Configuración de la Aplicación

Esta carpeta contiene los archivos de configuración y datos estáticos para la simulación "Matrix Digital Rain". Separar estos datos de la lógica de la aplicación mejora la organización y la mantenibilidad.

## `initialConfig.ts`

Define el estado de configuración inicial que se carga cuando la aplicación se inicia por primera vez. Contiene un objeto `Config` completo con valores predeterminados para cada parámetro de la simulación.

## `presets.ts`

Contiene una colección de configuraciones predefinidas (`presets`). Cada preset es un objeto parcial de `Config` que permite cambiar rápidamente la estética de la animación a un estilo específico (ej. "Cyberpunk", "Caída Binaria").

## `constants.ts`

Este archivo centraliza las constantes utilizadas en toda la aplicación. Esto incluye:

- **Conjuntos de Caracteres**: Las cadenas de texto para cada `glyphSet` (Katakana, Binario, ASCII, etc.).
- **Vectores de Dirección**: Mapeo de las direcciones de flujo (`down`, `up`, etc.) a sus vectores `[x, y]`.
- **Opciones de Aleatorización**: Arrays con las opciones disponibles para la aleatorización (familias de fuentes, efectos de mouse, etc.).
