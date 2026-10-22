import * as THREE from "three";

/* Real 3D (WebGL) scenes for AI-AURA, built with three.js:
   - createHeroScene:   floating 3D shapes behind the hero title
   - createCampusScene: the college photo on a curved 3D panel you can drag */

const reducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function makeRenderer(canvas) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // keep pre-r155 light intensities (three 0.160 physical-lights default would dim them)
    renderer.useLegacyLights = true;
    return renderer;
  } catch (e) {
    return null; // no WebGL on this device
  }
}

function fit(renderer, camera, canvas) {
  const w = canvas.parentElement.clientWidth || 1;
  const h = canvas.parentElement.clientHeight || 1;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// Runs frame(t) every animation frame, but only while the canvas is on screen
function startLoop(canvas, frame) {
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);
  const tick = () => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (visible) frame(clock.getElapsedTime());
  };
  tick();
  return () => {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}

/* ---------------- Hero: floating 3D shapes ---------------- */
export function createHeroScene(canvas) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return null;

  const FOV = 50;
  const CAM_Z = 9;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const pink = new THREE.PointLight(0x36e4ff, 1.7, 40);
  pink.position.set(-6, 4, 6);
  const blue = new THREE.PointLight(0x7ab8ff, 1.5, 40);
  blue.position.set(6, -3, 5);
  scene.add(pink, blue);

  const geos = [
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.TorusGeometry(0.5, 0.18, 16, 40),
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.TetrahedronGeometry(0.7, 0),
  ];
  const colors = [0x9db4ff, 0x8b5cf6, 0x7df0ff, 0x7ad8ff, 0x9db4ff];

  const items = [];
  for (let i = 0; i < 18; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      metalness: 0.35,
      roughness: 0.25,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    const side = i % 2 ? 1 : -1;
    mesh.scale.setScalar(0.45 + Math.random() * 0.75);
    mesh.userData = {
      nx: side * (0.55 + Math.random() * 0.45), // fraction of the visible half-width (keeps the middle clear for text)
      z: -3 + Math.random() * 5,
      y0: (Math.random() - 0.5) * 6,
      rx: (Math.random() - 0.5) * 0.01 + 0.004,
      ry: (Math.random() - 0.5) * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    };
    scene.add(mesh);
    items.push(mesh);
  }

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x9db4ff, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.05, 16, 120), ringMat);
  ring.position.z = -3;
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7df0ff, transparent: true, opacity: 0.3 });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.03, 16, 140), ring2Mat);
  ring2.position.z = -4;
  scene.add(ring, ring2);

  const COUNT = 360;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = -6 + Math.random() * 10;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  const mouse = { x: 0, y: 0 };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove);

  const layout = () => {
    fit(renderer, camera, canvas);
    items.forEach((m) => {
      const u = m.userData;
      const halfW = Math.tan((FOV / 2) * (Math.PI / 180)) * (CAM_Z - u.z) * camera.aspect;
      m.position.set(u.nx * halfW, u.y0, u.z);
    });
  };
  window.addEventListener("resize", layout);

  const frame = (t) => {
    items.forEach((m) => {
      const u = m.userData;
      m.rotation.x += u.rx;
      m.rotation.y += u.ry;
      m.position.y = u.y0 + Math.sin(t * u.speed + u.phase) * 0.35;
    });
    ring.rotation.x = t * 0.15;
    ring.rotation.y = t * 0.1;
    ring2.rotation.x = -t * 0.08;
    ring2.rotation.z = t * 0.06;
    points.rotation.y = t * 0.02;
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };

  let stop;
  if (reducedMotion()) {
    // Static scene: draw once, and redraw on resize so the canvas never
    // keeps a stale (blank or stretched) frame after a layout change.
    const drawStatic = () => {
      layout();
      frame(0);
    };
    window.addEventListener("resize", drawStatic);
    drawStatic();
    stop = () => window.removeEventListener("resize", drawStatic);
  } else {
    layout();
    stop = startLoop(canvas, frame);
  }

  return () => {
    stop();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", layout);
    geos.forEach((g) => g.dispose());
    items.forEach((m) => m.material.dispose());
    [ring, ring2].forEach((m) => {
      m.geometry.dispose();
      m.material.dispose();
    });
    pGeo.dispose();
    pMat.dispose();
    renderer.dispose();
  };
}

