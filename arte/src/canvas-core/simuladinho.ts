// SIMULADINHO · the app's art, in coloured pencil on the child's own grid paper (transparent here:
// the app draws the grid). One light, upper left; shade on the right. See BRIEF.md.
//
// THE OWL: a corujinha-do-mato (Megascops choliba, a small Brazilian scops owl) simplified for a
// child: ear tufts, a two-lobed facial disc with a darker rim, big forward yellow eyes, a short
// hooked beak, a streaked breast (V marks), folded wings with rows of coverts and long primaries,
// short feathered legs and toes with dark claws. The app's owl has always been blue: kept.
import { sample, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { Sheet, contour, dot, edgeDist, ellipseR, hatch as hatchRaw, minus, poly, smoothstep, union, type HatchOpts, type Region } from "./colouredPencilKit";
import { desenhar } from "./lapis";

export const D = 600;
const ANG = -1.02, X2 = 0.22;

export const C = {
  blue: "#3f6fd8", blueDk: "#22408f", violet: "#7a62c9", sky: "#8fb4f2", ice: "#cfe0fb",
  cream: "#f1dcae", ochre: "#d9a54a", umber: "#7d4a2b", sepia: "#3e3134", graphite: "#34333d",
  yellow: "#f6c93f", amber: "#e6962c", orange: "#f28c28", brick: "#c4502b", red: "#d8433a", pink: "#ee8aa0",
  green: "#3f9f5a", greenDk: "#22683a", steel: "#7c8494", lay: "#9a94a2", blueBlack: "#1f2440",
};

// a smooth closed shape through control points
const forma = (pts: P[], per = 8): P[] => sample(pts, true, per);
const R = (pts: P[]) => poly(pts);
const mirror = (pts: P[]): P[] => pts.map(([x, y]) => [D - x, y] as P).reverse();

// every hatch scaled by K so the marks still read after the art is shrunk to UI size
const comK = (K: number) => (S: Sheet, reg: Region, o: HatchOpts) => hatchRaw(S, reg, { ...o, gap: o.gap * K, len: o.len * K, w: o.w * K, strip: (o.strip ?? 150) * K, over: (o.over ?? 1.2) * K, ang: o.ang + ((((o.seed * 7919) % 13) + 13) % 13 - 6) * 0.018 });
const contK = (K: number) => (S: Sheet, pts: P[], o: Parameters<typeof contour>[2]) => contour(S, pts, { ...o, w: o.w * K, seg: (o.seg ?? 60) * Math.sqrt(K) });

// ---------------------------------------------------------------- the owl
export type Pose = { asas: number; olhos: "abertos" | "felizes"; bico: "fechado" | "aberto" };
export const POSE_NORMAL: Pose = { asas: 0, olhos: "abertos", bico: "fechado" };

export const coruja = (pose: Pose = POSE_NORMAL) => {
  const K = 2.4, hatch = comK(K), cont = contK(K), S = new Sheet();
  const corpo = forma([[300, 108], [372, 116], [438, 150], [454, 210], [446, 268], [458, 330], [468, 412], [446, 488], [384, 532], [300, 544], [216, 532], [154, 488], [132, 412], [142, 330], [154, 268], [146, 210], [162, 150], [228, 116]]);
  const tufoE: P[] = [[168, 156], [150, 62], [184, 98], [196, 70], [214, 120], [236, 126]];
  const tufoD = mirror(tufoE);
  const disco = forma([[300, 156], [254, 138], [196, 150], [166, 206], [176, 262], [222, 296], [272, 300], [300, 288], [328, 300], [378, 296], [424, 262], [434, 206], [404, 150], [346, 138]]);
  const peito = forma([[218, 316], [300, 304], [382, 316], [416, 404], [392, 488], [300, 520], [208, 488], [184, 404]]);
  // the wings, folded at the sides; raised for a cheer
  // folded: a long teardrop from the shoulder, primaries reaching past the belly. Raised: the same
  // wing swung up and out from the shoulder joint, coverts toward the body, primaries fanned at the tip.
  const asaE: P[] = pose.asas ? [[186, 384], [150, 352], [112, 292], [84, 226], [62, 160], [86, 176], [100, 150], [118, 186], [140, 172], [150, 230], [176, 292], [196, 330]] : [[150, 296], [196, 290], [222, 360], [226, 452], [200, 526], [166, 512], [138, 430]];
  const asaD = mirror(asaE);
  const olhoE = { x: 246, y: 214, r: 46 }, olhoD = { x: 354, y: 214, r: 46 };
  const bico: P[] = pose.bico === "fechado" ? [[284, 256], [316, 256], [310, 286], [300, 302], [290, 286]] : [[282, 254], [318, 254], [312, 276], [300, 290], [288, 276]];
  const pe = (cx: number): P[][] => [-1, 0, 1].map((k) => forma([[cx + k * 13 - 7, 530], [cx + k * 13 + 7, 530], [cx + k * 16 + 6, 554], [cx + k * 16, 560], [cx + k * 16 - 6, 554]], 5));
  const pes = [...pe(262), ...pe(338)];
  const olhos = union(ellipseR(olhoE.x, olhoE.y, olhoE.r, olhoE.r), ellipseR(olhoD.x, olhoD.y, olhoD.r, olhoD.r));
  const corpoR = minus(union(R(corpo), R(tufoE), R(tufoD)), R(disco), R(peito));
  const edC = edgeDist(corpo);
  // shade side: right and lower; light: upper left
  const sombra = (x: number, y: number) => smoothstep(240, 470, x) * 0.7 + smoothstep(380, 540, y) * 0.3;

  // 1 · a faint graphite lay-in: the egg of the body, the eye line, the centre line
  S.pass("lay", 0);
  cont(S, corpo, { w: 1, col: C.lay, a: 0.35, seed: 1, closed: true, seg: 120, skip: 0.35 });
  cont(S, [[170, 214], [430, 214]], { w: 1, col: C.lay, a: 0.3, seed: 2, smooth: false });
  cont(S, [[300, 100], [300, 548]], { w: 1, col: C.lay, a: 0.25, seed: 3, smooth: false, skip: 0.4 });

  // 2 · local colour, light to dark
  S.pass("peito", 0);
  hatch(S, R(peito), { ang: ANG, gap: 3.2, len: 26, w: 1.5, col: C.ice, a: 0.85, seed: 10, dens: (x, y) => 0.55 + 0.45 * sombra(x, y) });
  S.pass("disco", 0);
  hatch(S, minus(R(disco), olhos, R(bico)), { ang: ANG, gap: 3, len: 24, w: 1.5, col: C.cream, a: 0.95, seed: 11, dens: (x, y) => 0.6 + 0.4 * sombra(x, y) });
  S.pass("corpo", 1);
  hatch(S, corpoR, { ang: ANG, gap: 2.6, len: 30, w: 1.6, col: C.blue, a: 0.9, seed: 12, dens: (x, y) => 0.55 + 0.25 * smoothstep(26, 0, edC(x, y)) + 0.3 * sombra(x, y) - 0.25 * smoothstep(170, 120, y) * smoothstep(330, 200, x) });
  S.pass("asas", 1);
  hatch(S, union(R(asaE), R(asaD)), { ang: ANG, gap: 2.4, len: 26, w: 1.6, col: C.blueDk, a: 0.85, seed: 13, dens: (x, y) => 0.7 + 0.3 * sombra(x, y) });
  S.pass("olhos", 1);
  hatch(S, olhos, { ang: ANG, gap: 2.4, len: 18, w: 1.4, col: C.yellow, a: 1, seed: 14 });
  S.pass("laranja", 1);
  hatch(S, union(R(bico), ...pes.map(R)), { ang: ANG, gap: 2.2, len: 14, w: 1.4, col: C.orange, a: 1, seed: 15 });

  // 3 · second hue over the first: violet over the blue's shade side, amber round the irises, ochre on the disc rim
  S.pass("segunda", 1);
  hatch(S, corpoR, { ang: ANG, gap: 3.4, len: 26, w: 1.5, col: C.violet, a: 0.55, seed: 20, dens: (x, y) => sombra(x, y) * 0.9 });
  hatch(S, olhos, { ang: ANG, gap: 2.6, len: 14, w: 1.3, col: C.amber, a: 0.8, seed: 21, dens: (x, y) => { const d = Math.min(Math.hypot(x - olhoE.x, y - olhoE.y), Math.hypot(x - olhoD.x, y - olhoD.y)); return smoothstep(30, 46, d); } });
  hatch(S, minus(R(disco), olhos), { ang: ANG, gap: 3, len: 20, w: 1.4, col: C.ochre, a: 0.7, seed: 22, dens: (x, y) => smoothstep(18, 0, edgeDist(disco)(x, y)) + 0.35 * sombra(x, y) });
  hatch(S, union(R(bico), ...pes.map(R)), { ang: ANG, gap: 2.6, len: 12, w: 1.3, col: C.brick, a: 0.8, seed: 23, dens: (x) => smoothstep(296, 316, x) * 0.9 + 0.15 });

  // 4 · darks, cross-hatched: the shade side, under the wings, the pupils (burnished)
  S.pass("escuros", 2);
  hatch(S, union(corpoR, R(asaD)), { ang: X2, gap: 3.4, len: 22, w: 1.4, col: C.blueDk, a: 0.6, seed: 30, dens: (x, y) => smoothstep(0.55, 1, sombra(x, y)) });
  if (pose.olhos === "abertos") {
    const pupila = (o: typeof olhoE) => minus(ellipseR(o.x + 3, o.y + 4, 23, 24), ellipseR(o.x - 8, o.y - 8, 7, 7));
    hatch(S, union(pupila(olhoE), pupila(olhoD)), { ang: ANG, gap: 1.6, len: 12, w: 1.6, col: C.blueBlack, a: 1, seed: 31 });
    for (const [o, sd] of [[olhoE, 33], [olhoD, 34]] as const) cont(S, Array.from({ length: 18 }, (_, i) => [o.x + 3 + Math.cos((i / 18) * Math.PI * 2) * 23, o.y + 4 + Math.sin((i / 18) * Math.PI * 2) * 24] as P), { w: 1.2, col: C.blueBlack, a: 0.9, seed: sd, closed: true });
  }

  // 5 · contours last: sepia-graphite, thin and broken, heavier on the shade side, lost in the light
  S.pass("contornos", 2);
  const luz = (x: number, y: number) => !(x < 230 && y < 300);
  cont(S, corpo, { w: 1.2, col: C.blueDk, a: 0.8, seed: 40, closed: true, keep: luz, skip: 0.1 });
  cont(S, tufoE, { w: 1.1, col: C.blueDk, a: 0.7, seed: 41, closed: false, smooth: false, skip: 0.2 });
  cont(S, tufoD, { w: 1.2, col: C.blueDk, a: 0.85, seed: 42, closed: false, smooth: false });
  cont(S, disco, { w: 1.1, col: C.umber, a: 0.75, seed: 43, closed: true, keep: (x, y) => y < 280 || x > 300 });
  for (const [o, s] of [[olhoE, 44], [olhoD, 45]] as const) {
    if (pose.olhos === "abertos") cont(S, Array.from({ length: 24 }, (_, i) => [o.x + Math.cos((i / 24) * Math.PI * 2) * o.r, o.y + Math.sin((i / 24) * Math.PI * 2) * o.r] as P), { w: 1.3, col: C.sepia, a: 0.85, seed: s, closed: true });
    else cont(S, [[o.x - 30, o.y + 6], [o.x - 14, o.y - 16], [o.x + 14, o.y - 16], [o.x + 30, o.y + 6]], { w: 2.2, col: C.sepia, a: 0.95, seed: s });
  }
  cont(S, bico, { w: 1.1, col: C.brick, a: 0.9, seed: 46, closed: true, smooth: false });
  if (pose.bico === "aberto") { hatch(S, R([[288, 276], [312, 276], [300, 296]]), { ang: ANG, gap: 1.8, len: 10, w: 1.4, col: C.red, a: 0.9, seed: 47 }); }
  // the wing's feather rows: overlapping scallops, then the long primaries at the tip
  for (const [asa, s, lado] of [[asaE, 50, -1], [asaD, 60, 1]] as const) {
    // the wing grows out of the shoulder: no line where it joins the body
    const junta = pose.asas ? (x: number, y: number) => y < 360 || Math.abs(x - 300) > 130 : (x: number, y: number) => !(y < 330 && Math.abs(x - 300) < 120);
    cont(S, asa, { w: 1.2, col: C.blueBlack, a: lado > 0 ? 0.85 : 0.6, seed: s, closed: true, skip: lado > 0 ? 0 : 0.2, keep: junta });
    if (pose.asas) { for (let f = 0; f < 3; f++) { const t = f / 3; const x0 = asa[4][0] + (asa[8][0] - asa[4][0]) * t, y0 = asa[4][1] + (asa[8][1] - asa[4][1]) * t; cont(S, [[x0, y0], [x0 + (300 - x0) * 0.25, y0 + 70]], { w: 1, col: C.blueBlack, a: 0.55, seed: s + 20 + f, smooth: false }); } continue; }
    const cx = asa.reduce((t, p) => t + p[0], 0) / asa.length, top = Math.min(...asa.map((p) => p[1])), bot = Math.max(...asa.map((p) => p[1]));
    for (let row = 1; row <= 3; row++) {
      const y = top + ((bot - top) * row) / 4.2;
      for (let j = -1; j <= 1; j++) { const x = cx + j * 18; cont(S, [[x - 11, y - 4], [x, y + 7], [x + 11, y - 4]], { w: 1, col: C.blueBlack, a: 0.55, seed: s + row * 3 + j, smooth: true }); }
    }
  }
  // the breast's V marks, in rows, fewer in the light
  let sv = 70;
  for (let row = 0; row < 4; row++) for (let j = -2; j <= 2; j++) {
    const x = 300 + j * 38 + (row % 2) * 19, y = 352 + row * 38;
    if (!R(peito).has(x, y + 6) || (x < 250 && row === 0)) continue;
    cont(S, [[x - 9, y - 4], [x, y + 6], [x + 9, y - 4]], { w: 1.1, col: C.blue, a: 0.7, seed: sv++, smooth: false });
  }
  // claws: a small dark hook at each toe tip, attached, curling under
  for (const p of pes) { const [tx, ty] = p.reduce((a, b) => (b[1] > a[1] ? b : a)); cont(S, [[tx - 4, ty - 3], [tx + 1, ty + 4], [tx + 5, ty + 1]], { w: 1.4, col: C.sepia, a: 0.95, seed: Math.round(tx), smooth: true }); }
  return { S, K };
};

// ---------------------------------------------------------------- the icons (same hand, bolder)
const anel = (cx: number, cy: number, r: number, n = 28): P[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as P);
type Icone = () => { S: Sheet; K: number };

const icone = (fn: (h: ReturnType<typeof comK>, c: ReturnType<typeof contK>, S: Sheet) => void): Icone => () => { const K = 4.2, S = new Sheet(); fn(comK(K), contK(K), S); return { S, K }; };

export const lupa = icone((h, c, S) => {
  const vidro = anel(260, 260, 130), cabo: P[] = [[340, 360], [372, 330], [520, 478], [488, 510]];
  S.pass("cor", 1);
  h(S, R(vidro), { ang: ANG, gap: 3.6, len: 20, w: 1.5, col: C.sky, a: 0.7, seed: 1, dens: (x, y) => 0.35 + 0.5 * smoothstep(200, 380, x + y * 0.3) });
  h(S, R(cabo), { ang: ANG, gap: 2.4, len: 16, w: 1.6, col: C.orange, a: 1, seed: 2 });
  S.pass("escuro", 2);
  h(S, R(cabo), { ang: X2, gap: 3, len: 14, w: 1.4, col: C.brick, a: 0.8, seed: 3, dens: (x, y) => smoothstep(0, 40, x - y - 10) });
  c(S, anel(260, 260, 130), { w: 2.6, col: C.graphite, a: 0.95, seed: 4, closed: true });
  c(S, anel(260, 260, 112), { w: 1.6, col: C.steel, a: 0.8, seed: 5, closed: true, skip: 0.3 });
  c(S, cabo, { w: 2, col: C.sepia, a: 0.9, seed: 6, closed: true, smooth: false });
  c(S, [[200, 190], [235, 165]], { w: 2.4, col: "#ffffff", a: 0.9, seed: 7, smooth: false });
});

export const relogio = icone((h, c, S) => {
  const caixa = anel(300, 330, 190);
  S.pass("cor", 1);
  h(S, R(caixa), { ang: ANG, gap: 3.2, len: 22, w: 1.5, col: C.orange, a: 0.85, seed: 1, dens: (x, y) => smoothstep(150, 190, Math.hypot(x - 300, y - 330)) * 0.9 + 0.12 });
  h(S, R([[270, 90], [330, 90], [330, 140], [270, 140]]), { ang: ANG, gap: 2.4, len: 14, w: 1.5, col: C.orange, a: 1, seed: 2 });
  S.pass("escuro", 2);
  h(S, R(caixa), { ang: X2, gap: 3.6, len: 18, w: 1.4, col: C.brick, a: 0.7, seed: 3, dens: (x, y) => smoothstep(160, 190, Math.hypot(x - 300, y - 330)) * smoothstep(250, 450, x) });
  c(S, caixa, { w: 2.6, col: C.sepia, a: 0.95, seed: 4, closed: true });
  c(S, [[300, 330], [300, 215]], { w: 3, col: C.graphite, a: 1, seed: 5, smooth: false });
  c(S, [[300, 330], [378, 378]], { w: 3, col: C.graphite, a: 1, seed: 6, smooth: false });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? 160 : 148; c(S, [[300 + Math.cos(a) * r0, 330 + Math.sin(a) * r0], [300 + Math.cos(a) * 172, 330 + Math.sin(a) * 172]], { w: 1.6, col: C.sepia, a: 0.85, seed: 10 + i, smooth: false }); }
  c(S, [[270, 140], [270, 92], [330, 92], [330, 140]], { w: 2, col: C.sepia, a: 0.9, seed: 30, smooth: false });
  dot(S, 300, 330, 8, C.graphite, 1, 5);
});

