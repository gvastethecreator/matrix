# Actualización de dependencias — 2026-09-06

Pasada in-stack sobre pnpm 12. `three` permanece en r185.1 para no desalinearlo del HTML exportado.

| Paquete                |   Antes |  Ahora | Cambio                                                                      |
| ---------------------- | ------: | -----: | --------------------------------------------------------------------------- |
| `packageManager`       | 11.21.0 | 12.0.0 | Corepack alineado con el bump sucio que ya estaba en el árbol. No revertir. |
| `vite`                 |   8.2.1 |  8.2.2 | Parche de Rolldown.                                                         |
| `@vitejs/plugin-react` |   6.0.5 |  6.1.1 | React Refresh actual.                                                       |
| `knip`                 |  6.32.0 | 6.34.0 | Detector de código muerto.                                                  |
| `oxfmt`                |  0.62.0 | 0.66.0 | Formato.                                                                    |
| `oxlint`               |  1.77.0 | 1.81.0 | Lint.                                                                       |
| `@types/node`          |  26.2.0 | 26.4.1 | Tipos Node 26.                                                              |
| `@types/react-dom`     |  19.2.4 | 19.2.7 | Tipos React DOM.                                                            |

## Diferidos

- `three` 0.185.1: el exportador pinnea esta versión. Un salto de major/minor exigiría cambiar `THREE_MODULE_VERSION` y revalidar el HTML autónomo.
- `react` / `react-dom` 19.2.8: ya en la última 19.2 publicada al momento de la pasada.

## Changelogs

- [Vite 8](https://vite.dev/blog/announcing-vite8)
- [plugin React](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md)
- [releases Oxc](https://github.com/oxc-project/oxc/releases)