/* ---------------- Campus: the photo as a curved 3D panel ---------------- */
function labelTexture(text) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 160;
  const g = c.getContext("2d");
  const r = 80;
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.moveTo(r, 0);
  g.lineTo(1024 - r, 0);
  g.arc(1024 - r, r, r, -Math.PI / 2, Math.PI / 2);
  g.lineTo(r, 160);
  g.arc(r, r, r, Math.PI / 2, Math.PI * 1.5);
  g.fill();
  g.fillStyle = "#4f7cff";
  g.font = "800 64px system-ui, 'Segoe UI', Roboto, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 512, 84);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCampusScene(canvas, photoUrl, onReady, label = "KLE BCA & BBA College") {
  const renderer = makeRenderer(canvas);
  if (!renderer) return null;

  const FOV = 38;
  const W = 5.2; // photo width in scene units
  const H = (W * 400) / 766; // keeps the photo's real shape (nothing is cropped)

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const pink = new THREE.PointLight(0x36e4ff, 1.5, 40);
  pink.position.set(-5, 3, 6);
  const blue = new THREE.PointLight(0x7ab8ff, 1.3, 40);
  blue.position.set(5, -2, 6);
  scene.add(pink, blue);

  const group = new THREE.Group();
  scene.add(group);

  // glass slab behind the photo
  const slabGeo = new THREE.BoxGeometry(W + 0.5, H + 0.5, 0.3);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x4f7cff, metalness: 0.6, roughness: 0.3 });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.z = -0.25;
  const edgesGeo = new THREE.EdgesGeometry(slabGeo);
  const edgesMat = new THREE.LineBasicMaterial({ color: 0x7df0ff });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  edges.position.z = -0.25;
  group.add(slab, edges);

  // the photo, bent into a gentle curve. MeshBasicMaterial = true colours, no lighting tint.
  const photoGeo = new THREE.PlaneGeometry(W, H, 48, 1);
  const p = photoGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const nx = p.getX(i) / (W / 2);
    p.setZ(i, nx * nx * 0.35);
  }
  p.needsUpdate = true;
  const tex = new THREE.TextureLoader().load(
    photoUrl,
    () => onReady && onReady(true),
    undefined,
    () => onReady && onReady(false)
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const photoMat = new THREE.MeshBasicMaterial({ map: tex });
  const photo = new THREE.Mesh(photoGeo, photoMat);
  group.add(photo);

  // floating name tag in front of the photo
  const labelTex = labelTexture(label);
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
  const labelGeo = new THREE.PlaneGeometry(3.4, (3.4 * 160) / 1024);
  const tag = new THREE.Mesh(labelGeo, labelMat);
  tag.position.set(-0.9, -H / 2 - 0.1, 1.15);
  group.add(tag);

  // floating shapes at different depths
  const defs = [
    [new THREE.OctahedronGeometry(0.28), 0x7df0ff, -3.1, 1.45, 0.9],
    [new THREE.IcosahedronGeometry(0.24), 0x7ad8ff, 3.2, 1.2, 1.1],
    [new THREE.BoxGeometry(0.32, 0.32, 0.32), 0x9db4ff, -3.3, -1.1, 0.7],
    [new THREE.TorusGeometry(0.24, 0.08, 12, 28), 0xffd9f6, 3.3, -1.2, 0.95],
    [new THREE.TetrahedronGeometry(0.3), 0x8b5cf6, 0.4, 1.9, 0.8],
  ];
  const shapes = defs.map(([geo, color, x, y, z], i) => {
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.25, flatShading: true })
    );
    mesh.position.set(x, y, z);
    mesh.userData = { y0: y, phase: i * 1.3 };
    group.add(mesh);
    return mesh;
  });

  // soft glow on the "floor"
  const glowGeo = new THREE.CircleGeometry(3.6, 48);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x9db4ff, transparent: true, opacity: 0.22 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -H / 2 - 0.55;
  scene.add(glow);

  // interaction: drag to rotate, gentle hover tilt, springs back, idle sway
  const view = { dragY: 0, dragX: 0, hoverY: 0, hoverX: 0 };
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const onDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = "grabbing";
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (dragging) {
      view.dragY = clamp(view.dragY + (e.clientX - lastX) * 0.008, -0.95, 0.95);
      view.dragX = clamp(view.dragX + (e.clientY - lastY) * 0.005, -0.45, 0.45);
      lastX = e.clientX;
      lastY = e.clientY;
    } else if (e.pointerType !== "touch") {
      const r = canvas.getBoundingClientRect();
      view.hoverY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      view.hoverX = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
    }
  };
  const onUp = () => {
    dragging = false;
    canvas.style.cursor = "grab";
  };
  const onLeave = () => {
    view.hoverY = 0;
    view.hoverX = 0;
  };
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onLeave);

  const layout = () => {
    fit(renderer, camera, canvas);
    // distance chosen so the panel fills ~70% of the width at any screen shape
    const visibleW = W * 1.45;
    camera.position.set(0, 0.15, visibleW / camera.aspect / (2 * Math.tan((FOV / 2) * (Math.PI / 180))));
  };
  window.addEventListener("resize", layout);
  layout();

  const frame = (t) => {
    if (!dragging) {
      view.dragY += (0 - view.dragY) * 0.02;
      view.dragX += (0 - view.dragX) * 0.02;
    }
    const sway = reducedMotion() ? 0 : Math.sin(t * 0.6) * 0.16;
    const ty = view.dragY + view.hoverY + sway - 0.12;
    const tx = view.dragX + view.hoverX + 0.06;
    group.rotation.y += (ty - group.rotation.y) * 0.08;
    group.rotation.x += (tx - group.rotation.x) * 0.08;
    shapes.forEach((m, i) => {
      m.rotation.x += 0.01 + i * 0.002;
      m.rotation.y += 0.012;
      m.position.y = m.userData.y0 + Math.sin(t * 0.9 + m.userData.phase) * 0.12;
    });
    tag.position.y = -H / 2 - 0.1 + Math.sin(t * 1.1) * 0.04;
    renderer.render(scene, camera);
  };

  const stop = startLoop(canvas, frame);

  return () => {
    stop();
    window.removeEventListener("resize", layout);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("pointerleave", onLeave);
    [slabGeo, edgesGeo, photoGeo, labelGeo, glowGeo].forEach((g) => g.dispose());
    [slabMat, edgesMat, photoMat, labelMat, glowMat].forEach((m) => m.dispose());
    shapes.forEach((m) => {
      m.geometry.dispose();
      m.material.dispose();
    });
    tex.dispose();
    labelTex.dispose();
    renderer.dispose();
  };
}
