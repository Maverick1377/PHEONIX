/* ============================================================
   21st BIRTHDAY MASTERPIECE — THREE.JS 3D PARTICLES & REALISTIC BLOWING ENGINE
   Theme: Midnight Royal Navy & Metallic Silver • 3D WebGL Experience
   Milestone: Sushma's 21st Birthday • Jan 9, 2006 → Jan 9, 2027
   ============================================================ */

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ============================================================
   1. LUXURY AMBIENT AUDIO SYNTH & FOLEY ENGINE
   ============================================================ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.available = true;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      this.available = false;
      console.warn('Web Audio is unavailable; continuing without sound.');
      return false;
    }

    try {
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
      return true;
    } catch (error) {
      this.available = false;
      this.ctx = null;
      console.warn('Web Audio could not be initialized; continuing without sound.', error);
      return false;
    }
  }

  async resume() {
    if (!this.init()) return false;
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return this.ctx.state === 'running';
    } catch (error) {
      console.warn('Web Audio could not be resumed; continuing without sound.', error);
      return false;
    }
  }

  async toggleMusic() {
    if (!this.isPlayingMusic) {
      if (!(await this.resume())) return false;
      this.isPlayingMusic = true;
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      }
      this.playCelestialSequence();
    } else {
      this.isPlayingMusic = false;
      if (this.musicTimer) clearInterval(this.musicTimer);
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }
    }
    return this.isPlayingMusic;
  }

  playCelestialSequence() {
    const progression = [
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      [293.66, 349.23, 440.00, 523.25, 659.25], // Dm9
      [349.23, 440.00, 523.25, 659.25, 783.99], // Fmaj7
      [261.63, 329.63, 392.00, 493.88, 587.33]  // Cmaj9
    ];
    let step = 0;

    const playChord = () => {
      if (!this.isPlayingMusic) return;
      const chord = progression[step % progression.length];
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.isPlayingMusic) this.playTone(freq, 4.2, 0.045, 'sine', true);
        }, idx * 160);
      });
      step++;
    };

    playChord();
    this.musicTimer = setInterval(playChord, 3800);
  }

  playTone(freq, duration = 0.5, vol = 0.1, type = 'sine', isMusic = false) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      const targetGain = isMusic ? (this.musicGain || this.masterGain) : (this.sfxGain || this.masterGain);
      gain.connect(targetGain || this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playStringTension() {
    this.playTone(180 + Math.random() * 40, 0.18, 0.08, 'sawtooth');
  }

  playArrowRelease() {
    this.playTone(520, 0.15, 0.14, 'sine');
    this.playTone(260, 0.28, 0.1, 'triangle');
  }

  playHeartImpact() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 0.9, 0.15, 'sine'), idx * 80);
    });
  }

  playCandleOut() {
    this.playNoiseWhoosh(0.2, 0.14);
    this.playTone(680 + Math.random() * 80, 0.12, 0.05, 'sine');
  }

  playNoiseWhoosh(duration = 0.22, volume = 0.12) {
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain || this.masterGain || this.ctx.destination);
      noise.start();
    } catch (_) {}
  }

  playVictory() {
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    fanfare.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 1.2, 0.18, 'sine'), idx * 140);
    });
  }

  playToastClink() {
    this.playTone(2093.00, 0.6, 0.14, 'sine');
    setTimeout(() => this.playTone(2637.02, 0.8, 0.12, 'sine'), 40);
  }
}

const soundFx = new SoundEngine();

/* ============================================================
   2. MASTER THREE.JS 3D ENGINE
   ============================================================ */
let scene, camera, renderer;
let starfieldPoints, treeGroup, cakeGroup, giftGroup, galaxyGroup;
let ambientLight, dirLight, blueRimLight;
let currentAct = 'act1';
let pointerX = 0, pointerY = 0, targetRotationX = 0, targetRotationY = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showWebGLFallback(error) {
  console.error('3D experience unavailable; continuing with the interactive fallback.', error);
  const notice = $('webglNotice');
  if (notice) notice.hidden = false;
}

function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
  gradient.addColorStop(0.7, 'rgba(37, 99, 235, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Authentic Bezier Teardrop Candle Flame Texture with layered heat zones
function createFlameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 256);

  // 1. Outer Flame Teardrop Silhouette
  ctx.beginPath();
  ctx.moveTo(64, 236);
  ctx.bezierCurveTo(20, 215, 16, 130, 52, 60);
  ctx.bezierCurveTo(60, 28, 63, 8, 64, 4);
  ctx.bezierCurveTo(65, 8, 68, 28, 76, 60);
  ctx.bezierCurveTo(112, 130, 108, 215, 64, 236);
  ctx.closePath();

  const outerGrad = ctx.createLinearGradient(64, 236, 64, 4);
  outerGrad.addColorStop(0.0, 'rgba(30, 58, 138, 0.95)');    // Deep blue anchor at wick
  outerGrad.addColorStop(0.12, 'rgba(56, 189, 248, 0.95)');  // Sapphire cyan mantle
  outerGrad.addColorStop(0.42, 'rgba(251, 191, 36, 0.95)');  // Golden incandescent flame
  outerGrad.addColorStop(0.80, 'rgba(254, 240, 138, 0.85)'); // Soft warm yellow
  outerGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');   // Wispy tip falloff
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // 2. Inner Radiant Core (Incandescent White)
  ctx.beginPath();
  ctx.moveTo(64, 226);
  ctx.bezierCurveTo(42, 206, 38, 145, 58, 88);
  ctx.bezierCurveTo(62, 65, 63, 38, 64, 24);
  ctx.bezierCurveTo(65, 38, 66, 65, 70, 88);
  ctx.bezierCurveTo(90, 145, 86, 206, 64, 226);
  ctx.closePath();

  const coreGrad = ctx.createLinearGradient(64, 226, 64, 24);
  coreGrad.addColorStop(0.0, 'rgba(186, 230, 253, 0.92)');
  coreGrad.addColorStop(0.35, 'rgba(255, 255, 255, 1.0)');
  coreGrad.addColorStop(0.75, 'rgba(254, 249, 195, 0.9)');
  coreGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // 3. Real Candle Blue Flame Base Cup (hugging the wick)
  ctx.beginPath();
  ctx.ellipse(64, 226, 18, 9, 0, 0, Math.PI * 2);
  const blueGrad = ctx.createRadialGradient(64, 226, 0, 64, 226, 18);
  blueGrad.addColorStop(0.0, 'rgba(59, 130, 246, 0.9)');
  blueGrad.addColorStop(0.65, 'rgba(37, 99, 235, 0.55)');
  blueGrad.addColorStop(1.0, 'rgba(30, 58, 138, 0)');
  ctx.fillStyle = blueGrad;
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Warm ambient candle halo sprite
function createFlameHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0.0, 'rgba(254, 240, 138, 0.7)');
  grad.addColorStop(0.25, 'rgba(251, 191, 36, 0.38)');
  grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.12)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Wispy curling smoke puff texture
function createSmokePuffTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0.0, 'rgba(241, 245, 249, 0.75)');
  grad.addColorStop(0.28, 'rgba(203, 213, 225, 0.48)');
  grad.addColorStop(0.65, 'rgba(148, 163, 184, 0.18)');
  grad.addColorStop(1.0, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Interactive breath wind mote texture
function createBreathMoteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(32, 0, 32, 128);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
  grad.addColorStop(0.45, 'rgba(186, 230, 253, 0.65)');
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function initThree() {
  const container = $('webglContainer');
  if (!container) return;
  if (!window.THREE) {
    showWebGLFallback(new Error('Three.js did not load.'));
    return;
  }

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060b19, 0.035);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 1.5, 9);

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    showWebGLFallback(error);
    return;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  container.appendChild(renderer.domElement);

  // Lighting
  ambientLight = new THREE.AmbientLight(0x0f1c3f, 0.7);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  blueRimLight = new THREE.PointLight(0x38bdf8, 1.4, 25);
  blueRimLight.position.set(-6, 4, 3);
  scene.add(blueRimLight);

  try {
    initializeParticleMaterials();
    buildStarfield();
    build3DTree();
    build3DCake();
    build3DGift();
    build3DGalaxy();
  } catch (error) {
    renderer.dispose();
    renderer.domElement.remove();
    renderer = null;
    showWebGLFallback(error);
    return;
  }

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('pointermove', onPointerMove);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (currentAct === 'act3') {
    const isNarrow = window.innerWidth < 640;
    camera.position.z = isNarrow ? 8.6 : 7.6;
    camera.position.y = isNarrow ? 3.3 : 2.9;
  }
}

function onPointerMove(e) {
  pointerX = (e.clientX / window.innerWidth) * 2 - 1;
  pointerY = -(e.clientY / window.innerHeight) * 2 + 1;
}

/* --- 3D Starfield --- */
function buildStarfield() {
  const count = 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const c1 = new THREE.Color(0xffffff);
  const c2 = new THREE.Color(0x38bdf8);
  const c3 = new THREE.Color(0x93c5fd);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    const rColor = Math.random() < 0.4 ? c1 : Math.random() < 0.7 ? c2 : c3;
    colors[i * 3] = rColor.r;
    colors[i * 3 + 1] = rColor.g;
    colors[i * 3 + 2] = rColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  starfieldPoints = new THREE.Points(geometry, material);
  scene.add(starfieldPoints);
}

/* --- 3D Constellation Tree of Dreams (Act 2) --- */
function build3DTree() {
  treeGroup = new THREE.Group();
  treeGroup.visible = false;
  treeGroup.position.set(0, -0.4, 0);

  // Trunk & Fractal Branches
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0x091534
  });

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.38, 3.2, 16);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6;
  treeGroup.add(trunk);

  // 3D Star Particle Canopy (1,400 glowing star particles)
  const particleCount = 1400;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const rnd = mulberry32(88);

  const colA = new THREE.Color(0xffffff);
  const colB = new THREE.Color(0x38bdf8);
  const colC = new THREE.Color(0x2563eb);
  const colD = new THREE.Color(0xcbd5e1);

  for (let i = 0; i < particleCount; i++) {
    // Ellipsoid distribution centered over the trunk
    const u = rnd();
    const v = rnd();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(rnd()) * 1.85;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = 2.1 + (r * Math.cos(phi)) * 0.75;
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const pick = rnd();
    const c = pick < 0.35 ? colA : pick < 0.65 ? colB : pick < 0.85 ? colC : colD;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const canopyGeo = new THREE.BufferGeometry();
  canopyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  canopyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const canopyMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const canopyPoints = new THREE.Points(canopyGeo, canopyMat);
  treeGroup.add(canopyPoints);

  scene.add(treeGroup);
}

/* --- Realistic Artisanal 3D Birthday Cake & Candles (Act 3) --- */
let candleObjects = [], smokeParticles3D = [], breathParticles3D = [];
let cakeLights = [];
let isBlowing = false;

