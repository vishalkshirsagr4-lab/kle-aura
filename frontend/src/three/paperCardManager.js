import * as THREE from "three";

/* Shared paper-crumple renderer for all event cards.

   One WebGLRenderer + one fixed canvas for the whole page (the three.js
   "multiple elements" pattern): every visible card is rendered into its
   own scissor/viewport rectangle. Idle cards cost nothing — a view is
   redrawn only when its crumple/tilt is animating or its page position
   changed. WebGL failures are reported so cards can fall back to CSS. */

const CARD_FOV = 28;
const PITCH = (40 * Math.PI) / 180; // camera elevation over the flat sheet
const REST_P = 0.04;
const FILL = 0.92;

let core = null;

function makeCore(animData) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40;";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, coarse ? 1 : 2),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.useLegacyLights = true;
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
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

function fitCamera(view, aspect) {
  const cam = view.camera;
  cam.aspect = aspect;
  // projected extent of the sheet (with crumple headroom) at the target plane
  const projW = 1.14;
  const projH = 1.1;
  const visH =
    aspect >= projW / projH ? projH / FILL : projW / projH / FILL / aspect;
  const d = visH / (2 * Math.tan((CARD_FOV / 2) * (Math.PI / 180)));
  cam.position.set(0, 0.12 + d * Math.sin(PITCH), d * Math.cos(PITCH));
  cam.lookAt(0, 0.12, 0);
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
    if (Math.abs(view.targetP - view.p) < 0.0015) view.p = view.targetP;
    const animatingP = view.p !== prevP;

    const prevTx = view.tiltX;
    const prevTy = view.tiltY;
    view.tiltX += (view.targetTiltX - view.tiltX) * (1 - Math.exp(-9 * dt));
    view.tiltY += (view.targetTiltY - view.tiltY) * (1 - Math.exp(-9 * dt));
    const animatingT = view.tiltX !== prevTx || view.tiltY !== prevTy;

    if (animatingP) {
      const frame = view.p * maxFrame;
      if (Math.abs(frame - view.lastFrame) > 0.004) {
        writeFrame(view, animData, frame);
      }
      if (view.onProgress) view.onProgress(view.p);
    }
    if (animatingT) {
      view.mesh.rotation.x = view.tiltX;
      view.mesh.rotation.y = view.tiltY;
    }

    // --- visibility + layout ---
    if (!view.visible) continue;
    const el = view.el;
    const rect = el.getBoundingClientRect();
    if (
      rect.width === 0 ||
      rect.bottom < -8 ||
      rect.top > vh + 8 ||
      rect.right < -8 ||
      rect.left > vw + 8
    ) {
      continue;
    }

    const needsRender =
      animatingP || animatingT || !view.rendered || state.layoutDirty;
    if (!needsRender) continue;

    const aspect = rect.width / rect.height;
    if (Math.abs(aspect - view.camera.aspect) > 0.01) {
      fitCamera(view, aspect);
    }

    const left = Math.round(rect.left);
    const b = Math.round(vh - rect.bottom);
    renderer.setViewport(left, b, rect.width, rect.height);
    renderer.setScissor(left, b, rect.width, rect.height);
    renderer.setScissorTest(true);
    renderer.render(view.scene, view.camera);
    view.rendered = true;
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
  core?.views.delete(view);
  core?.failHandlers.delete(view.onFail);
}

/** True when the shared3D system is up. */
export function paperCardsActive() {
  return !!core;
}

/** Boot the shared renderer. Returns false when WebGL is unavailable. */
export function initPaperCards(animData) {
  if (core) return true;
  try {
    core = makeCore(animData);
    return true;
  } catch (e) {
    core = null;
    return false;
  }
}

/**
 * Register one card element with the shared renderer.
 * Returns a handle: { setInteraction, setTilt, dispose }.
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
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.25));
  const dir = new THREE.DirectionalLight(0xffffff, 1.05);
  dir.position.set(-1.4, 2.4, 1.8);
  scene.add(dir);
  const camera = new THREE.PerspectiveCamera(CARD_FOV, 1, 0.1, 20);
  fitCamera(camera, 5 / 7);

  const view = {
    el,
    scene,
    camera,
    mesh,
    geometry,
    positionAttr,
    normalAttr,
    p: REST_P,
    targetP: REST_P,
    rate: 6,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    lastFrame: -1,
    rendered: false,
    visible: true,
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
        view.targetP = 0.58;
        view.rate = 13;
      } else if (hover) {
        view.targetP = 0.34;
        view.rate = 7;
      } else if (focused) {
        view.targetP = 0.22;
        view.rate = 7;
      } else {
        view.targetP = REST_P;
        view.rate = 5.5;
      }
    },
    setTilt(nx, ny) {
      if (disposed) return;
      // nx, ny in [-0.5, 0.5]; subtle paper lean toward the pointer
      view.targetTiltY = nx * 0.26;
      view.targetTiltX = ny * 0.18;
    },
    resetTilt() {
      if (disposed) return;
      view.targetTiltX = 0;
      view.targetTiltY = 0;
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
