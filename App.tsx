import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Config } from './types';
import ParticleCanvas from './components/ParticleCanvas';
import engineSource from './engine/matrixRain.js?raw';
import { applyPreset, UI_VISIBLE_STORAGE_KEY } from './config/configState';
import { presets } from './config/presets';
import { generateStandaloneHtml } from './utils/exportHtml';
import { generateRandomConfig } from './utils/random';
import { decideExportDelivery, downloadExportFilename } from './utils/exportDelivery';
import { createPersistScheduler, loadConfig } from './utils/persist';
import {
  customGlyphNotice,
  isPanelToggleKey,
  panelFallbackLabel,
  persistErrorMessage,
  readUiVisible,
} from './utils/editorUx';
import { readRevealImage } from './utils/revealImage';

const TweakpanePanel = React.lazy(() => import('./components/TweakpanePanel'));

// Controls fade out after this long without input, unless the pointer or focus is inside the panel.
const IDLE_MS = 2500;

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const triggerDownload = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Icons = {
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Collapse: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const App: React.FC = () => {
  const [persistError, setPersistError] = useState<string | null>(null);
  const [backend, setBackend] = useState<string | null>(null);
  const persist = useMemo(
    () =>
      createPersistScheduler(window.localStorage, {
        onResult: (result) => {
          setPersistError(result.ok ? null : persistErrorMessage);
        },
      }),
    [],
  );
  const [config, setConfig] = useState<Config>(() => loadConfig(window.localStorage));
  const [isUiVisible, setIsUiVisible] = useState(() =>
    readUiVisible(window.localStorage.getItem(UI_VISIBLE_STORAGE_KEY)),
  );
  const [idle, setIdle] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success' | 'downloaded' | 'error'>('idle');
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      persist.flush();
    },
    [persist],
  );

  useEffect(() => {
    persist.push(config);
  }, [config, persist]);

  useEffect(() => {
    try {
      window.localStorage.setItem(UI_VISIBLE_STORAGE_KEY, String(isUiVisible));
    } catch {
      setPersistError(persistErrorMessage);
    }
  }, [isUiVisible]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isPanelToggleKey(event)) return;
      event.preventDefault();
      setIsUiVisible((visible) => !visible);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const panel = panelRef.current;
        if (panel?.matches(':hover') || panel?.contains(document.activeElement)) wake();
        else setIdle(true);
      }, IDLE_MS);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;
    events.forEach((name) => window.addEventListener(name, wake, { passive: true }));
    wake();
    return () => {
      clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, wake));
    };
  }, []);

  const applyNamedPreset = useCallback((presetName: string) => {
    setConfig((prev) => applyPreset(prev, presetName));
  }, []);

  const presetNames = useMemo(() => Object.keys(presets), []);

  const randomizeConfig = useCallback(() => {
    setConfig(generateRandomConfig());
  }, []);

  const pickRevealImage = useCallback(() => imageInputRef.current?.click(), []);

  const onRevealImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const revealImage = await readRevealImage(file);
      setConfig((prev) => ({ ...prev, revealSource: 'image', revealImage }));
    } catch {
      setPersistError('No se pudo leer la imagen.');
    }
  }, []);

  const handleCopyHtml = useCallback(async () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    setCopyState('loading');
    try {
      const html = generateStandaloneHtml(config, engineSource);
      const delivery = decideExportDelivery(await copyText(html), Date.now());

      if (delivery.kind === 'copied') {
        setCopyState('success');
      } else {
        triggerDownload(html, delivery.filename);
        setCopyState('downloaded');
      }

      copyResetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      setCopyState('error');
      copyResetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    }
  }, [config]);

  const handleDownloadHtml = useCallback(() => {
    const html = generateStandaloneHtml(config, engineSource);
    triggerDownload(html, downloadExportFilename(Date.now()));
  }, [config]);

  const charsetNotice = customGlyphNotice(config);
  const fade = `transition-opacity duration-500 ${idle ? 'opacity-0' : 'opacity-100'}`;

  return (
    <main
      className={`relative h-screen w-screen overflow-hidden bg-black font-mono text-white ${idle ? 'cursor-none' : ''}`}
    >
      <div className="absolute inset-0 z-0">
        <ParticleCanvas config={config} onBackend={setBackend} />
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onRevealImage} />

      {!isUiVisible && (
        <button
          onClick={() => setIsUiVisible(true)}
          aria-label="Mostrar controles (H)"
          title="Mostrar controles (H)"
          className={`fixed top-4 right-4 z-40 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/60 backdrop-blur-md hover:bg-white/10 hover:text-white ${fade}`}
        >
          <Icons.Settings />
        </button>
      )}

      <aside
        ref={panelRef}
        aria-label="Controles de Matrix"
        inert={!isUiVisible}
        className={`fixed inset-y-0 right-0 z-30 flex w-80 max-w-[90vw] flex-col border-l border-white/10 bg-black/70 backdrop-blur-xl transition-[translate,opacity] duration-300 ease-out ${isUiVisible ? 'translate-x-0' : 'translate-x-full'} ${idle ? 'opacity-0' : 'opacity-100'}`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-[11px] tracking-[0.35em] text-white/70 uppercase">Matrix</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-white/15 px-1.5 text-[10px] text-white/40">H</kbd>
            <button
              onClick={() => setIsUiVisible(false)}
              aria-label="Ocultar controles (H)"
              title="Ocultar controles (H)"
              className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Icons.Collapse />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="px-4 py-3 text-xs tracking-widest text-white/60 uppercase" role="status">
                {panelFallbackLabel}
              </div>
            }
          >
            <TweakpanePanel
              config={config}
              setConfig={setConfig}
              applyPreset={applyNamedPreset}
              presetNames={presetNames}
              randomizeConfig={randomizeConfig}
              pickRevealImage={pickRevealImage}
            />
          </React.Suspense>
        </div>

        <footer className="flex items-center gap-2 border-t border-white/10 p-3">
          <button
            onClick={handleCopyHtml}
            disabled={copyState !== 'idle'}
            aria-live="polite"
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-colors ${
              copyState === 'idle' ? 'bg-white text-black hover:bg-white/80' : 'bg-white/10 text-white/70'
            } ${copyState === 'error' ? 'text-red-300' : ''}`}
          >
            {copyState === 'idle' && (
              <>
                <Icons.Download />
                <span>Export HTML</span>
              </>
            )}
            {copyState === 'loading' && <span>Processing...</span>}
            {(copyState === 'success' || copyState === 'downloaded') && (
              <>
                <Icons.Check />
                <span>{copyState === 'success' ? 'Copied!' : 'Downloaded'}</span>
              </>
            )}
            {copyState === 'error' && <span>Error</span>}
          </button>
          <button
            onClick={handleDownloadHtml}
            className="rounded-md bg-white/10 px-3 py-2 text-[11px] font-bold tracking-widest uppercase hover:bg-white/20"
          >
            Descargar
          </button>
          {backend && <span className="text-[9px] tracking-[0.2em] text-white/35 uppercase">{backend}</span>}
        </footer>
      </aside>

      {charsetNotice && (
        <div className="fixed top-8 left-1/2 z-40 max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-lg border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-sm text-amber-100">
          {charsetNotice}
        </div>
      )}

      {persistError && (
        <div
          className="fixed bottom-8 left-1/2 z-[70] max-w-[min(90vw,32rem)] -translate-x-1/2 rounded-lg border border-amber-500/40 bg-amber-950/95 px-4 py-3 text-sm text-amber-100 shadow-2xl"
          role="alert"
        >
          <span>{persistError}</span>
          <button className="ml-4 font-bold text-white underline" onClick={() => setPersistError(null)}>
            Cerrar
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