function build3DCake() {
  cakeGroup = new THREE.Group();
  cakeGroup.visible = false;
  // Elevated position so platter sits cleanly above the bottom controls dock
  cakeGroup.position.set(0, -0.22, 0);

  // 1. Grand Polished Silver Platter & Pedestal
  const platterMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1,
    envMapIntensity: 2.0
  });

  // Platter main disc
  const platterGeo = new THREE.CylinderGeometry(2.65, 2.75, 0.16, 64);
  const platter = new THREE.Mesh(platterGeo, platterMat);
  platter.position.y = -0.08;
  platter.receiveShadow = true;
  cakeGroup.add(platter);

  // Platter beveled foot / pedestal
  const pedestalGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.22, 64);
  const pedestal = new THREE.Mesh(pedestalGeo, platterMat);
  pedestal.position.y = -0.25;
  pedestal.receiveShadow = true;
  cakeGroup.add(pedestal);

  // Decorative beaded rim for platter
  const silverPearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15 });
  const pearlGeoSm = new THREE.SphereGeometry(0.045, 12, 12);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const p = new THREE.Mesh(pearlGeoSm, silverPearlMat);
    p.position.set(Math.cos(a) * 2.72, -0.02, Math.sin(a) * 2.72);
    cakeGroup.add(p);
  }

  // 2. Tier 1 (Base): Royal Navy Satin Velvet
  const t1Mat = new THREE.MeshStandardMaterial({
    color: 0x091b42,
    roughness: 0.42,
    metalness: 0.3
  });
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.95, 64), t1Mat);
  t1.position.y = 0.48;
  t1.castShadow = true;
  t1.receiveShadow = true;
  cakeGroup.add(t1);

  // Pearl border piping along Tier 1 base and top
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const pBot = new THREE.Mesh(pearlGeoSm, silverPearlMat);
    pBot.position.set(Math.cos(a) * 2.26, 0.04, Math.sin(a) * 2.26);
    cakeGroup.add(pBot);

    const pTop = new THREE.Mesh(pearlGeoSm, silverPearlMat);
    pTop.position.set(Math.cos(a) * 2.26, 0.95, Math.sin(a) * 2.26);
    cakeGroup.add(pTop);
  }

  // 3. Tier 2 (Middle): Platinum Silver Metallic Glaze
  const t2Mat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.82
  });
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.88, 64), t2Mat);
  t2.position.y = 1.39;
  t2.castShadow = true;
  t2.receiveShadow = true;
  cakeGroup.add(t2);

  // Pearl piping along Tier 2 top
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const pTop = new THREE.Mesh(pearlGeoSm, silverPearlMat);
    pTop.position.set(Math.cos(a) * 1.69, 1.83, Math.sin(a) * 1.69);
    cakeGroup.add(pTop);
  }

  // 4. Tier 3 (Top): Deep Midnight Sapphire
  const t3Mat = new THREE.MeshStandardMaterial({
    color: 0x06112a,
    roughness: 0.38,
    metalness: 0.45
  });
  const t3 = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.78, 64), t3Mat);
  t3.position.y = 2.22;
  t3.castShadow = true;
  t3.receiveShadow = true;
  cakeGroup.add(t3);

  // Pearl piping along Tier 3 top
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const pTop = new THREE.Mesh(pearlGeoSm, silverPearlMat);
    pTop.position.set(Math.cos(a) * 1.16, 2.61, Math.sin(a) * 1.16);
    cakeGroup.add(pTop);
  }

  // 5. Centerpiece Sculptural 3D "21" Topper
  const topperStemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
  const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), topperStemMat);
  stem1.position.set(-0.28, 2.75, 0);
  cakeGroup.add(stem1);
  const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), topperStemMat);
  stem2.position.set(0.28, 2.75, 0);
  cakeGroup.add(stem2);

  const topperCanvas = document.createElement('canvas');
  topperCanvas.width = 512; topperCanvas.height = 512;
  const tctx = topperCanvas.getContext('2d');
  tctx.clearRect(0, 0, 512, 512);

  // Outer glowing silver ring
  tctx.beginPath();
  tctx.arc(256, 256, 210, 0, Math.PI * 2);
  tctx.lineWidth = 14;
  tctx.strokeStyle = '#e2e8f0';
  tctx.shadowColor = '#38bdf8';
  tctx.shadowBlur = 24;
  tctx.stroke();

  // Sapphire backdrop disc
  tctx.beginPath();
  tctx.arc(256, 256, 200, 0, Math.PI * 2);
  tctx.fillStyle = 'rgba(6, 17, 42, 0.88)';
  tctx.fill();

  // "21" Typography
  tctx.font = "bold 240px 'Cormorant Garamond', Georgia, serif";
  tctx.fillStyle = '#ffffff';
  tctx.textAlign = 'center';
  tctx.textBaseline = 'middle';
  tctx.shadowColor = '#38bdf8';
  tctx.shadowBlur = 28;
  tctx.fillText('21', 256, 250);

  // Delicate star crest
  tctx.font = "26px 'Outfit', sans-serif";
  tctx.fillStyle = '#bae6fd';
  tctx.fillText('✨ CHAPTER 21 ✨', 256, 385);

  const topperTex = new THREE.CanvasTexture(topperCanvas);
  const topperMat = new THREE.MeshBasicMaterial({ map: topperTex, transparent: true, side: THREE.DoubleSide });
  const topper = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), topperMat);
  topper.position.set(0, 3.25, 0);
  cakeGroup.add(topper);

  // 6. 21 Hyper-Realistic Artisanal Candles:
  // 5 Centerpiece tall candles on Tier 3 + 16 Perimeter candles on Tier 2
  const flameTex = createFlameTexture();
  const haloTex = createFlameHaloTexture();

  const candleWaxMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.15
  });
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  candleObjects = [];
  cakeLights = [];

  // Helper to create a single 3D candle with crossed-quad flame and glowing ember
  function addRealisticCandle(x, baseHeight, z, candleHeight, candleRadius, isCenter) {
    // A. Wax Base Collar / Melt Drip (realistic confectionery ring)
    const collarGeo = new THREE.TorusGeometry(candleRadius * 1.5, candleRadius * 0.45, 8, 16);
    const collar = new THREE.Mesh(collarGeo, candleWaxMat);
    collar.position.set(x, baseHeight + 0.02, z);
    collar.rotation.x = Math.PI / 2;
    cakeGroup.add(collar);

    // B. Wax Candle Shaft
    const waxGeo = new THREE.CylinderGeometry(candleRadius, candleRadius * 1.05, candleHeight, 16);
    const wax = new THREE.Mesh(waxGeo, candleWaxMat);
    wax.position.set(x, baseHeight + candleHeight / 2, z);
    wax.castShadow = true;
    cakeGroup.add(wax);

    // C. Charred Thread Wick
    const wickHeight = 0.085;
    const wickTopY = baseHeight + candleHeight + wickHeight;
    const wickGeo = new THREE.CylinderGeometry(0.007, 0.007, wickHeight, 8);
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.set(x, baseHeight + candleHeight + wickHeight / 2, z);
    cakeGroup.add(wick);

    // D. Glowing Wick Ember (tip of the wick)
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      transparent: true,
      opacity: 1.0
    });
    const emberGeo = new THREE.SphereGeometry(0.014, 8, 8);
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.set(x, wickTopY, z);
    cakeGroup.add(ember);

    // E. Volumetric 3D Crossed-Quad Flame Group
    const flameGroup = new THREE.Group();
    flameGroup.position.set(x, wickTopY, z);

    const flameWidth = isCenter ? 0.22 : 0.16;
    const flameHeight = isCenter ? 0.44 : 0.32;

    // Plane geometry shifted so origin is at the bottom (wick pivot!)
    const flamePlaneGeo = new THREE.PlaneGeometry(flameWidth, flameHeight);
    flamePlaneGeo.translate(0, flameHeight / 2, 0);

    const flamePlaneMat = new THREE.MeshBasicMaterial({
      map: flameTex,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const quad1 = new THREE.Mesh(flamePlaneGeo, flamePlaneMat);
    const quad2 = new THREE.Mesh(flamePlaneGeo, flamePlaneMat);
    quad2.rotation.y = Math.PI / 2;
    flameGroup.add(quad1);
    flameGroup.add(quad2);

    // Soft candlelight halo sprite at base
    const haloMat = new THREE.SpriteMaterial({
      map: haloTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(flameWidth * 2.2, flameWidth * 2.2, 1);
    halo.position.y = flameHeight * 0.35;
    flameGroup.add(halo);

    cakeGroup.add(flameGroup);

    // F. Warm Candlelight Point Light
    const lightColor = isCenter ? 0xffdf88 : 0x7dd3fc;
    const lightIntensity = isCenter ? 0.85 : 0.55;
    const pLight = new THREE.PointLight(lightColor, lightIntensity, isCenter ? 4.5 : 3.2);
    pLight.position.set(x, wickTopY + flameHeight * 0.4, z);
    cakeGroup.add(pLight);
    cakeLights.push(pLight);

    candleObjects.push({
      flameGroup,
      quad1,
      quad2,
      halo,
      ember,
      pLight,
      baseLightIntensity: lightIntensity,
      wickPos: new THREE.Vector3(x, wickTopY, z),
      health: 1.0,
      lit: true,
      emberCooldown: 0,
      rate: isCenter ? (1.3 + Math.random() * 0.4) : (1.6 + Math.random() * 0.5),
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: 18 + Math.random() * 12
    });
  }

  // 5 Centerpiece Tall Candles on Tier 3 (staggered arc)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 4 - 0.5) * 1.6;
    const r = 0.55;
    const x = Math.sin(angle) * r;
    const z = Math.cos(angle) * r - 0.12;
    const y = 2.61;
    addRealisticCandle(x, y, z, 0.52, 0.042, true);
  }

  // 16 Perimeter Candles on Tier 2 (full ring)
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const r = 1.48;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = 1.83;
    addRealisticCandle(x, y, z, 0.36, 0.034, false);
  }

  scene.add(cakeGroup);
}

/* --- 3D Interactive Gift Box (Act 4) --- */
let giftLid, giftBoxMesh;

function build3DGift() {
  giftGroup = new THREE.Group();
  giftGroup.visible = false;
  giftGroup.position.set(0, 0.2, 0);

  // Box Body
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x0a1638,
    roughness: 0.35,
    metalness: 0.45
  });
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.15,
    metalness: 0.85
  });

  giftBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), boxMat);
  giftBoxMesh.castShadow = true;
  giftGroup.add(giftBoxMesh);

  // Cross Ribbons on Body
  const rV = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.81, 1.81), ribbonMat);
  const rH = new THREE.Mesh(new THREE.BoxGeometry(1.81, 1.81, 0.24), ribbonMat);
  giftGroup.add(rV);
  giftGroup.add(rH);

  // 3D Lid
  giftLid = new THREE.Group();
  giftLid.position.set(0, 0.95, 0);

  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 1.9), boxMat);
  giftLid.add(lidMesh);

  const lrV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.31, 1.91), ribbonMat);
  const lrH = new THREE.Mesh(new THREE.BoxGeometry(1.91, 0.31, 0.25), ribbonMat);
  giftLid.add(lrV);
  giftLid.add(lrH);

  // Rosette Bow
  const bowGeo = new THREE.TorusGeometry(0.22, 0.08, 12, 24);
  const bow1 = new THREE.Mesh(bowGeo, ribbonMat);
  bow1.position.set(0, 0.25, 0);
  bow1.rotation.x = Math.PI / 4;
  giftLid.add(bow1);

  const bow2 = new THREE.Mesh(bowGeo, ribbonMat);
  bow2.position.set(0, 0.25, 0);
  bow2.rotation.z = Math.PI / 4;
  giftLid.add(bow2);

  giftGroup.add(giftLid);
  scene.add(giftGroup);
}

