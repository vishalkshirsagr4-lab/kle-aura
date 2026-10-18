import * as THREE from "three";

/* Per-event paper designs drawn to a canvas, in the spirit of the
   paper-crumple demo's PAPER_DESIGNS: grid paper, a big event number,
   the lucide icon in group ink, and the title in Caveat handwriting.
   One texture + material is cached per event id and shared by the mesh. */

const TEX_W = 512;
const TEX_H = 716; // 1 : 1.4, matches the flat VAT sheet
const INK = "#1d1d1b";
const PAPER = "#eceae2";
const CELL = 40;

const GROUP_INK = {
  Stage: "#5b2fd4",
  "Art & Craft": "#7c4dd6",
  Writing: "#1f56c9",
  "Quiz & Logic": "#3344cc",
  "AI & Digital": "#0b8fad",
};
export { GROUP_INK };

const cache = new Map(); // id -> { canvas, ctx, texture, material, draw }
let fontsHooked = false;

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* Draw a lucide iconNode (array of [tag, attrs] in a 24x24 viewBox)
   onto the canvas at (x, y) scaled to `size` px. */
function drawIconNode(ctx, iconNode, x, y, size, color) {
  if (!iconNode) return;
  const s = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = "none";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [tag, attrs] of iconNode) {
    ctx.beginPath();
    if (tag === "path") {
      // Path2D handles the lucide "d" strings directly
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
    } else {
      continue;
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawWrapped(ctx, text, x, y, maxWidth, baseSize, font) {
  let size = baseSize;
  ctx.font = `${size}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && size > 40) {
    size -= 3;
    ctx.font = `${size}px ${font}`;
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
  size = Math.min(size, 88);
  ctx.font = `${size}px ${font}`;
  ctx.fillText(best.line1, x, y - size * 0.55);
  ctx.fillText(best.line2, x, y + size * 0.55);
}

function paintStatic(state) {
  const { ctx, design } = state;
  const { number, title, iconNode, group, type, chips, proposed } = design;
  const ink = GROUP_INK[group] || "#4f7cff";
  const hand = '"Caveat", "Comic Sans MS", cursive';
  const sans = 'system-ui, "Segoe UI", Roboto, sans-serif';

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // grid paper
  ctx.strokeStyle = "rgba(130,150,135,0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = CELL / 2; x <= TEX_W; x += CELL) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TEX_H);
  }
  for (let y = CELL / 2; y <= TEX_H; y += CELL) {
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_W, y);
  }
  ctx.stroke();

  // faint tape strip along the top
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(0, 0, TEX_W, 34);
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.lineTo(TEX_W, 34);
  ctx.stroke();

  // big event number, top right
  ctx.fillStyle = hexToRgba(ink, 0.14);
  ctx.font = `800 140px ${sans}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(String(number).padStart(2, "0"), TEX_W - 28, 48);

  // group label chip, top left
  ctx.textAlign = "left";
  ctx.fillStyle = hexToRgba(ink, 0.9);
  const label = (group || "").toUpperCase();
  ctx.font = `700 21px ${sans}`;
  const labelW = ctx.measureText(label).width + 28;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(28, 56, labelW, 34, 17)
    : ctx.rect(28, 56, labelW, 34);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 42, 74);

  // "proposed" stamp under the number
  if (proposed) {
    ctx.font = `800 19px ${sans}`;
    const pw = ctx.measureText("PROPOSED").width + 26;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(TEX_W - 28 - pw, 206, pw, 32, 16)
      : ctx.rect(TEX_W - 28 - pw, 206, pw, 32);
    ctx.fill();
    ctx.fillStyle = "#78350f";
    ctx.textAlign = "center";
    ctx.fillText("PROPOSED", TEX_W - 28 - pw / 2, 223);
    ctx.textAlign = "left";
  }

  // event icon in an ink medallion
  const iconCx = TEX_W / 2;
  const iconCy = 292;
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, 92, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(ink, 0.1);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(ink, 0.55);
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  drawIconNode(ctx, iconNode, iconCx - 62, iconCy - 62, 124, ink);

  // title in handwriting (wrapped to two lines when needed)
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  drawWrapped(ctx, title, 42, TEX_H - 232, TEX_W - 84, 88, hand);

  // type line
  ctx.fillStyle = hexToRgba(ink, 0.85);
  ctx.font = `600 24px ${sans}`;
  ctx.fillText(type || "", 44, TEX_H - 148);

  // chips pill (first two, single line, ellipsised)
  if (chips && chips.length) {
    let text = chips.slice(0, 2).join("  ·  ");
    ctx.font = `600 19px ${sans}`;
    const maxW = TEX_W - 88;
    while (ctx.measureText(text + "…").width > maxW && text.length > 4) {
      text = text.slice(0, -1);
    }
    const isEllipsised =
      chips.slice(0, 2).join("  ·  ").length > text.length;
    const shown = isEllipsised ? text.replace(/[\s·]+$/, "") + "…" : text;
    const cw = ctx.measureText(shown).width + 30;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.strokeStyle = hexToRgba(ink, 0.45);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(42, TEX_H - 128, cw, 36, 18)
      : ctx.rect(42, TEX_H - 128, cw, 36);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textBaseline = "middle";
    ctx.fillText(shown, 58, TEX_H - 109);
    ctx.textBaseline = "alphabetic";
  }

  // footer stamp
  ctx.fillStyle = "rgba(29,29,27,0.45)";
  ctx.font = `600 19px ${sans}`;
  ctx.fillText("AI-AURA 2K26", 44, TEX_H - 28);
  ctx.textAlign = "right";
  ctx.fillText("KLE BCA & BBA", TEX_W - 44, TEX_H - 28);

  // soft edge vignette for depth
  const g = ctx.createRadialGradient(
    TEX_W / 2, TEX_H / 2, TEX_H * 0.32,
    TEX_W / 2, TEX_H / 2, TEX_H * 0.72,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(60,55,40,0.14)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

function hookFontReload() {
  if (fontsHooked || !document.fonts) return;
  fontsHooked = true;
  document.fonts.load('700 96px "Caveat"').then(() => {
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
  // match the Houdini UV orientation (same fix as the source demo)
  texture.center.set(0.5, 0.5);
  texture.rotation = Math.PI;
  texture.repeat.set(1, -1);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
    // Cards are dimmed to 40% by the interest filter. The paper is painted by
    // the shared canvas, so the fade has to happen on the material itself.
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
