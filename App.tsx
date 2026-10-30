import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Config } from './types';
import ParticleCanvas from './components/ParticleCanvas';
import engineSource from './engine/matrixRain.js?raw';
import { applyPreset, UI_VISIBLE_STORAGE_KEY } from './config/configState';
import { generateStandaloneHtml } from './utils/exportHtml';
import { decideExportDelivery, downloadExportFilename } from './utils/exportDelivery';
import { createPersistScheduler, loadConfig } from './utils/persist';
import ControlPanel from './components/ControlPanel';
import { customGlyphNotice, isPanelToggleKey, persistErrorMessage, readUiVisible } from './utils/editorUx';
import { readRevealImage } from './utils/revealImage';

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

// Frames the browser actually presents, sampled twice a second for the status line.
const useFps = () => {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      frames += 1;
      if (now - start >= 500) {
        setFps(Math.round((frames * 1000) / (now - start)));
        frames = 0;
        start = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
};

// Own component so the twice-a-second update re-renders only this label.
const Fps = () => <span>{useFps()} fps</span>;

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
          className={`mx-handle fixed top-4 right-4 z-40 ${fade}`}
        >
          &gt;_
        </button>
      )}

      <aside
        ref={panelRef}
        aria-label="Controles de Matrix"
        inert={!isUiVisible}
        className={`mx-panel fixed inset-y-0 right-0 z-30 flex w-[22rem] max-w-[92vw] flex-col transition-[translate,opacity] duration-300 ease-out ${isUiVisible ? 'translate-x-0' : 'translate-x-full'} ${idle ? 'opacity-0' : 'opacity-100'}`}
      >
        <ControlPanel
          config={config}
          setConfig={setConfig}
          applyPreset={applyNamedPreset}
          pickRevealImage={pickRevealImage}
          onClose={() => setIsUiVisible(false)}
        />

        <footer className="mx-footer">
          <div className="flex gap-2">
            <button
              onClick={handleCopyHtml}
              disabled={copyState !== 'idle'}
              aria-live="polite"
              className="mx-button mx-button-primary flex-1"
            >
              {copyState === 'idle' && '> export html'}
              {copyState === 'loading' && '> compiling...'}
              {copyState === 'success' && '> copied to clipboard'}
              {copyState === 'downloaded' && '> downloaded'}
              {copyState === 'error' && '> error'}
            </button>
            <button onClick={handleDownloadHtml} className="mx-button">
              &gt; descargar
            </button>
          </div>
          <p className="mx-status">
            <span>{backend ?? 'booting'}</span>
            <Fps />
            <span>{config.numColumns} streams</span>
          </p>
        </footer>
      </aside>

      {charsetNotice && (
        <div className="fixed top-8 left-1/2 z-40 max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-md bg-amber-950/90 px-4 py-2 text-sm text-amber-100">
          {charsetNotice}
        </div>
      )}

      {persistError && (
        <div
          className="fixed bottom-8 left-1/2 z-[70] max-w-[min(90vw,32rem)] -translate-x-1/2 rounded-md bg-amber-950/95 px-4 py-3 text-sm text-amber-100"
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
