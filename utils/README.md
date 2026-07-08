# Utilidades y Lógica Core

## `animationLogic.ts`

El núcleo gráfico de la aplicación. Contiene toda la implementación de Three.js.
- **InstancedMesh**: Renderizado de alto rendimiento para miles de glifos.
- **Texture Atlas**: Generación dinámica de texturas de texto para soportar cualquier fuente o set de caracteres unicode.
- **Exportable**: Diseñado para funcionar tanto dentro del entorno React como en un archivo HTML estático (ver `animationLogicString`).

## `exportHtml.ts`

Generador de archivos estáticos. Inyecta la configuración actual y el código fuente de `animationLogic` en una plantilla HTML limpia.

## `random.ts`

Helpers puros para generación procedimental.

## ⚠️ Archivos Deprecados

Los siguientes archivos no tienen uso en la arquitectura actual y se recomienda su eliminación:
- `drawing.ts`
- `math.ts`