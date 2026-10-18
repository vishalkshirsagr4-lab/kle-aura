import * as THREE from "three";
import { setTextureAnisotropy } from "./paperTexture";

/* Shared paper-crumple renderer for all event cards.
   Uses the Three.js multiple-element scissor pattern:
   One shared WebGLRenderer and one fixed full-window transparent canvas.
   Each card's poster is rendered into its exact viewport rectangle.
   The poster mesh stands upright, facing the camera with authentic tactile
   paper curvature, subtle folds, realistic lighting, and smooth pointer tilt. */

const CARD_FOV = 28;
const FILL = 0.90; // Fills 90% of container (eliminates empty space while leaving room for tilt)
const SHEET_W = 1.0;
const SHEET_H = 1.414;
const SHEET_ASPECT = SHEET_W / SHEET_H; // ~0.707 (standard ISO paper ratio)
const REST_P = 0.02; // Authentic subtle paper sheet curvature at rest

let core = null;
let shadowTexture = null;

function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 360;
  const ctx = c.getContext("2d");
  // Feathered radial gradient with brand-tinted soft contact shadow
  const g = ctx.createRadialGradient(128, 180, 40, 128, 180, 160);
  g.addColorStop(0, "rgba(79, 70, 229, 0.16)"); // Soft purple contact core
  g.addColorStop(0.35, "rgba(15, 23, 42, 0.12)");
  g.addColorStop(0.70, "rgba(15, 23, 42, 0.04)");
  g.addColorStop(1, "rgba(15, 23, 42, 0)"); // Seamless zero-edge fade
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 360);
  shadowTexture = new THREE.CanvasTexture(c);
  shadowTexture.generateMipmaps = true;
  shadowTexture.minFilter = THREE.LinearMipmapLinearFilter;
  return shadowTexture;
}

function makeCore(animData) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20;";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });

  // Preserve high-DPI crispness on all displays
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0); // 100% transparent canvas background
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  setTextureAnisotropy(maxAniso);

  document.body.appendChild(canvas);

  const state = {
    animData,
    canvas,
    renderer,
    views: new Set(),
    raf: 0,
    running: false,
    layoutDirty: true,
    failHandlers: new Set(),
  };

  const onScrollResize = () => {
    state.sizeChanged = true;
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") startLoop(state);
    else stopLoop(state);
  };
  const onContextLost = (e) => {
    e.preventDefault();
    failAll(state);
  };

  window.addEventListener("scroll", onScrollResize, { passive: true });
  window.addEventListener("resize", onScrollResize);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);

  state.cleanup = () => {
    window.removeEventListener("scroll", onScrollResize);
    window.removeEventListener("resize", onScrollResize);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);
  };

  startLoop(state);
  return state;
}

function failAll(state) {
  const handlers = [...state.failHandlers];
  disposeCore(state);
  handlers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      /* a card's handler must not break the rest */
    }
  });
}

/**
 * Positions the camera directly in front of the upright poster.
 * Centers the poster tightly, eliminating unnecessary empty space.
 */
function fitCamera(cam, aspect) {
  cam.aspect = aspect;

  const visH =
    aspect >= SHEET_ASPECT
      ? SHEET_H / FILL
      : (SHEET_W / FILL) / aspect;

  const d = visH / (2 * Math.tan((CARD_FOV / 2) * (Math.PI / 180)));
  cam.position.set(0, 0, d);
  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();
}

function writeFrame(view, animData, frameIdx) {
  const len = animData.pointCount * 3;
  const f0 = Math.floor(frameIdx);
  const t = frameIdx - f0;
  const off0 = f0 * len;
  const posArr = view.positionAttr.array;
  const nrmArr = view.normalAttr.array;
  if (t < 1e-4) {
    posArr.set(animData.positions.subarray(off0, off0 + len));
    nrmArr.set(animData.normals.subarray(off0, off0 + len));
  } else {
    const off1 = ((f0 + 1) % animData.frameCount) * len;
    const s = 1 - t;
    for (let i = 0; i < len; i++) {
      posArr[i] =
        animData.positions[off0 + i] * s + animData.positions[off1 + i] * t;
      nrmArr[i] =
        animData.normals[off0 + i] * s + animData.normals[off1 + i] * t;
    }
  }
  view.positionAttr.needsUpdate = true;
  view.normalAttr.needsUpdate = true;
  view.lastFrame = frameIdx;
}