/* --- 3D Celebration Galaxy (Act 5 - No Photos!) --- */
function build3DGalaxy() {
  galaxyGroup = new THREE.Group();
  galaxyGroup.visible = false;

  const count = 2400;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);

  const color1 = new THREE.Color(0xffffff);
  const color2 = new THREE.Color(0x38bdf8);
  const color3 = new THREE.Color(0x1d4ed8);

  for (let i = 0; i < count; i++) {
    const angle = i * 0.12;
    const r = (i / count) * 12 + Math.random() * 1.5;
    const x = Math.cos(angle) * r;
    const y = (Math.random() - 0.5) * 4;
    const z = Math.sin(angle) * r;

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    const c = Math.random() < 0.4 ? color1 : Math.random() < 0.7 ? color2 : color3;
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const galaxyPoints = new THREE.Points(geo, mat);
  galaxyGroup.add(galaxyPoints);

  scene.add(galaxyGroup);
}

/* ============================================================
   3. ANIMATION LOOP & REALISTIC CANDLE BLOW PHYSICS
   ============================================================ */
let lastFrameTime = performance.now();
let smokeGeo, smokeMat, breathGeo, breathMat;

function initializeParticleMaterials() {
  const smokePuffTex = createSmokePuffTexture();
  const breathMoteTex = createBreathMoteTexture();

  smokeGeo = new THREE.PlaneGeometry(0.25, 0.25);
  smokeMat = new THREE.MeshBasicMaterial({
    map: smokePuffTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    color: 0xe2e8f0
  });

  breathGeo = new THREE.PlaneGeometry(0.14, 0.38);
  breathMat = new THREE.MeshBasicMaterial({
    map: breathMoteTex,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function spawnSmokeParticle(worldPos, scaleMult = 1.0) {
  const p = new THREE.Mesh(smokeGeo, smokeMat.clone());
  p.position.copy(worldPos);
  // Add small random offset around wick
  p.position.x += (Math.random() - 0.5) * 0.04;
  p.position.z += (Math.random() - 0.5) * 0.04;

  p.userData = {
    vx: (Math.random() - 0.5) * 0.015,
    vy: 0.035 + Math.random() * 0.025,
    vz: (Math.random() - 0.5) * 0.015,
    rotSpeed: (Math.random() - 0.5) * 1.5,
    life: 0,
    maxLife: 1.6 + Math.random() * 0.6,
    maxScale: (2.2 + Math.random() * 0.8) * scaleMult,
    curlPhase: Math.random() * Math.PI * 2
  };
  p.scale.setScalar(0.25 * scaleMult);
  scene.add(p);
  smokeParticles3D.push(p);
}

function spawnBreathMote() {
  const p = new THREE.Mesh(breathGeo, breathMat.clone());
  p.position.set(
    (Math.random() - 0.5) * 3.0,
    2.4 + (Math.random() - 0.5) * 1.5,
    6.0 + Math.random() * 0.8
  );
  p.userData = {
    vz: -0.16 - Math.random() * 0.08,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.01,
    life: 0,
    maxLife: 0.9 + Math.random() * 0.4
  };
  p.rotation.x = Math.PI / 4;
  scene.add(p);
  breathParticles3D.push(p);
}

function updateCandlePhysics(dt, breathStrength) {
  if (currentAct !== 'act3') return;

  let litLeft = 0;
  const time = performance.now() * 0.001;

  // Visual breath motes streaming towards the cake
  if (breathStrength > 0.12 && Math.random() < 0.4) {
    spawnBreathMote();
  }

  for (const c of candleObjects) {
    // A. Cooling ember simulation & continuous smoke streamer
    if (!c.lit && c.emberCooldown > 0) {
      c.emberCooldown -= dt;
      const emberRatio = Math.max(0, c.emberCooldown / 2.5);
      c.ember.material.opacity = emberRatio;
      // Hot red to cooling dark coal
      if (emberRatio > 0.15 && Math.random() < 0.32) {
        const worldPos = c.wickPos.clone().applyMatrix4(cakeGroup.matrixWorld);
        spawnSmokeParticle(worldPos, 0.8);
      }
      if (c.emberCooldown <= 0) {
        c.ember.visible = false;
      }
    }

    if (!c.lit) continue;
    litLeft++;

    // B. Wind deflection & turbulence based on 3D orientation
    // Viewer blows along -Z
    const candleWorldPos = c.wickPos.clone().applyMatrix4(cakeGroup.matrixWorld);
    // Front candles (facing viewer) experience wind earlier and stronger
    const frontFactor = clamp((candleWorldPos.z + 2.2) / 4.4, 0.35, 1.35);
    const localWind = breathStrength * frontFactor;

    // Fast organic flame turbulence (simulating room air and breath gusts)
    const fastFlicker = Math.sin(time * c.flickerSpeed + c.phase) * 0.12 + Math.cos(time * 35 + c.phase * 2) * 0.08;
    const flutter = Math.sin(time * 12 + c.phase) * 0.08;

    // Flame tilts away from viewer (towards -Z, pivoting cleanly at wick base)
    const tilt = localWind * 1.15 + (localWind > 0.1 ? fastFlicker * 0.35 : 0);
    c.flameGroup.rotation.x = -tilt * 0.75 + fastFlicker * 0.1;
    c.flameGroup.rotation.z = -tilt * 0.55 + flutter * 0.12;

    // Flame squashes and flares under wind pressure
    const squashY = clamp(1.0 - localWind * 0.55 + fastFlicker, 0.18, 1.35);
    const spreadX = clamp(1.0 + localWind * 0.42 + fastFlicker * 0.2, 0.45, 1.55);
    c.flameGroup.scale.set(spreadX, squashY, spreadX);

    // Candlelight intensity gutters under wind
    const gutter = Math.max(0, 1.0 - localWind * 0.65 + fastFlicker * 0.25);
    c.pLight.intensity = c.baseLightIntensity * gutter * c.health;

    // C. Extinguish logic with organic resistance
    if (localWind > 0.12) {
      c.health -= dt * localWind * c.rate;
      if (c.health <= 0) {
        c.lit = false;
        c.health = 0;
        c.flameGroup.visible = false;
        c.pLight.intensity = 0;
        c.emberCooldown = 2.5; // Ember stays hot for 2.5s
        c.ember.visible = true;
        c.ember.material.opacity = 1.0;
        c.ember.material.color.setHex(0xff2200);

        soundFx.playCandleOut();

        // Immediate burst of realistic smoke puffs
        const worldPos = c.wickPos.clone().applyMatrix4(cakeGroup.matrixWorld);
        for (let i = 0; i < 5; i++) {
          spawnSmokeParticle(worldPos, 1.25);
        }
      }
    } else if (c.health < 1) {
      // Natural flame recovery if breath let go before extinguishing
      c.health = Math.min(1, c.health + dt * 0.45);
    }
  }

  // Update rising smoke particles
  for (let i = smokeParticles3D.length - 1; i >= 0; i--) {
    const p = smokeParticles3D[i];
    p.userData.life += dt;
    if (p.userData.life >= p.userData.maxLife) {
      scene.remove(p);
      smokeParticles3D.splice(i, 1);
      continue;
    }
    const progress = p.userData.life / p.userData.maxLife;
    p.position.y += p.userData.vy * dt * 60;
    // Sinusoidal curling drift (air turbulence)
    p.position.x += (p.userData.vx + Math.sin(p.userData.life * 4 + p.userData.curlPhase) * 0.008) * dt * 60;
    p.position.z += (p.userData.vz + Math.cos(p.userData.life * 4 + p.userData.curlPhase) * 0.008) * dt * 60;
    p.rotation.z += p.userData.rotSpeed * dt;
    p.scale.setScalar(0.25 + Math.pow(progress, 0.6) * p.userData.maxScale);
    p.material.opacity = (1 - progress) * 0.42;
  }

  // Update breath motes
  for (let i = breathParticles3D.length - 1; i >= 0; i--) {
    const b = breathParticles3D[i];
    b.userData.life += dt;
    if (b.userData.life >= b.userData.maxLife) {
      scene.remove(b);
      breathParticles3D.splice(i, 1);
      continue;
    }
    b.position.z += b.userData.vz * dt * 60;
    b.position.x += b.userData.vx * dt * 60;
    b.position.y += b.userData.vy * dt * 60;
    const progress = b.userData.life / b.userData.maxLife;
    b.material.opacity = Math.sin(progress * Math.PI) * 0.45;
  }

  // All 21 candles extinguished celebration!
  if (litLeft === 0 && !window.candlesAllOut) {
    window.candlesAllOut = true;
    soundFx.playVictory();

    // Dim the scene lights for dramatic ambiance
    gsap.to(ambientLight, { intensity: 0.25, duration: prefersReducedMotion ? 0 : 1.2 });
    gsap.to(dirLight, { intensity: 0.35, duration: prefersReducedMotion ? 0 : 1.2 });

    // Multi-stage 3D confetti burst
    if (!prefersReducedMotion && window.confetti) {
      confetti({ particleCount: 180, spread: 100, colors: ['#ffffff', '#38bdf8', '#2563eb', '#cbd5e1', '#fcd34d'], origin: { y: 0.55 } });
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 130, colors: ['#ffffff', '#93c5fd', '#1d4ed8'], origin: { y: 0.4 } });
      }, 350);
    }

    const msgCard = $('msg');
    if (msgCard) msgCard.hidden = false;
  }
}

