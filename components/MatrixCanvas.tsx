
import React, { useEffect, useRef } from 'react';
import { MatrixConfig, CharSetType } from '../types';
import { CHAR_SETS } from '../constants';

interface MatrixCanvasProps {
  config: MatrixConfig;
}

const MatrixCanvas: React.FC<MatrixCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const charSource = config.charSet === CharSetType.CUSTOM ? config.customChars : CHAR_SETS[config.charSet];
    const fontSize = config.fontSize;
    const columns = Math.ceil(canvas.width / (fontSize * config.density));
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

    const render = () => {
      // Fade out background to create trails
      ctx.fillStyle = `rgba(0, 0, 0, ${config.fadeFactor})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = charSource.charAt(Math.floor(Math.random() * charSource.length));
        
        // Dynamic color styling
        if (config.glow) {
          ctx.shadowBlur = config.bloom;
          ctx.shadowColor = config.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = config.color;

        // Draw character
        const x = i * (fontSize * config.density);
        const y = drops[i] * fontSize;
        
        ctx.fillText(text, x, y);

        // Reset drops when they reach the bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment position based on speed
        drops[i] += config.speed / 10;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [config]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${config.perspective ? 'matrix-perspective' : ''}`}
      style={{
        filter: config.bloom > 0 ? `blur(${config.bloom / 20}px)` : 'none',
      }}
    />
  );
};

export default MatrixCanvas;
