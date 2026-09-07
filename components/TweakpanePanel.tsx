import React, { useEffect, useRef } from 'react';
import { Pane } from 'tweakpane';
import type { Config } from '../types';
import { factoryConfig } from '../config/configState';
import {
  glyphSets,
  fontFamilies,
  fontWeights,
  mouseEffects,
  streamDirections,
  streamMovements,
  colorModes,
} from '../config/constants';

interface TweakpanePanelProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  applyPreset: (name: string) => void;
  presetNames: string[];
  randomizeConfig: () => void;
}

// Helper to convert arrays to Tweakpane options { Label: value }
const toOptions = (arr: readonly string[]) =>
  Object.fromEntries(arr.map((value) => [value.charAt(0).toUpperCase() + value.slice(1), value]));

const TweakpanePanel: React.FC<TweakpanePanelProps> = ({
  config,
  setConfig,
  applyPreset,
  presetNames,
  randomizeConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const paramsRef = useRef({
    ...config,
    preset: config.preset ?? '',
    activePreset: config.preset || 'Custom',
  });
  const callbacksRef = useRef({ setConfig, applyPreset, randomizeConfig });

  useEffect(() => {
    callbacksRef.current = { setConfig, applyPreset, randomizeConfig };
  }, [setConfig, applyPreset, randomizeConfig]);

  // Sync external config changes (e.g. Presets) to Tweakpane UI
  useEffect(() => {
    if (!paneRef.current) return;
    let needsRefresh = false;
    (Object.keys(config) as Array<keyof Config>).forEach((key) => {
      if (key === 'preset') {
        const active = config.preset || 'Custom';
        if (paramsRef.current.activePreset !== active) {
          paramsRef.current.activePreset = active;
          needsRefresh = true;
        }
        return;
      }
      // @ts-ignore
      if (paramsRef.current[key] !== config[key]) {
        // @ts-ignore
        paramsRef.current[key] = config[key];
        needsRefresh = true;
      }
    });
    if (needsRefresh) paneRef.current.refresh();
  }, [config]);

  useEffect(() => {
    if (!containerRef.current || paneRef.current) return;

    const PARAMS = paramsRef.current;
    const pane = new Pane({
      title: 'MATRIX_OS v5.0 // ADMIN',
      container: containerRef.current,
      expanded: true,
    });
    paneRef.current = pane;

    const updateState = () => {
      const { preset: _preset, activePreset: _activePreset, ...restConfig } = PARAMS;
      callbacksRef.current.setConfig((prev) => ({ ...prev, ...restConfig }));
    };

    // --- 1. SYSTEM CONTROL ---
    const sysFolder = pane.addFolder({ title: 'SYSTEM / IO', expanded: true });

    const presetOpts = [{ text: '-- LOAD PRESET --', value: '' }, ...presetNames.map((n) => ({ text: n, value: n }))];
    sysFolder
      .addBinding(PARAMS, 'preset', {
        label: 'Library',
        options: presetOpts,
      })
      .on('change', (ev) => {
        if (ev.value && presetNames.includes(ev.value)) {
          callbacksRef.current.applyPreset(ev.value);
          // Visual reset of dropdown
          setTimeout(() => {
            if (paneRef.current) {
              PARAMS.preset = '';
              paneRef.current.refresh();
            }
          }, 200);
        }
      });

    sysFolder.addBinding(PARAMS, 'activePreset', { label: 'Active', readonly: true });

    sysFolder.addButton({ title: '🎲 RANDOMIZE SYSTEM' }).on('click', () => callbacksRef.current.randomizeConfig());
    sysFolder.addButton({ title: '🔄 FACTORY RESET' }).on('click', () => {
      callbacksRef.current.setConfig(factoryConfig());
    });

    const contentFolder = pane.addFolder({ title: 'CONTENT', expanded: false });

    contentFolder
      .addBinding(PARAMS, 'glyphSet', {
        label: 'Charset',
        options: toOptions(glyphSets),
      })
      .on('change', updateState);

    contentFolder
      .addBinding(PARAMS, 'customGlyphSet', {
        label: 'Custom Text',
        multiline: true,
        rows: 2,
      })
      .on('change', updateState);

    // --- 3. OPTICS (Appearance) ---
    const lookFolder = pane.addFolder({ title: 'OPTICS', expanded: false });

    lookFolder
      .addBinding(PARAMS, 'numColumns', { min: 10, max: 400, step: 1, label: 'Density' })
      .on('change', updateState);
    lookFolder
      .addBinding(PARAMS, 'fontSize', { min: 8, max: 64, step: 1, label: 'Glyph Size' })
      .on('change', updateState);
    lookFolder
      .addBinding(PARAMS, 'fontFamily', {
        label: 'Font',
        options: toOptions(fontFamilies),
      })
      .on('change', updateState);
    lookFolder
      .addBinding(PARAMS, 'fontWeight', {
        label: 'Weight',
        options: toOptions(fontWeights),
      })
      .on('change', updateState);

    lookFolder
      .addBinding(PARAMS, 'characterSpacing', { min: 0.5, max: 2.0, label: 'Line Height' })
      .on('change', updateState);
    lookFolder.addBinding(PARAMS, 'baseRotation', { min: 0, max: 360, label: 'Angle' }).on('change', updateState);
    lookFolder.addBinding(PARAMS, 'rotationSpeed', { min: -20, max: 20, label: 'Spin Vel' }).on('change', updateState);

    // --- 4. CHROMATICS (Color) ---
    const colorFolder = pane.addFolder({ title: 'CHROMATICS', expanded: false });

    colorFolder
      .addBinding(PARAMS, 'colorMode', {
        label: 'Mode',
        options: toOptions(colorModes),
      })
      .on('change', updateState);

    colorFolder.addBinding(PARAMS, 'backgroundColor', { label: 'Void Color' }).on('change', updateState);
    colorFolder.addBinding(PARAMS, 'glyphColor', { label: 'Base Color' }).on('change', updateState);
    colorFolder.addBinding(PARAMS, 'leaderColor', { label: 'Lead Color' }).on('change', updateState);
    colorFolder
      .addBinding(PARAMS, 'fadeOutSpeed', { min: 0.01, max: 0.5, label: 'Fade Speed' })
      .on('change', updateState);

    // --- 5. POST-PROCESSING ---
    const fxFolder = pane.addFolder({ title: 'POST-PROCESSING', expanded: false });

    fxFolder.addBinding(PARAMS, 'useGlow', { label: 'Bloom' }).on('change', updateState);
    fxFolder.addBinding(PARAMS, 'glowColor', { label: 'Bloom Tint' }).on('change', updateState);
    fxFolder.addBinding(PARAMS, 'glowIntensity', { min: 0, max: 10, label: 'Intensity' }).on('change', updateState);

    fxFolder.addBlade({ view: 'separator' });

    fxFolder.addBinding(PARAMS, 'useGhosting', { label: 'Ghosting' }).on('change', updateState);
    fxFolder
      .addBinding(PARAMS, 'ghostingIntensity', { min: 0, max: 0.99, label: 'Persistence' })
      .on('change', updateState);

    // --- 6. KINEMATICS (Physics) ---
    const physFolder = pane.addFolder({ title: 'KINEMATICS', expanded: false });

    physFolder.addBinding(PARAMS, 'minSpeed', { min: 0.1, max: 30, label: 'Min Vel' }).on('change', updateState);
    physFolder.addBinding(PARAMS, 'maxSpeed', { min: 1, max: 50, label: 'Max Vel' }).on('change', updateState);

    physFolder
      .addBinding(PARAMS, 'streamDirection', {
        label: 'Flow',
        options: toOptions(streamDirections),
      })
      .on('change', updateState);

    physFolder
      .addBinding(PARAMS, 'streamMovement', {
        label: 'Vector',
        options: toOptions(streamMovements),
      })
      .on('change', updateState);

    physFolder
      .addBinding(PARAMS, 'movementAmplitude', { min: 0, max: 100, label: 'Amplitude' })
      .on('change', updateState);
    physFolder
      .addBinding(PARAMS, 'movementFrequency', { min: 0.01, max: 2, label: 'Frequency' })
      .on('change', updateState);

    physFolder.addBlade({ view: 'separator' });

    physFolder.addBinding(PARAMS, 'glitchChance', { min: 0, max: 1, label: 'Glitch %' }).on('change', updateState);
    physFolder
      .addBinding(PARAMS, 'characterSwapRate', { min: 0, max: 1, label: 'Swap Rate' })
      .on('change', updateState);
    physFolder
      .addBinding(PARAMS, 'minTrailLength', { min: 1, max: 50, step: 1, label: 'Min Trail' })
      .on('change', updateState);
    physFolder
      .addBinding(PARAMS, 'maxTrailLength', { min: 10, max: 200, step: 1, label: 'Max Trail' })
      .on('change', updateState);

    // --- 7. DIMENSION (3D) ---
    const spaceFolder = pane.addFolder({ title: 'DIMENSION', expanded: false });

    spaceFolder.addBinding(PARAMS, 'useZAxis', { label: 'Z-Depth' }).on('change', updateState);
    spaceFolder.addBinding(PARAMS, 'perspective', { min: 10, max: 1000, label: 'FOV' }).on('change', updateState);
    spaceFolder.addBinding(PARAMS, 'minZ', { min: -200, max: 100, label: 'Near Plane' }).on('change', updateState);
    spaceFolder.addBinding(PARAMS, 'maxZ', { min: 0, max: 500, label: 'Far Plane' }).on('change', updateState);

    // --- 8. INTERACTION ---
    const inputFolder = pane.addFolder({ title: 'INTERACTION', expanded: false });

    inputFolder
      .addBinding(PARAMS, 'mouseEffect', {
        label: 'Cursor FX',
        options: toOptions(mouseEffects),
      })
      .on('change', updateState);

    inputFolder.addBinding(PARAMS, 'mouseRadius', { min: 10, max: 500, label: 'Fx Radius' }).on('change', updateState);
    inputFolder.addBinding(PARAMS, 'mouseForce', { min: 0, max: 50, label: 'Fx Force' }).on('change', updateState);

    inputFolder.addBlade({ view: 'separator' });

    inputFolder.addBinding(PARAMS, 'useSplashEffect', { label: 'Splash' }).on('change', updateState);
    inputFolder
      .addBinding(PARAMS, 'splashRadius', { min: 10, max: 500, label: 'Splash Rad' })
      .on('change', updateState);
    inputFolder.addBinding(PARAMS, 'splashForce', { min: 0, max: 50, label: 'Splash Force' }).on('change', updateState);

    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
      }
    };
  }, []); // Run once on mount, updates handled internally

  return (
    <div
      ref={containerRef}
      aria-label="Panel de configuración Matrix"
      className="fixed top-4 right-4 z-30 w-[300px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl custom-scrollbar"
    />
  );
};

export default TweakpanePanel;