let lastT = 0;
function tick(state, now) {
  if (!state.running) return;
  state.raf = requestAnimationFrame((t) => tick(state, t));
  const dt = Math.min((now - lastT) / 1000, 0.05) || 0.016;
  lastT = now;

  const { animData, renderer, views } = state;
  const maxFrame = animData.frameCount - 1;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  if (state.sizeChanged) {
    renderer.setSize(vw, vh, false);
    state.sizeChanged = false;
    state.layoutDirty = true;
  }

  let rendered = false;
  for (const view of views) {
    // --- animate crumple + tilt ---
    const prevP = view.p;
    const rate = view.rate;
    view.p += (view.targetP - view.p) * (1 - Math.exp(-rate * dt));
    if (Math.abs(view.targetP - view.p) < 0.001) view.p = view.targetP;
    const animatingP = Math.abs(view.p - prevP) > 0.0001;

    const prevTx = view.tiltX;
    const prevTy = view.tiltY;
    view.tiltX += (view.targetTiltX - view.tiltX) * (1 - Math.exp(-10 * dt));
    view.tiltY += (view.targetTiltY - view.tiltY) * (1 - Math.exp(-10 * dt));
    const animatingT =
      Math.abs(view.tiltX - prevTx) > 0.0001 ||
      Math.abs(view.tiltY - prevTy) > 0.0001;

    if (animatingP) {
      const frame = view.p * maxFrame;
      if (Math.abs(frame - view.lastFrame) > 0.002) {
        writeFrame(view, animData, frame);
      }
      if (view.onProgress) view.onProgress(view.p);
    }
    if (animatingT) {
      // Base rotation is Math.PI / 2 (standing upright facing camera).
      // Natural 3D paper tilt following pointer/touch
      view.mesh.rotation.x = Math.PI / 2 - view.tiltX;
      view.mesh.rotation.y = view.tiltY;
      view.mesh.rotation.z = -view.tiltY * 0.28;

      // Soft shadow shifts with parallax
      if (view.shadowMesh) {
        view.shadowMesh.position.x = view.tiltY * 0.04;
        view.shadowMesh.position.y = -0.015 + view.tiltX * 0.04;
        view.shadowMesh.rotation.x = -view.tiltX * 0.45;
        view.shadowMesh.rotation.y = view.tiltY * 0.45;
      }
    }

    if (view.dim !== view.dimTarget) {
      view.dim = view.dimTarget;
      const mat = view.mesh.material;
      mat.opacity = view.dim ? 0.35 : 1;
      mat.needsUpdate = true;
      view.rendered = false;
    }

    // --- visibility + layout ---
    if (!view.visible) continue;
    const el = view.el;
    const rect = el.getBoundingClientRect();
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      rect.bottom < -10 ||
      rect.top > vh + 10 ||
      rect.right < -10 ||
      rect.left > vw + 10
    ) {
      continue;
    }

    const left = Math.round(rect.left);
    const b = Math.round(vh - rect.bottom);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);

    const moved =
      view.rl !== left || view.rb !== b || view.rw !== w || view.rh !== h;

    const needsRender =
      animatingP ||
      animatingT ||
      !view.rendered ||
      state.layoutDirty ||
      moved;
    if (!needsRender) continue;

    const aspect = w / Math.max(h, 1);
    if (Math.abs(aspect - view.camera.aspect) > 0.005) {
      fitCamera(view.camera, aspect);
    }

    renderer.setViewport(left, b, w, h);
    renderer.setScissor(left, b, w, h);
    renderer.setScissorTest(true);
    renderer.render(view.scene, view.camera);
    view.rendered = true;
    view.rl = left;
    view.rb = b;
    view.rw = w;
    view.rh = h;
    rendered = true;
  }

  if (rendered) {
    renderer.setScissorTest(false);
    state.layoutDirty = false;
  }
}

function startLoop(state) {
  if (state.running || document.visibilityState !== "visible") return;
  state.running = true;
  lastT = performance.now();
  state.raf = requestAnimationFrame((t) => tick(state, t));
}

function stopLoop(state) {
  state.running = false;
  cancelAnimationFrame(state.raf);
}

function disposeCore(state) {
  stopLoop(state);
  state.cleanup?.();
  for (const view of [...state.views]) disposeView(view);
  state.renderer.dispose();
  state.canvas.remove();
  core = null;
}

function disposeView(view) {
  view.observer?.disconnect();
  view.resizeObserver?.disconnect();
  view.geometry.dispose();
  view.shadowMesh?.geometry?.dispose();
  view.shadowMesh?.material?.dispose();
  core?.views.delete(view);
  core?.failHandlers.delete(view.onFail);
}

/** True when the shared 3D system is up. */
export function paperCardsActive() {
  return !!core;
}

