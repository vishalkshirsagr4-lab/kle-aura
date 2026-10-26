import * as THREE from "three";

/* High-DPI Per-event paper poster designs drawn to a canvas (1024 x 1448 px).
   Crisp vector typography, authentic photography cover, and cardstock texture.
   Mipmapping and anisotropic filtering ensure pin-sharp clarity on all displays.
   UV orientation: repeat(1, -1) around center(0.5, 0.5) with no rotation. */

const TEX_W = 1024;
const TEX_H = 1448; // Exact 1 : 1.414 paper aspect ratio (ISO 216 proportion)
const INK = "#0f172a";
const PAPER = "#faf9f6";
const CELL = 64;

const GROUP_INK = {
  Stage: "#6d28d9",
  "Art & Craft": "#7c3aed",
  Writing: "#1d4ed8",
  "Quiz & Logic": "#2563eb",
  "AI & Digital": "#0891b2",
};
export { GROUP_INK };

const cache = new Map(); // id -> { canvas, ctx, texture, material, design, loadedImage }
let fontsHooked = false;
let maxAnisotropy = 8;

export function setTextureAnisotropy(val) {
  maxAnisotropy = Math.max(1, Math.min(val || 8, 16));
  for (const state of cache.values()) {
    if (state.texture) {
      state.texture.anisotropy = maxAnisotropy;
      state.texture.needsUpdate = true;
    }
  }
}

