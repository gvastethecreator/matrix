import { directionVectors } from '../config/constants.ts';
import { GLYPH_SET_TABLE } from '../config/glyphSet.ts';
import { MAX_GLYPHS, STRUCTURAL_REBUILD_MS } from '../config/motion.ts';

const VERTEX_SHADER = `
attribute vec4 aGlyphUv;
attribute vec4 aGlyphColor;
varying vec2 vUv;
varying vec4 vColor;
void main() {
    vUv = uv * aGlyphUv.zw + aGlyphUv.xy;
    vColor = aGlyphColor;
    vec4 localPosition = vec4(position, 1.0);
    #ifdef USE_INSTANCING
        localPosition = instanceMatrix * localPosition;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
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
        vec3 glowColor = uGlowColor;
        if (dot(glowColor, glowColor) < 0.0001) {
            glowColor = base;
        }
        vec3 glow = glowColor * uGlowIntensity * tex.a;
        base = mix(glow, base + glow * 0.3, core);
    }

    gl_FragColor = vec4(base * flicker, vColor.a * tex.a);
}
`;

export const getAnimationLogicString = (): string => `
function runMatrixAnimation(THREE, canvas, initialConfig) {
  const directionVectors = ${JSON.stringify(directionVectors)};
  const GLYPH_SET_TABLE = ${JSON.stringify(GLYPH_SET_TABLE)};
  const STRUCTURAL_REBUILD_MS = ${STRUCTURAL_REBUILD_MS};
  const MAX_GLYPHS = ${MAX_GLYPHS};
  const VERTEX_SHADER = ${JSON.stringify(VERTEX_SHADER)};
  const FRAGMENT_SHADER = ${JSON.stringify(FRAGMENT_SHADER)};

  function resolveGlyphSet(glyphSet, customGlyphSet) {
    if (glyphSet === 'custom') {
      const custom = typeof customGlyphSet === 'string' ? customGlyphSet : '';
      return custom.trim() ? custom : '?';
    }
    return GLYPH_SET_TABLE[glyphSet] || GLYPH_SET_TABLE.katakana;
  }

  function createGlyphSetCache() {
    let lastSet = '';
    let lastCustom = '';
    let lastValue = '';
    return function cached(glyphSet, customGlyphSet) {
      const custom = customGlyphSet == null ? '' : customGlyphSet;
      if (glyphSet === lastSet && custom === lastCustom && lastValue !== '') {
        return lastValue;
      }
      lastSet = glyphSet;
      lastCustom = custom;
      lastValue = resolveGlyphSet(glyphSet, custom);
      return lastValue;
    };
  }

  function getStreamBounds(width, height, perspective, z) {
    const aspect = width / height;
    const distance = Math.max(1, perspective + z);
    const h = distance * (height / (2 * perspective));
    const w = h * aspect;
    return { w: w, h: h };
  }

  function movementOffset(kind, time, amplitude, frequency, id) {
    if (kind === 'linear' || amplitude === 0) {
      return [0, 0];
    }
    const phase = time * frequency * 6 + id * 0.35;
    if (kind === 'serpentine') {
      return [Math.sin(phase) * amplitude, 0];
    }
    if (kind === 'zigzag') {
      return [Math.sign(Math.sin(phase)) * amplitude, 0];
    }
    return [Math.cos(phase) * amplitude, Math.sin(phase) * amplitude];
  }

  function shouldRebuildAtlas(prev, next) {
    return (
      prev.glyphSet !== next.glyphSet ||
      prev.customGlyphSet !== next.customGlyphSet ||
      prev.fontFamily !== next.fontFamily ||
      prev.fontWeight !== next.fontWeight ||
      prev.fontSize !== next.fontSize
    );
  }

  function shouldUpdateCamera(prev, next) {
    return prev.perspective !== next.perspective;
  }

  function shouldRunAnimation(hidden) {
    return !hidden;
  }

  function clampGlyphBudget(numColumns, maxTrailLength, maxGlyphs) {
    const cap = maxGlyphs == null ? 60000 : maxGlyphs;
    const trail = Math.max(1, maxTrailLength);
    const columns = Math.max(1, Math.floor(numColumns));
    const product = columns * trail;
    if (product <= cap) {
      return columns;
    }
    return Math.max(1, Math.floor(cap / trail));
  }

  function glyphColorForMode(input) {
    function hexToRgb(hex) {
      const normalized = hex.charAt(0) === '#' ? hex.slice(1) : hex;
      const packed = Number.parseInt(normalized.padEnd(6, '0').slice(0, 6), 16);
      if (!Number.isFinite(packed)) {
        return { r: 0, g: 1, b: 0.25 };
      }
      return {
        r: ((packed >> 16) & 255) / 255,
        g: ((packed >> 8) & 255) / 255,
        b: (packed & 255) / 255,
      };
    }
    function hslToRgb(h, s, l) {
      const hue = ((h % 1) + 1) % 1;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
      const m = l - c / 2;
      let r = 0;
      let g = 0;
      let b = 0;
      const sector = Math.floor(hue * 6);
      if (sector === 0) {
        r = c;
        g = x;
        b = 0;
      } else if (sector === 1) {
        r = x;
        g = c;
        b = 0;
      } else if (sector === 2) {
        r = 0;
        g = c;
        b = x;
      } else if (sector === 3) {
        r = 0;
        g = x;
        b = c;
      } else if (sector === 4) {
        r = x;
        g = 0;
        b = c;
      } else {
        r = c;
        g = 0;
        b = x;
      }
      return { r: r + m, g: g + m, b: b + m };
    }
    if (input.colorMode === 'rainbow-stream') {
      return hslToRgb(input.streamHue, 0.85, input.isLeader ? 0.72 : 0.48);
    }
    if (input.colorMode === 'screen-gradient') {
      const y = Math.min(1, Math.max(0, input.normalizedY));
      return hslToRgb(y * 0.7, 0.8, input.isLeader ? 0.7 : 0.45);
    }
    if (input.colorMode === 'speed-based') {
      const span = input.maxSpeed - input.minSpeed;
      const t = span === 0 ? 0.5 : Math.min(1, Math.max(0, (input.speed - input.minSpeed) / span));
      return hslToRgb(0.35 - t * 0.35, 0.9, input.isLeader ? 0.7 : 0.4 + t * 0.2);
    }
    return hexToRgb(input.isLeader ? input.leaderColor : input.glyphColor);
  }

  let config = Object.assign({}, initialConfig);
  let width = Math.max(canvas.clientWidth || window.innerWidth || 1024, 100);
  let height = Math.max(canvas.clientHeight || window.innerHeight || 768, 100);
  let streams = [];
  let mouse = null;
  let time = 0;
  let animationFrameId;
  let splashWorldPos = null;
  let splashTTL = 0;
  const SPLASH_DURATION = 60;
  let running = true;
  let debounceTimer = null;
  let atlasDirty = false;
  const glyphCache = createGlyphSetCache();
  const getGlyphSet = function () {
    return glyphCache(config.glyphSet, config.customGlyphSet);
  };

  const getBoundsForStream = function (stream) {
    return getStreamBounds(width, height, config.perspective, stream.z);
  };

  const resetStreamPosition = function (stream, dir) {
    Object.assign(stream, {
      glyphs: [],
      speed: Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed,
      length: Math.floor(Math.random() * (config.maxTrailLength - config.minTrailLength) + config.minTrailLength),
      z: config.useZAxis ? Math.random() * (config.maxZ - config.minZ) + config.minZ : 0,
      currentDir: directionVectors[dir].slice(),
      directionMultiplier: 1,
      mutationRate: Math.random() * 0.5 + 0.5,
      hue: Math.random(),
    });

    if (stream.z >= config.perspective) {
      stream.z = config.perspective - 10;
    }

    const bounds = getBoundsForStream(stream);
    const margin = 1.1;
    const dv = directionVectors[dir];
    const isH = Math.abs(dv[0]) > 0.1;
    const isV = Math.abs(dv[1]) > 0.1;

    if (isV) {
      stream.x = Math.random() * bounds.w * 2 - bounds.w;
      stream.y = bounds.h * margin * -Math.sign(dv[1]);
    }
    if (isH) {
      if (!isV || Math.random() > 0.5) {
        stream.x = bounds.w * margin * -Math.sign(dv[0]);
        stream.y = Math.random() * bounds.h * 2 - bounds.h;
      }
    }
  };

  const scene = new THREE.Scene();
  const calculateFov = function () {
    return 2 * Math.atan(height / (2 * config.perspective)) * (180 / Math.PI);
  };
  const camera = new THREE.PerspectiveCamera(calculateFov(), width / height, 1, 3000);
  camera.position.set(0, 0, config.perspective);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 1);
  renderer.autoClear = false;

  let atlas;
  const createTextureAtlas = function () {
    const previousTexture = atlas && atlas.texture;
    const chars = Array.from(new Set(getGlyphSet()));
    const atlasCanvas = document.createElement('canvas');
    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 48;
    ctx.font = config.fontWeight + ' ' + fontSize + 'px ' + config.fontFamily + ', monospace';
    const padding = 8;
    const dims = chars.map(function (char) {
      return { char: char, glyphWidth: Math.ceil(ctx.measureText(char).width) };
    });
    const totalW = dims.reduce(function (sum, dimension) {
      return sum + dimension.glyphWidth + padding * 2;
    }, 0);

    atlasCanvas.width = Math.max(totalW, 1);
    atlasCanvas.height = fontSize + padding * 2;
    ctx.font = config.fontWeight + ' ' + fontSize + 'px ' + config.fontFamily + ', monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    const metrics = new Map();
    let curX = 0;
    dims.forEach(function (item) {
      const u = (curX + padding) / atlasCanvas.width;
      const v = padding / atlasCanvas.height;
      const uw = item.glyphWidth / atlasCanvas.width;
      const vh = fontSize / atlasCanvas.height;
      metrics.set(item.char, {
        u: u,
        v: v,
        width: item.glyphWidth * (config.fontSize / fontSize),
        height: config.fontSize,
        uw: uw,
        vh: vh,
      });
      ctx.fillText(item.char, curX + padding, atlasCanvas.height / 2);
      curX += item.glyphWidth + padding * 2;
    });

    const texture = new THREE.CanvasTexture(atlasCanvas);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    atlas = { texture: texture, metrics: metrics, fontHeight: config.fontSize };
    if (previousTexture && previousTexture.dispose) previousTexture.dispose();
  };

  const initStreams = function () {
    const columns = clampGlyphBudget(config.numColumns, config.maxTrailLength, MAX_GLYPHS);
    streams = Array.from({ length: columns }, function (_, i) {
      const s = { id: i };
      resetStreamPosition(s, config.streamDirection);
      return s;
    });
  };

  const maxGlyphs = MAX_GLYPHS;
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAtlas: { value: null },
      uUseGlow: { value: config.useGlow },
      uGlowColor: { value: new THREE.Color(config.glowColor) },
      uGlowIntensity: { value: config.glowIntensity },
      uTime: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, maxGlyphs);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const uvAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxGlyphs * 4), 4);
  geometry.setAttribute('aGlyphUv', uvAttr);
  const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxGlyphs * 4), 4);
  geometry.setAttribute('aGlyphColor', colorAttr);

  const fadeMat = new THREE.MeshBasicMaterial({
    color: config.backgroundColor,
    transparent: true,
    opacity: config.fadeOutSpeed,
    depthWrite: false,
    depthTest: false,
  });
  const fadeMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat);
  const fadeScene = new THREE.Scene();
  fadeScene.add(fadeMesh);
  const fadeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -5, 5);

  const resize = function (w, h) {
    width = Math.max(w, 100);
    height = Math.max(h, 100);
    renderer.setSize(width, height);
    camera.fov = calculateFov();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    initStreams();
  };

  const onMove = function (e) {
    mouse = { x: e.clientX - width / 2, y: -(e.clientY - height / 2) };
  };

  const onLeave = function () {
    if (config.useSplashEffect && mouse) {
      splashWorldPos = new THREE.Vector3(mouse.x, mouse.y, 0);
      splashTTL = SPLASH_DURATION;
    }
    mouse = null;
  };

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  const dummy = new THREE.Object3D();

  const animate = function (t) {
    if (!shouldRunAnimation(document.hidden)) {
      running = false;
      return;
    }
    running = true;
    animationFrameId = requestAnimationFrame(animate);
    time = t / 1000;
    material.uniforms.uTime.value = time;
    camera.position.z = config.perspective;
    fadeMat.color.set(config.backgroundColor);
    fadeMat.opacity = config.useGhosting ? config.fadeOutSpeed * (1 - config.ghostingIntensity) : config.fadeOutSpeed;
    renderer.render(fadeScene, fadeCam);

    let count = 0;
    const gSet = getGlyphSet();
    const spacing = config.fontSize * config.characterSpacing;

    for (let s = 0; s < streams.length; s++) {
      const stream = streams[s];
      if (count + stream.length > maxGlyphs) continue;

      const dv = directionVectors[config.streamDirection];
      stream.currentDir[0] += (dv[0] - stream.currentDir[0]) * 0.1;
      stream.currentDir[1] += (dv[1] - stream.currentDir[1]) * 0.1;

      stream.glyphs.unshift({
        char: gSet[Math.floor(Math.random() * gSet.length)],
        x: 0,
        vx: 0,
        y: 0,
        vy: 0,
        scale: 1,
        angle: 0,
        rotSpeed: 0,
      });
      if (stream.glyphs.length > stream.length) stream.glyphs.pop();

      const offset = movementOffset(
        config.streamMovement,
        time,
        config.movementAmplitude,
        config.movementFrequency,
        stream.id,
      );
      const ox = offset[0];
      const oy = offset[1];

      for (let i = 0; i < stream.glyphs.length; i++) {
        if (count >= maxGlyphs) break;
        const g = stream.glyphs[i];
        if (!atlas) continue;
        const m = atlas.metrics.get(g.char);
        if (!m) continue;

        const wx = stream.x - i * spacing * stream.currentDir[0] + ox;
        const wy = stream.y - i * spacing * stream.currentDir[1] + oy;

        if (mouse && config.mouseEffect !== 'none') {
          const dx = wx - mouse.x;
          const dy = wy - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < config.mouseRadius * config.mouseRadius) {
            const dist = Math.max(Math.sqrt(d2), 0.001);
            const f = (1 - dist / config.mouseRadius) * config.mouseForce;
            if (config.mouseEffect === 'repel') {
              g.x += (dx / dist) * f;
              g.y += (dy / dist) * f;
            } else if (config.mouseEffect === 'attract') {
              g.x -= (dx / dist) * f;
              g.y -= (dy / dist) * f;
            } else if (config.mouseEffect === 'swirl') {
              g.x += (-dy / dist) * f;
              g.y += (dx / dist) * f;
            } else if (config.mouseEffect === 'grow') {
              g.scale = 1 + f * 0.5;
            }
          }
        }

        if (splashWorldPos && splashTTL > 0) {
          const dx = wx - splashWorldPos.x;
          const dy = wy - splashWorldPos.y;
          const distance = Math.max(Math.hypot(dx, dy), 0.001);
          if (distance < config.splashRadius) {
            const decay = splashTTL / SPLASH_DURATION;
            const force = (1 - distance / config.splashRadius) * config.splashForce * decay;
            g.x += (dx / distance) * force;
            g.y += (dy / distance) * force;
          }
        }

        g.x *= 0.9;
        g.y *= 0.9;
        g.scale += (1 - g.scale) * 0.1;

        dummy.position.set(wx + g.x, wy + g.y, -stream.z);
        dummy.scale.set(m.width * g.scale, m.height * g.scale, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(count, dummy.matrix);
        uvAttr.setXYZW(count, m.u, m.v, m.uw, m.vh);

        const op = 1 - i / stream.length;
        const rgb = glyphColorForMode({
          colorMode: config.colorMode,
          isLeader: i === 0,
          glyphColor: config.glyphColor,
          leaderColor: config.leaderColor,
          streamHue: stream.hue,
          normalizedY: height === 0 ? 0.5 : (wy + height / 2) / height,
          speed: stream.speed,
          minSpeed: config.minSpeed,
          maxSpeed: config.maxSpeed,
        });
        colorAttr.setXYZW(count, rgb.r, rgb.g, rgb.b, i === 0 ? 1 : op);
        count++;
      }

      stream.x += dv[0] * stream.speed;
      stream.y += dv[1] * stream.speed;
      const bounds = getBoundsForStream(stream);
      if (Math.abs(stream.x) > bounds.w * 1.3 || Math.abs(stream.y) > bounds.h * 1.3) {
        resetStreamPosition(stream, config.streamDirection);
      }
    }

    if (splashTTL > 0) splashTTL--;
    else splashWorldPos = null;
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    uvAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    renderer.render(scene, camera);
  };

  const onVisibility = function () {
    if (shouldRunAnimation(document.hidden)) {
      if (!running) {
        animationFrameId = requestAnimationFrame(animate);
      }
    } else {
      running = false;
      cancelAnimationFrame(animationFrameId);
    }
  };

  document.addEventListener('visibilitychange', onVisibility);

  const update = function (newConfig) {
    const prev = config;
    config = Object.assign({}, newConfig);
    material.uniforms.uUseGlow.value = config.useGlow;
    material.uniforms.uGlowColor.value.set(config.glowColor);
    material.uniforms.uGlowIntensity.value = config.glowIntensity;
    if (shouldUpdateCamera(prev, config)) {
      camera.fov = calculateFov();
      camera.updateProjectionMatrix();
    }
    if (shouldRebuildAtlas(prev, config)) {
      atlasDirty = true;
    }
    if (atlasDirty || prev.numColumns !== config.numColumns) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (atlasDirty) {
          createTextureAtlas();
          if (atlas) material.uniforms.uAtlas.value = atlas.texture;
          atlasDirty = false;
        }
        initStreams();
      }, STRUCTURAL_REBUILD_MS);
    }
  };

  const destroy = function () {
    cancelAnimationFrame(animationFrameId);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (atlas && atlas.texture && atlas.texture.dispose) atlas.texture.dispose();
    geometry.dispose();
    material.dispose();
    fadeMat.dispose();
    fadeMesh.geometry.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  createTextureAtlas();
  if (atlas) material.uniforms.uAtlas.value = atlas.texture;
  initStreams();
  renderer.clear();
  animate(0);
  return { update: update, destroy: destroy, resize: resize };
}
`;
