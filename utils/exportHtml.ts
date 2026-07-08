import type { Config } from '../types';
import { animationLogicString } from '../components/ParticleCanvas';

/**
 * Genera un archivo HTML autónomo con la animación "Matrix Rain" acelerada por Three.js,
 * basado en la configuración proporcionada.
 * @param config - El objeto de configuración actual de la animación.
 * @returns Una cadena de texto que contiene el documento HTML completo.
 */
export const generateStandaloneHtml = (config: Config): string => {
    if (!config || typeof config.numColumns !== 'number' || config.numColumns <= 0) {
      return '<!-- ERROR: Configuración inválida. El número de columnas debe ser mayor que cero. -->';
    }

    // Inyección segura de la configuración y la lógica.
    // Nota: animationLogicString ya contiene las constantes y la función serializada.
    const fullScript = `
        import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

        // --- Configuración Inicial (Inyectada) ---
        const initialConfig = ${JSON.stringify(config, null, 2)};
        
        // --- Motor de Animación ---
        ${animationLogicString}

        // --- Inicialización ---
        window.addEventListener('load', () => {
            const canvas = document.getElementById('matrix-canvas');
            if (canvas) {
                // Iniciar animación
                runMatrixAnimation(canvas, initialConfig);
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
    <!-- Cargando Three.js desde CDN (versión compatible con la lógica desarrollada) -->
    <script type="module">
        ${fullScript}
    </script>
</body>
</html>`;
};
