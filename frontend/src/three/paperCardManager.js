import * as THREE from "three";

/* Shared paper-crumple renderer for all event cards.
   Uses the Three.js multiple-element scissor pattern:
   One shared WebGLRenderer and one fixed full-window canvas.
   Each card view is rendered only into its poster area viewport.
   Idle views cost zero GPU time. */

const CARD_FOV = 28;
const PITCH = (22 * Math.PI) / 180; // 22-degree gentle elevation for clear poster view
const REST_P = 0.00; // Flat, undistorted rest state
const FILL = 0.94;

let core = null;

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

  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 2),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
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

function fitCamera(cam, aspect) {
  cam.aspect = aspect;
  // projected extent of the sheet at the target plane
  const projW = 1.08;
  const projH = 1.35 * Math.cos(PITCH);
  const visH =
    aspect >= projW / projH ? projH / FILL : projW / projH / FILL / aspect;
  const d = visH / (2 * Math.tan((CARD_FOV / 2) * (Math.PI / 180)));
  cam.position.set(0, 0.05 + d * Math.sin(PITCH), d * Math.cos(PITCH));
  cam.lookAt(0, 0.05, 0);
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
    const animatingP = view.p !== prevP;

    const prevTx = view.tiltX;
    const prevTy = view.tiltY;
    view.tiltX += (view.targetTiltX - view.tiltX) * (1 - Math.exp(-9 * dt));
    view.tiltY += (view.targetTiltY - view.tiltY) * (1 - Math.exp(-9 * dt));
    const animatingT = view.tiltX !== prevTx || view.tiltY !== prevTy;

    if (animatingP) {
      const frame = view.p * maxFrame;
      if (Math.abs(frame - view.lastFrame) > 0.003) {
        writeFrame(view, animData, frame);
      }
      if (view.onProgress) view.onProgress(view.p);
    }
    if (animatingT) {
      view.mesh.rotation.x = view.tiltX;
      view.mesh.rotation.y = view.tiltY;
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
    if (Math.abs(aspect - view.camera.aspect) > 0.01) {
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

  const scene = new THREE.Scene();
  // Warm, balanced paper ambiance
  scene.add(new THREE.AmbientLight(0xfff8ee, 0.72));

  // Key directional light creating soft shadows on paper folds
  const dir = new THREE.DirectionalLight(0xffffff, 0.82);
  dir.position.set(1.5, 3.2, 2.2);
  scene.add(dir);

  // Soft fill light from bottom-left for realistic bounce
  const fill = new THREE.DirectionalLight(0x90b0e0, 0.22);
  fill.position.set(-2, -1, 1);
  scene.add(fill);

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
    rate: 6.5,
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
        // Slight natural creasing on click/press
        view.targetP = 0.15;
        view.rate = 12;
      } else if (hover) {
        // Subtle paper surface wrinkle (keeps all text and graphics 100% readable)
        view.targetP = 0.08;
        view.rate = 7.5;
      } else if (focused) {
        view.targetP = 0.05;
        view.rate = 7;
      } else {
        // Return smoothly to flat sheet
        view.targetP = REST_P;
        view.rate = 6;
      }
    },
    setTilt(nx, ny) {
      if (disposed) return;
      // Controlled tilt angle in range [-0.12, 0.12] radians (~7 degrees)
      view.targetTiltY = nx * 0.22;
      view.targetTiltX = ny * 0.16;
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
