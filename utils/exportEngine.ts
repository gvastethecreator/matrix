import { directionVectors, colorModes, mouseEffects, streamMovements } from '../config/constants.ts';
import { GLYPH_SET_TABLE } from '../config/glyphSet.ts';
import { MAX_GLYPHS, MAX_STREAMS, STRUCTURAL_REBUILD_MS } from '../config/motion.ts';

export const getAnimationLogicString = (): string => `
function runMatrixAnimation(THREE, canvas, initialConfig) {
  const directionVectors = ${JSON.stringify(directionVectors)};
  const colorModes = ${JSON.stringify(colorModes)};
  const mouseEffects = ${JSON.stringify(mouseEffects)};
  const streamMovements = ${JSON.stringify(streamMovements)};
  const GLYPH_SET_TABLE = ${JSON.stringify(GLYPH_SET_TABLE)};
  const MAX_GLYPHS = ${MAX_GLYPHS};
  const MAX_STREAMS = ${MAX_STREAMS};
  const STRUCTURAL_REBUILD_MS = ${STRUCTURAL_REBUILD_MS};
  const STREAM_TEXTURE_WIDTH = 1024;
  const STREAM_STRIDE = 8;
  const BLOOM_LEVELS = 6;
  const ATLAS_FONT_PX = 64;
  // WebGPU guarantees 8192; WebGL2 desktop GPUs report at least that.
  const MAX_ATLAS_SIZE = 8192;
  const T = THREE.TSL;
  const float = T.float, vec2 = T.vec2, vec3 = T.vec3, vec4 = T.vec4, ivec2 = T.ivec2;
  const uniform = T.uniform, texture = T.texture, textureLoad = T.textureLoad, uv = T.uv;
  const mix = T.mix, step = T.step, fract = T.fract, floor = T.floor, abs = T.abs, max = T.max, min = T.min;
  const clamp = T.clamp, exp = T.exp, pow = T.pow, sin = T.sin, cos = T.cos, sign = T.sign, mod = T.mod;
  const length = T.length, dot = T.dot, select = T.select, smoothstep = T.smoothstep;

  let config = Object.assign({}, initialConfig);
  let width = Math.max(canvas.clientWidth || window.innerWidth, 100);
  let height = Math.max(canvas.clientHeight || window.innerHeight, 100);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const forceWebGL = typeof location !== 'undefined' && /[?&]webgl\\b/.test(location.search);
  let time = 0;
  let lastFrame = null;
  let animationFrameId;
  let debounceTimer;
  let atlasDirty = false;
  let ready = false;
  let destroyed = false;
  let mouseInside = false;
  let splashAge = 1;
  let streamCount = 0;
  let atlas = null;
  let messageTexture = null;
  let messageLevel = 0;
  const dir = new THREE.Vector2(0, -1);

  const scene = new THREE.Scene();
  const calculateFov = function () {
    return 2 * Math.atan(height / (2 * config.perspective)) * (180 / Math.PI);
  };
  const camera = new THREE.PerspectiveCamera(calculateFov(), width / height, 1, 4000);
  camera.position.z = config.perspective;
  const renderer = new THREE.WebGPURenderer({
    canvas: canvas, antialias: false, alpha: false,
    powerPreference: 'high-performance', forceWebGL: forceWebGL,
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.autoClear = false;

  const createTarget = function () {
    return new THREE.RenderTarget(1, 1, {
      type: THREE.HalfFloatType, depthBuffer: false,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
  };
  const rainTarget = createTarget();
  const bloomTargets = Array.from({ length: BLOOM_LEVELS }, createTarget);
  const emptyTexture = new THREE.DataTexture(new Uint8Array(4), 1, 1);
  emptyTexture.needsUpdate = true;
  const streamData = new Float32Array(STREAM_TEXTURE_WIDTH * Math.ceil(MAX_STREAMS * 2 / STREAM_TEXTURE_WIDTH) * 4);
  const streamTexture = new THREE.DataTexture(streamData, STREAM_TEXTURE_WIDTH, streamData.length / 4 / STREAM_TEXTURE_WIDTH, THREE.RGBAFormat, THREE.FloatType);
  streamTexture.needsUpdate = true;

  const U = {
    time: uniform(0),
    trail: uniform(1),
    fontSize: uniform(config.fontSize),
    spacing: uniform(config.characterSpacing),
    cellScale: uniform(1),
    atlasGrid: uniform(new THREE.Vector2(1, 1)),
    glyphCount: uniform(1),
    view: uniform(new THREE.Vector2(width, height)),
    perspective: uniform(config.perspective),
    useZ: uniform(0),
    zRange: uniform(new THREE.Vector2()),
    trailRange: uniform(new THREE.Vector2()),
    dir: uniform(dir),
    cellSnap: uniform(1),
    movement: uniform(0),
    amplitude: uniform(0),
    frequency: uniform(0),
    rotation: uniform(0),
    spin: uniform(0),
    swapRate: uniform(0),
    glitchChance: uniform(0),
    colorMode: uniform(0),
    glyphColor: uniform(new THREE.Color()),
    leaderColor: uniform(new THREE.Color()),
    speedSpan: uniform(0),
    depthBlur: uniform(0),
    mouse: uniform(new THREE.Vector2()),
    mouseStrength: uniform(0),
    mouseEffect: uniform(0),
    mouseRadius: uniform(1),
    mouseForce: uniform(0),
    splash: uniform(new THREE.Vector2()),
    splashStrength: uniform(0),
    splashRadius: uniform(1),
    splashForce: uniform(0),
    messageOn: uniform(0),
    messageGrid: uniform(new THREE.Vector2(1, 1)),
    fade: uniform(0),
    bloomOn: uniform(1),
    bloomStrength: uniform(1),
    bloomWeight: uniform(1),
    tint: uniform(new THREE.Color()),
    tintMix: uniform(0),
    background: uniform(new THREE.Color()),
    resolution: uniform(new THREE.Vector2(1, 1)),
    pixelRatio: uniform(pixelRatio),
    aberration: uniform(0),
    scanlines: uniform(0),
    vignette: uniform(0),
    grain: uniform(0),
  };

  const hash11 = function (p) {
    let q = fract(float(p).mul(0.1031));
    q = q.mul(q.add(33.33));
    q = q.mul(q.add(q));
    return fract(q);
  };
  const hash12 = function (p) {
    let p3 = fract(vec3(p.x, p.y, p.x).mul(0.1031));
    p3 = p3.add(dot(p3, p3.yzx.add(33.33)));
    return fract(p3.x.add(p3.y).mul(p3.z));
  };
  const hsl = function (h, s, l) {
    const rgb = clamp(abs(mod(float(h).mul(6).add(vec3(0, 4, 2)), 6).sub(3)).sub(1), 0, 1);
    return rgb.sub(0.5).mul(float(1).sub(abs(float(l).mul(2).sub(1)))).mul(s).add(l);
  };
  const is = function (node, value) { return node.equal(value); };
  const glyphUv = function (glyph) {
    const atlasCell = vec2(mod(glyph, U.atlasGrid.x), floor(glyph.div(U.atlasGrid.x)));
    return vec2(atlasCell.x.add(uv().x).div(U.atlasGrid.x), float(1).sub(atlasCell.y.add(1).sub(uv().y).div(U.atlasGrid.y)));
  };
  const glyphFor = function (glyphSeed, cellId, rateScale) {
    const rate = U.swapRate.mul(60).mul(hash12(vec2(glyphSeed, cellId.mul(1.7))).add(0.35)).mul(rateScale);
    const tick = floor(U.time.mul(rate).add(hash12(vec2(glyphSeed.mul(3.3), cellId)).mul(7)));
    return floor(hash12(vec2(glyphSeed.add(cellId.mul(0.618)), tick)).mul(U.glyphCount));
  };
  const atlasNodes = [];
  const messageNodes = [];
  const glyphMaterial = function (vUv, vColor, vBlur) {
    const sample = texture(emptyTexture, vUv).bias(vBlur);
    atlasNodes.push(sample);
    const coverage = sample.a;
    const material = new THREE.NodeMaterial();
    material.fragmentNode = vec4(vColor.rgb.mul(coverage), vColor.a.mul(coverage));
    material.transparent = true;
    material.depthTest = false;
    material.depthWrite = false;
    // Premultiplied over: three r185's WebGL2 backend has no Min/Max blend equations.
    material.blending = THREE.CustomBlending;
    material.blendSrc = material.blendSrcAlpha = THREE.OneFactor;
    material.blendDst = material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    return material;
  };

  const rainMaterial = (function () {
    const id = float(T.instanceIndex);
    const stream = floor(id.add(0.5).div(U.trail));
    const index = id.sub(stream.mul(U.trail));
    const texel = stream.mul(2);
    const row = floor(texel.add(0.5).div(STREAM_TEXTURE_WIDTH));
    const column = texel.sub(row.mul(STREAM_TEXTURE_WIDTH));
    const a = textureLoad(streamTexture, ivec2(column, row));
    const b = textureLoad(streamTexture, ivec2(column.add(1), row));
    const len = clamp(floor(mix(U.trailRange.x, U.trailRange.y.add(1), b.z)), 1, U.trail);
    const alive = step(index.add(0.5), len);
    const z = max(U.perspective.oneMinus(), mix(U.zRange.x, U.zRange.y, b.y)).mul(U.useZ);
    const depth = U.perspective.add(z).div(U.perspective);
    const halfView = U.view.mul(depth.mul(0.5));
    const perp = vec2(U.dir.y.negate(), U.dir.x);
    const alongHalf = abs(U.dir.x).mul(halfView.x).add(abs(U.dir.y).mul(halfView.y));
    const acrossHalf = abs(perp.x).mul(halfView.x).add(abs(perp.y).mul(halfView.y));
    const cell = U.fontSize.mul(U.spacing);
    const head = a.y.sub(alongHalf).sub(cell);
    const headCell = floor(head.div(cell));
    const snap = U.cellSnap.greaterThan(0.5);
    const laneFree = a.x.mul(acrossHalf.add(U.fontSize));
    const lane = select(snap, floor(laneFree.div(U.fontSize)).add(0.5).mul(U.fontSize), laneFree);
    const along = select(snap, headCell.sub(index).mul(cell), head.sub(index.mul(cell)));
    const cellId = select(snap, headCell.sub(index), index);
    const frac = select(snap, head.div(cell).sub(headCell), float(0));
    const seed = a.z.mul(1000);
    const glyphSeed = select(snap, floor(lane.div(U.fontSize)).mul(1.37).add(floor(b.y.mul(64)).mul(97).mul(U.useZ)), seed);

    const phase = U.time.mul(U.frequency).mul(6).add(seed);
    const offset = select(is(U.movement, 1), perp.mul(sin(phase).mul(U.amplitude)),
      select(is(U.movement, 2), perp.mul(sign(sin(phase)).mul(U.amplitude)),
        select(is(U.movement, 3), perp.mul(cos(phase)).add(U.dir.mul(sin(phase))).mul(U.amplitude), vec2(0))));
    const world0 = U.dir.mul(along).add(perp.mul(lane)).add(offset);
    const normalizedY = clamp(world0.y.add(halfView.y).div(halfView.y.mul(2)), 0, 1);

    const delta = world0.sub(U.mouse);
    const distance = max(length(delta), 0.001);
    const force = max(float(0), float(1).sub(distance.div(U.mouseRadius))).mul(U.mouseForce).mul(U.mouseStrength);
    const push = delta.div(distance).mul(force.mul(9));
    const scale = float(1).add(select(is(U.mouseEffect, 0), force.mul(0.45), float(0)));
    const world1 = world0.add(select(is(U.mouseEffect, 1), push.negate(),
      select(is(U.mouseEffect, 2), push,
        select(is(U.mouseEffect, 3), vec2(delta.y.negate(), delta.x).div(distance).mul(force.mul(9)), vec2(0)))));
    const splashDelta = world1.sub(U.splash);
    const splashDistance = max(length(splashDelta), 0.001);
    const ringOffset = splashDistance.sub(U.splashStrength.oneMinus().mul(U.splashRadius).mul(2.5)).div(U.fontSize.mul(2.5));
    const ring = exp(ringOffset.mul(ringOffset).negate()).mul(U.splashStrength);
    const world2 = world1.add(splashDelta.div(splashDistance)
      .mul(max(float(0), float(1).sub(splashDistance.div(U.splashRadius))).mul(U.splashForce).mul(U.splashStrength).mul(9)));

    const leader = step(index, 0.5);
    const glyph = glyphFor(glyphSeed, cellId, mix(1, 4, leader));
    const glitch = step(U.glitchChance.oneMinus(), hash12(vec2(seed, floor(U.time.mul(12)))));
    const world = vec2(world2.x.add(glitch.mul(hash11(seed.add(index)).sub(0.5)).mul(U.fontSize)), world2.y);

    const hue = a.w;
    const gradient = normalizedY.mul(0.7);
    const speed = select(U.speedSpan.equal(0), float(0.5), b.x);
    const base = select(is(U.colorMode, 1), hsl(hue, 0.85, 0.48),
      select(is(U.colorMode, 2), hsl(gradient, 0.8, 0.45),
        select(is(U.colorMode, 3), hsl(float(0.35).sub(speed.mul(0.35)), 0.9, speed.mul(0.2).add(0.4)), vec3(U.glyphColor))));
    const lead = select(is(U.colorMode, 1), hsl(hue, 0.85, 0.75),
      select(is(U.colorMode, 2), hsl(gradient, 0.8, 0.72),
        select(is(U.colorMode, 3), hsl(float(0.35).sub(speed.mul(0.35)), 0.9, 0.75), vec3(U.leaderColor))));

    const clip = T.cameraProjectionMatrix.mul(T.cameraViewMatrix).mul(vec4(world, z.negate(), 1));
    const messageSample = texture(emptyTexture, clip.xy.div(clip.w).mul(0.5).add(0.5)).level(0);
    messageNodes.push(messageSample);
    const message = messageSample.r.mul(U.messageOn);

    const fade = clamp(float(1).sub(index.add(frac).div(len)), 0, 1);
    const headHeat = exp(index.mul(-0.9));
    const shimmer = select(leader.greaterThan(0.5),
      hash12(vec2(seed, floor(U.time.mul(24)))).mul(0.4).add(0.8),
      hash12(vec2(glyphSeed, cellId.mul(9.1))).mul(0.45).add(0.7));
    const depthN = clamp(z.sub(U.zRange.x).div(max(U.zRange.y.sub(U.zRange.x), 1)), 0, 1).mul(U.useZ);
    const brightness = pow(fade, 1.5).mul(shimmer).mul(headHeat.mul(1.8).add(1))
      .mul(mix(1, 0.4, depthN))
      .mul(mix(float(1).sub(U.messageOn.mul(0.5)), 2.2, message))
      .mul(float(1).add(force.mul(0.04)).add(glitch.mul(1.5)))
      .add(ring.mul(2.5));
    const trail = mix(base.mul(base), base, fade);
    const color = mix(trail, lead, clamp(headHeat.add(ring.mul(0.8)).add(message.mul(0.35)), 0, 1));

    const angle = U.rotation.add(U.time.mul(U.spin)).mul(Math.PI / 180);
    const p = T.positionLocal.xy;
    const local = vec2(cos(angle).mul(p.x).sub(sin(angle).mul(p.y)), sin(angle).mul(p.x).add(cos(angle).mul(p.y)));
    const material = glyphMaterial(
      glyphUv(glyph).toVarying(),
      vec4(color.mul(brightness).mul(alive), clamp(fade.mul(1.6), 0, 1).mul(alive)).toVarying(),
      U.depthBlur.mul(depthN).mul(3.5).toVarying()
    );
    material.positionNode = vec3(world.add(local.mul(U.fontSize.mul(U.cellScale).mul(scale).mul(alive))), z.negate());
    return material;
  })();

  const messageMaterial = (function () {
    const id = float(T.instanceIndex);
    const row = floor(id.add(0.5).div(U.messageGrid.x));
    const column = id.sub(row.mul(U.messageGrid.x));
    const cell = U.fontSize.mul(U.spacing);
    const world = vec2(column.sub(floor(U.messageGrid.x.mul(0.5))).add(0.5).mul(U.fontSize), floor(U.messageGrid.y.mul(0.5)).sub(row).mul(cell));
    const maskSample = texture(emptyTexture, world.div(U.view).add(0.5)).level(0);
    messageNodes.push(maskSample);
    const mask = maskSample.r.mul(U.messageOn);
    const alive = step(0.05, mask);
    const glyphSeed = floor(world.x.div(U.fontSize)).mul(1.37);
    const cellId = world.y.negate().div(cell);
    const columnSeed = hash11(column.mul(1.37).add(0.5));
    const wave = fract(U.time.mul(columnSeed.mul(0.3).add(0.18)).sub(row.mul(0.035)).add(columnSeed.mul(7)));
    const drop = pow(wave, 10);
    const brightness = hash12(vec2(glyphSeed, cellId.mul(9.1))).mul(0.2).add(0.5).add(drop.mul(2.4)).mul(mask);
    const color = mix(vec3(U.glyphColor), vec3(U.leaderColor), clamp(drop.mul(1.5), 0, 1));
    const material = glyphMaterial(
      glyphUv(glyphFor(glyphSeed, cellId, float(1))).toVarying(),
      vec4(color.mul(brightness).mul(alive), mask.mul(alive)).toVarying(),
      float(0)
    );
    material.positionNode = vec3(world.add(T.positionLocal.xy.mul(U.fontSize.mul(U.cellScale).mul(alive))), 0);
    return material;
  })();

  const createGlyphMesh = function (material) {
    const geometry = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1);
    geometry.setIndex(plane.index);
    geometry.setAttribute('position', plane.attributes.position);
    geometry.setAttribute('uv', plane.attributes.uv);
    plane.dispose();
    geometry.instanceCount = 0;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  };
  const mesh = createGlyphMesh(rainMaterial);
  const messageMesh = createGlyphMesh(messageMaterial);
  messageMesh.renderOrder = -1;

  const passMaterial = function (node, blending) {
    const material = new THREE.NodeMaterial();
    material.fragmentNode = node;
    material.depthTest = false;
    material.depthWrite = false;
    if (blending) Object.assign(material, { transparent: true, blending: THREE.CustomBlending }, blending);
    return material;
  };
  const sampleAt = function (source, offset) { return texture(source, uv().add(offset)); };
  const fadeQuad = new THREE.QuadMesh(passMaterial(vec4(0, 0, 0, U.fade), {
    blendSrc: THREE.ZeroFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  }));
  const downPasses = bloomTargets.map(function (target, i) {
    const source = i === 0 ? rainTarget : bloomTargets[i - 1];
    const half = uniform(new THREE.Vector2());
    const node = sampleAt(source.texture, vec2(0)).mul(4)
      .add(sampleAt(source.texture, half.negate()))
      .add(sampleAt(source.texture, half))
      .add(sampleAt(source.texture, vec2(half.x, half.y.negate())))
      .add(sampleAt(source.texture, vec2(half.x.negate(), half.y)))
      .div(8);
    return { source: source, target: target, half: half, quad: new THREE.QuadMesh(passMaterial(node)) };
  });
  const upPasses = bloomTargets.slice(1).map(function (source, i) {
    const half = uniform(new THREE.Vector2());
    const h = function (x, y) { return sampleAt(source.texture, vec2(half.x.mul(x), half.y.mul(y))); };
    const node = h(-2, 0).add(h(-1, 1).mul(2)).add(h(0, 2)).add(h(1, 1).mul(2))
      .add(h(2, 0)).add(h(1, -1).mul(2)).add(h(0, -2)).add(h(-1, -1).mul(2))
      .div(12).mul(U.bloomWeight);
    const material = passMaterial(node, { blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor });
    return { source: source, target: bloomTargets[i], half: half, quad: new THREE.QuadMesh(material) };
  }).reverse();
  const compositeQuad = new THREE.QuadMesh(passMaterial((function () {
    const coord = uv();
    const glitchTick = floor(U.time.mul(18));
    const band = hash11(glitchTick.mul(3.1));
    const bandSize = hash11(glitchTick.mul(5.3)).mul(0.07).add(0.01);
    const glitching = hash11(glitchTick.mul(1.7)).lessThan(U.glitchChance.mul(0.5)).and(abs(coord.y.sub(band)).lessThan(bandSize));
    const shifted = vec2(coord.x.add(select(glitching, hash11(glitchTick.mul(7.9)).sub(0.5).mul(0.06), float(0))), coord.y);
    const centered = shifted.sub(0.5);
    const shift = centered.mul(dot(centered, centered)).mul(U.aberration.mul(0.06));
    const rain = texture(rainTarget.texture, shifted);
    const light = vec3(texture(rainTarget.texture, shifted.add(shift)).r, rain.g, texture(rainTarget.texture, shifted.sub(shift)).b);
    const bloom = texture(bloomTargets[0].texture, shifted).rgb;
    const tinted = mix(bloom, vec3(U.tint).mul(dot(bloom, vec3(0.299, 0.587, 0.114))), U.tintMix);
    let color = vec3(U.background).mul(clamp(rain.a, 0, 1).oneMinus()).add(light).add(tinted.mul(U.bloomStrength).mul(U.bloomOn));
    color = color.add(max(max(color.r, max(color.g, color.b)).sub(1), 0).mul(0.6));
    const fragment = T.screenCoordinate;
    color = color.mul(float(1).sub(U.scanlines.mul(0.4).mul(sin(fragment.y.mul(Math.PI).div(U.pixelRatio.mul(1.5))).mul(0.5).add(0.5))));
    const aspect = centered.mul(vec2(U.resolution.x.div(U.resolution.y), 1));
    color = color.mul(mix(float(1), smoothstep(0.2, 1.15, length(aspect)).oneMinus(), U.vignette));
    color = color.add(hash12(fragment.xy.add(fract(U.time.mul(7.31)).mul(911))).sub(0.5).mul(U.grain.mul(0.18)));
    color = color.add(hash12(fragment.xy.mul(1.37)).sub(0.5).div(255));
    return vec4(color, 1);
  })()));

  const setDisplayColor = function (color, hex) {
    color.set(hex).convertLinearToSRGB();
  };

  const syncUniforms = function () {
    U.fontSize.value = config.fontSize;
    U.spacing.value = config.characterSpacing;
    U.perspective.value = config.perspective;
    U.useZ.value = config.useZAxis ? 1 : 0;
    U.zRange.value.set(Math.min(config.minZ, config.maxZ), Math.max(config.minZ, config.maxZ));
    U.trailRange.value.set(config.minTrailLength, config.maxTrailLength);
    U.cellSnap.value = config.cellSnap ? 1 : 0;
    U.movement.value = streamMovements.indexOf(config.streamMovement);
    U.amplitude.value = config.movementAmplitude;
    U.frequency.value = config.movementFrequency;
    U.rotation.value = config.baseRotation;
    U.spin.value = config.rotationSpeed;
    U.swapRate.value = config.characterSwapRate;
    U.glitchChance.value = config.glitchChance;
    U.colorMode.value = colorModes.indexOf(config.colorMode);
    setDisplayColor(U.glyphColor.value, config.glyphColor);
    setDisplayColor(U.leaderColor.value, config.leaderColor);
    U.speedSpan.value = config.maxSpeed - config.minSpeed;
    U.depthBlur.value = config.depthOfField;
    U.mouseEffect.value = mouseEffects.indexOf(config.mouseEffect);
    U.mouseRadius.value = Math.max(1, config.mouseRadius);
    U.mouseForce.value = config.mouseForce;
    U.splashRadius.value = Math.max(1, config.splashRadius);
    U.splashForce.value = config.splashForce;
    U.bloomOn.value = config.useGlow ? 1 : 0;
    let bloomWeight = 0;
    for (let i = 0; i < BLOOM_LEVELS; i++) bloomWeight += Math.pow(config.bloomRadius, i);
    U.bloomStrength.value = config.glowIntensity * 0.9 / bloomWeight;
    U.bloomWeight.value = config.bloomRadius;
    setDisplayColor(U.tint.value, config.glowColor);
    U.tintMix.value = U.tint.value.getHex() === 0 ? 0 : 0.55;
    setDisplayColor(U.background.value, config.backgroundColor);
    U.aberration.value = config.chromaticAberration;
    U.scanlines.value = config.scanlines;
    U.vignette.value = config.vignette;
    U.grain.value = config.grain;
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
    const fontAt = function (px) { return config.fontWeight + ' ' + px + 'px ' + config.fontFamily + ', monospace'; };
    ctx.font = fontAt(ATLAS_FONT_PX);
    let tallest = 0;
    let widest = 0;
    chars.forEach(function (char) {
      const m = ctx.measureText(char);
      tallest = Math.max(tallest, (m.actualBoundingBoxAscent || 0) + (m.actualBoundingBoxDescent || 0));
      widest = Math.max(widest, m.width);
    });
    // Narrow sets such as half-width katakana are scaled up so every set fills the cell.
    const glyphScale = tallest > 0 ? Math.min(3, Math.max(1, ATLAS_FONT_PX * 0.8 / tallest)) : 1;
    const font = fontAt(Math.round(ATLAS_FONT_PX * glyphScale));
    const cellSize = Math.ceil(Math.max(ATLAS_FONT_PX, widest * glyphScale) + 24);
    const maxCells = Math.floor(MAX_ATLAS_SIZE / cellSize);
    const columns = Math.min(maxCells, Math.ceil(Math.sqrt(chars.length)));
    const rows = Math.ceil(chars.length / columns);
    if (rows > maxCells) throw new Error('El conjunto de caracteres supera el tamaño de textura de esta GPU.');
    atlasCanvas.width = columns * cellSize;
    atlasCanvas.height = rows * cellSize;
    ctx.font = font;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mirrorFilm = config.glyphSet === 'film';
    chars.forEach(function (char, i) {
      const x = (i % columns + 0.5) * cellSize;
      const y = (Math.floor(i / columns) + 0.5) * cellSize;
      if (mirrorFilm && /[\\uFF66-\\uFF9D]/.test(char)) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(char, x, y);
      }
    });
    const next = new THREE.CanvasTexture(atlasCanvas);
    next.minFilter = THREE.LinearMipmapLinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.generateMipmaps = true;
    if (atlas) atlas.dispose();
    atlas = next;
    atlasNodes.forEach(function (node) { node.value = atlas; });
    U.atlasGrid.value.set(columns, rows);
    U.glyphCount.value = chars.length;
    U.cellScale.value = cellSize / ATLAS_FONT_PX;
  };

  const createMessageTexture = function () {
    const text = typeof config.message === 'string' ? config.message.trim() : '';
    if (messageTexture) messageTexture.dispose();
    messageTexture = null;
    messageNodes.forEach(function (node) { node.value = emptyTexture; });
    if (!text) return;
    const maskCanvas = document.createElement('canvas');
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    maskCanvas.width = 1024;
    maskCanvas.height = Math.max(1, Math.round(1024 * height / width));
    ctx.font = 'bold 100px ' + config.fontFamily + ', monospace';
    const words = text.split(/\\s+/);
    let lines = [];
    let px = 0;
    for (let count = 1; count <= Math.min(3, words.length); count++) {
      const perLine = Math.ceil(words.length / count);
      const candidate = [];
      for (let i = 0; i < words.length; i += perLine) candidate.push(words.slice(i, i + perLine).join(' '));
      const widest = candidate.reduce(function (size, line) { return Math.max(size, ctx.measureText(line).width); }, 1);
      const size = Math.min(maskCanvas.width * 0.88 / widest * 100, maskCanvas.height * 0.72 / (candidate.length * 1.1));
      if (size > px) { px = size; lines = candidate; }
    }
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    ctx.font = 'bold ' + px + 'px ' + config.fontFamily + ', monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach(function (line, i) {
      ctx.fillText(line, maskCanvas.width / 2, maskCanvas.height / 2 + (i - (lines.length - 1) / 2) * px * 1.1);
    });
    messageTexture = new THREE.CanvasTexture(maskCanvas);
    messageNodes.forEach(function (node) { node.value = messageTexture; });
    messageLevel = 0;
  };
  const sizeMessageGrid = function () {
    const columns = Math.ceil(width / config.fontSize) + 2;
    const rows = Math.ceil(height / (config.fontSize * config.characterSpacing)) + 2;
    U.messageGrid.value.set(columns, rows);
    messageMesh.geometry.instanceCount = messageTexture ? columns * rows : 0;
  };

  const streamDepth = function (o) {
    if (!config.useZAxis) return 1;
    const minZ = Math.min(config.minZ, config.maxZ);
    const maxZ = Math.max(config.minZ, config.maxZ);
    const z = Math.max(1 - config.perspective, minZ + (maxZ - minZ) * streamData[o + 5]);
    return (config.perspective + z) / config.perspective;
  };
  const streamTravel = function (o) {
    const alongHalf = (Math.abs(dir.x) * width + Math.abs(dir.y) * height) * 0.5 * streamDepth(o);
    const cell = config.fontSize * config.characterSpacing;
    const length = config.minTrailLength + (config.maxTrailLength + 1 - config.minTrailLength) * streamData[o + 6];
    return 2 * alongHalf + (length + 2) * cell + 2 * config.movementAmplitude;
  };
  const spawnStream = function (i, progress) {
    const o = i * STREAM_STRIDE;
    streamData[o] = Math.random() * 2 - 1;
    streamData[o + 2] = Math.random();
    streamData[o + 3] = Math.random();
    streamData[o + 4] = Math.random();
    streamData[o + 5] = Math.random();
    streamData[o + 6] = Math.random();
    streamData[o + 1] = progress * streamTravel(o);
  };

  const initStreams = function (intro) {
    const trail = Math.min(MAX_GLYPHS, Math.max(1, Math.floor(config.maxTrailLength)));
    streamCount = Math.min(Math.max(1, Math.floor(config.numColumns)), Math.floor(MAX_GLYPHS / trail), MAX_STREAMS);
    mesh.geometry.instanceCount = streamCount * trail;
    U.trail.value = trail;
    for (let i = 0; i < streamCount; i++) spawnStream(i, intro ? -Math.random() * 0.45 : Math.random());
  };

  const sizeTargets = function () {
    const w = Math.max(1, Math.round(width * pixelRatio));
    const h = Math.max(1, Math.round(height * pixelRatio));
    rainTarget.setSize(w, h);
    bloomTargets.forEach(function (target, i) {
      target.setSize(Math.max(1, w >> (i + 1)), Math.max(1, h >> (i + 1)));
    });
    downPasses.forEach(function (pass) { pass.half.value.set(0.5 / pass.source.width, 0.5 / pass.source.height); });
    upPasses.forEach(function (pass) { pass.half.value.set(0.5 / pass.source.width, 0.5 / pass.source.height); });
    U.resolution.value.set(w, h);
    if (!ready) return;
    renderer.setRenderTarget(rainTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
  };

  const resize = function (w, h) {
    if (w === width && h === height) return;
    width = Math.max(w, 100);
    height = Math.max(h, 100);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    U.view.value.set(width, height);
    syncUniforms();
    sizeTargets();
    createMessageTexture();
    initStreams(time === 0);
  };
  const resizeObserver = new ResizeObserver(function (entries) {
    const rect = entries[0].contentRect;
    if (rect.width > 0 && rect.height > 0) resize(rect.width, rect.height);
  });
  resizeObserver.observe(canvas);
  const onMove = function (event) {
    const rect = canvas.getBoundingClientRect();
    U.mouse.value.set(
      (event.clientX - rect.left) * width / rect.width - width / 2,
      height / 2 - (event.clientY - rect.top) * height / rect.height
    );
    mouseInside = true;
  };
  const splash = function () {
    if (!config.useSplashEffect) return;
    U.splash.value.copy(U.mouse.value);
    splashAge = 0;
  };
  const onDown = function (event) {
    onMove(event);
    splash();
  };
  const onLeave = function () {
    if (mouseInside) splash();
    mouseInside = false;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerleave', onLeave);

  const renderPass = function (quad, target) {
    renderer.setRenderTarget(target);
    quad.render(renderer);
  };

  const animate = function (timestamp) {
    if (document.hidden) { lastFrame = null; return; }
    const dt = lastFrame === null ? 0 : Math.min(Math.max(0, (timestamp - lastFrame) / 1000), 0.05);
    lastFrame = timestamp;
    time += dt;
    U.time.value = time;
    const smoothing = 1 - Math.pow(0.9, dt * 60);
    U.mouseStrength.value += ((mouseInside ? 1 : 0) - U.mouseStrength.value) * smoothing;
    splashAge += dt;
    U.splashStrength.value = config.useSplashEffect ? Math.max(0, 1 - splashAge) : 0;
    messageLevel = messageTexture ? Math.min(1, messageLevel + dt * 0.4) : 0;
    U.messageOn.value = messageLevel * messageLevel * (3 - 2 * messageLevel);
    sizeMessageGrid();
    const mouse = U.mouse.value;
    const drift = config.cameraDrift * config.perspective * 0.12;
    const follow = U.mouseStrength.value;
    camera.position.x += (drift * (Math.sin(time * 0.11) + mouse.x / width * follow) - camera.position.x) * smoothing * 0.25;
    camera.position.y += (drift * (Math.sin(time * 0.07 + 1.3) * 0.6 + mouse.y / height * follow) - camera.position.y) * smoothing * 0.25;
    camera.lookAt(0, 0, 0);
    const target = directionVectors[config.streamDirection];
    dir.set(dir.x + (target[0] - dir.x) * smoothing, dir.y + (target[1] - dir.y) * smoothing).normalize();

    const span = config.maxSpeed - config.minSpeed;
    for (let o = 0; o < streamCount * STREAM_STRIDE; o += STREAM_STRIDE) {
      streamData[o + 1] += (config.minSpeed + span * streamData[o + 4]) * dt * 60;
      if (streamData[o + 1] > streamTravel(o)) spawnStream(o / STREAM_STRIDE, 0);
    }
    streamTexture.needsUpdate = true;

    const fade = config.useGhosting ? config.fadeOutSpeed * (1 - config.ghostingIntensity) : config.fadeOutSpeed;
    U.fade.value = 1 - Math.pow(1 - fade, dt * 60);
    renderPass(fadeQuad, rainTarget);
    renderer.render(scene, camera);
    if (config.useGlow) {
      downPasses.forEach(function (pass) { renderPass(pass.quad, pass.target); });
      upPasses.forEach(function (pass) { renderPass(pass.quad, pass.target); });
    }
    renderPass(compositeQuad, null);
    animationFrameId = requestAnimationFrame(animate);
  };
  const onVisibility = function () {
    cancelAnimationFrame(animationFrameId);
    lastFrame = null;
    if (ready && !document.hidden) animationFrameId = requestAnimationFrame(animate);
  };
  document.addEventListener('visibilitychange', onVisibility);

  const rebuild = function () {
    if (atlasDirty) { createTextureAtlas(); atlasDirty = false; }
    initStreams(false);
  };
  const update = function (newConfig) {
    const prev = config;
    config = Object.assign({}, newConfig);
    syncUniforms();
    if (prev.message !== config.message || prev.fontFamily !== config.fontFamily) createMessageTexture();
    atlasDirty = atlasDirty || ['glyphSet', 'customGlyphSet', 'fontFamily', 'fontWeight'].some(function (key) {
      return prev[key] !== config[key];
    });
    const structureChanged = prev.numColumns !== config.numColumns || prev.maxTrailLength !== config.maxTrailLength;
    if (atlasDirty || structureChanged) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(rebuild, STRUCTURAL_REBUILD_MS);
    }
  };
  const destroy = function () {
    destroyed = true;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(debounceTimer);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointerleave', onLeave);
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (atlas) atlas.dispose();
    if (messageTexture) messageTexture.dispose();
    emptyTexture.dispose();
    streamTexture.dispose();
    [mesh, messageMesh].forEach(function (m) { m.geometry.dispose(); m.material.dispose(); });
    [fadeQuad, compositeQuad].concat(downPasses.map(function (p) { return p.quad; }), upPasses.map(function (p) { return p.quad; }))
      .forEach(function (quad) { quad.material.dispose(); });
    rainTarget.dispose();
    bloomTargets.forEach(function (t) { t.dispose(); });
    renderer.dispose();
  };
  syncUniforms();
  sizeTargets();
  createMessageTexture();
  const whenReady = renderer.init().then(function () {
    if (destroyed) return null;
    ready = true;
    createTextureAtlas();
    initStreams(true);
    sizeTargets();
    animationFrameId = requestAnimationFrame(animate);
    return renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
  });
  return { update: update, destroy: destroy, resize: resize, ready: whenReady };
}
`;