function hexToRgba(hex, a) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* Draw a Lucide icon node onto the high-DPI canvas with crisp lines */
function drawIconNode(ctx, iconNode, x, y, size, color) {
  if (!iconNode || !Array.isArray(iconNode)) return;
  const s = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = "none";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [tag, attrs] of iconNode) {
    ctx.beginPath();
    if (tag === "path") {
      ctx.stroke(new Path2D(attrs.d));
      continue;
    }
    if (tag === "circle") {
      ctx.ellipse(attrs.cx, attrs.cy, attrs.r, attrs.r, 0, 0, Math.PI * 2);
    } else if (tag === "ellipse") {
      ctx.ellipse(attrs.cx, attrs.cy, attrs.rx, attrs.ry, 0, 0, Math.PI * 2);
    } else if (tag === "rect") {
      const r = Number(attrs.rx || 0);
      ctx.roundRect
        ? ctx.roundRect(attrs.x, attrs.y, attrs.width, attrs.height, r)
        : ctx.rect(attrs.x, attrs.y, attrs.width, attrs.height);
    } else if (tag === "line") {
      ctx.moveTo(attrs.x1, attrs.y1);
      ctx.lineTo(attrs.x2, attrs.y2);
    } else if (tag === "polyline" || tag === "polygon") {
      const pts = attrs.points.trim().split(/[\s,]+/).map(Number);
      for (let i = 0; i < pts.length; i += 2) {
        if (i === 0) ctx.moveTo(pts[i], pts[i + 1]);
        else ctx.lineTo(pts[i], pts[i + 1]);
      }
      if (tag === "polygon") ctx.closePath();
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawWrapped(ctx, text, x, y, maxWidth, baseSize, font) {
  let size = baseSize;
  ctx.font = `900 ${size}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && size > 38) {
    size -= 3;
    ctx.font = `900 ${size}px ${font}`;
  }
  const words = text.split(" ");
  if (ctx.measureText(text).width <= maxWidth || words.length < 2) {
    ctx.fillText(text, x, y);
    return;
  }
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const w = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width);
    if (!best || w < best.w) best = { line1, line2, w };
  }
  size = Math.min(size, 58);
  ctx.font = `900 ${size}px ${font}`;
  ctx.fillText(best.line1, x, y - size * 0.58);
  ctx.fillText(best.line2, x, y + size * 0.58);
}

// Draw image with object-fit: cover and optional rounded corners
function drawCoverImage(ctx, img, x, y, w, h, radius = 16) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sx, sy, sw, sh;
  if (imgRatio > targetRatio) {
    sh = img.naturalHeight;
    sw = sh * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);

  // Subtle gradient vignette for text legibility & photography polish
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "rgba(15, 23, 42, 0.15)");
  grad.addColorStop(0.65, "rgba(15, 23, 42, 0.05)");
  grad.addColorStop(1, "rgba(15, 23, 42, 0.65)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.restore();

  // Clean border around photo
  ctx.save();
  ctx.strokeStyle = "rgba(15, 23, 42, 0.16)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.stroke();
  ctx.restore();
}

function paintStatic(state, loadedImg = null) {
  const { ctx, design } = state;
  const { number, title, iconNode, group, type, chips, proposed, tagline } = design;
  const img = loadedImg || state.loadedImage;
  const ink = GROUP_INK[group] || "#4f46e5";
  const sans = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Base crisp ivory-white paper
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle clean paper cardstock grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.10)";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let x = CELL; x < TEX_W; x += CELL) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TEX_H);
  }
  for (let y = CELL; y < TEX_H; y += CELL) {
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_W, y);
  }
  ctx.stroke();

  // Subtle paper grain noise
  ctx.fillStyle = "rgba(0, 0, 0, 0.012)";
  for (let i = 0; i < 400; i++) {
    const rx = (i * 97) % TEX_W;
    const ry = (i * 137) % TEX_H;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Double framed outer borders
  ctx.strokeStyle = "rgba(15, 23, 42, 0.16)";
  ctx.lineWidth = 3.5;
  ctx.strokeRect(28, 28, TEX_W - 56, TEX_H - 56);

  ctx.strokeStyle = hexToRgba(ink, 0.5);
  ctx.lineWidth = 2.0;
  ctx.strokeRect(38, 38, TEX_W - 76, TEX_H - 76);

  // Corner registration marks
  const mLen = 14;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(48, 48 + mLen); ctx.lineTo(48, 48); ctx.lineTo(48 + mLen, 48);
  ctx.moveTo(TEX_W - 48 - mLen, 48); ctx.lineTo(TEX_W - 48, 48); ctx.lineTo(TEX_W - 48, 48 + mLen);
  ctx.moveTo(48, TEX_H - 48 - mLen); ctx.lineTo(48, TEX_H - 48); ctx.lineTo(48 + mLen, 48);
  ctx.moveTo(TEX_W - 48 - mLen, TEX_H - 48); ctx.lineTo(TEX_W - 48, TEX_H - 48); ctx.lineTo(TEX_W - 48, TEX_H - 48 - mLen);
  ctx.stroke();

  // Top header strip: Category Badge on left, Event # on right
  const groupLabel = (group || "").toUpperCase();
  ctx.font = `800 28px ${sans}`;
  const labelW = ctx.measureText(groupLabel).width + 36;

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(58, 58, labelW, 50, 12)
    : ctx.rect(58, 58, labelW, 50);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(groupLabel, 76, 83);

  // Event Number (top right)
  const numStr = `#${String(number).padStart(2, "0")}`;
  ctx.font = `900 48px ${sans}`;
  ctx.textAlign = "right";
  ctx.fillStyle = ink;
  ctx.fillText(numStr, TEX_W - 58, 83);

  // Proposed stamp if applicable
  if (proposed) {
    ctx.font = `800 22px ${sans}`;
    const pw = ctx.measureText("PROPOSED").width + 26;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(TEX_W - 58 - pw, 128, pw, 38, 10)
      : ctx.rect(TEX_W - 58 - pw, 128, pw, 38);
    ctx.fill();
    ctx.fillStyle = "#78350f";
    ctx.textAlign = "center";
    ctx.fillText("PROPOSED", TEX_W - 58 - pw / 2, 147);
  }

  // Cover image or fallback medallion
  const imgX = 58;
  const imgY = 126;
  const imgW = TEX_W - 116;
  const imgH = 560;

  if (img && img.complete && img.naturalWidth > 0) {
    drawCoverImage(ctx, img, imgX, imgY, imgW, imgH, 20);

    // Floating small icon badge inside image (bottom right)
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(imgX + imgW - 84, imgY + imgH - 84, 68, 68, 16)
      : ctx.rect(imgX + imgW - 84, imgY + imgH - 84, 68, 68);
    ctx.fill();
    ctx.strokeStyle = "rgba(15, 23, 42, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawIconNode(ctx, iconNode, imgX + imgW - 74, imgY + imgH - 74, 48, ink);
  } else {
    // Large centered icon medallion when image is not present
    const iconCx = TEX_W / 2;
    const iconCy = 400;
    const radius = 152;

    const medGrad = ctx.createRadialGradient(iconCx, iconCy, 30, iconCx, iconCy, radius);
    medGrad.addColorStop(0, hexToRgba(ink, 0.18));
    medGrad.addColorStop(1, hexToRgba(ink, 0.04));
    ctx.fillStyle = medGrad;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(ink, 0.75);
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    drawIconNode(ctx, iconNode, iconCx - 96, iconCy - 96, 192, ink);
  }

  // Event title (prominent, bold, 100% crisp)
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  drawWrapped(ctx, title, TEX_W / 2, 770, TEX_W - 120, 64, sans);

  // Type subtitle
  ctx.fillStyle = hexToRgba(ink, 0.95);
  ctx.font = `700 32px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText(type || "", TEX_W / 2, 915);

  // Specs pill
  if (chips && chips.length) {
    const text = chips.slice(0, 3).join("   •   ");
    ctx.font = `700 26px ${sans}`;
    const textW = Math.min(ctx.measureText(text).width + 56, TEX_W - 120);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.18)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(TEX_W / 2 - textW / 2, 975, textW, 58, 29)
      : ctx.rect(TEX_W / 2 - textW / 2, 975, textW, 58);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.textBaseline = "middle";
    ctx.fillText(text, TEX_W / 2, 1004);
  }

  // Tagline or quote
  if (tagline) {
    ctx.font = `italic 500 24px ${sans}`;
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`“${tagline}”`, TEX_W / 2, 1100);
  }

  // Footer bar: Festival info & verification stamps
  ctx.strokeStyle = "rgba(15, 23, 42, 0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(58, TEX_H - 110);
  ctx.lineTo(TEX_W - 58, TEX_H - 110);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = `800 26px ${sans}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("AI-AURA 2K26", 60, TEX_H - 70);

  ctx.textAlign = "right";
  ctx.fillText("KLE BCA & BBA", TEX_W - 60, TEX_H - 70);

  // Soft subtle paper edge shading
  const vignette = ctx.createRadialGradient(
    TEX_W / 2, TEX_H / 2, TEX_H * 0.38,
    TEX_W / 2, TEX_H / 2, TEX_H * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(30, 20, 10, 0.05)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

function hookFontReload() {
  if (fontsHooked || !document.fonts) return;
  fontsHooked = true;
  document.fonts.ready.then(() => {
    for (const state of cache.values()) {
      paintStatic(state);
      if (state.texture) state.texture.needsUpdate = true;
    }
  }).catch(() => {});
}

/** Cached { material } for one event; created lazily per event id. */
export function getPaperMaterial(event, rule) {
  const hit = cache.get(event.id);
  if (hit) return hit.material;

  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d", { alpha: false });
  const design = {
    number: event.id,
    title: event.name,
    image: event.image,
    tagline: event.tagline,
    iconNode: event.icon?.iconNode,
    group: rule?.group || event.group,
    type: rule?.type,
    chips: rule?.chips,
    proposed: !!rule?.proposed,
  };
  const state = { canvas, ctx, design, loadedImage: null };
  paintStatic(state);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Enable mipmapping and trilinear filtering to eliminate downscale blur and shimmering
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = maxAnisotropy;

  // Exact vertical flip without horizontal mirroring:
  texture.center.set(0.5, 0.5);
  texture.repeat.set(1, -1);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.75,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });

  state.texture = texture;
  state.material = material;
  cache.set(event.id, state);

  // Asynchronously load real photography and re-paint texture once ready
  if (design.image) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      state.loadedImage = img;
      paintStatic(state, img);
      if (state.texture) {
        state.texture.needsUpdate = true;
      }
    };
    img.src = design.image;
  }

  hookFontReload();
  return material;
}

export function disposePaperTextures() {
  for (const state of cache.values()) {
    state.texture?.dispose();
    state.material?.dispose();
  }
  cache.clear();
}
