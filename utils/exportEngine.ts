import { directionVectors, colorModes, mouseEffects, streamMovements } from '../config/constants.ts';
import { GLYPH_SET_TABLE } from '../config/glyphSet.ts';
import { MAX_GLYPHS, STRUCTURAL_REBUILD_MS } from '../config/motion.ts';

const VERTEX_SHADER = `
attribute vec4 aStream;
attribute vec4 aMotion;
attribute float aTrailIndex;
uniform float uTime;
uniform float uFontSize;
uniform float uSpacing;
uniform float uCellScale;
uniform vec2 uAtlasGrid;
uniform float uGlyphCount;
uniform int uMovement;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uRotation;
uniform float uSpin;
uniform float uSwapRate;
uniform float uGlitchChance;
uniform int uColorMode;
uniform vec3 uGlyphColor;
uniform vec3 uLeaderColor;
uniform vec2 uSpeedRange;
uniform float uHeight;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform int uMouseEffect;
uniform float uMouseRadius;
uniform float uMouseForce;
uniform vec2 uSplash;
uniform float uSplashStrength;
uniform float uSplashRadius;
uniform float uSplashForce;
varying vec2 vUv;
varying vec4 vColor;

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

vec3 hsl(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0)) * s;
}

void main() {
    float index = aTrailIndex;
    if (index >= aStream.w) {
        vUv = vec2(0.0);
        vColor = vec4(0.0);
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        return;
    }
    float seed = aMotion.w * 1000.0;
    float phase = uTime * uFrequency * 6.0 + seed;
    vec2 offset = vec2(0.0);
    if (uMovement == 1) offset.x = sin(phase) * uAmplitude;
    if (uMovement == 2) offset.x = sign(sin(phase)) * uAmplitude;
    if (uMovement == 3) offset = vec2(cos(phase), sin(phase)) * uAmplitude;
    vec2 world = aStream.xy - index * uFontSize * uSpacing * aMotion.xy + offset;
    float normalizedY = clamp((world.y + uHeight * 0.5) / uHeight, 0.0, 1.0);
    float scale = 1.0;
    vec2 delta = world - uMouse;
    float distance = max(length(delta), 0.001);
    float force = max(0.0, 1.0 - distance / uMouseRadius) * uMouseForce * uMouseStrength;
    if (uMouseEffect == 0) scale += force * 0.45;
    if (uMouseEffect == 1) world -= delta / distance * force * 9.0;
    if (uMouseEffect == 2) world += delta / distance * force * 9.0;
    if (uMouseEffect == 3) world += vec2(-delta.y, delta.x) / distance * force * 9.0;
    delta = world - uSplash;
    distance = max(length(delta), 0.001);
    world += delta / distance * max(0.0, 1.0 - distance / uSplashRadius) * uSplashForce * uSplashStrength * 9.0;

    float tick = floor(uTime * 60.0 * uSwapRate);
    float glyph = floor(hash(seed + index * 13.37 + tick * 7.13) * uGlyphCount);
    float glitch = step(1.0 - uGlitchChance, hash(seed + floor(uTime * 12.0)));
    world.x += glitch * (hash(seed + index) - 0.5) * uFontSize;
    vec2 cell = vec2(mod(glyph, uAtlasGrid.x), floor(glyph / uAtlasGrid.x));
    vUv = vec2((cell.x + uv.x) / uAtlasGrid.x, 1.0 - (cell.y + 1.0 - uv.y) / uAtlasGrid.y);

    bool leader = index < 0.5;
    vec3 color = leader ? uLeaderColor : uGlyphColor;
    if (uColorMode == 1) color = hsl(aMotion.w, 0.85, leader ? 0.72 : 0.48);
    if (uColorMode == 2) color = hsl(normalizedY * 0.7, 0.8, leader ? 0.7 : 0.45);
    if (uColorMode == 3) {
        float span = uSpeedRange.y - uSpeedRange.x;
        float speed = span == 0.0 ? 0.5 : clamp((aMotion.z - uSpeedRange.x) / span, 0.0, 1.0);
        color = hsl(0.35 - speed * 0.35, 0.9, leader ? 0.7 : 0.4 + speed * 0.2);
    }
    vColor = vec4(color, 1.0 - index / aStream.w);
    float angle = radians(uRotation + uTime * uSpin);
    vec2 local = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world + local * uFontSize * uCellScale * scale, -aStream.z, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform sampler2D uAtlas;
uniform bool uUseGlow;
uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform float uTime;
varying vec2 vUv;
varying vec4 vColor;
void main() {
    vec4 tex = texture2D(uAtlas, vUv);
    if (tex.a < 0.1) discard;
    vec3 base = vColor.rgb;
    float flicker = 0.95 + 0.05 * sin(uTime * 20.0 + vUv.y * 100.0);
    if (uUseGlow) {
        float core = smoothstep(0.5, 0.9, tex.a);
        vec3 glowColor = dot(uGlowColor, uGlowColor) < 0.0001 ? base : uGlowColor;
        vec3 glow = glowColor * uGlowIntensity * tex.a;
        base = mix(glow, base + glow * 0.3, core);
    }
    gl_FragColor = vec4(base * flicker, vColor.a * tex.a);
}
`;