export const livro = icone((h, c, S) => {
  const esq: P[] = [[300, 170], [210, 128], [90, 140], [90, 470], [210, 456], [300, 500]];
  const dir: P[] = [[300, 170], [390, 128], [510, 140], [510, 470], [390, 456], [300, 500]];
  S.pass("cor", 1);
  h(S, R(esq), { ang: ANG, gap: 3.8, len: 22, w: 1.5, col: C.sky, a: 0.6, seed: 1, dens: (x) => 0.3 + 0.5 * smoothstep(240, 300, x) });
  h(S, R(dir), { ang: ANG, gap: 3.4, len: 22, w: 1.5, col: C.sky, a: 0.7, seed: 2, dens: (x) => 0.45 + 0.4 * smoothstep(300, 510, x) });
  h(S, R([[90, 470], [210, 456], [300, 500], [390, 456], [510, 470], [510, 500], [390, 488], [300, 530], [210, 488], [90, 500]]), { ang: ANG, gap: 2.4, len: 16, w: 1.6, col: C.blue, a: 1, seed: 3 });
  S.pass("linhas", 2);
  for (let i = 0; i < 5; i++) { c(S, [[124, 200 + i * 48], [180, 192 + i * 46], [262, 212 + i * 46]], { w: 1.5, col: C.graphite, a: 0.7, seed: 10 + i }); c(S, [[338, 212 + i * 46], [420, 192 + i * 46], [476, 200 + i * 48]], { w: 1.5, col: C.graphite, a: 0.7, seed: 20 + i }); }
  c(S, esq, { w: 2.4, col: C.blueDk, a: 0.9, seed: 30, smooth: false });
  c(S, dir, { w: 2.6, col: C.blueDk, a: 0.95, seed: 31, smooth: false });
  c(S, [[300, 170], [300, 500]], { w: 2.2, col: C.blueDk, a: 0.9, seed: 32, smooth: false });
});

