import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Config } from './types';
import ParticleCanvas from './components/ParticleCanvas';
import { getAnimationLogicString } from './utils/exportEngine';
import { applyPreset, UI_VISIBLE_STORAGE_KEY } from './config/configState';
import { presets } from './config/presets';
import { generateStandaloneHtml } from './utils/exportHtml';
import { generateRandomConfig } from './utils/random';
import { decideExportDelivery, downloadExportFilename } from './utils/exportDelivery';
import { createPersistScheduler, loadConfig } from './utils/persist';
import {
  customGlyphNotice,
  panelFallbackLabel,
  persistErrorMessage,
  readUiVisible,
  stealthPressed,
  toggleStealth,
  writeUiVisible,
} from './utils/editorUx';

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
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success' | 'downloaded' | 'error'>('idle');
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      window.localStorage.setItem(UI_VISIBLE_STORAGE_KEY, writeUiVisible(isUiVisible));
    } catch {
      setPersistError(persistErrorMessage);
    }
  }, [isUiVisible]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsUiVisible((visible) => toggleStealth(visible));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const applyNamedPreset = useCallback((presetName: string) => {
    setConfig((prev) => applyPreset(prev, presetName));
  }, []);

  const presetNames = useMemo(() => Object.keys(presets), []);

  const randomizeConfig = useCallback(() => {
    setConfig(generateRandomConfig());
  }, []);

  const handleCopyHtml = useCallback(async () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    setCopyState('loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const html = generateStandaloneHtml(config, getAnimationLogicString());
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
    const html = generateStandaloneHtml(config, getAnimationLogicString());
    triggerDownload(html, downloadExportFilename(Date.now()));
  }, [config]);

  const charsetNotice = customGlyphNotice(config);

  const Icons = {
    Settings: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    EyeOff: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 -4.24 -4.24M2 2l20 20" />
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
        <ParticleCanvas config={config} onBackend={setBackend} />
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-10'}`}
      >
        <React.Suspense
          fallback={
            <div
              className="fixed top-4 right-4 z-30 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-xs uppercase tracking-widest text-white/70"
              role="status"
            >
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
          />
        </React.Suspense>
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95">
        <button
          onClick={() => setIsUiVisible((visible) => toggleStealth(visible))}
          aria-label={isUiVisible ? 'Ocultar controles' : 'Mostrar controles'}
          aria-pressed={stealthPressed(isUiVisible)}
          className="rounded-full p-3 text-white/70 transition-colors hover:bg-white/10"
          title="Toggle Controls"
        >
          {isUiVisible ? <Icons.EyeOff /> : <Icons.Settings />}
        </button>

        <div className="mx-1 h-6 w-px bg-white/10"></div>

        <button
          onClick={handleCopyHtml}
          disabled={copyState !== 'idle'}
          className={`
            flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300
            ${copyState === 'idle' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-green-400' : ''}
            ${copyState === 'loading' ? 'cursor-wait bg-zinc-800 text-zinc-500' : ''}
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

        <button
          onClick={handleDownloadHtml}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-white/20"
        >
          Descargar HTML
        </button>
      </div>

      {!isUiVisible && (
        <div className="pointer-events-none fixed top-8 left-8 z-40 text-[10px] tracking-[0.3em] text-white/20 uppercase">
          Stealth Mode Active
        </div>
      )}

      {backend && isUiVisible && (
        <div className="pointer-events-none fixed bottom-9 left-6 z-40 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] tracking-[0.25em] text-white/50 uppercase backdrop-blur-md">
          {backend}
        </div>
      )}

      {charsetNotice && (
        <div className="fixed top-8 left-1/2 z-40 max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-lg border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-sm text-amber-100">
          {charsetNotice}
        </div>
      )}

      {persistError && (
        <div
          className="fixed bottom-40 left-1/2 z-[70] max-w-[min(90vw,32rem)] -translate-x-1/2 rounded-lg border border-amber-500/40 bg-amber-950/95 px-4 py-3 text-sm text-amber-100 shadow-2xl"
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
