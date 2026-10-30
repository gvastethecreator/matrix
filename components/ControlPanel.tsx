import React, { useEffect, useId, useState } from 'react';
import type { Config } from '../types';
import { factoryConfig } from '../config/configState';
import { GLYPH_SET_TABLE, palettes } from '../config/constants';
import { paletteNames, sections, type Control } from '../config/controls';
import { initialConfig } from '../config/initialConfig';
import { presets } from '../config/presets';

type SetConfig = React.Dispatch<React.SetStateAction<Config>>;

interface ControlPanelProps {
  config: Config;
  setConfig: SetConfig;
  applyPreset: (name: string) => void;
  randomizeConfig: () => void;
  pickRevealImage: () => void;
  onClose: () => void;
}

const SCRAMBLE = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01234589Z:.=*+<>';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Resolves text out of random glyphs, like the rain settling into a word.
const useDecode = (text: string) => {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (reducedMotion()) {
      setShown(text);
      return;
    }
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const settled = Math.floor(frame / 2);
      setShown(
        Array.from(text, (char, i) =>
          i < settled || char === ' ' ? char : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)],
        ).join(''),
      );
      if (settled < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return shown;
};

const Decoded: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <span className={className} aria-label={text}>
    <span aria-hidden="true">{useDecode(text)}</span>
  </span>
);

const words = (value: string) => value.replace(/-/g, ' ');
const decimals = (step: number) => (step >= 1 ? 0 : (String(step).split('.')[1]?.length ?? 2));

const ARROWS: Record<string, string> = {
  'up-left': '↖',
  up: '↑',
  'up-right': '↗',
  left: '←',
  right: '→',
  'down-left': '↙',
  down: '↓',
  'down-right': '↘',
};
const COMPASS = ['up-left', 'up', 'up-right', 'left', null, 'right', 'down-left', 'down', 'down-right'] as const;

