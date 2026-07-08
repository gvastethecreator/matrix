
import {
  glyphSets,
  mouseEffects,
  fontFamilies,
  fontWeights,
  streamDirections,
  streamMovements,
  colorModes,
} from '../config/constants';
import type { Config } from '../types';

/**
 * Devuelve un elemento aleatorio de un array.
 * @param arr El array de entrada.
 * @returns Un elemento aleatorio del array.
 */
export const getRandomElement = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Genera un número de punto flotante aleatorio dentro de un rango.
 * @param min El límite inferior (inclusivo).
 * @param max El límite superior (exclusivo).
 * @returns Un número flotante aleatorio.
 */
export const getRandomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Genera un número entero aleatorio dentro de un rango.
 * @param min El límite inferior (inclusivo).
 * @param max El límite superior (inclusivo).
 * @returns Un número entero aleatorio.
 */
export const getRandomInt = (min: number, max: number): number => Math.floor(getRandomFloat(min, max + 1));

/**
 * Genera un color hexadecimal aleatorio.
 * @returns Una cadena de texto que representa un color en formato hexadecimal (ej. '#3a8cc9').
 */
export const getRandomHexColor = (): string => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

/**
 * Genera un objeto de configuración completo con valores aleatorios.
 * @returns Un objeto de configuración aleatorio.
 */
export const generateRandomConfig = (): Config => {
  const useZ = Math.random() > 0.3;
  const useG = Math.random() > 0.3;
  const useGhost = Math.random() > 0.5;
  const useSplash = Math.random() > 0.5;
  const newMovement = getRandomElement(streamMovements);
  const isColor = Math.random() > 0.7; // 30% de probabilidad de modo de color especial

  return {
    numColumns: getRandomInt(50, 200),
    glyphSet: getRandomElement(glyphSets),
    customGlyphSet: 'RANDOM',
    fontSize: getRandomInt(10, 24),
    fontFamily: getRandomElement(fontFamilies),
    fontWeight: getRandomElement(fontWeights),
    backgroundColor: getRandomHexColor(),
    
    colorMode: isColor ? getRandomElement(colorModes.filter(m => m !== 'monochrome')) : 'monochrome',
    glyphColor: getRandomHexColor(),
    leaderColor: getRandomHexColor(),
    
    fadeOutSpeed: getRandomFloat(0.05, 0.2),
    characterSpacing: getRandomFloat(0.8, 1.5),
    baseRotation: Math.random() > 0.8 ? getRandomInt(0, 360) : 0,
    rotationSpeed: Math.random() > 0.8 ? getRandomFloat(1, 10) : 0,

    useGlow: useG,
    glowColor: getRandomHexColor(),
    glowIntensity: useG ? getRandomFloat(1.0, 4.0) : 1.5,
    useGhosting: useGhost,
    ghostingIntensity: useGhost ? getRandomFloat(0.1, 0.9) : 0.5,
    minSpeed: getRandomFloat(1, 5),
    maxSpeed: getRandomFloat(5, 15),
    glitchChance: getRandomFloat(0, 0.1),
    characterSwapRate: getRandomFloat(0.01, 0.1),
    minTrailLength: getRandomInt(5, 20),
    maxTrailLength: getRandomInt(25, 80),
    streamDirection: getRandomElement(streamDirections),
    streamMovement: newMovement,
    movementAmplitude: newMovement !== 'linear' ? getRandomFloat(5, 50) : 10,
    movementFrequency: newMovement !== 'linear' ? getRandomFloat(0.05, 0.5) : 0.1,
    useZAxis: useZ,
    perspective: useZ ? getRandomFloat(100, 400) : 150,
    minZ: useZ ? getRandomFloat(-50, 0) : 0,
    maxZ: useZ ? getRandomFloat(50, 150) : 50,
    mouseEffect: getRandomElement(mouseEffects),
    mouseRadius: getRandomFloat(50, 250),
    mouseForce: getRandomFloat(1, 10),
    useSplashEffect: useSplash,
    splashRadius: useSplash ? getRandomFloat(80, 300) : 100,
    splashForce: useSplash ? getRandomFloat(2, 15) : 5,
  };
};