function animateScene() {
  if (!renderer || !scene || !camera) return;
  requestAnimationFrame(animateScene);

  const now = performance.now();
  const dt = Math.min((now - lastFrameTime) * 0.001, 0.1);
  lastFrameTime = now;

  // Gentle idle starfield rotation
  if (!prefersReducedMotion && starfieldPoints) {
    starfieldPoints.rotation.y += dt * 0.02;
    starfieldPoints.rotation.x += dt * 0.01;
  }

  // Act specific animations
  if (!prefersReducedMotion && currentAct === 'act2' && treeGroup) {
    treeGroup.rotation.y += dt * 0.12;
    targetRotationY = pointerX * 0.4;
    treeGroup.rotation.y = lerp(treeGroup.rotation.y, treeGroup.rotation.y + targetRotationY, 0.05);
  }

  if (currentAct === 'act3') {
    let breathVal = 0;
    if (holdPointer || holdKey) breathVal = 1.0;
    else if (micEngine.ready) breathVal = micEngine.read();

    smoothedBreath = lerp(smoothedBreath, breathVal, dt * 8);
    const meterFill = $('meterFill');
    if (meterFill) meterFill.style.width = Math.min(smoothedBreath * 100, 100) + '%';

    updateCandlePhysics(dt, smoothedBreath);

    if (!prefersReducedMotion && cakeGroup) {
      cakeGroup.rotation.y += dt * 0.06;
    }
  }

  if (!prefersReducedMotion && currentAct === 'act4' && giftGroup) {
    giftGroup.rotation.y += dt * 0.15;
    giftGroup.rotation.y = lerp(giftGroup.rotation.y, pointerX * 0.6, 0.04);
  }

  if (!prefersReducedMotion && currentAct === 'act5' && galaxyGroup) {
    galaxyGroup.rotation.y += dt * 0.1;
  }

  renderer.render(scene, camera);
}

/* ============================================================
   4. ACT 1 — CELESTIAL ARCHERY HERO
   ============================================================ */
const hero = $('actHero');
const motes = $('motes');
const target = $('target');
const archery = $('archery');
const arrow = $('arrow');
const strL = $('strL');
const strR = $('strR');
const serving = $('serving');

const flood = $('flood');
const field = $('field');
const kEyebrow = $('kEyebrow');
const kSub = $('kSub');
const barTop = $('barTop');
const barBot = $('barBot');
const bloom = $('bloom');

let curDraw = 0, maxDraw = 110;
let pullUX = 0, pullUY = 1;
let playedArchery = false, drawing = false;
let startPX = 0, startPY = 0, startDraw = 0;

function buildMotes() {
  if (!motes) return;
  motes.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const m = document.createElement('span');
    m.className = 'mote';
    const sz = 10 + Math.random() * 26;
    m.style.width = sz + 'px';
    m.style.height = sz + 'px';
    m.style.left = Math.random() * 100 + '%';
    m.style.top = Math.random() * 100 + '%';
    motes.appendChild(m);
    
    if (!prefersReducedMotion && window.gsap) {
      gsap.to(m, {
        y: -30 - Math.random() * 50,
        x: (Math.random() - 0.5) * 40,
        opacity: 0.15 + Math.random() * 0.7,
        duration: 3 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
    }
  }
}

function refreshRig() {
  if (!target || !archery) return;
  const tRect = target.getBoundingClientRect();
  const aRect = archery.getBoundingClientRect();
  const tx = tRect.left + tRect.width / 2;
  const ty = tRect.top + tRect.height * 0.55;
  const ax = aRect.left + aRect.width / 2;
  const ay = aRect.top + aRect.height * 0.55;

  const dx = tx - ax, dy = ty - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  pullUX = -ux; pullUY = -uy;

  const angleRad = Math.atan2(dy, dx);
  const deg = angleRad * (180 / Math.PI) + 90;
  if (window.gsap) gsap.set(archery, { rotation: deg });
}

function setDraw(d) {
  curDraw = clamp(d, 0, maxDraw);
  const nockY = 96 + curDraw;
  if (strL) strL.setAttribute('y2', nockY);
  if (strR) strR.setAttribute('y2', nockY);
  if (serving) serving.setAttribute('cy', nockY);
  if (arrow && window.gsap) gsap.set(arrow, { y: curDraw });
}

function fireArrow() {
  if (playedArchery) return;
  playedArchery = true;
  drawing = false;
  if (prefersReducedMotion) {
    if (hero) hero.hidden = true;
    switchAct('act2');
    return;
  }
  soundFx.playArrowRelease();

  const t = gsap.timeline();

  t.to({ d: curDraw }, {
    d: 0, duration: 0.12, ease: 'power3.in',
    onUpdate() { setDraw(this.targets()[0].d); }
  }, 0);

  t.to(arrow, { y: -380, duration: 0.24, ease: 'power2.in' }, 0.04);
  
  t.call(() => soundFx.playHeartImpact(), null, 0.24);
  t.to(target, { scale: 1.3, y: -15, duration: 0.1, ease: 'power2.out' }, 0.24)
   .to(target, { scale: 1.0, y: 0, duration: 0.2, ease: 'power2.inOut' }, 0.34);

  t.to(target, { y: 120, scaleX: 0.8, scaleY: 1.3, opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.5)
   .set(flood, { opacity: 1 }, 0.8)
   .fromTo(flood, { scale: 0.02 }, { scale: 1.25, duration: 0.55, ease: 'power2.in' }, 0.8);

  t.set(field, { opacity: 1 }, 1.3)
   .set(hero, { hidden: true }, 1.35)
   .to(barTop, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.4)
   .to(barBot, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.4)
   .to(kEyebrow, { opacity: 1, duration: 0.5 }, 1.5)
   .to('#wLine1', { yPercent: 0, rotationX: 0, duration: 0.6, ease: 'power3.out' }, 1.7)
   .to('#wLine2', { yPercent: 0, rotationX: 0, duration: 0.6, ease: 'power3.out' }, 2.0)
   .to(kSub, { opacity: 1, duration: 0.5 }, 2.5);

  t.to(barTop, { yPercent: -100, duration: 0.5 }, 3.2)
   .to(barBot, { yPercent: 100, duration: 0.5 }, 3.2)
   .set(bloom, { opacity: 1 }, 3.3)
   .fromTo(bloom, { scale: 0.02 }, { scale: 1.25, duration: 0.6, ease: 'power2.in' }, 3.3)
   .call(() => {
     switchAct('act2');
     if (bloom) bloom.style.opacity = '0';
     if (field) field.style.opacity = '0';
     if (flood) flood.style.opacity = '0';
   }, null, 3.8);
}

function initArcheryControls() {
  if (!archery) return;

  archery.addEventListener('pointerdown', (e) => {
    if (playedArchery) return;
    drawing = true;
    try { archery.setPointerCapture(e.pointerId); } catch (_) {}
    startPX = e.clientX; startPY = e.clientY; startDraw = curDraw;
    soundFx.playStringTension();
    e.preventDefault();
  });

  archery.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const proj = (e.clientX - startPX) * pullUX + (e.clientY - startPY) * pullUY;
    setDraw(startDraw + proj);
  });

  const endDraw = () => {
    if (!drawing) return;
    drawing = false;
    if (curDraw > maxDraw * 0.28) {
      fireArrow();
    } else {
      gsap.to({ d: curDraw }, {
        d: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)',
        onUpdate() { setDraw(this.targets()[0].d); }
      });
    }
  };

  archery.addEventListener('pointerup', endDraw);
  archery.addEventListener('pointercancel', endDraw);

  archery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (playedArchery) return;
      setDraw(maxDraw * 0.9);
      setTimeout(fireArrow, 120);
    }
  });

  const tapShootBtn = $('tapShootBtn');
  if (tapShootBtn) {
    tapShootBtn.addEventListener('click', () => {
      if (playedArchery) return;
      setDraw(maxDraw * 0.9);
      setTimeout(fireArrow, 120);
    });
  }
}

