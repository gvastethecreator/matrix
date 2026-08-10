import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Config, Stream, Glyph, StreamDirection } from '../types';
import { KATAKANA, ASCII, BINARY, RUNES, GREEK, MATH, EMOJIS, directionVectors } from '../config/constants';

/**
 * Motor de animación principal acelerado por GPU (WebGL + custom ShaderMaterial)
 * para representar el efecto Matrix Digital Rain de manera eficiente de hasta 60k glifos.
 * Utiliza un sistema de coordenadas donde 1 unidad de mundo = 1 píxel de pantalla en Z = 0,
 * permitiendo una integración perfecta y libre de errores matemáticos.
 */
const animationLogic = (canvas: HTMLCanvasElement, initialConfig: Config) => {
  let config = { ...initialConfig };
  let width = Math.max(canvas.clientWidth || window.innerWidth || 1024, 100);
  let height = Math.max(canvas.clientHeight || window.innerHeight || 768, 100);
  let streams: Stream[] = [];
  let mouse: { x: number; y: number } | null = null;
  let time = 0;
  let animationFrameId: number;
  let splashWorldPos: THREE.Vector3 | null = null;
  let splashTTL = 0;
  const SPLASH_DURATION = 60;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const getGlyphSet = () => {
    switch (config.glyphSet) {
      case 'katakana':
        return KATAKANA;
      case 'ascii':
        return ASCII;
      case 'binary':
        return BINARY;
      case 'runes':
        return RUNES;
      case 'greek':
        return GREEK;
      case 'math':
        return MATH;
      case 'emojis':
        return EMOJIS;
      case 'custom':
        return config.customGlyphSet || '?';
      default:
        return KATAKANA;
    }
  };

  /**
   * Calcula los límites lógicos de pantalla (visibilidad) para un stream en su coordenada Z dada.
   * Dado que 1 unidad = 1 píxel en Z = 0, para mayor profundidad (Z > 0), el tamaño visible aumenta proporcionalmente.
   */
  const getBoundsForStream = (stream: Stream) => {
    const aspect = width / height;
    // Distancia real entre la cámara (en z = config.perspective) y el stream (en z = -stream.z)
    const distance = Math.max(1, config.perspective + stream.z);
    const h = distance * (height / (2 * config.perspective));
    const w = h * aspect;
    return { w, h };
  };

  const resetStreamPosition = (stream: Stream, dir: StreamDirection) => {
    Object.assign(stream, {
      glyphs: [],
      speed: Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed,
      length: Math.floor(Math.random() * (config.maxTrailLength - config.minTrailLength) + config.minTrailLength),
      z: config.useZAxis ? Math.random() * (config.maxZ - config.minZ) + config.minZ : 0,
      currentDir: [...directionVectors[dir]],
      directionMultiplier: 1,
      mutationRate: Math.random() * 0.5 + 0.5,
      hue: Math.random(),
    });

    // Asegurarse de que stream.z no sobrepase el plano de la cámara
    if (stream.z >= config.perspective) {
      stream.z = config.perspective - 10;
    }

    const { w, h } = getBoundsForStream(stream);
    const margin = 1.1;

    const dv = directionVectors[dir];
    const isH = Math.abs(dv[0]) > 0.1;
    const isV = Math.abs(dv[1]) > 0.1;

    if (isV) {
      stream.x = Math.random() * w * 2 - w;
      // Posicionar justo afuera en el borde superior/inferior respectivo
      stream.y = h * margin * -Math.sign(dv[1]);
    }
    if (isH) {
      if (!isV || Math.random() > 0.5) {
        stream.x = w * margin * -Math.sign(dv[0]);
        stream.y = Math.random() * h * 2 - h;
      }
    }
  };

  const scene = new THREE.Scene();

  // El FOV se calculará dinámicamente para que la pantalla completa a Z = 0 mida exactamente width x height unidades 3D
  const calculateFov = () => {
    return 2 * Math.atan(height / (2 * config.perspective)) * (180 / Math.PI);
  };

  const camera = new THREE.PerspectiveCamera(calculateFov(), width / height, 1, 3000);
  camera.position.set(0, 0, config.perspective);
  camera.lookAt(0, 0, 0); // Explicit lookAt to guarantee robustness

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true, // Requerido para retener frames anteriores y lograr el efecto 'fade' continuo
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 1);
  renderer.autoClear = false;

  let atlas: any;
  const createTextureAtlas = () => {
    const previousTexture = atlas?.texture;
    const chars = Array.from(new Set(getGlyphSet()));
    const atlasCanvas = document.createElement('canvas');
    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 48; // Alta resolución para el atlas
    ctx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}, monospace`;

    const padding = 8;

    // Medir dimensiones primero en base a los glifos reales
    const dims = chars.map((char) => ({ char, glyphWidth: Math.ceil(ctx.measureText(char as string).width) }));
    const totalW = dims.reduce((sum, dimension) => sum + dimension.glyphWidth + padding * 2, 0);

    atlasCanvas.width = Math.max(totalW, 1);
    atlasCanvas.height = fontSize + padding * 2;

    // Re-asignar propiedades después de definir dimensiones
    ctx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}, monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    const metrics = new Map();
    let curX = 0;
    dims.forEach(({ char, glyphWidth }) => {
      const u = (curX + padding) / atlasCanvas.width;
      const v = padding / atlasCanvas.height;
      const uw = glyphWidth / atlasCanvas.width;
      const vh = fontSize / atlasCanvas.height;

      metrics.set(char as string, {
        u,
        v,
        width: glyphWidth * (config.fontSize / fontSize),
        height: config.fontSize,
        uw,
        vh,
      });
      ctx.fillText(char as string, curX + padding, atlasCanvas.height / 2);
      curX += glyphWidth + padding * 2;
    });

    const texture = new THREE.CanvasTexture(atlasCanvas);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    atlas = {
      texture,
      metrics,
      fontHeight: config.fontSize,
    };
    previousTexture?.dispose();
  };

  const initStreams = () => {
    streams = Array.from({ length: config.numColumns }, (_, i) => {
      const s: Partial<Stream> = { id: i };
      resetStreamPosition(s as Stream, config.streamDirection);
      return s as Stream;
    });
  };

  const maxGlyphs = 60000;
  const geometry = new THREE.PlaneGeometry(1, 1);

  // Sombreador ultra optimizado y robusto con variables de instanciación declaradas explícitamente y sin conflictos
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAtlas: { value: null },
      uUseGlow: { value: config.useGlow },
      uGlowColor: { value: new THREE.Color(config.glowColor) },
      uGlowIntensity: { value: config.glowIntensity },
      uTime: { value: 0 },
    },
    vertexShader: `
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
        `,
    fragmentShader: `
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
        `,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, maxGlyphs);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false; // Desactivar el frustum culling para evitar desaparición inexplicable del renderizado
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

  const resize = (w: number, h: number) => {
    width = Math.max(w, 100);
    height = Math.max(h, 100);
    renderer.setSize(width, height);
    camera.fov = calculateFov();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    initStreams();
  };

  const onMove = (e: MouseEvent) => {
    const mouseX = e.clientX - width / 2;
    const mouseY = -(e.clientY - height / 2);
    mouse = { x: mouseX, y: mouseY };
  };

  const onLeave = () => {
    if (config.useSplashEffect && mouse) {
      splashWorldPos = new THREE.Vector3(mouse.x, mouse.y, 0);
      splashTTL = SPLASH_DURATION;
    }
    mouse = null;
  };

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);

  const dummy = new THREE.Object3D();
  const lRgb = new THREE.Color();
  const gRgb = new THREE.Color();

  const animate = (t: number) => {
    animationFrameId = requestAnimationFrame(animate);
    time = t / 1000;
    material.uniforms.uTime.value = time;

    camera.position.z = config.perspective;
    fadeMat.color.set(config.backgroundColor);
    fadeMat.opacity = config.useGhosting ? config.fadeOutSpeed * (1 - config.ghostingIntensity) : config.fadeOutSpeed;

    // Renderizar el overlay de fade para acumular rastro
    renderer.render(fadeScene, fadeCam);

    let count = 0;
    const gSet = getGlyphSet();
    lRgb.set(config.leaderColor);
    gRgb.set(config.glyphColor);

    const spacing = config.fontSize * config.characterSpacing;

    for (let s = 0; s < streams.length; s++) {
      const stream = streams[s];
      if (count + stream.length > maxGlyphs) continue;

      const dv = directionVectors[config.streamDirection];
      stream.currentDir[0] += (dv[0] - stream.currentDir[0]) * 0.1;
      stream.currentDir[1] += (dv[1] - stream.currentDir[1]) * 0.1;

      // Añadir carácter al flujo
      const nGlyph: Glyph = {
        char: gSet[Math.floor(Math.random() * gSet.length)],
        x: 0,
        vx: 0,
        y: 0,
        vy: 0,
        scale: 1,
        angle: 0,
        rotSpeed: 0,
      };
      stream.glyphs.unshift(nGlyph);
      if (stream.glyphs.length > stream.length) stream.glyphs.pop();

      for (let i = 0; i < stream.glyphs.length; i++) {
        if (count >= maxGlyphs) break;
        const g = stream.glyphs[i];
        if (!atlas) continue;
        const m = atlas.metrics.get(g.char);
        if (!m) continue;

        const wx = stream.x - i * spacing * stream.currentDir[0];
        const wy = stream.y - i * spacing * stream.currentDir[1];

        // Interacción de mouse simple
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
        if (i === 0) {
          colorAttr.setXYZW(count, lRgb.r, lRgb.g, lRgb.b, 1);
        } else {
          colorAttr.setXYZW(count, gRgb.r, gRgb.g, gRgb.b, op);
        }

        count++;
      }

      stream.x += dv[0] * stream.speed;
      stream.y += dv[1] * stream.speed;

      const { w, h } = getBoundsForStream(stream);
      const marginLimit = 1.3;
      if (Math.abs(stream.x) > w * marginLimit || Math.abs(stream.y) > h * marginLimit) {
        resetStreamPosition(stream, config.streamDirection);
      }
    }

    if (splashTTL > 0) splashTTL--;
    else splashWorldPos = null;
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    uvAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Renderizar la escena principal a la pantalla
    renderer.render(scene, camera);
  };

  const update = (newConfig: Config) => {
    const full =
      config.glyphSet !== newConfig.glyphSet ||
      config.numColumns !== newConfig.numColumns ||
      config.fontFamily !== newConfig.fontFamily;
    config = { ...newConfig };

    // Actualizar uniformes del sombreador al instante
    material.uniforms.uUseGlow.value = config.useGlow;
    material.uniforms.uGlowColor.value.set(config.glowColor);
    material.uniforms.uGlowIntensity.value = config.glowIntensity;

    // Actualizar la cámara por si ha cambiado la perspectiva (FOV)
    camera.fov = calculateFov();
    camera.updateProjectionMatrix();

    if (full) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        createTextureAtlas();
        initStreams();
        if (atlas) material.uniforms.uAtlas.value = atlas.texture;
      }, 100);
    }
  };

  const destroy = () => {
    cancelAnimationFrame(animationFrameId);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
    if (debounceTimer) clearTimeout(debounceTimer);
    atlas?.texture?.dispose?.();
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
  return { update, destroy, resize };
};

export const animationLogicString = `
    const directionVectors = ${JSON.stringify(directionVectors)};
    const KATAKANA = ${JSON.stringify(KATAKANA)};
    const ASCII = ${JSON.stringify(ASCII)};
    const BINARY = ${JSON.stringify(BINARY)};
    const RUNES = ${JSON.stringify(RUNES)};
    const GREEK = ${JSON.stringify(GREEK)};
    const MATH = ${JSON.stringify(MATH)};
    const EMOJIS = ${JSON.stringify(EMOJIS)};
    const runMatrixAnimation = ${animationLogic.toString()};
`;

interface ParticleCanvasProps {
  config: Config;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationController = useRef<{
    update: (newConfig: Config) => void;
    destroy: () => void;
    resize?: (w: number, h: number) => void;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Crear un nuevo canvas dinámicamente y anexarlo al div contenedor.
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 w-full h-full block';
    container.replaceChildren(canvas);

    animationController.current = animationLogic(canvas, config);

    // Configurar ResizeObserver para cambios de tamaño exactos
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          animationController.current?.resize?.(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      animationController.current?.destroy();
      animationController.current = null;
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (animationController.current) {
      animationController.current.update(config);
    }
  }, [config]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black" />;
};

export default ParticleCanvas;