const Field: React.FC<{ control: Control; config: Config; setConfig: SetConfig; pickRevealImage: () => void }> = ({
  control,
  config,
  setConfig,
  pickRevealImage,
}) => {
  const id = useId();
  const set = <K extends keyof Config>(key: K, value: Config[K]) => setConfig((prev) => ({ ...prev, [key]: value }));

  switch (control.kind) {
    case 'range': {
      const value = config[control.key];
      const fill = ((value - control.min) / (control.max - control.min)) * 100;
      return (
        <div className="mx-row">
          <label htmlFor={id} className="mx-label">
            {control.label}
          </label>
          <input
            id={id}
            type="range"
            className="mx-range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value}
            style={{ '--fill': `${Math.min(100, Math.max(0, fill))}%` } as React.CSSProperties}
            title="Double-click to reset"
            onChange={(event) => set(control.key, Number(event.target.value))}
            onDoubleClick={() => set(control.key, initialConfig[control.key])}
          />
          <output htmlFor={id} className="mx-value">
            {value.toFixed(decimals(control.step))}
          </output>
        </div>
      );
    }
    case 'toggle':
      return (
        <label className="mx-row mx-toggle">
          <span className="mx-label">{control.label}</span>
          <input
            type="checkbox"
            checked={config[control.key]}
            onChange={(event) => set(control.key, event.target.checked)}
          />
          <span className="mx-switch" aria-hidden="true">
            {config[control.key] ? '[■] ON' : '[ ] OFF'}
          </span>
        </label>
      );
    case 'choice':
      return (
        <fieldset className="mx-block">
          <legend className="mx-label">{control.label}</legend>
          <div className="mx-chips">
            {control.options.map((option) => (
              <label key={option} className="mx-chip">
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={config[control.key] === option}
                  onChange={() => set(control.key, option as never)}
                />
                <span>{words(option)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    case 'select':
      return (
        <div className="mx-row">
          <label htmlFor={id} className="mx-label">
            {control.label}
          </label>
          <select
            id={id}
            className="mx-input mx-select"
            value={config[control.key]}
            onChange={(event) => set(control.key, event.target.value as never)}
          >
            {control.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    case 'color':
      return (
        <div className="mx-row">
          <label htmlFor={id} className="mx-label">
            {control.label}
          </label>
          <input
            id={id}
            type="color"
            className="mx-color"
            value={config[control.key]}
            onChange={(event) => set(control.key, event.target.value as never)}
          />
          <span className="mx-value">{config[control.key]}</span>
        </div>
      );
    case 'text':
      return (
        <div className="mx-block">
          <label htmlFor={id} className="mx-label">
            {control.label}
          </label>
          {control.multiline ? (
            <textarea
              id={id}
              rows={2}
              className="mx-input"
              placeholder={control.placeholder}
              value={config[control.key]}
              onChange={(event) => set(control.key, event.target.value as never)}
            />
          ) : (
            <div className="mx-prompt">
              <span aria-hidden="true">&gt;</span>
              <input
                id={id}
                className="mx-input"
                placeholder={control.placeholder}
                value={config[control.key]}
                onChange={(event) => set(control.key, event.target.value as never)}
              />
            </div>
          )}
        </div>
      );
    case 'palette':
      return (
        <fieldset className="mx-block">
          <legend className="mx-label">Palette</legend>
          <div className="mx-palettes">
            {paletteNames.map((name) => (
              <label key={name} className="mx-palette">
                <input type="radio" name={id} checked={config.palette === name} onChange={() => set('palette', name)} />
                <span className="mx-swatches" aria-hidden="true">
                  {palettes[name].map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                <span>{name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    case 'direction':
      return (
        <fieldset className="mx-block">
          <legend className="mx-label">Flow</legend>
          <div className="mx-compass">
            {COMPASS.map((direction, i) =>
              direction ? (
                <label key={direction} className="mx-chip" title={direction}>
                  <input
                    type="radio"
                    name={id}
                    aria-label={direction}
                    checked={config.streamDirection === direction}
                    onChange={() => set('streamDirection', direction)}
                  />
                  <span>{ARROWS[direction]}</span>
                </label>
              ) : (
                <span key={i} className="mx-compass-core" aria-hidden="true">
                  ◉
                </span>
              ),
            )}
          </div>
        </fieldset>
      );
    case 'image':
      return (
        <div className="mx-block">
          <span className="mx-label">Image</span>
          <div className="mx-image">
            {config.revealImage ? <img src={config.revealImage} alt="Reveal source" /> : <span>no signal</span>}
            <button type="button" className="mx-button" onClick={pickRevealImage}>
              &gt; load image
            </button>
          </div>
        </div>
      );
  }
};

const glyphSample = (preset: Config) => {
  const glyphs = Array.from(
    preset.glyphSet === 'custom' ? preset.customGlyphSet || '01' : GLYPH_SET_TABLE[preset.glyphSet],
  );
  return Array.from({ length: 7 }, (_, i) => glyphs[(i * 5) % glyphs.length]);
};

const sampleColor = (preset: Config, i: number, count: number) => {
  if (i === count - 1) return preset.leaderColor;
  if (preset.colorMode === 'palette') return palettes[preset.palette][i % 3];
  if (preset.colorMode === 'rainbow-stream') return `hsl(${(i * 360) / count}, 85%, 55%)`;
  if (preset.colorMode === 'screen-gradient') return `hsl(${(i * 250) / count}, 80%, 50%)`;
  return preset.glyphColor;
};

const PresetCard: React.FC<{ name: string; active: boolean; onApply: () => void }> = ({ name, active, onApply }) => {
  const preset = { ...initialConfig, ...presets[name] };
  const sample = glyphSample(preset);
  return (
    <button type="button" className="mx-preset" aria-pressed={active} onClick={onApply}>
      <span className="mx-preset-view" style={{ background: preset.backgroundColor, fontFamily: preset.fontFamily }}>
        {sample.map((char, i) => (
          <span key={i} style={{ color: sampleColor(preset, i, sample.length) }}>
            {char}
          </span>
        ))}
      </span>
      <span className="mx-preset-name">
        {active ? '▶ ' : ''}
        {name}
      </span>
    </button>
  );
};

const PRESET_TAB = 'presets';

const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  applyPreset,
  randomizeConfig,
  pickRevealImage,
  onClose,
}) => {
  const [tab, setTab] = useState(PRESET_TAB);
  const tabs = [{ id: PRESET_TAB, title: 'Presets' }, ...sections];
  const section = sections.find((s) => s.id === tab);
  const title = section ? section.title : 'Presets';

  return (
    <>
      <header className="mx-header">
        <div>
          <Decoded text="MATRIX" className="mx-brand" />
          <p className="mx-sub">rain control // {config.preset || 'custom'}</p>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="mx-kbd">H</kbd>
          <button type="button" className="mx-icon" onClick={onClose} aria-label="Ocultar controles (H)" title="H">
            ×
          </button>
        </div>
      </header>

      <nav className="mx-tabs" role="tablist" aria-label="Secciones">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="mx-tabpanel"
            className="mx-tab"
            onClick={() => setTab(t.id)}
          >
            <span>{String(i).padStart(2, '0')}</span>
            {t.title}
          </button>
        ))}
      </nav>

      <div
        id="mx-tabpanel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mx-body min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
      >
        <h2 className="mx-title">
          <span aria-hidden="true">&gt; </span>
          <Decoded text={title.toUpperCase()} />
          <span className="mx-caret" aria-hidden="true" />
        </h2>

        {section ? (
          section.controls
            .filter((control) => !control.when || control.when(config))
            .map((control) => (
              <Field
                key={'key' in control ? control.key : control.kind}
                control={control}
                config={config}
                setConfig={setConfig}
                pickRevealImage={pickRevealImage}
              />
            ))
        ) : (
          <>
            <div className="mx-presets">
              {Object.keys(presets).map((name) => (
                <PresetCard key={name} name={name} active={config.preset === name} onApply={() => applyPreset(name)} />
              ))}
            </div>
            <div className="mx-actions">
              <button type="button" className="mx-button" onClick={randomizeConfig}>
                &gt; randomize
              </button>
              <button type="button" className="mx-button" onClick={() => setConfig(factoryConfig())}>
                &gt; factory reset
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ControlPanel;