/* ============================================================
   5. MIC BREATH ENGINE & CAKE CONTROLS
   ============================================================ */
class MicBreathEngine {
  constructor() {
    this.ready = false;
    this.stream = null;
    this.audio = null;
    this.analyser = null;
    this.freq = null;
    this.floorLow = null;
    this.floorHigh = null;
    this.calibFrames = 0;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audio = new AC();
      if (this.audio.state === 'suspended') await this.audio.resume();

      const src = this.audio.createMediaStreamSource(this.stream);
      this.analyser = this.audio.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.5;
      src.connect(this.analyser);

      this.freq = new Float32Array(this.analyser.frequencyBinCount);
      this.binHz = this.audio.sampleRate / this.analyser.fftSize;
      this.lowBand = [Math.max(1, Math.floor(30 / this.binHz)), Math.ceil(300 / this.binHz)];
      this.highBand = [Math.floor(2000 / this.binHz), Math.ceil(7000 / this.binHz)];
      this.ready = true;
      return true;
    } catch (e) {
      console.warn('Mic access failed or denied:', e);
      return false;
    }
  }

  _bandDb([a, b]) {
    let sum = 0;
    for (let i = a; i <= b; i++) sum += Math.pow(10, this.freq[i] / 10);
    return 10 * Math.log10(sum / (b - a + 1) + 1e-12);
  }

  read() {
    if (!this.ready) return 0;
    this.analyser.getFloatFrequencyData(this.freq);
    const low = this._bandDb(this.lowBand);
    const high = this._bandDb(this.highBand);

    if (this.calibFrames < 30) {
      this.calibFrames++;
      this.floorLow = this.floorLow === null ? low : lerp(this.floorLow, low, 0.2);
      this.floorHigh = this.floorHigh === null ? high : lerp(this.floorHigh, high, 0.2);
      return 0;
    }

    const lowN = smoothstep(this.floorLow + 8, this.floorLow + 26, low);
    const highN = smoothstep(this.floorHigh + 8, this.floorHigh + 26, high);
    return Math.sqrt(lowN * highN);
  }

  stop() {
    this.ready = false;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audio) this.audio.close();
  }
}

const micEngine = new MicBreathEngine();
let holdPointer = false, holdKey = false;
let smoothedBreath = 0;