export const coracao = icone((h, c, S) => {
  const cor = forma([[300, 210], [360, 140], [450, 140], [500, 220], [470, 320], [390, 410], [300, 490], [210, 410], [130, 320], [100, 220], [150, 140], [240, 140]]);
  S.pass("cor", 1);
  h(S, R(cor), { ang: ANG, gap: 2.6, len: 24, w: 1.6, col: C.pink, a: 0.9, seed: 1, dens: (x, y) => 0.6 + 0.4 * smoothstep(20, 0, edgeDist(cor)(x, y)) - 0.4 * smoothstep(90, 30, Math.hypot(x - 210, y - 210)) });
  S.pass("segunda", 1);
  h(S, R(cor), { ang: ANG, gap: 3, len: 22, w: 1.5, col: C.red, a: 0.8, seed: 2, dens: (x, y) => smoothstep(260, 470, x + y * 0.4) });
  S.pass("escuro", 2);
  h(S, R(cor), { ang: X2, gap: 3.4, len: 18, w: 1.4, col: "#9b2340", a: 0.6, seed: 3, dens: (x, y) => smoothstep(380, 520, x + y * 0.5) });
  c(S, cor, { w: 2.2, col: "#8a2036", a: 0.9, seed: 4, closed: true, keep: (x, y) => !(x < 240 && y < 260) });
});

