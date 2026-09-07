import type { Config } from '../types.ts';
import { normalizeRange } from '../config/configState.ts';
import {
  glyphSets,
  mouseEffects,
  fontFamilies,
  fontWeights,
  streamDirections,
  streamMovements,
  colorModes,
} from '../config/constants.ts';

/**
 * Devuelve un elemento aleatorio de un array.
 * @param arr El array de entrada.
 * @returns Un elemento aleatorio del array.
 */
const getRandomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Genera un número de punto flotante aleatorio dentro de un rango.
 * @param min El límite inferior (inclusivo).
 * @param max El límite superior (exclusivo).
 * @returns Un número flotante aleatorio.
 */
const getRandomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Genera un número entero aleatorio dentro de un rango.
 * @param min El límite inferior (inclusivo).
 * @param max El límite superior (inclusivo).
 * @returns Un número entero aleatorio.
 */
const getRandomInt = (min: number, max: number): number => Math.floor(getRandomFloat(min, max + 1));

/**
 * Genera un color hexadecimal aleatorio.
 * @returns Una cadena de texto que representa un color en formato hexadecimal (ej. '#3a8cc9').
 */
const getRandomHexColor = (): string =>
  '#' +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0');

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
  const isColor = Math.random() > 0.7;
  const [minSpeed, maxSpeed] = normalizeRange(getRandomFloat(1, 15), getRandomFloat(1, 15));
  const [minTrailLength, maxTrailLength] = normalizeRange(getRandomInt(5, 80), getRandomInt(5, 80));
  const [minZ, maxZ] = normalizeRange(useZ ? getRandomFloat(-50, 150) : 0, useZ ? getRandomFloat(-50, 150) : 50);

  return {
    numColumns: getRandomInt(50, 200),
    glyphSet: getRandomElement(glyphSets),
    customGlyphSet: 'RANDOM',
    fontSize: getRandomInt(10, 24),
    fontFamily: getRandomElement(fontFamilies),
    fontWeight: getRandomElement(fontWeights),
    backgroundColor: getRandomHexColor(),

    colorMode: isColor ? getRandomElement(colorModes.filter((m) => m !== 'monochrome')) : 'monochrome',
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
    minSpeed,
    maxSpeed,
    glitchChance: getRandomFloat(0, 0.1),
    characterSwapRate: getRandomFloat(0.01, 0.1),
    minTrailLength,
    maxTrailLength,
    streamDirection: getRandomElement(streamDirections),
    streamMovement: newMovement,
    movementAmplitude: newMovement !== 'linear' ? getRandomFloat(5, 50) : 10,
    movementFrequency: newMovement !== 'linear' ? getRandomFloat(0.05, 0.5) : 0.1,
    useZAxis: useZ,
    perspective: useZ ? getRandomFloat(100, 400) : 150,
    minZ,
    maxZ,
    mouseEffect: getRandomElement(mouseEffects),
    mouseRadius: getRandomFloat(50, 250),
    mouseForce: getRandomFloat(1, 10),
    useSplashEffect: useSplash,
    splashRadius: useSplash ? getRandomFloat(80, 300) : 100,
    splashForce: useSplash ? getRandomFloat(2, 15) : 5,
  };
};