function initCakeControls() {
  const micBtn = $('micBtn');
  const holdBtn = $('holdBtn');
  const instantBlowBtn = $('instantBlowBtn');
  const meter = $('meter');
  if (!renderer) {
    if (micBtn) micBtn.hidden = true;
    if (holdBtn) holdBtn.hidden = true;
    const instruction = $('cakeInstruction');
    if (instruction) instruction.innerText = '3D candles are unavailable here. Choose “Blow All 21” to continue.';
  }

  if (micBtn) {
    micBtn.addEventListener('click', async () => {
      if (micEngine.ready) {
        micEngine.stop();
        if (meter) meter.hidden = true;
        const lbl = $('micLabel');
        if (lbl) lbl.innerText = 'Blow into Mic';
        return;
      }
      const lbl = $('micLabel');
      if (lbl) lbl.innerText = 'Listening...';
      const ok = await micEngine.start();
      if (ok) {
        if (meter) {
          meter.hidden = false;
          const ml = $('meterLabel');
          if (ml) ml.innerText = 'Blow into your microphone! 🎙️';
        }
        if (lbl) lbl.innerText = 'Blow now! 🎙️';
      } else {
        if (lbl) lbl.innerText = 'Mic blocked (use Hold)';
        setTimeout(() => {
          if (!micEngine.ready && lbl) lbl.innerText = 'Blow into Mic';
        }, 3000);
      }
    });
  }

  if (holdBtn) {
    const startHold = (e) => {
      if (e) e.preventDefault();
      holdPointer = true;
      try { if (e && e.pointerId) holdBtn.setPointerCapture(e.pointerId); } catch (_) {}
      if (meter) {
        meter.hidden = false;
        const ml = $('meterLabel');
        if (ml) ml.innerText = 'Blowing with breath stream… 💨';
      }
    };
    const endHold = (e) => {
      holdPointer = false;
      try { if (e && e.pointerId) holdBtn.releasePointerCapture(e.pointerId); } catch (_) {}
      if (meter && !micEngine.ready) {
        if (!window.candlesAllOut) {
          const ml = $('meterLabel');
          if (ml) ml.innerText = 'Hold down to extinguish all 21!';
        }
      }
    };

    holdBtn.addEventListener('pointerdown', startHold);
    holdBtn.addEventListener('pointerup', endHold);
    holdBtn.addEventListener('pointercancel', endHold);
    window.addEventListener('pointerup', endHold);
    window.addEventListener('pointercancel', endHold);
  }

  if (instantBlowBtn) {
    instantBlowBtn.addEventListener('click', () => {
      if (candleObjects.length === 0) {
        window.candlesAllOut = true;
        const msgCard = $('msg');
        if (msgCard) msgCard.hidden = false;
        return;
      }

      if (meter) {
        meter.hidden = false;
        const ml = $('meterLabel');
        if (ml) ml.innerText = 'Extinguishing all 21 candles! ✨';
      }
      smoothedBreath = 2.0;

      // Reliably extinguish every candle in a rapid, satisfying wave
      let delay = 0;
      candleObjects.forEach((c) => {
        if (!c.lit) return;
        setTimeout(() => {
          if (!c.lit) return;
          c.health = 0;
          c.lit = false;
          if (c.flameGroup) c.flameGroup.visible = false;
          if (c.pLight) c.pLight.intensity = 0;
          c.emberCooldown = 2.5;
          if (c.ember) {
            c.ember.visible = true;
            c.ember.material.opacity = 1.0;
            c.ember.material.color.setHex(0xff2200);
          }
          soundFx.playCandleOut();
          if (cakeGroup) {
            const worldPos = c.wickPos.clone().applyMatrix4(cakeGroup.matrixWorld);
            for (let i = 0; i < 4; i++) {
              spawnSmokeParticle(worldPos, 1.25);
            }
          }
        }, delay);
        delay += 35;
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && currentAct === 'act3' && e.target.tagName !== 'INPUT') {
      holdKey = true;
      if (meter) {
        meter.hidden = false;
        const ml = $('meterLabel');
        if (ml) ml.innerText = 'Spacebar breath stream… 💨';
      }
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      holdKey = false;
      if (meter && !micEngine.ready && !window.candlesAllOut) {
        const ml = $('meterLabel');
        if (ml) ml.innerText = 'Hold Space or button to blow';
      }
    }
  });
}

/* ============================================================
   6. ACT 4 — 3D GIFT CAPSULE & PERSONAL LETTER
   ============================================================ */
let giftOpened = false;

function initGiftBox() {
  const trigger = $('giftBoxTrigger');
  const unwrapBtn = $('unwrapGiftBtn');
  const letterModal = $('letterModal');

  const openGiftAction = () => {
    if (giftOpened) return;
    giftOpened = true;
    soundFx.playVictory();

    // Animate 3D gift box opening
    if (giftLid) {
      if (prefersReducedMotion) {
        giftLid.position.y = 2.8;
        giftLid.rotation.set(0.4, 0, -0.3);
      } else {
        gsap.to(giftLid.position, { y: 2.8, duration: 0.8, ease: 'power2.out' });
        gsap.to(giftLid.rotation, { x: 0.4, z: -0.3, duration: 0.8, ease: 'power2.out' });
      }
    }

    if (!prefersReducedMotion && window.confetti) {
      confetti({ particleCount: 90, spread: 75, colors: ['#ffffff', '#38bdf8', '#2563eb', '#cbd5e1'] });
    }

    if (unwrapBtn) {
      unwrapBtn.disabled = true;
      unwrapBtn.style.opacity = '0.6';
      unwrapBtn.innerHTML = '<span>✨</span> 3D Gift Box Unwrapped!';
    }

    if (letterModal) {
      letterModal.hidden = false;
      setTimeout(() => {
        letterModal.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const heading = letterModal.querySelector('.letter-heading');
        if (heading) heading.focus({ preventScroll: true });
      }, 100);
    }
  };

  if (trigger) {
    trigger.addEventListener('click', (e) => {
      if (e.target.closest('#unwrapGiftBtn')) return;
      openGiftAction();
    });
  }

  if (unwrapBtn) {
    unwrapBtn.addEventListener('click', openGiftAction);
  }
}

/* ============================================================
   7. ACT 5 — 3D CELEBRATION GALAXY & TOASTS
   ============================================================ */
function initToastControls() {
  const sendToastBtn = $('sendToastBtn');
  const customToastInput = $('customToastInput');
  const toastStream = $('toastStream');

  const addToastBubble = (text) => {
    if (!toastStream || !text.trim()) return;
    const bubble = document.createElement('div');
    bubble.className = 'toast-bubble';
    bubble.innerHTML = `<span aria-hidden="true">🥂</span> <span>${escapeHtml(text.trim())}</span>`;
    toastStream.prepend(bubble);
  };

  const escapeHtml = (str) => str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));

  if (sendToastBtn) {
    sendToastBtn.addEventListener('click', () => {
      soundFx.playToastClink();
      if (!prefersReducedMotion && window.confetti) {
        confetti({ particleCount: 140, spread: 85, colors: ['#ffffff', '#38bdf8', '#2563eb', '#cbd5e1', '#fcd34d'], origin: { y: 0.65 } });
      }
      const val = customToastInput ? customToastInput.value.trim() : '';
      if (val) {
        addToastBubble(val);
        customToastInput.value = '';
      } else {
        addToastBubble('🥂 Happy 21st Birthday, Sushma! To an unforgettable year ahead! ✨');
      }
    });
  }

  if (customToastInput) {
    customToastInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && sendToastBtn) sendToastBtn.click();
    });
  }

  document.querySelectorAll('.toast-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const toastText = chip.getAttribute('data-toast') || '';
      if (customToastInput) customToastInput.value = toastText;
      soundFx.playToastClink();
      if (!prefersReducedMotion && window.confetti) {
        confetti({ particleCount: 90, spread: 70, colors: ['#ffffff', '#38bdf8', '#2563eb', '#cbd5e1'] });
      }
      addToastBubble(toastText);
    });
  });

  // 3D Constellation Nodes Interactive with click and keyboard support
  document.querySelectorAll('.c-node').forEach(node => {
    const activateNode = () => {
      soundFx.playToastClink();
      if (!prefersReducedMotion && window.confetti) confetti({ particleCount: 60, spread: 60, colors: ['#38bdf8', '#ffffff'] });
    };
    node.addEventListener('click', activateNode);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateNode();
      }
    });
  });
}

/* ============================================================
   8. CHAPTER SWITCHER (Seamless Narrative Flow, No Nav Bar!)
   ============================================================ */
function updateProgressDots(actId) {
  const actNum = parseInt(actId.replace('act', ''), 10);
  const dots = document.querySelectorAll('.act-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === actNum);
  });
  const progress = document.getElementById('actProgress');
  if (progress) progress.classList.add('visible');
}

function switchAct(actId) {
  currentAct = actId;
  updateProgressDots(actId);
  if (soundFx.isPlayingMusic && soundFx.musicGain && soundFx.ctx) {
    soundFx.musicGain.gain.setTargetAtTime(actId === 'act4' ? 0.08 : 0.25, soundFx.ctx.currentTime, 0.35);
  }

  const acts = {
    act1: $('actHero'),
    act2: $('actTree'),
    act3: $('actCake'),
    act4: $('actGift'),
    act5: $('actGalaxy')
  };

  Object.keys(acts).forEach(key => {
    if (acts[key]) acts[key].hidden = (key !== actId);
  });

  // Toggle 3D scene elements per act
  if (treeGroup) treeGroup.visible = (actId === 'act2');
  if (cakeGroup) cakeGroup.visible = (actId === 'act3');
  if (giftGroup) giftGroup.visible = (actId === 'act4');
  if (galaxyGroup) galaxyGroup.visible = (actId === 'act5');

  // Camera choreographies in 3D
  if (camera) {
    const duration = prefersReducedMotion ? 0 : 1.2;
    if (actId === 'act1') {
      gsap.to(camera.position, { x: 0, y: 1.5, z: 9, duration, ease: 'power2.inOut' });
      gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration, ease: 'power2.inOut' });
    } else if (actId === 'act2') {
      gsap.to(camera.position, { x: 0, y: 1.4, z: 7.5, duration, ease: 'power2.inOut' });
      gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration, ease: 'power2.inOut' });
    } else if (actId === 'act3') {
      // Elevated isometric angle looking down on all 3 tiers and all 21 candles
      const isNarrow = window.innerWidth < 640;
      const targetZ = isNarrow ? 8.6 : 7.6;
      const targetY = isNarrow ? 3.3 : 2.9;
      gsap.to(camera.position, { x: 0, y: targetY, z: targetZ, duration, ease: 'power2.inOut' });
      gsap.to(camera.rotation, { x: -0.14, y: 0, z: 0, duration, ease: 'power2.inOut' });
      // Reset lighting
      if (ambientLight) gsap.to(ambientLight, { intensity: 0.7, duration: prefersReducedMotion ? 0 : 0.8 });
      if (dirLight) gsap.to(dirLight, { intensity: 0.85, duration: prefersReducedMotion ? 0 : 0.8 });
    } else if (actId === 'act4') {
      gsap.to(camera.position, { x: 0, y: 1.6, z: 6.8, duration, ease: 'power2.inOut' });
      gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration, ease: 'power2.inOut' });
    } else if (actId === 'act5') {
      gsap.to(camera.position, { x: 0, y: 2.0, z: 8.5, duration, ease: 'power2.inOut' });
      gsap.to(camera.rotation, { x: 0, y: 0, z: 0, duration, ease: 'power2.inOut' });
    }
  }
}