export const getAnimationLogicString = (): string => `
function runMatrixAnimation(THREE, canvas, initialConfig) {
  const directionVectors = ${JSON.stringify(directionVectors)};
  const colorModes = ${JSON.stringify(colorModes)};
  const mouseEffects = ${JSON.stringify(mouseEffects)};
  const streamMovements = ${JSON.stringify(streamMovements)};
  const GLYPH_SET_TABLE = ${JSON.stringify(GLYPH_SET_TABLE)};
  const MAX_GLYPHS = ${MAX_GLYPHS};
  const STRUCTURAL_REBUILD_MS = ${STRUCTURAL_REBUILD_MS};
  let config = Object.assign({}, initialConfig);
  let width = Math.max(canvas.clientWidth || window.innerWidth, 100);
  let height = Math.max(canvas.clientHeight || window.innerHeight, 100);
  let time = 0;
  let lastFrame = null;
  let animationFrameId;
  let debounceTimer;
  let atlasDirty = false;
  let mouseInside = false;
  let splashAge = 1;
  let streams = [];
  let geometry;
  let streamAttr;
  let motionAttr;
  let atlas;

  const scene = new THREE.Scene();
  const calculateFov = function () {
    return 2 * Math.atan(height / (2 * config.perspective)) * (180 / Math.PI);
  };
  const camera = new THREE.PerspectiveCamera(calculateFov(), width / height, 1, 3000);
  camera.position.z = config.perspective;
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: false, alpha: false,
    powerPreference: 'high-performance', preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.setClearColor(config.backgroundColor, 1);
  renderer.autoClear = false;

  const uniforms = {
    uTime: { value: 0 },
    uAtlas: { value: null },
    uAtlasGrid: { value: new THREE.Vector2(1, 1) },
    uGlyphCount: { value: 1 },
    uCellScale: { value: 1 },
    uFontSize: { value: config.fontSize },
    uSpacing: { value: config.characterSpacing },
    uMovement: { value: 0 },
    uAmplitude: { value: config.movementAmplitude },
    uFrequency: { value: config.movementFrequency },
    uRotation: { value: config.baseRotation },
    uSpin: { value: config.rotationSpeed },
    uSwapRate: { value: config.characterSwapRate },
    uGlitchChance: { value: config.glitchChance },
    uColorMode: { value: 0 },
    uGlyphColor: { value: new THREE.Color() },
    uLeaderColor: { value: new THREE.Color() },
    uSpeedRange: { value: new THREE.Vector2() },
    uHeight: { value: height },
    uMouse: { value: new THREE.Vector2() },
    uMouseStrength: { value: 0 },
    uMouseEffect: { value: 0 },
    uMouseRadius: { value: config.mouseRadius },
    uMouseForce: { value: config.mouseForce },
    uSplash: { value: new THREE.Vector2() },
    uSplashStrength: { value: 0 },
    uSplashRadius: { value: config.splashRadius },
    uSplashForce: { value: config.splashForce },
    uUseGlow: { value: config.useGlow },
    uGlowColor: { value: new THREE.Color() },
    uGlowIntensity: { value: config.glowIntensity },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: ${JSON.stringify(VERTEX_SHADER)},
    fragmentShader: ${JSON.stringify(FRAGMENT_SHADER)},
    transparent: true, depthTest: false, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.InstancedBufferGeometry(), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const fadeMat = new THREE.MeshBasicMaterial({
    color: config.backgroundColor, transparent: true,
    opacity: config.fadeOutSpeed, depthWrite: false, depthTest: false,
  });
  const fadeMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat);
  const fadeScene = new THREE.Scene();
  fadeScene.add(fadeMesh);
  const fadeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -5, 5);

  const syncUniforms = function () {
    uniforms.uFontSize.value = config.fontSize;
    uniforms.uSpacing.value = config.characterSpacing;
    uniforms.uMovement.value = streamMovements.indexOf(config.streamMovement);
    uniforms.uAmplitude.value = config.movementAmplitude;
    uniforms.uFrequency.value = config.movementFrequency;
    uniforms.uRotation.value = config.baseRotation;
    uniforms.uSpin.value = config.rotationSpeed;
    uniforms.uSwapRate.value = config.characterSwapRate;
    uniforms.uGlitchChance.value = config.glitchChance;
    uniforms.uColorMode.value = colorModes.indexOf(config.colorMode);
    uniforms.uGlyphColor.value.set(config.glyphColor).convertLinearToSRGB();
    uniforms.uLeaderColor.value.set(config.leaderColor).convertLinearToSRGB();
    uniforms.uSpeedRange.value.set(config.minSpeed, config.maxSpeed);
    uniforms.uMouseEffect.value = mouseEffects.indexOf(config.mouseEffect);
    uniforms.uMouseRadius.value = Math.max(1, config.mouseRadius);
    uniforms.uMouseForce.value = config.mouseForce;
    uniforms.uSplashRadius.value = Math.max(1, config.splashRadius);
    uniforms.uSplashForce.value = config.splashForce;
    uniforms.uUseGlow.value = config.useGlow;
    uniforms.uGlowColor.value.set(config.glowColor);
    uniforms.uGlowIntensity.value = config.glowIntensity;
    fadeMat.color.set(config.backgroundColor);
    camera.position.z = config.perspective;
    camera.fov = calculateFov();
    camera.updateProjectionMatrix();
  };

  const createTextureAtlas = function () {
    const custom = typeof config.customGlyphSet === 'string' ? config.customGlyphSet : '';
    const glyphs = config.glyphSet === 'custom'
      ? (custom.trim() ? custom : '?')
      : GLYPH_SET_TABLE[config.glyphSet] || GLYPH_SET_TABLE.katakana;
    const chars = Array.from(new Set(Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(glyphs),
      function (entry) { return entry.segment; }
    )));
    const atlasCanvas = document.createElement('canvas');
    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el atlas de caracteres.');
    const font = config.fontWeight + ' 48px ' + config.fontFamily + ', monospace';
    ctx.font = font;
    const cellSize = Math.ceil(chars.reduce(function (size, char) {
      return Math.max(size, ctx.measureText(char).width + 16);
    }, 64));
    const maxCells = Math.floor(renderer.capabilities.maxTextureSize / cellSize);
    const columns = Math.min(maxCells, Math.ceil(Math.sqrt(chars.length)));
    const rows = Math.ceil(chars.length / columns);
    if (rows > maxCells) throw new Error('El conjunto de caracteres supera el tamaño de textura de esta GPU.');
    atlasCanvas.width = columns * cellSize;
    atlasCanvas.height = rows * cellSize;
    ctx.font = font;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    chars.forEach(function (char, i) {
      ctx.fillText(char, (i % columns + 0.5) * cellSize, (Math.floor(i / columns) + 0.5) * cellSize);
    });
    const texture = new THREE.CanvasTexture(atlasCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (atlas) atlas.dispose();
    atlas = texture;
    uniforms.uAtlas.value = atlas;
    uniforms.uAtlasGrid.value.set(columns, rows);
    uniforms.uGlyphCount.value = chars.length;
    uniforms.uCellScale.value = cellSize / 48;
  };

  const resetStream = function (stream, spread) {
    const dv = directionVectors[config.streamDirection];
    stream.z = config.useZAxis ? config.minZ + Math.random() * (config.maxZ - config.minZ) : 0;
    stream.z = Math.max(1 - config.perspective, stream.z);
    stream.speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    stream.length = Math.max(1, Math.min(streamAttr.meshPerAttribute,
      Math.floor(config.minTrailLength + Math.random() * (config.maxTrailLength - config.minTrailLength + 1))));
    stream.dx = dv[0];
    stream.dy = dv[1];
    stream.hue = Math.random();
    const depth = (config.perspective + stream.z) / config.perspective;
    const w = width * 0.5 * depth;
    const h = height * 0.5 * depth;
    stream.x = (Math.random() * 2 - 1) * w;
    stream.y = (Math.random() * 2 - 1) * h;
    if (!spread) {
      if (dv[1] !== 0) stream.y = -Math.sign(dv[1]) * (h + config.fontSize);
      else stream.x = -Math.sign(dv[0]) * (w + config.fontSize);
    }
  };

  const initStreams = function () {
    const trail = Math.min(MAX_GLYPHS, Math.max(1, Math.floor(config.maxTrailLength)));
    const columns = Math.min(Math.max(1, Math.floor(config.numColumns)), Math.floor(MAX_GLYPHS / trail));
    const next = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1);
    next.setIndex(plane.index);
    next.setAttribute('position', plane.attributes.position);
    next.setAttribute('uv', plane.attributes.uv);
    plane.dispose();
    const indices = new Float32Array(columns * trail);
    for (let i = 0; i < indices.length; i++) indices[i] = i % trail;
    next.setAttribute('aTrailIndex', new THREE.InstancedBufferAttribute(indices, 1));
    streamAttr = new THREE.InstancedBufferAttribute(new Float32Array(columns * 4), 4, false, trail);
    motionAttr = new THREE.InstancedBufferAttribute(new Float32Array(columns * 4), 4, false, trail);
    streamAttr.setUsage(THREE.DynamicDrawUsage);
    motionAttr.setUsage(THREE.DynamicDrawUsage);
    next.setAttribute('aStream', streamAttr);
    next.setAttribute('aMotion', motionAttr);
    next.instanceCount = columns * trail;
    mesh.geometry.dispose();
    geometry = next;
    mesh.geometry = next;
    streams = Array.from({ length: columns }, function () {
      const stream = {};
      resetStream(stream, true);
      return stream;
    });
  };

  const resize = function (w, h) {
    if (w === width && h === height) return;
    width = Math.max(w, 100);
    height = Math.max(h, 100);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    uniforms.uHeight.value = height;
    syncUniforms();
    initStreams();
  };
  const resizeObserver = new ResizeObserver(function (entries) {
    const rect = entries[0].contentRect;
    if (rect.width > 0 && rect.height > 0) resize(rect.width, rect.height);
  });
  resizeObserver.observe(canvas);
  const onMove = function (event) {
    const rect = canvas.getBoundingClientRect();
    uniforms.uMouse.value.set(
      (event.clientX - rect.left) * width / rect.width - width / 2,
      height / 2 - (event.clientY - rect.top) * height / rect.height
    );
    mouseInside = true;
  };
  const onLeave = function () {
    if (config.useSplashEffect && mouseInside) {
      uniforms.uSplash.value.copy(uniforms.uMouse.value);
      splashAge = 0;
    }
    mouseInside = false;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  const animate = function (timestamp) {
    if (document.hidden) { lastFrame = null; return; }
    const dt = lastFrame === null ? 0 : Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;
    time += dt;
    uniforms.uTime.value = time;
    const smoothing = 1 - Math.pow(0.9, dt * 60);
    uniforms.uMouseStrength.value += ((mouseInside ? 1 : 0) - uniforms.uMouseStrength.value) * smoothing;
    splashAge += dt;
    uniforms.uSplashStrength.value = config.useSplashEffect ? Math.max(0, 1 - splashAge) : 0;
    const fade = config.useGhosting ? config.fadeOutSpeed * (1 - config.ghostingIntensity) : config.fadeOutSpeed;
    fadeMat.opacity = 1 - Math.pow(1 - fade, dt * 60);
    renderer.render(fadeScene, fadeCam);
    const dv = directionVectors[config.streamDirection];
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      stream.dx += (dv[0] - stream.dx) * smoothing;
      stream.dy += (dv[1] - stream.dy) * smoothing;
      stream.x += dv[0] * stream.speed * dt * 60;
      stream.y += dv[1] * stream.speed * dt * 60;
      const depth = (config.perspective + stream.z) / config.perspective;
      const tail = stream.length * config.fontSize * config.characterSpacing;
      const w = width * 0.5 * depth + Math.abs(dv[0]) * tail + config.movementAmplitude;
      const h = height * 0.5 * depth + Math.abs(dv[1]) * tail + config.movementAmplitude;
      if (stream.x * dv[0] > w * Math.abs(dv[0]) || stream.y * dv[1] > h * Math.abs(dv[1])) {
        resetStream(stream, false);
      }
      streamAttr.setXYZW(i, stream.x, stream.y, stream.z, stream.length);
      motionAttr.setXYZW(i, stream.dx, stream.dy, stream.speed, stream.hue);
    }
    streamAttr.needsUpdate = true;
    motionAttr.needsUpdate = true;
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  const onVisibility = function () {
    cancelAnimationFrame(animationFrameId);
    lastFrame = null;
    if (!document.hidden) animationFrameId = requestAnimationFrame(animate);
  };
  document.addEventListener('visibilitychange', onVisibility);

  const update = function (newConfig) {
    const prev = config;
    config = Object.assign({}, newConfig);
    syncUniforms();
    atlasDirty = atlasDirty || ['glyphSet', 'customGlyphSet', 'fontFamily', 'fontWeight'].some(function (key) {
      return prev[key] !== config[key];
    });
    const structureChanged = ['numColumns', 'minTrailLength', 'maxTrailLength', 'minSpeed', 'maxSpeed',
      'useZAxis', 'minZ', 'maxZ', 'perspective'].some(function (key) { return prev[key] !== config[key]; });
    if (atlasDirty || structureChanged) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (atlasDirty) { createTextureAtlas(); atlasDirty = false; }
        initStreams();
      }, STRUCTURAL_REBUILD_MS);
    }
  };
  const destroy = function () {
    cancelAnimationFrame(animationFrameId);
    clearTimeout(debounceTimer);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    atlas.dispose();
    geometry.dispose();
    material.dispose();
    fadeMat.dispose();
    fadeMesh.geometry.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  syncUniforms();
  createTextureAtlas();
  initStreams();
  renderer.clear();
  animationFrameId = requestAnimationFrame(animate);
  return { update: update, destroy: destroy, resize: resize };
}
`;
