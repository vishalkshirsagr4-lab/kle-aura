import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

/* VAT (Vertex Animation Texture) decoder — adapted from
   item-develop/paper-crumple-demo (MIT), originally baked in Houdini:
   an FBX rest mesh (69x49 grid) + an EXR position texture with 50 frames
   of per-point displacement. Frame 0 is a flat sheet, the last frame a
   fully crumpled ball.

   Optimised here: the demo decodes the 20k-vertex triangle soup; we
   collapse it to its 3,500 unique points and build an indexed geometry,
   so decode speed and memory drop ~6x with identical visuals. */

const FRAME_COUNT = 50;
const MOTION_EPSILON = 1e-4;

export async function loadVATData(basePath) {
  const fbxLoader = new FBXLoader();
  const exrLoader = new EXRLoader();
  exrLoader.setDataType(THREE.FloatType);

  const [fbxGroup, posTex] = await Promise.all([
    fbxLoader.loadAsync(basePath + "geo/vertex_animation_textures1_mesh.fbx"),
    exrLoader.loadAsync(basePath + "tex/vertex_animation_textures1_pos.exr"),
  ]);

  let fbxMesh = null;
  fbxGroup.traverse((child) => {
    if (child.isMesh && !fbxMesh) fbxMesh = child;
  });
  if (!fbxMesh) throw new Error("No mesh found in paper VAT FBX");

  const geo = fbxMesh.geometry;
  const posAttr = geo.getAttribute("position");
  const uvAttr = geo.getAttribute("uv");
  const soupCount = posAttr.count;
  // FBXLoader stores the second UV set (Houdini UV2 = VAT lookup) as uv1
  const vatUvAttr = geo.getAttribute("uv2") || geo.getAttribute("uv1");

  const texW = posTex.image.width;
  const texH = posTex.image.height;
  const posData = posTex.image.data;
  const channels = posData.length / (texW * texH);

  // Map every soup vertex to its VAT point id ((0,0) UV = bbox dummy)
  const vertexPointIds = new Int32Array(soupCount);
  let pointCount = 0;
  for (let v = 0; v < soupCount; v++) {
    let pointId = 0;
    if (vatUvAttr) {
      const u = vatUvAttr.getX(v);
      const w = vatUvAttr.getY(v);
      if (!(u === 0 && w === 0)) {
        const col = Math.floor(u * texW);
        const row = Math.floor((1 - w) * texH);
        pointId = row * texW + col;
        if (pointId + 1 > pointCount) pointCount = pointId + 1;
      }
    } else {
      pointId = v;
      pointCount = soupCount;
    }
    vertexPointIds[v] = pointId;
  }

  // Rest position + design UV per point (any soup copy carries the same values)
  const pointRest = new Float32Array(pointCount * 3);
  const pointUv = new Float32Array(pointCount * 2);
  const pointFilled = new Uint8Array(pointCount);
  for (let v = 0; v < soupCount; v++) {
    const p = vertexPointIds[v];
    if (pointFilled[p]) continue;
    pointFilled[p] = 1;
    pointRest[p * 3] = posAttr.getX(v);
    pointRest[p * 3 + 1] = posAttr.getY(v);
    pointRest[p * 3 + 2] = posAttr.getZ(v);
    if (uvAttr) {
      pointUv[p * 2] = uvAttr.getX(v);
      pointUv[p * 2 + 1] = uvAttr.getY(v);
    }
  }

  // Indexed triangles on point ids (drops the bbox-dummy triangles)
  const indexArr = [];
  for (let i = 0; i + 2 < soupCount; i += 3) {
    const a = i;
    const b = i + 1;
    const c = i + 2;
    if (vatUvAttr) {
      const invalid = (v) =>
        vatUvAttr.getX(v) === 0 && vatUvAttr.getY(v) === 0;
      if (invalid(a) || invalid(b) || invalid(c)) continue;
    }
    indexArr.push(vertexPointIds[a], vertexPointIds[b], vertexPointIds[c]);
  }
  const indices =
    pointCount > 65535
      ? new Uint32Array(indexArr)
      : new Uint16Array(indexArr);

  const rowsPerFrame = Math.ceil(pointCount / texW);
  const totalRows = FRAME_COUNT * rowsPerFrame;

  // Decode all frames: rest position + displacement from the EXR.
  // three's EXRLoader flips scanlines vertically, so rows are read bottom-up;
  // the baked X displacement is mirrored (Unity/left-handed bake) -> subtract.
  const positions = new Float32Array(pointCount * 3 * FRAME_COUNT);
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const off = frame * pointCount * 3;
    for (let p = 0; p < pointCount; p++) {
      const col = p % texW;
      const blockRow = Math.floor(p / texW);
      const row = totalRows - 1 - (frame * rowsPerFrame + blockRow);
      const px = (row * texW + col) * channels;
      positions[off + p * 3] = pointRest[p * 3] - posData[px];
      positions[off + p * 3 + 1] = pointRest[p * 3 + 1] + posData[px + 1];
      positions[off + p * 3 + 2] = pointRest[p * 3 + 2] + posData[px + 2];
    }
  }

  // Trim leading/trailing frames that do not move (keeps playback snappy)
  const frameStride = pointCount * 3;
  let firstMoving = -1;
  let lastMoving = -1;
  for (let frame = 0; frame < FRAME_COUNT - 1; frame++) {
    const a = frame * frameStride;
    const b = (frame + 1) * frameStride;
    let maxDelta = 0;
    for (let i = 0; i < frameStride; i += 7) {
      const d = Math.abs(positions[a + i] - positions[b + i]);
      if (d > maxDelta) maxDelta = d;
    }
    if (maxDelta > MOTION_EPSILON) {
      if (firstMoving < 0) firstMoving = frame;
      lastMoving = frame;
    }
  }
  let frameCount = FRAME_COUNT;
  let frames = positions;
  if (firstMoving > 0 || lastMoving < FRAME_COUNT - 2) {
    if (firstMoving < 0) firstMoving = 0;
    frameCount = lastMoving + 2 - firstMoving;
    frames = positions.slice(
      firstMoving * frameStride,
      (firstMoving + frameCount) * frameStride,
    );
  }

  // Smooth per-point normals: face normals accumulated onto their shared
  // point, then distributed back (the mesh is a soup in the FBX, so plain
  // computeVertexNormals would shade every triangle flat).
  const normals = new Float32Array(pointCount * 3 * frameCount);
  const pn = new Float32Array(pointCount * 3);
  for (let frame = 0; frame < frameCount; frame++) {
    const src = frame * pointCount * 3;
    pn.fill(0);
    for (let i = 0; i < indices.length; i += 3) {
      const ia = indices[i] * 3;
      const ib = indices[i + 1] * 3;
      const ic = indices[i + 2] * 3;
      const ax = frames[src + ia];
      const ay = frames[src + ia + 1];
      const az = frames[src + ia + 2];
      const e1x = frames[src + ib] - ax;
      const e1y = frames[src + ib + 1] - ay;
      const e1z = frames[src + ib + 2] - az;
      const e2x = frames[src + ic] - ax;
      const e2y = frames[src + ic + 1] - ay;
      const e2z = frames[src + ic + 2] - az;
      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;
      const pa = indices[i] * 3;
      const pb = indices[i + 1] * 3;
      const pc = indices[i + 2] * 3;
      pn[pa] += nx; pn[pa + 1] += ny; pn[pa + 2] += nz;
      pn[pb] += nx; pn[pb + 1] += ny; pn[pb + 2] += nz;
      pn[pc] += nx; pn[pc + 1] += ny; pn[pc + 2] += nz;
    }
    for (let p = 0; p < pointCount; p++) {
      const o = p * 3;
      const len = Math.hypot(pn[o], pn[o + 1], pn[o + 2]);
      if (len > 1e-10) {
        normals[src + o] = pn[o] / len;
        normals[src + o + 1] = pn[o + 1] / len;
        normals[src + o + 2] = pn[o + 2] / len;
      } else {
        normals[src + o + 1] = 1;
      }
    }
  }

  // Flat-sheet size (frame 0) — used to fit each card's camera
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let p = 0; p < pointCount; p++) {
    const x = frames[p * 3];
    const z = frames[p * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  // Free the source textures/meshes immediately
  geo.dispose();
  posTex.dispose();
  fbxGroup.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      if (child.material) {
        (Array.isArray(child.material) ? child.material : [child.material]).forEach((m) => m.dispose());
      }
    }
  });

  return {
    pointCount,
    frameCount,
    indices,
    uvs: pointUv,
    positions: frames,
    normals,
    flat: { width: maxX - minX, depth: maxZ - minZ },
  };
}
