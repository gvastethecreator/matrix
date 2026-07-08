
import { CharSetType, MatrixConfig, Preset } from './types';

export const CHAR_SETS: Record<CharSetType, string> = {
  [CharSetType.MATRIX]: 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890',
  [CharSetType.BINARY]: '01',
  [CharSetType.HEX]: '0123456789ABCDEF',
  [CharSetType.ALPHA]: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  [CharSetType.CUSTOM]: '',
};

export const DEFAULT_CONFIG: MatrixConfig = {
  color: '#00FF41',
  fontSize: 16,
  speed: 2,
  density: 1,
  fadeFactor: 0.05,
  charSet: CharSetType.MATRIX,
  customChars: 'SYSTEMFAILURE',
  glow: true,
  bloom: 5,
  perspective: false,
};

export const PRESETS: Preset[] = [
  {
    id: 'classic',
    name: 'Classic Matrix',
    config: { ...DEFAULT_CONFIG },
  },
  {
    id: 'ghost',
    name: 'Ghost in Shell',
    config: {
      ...DEFAULT_CONFIG,
      color: '#00ccff',
      charSet: CharSetType.HEX,
      speed: 1.5,
      bloom: 8,
    },
  },
  {
    id: 'terminal',
    name: 'Retro Terminal',
    config: {
      ...DEFAULT_CONFIG,
      color: '#fbbf24',
      charSet: CharSetType.ALPHA,
      fontSize: 14,
      density: 0.8,
      speed: 1,
      glow: false,
    },
  },
  {
    id: 'blood',
    name: 'Blood Rain',
    config: {
      ...DEFAULT_CONFIG,
      color: '#ff0000',
      charSet: CharSetType.BINARY,
      speed: 3,
      fadeFactor: 0.1,
      bloom: 10,
    },
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    config: {
      ...DEFAULT_CONFIG,
      color: '#ff00ff',
      charSet: CharSetType.MATRIX,
      speed: 2.5,
      fontSize: 20,
      bloom: 15,
    },
  }
];
