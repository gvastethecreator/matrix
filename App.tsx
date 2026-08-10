import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Config } from './types';
import ParticleCanvas from './components/ParticleCanvas';
import { generateStandaloneHtml } from './utils/exportHtml';
import { initialConfig } from './config/initialConfig';
import { presets } from './config/presets';
import { generateRandomConfig } from './utils/random';
import { geminiService } from './services/geminiService';

const TweakpanePanel = React.lazy(() => import('./components/TweakpanePanel'));

const copyText = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.warn('Clipboard API export failed, trying legacy copy.', error);
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
};

const App: React.FC = () => {
  // Cargar config inicial de localStorage si existe con sanitización profunda
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('matrix_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...initialConfig, ...parsed };

        // Sanitizar campos numéricos críticos para evitar que valores inválidos desactiven el renderizador
        if (typeof merged.numColumns !== 'number' || merged.numColumns <= 0)
          merged.numColumns = initialConfig.numColumns;
        if (typeof merged.fontSize !== 'number' || merged.fontSize <= 0) merged.fontSize = initialConfig.fontSize;
        if (typeof merged.perspective !== 'number' || merged.perspective <= 0)
          merged.perspective = initialConfig.perspective;
        if (typeof merged.minSpeed !== 'number' || merged.minSpeed < 0) merged.minSpeed = initialConfig.minSpeed;
        if (typeof merged.maxSpeed !== 'number' || merged.maxSpeed <= 0) merged.maxSpeed = initialConfig.maxSpeed;
        if (typeof merged.maxTrailLength !== 'number' || merged.maxTrailLength <= 0)
          merged.maxTrailLength = initialConfig.maxTrailLength;
        if (typeof merged.minTrailLength !== 'number' || merged.minTrailLength <= 0)
          merged.minTrailLength = initialConfig.minTrailLength;
        if (typeof merged.characterSpacing !== 'number' || merged.characterSpacing <= 0)
          merged.characterSpacing = initialConfig.characterSpacing;

        // Sanitizar colores
        if (!merged.glyphColor || typeof merged.glyphColor !== 'string') merged.glyphColor = initialConfig.glyphColor;
        if (!merged.leaderColor || typeof merged.leaderColor !== 'string')
          merged.leaderColor = initialConfig.leaderColor;
        if (!merged.backgroundColor || typeof merged.backgroundColor !== 'string')
          merged.backgroundColor = initialConfig.backgroundColor;

        return merged;
      } catch {
        return initialConfig;
      }
    }
    return initialConfig;
  });

  const [isUiVisible, setIsUiVisible] = useState(true);
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success' | 'downloaded' | 'error'>('idle');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  // Persistir cambios
  useEffect(() => {
    localStorage.setItem('matrix_config', JSON.stringify(config));
  }, [config]);

  const applyPreset = useCallback((presetName: string) => {
    if (presets[presetName]) {
      setConfig((prev) => ({ ...prev, ...presets[presetName], preset: presetName }));
    }
  }, []);

  const presetNames = useMemo(() => Object.keys(presets), []);

  const randomizeConfig = useCallback(() => {
    setConfig(generateRandomConfig());
  }, []);

  const handleGenerateAiGlyphs = useCallback(async (theme: string) => {
    setIsAiGenerating(true);
    setAiError(null);
    try {
      const glyphs = await geminiService.generateThematicGlyphs(theme);
      setConfig((prev) => ({
        ...prev,
        glyphSet: 'custom',
        customGlyphSet: glyphs,
      }));
    } catch (error) {
      console.warn('AI generation unavailable:', error);
      setAiError(error instanceof Error ? error.message : 'No se pudieron generar los glifos.');
    } finally {
      setIsAiGenerating(false);
    }
  }, []);

  const handleCopyHtml = useCallback(async () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    setCopyState('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const html = generateStandaloneHtml(config);

      if (await copyText(html)) {
        setCopyState('success');
      } else {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `matrix-digital-rain-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setCopyState('downloaded');
      }

      copyResetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      setCopyState('error');
      copyResetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    }
  }, [config]);

  const Icons = {
    Settings: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    EyeOff: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24L2 2l20 20" />
      </svg>
    ),
    Download: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
    ),
    Check: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-mono selection:bg-green-500/30">
      <div className="absolute inset-0 z-0">
        <ParticleCanvas config={config} />
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-10'}`}
      >
        <React.Suspense fallback={null}>
          <TweakpanePanel
            config={config}
            setConfig={setConfig}
            applyPreset={applyPreset}
            presetNames={presetNames}
            randomizeConfig={randomizeConfig}
            onAiGenerate={handleGenerateAiGlyphs}
            isAiLoading={isAiGenerating}
          />
        </React.Suspense>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95">
        <button
          onClick={() => setIsUiVisible(!isUiVisible)}
          aria-label={isUiVisible ? 'Ocultar controles' : 'Mostrar controles'}
          className="p-3 rounded-full hover:bg-white/10 text-white/70 transition-colors"
          title="Toggle Controls"
        >
          {isUiVisible ? <Icons.EyeOff /> : <Icons.Settings />}
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <button
          onClick={handleCopyHtml}
          disabled={copyState !== 'idle'}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300
            ${copyState === 'idle' ? 'bg-white text-black hover:bg-green-400 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''}
            ${copyState === 'loading' ? 'bg-zinc-800 text-zinc-500 cursor-wait' : ''}
            ${copyState === 'success' ? 'bg-green-600 text-white' : ''}
            ${copyState === 'downloaded' ? 'bg-blue-600 text-white' : ''}
            ${copyState === 'error' ? 'bg-red-600 text-white' : ''}
          `}
          aria-live="polite"
        >
          {copyState === 'idle' && (
            <>
              <Icons.Download />
              <span>Export HTML</span>
            </>
          )}
          {copyState === 'loading' && <span>Processing...</span>}
          {copyState === 'success' && (
            <>
              <Icons.Check />
              <span>Copied!</span>
            </>
          )}
          {copyState === 'downloaded' && (
            <>
              <Icons.Check />
              <span>Downloaded</span>
            </>
          )}
          {copyState === 'error' && <span>Error</span>}
        </button>
      </div>

      {!isUiVisible && (
        <div className="fixed top-8 left-8 z-40 text-[10px] text-white/20 uppercase tracking-[0.3em] pointer-events-none">
          Stealth Mode Active
        </div>
      )}

      {isAiGenerating && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            <span className="text-xs uppercase tracking-[0.2em] text-green-500 animate-pulse">
              Decrypting AI Sequence...
            </span>
          </div>
        </div>
      )}

      {aiError && (
        <div
          className="fixed bottom-24 left-1/2 z-[70] max-w-[min(90vw,32rem)] -translate-x-1/2 rounded-lg border border-red-500/40 bg-red-950/95 px-4 py-3 text-sm text-red-100 shadow-2xl"
          role="alert"
        >
          <span>{aiError}</span>
          <button className="ml-4 font-bold text-white underline" onClick={() => setAiError(null)}>
            Cerrar
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
