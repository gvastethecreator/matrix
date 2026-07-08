
import React from 'react';
import { MatrixConfig, CharSetType } from '../types';
import { PRESETS } from '../constants';
import { Settings, Zap, Type, Palette, Layout, Save, Download, Upload, Cpu } from 'lucide-react';

interface ControlsProps {
  config: MatrixConfig;
  setConfig: React.Dispatch<React.SetStateAction<MatrixConfig>>;
  onGenerateAI: (theme: string) => void;
  isLoading: boolean;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig, onGenerateAI, isLoading }) => {
  const updateConfig = (key: keyof MatrixConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "matrix_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedConfig = JSON.parse(event.target?.result as string);
        setConfig(importedConfig);
      } catch (err) {
        alert("Failed to import config. Invalid JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-80 bg-black/80 backdrop-blur-xl border-r border-white/10 h-screen overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar relative z-10 shadow-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Settings className="w-5 h-5 text-green-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Playground</h1>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
          <Zap className="w-3 h-3" />
          <span>Presets</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setConfig(p.config)}
              className="px-4 py-2.5 rounded-lg text-sm text-left transition-all bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/70 hover:text-white"
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3" />
              <span>Color & Visuals</span>
            </div>
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Hue</span>
              <input 
                type="color" 
                value={config.color} 
                onChange={e => updateConfig('color', e.target.value)}
                className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Bloom</span>
                <span className="text-white/40">{config.bloom}</span>
              </div>
              <input 
                type="range" min="0" max="30" step="1"
                value={config.bloom} 
                onChange={e => updateConfig('bloom', parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            <Type className="w-3 h-3" />
            <span>Typography</span>
          </label>
          <select 
            value={config.charSet}
            onChange={e => updateConfig('charSet', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-green-500/50 mb-4"
          >
            <option value={CharSetType.MATRIX}>Original Matrix</option>
            <option value={CharSetType.BINARY}>Binary (01)</option>
            <option value={CharSetType.HEX}>Hexadecimal</option>
            <option value={CharSetType.ALPHA}>Alphabet</option>
            <option value={CharSetType.CUSTOM}>Custom Strings</option>
          </select>
          
          {config.charSet === CharSetType.CUSTOM && (
            <div className="space-y-2">
              <textarea 
                value={config.customChars}
                onChange={e => updateConfig('customChars', e.target.value)}
                placeholder="Enter characters..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 h-24 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <button
                onClick={() => onGenerateAI("alien hacker symbols")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Cpu className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Decrypting...' : 'AI Generate Glyphs'}
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            <Layout className="w-3 h-3" />
            <span>Physics</span>
          </label>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Speed</span>
                <span className="text-white/40">{config.speed}</span>
              </div>
              <input 
                type="range" min="0.1" max="10" step="0.1"
                value={config.speed} 
                onChange={e => updateConfig('speed', parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Density</span>
                <span className="text-white/40">{config.density}</span>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1"
                value={config.density} 
                onChange={e => updateConfig('density', parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tail Length</span>
                <span className="text-white/40">{Math.round((1 - config.fadeFactor) * 100)}%</span>
              </div>
              <input 
                type="range" min="0.01" max="0.3" step="0.01"
                value={config.fadeFactor} 
                onChange={e => updateConfig('fadeFactor', parseFloat(e.target.value))}
                className="w-full accent-green-500"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-auto pt-6 border-t border-white/10 flex gap-2">
        <button 
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-lg text-xs font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input type="file" className="hidden" accept=".json" onChange={handleImport} />
        </label>
      </div>
    </div>
  );
};

export default Controls;
