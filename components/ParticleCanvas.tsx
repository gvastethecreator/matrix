import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Config } from '../types.ts';
import { getAnimationLogicString } from '../utils/exportEngine.ts';

type EngineController = {
  update: (newConfig: Config) => void;
  destroy: () => void;
  resize: (w: number, h: number) => void;
};

const bindEngine = new Function(
  'THREE',
  `${getAnimationLogicString()}
  return function runBound(canvas, initialConfig) {
    return runMatrixAnimation(THREE, canvas, initialConfig);
  };`,
) as (three: typeof THREE) => (canvas: HTMLCanvasElement, config: Config) => EngineController;

const runBoundEngine = bindEngine(THREE);

interface ParticleCanvasProps {
  config: Config;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationController = useRef<EngineController | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 w-full h-full block';
    container.replaceChildren(canvas);

    animationController.current = runBoundEngine(canvas, config);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          animationController.current?.resize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      animationController.current?.destroy();
      animationController.current = null;
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (animationController.current) {
      animationController.current.update(config);
    }
  }, [config]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black" />;
};

export default ParticleCanvas;
