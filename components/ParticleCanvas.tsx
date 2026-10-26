import React, { useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu';
import type { Config } from '../types.ts';
import { getAnimationLogicString } from '../utils/exportEngine.ts';

type EngineController = {
  update: (newConfig: Config) => void;
  destroy: () => void;
  resize: (w: number, h: number) => void;
  ready: Promise<string | null>;
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
  onBackend: (backend: string) => void;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ config, onBackend }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationController = useRef<EngineController | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 w-full h-full block';
    container.replaceChildren(canvas);

    const controller = runBoundEngine(canvas, config);
    animationController.current = controller;
    void controller.ready.then((backend) => {
      if (backend) onBackend(backend);
    });

    return () => {
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
