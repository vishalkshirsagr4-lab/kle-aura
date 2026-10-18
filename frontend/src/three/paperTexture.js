import * as THREE from "three";

/* Per-event paper poster designs drawn to a canvas.
   One texture + material is cached per event id and shared by the mesh.
   Correct UV mapping: flip vertically (repeat 1, -1 around center 0.5, 0.5)
   without rotation so that text and icons read correctly left-to-right and right-side up. */

const TEX_W = 512;
const TEX_H = 716; // 1 : 1.4 ratio, matches the flat Houdini VAT paper sheet
const INK = "#0f172a";
const PAPER = "#f9f8f4";
const CELL = 36;

const GROUP_INK = {
  Stage: "#6d28d9",
  "Art & Craft": "#7c3aed",
  Writing: "#1d4ed8",
  "Quiz & Logic": "#3b82f6",
  "AI & Digital": "#0891b2",
};
export { GROUP_INK };

const cache = new Map(); // id -> { canvas, ctx, texture, material, design }
let fontsHooked = false;

function hexToRgba(hex, a) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* Draw a Lucide icon node onto the canvas */
function drawIconNode(ctx, iconNode, x, y, size, color) {
  if (!iconNode || !Array.isArray(iconNode)) return;
  const s = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = "none";
  ctx.lineWidth = 2.2;
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
  ctx.font = `800 ${size}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && size > 32) {
    size -= 2;
    ctx.font = `800 ${size}px ${font}`;
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
  size = Math.min(size, 46);
  ctx.font = `800 ${size}px ${font}`;
  ctx.fillText(best.line1, x, y - size * 0.58);
  ctx.fillText(best.line2, x, y + size * 0.58);
}

function paintStatic(state) {
  const { ctx, design } = state;
  const { number, title, iconNode, group, type, chips, proposed } = design;
  const ink = GROUP_INK[group] || "#4f46e5";
  const sans = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Base paper color
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle clean paper grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
  ctx.lineWidth = 1;
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

  // Outer framed border
  ctx.strokeStyle = "rgba(15, 23, 42, 0.12)";
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, TEX_W - 28, TEX_H - 28);

  ctx.strokeStyle = hexToRgba(ink, 0.4);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, TEX_W - 40, TEX_H - 40);

  // Top header strip: Category Badge on left, Event # on right
  const groupLabel = (group || "").toUpperCase();
  ctx.font = `700 18px ${sans}`;
  const labelW = ctx.measureText(groupLabel).width + 24;

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(32, 34, labelW, 30, 8)
    : ctx.rect(32, 34, labelW, 30);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(groupLabel, 44, 49);

  // Event Number (top right)
  const numStr = `#${String(number).padStart(2, "0")}`;
  ctx.font = `900 28px ${sans}`;
  ctx.textAlign = "right";
  ctx.fillStyle = ink;
  ctx.fillText(numStr, TEX_W - 34, 49);

  // Proposed stamp
  if (proposed) {
    ctx.font = `800 14px ${sans}`;
    const pw = ctx.measureText("PROPOSED").width + 18;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(TEX_W - 34 - pw, 74, pw, 24, 6)
      : ctx.rect(TEX_W - 34 - pw, 74, pw, 24);
    ctx.fill();
    ctx.fillStyle = "#78350f";
    ctx.textAlign = "center";
    ctx.fillText("PROPOSED", TEX_W - 34 - pw / 2, 86);
  }

  // Large centered icon medallion
  const iconCx = TEX_W / 2;
  const iconCy = 230;
  const radius = 86;

  // Medallion glow
  const medGrad = ctx.createRadialGradient(iconCx, iconCy, 20, iconCx, iconCy, radius);
  medGrad.addColorStop(0, hexToRgba(ink, 0.16));
  medGrad.addColorStop(1, hexToRgba(ink, 0.04));
  ctx.fillStyle = medGrad;
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Medallion ring
  ctx.strokeStyle = hexToRgba(ink, 0.6);
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw the Lucide icon inside medallion
  drawIconNode(ctx, iconNode, iconCx - 54, iconCy - 54, 108, ink);

  // Event title (prominent and readable)
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  drawWrapped(ctx, title, TEX_W / 2, 400, TEX_W - 70, 42, sans);

  // Type subtitle
  ctx.fillStyle = hexToRgba(ink, 0.95);
  ctx.font = `700 20px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText(type || "", TEX_W / 2, 490);

  // Chips pill (specs)
  if (chips && chips.length) {
    const text = chips.slice(0, 3).join("  •  ");
    ctx.font = `600 16px ${sans}`;
    const textW = Math.min(ctx.measureText(text).width + 32, TEX_W - 80);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(TEX_W / 2 - textW / 2, 526, textW, 34, 17)
      : ctx.rect(TEX_W / 2 - textW / 2, 526, textW, 34);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.textBaseline = "middle";
    ctx.fillText(text, TEX_W / 2, 543);
  }

  // Footer bar: Festival info
  ctx.strokeStyle = "rgba(15, 23, 42, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(34, TEX_H - 56);
  ctx.lineTo(TEX_W - 34, TEX_H - 56);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = `700 15px ${sans}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("AI-AURA 2K26", 36, TEX_H - 36);

  ctx.textAlign = "right";
  ctx.fillText("KLE BCA & BBA", TEX_W - 36, TEX_H - 36);

  // Soft edge depth gradient (subtle paper crease shading)
  const vignette = ctx.createRadialGradient(
    TEX_W / 2, TEX_H / 2, TEX_H * 0.36,
    TEX_W / 2, TEX_H / 2, TEX_H * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(30, 20, 10, 0.08)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

function hookFontReload() {
  if (fontsHooked || !document.fonts) return;
  fontsHooked = true;
  document.fonts.ready.then(() => {
    for (const state of cache.values()) {
      paintStatic(state);
      state.texture.needsUpdate = true;
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
  const ctx = canvas.getContext("2d");
  const design = {
    number: event.id,
    title: event.name,
    iconNode: event.icon?.iconNode,
    group: rule?.group,
    type: rule?.type,
    chips: rule?.chips,
    proposed: !!rule?.proposed,
  };
  const state = { canvas, ctx, design };
  paintStatic(state);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  // Match the Houdini UV orientation:
  // In the FBX mesh, minZ (top of camera view) has V=0, maxZ (bottom) has V=1.
  // Standard CanvasTexture has V=1 at the top of the canvas.
  // By setting repeat(1, -1) and center(0.5, 0.5) WITHOUT ANY ROTATION,
  // the V coordinate is inverted (V -> 1 - V) so canvas top maps to mesh top,
  // and the U coordinate is preserved (U -> U) so text is NOT mirrored.
  texture.center.set(0.5, 0.5);
  texture.repeat.set(1, -1);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });

  state.texture = texture;
  state.material = material;
  cache.set(event.id, state);
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