export const cadeado = icone((h, c, S) => {
  const corpo: P[] = [[150, 270], [450, 270], [458, 520], [142, 520]];
  const arco = [[205, 272], [205, 180], [240, 110], [300, 92], [360, 110], [395, 180], [395, 272]] as P[];
  S.pass("cor", 1);
  h(S, R(corpo), { ang: ANG, gap: 2.6, len: 22, w: 1.6, col: C.yellow, a: 1, seed: 1 });
  h(S, R(corpo), { ang: ANG, gap: 3.2, len: 20, w: 1.5, col: C.amber, a: 0.75, seed: 2, dens: (x) => smoothstep(260, 460, x) });
  S.pass("escuro", 2);
  h(S, R([[285, 360], [315, 360], [322, 450], [278, 450]]), { ang: ANG, gap: 1.8, len: 10, w: 1.6, col: C.sepia, a: 1, seed: 3 });
  c(S, arco, { w: 4, col: C.steel, a: 1, seed: 4 });
  c(S, arco.map(([x, y]) => [x + (x < 300 ? 14 : -14), y + 10] as P), { w: 2, col: C.graphite, a: 0.8, seed: 5 });
  c(S, corpo, { w: 2.4, col: C.umber, a: 0.95, seed: 6, closed: true, smooth: false });
  dot(S, 300, 350, 22, C.sepia, 1, 6);
});

