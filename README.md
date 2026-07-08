# Proyecto: Matrix Digital Rain Interactivo

Este proyecto es una implementación avanzada y altamente configurable del icónico efecto "Matrix Digital Rain", construido con React, TypeScript y Three.js para un renderizado de alto rendimiento acelerado por GPU.

## Características Principales

- **Renderizado con Three.js**: Utiliza WebGL a través de Three.js para animar miles de glifos de manera fluida, incluso en configuraciones de alta densidad.
- **Alta Configurabilidad**: Un panel de control flotante, creado con `Tweakpane`, permite modificar en tiempo real docenas de parámetros.
- **Interactividad con el Mouse**: La lluvia de glifos reacciona al movimiento del cursor con una variedad de efectos personalizables (ondas, vórtices, explosiones, etc.).
- **Presets y Aleatorización**: Incluye varios presets estéticos y una función para generar configuraciones completamente nuevas al azar.
- **Exportación a HTML**: Permite generar un único archivo HTML autónomo que contiene la animación con la configuración actual, listo para ser compartido o incrustado en cualquier lugar.

## Auditoría y Salud del Proyecto (Mayo 2024)

Este proyecto ha sido sometido a una auditoría completa para asegurar su calidad, mantenibilidad y robustez. Las mejoras clave incluyen:

-   **Limpieza de Código**: Se han eliminado componentes no utilizados y se ha limpiado la base del código para mejorar la claridad.
-   **Documentación Exhaustiva**: Se ha documentado en profundidad la lógica central de la animación, los tipos de datos y la estructura de los componentes para facilitar el mantenimiento y la extensibilidad.
-   **Robustez Mejorada**: Se ha fortalecido la funcionalidad de exportación a HTML para prevenir errores comunes, asegurando que las animaciones generadas sean siempre fieles a la configuración.
-   **Coherencia y Mejores Prácticas**: Se ha verificado que todo el proyecto sigue las mejores prácticas de desarrollo con React, TypeScript y Three.js.

## Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas principales:

-   **/src**: Contiene todo el código fuente de la aplicación.
    -   **/components**: Componentes de React que conforman la interfaz de usuario (`ParticleCanvas`, `TweakpanePanel`).
    -   **/config**: Archivos de configuración estática, incluyendo la configuración inicial, presets y constantes.
    -   **/utils**: Módulos con lógica reutilizable, como la lógica principal de la animación, funciones de aleatorización y el generador de HTML.
-   **index.html**: El punto de entrada de la aplicación.
-   **index.tsx**: El punto de montaje de la aplicación React.

## Principios de Diseño

-   **Separación de Responsabilidades**: La lógica de estado (React), la lógica de renderizado (Three.js) y la configuración (Tweakpane) están encapsuladas en sus respectivos módulos.
-   **Rendimiento**: El uso de `InstancedMesh` en Three.js es clave para renderizar un gran número de objetos con un bajo costo de rendimiento.
-   **Mantenibilidad**: Se ha extraído la lógica central de la animación a un único módulo (`utils/animationLogic.ts`) para evitar la duplicación de código y facilitar futuras actualizaciones.