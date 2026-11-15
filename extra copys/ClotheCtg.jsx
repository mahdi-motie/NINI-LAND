import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./ClotheCtg.css"
/* ============================================================
   ClothingRack3D  -  npm i three
   Rack stands at ~47 degrees. Click a piece: it flies in an arc to the podium,
   a "Go To The Collection's" button grows out beneath it.
   (Restored: version before the cloth-physics / lighting rewrite.)
   ============================================================ */

var ITEMS = [
  { id: "tee", label: "تیشرت", href: "/collections/t-shirts" },
  { id: "jeans", label: "شلوار", href: "/collections/jeans" },
  { id: "shoes", label: "کفش ها", href: "/collections/shoes" },
];
var ACCENT = "#c8402f";
var STAGE_X = 3.9;
var RACK_X = -3.3;
var RACK_ROT = 0.82;
var REV = parseInt(THREE.REVISION, 10);
var LEGACY_LIGHT = REV < 155;
var sheenProps = (c) =>
  REV < 133
    ? { sheen: new THREE.Color(c) }
    : { sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(c) };
var markSRGB = (t) => {
  if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
};
var sm = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
var v3 = (a) => new THREE.Vector3(...a);
var canvasTex = (draw, rep, srgb) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  draw(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = 8;
  if (srgb) markSRGB(t);
  return t;
};
var weaveBump = (g) => {
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) {
    g.fillStyle = "#c4c4c4";
    g.fillRect(i, 0, 2, 128);
    g.fillStyle = "#4a4a4a";
    g.fillRect(0, i + 2, 128, 2);
  }
};
var ribBump = (g) => {
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 8) {
    g.fillStyle = "#d0d0d0";
    g.fillRect(i, 0, 4, 128);
  }
};
var denimMap = (g) => {
  g.fillStyle = "#4b6b9b";
  g.fillRect(0, 0, 128, 128);
  for (let i = -128; i < 256; i += 4) {
    g.strokeStyle = i % 8 ? "rgba(255,255,255,.09)" : "rgba(0,0,40,.12)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
  }
  for (let i = 0; i < 1200; i++) {
    g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,40"},.07)`;
    g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
  }
};
var twillBump = (g) => {
  g.fillStyle = "#777";
  g.fillRect(0, 0, 128, 128);
  g.lineWidth = 2;
  for (let i = -128; i < 256; i += 4) {
    g.strokeStyle = i % 8 ? "#aaa" : "#444";
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
  }
};
function radialTex(inner, outer) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d"),
    r = g.createRadialGradient(128, 110, 10, 128, 128, 128);
  r.addColorStop(0, inner);
  r.addColorStop(1, outer);
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  markSRGB(t);
  return t;
}
function refine(geo, maxEdge) {
  const p = geo.attributes.position;
  let tris = [];
  const V = (i) => [p.getX(i), p.getY(i), p.getZ(i)];
  for (let i = 0; i < p.count; i += 3) tris.push([V(i), V(i + 1), V(i + 2)]);
  const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const mid = (a, b) => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
    (a[2] + b[2]) / 2,
  ];
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    const out = [];
    for (const [a, b, c] of tris) {
      const s0 = len(a, b) > maxEdge,
        s1 = len(b, c) > maxEdge,
        s2 = len(c, a) > maxEdge;
      const n = (s0 ? 1 : 0) | (s1 ? 2 : 0) | (s2 ? 4 : 0);
      if (!n) {
        out.push([a, b, c]);
        continue;
      }
      changed = true;
      const m0 = s0 && mid(a, b),
        m1 = s1 && mid(b, c),
        m2 = s2 && mid(c, a);
      switch (n) {
        case 1:
          out.push([a, m0, c], [m0, b, c]);
          break;
        case 2:
          out.push([a, b, m1], [a, m1, c]);
          break;
        case 4:
          out.push([a, b, m2], [m2, b, c]);
          break;
        case 3:
          out.push([m0, b, m1], [a, m0, m1], [a, m1, c]);
          break;
        case 6:
          out.push([c, m2, m1], [a, b, m1], [a, m1, m2]);
          break;
        case 5:
          out.push([a, m0, m2], [m0, b, c], [m0, c, m2]);
          break;
        default:
          out.push([a, m0, m2], [m0, b, m1], [m2, m1, c], [m0, m1, m2]);
      }
    }
    tris = out;
    if (!changed) break;
  }
  return tris;
}
function puff(shape, o) {
  const {
    depth,
    bevel,
    edge = 0.07,
    R = 0.5,
    disp = () => 0,
    squeeze = () => 1,
    tint,
  } = o;
  const raw = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.7,
    bevelSegments: 4,
    curveSegments: 20,
  });
  const tris = refine(raw, edge);
  raw.dispose();
  const outline = shape.getSpacedPoints(240);
  const dist = (x, y) => {
    let m = 1e9;
    for (const q of outline) {
      const d = (q.x - x) ** 2 + (q.y - y) ** 2;
      if (d < m) m = d;
    }
    return Math.sqrt(m);
  };
  const mid = depth / 2,
    seen = /* @__PURE__ */ new Map(),
    P = [],
    C = [],
    idx = [];
  for (const t of tris)
    for (const [x, y, z] of t) {
      const key = `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
      let j = seen.get(key);
      if (j === undefined) {
        j = P.length / 3;
        seen.set(key, j);
        const s = z > mid ? 1 : -1,
          d = dist(x, y);
        P.push(
          x,
          y,
          mid + s * (Math.abs(z - mid) * squeeze(x, y) + disp(x, y, d)),
        );
        if (tint) {
          const k = tint(x, y);
          C.push(k, k, k);
        }
      }
      idx.push(j);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      P.filter((_, i) => i % 3 < 2),
      2,
    ),
  );
  if (tint) g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const at = (x, y, lift = 0.012, side = 1) =>
    new THREE.Vector3(
      x,
      y,
      mid +
        side *
          ((depth / 2 + bevel) * squeeze(x, y) + disp(x, y, dist(x, y)) + lift),
    );
  return { g, at };
}
var tube = (pts, r, mat) =>
  new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, r, 8),
    mat,
  );
var fabric = (color, sheen, bump, rep, scale = 2, extra = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.93,
    ...sheenProps(sheen),
    bumpMap: canvasTex(bump, rep),
    bumpScale: scale,
    ...extra,
  });
var chrome = new THREE.MeshStandardMaterial({
  color: "#c9ced4",
  metalness: 1,
  roughness: 0.22,
});
function buildHanger(arm, clips) {
  const g = new THREE.Group();
  g.add(
    tube(
      [
        [0, -0.45, 0],
        [0, -0.3, 0],
        [0.1, -0.16, 0],
        [0, -0.04, 0],
        [-0.09, -0.12, 0],
      ].map(v3),
      0.03,
      chrome,
    ),
  );
  g.add(
    tube(
      [
        [-arm, -0.95, 0],
        [-arm / 2, -0.7, 0],
        [0, -0.45, 0],
        [arm / 2, -0.7, 0],
        [arm, -0.95, 0],
      ].map(v3),
      0.03,
      chrome,
    ),
  );
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, arm * 2, 12),
    chrome,
  );
  bar.rotation.z = Math.PI / 2;
  bar.position.y = -0.95;
  g.add(bar);
  if (clips)
    [-0.55, 0.55].forEach((x) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.3), chrome);
      c.position.set(x, -1.02, 0.06);
      g.add(c);
    });
  return g;
}
function buildTee() {
  const grp = new THREE.Group();
  grp.add(buildHanger(1.15));
  const s = new THREE.Shape();
  s.moveTo(-0.38, 1.05);
  [
    [-0.98, 0.86],
    [-1.55, 0.38],
    [-1.28, 0],
    [-0.84, 0.24],
    [-0.86, -1.1],
    [0.86, -1.1],
    [0.84, 0.24],
    [1.28, 0],
    [1.55, 0.38],
    [0.98, 0.86],
    [0.38, 1.05],
  ].forEach(([x, y]) => s.lineTo(x, y));
  s.quadraticCurveTo(0, 0.6, -0.38, 1.05);
  const disp = (x, y, d) => {
    const body = 0.3 * sm(0, 0.62, d) * (0.85 + 0.15 * Math.cos(x * 1.3));
    const amp = 0.012 + 0.032 * sm(0.7, -0.7, y);
    const folds =
      amp * Math.sin(x * 7 + 1.6 * Math.sin(y * 2.2 + x)) * sm(0, 0.25, d);
    const droop =
      0.03 *
      Math.exp(-Math.pow(Math.abs(x) - 0.84, 2) / 0.03) *
      sm(0.3, -0.2, y);
    return body + folds + droop;
  };
  const { g, at } = puff(s, { depth: 0.03, bevel: 0.05, R: 0.6, disp });
  const mat = fabric("#b8322a", "#e8857b", weaveBump, 11, 0.3);
  const shirt = new THREE.Group();
  shirt.add(new THREE.Mesh(g, mat));
  const thread = new THREE.MeshStandardMaterial({
    color: "#8f231d",
    roughness: 0.9,
  });
  const seam = (pts, r = 9e-3) =>
    shirt.add(
      tube(
        pts.map(([x, y]) => at(x, y, 6e-3)),
        r,
        thread,
      ),
    );
  seam([
    [-0.8, -1],
    [0, -1],
    [0.8, -1],
  ]);
  seam([
    [-0.8, -1.04],
    [0, -1.04],
    [0.8, -1.04],
  ]);
  [-1, 1].forEach((k) => {
    seam(
      [
        [1.44 * k, 0.36],
        [1.2 * k, 0.04],
      ].map(([x, y]) => [x - 0.04 * k, y + 0]),
    );
    seam([
      [0.4 * k, 0.99],
      [0.98 * k, 0.8],
    ]);
    seam(
      [
        [0.84 * k, 0.2],
        [0.84 * k, -0.6],
        [0.83 * k, -1],
      ].map(([x, y]) => [x - 0.04 * k, y]),
    );
  });
  const neck = [...Array(15)].map((_, i) => {
    const t = i / 14,
      u = 1 - t;
    return at(
      u * u * -0.38 + t * t * 0.38,
      u * u * 1.05 + 2 * u * t * 0.6 + t * t * 1.05 - 0.035,
      0.02,
    );
  });
  shirt.add(tube(neck, 0.06, fabric("#a32a23", "#e07a70", ribBump, 14, 0.5)));
  shirt.position.y = -1.72;
  grp.add(shirt);
  return grp;
}
function buildJeans() {
  const grp = new THREE.Group();
  grp.add(buildHanger(0.95, true));
  const s = new THREE.Shape();
  s.moveTo(-0.6, 1.1);
  [
    [0.6, 1.1],
    [0.7, 0.3],
    [0.66, -2.7],
    [0.14, -2.7],
    [0, -0.12],
    [-0.14, -2.7],
    [-0.66, -2.7],
    [-0.7, 0.3],
  ].forEach(([x, y]) => s.lineTo(x, y));
  const disp = (x, y, d) => {
    const leg = 0.17 * sm(0, 0.3, d);
    const knee =
      0.017 * Math.sin(y * 18 + x * 3) * sm(-0.8, -1.1, y) * sm(-1.9, -1.5, y);
    const stack = 0.016 * Math.sin(y * 30) * sm(-2.35, -2.7, y);
    const thigh = 0.02 * Math.sin(x * 9 + y * 4) * sm(0.5, -0.4, y);
    return leg + knee + stack + thigh;
  };
  const tint = (x, y) =>
    y > 0.92 ? 0.84 : 0.8 + 0.2 * sm(-2.7, -0.3, y) - 0.05 * sm(0.9, 0.3, y);
  const { g, at } = puff(s, {
    depth: 0.05,
    bevel: 0.05,
    R: 0.35,
    disp,
    tint,
    edge: 0.08,
  });
  const mat = new THREE.MeshPhysicalMaterial({
    map: canvasTex(denimMap, 8, true),
    bumpMap: canvasTex(twillBump, 8),
    bumpScale: 1,
    vertexColors: true,
    roughness: 0.88,
    ...sheenProps("#7d9bc8"),
  });
  const pants = new THREE.Group();
  pants.add(new THREE.Mesh(g, mat));
  const thread = new THREE.MeshStandardMaterial({
    color: "#d9a94e",
    roughness: 0.55,
  });
  const stitch = (pts) =>
    pants.add(
      tube(
        pts.map(([x, y]) => at(x, y, 8e-3)),
        0.011,
        thread,
      ),
    );
  stitch([
    [-0.58, 0.9],
    [0, 0.9],
    [0.58, 0.9],
  ]);
  stitch([
    [-0.58, 1.04],
    [0, 1.04],
    [0.58, 1.04],
  ]);
  stitch([
    [0.04, 0.88],
    [0.04, 0.45],
    [0.02, 0.2],
    [-0.08, 0.08],
  ]);
  [-1, 1].forEach((k) => {
    stitch([
      [0.58 * k, 0.86],
      [0.55 * k, 0.5],
      [0.26 * k, 0.6],
    ]);
    stitch([
      [0.6 * k, -2.55],
      [0.38 * k, -2.55],
      [0.2 * k, -2.55],
    ]);
    stitch([
      [0.66 * k, 0.28],
      [0.62 * k, -1.2],
      [0.6 * k, -2.55],
    ]);
    [0.28, 0.5].forEach((x) => {
      const loop = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.03), mat);
      loop.position.copy(at(x * k, 0.98, 0));
      pants.add(loop);
    });
  });
  const btn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      metalness: 1,
      roughness: 0.3,
    }),
  );
  btn.rotation.x = Math.PI / 2;
  btn.position.copy(at(0, 0.97, 0.02));
  pants.add(btn);
  pants.position.y = -2;
  grp.add(pants);
  return grp;
}
function buildShoes() {
  const grp = new THREE.Group();
  const toe = (x) => 1 - 0.28 * sm(0.2, 1.7, x);
  const toeSole = (x) => 1 - 0.22 * sm(0.2, 1.9, x);
  const L = (x) => 0.16 * Math.pow(sm(0.7, 1.9, x), 1.6); // toe spring: the front of the shoe curves up

  // upper: low top, tall rounded toe box
  const up = new THREE.Shape();
  up.moveTo(-1.5, 0.05);
  up.lineTo(-1.56, 0.62);
  up.quadraticCurveTo(-1.56, 0.95, -1.25, 0.97);
  up.quadraticCurveTo(-0.95, 0.97, -0.78, 0.84);
  up.quadraticCurveTo(-0.7, 1.0, -0.5, 1.2);
  up.quadraticCurveTo(0.0, 1.0, 0.35, 0.82);
  up.quadraticCurveTo(0.7, 0.74, 1.1, 0.72 + L(1.1));
  up.quadraticCurveTo(1.6, 0.7 + L(1.6), 1.72, 0.35 + L(1.72));
  up.quadraticCurveTo(1.78, 0.12 + L(1.76), 1.7, 0.05 + L(1.7));
  for (let x = 1.5; x > -1.5; x -= 0.25) up.lineTo(x, 0.05 + L(x));
  up.lineTo(-1.5, 0.05);
  const upper = puff(up, {
    depth: 0.42,
    bevel: 0.12,
    R: 0.7,
    edge: 0.07,
    squeeze: (x, y) =>
      toe(x) * (1 - 0.26 * sm(0.4, 1.2, y)) * (1 + 0.2 * (1 - sm(0, 0.45, y))), // flares at the base so it sits flush on the sole
    disp: (x, y, d) => 0.15 * sm(0, 0.7, d) * toe(x),
  });

  const grain = (g) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 1400; i++) {
      const k = (90 + Math.random() * 90) | 0;
      g.fillStyle = `rgb(${k},${k},${k})`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
  };
  const leather = new THREE.MeshPhysicalMaterial({
    color: "#f7f7f5",
    roughness: 0.42,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    bumpMap: canvasTex(grain, 7),
    bumpScale: 0.25,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: "#e8e8e4",
    roughness: 0.55,
  });
  const top = new THREE.Group();
  top.position.y = 0.08;
  top.scale.y = 1.25;
  grp.add(top);
  top.add(new THREE.Mesh(upper.g, leather));

  // cupsole: midsole follows the same toe spring, narrower so the upper sits flush on it
  const ms = new THREE.Shape();
  ms.moveTo(-1.6, -0.22);
  for (let x = -1.3; x <= 1.7; x += 0.3) ms.lineTo(x, -0.22 + L(x));
  ms.quadraticCurveTo(1.92, -0.2 + L(1.92), 1.9, -0.02 + L(1.9));
  ms.quadraticCurveTo(1.88, 0.14 + L(1.88), 1.7, 0.16 + L(1.7));
  for (let x = 1.4; x >= -1.4; x -= 0.3) ms.lineTo(x, 0.16 + L(x));
  ms.lineTo(-1.5, 0.16);
  ms.quadraticCurveTo(-1.72, 0.14, -1.7, -0.04);
  ms.quadraticCurveTo(-1.7, -0.2, -1.6, -0.22);
  const mid = puff(ms, {
    depth: 0.66,
    bevel: 0.09,
    R: 0.25,
    edge: 0.09,
    squeeze: toeSole,
    disp: (x, y, d) => 0.03 * sm(0, 0.25, d),
  });
  grp.add(new THREE.Mesh(mid.g, rubber));
  const os = new THREE.Shape();
  os.moveTo(-1.6, -0.3);
  for (let x = -1.3; x <= 1.8; x += 0.3) os.lineTo(x, -0.3 + L(x));
  os.lineTo(1.9, -0.22 + L(1.9));
  for (let x = 1.6; x >= -1.6; x -= 0.3) os.lineTo(x, -0.22 + L(x));
  os.lineTo(-1.68, -0.22);
  grp.add(
    new THREE.Mesh(
      puff(os, {
        depth: 0.58,
        bevel: 0.05,
        R: 0.1,
        edge: 0.12,
        squeeze: toeSole,
      }).g,
      new THREE.MeshStandardMaterial({ color: "#c9c9c5", roughness: 0.9 }),
    ),
  );

  const grey = new THREE.MeshStandardMaterial({
    color: "#c4c4c0",
    roughness: 0.7,
  });
  [1, -1].forEach((side) => {
    grp.add(
      tube(
        [-1.45, -0.6, 0.3, 1.0, 1.6].map((x) =>
          mid.at(x, -0.04 + L(x), 0.008, side),
        ),
        0.012,
        grey,
      ),
    ); // midsole groove
    grp.add(
      tube(
        [-1.4, -0.6, 0.3, 1.0, 1.55].map((x) =>
          mid.at(x, 0.11 + L(x), 0.006, side),
        ),
        0.009,
        grey,
      ),
    ); // midsole stitch
    const seam = (pts, r = 0.012, m = grey) =>
      top.add(
        tube(
          pts.map(([x, y]) => upper.at(x, y + L(x), 0.008, side)),
          r,
          m,
        ),
      );
    seam([
      [0.92, 0.12],
      [0.86, 0.4],
      [0.94, 0.66],
    ]); // toe cap seam
    seam([
      [-0.95, 0.1],
      [-1.12, 0.5],
      [-1.28, 0.88],
    ]); // heel counter seam
    seam(
      [
        [-1.05, 0.2],
        [-0.4, 0.34],
        [0.25, 0.48],
        [0.75, 0.6],
      ],
      0.03,
      new THREE.MeshStandardMaterial({ color: "#ecece8", roughness: 0.45 }),
    );
    for (let ix = 0; ix < 5; ix++)
      for (let iy = 0; iy < 4; iy++) {
        // toe perforations
        const x = 1.08 + ix * 0.11,
          y = 0.26 + iy * 0.11 + (ix % 2) * 0.055;
        if (y > 0.62 - 0.5 * sm(1.35, 1.7, x)) continue;
        const dot = new THREE.Mesh(
          new THREE.CircleGeometry(0.017, 10),
          new THREE.MeshBasicMaterial({ color: "#8d8d89" }),
        );
        dot.position.copy(upper.at(x, y + L(x), 0.006, side));
        if (side < 0) dot.rotation.y = Math.PI;
        top.add(dot);
      }
  });

  // lacing: a padded lace panel follows the vamp, laces lie on it, strands run down to the eyelets
  const B = (t) => {
    const u = 1 - t;
    return [
      u * u * -0.5 + t * t * 0.35,
      u * u * 1.2 + 2 * u * t * 1.0 + t * t * 0.82,
    ];
  };
  const panelPts = [];
  for (let k = 0; k <= 12; k++) {
    const [x, y] = B(-0.06 + k * 0.09);
    panelPts.push(new THREE.Vector3(x, y, 0));
  }
  const panel = tube(panelPts, 0.12, leather);
  panel.scale.z = 2.2;
  top.add(panel);
  const red = new THREE.MeshStandardMaterial({
    color: "#e02a2f",
    roughness: 0.6,
  });
  const ring = new THREE.MeshStandardMaterial({
    color: "#e6e6e2",
    metalness: 0.3,
    roughness: 0.4,
  });
  const LACE_UP = 0.145;
  for (let i = 0; i < 6; i++) {
    const t = 0.16 + i * 0.14,
      [x, y] = B(t),
      [x2, y2] = B(t + 0.02),
      [x1, y1] = B(t - 0.02);
    const lace = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.5), red);
    lace.position.set(x, y + LACE_UP, 0);
    lace.rotation.z = Math.atan2(y2 - y1, x2 - x1);
    top.add(lace);
    [1, -1].forEach((side) => {
      const e = new THREE.Mesh(
        new THREE.TorusGeometry(0.03, 0.012, 8, 14),
        ring,
      );
      e.position.copy(upper.at(x, y - 0.1, 0.012, side));
      top.add(e);
      const xo = x + (i % 2 ? 0.08 : -0.08); // criss-cross
      top.add(
        tube(
          [
            new THREE.Vector3(x, y + LACE_UP - 0.02, 0.25 * side),
            upper.at(xo, y - 0.1, 0.02, side),
          ],
          0.02,
          red,
        ),
      );
    });
  }
  const [bx, by] = B(0.06);
  [1, -1].forEach((k) => {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.024, 8, 18),
      red,
    );
    loop.position.set(bx, by + LACE_UP + 0.07, 0.1 * k);
    loop.rotation.z = 0.5 * k + 0.5;
    top.add(loop);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.03), red);
    tail.position.set(bx + 0.02, by + LACE_UP - 0.1, 0.22 * k);
    tail.rotation.z = 0.2 * k;
    top.add(tail);
  });
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), leather);
  tongue.scale.set(0.26, 0.15, 0.3);
  tongue.position.set(-0.64, 1.2, 0);
  tongue.rotation.z = 0.6;
  top.add(tongue);

  const collar = new THREE.Group();
  const cring = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.065, 12, 32),
    leather,
  );
  cring.rotation.x = Math.PI / 2;
  cring.scale.set(1.45, 1, 1);
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 32),
    new THREE.MeshBasicMaterial({ color: "#0b0b0c" }),
  );
  hole.rotation.x = -Math.PI / 2;
  hole.scale.set(1.45, 1, 1);
  hole.position.y = -0.03;
  collar.add(cring, hole);
  collar.position.set(-1.1, 0.95, 0);
  collar.rotation.z = -0.3;
  top.add(collar);
  return grp;
}

function buildRack() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({
    color: "#1c2026",
    metalness: 0.85,
    roughness: 0.32,
  });
  const add = (geo, mat, x, y, z = 0, rz = 0, rx = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    g.add(m);
  };
  add(
    new THREE.CylinderGeometry(0.05, 0.05, 5.2, 24),
    metal,
    0,
    2.6,
    0,
    Math.PI / 2,
  );
  [-2.6, 2.6].forEach((x) => {
    add(new THREE.CylinderGeometry(0.05, 0.05, 5.15, 24), metal, x, 0.05);
    add(new THREE.SphereGeometry(0.09, 20, 20), metal, x, 2.68);
    add(
      new THREE.CylinderGeometry(0.045, 0.045, 1.7, 16),
      metal,
      x,
      -2.52,
      0,
      0,
      Math.PI / 2,
    );
    [-0.85, 0.85].forEach((z) => {
      add(new THREE.SphereGeometry(0.1, 16, 16), metal, x, -2.5, z);
      add(new THREE.SphereGeometry(0.07, 12, 12), chrome, x, -2.5, z);
    });
  });
  add(
    new THREE.BoxGeometry(5.2, 0.07, 1.2),
    new THREE.MeshStandardMaterial({ color: "#d4ccbf", roughness: 0.65 }),
    0,
    -2.12,
  );
  g.traverse((o) => o.isMesh && (o.castShadow = o.receiveShadow = true));
  return g;
}
function mergeStudio() {
  const s = new THREE.Scene();
  s.background = new THREE.Color("#4a4f56");
  [
    [10, 6, [0, 9, 0], 4],
    [6, 6, [-9, 3, 2], 2.5],
    [6, 6, [9, 3, 2], 2.5],
    [10, 5, [0, 3, -9], 1.5],
  ].forEach(([w, h, pos, k]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(k, k, k),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    s.add(m);
  });
  return s;
}
function ClothingRack3D({ onCollectionClick }) {
  const hintRef = useRef(null),
    wrap = useRef(null),
    ctaPos = useRef(null),
    api = useRef({});
  const [active, setActive] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = wrap.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
      });
    } catch {
      setFailed(true);
      return;
    }
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
      REV >= 180 ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    if (!THREE.SRGBColorSpace && THREE.sRGBEncoding)
      renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(mergeStudio(), 0.04).texture;
    scene.environmentIntensity = 0.7;
    scene.add(
      new THREE.HemisphereLight(16777215, 13620956, LEGACY_LIGHT ? 0.35 : 0.5),
    );
    const key = new THREE.DirectionalLight(16777215, LEGACY_LIGHT ? 0.9 : 2.2);
    key.position.set(5, 9, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -10,
      right: 10,
      top: 7,
      bottom: -7,
      near: 1,
      far: 28,
    });
    key.shadow.radius = 6;
    key.shadow.bias = -4e-4;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const rim = new THREE.DirectionalLight(14674175, LEGACY_LIGHT ? 0.5 : 1.2);
    rim.position.set(-7, 4, -6);
    scene.add(rim);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const world = new THREE.Group();
    scene.add(world);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 18),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.6;
    floor.receiveShadow = true;
    world.add(floor);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 96),
      new THREE.MeshBasicMaterial({
        map: radialTex("#ffffff", "#e9edef"),
        toneMapped: false,
      }),
    );
    disc.position.set(STAGE_X, 0.35, -1.6);
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.24, 128),
      new THREE.MeshBasicMaterial({ color: "#1d1f23", toneMapped: false }),
    );
    edge.position.copy(disc.position);
    edge.position.z += 0.01;
    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.5, 96),
      new THREE.MeshStandardMaterial({ color: "#f3f4f4", roughness: 0.5 }),
    );
    podium.position.set(STAGE_X, -2.35, 0);
    podium.castShadow = podium.receiveShadow = true;
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.025, 8, 96),
      new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false }),
    );
    glow.rotation.x = Math.PI / 2;
    glow.position.set(STAGE_X, -2.09, 0);
    const rack = buildRack();
    rack.position.set(RACK_X, 0, 0);
    rack.rotation.y = RACK_ROT;
    rack.updateMatrixWorld(true);
    world.add(disc, edge, podium, glow, rack);
    const defs = {
      tee: {
        build: buildTee,
        local: [-1.35, 2.6, 0],
        hang: true,
        dispH: 3,
        restS: 0.78,
      },
      jeans: {
        build: buildJeans,
        local: [1.3, 2.6, 0],
        hang: true,
        dispH: 3.3,
        restS: 0.72,
      },
      shoes: {
        build: buildShoes,
        local: [0, -2.12, 0.1],
        hang: false,
        dispW: 3.0,
        restS: 0.52,
      },
    };
    const Y = new THREE.Vector3(0, 1, 0);
    const stage = new THREE.Vector3(STAGE_X, 0.3, 0);
    const items = ITEMS.map(({ id }) => {
      const d = defs[id],
        content = d.build();
      content.traverse(
        (o) => o.isMesh && (o.castShadow = o.receiveShadow = true),
      );
      const box = new THREE.Box3().setFromObject(content);
      const C = box.getCenter(new THREE.Vector3()),
        size = box.getSize(new THREE.Vector3());
      const holder = new THREE.Group();
      holder.position.copy(C);
      content.position.copy(C).negate();
      holder.add(content);
      const pivot = new THREE.Group();
      pivot.rotation.order = "YXZ";
      pivot.add(holder);
      pivot.userData.id = id;
      world.add(pivot);
      const s0 = d.restS,
        s1 = d.hang ? d.dispH / size.y : d.dispW / size.x;
      const restPos = rack.localToWorld(v3(d.local));
      if (!d.hang) restPos.y += size.y * 0.5 * s0;
      const offset = (s, ry) =>
        C.clone().multiplyScalar(s).applyAxisAngle(Y, ry);
      if (!d.hang) restPos.sub(offset(s0, RACK_ROT));
      pivot.position.copy(restPos);
      pivot.scale.setScalar(s0);
      pivot.rotation.y = RACK_ROT;
      return {
        id,
        pivot,
        holder,
        hang: d.hang,
        mode: "rack",
        anim: null,
        swing: 0,
        lift: 0,
        rest: { pos: restPos, s: s0, ry: RACK_ROT },
        disp: { pos: stage.clone().sub(offset(s1, 0)), s: s1, ry: 0 },
        ctaY: stage.y - (size.y * s1) / 2 - 0.2,
      };
    });
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    const clock = {
      elapsedTime: 0,
      last: performance.now(),
      getDelta() {
        const n = performance.now(),
          d = (n - this.last) / 1e3;
        this.last = n;
        this.elapsedTime += d;
        return d;
      },
    };
    let ctaY = -1.4;
    const fly = (it, to) => {
      const tg = to === "display" ? it.disp : it.rest,
        spin = it.holder.rotation.y,
        T = Math.PI * 2;
      it.anim = {
        to,
        tg,
        t0: clock.elapsedTime,
        dur: calm ? 0.01 : 1,
        fromPos: it.pivot.position.clone(),
        fromS: it.pivot.scale.x,
        fromRx: it.pivot.rotation.x,
        fromRy: it.pivot.rotation.y,
        fromSpin: spin,
        toSpin: to === "display" ? spin + T : Math.ceil(spin / T) * T,
      };
    };
    let current = null;
    const select = (id) => {
      if (current === id) {
        fly(byId[id], "rack");
        current = null;
      } else {
        if (current) fly(byId[current], "rack");
        fly(byId[id], "display");
        current = id;
        ctaY = byId[id].ctaY;
      }
      setActive(current);
    };
    api.current.select = select;
    const ray = new THREE.Raycaster(),
      ndc = new THREE.Vector2();
    let hover = null,
      down = null;
    const pick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(
        items.map((i) => i.pivot),
        true,
      )[0];
      let o = hit?.object;
      while (o && !o.userData.id) o = o.parent;
      return o ? o.userData.id : null;
    };
    const onMove = (e) => {
      const id = pick(e);
      if (id !== hover) {
        hover = id;
        renderer.domElement.style.cursor = id ? "pointer" : "";
        if (id && byId[id].mode === "rack" && !calm) byId[id].swing = 0.2;
      }
    };
    const onDown = (e) => (down = { x: e.clientX, y: e.clientY });
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6)
        return;
      const id = pick(e);
      if (id) select(id);
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = Math.max(4.1 / t, 7.1 / (t * camera.aspect));
      camera.position.set(-0.1, 2, d);
      camera.lookAt(-0.1, 0.1, 0);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const anchor = new THREE.Vector3(),
      ease = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
    let raf,
      tilt = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05),
        t = clock.elapsedTime;
      items.forEach((it, n) => {
        const p = it.pivot;
        if (it.anim) {
          const a = it.anim,
            k = Math.min(1, (t - a.t0) / a.dur),
            e = ease(k),
            arc = Math.sin(Math.PI * e);
          p.position.lerpVectors(a.fromPos, a.tg.pos, e);
          p.position.y += arc * 1.5;
          p.position.z += arc * 2;
          p.scale.setScalar(THREE.MathUtils.lerp(a.fromS, a.tg.s, e));
          p.rotation.x = a.fromRx * (1 - e);
          p.rotation.y = THREE.MathUtils.lerp(a.fromRy, a.tg.ry, e);
          it.holder.rotation.y = THREE.MathUtils.lerp(a.fromSpin, a.toSpin, e);
          if (k >= 1) {
            it.mode = a.to;
            it.anim = null;
          }
        } else if (it.mode === "display") {
          if (!calm) it.holder.rotation.y += dt * 0.6;
          p.position.set(
            it.disp.pos.x,
            it.disp.pos.y + (calm ? 0 : Math.sin(t * 1.4) * 0.06),
            it.disp.pos.z,
          );
          p.rotation.x = 0;
        } else {
          it.swing *= Math.pow(0.35, dt);
          if (it.hang)
            p.rotation.x =
              Math.sin(t * 6) * it.swing +
              (calm ? 0 : Math.sin(t * 0.9 + n * 2) * 0.012);
          else {
            it.lift +=
              ((hover === it.id ? 0.12 : 0) - it.lift) * Math.min(1, dt * 10);
            p.position.y = it.rest.pos.y + it.lift;
          }
        }
      });
      tilt += (ndc.x * 0.05 - tilt) * Math.min(1, dt * 3);
      world.rotation.y = calm ? 0 : tilt;
      if (ctaPos.current) {
        anchor.set(STAGE_X, ctaY, 0.6);
        world.localToWorld(anchor);
        anchor.project(camera);
        ctaPos.current.style.transform = `translate(${(anchor.x * 0.5 + 0.5) * el.clientWidth}px, ${(-anchor.y * 0.5 + 0.5) * el.clientHeight}px)`;
      }
      if (hintRef.current) {
        anchor.set(STAGE_X, 0.35, 0);
        world.localToWorld(anchor);
        anchor.project(camera);
        hintRef.current.style.transform = `translate(${(anchor.x * 0.5 + 0.5) * el.clientWidth}px, ${(-anchor.y * 0.5 + 0.5) * el.clientHeight}px) translate(-50%, -50%)`;
      }
      renderer.render(scene, camera);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material || []).forEach((m) => {
          ["map", "bumpMap"].forEach((k) => m[k]?.dispose());
          m.dispose();
        });
      });
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  const cur = ITEMS.find((i) => i.id === active);
  return (
    <section className="rk3">
      
      <div
        className="rk3-stage"
        ref={wrap}
        role="img"
        aria-label="Clothing rack with a T-shirt, jeans and shoes"
      >
        {failed && (
          <p className="rk3-fail">3D isn’t available in this browser.</p>
        )}
        {!cur && !failed && (
          <p className="rk3-hint" ref={hintRef}>
            یکی از کالکشن هارا انتخاب کنید
          </p>
        )}
        <div className="rk3-ctaPos" ref={ctaPos}>
          {cur && (
            <a
              key={cur.id}
              className="rk3-cta"
              href={cur.href}
              onClick={(e) => {
                if (onCollectionClick) {
                  e.preventDefault();
                  onCollectionClick(cur.id);
                }
              }}
            >
              کالکشن ها
            </a>
          )}
        </div>
      </div>
      <div className="rk3-chips">
        {ITEMS.map((i) => (
          <button
            key={i.id}
            type="button"
            aria-pressed={active === i.id}
            onClick={() => api.current.select?.(i.id)}
          >
            {i.label}
          </button>
        ))}
      </div>
    </section>
  );
}


export default ClothingRack3D;