export const estrela = icone((h, c, S) => {
  const pts: P[] = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 105 : 230; return [300 + Math.cos(a) * r, 320 + Math.sin(a) * r] as P; });
  S.pass("cor", 1);
  h(S, R(pts), { ang: ANG, gap: 2.4, len: 22, w: 1.6, col: C.yellow, a: 1, seed: 1 });
  S.pass("segunda", 1);
  h(S, R(pts), { ang: ANG, gap: 3, len: 20, w: 1.5, col: C.amber, a: 0.85, seed: 2, dens: (x, y) => smoothstep(280, 520, x + y * 0.5) });
  c(S, pts, { w: 2.2, col: C.brick, a: 0.9, seed: 3, closed: true, smooth: false, keep: (x, y) => !(x < 260 && y < 300) });
});

// ---------------------------------------------------------------- the film: one asset per frame
export const ASSETS: [string, () => { S: Sheet; K: number }][] = [
  ["coruja", () => coruja()],
  ["coruja-feliz", () => coruja({ asas: 1, olhos: "felizes", bico: "aberto" })],
  ["lupa", lupa], ["relogio", relogio], ["livro", livro], ["coracao", coracao], ["cadeado", cadeado], ["estrela", estrela],
];

const shot = (i: number) => ({ id: ASSETS[i][0], start: i * 30, end: (i + 1) * 30, draw: (ctx: Ctx, _local: number, env: Env) => {
  const key = `simuladinho:sheet:${i}`;
  let a = env.cache.get(key) as { S: Sheet; K: number } | undefined; if (!a) { a = ASSETS[i][1](); env.cache.set(key, a); }
  desenhar(ctx, env, a.S, { D, ang: ANG, k: a.K });
} });

export const simuladinho: Film = {
  meta: { title: "simuladinho", W: D, H: D, fps: 30, bpm: 60, durationFrames: ASSETS.length * 30 },
  assets: { images: {} },
  shots: ASSETS.map((_, i) => shot(i)),
};