function initNavigationFlow() {
  const audioToggleBtn = $('audioToggleBtn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', async () => {
      const playing = await soundFx.toggleMusic();
      audioToggleBtn.classList.toggle('playing', playing);
      const audioText = $('audioText');
      if (audioText) audioText.innerText = !soundFx.available ? 'Sound unavailable' : playing ? 'Sound: On' : 'Sound: Off';
      audioToggleBtn.setAttribute(
        'aria-label',
        !soundFx.available ? 'Ambient sound unavailable' : playing ? 'Mute Ambient Soundtrack' : 'Play Ambient Soundtrack'
      );
    });
  }

  const goToCakeBtn = $('goToCakeBtn');
  if (goToCakeBtn) {
    goToCakeBtn.addEventListener('click', () => switchAct('act3'));
  }

  // Auto-pulse tap shoot button after 4s if still on act1
  setTimeout(() => {
    if (!prefersReducedMotion && currentAct === 'act1' && !playedArchery) {
      const tapBtn = $('tapShootBtn');
      if (tapBtn) {
        gsap.fromTo(tapBtn, { scale: 1 }, {
          scale: 1.08, duration: 0.4, repeat: 5, yoyo: true,
          ease: 'power1.inOut'
        });
      }
    }
  }, 4000);

  const openGiftBtn = $('openGiftBtn');
  if (openGiftBtn) {
    openGiftBtn.addEventListener('click', () => {
      switchAct('act4');
      const actGift = $('actGift');
      if (actGift) actGift.scrollTop = 0;
    });
  }

  const goToGalaxyBtn = $('goToGalaxyBtn');
  if (goToGalaxyBtn) {
    goToGalaxyBtn.addEventListener('click', () => {
      switchAct('act5');
      const actGalaxy = $('actGalaxy');
      if (actGalaxy) actGalaxy.scrollTop = 0;
    });
  }

  const globalReplayBtn = $('globalReplayBtn');
  if (globalReplayBtn) {
    globalReplayBtn.addEventListener('click', () => {
      playedArchery = false;
      window.candlesAllOut = false;
      giftOpened = false;

      const msgCard = $('msg');
      if (msgCard) msgCard.hidden = true;
      const letterModal = $('letterModal');
      if (letterModal) letterModal.hidden = true;

      // Reset unwrap button
      const unwrapBtn = $('unwrapGiftBtn');
      if (unwrapBtn) {
        unwrapBtn.disabled = false;
        unwrapBtn.style.opacity = '1';
        unwrapBtn.innerHTML = '<span>🎀</span> Tap to Open 3D Gift Box';
      }

      // Reset gift box lid
      if (giftLid) {
        giftLid.position.set(0, 0.95, 0);
        giftLid.rotation.set(0, 0, 0);
      }

      // Relight all 21 candles & reset flame and light
      for (const c of candleObjects) {
        c.lit = true;
        c.health = 1.0;
        c.emberCooldown = 0;
        if (c.flameGroup) {
          c.flameGroup.visible = true;
          c.flameGroup.scale.set(1, 1, 1);
          c.flameGroup.rotation.set(0, 0, 0);
        }
        if (c.ember) c.ember.visible = false;
        if (c.pLight) c.pLight.intensity = c.baseLightIntensity;
      }

      // Clear any floating smoke & breath particles
      for (const p of smokeParticles3D) scene.remove(p);
      smokeParticles3D.length = 0;
      for (const b of breathParticles3D) scene.remove(b);
      breathParticles3D.length = 0;

      // Restore scene lighting
      if (ambientLight) gsap.to(ambientLight, { intensity: 0.7, duration: 0.5 });
      if (dirLight) gsap.to(dirLight, { intensity: 0.85, duration: 0.5 });

      // Reset mic & breath state
      micEngine.stop();
      holdPointer = false;
      holdKey = false;
      smoothedBreath = 0;
      const meter = $('meter');
      if (meter) meter.hidden = true;
      const micLabel = $('micLabel');
      if (micLabel) micLabel.innerText = 'Blow into Mic';

      // Reset Archery & Act 1 target/arrow
      if (target) {
        gsap.set(target, { y: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, clearProps: 'all' });
      }
      if (arrow) {
        gsap.set(arrow, { y: 0, clearProps: 'transform' });
      }
      gsap.set([barTop, barBot, kEyebrow, '#wLine1', '#wLine2', kSub], { clearProps: 'all' });
      gsap.set([flood, field, bloom], { opacity: 0, clearProps: 'all' });
      setDraw(0);
      drawing = false;

      // Switch to Act 1
      switchAct('act1');
      if (hero) hero.hidden = false;
      setTimeout(refreshRig, 150);
    });
  }
}

/* ============================================================
   9. SPLASH SCREEN
   ============================================================ */
function buildSplashStars() {
  const container = document.getElementById('splashStars');
  if (!container) return;
  // Tiny twinkling stars
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'splash__star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--d', (2 + Math.random() * 4).toFixed(1) + 's');
    s.style.setProperty('--delay', (Math.random() * 4).toFixed(1) + 's');
    s.style.opacity = (0.1 + Math.random() * 0.4).toFixed(2);
    const sz = 1 + Math.round(Math.random() * 2);
    s.style.width = sz + 'px';
    s.style.height = sz + 'px';
    container.appendChild(s);
  }
  // Floating emoji sparkles
  const emojis = ['✨', '⭐', '💫', '🌟', '✦', '✧'];
  for (let i = 0; i < 18; i++) {
    const sp = document.createElement('span');
    sp.className = 'splash__sparkle';
    sp.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    sp.style.left = (5 + Math.random() * 90) + '%';
    sp.style.top = (5 + Math.random() * 90) + '%';
    sp.style.setProperty('--sz', (10 + Math.random() * 16).toFixed(0) + 'px');
    sp.style.setProperty('--d', (4 + Math.random() * 5).toFixed(1) + 's');
    sp.style.setProperty('--delay', (Math.random() * 3).toFixed(1) + 's');
    container.appendChild(sp);
  }
}

function initSplash() {
  buildSplashStars();
  const splash = document.getElementById('splashScreen');
  const btn = document.getElementById('splashBtn');
  const audioBtn = document.getElementById('audioToggleBtn');

  // Hide audio button during splash
  if (audioBtn) audioBtn.style.opacity = '0';

  function dismissSplash() {
    if (!splash || splash.classList.contains('fade-out')) return;
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.hidden = true;
      splash.remove();
      if (audioBtn) {
        audioBtn.style.opacity = '';
        audioBtn.style.transition = 'opacity 0.6s ease';
      }
    }, 850);
  }

  if (btn) {
    btn.addEventListener('click', dismissSplash);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dismissSplash(); }
    });
  }
  // Also dismiss on any touch anywhere on splash (but not on the button which handles its own)
  if (splash) {
    splash.addEventListener('click', (e) => {
      if (e.target === splash) dismissSplash();
    });
  }
}

/* ============================================================
   10. GLOBAL INITIALIZATION
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initThree();
  buildMotes();
  initArcheryControls();
  initCakeControls();
  initGiftBox();
  initToastControls();
  initNavigationFlow();

  animateScene();
  setTimeout(refreshRig, 150);
});