/** Boot the shared renderer. Returns false when WebGL is unavailable. */
export function initPaperCards(animData) {
  if (core) return true;
  try {
    core = makeCore(animData);
    return true;
  } catch (error) {
    core = null;
    console.error("Unable to initialize the event-card 3D renderer.", error);
    return false;
  }
}

/**
 * Register one card's poster element with the shared renderer.
 * Returns a handle: { setInteraction, setTilt, resetTilt, setDim, dispose }.
 */
export function addPaperCard({ el, material, onProgress, onFail }) {
  if (!core) return null;
  const { animData } = core;

  const geometry = new THREE.BufferGeometry();
  const positionAttr = new THREE.BufferAttribute(
    new Float32Array(animData.pointCount * 3),
    3,
  );
  positionAttr.setUsage(THREE.DynamicDrawUsage);
  const normalAttr = new THREE.BufferAttribute(
    new Float32Array(animData.pointCount * 3),
    3,
  );
  normalAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("normal", normalAttr);
  geometry.setAttribute("uv", new THREE.BufferAttribute(animData.uvs, 2));
  geometry.setIndex(
    new THREE.BufferAttribute(
      animData.indices instanceof Uint32Array
        ? new Uint32Array(animData.indices)
        : new Uint16Array(animData.indices),
      1,
    ),
  );

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  // Rotate mesh by Math.PI / 2 so that it stands vertically facing the camera
  mesh.rotation.x = Math.PI / 2;

  const scene = new THREE.Scene();

  // Delicate physical contact shadow behind the paper sheet for authentic 3D depth
  const shadowGeo = new THREE.PlaneGeometry(1.04, 1.46);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: getShadowTexture(),
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(0, -0.015, -0.04);
  scene.add(shadowMesh);

  // Balanced studio paper ambiance
  scene.add(new THREE.AmbientLight(0xffffff, 0.48));

  // Key directional light in front and above the poster creating crisp paper highlights
  const dir = new THREE.DirectionalLight(0xfff8f0, 0.78);
  dir.position.set(1.8, 2.8, 3.2);
  scene.add(dir);

  // Soft cool bounce fill
  const fill = new THREE.DirectionalLight(0x93c5fd, 0.22);
  fill.position.set(-2.0, -1.2, 2.0);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(CARD_FOV, SHEET_ASPECT, 0.1, 20);
  fitCamera(camera, SHEET_ASPECT);

  const view = {
    el,
    scene,
    camera,
    mesh,
    shadowMesh,
    geometry,
    positionAttr,
    normalAttr,
    p: REST_P,
    targetP: REST_P,
    rate: 7,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    lastFrame: -1,
    rendered: false,
    visible: true,
    dim: false,
    dimTarget: false,
    onProgress,
    onFail,
  };
  scene.add(mesh);
  writeFrame(view, animData, REST_P * (animData.frameCount - 1));

  view.observer = new IntersectionObserver(
    ([entry]) => {
      view.visible = entry.isIntersecting;
      if (entry.isIntersecting) view.rendered = false;
    },
    { rootMargin: "160px" },
  );
  view.observer.observe(el);

  if ("ResizeObserver" in window) {
    view.resizeObserver = new ResizeObserver(() => {
      view.rendered = false;
    });
    view.resizeObserver.observe(el);
  }

  core.views.add(view);
  if (onFail) core.failHandlers.add(onFail);
  startLoop(core);

  let disposed = false;
  return {
    setInteraction({ hover = false, pressed = false, focused = false } = {}) {
      if (disposed) return;
      if (pressed) {
        // Satisfying tactile paper press crumple
        view.targetP = 0.14;
        view.rate = 14;
      } else if (hover) {
        // Realistic paper folds and wrinkles on hover
        view.targetP = 0.07;
        view.rate = 8;
      } else if (focused) {
        view.targetP = 0.05;
        view.rate = 8;
      } else {
        // Return smoothly to tactile resting curvature
        view.targetP = REST_P;
        view.rate = 7;
      }
    },
    setTilt(nx, ny) {
      if (disposed) return;
      // Controlled tilt angle in range [-0.14, 0.14] radians (~8 degrees)
      view.targetTiltY = nx * 0.14;
      view.targetTiltX = ny * 0.10;
    },
    resetTilt() {
      if (disposed) return;
      view.targetTiltX = 0;
      view.targetTiltY = 0;
    },
    setDim(dimmed) {
      if (disposed) return;
      view.dimTarget = !!dimmed;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disposeView(view);
    },
  };
}

/** Tear everything down (page unmount). */
export function disposePaperCards() {
  if (core) disposeCore(core);
}
