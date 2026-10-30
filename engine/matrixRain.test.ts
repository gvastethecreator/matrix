import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import * as THREE from 'three/webgpu';
import { engineTables } from '../config/constants.ts';
import { factoryConfig } from '../config/configState.ts';
import { generateStandaloneHtml } from '../utils/exportHtml.ts';

const engineSource = readFileSync(new URL('./matrixRain.js', import.meta.url), 'utf8');
const scriptSource = engineSource.replace(/^export /gm, '');

test('PERF-10 engine module is self-contained text that runs without imports', () => {
  assert.equal(/^\s*import\b/m.test(engineSource), false);
  assert.match(engineSource, /^export function runMatrixAnimation\(THREE, canvas, initialConfig, tables\)/m);
  assert.equal(engineSource.includes('.toString()'), false);
  assert.equal(runInNewContext(`${scriptSource}\ntypeof runMatrixAnimation`), 'function');
});

const distAssets = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets');
const distIndex =
  existsSync(distAssets) && readdirSync(distAssets).find((name) => name.startsWith('index-') && name.endsWith('.js'));

test('production index bundle keeps the unminified engine text for export', { skip: !distIndex }, () => {
  const bundle = readFileSync(join(distAssets, distIndex as string), 'utf8');
  assert.equal(bundle.includes('function runMatrixAnimation(THREE, canvas, initialConfig, tables)'), true);
  assert.equal(bundle.includes('new THREE.WebGPURenderer('), true);
});

test('ARC-03 standalone HTML embeds the engine as a script and passes its tables', () => {
  const html = generateStandaloneHtml(factoryConfig(), engineSource);
  assert.match(html, /runMatrixAnimation\(THREE, canvas, initialConfig, tables\)/);
  assert.match(html, /const tables = \{"directionVectors"/);
  assert.equal(/^\s*export /m.test(html), false);
  assert.match(html, /import \* as THREE from 'https:\/\/unpkg\.com\/three@[\d.]+\/build\/three\.webgpu\.js'/);
});

test('shared engine caps instances, updates trails, and advances by elapsed time', async () => {
  let frame: ((time: number) => void) | undefined;
  let rebuild: (() => void) | undefined;
  let rain: THREE.Mesh<THREE.InstancedBufferGeometry> | undefined;
  let streams: Float32Array | undefined;
  let glyphsDrawn = 0;
  let disconnected = false;
  const canvas = { clientWidth: 1280, clientHeight: 720, addEventListener() {}, removeEventListener() {} };
  class Renderer {
    backend = { isWebGPUBackend: true };
    init() {
      return Promise.resolve(this);
    }
    setPixelRatio() {}
    setRenderTarget() {}
    setSize() {}
    setClearColor() {}
    clear() {}
    dispose() {}
    render(scene: THREE.Object3D) {
      const mesh = scene.children[0] as typeof rain;
      if (mesh?.geometry.isInstancedBufferGeometry) rain = mesh;
    }
  }
  class DataTexture extends THREE.DataTexture {
    constructor(...args: ConstructorParameters<typeof THREE.DataTexture>) {
      super(...args);
      if (Object.prototype.toString.call(args[0]) === '[object Float32Array]') streams = args[0] as Float32Array;
    }
  }
  const run = runInNewContext(`${scriptSource}; runMatrixAnimation`, {
    window: { devicePixelRatio: 1 },
    document: {
      hidden: false,
      addEventListener() {},
      removeEventListener() {},
      createElement: () => ({
        getContext: () => ({
          measureText: () => ({ width: 32 }),
          fillText() {
            glyphsDrawn += 1;
          },
        }),
      }),
    },
    ResizeObserver: class {
      observe() {}
      disconnect() {
        disconnected = true;
      }
    },
    requestAnimationFrame: (callback: (time: number) => void) => {
      frame = callback;
      return 1;
    },
    cancelAnimationFrame: () => {
      frame = undefined;
    },
    setTimeout: (callback: () => void) => {
      rebuild = callback;
      return 1;
    },
    clearTimeout: () => {
      rebuild = undefined;
    },
  });
  const config = {
    ...factoryConfig(),
    numColumns: 6000,
    minTrailLength: 200,
    maxTrailLength: 200,
    minSpeed: 1,
    maxSpeed: 1,
    useZAxis: false,
    glyphSet: 'custom',
    customGlyphSet: '❤️🔥',
  };
  const controller = run({ ...THREE, WebGPURenderer: Renderer, DataTexture }, canvas, config, engineTables);
  try {
    assert.equal(await controller.ready, 'WebGPU');
    assert.ok(frame);
    assert.ok(streams);
    assert.equal(glyphsDrawn, 2, 'graphemes, not code points, become glyphs');
    frame(0);
    assert.ok(rain);
    assert.equal(rain.geometry.instanceCount, 1_000_000);
    const before = streams[1];
    frame(1000 / 60);
    frame(1000 / 30);
    assert.ok(Math.abs(streams[1] - before - 2) < 0.001, 'speed uses elapsed time at 60 units per second');
    glyphsDrawn = 0;
    controller.update({ ...config, numColumns: 10, minTrailLength: 8, maxTrailLength: 8, customGlyphSet: null });
    assert.ok(rebuild);
    rebuild();
    frame(50);
    assert.equal(rain.geometry.instanceCount, 80);
    assert.equal(glyphsDrawn, 1, 'invalid saved charset keeps the placeholder');
  } finally {
    controller.destroy();
  }
  assert.equal(frame, undefined);
  assert.equal(disconnected, true);
});
