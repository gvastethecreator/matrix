import type { Config } from '../types.ts';
import { THREE_MODULE_VERSION } from '../config/enginePin.ts';

export const generateStandaloneHtml = (config: Config, animationLogicString: string): string => {
  if (!config || typeof config.numColumns !== 'number' || config.numColumns <= 0) {
    return '<!-- ERROR: Configuración inválida. El número de columnas debe ser mayor que cero. -->';
  }

  const fullScript = `
        import * as THREE from 'https://unpkg.com/three@${THREE_MODULE_VERSION}/build/three.module.js';

        const initialConfig = ${JSON.stringify(config)};

        ${animationLogicString}

        window.addEventListener('load', () => {
            const canvas = document.getElementById('matrix-canvas');
            if (canvas) {
                runMatrixAnimation(THREE, canvas, initialConfig);
            } else {
                console.error('Elemento Canvas no encontrado');
            }
        });
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Matrix Digital Rain - ${config.preset || 'Custom'}</title>
    <meta name="description" content="Generated Matrix Digital Rain animation using Three.js">
    <style>
        body { 
            margin: 0; 
            padding: 0;
            overflow: hidden; 
            background-color: ${config.backgroundColor}; 
            cursor: crosshair; 
            user-select: none;
            -webkit-user-select: none;
        }
        canvas { 
            display: block; 
            width: 100vw; 
            height: 100vh; 
        }
    </style>
</head>
<body>
    <canvas id="matrix-canvas"></canvas>
    <!-- Three.js fijado a la misma versión compatible que utiliza el editor. -->
    <script type="module">
        ${fullScript}
    </script>
</body>
</html>`;
};
