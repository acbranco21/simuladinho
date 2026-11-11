// TEXTURAS · full-bleed coloured-pencil swatches for the app's buttons and cards: one hue hatched in
// the dominant diagonal, a second hue layered over one side (the light is upper left), so a filled
// button reads as coloured in by hand. Transparent between the marks: the grid shows through.
import { type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { Sheet, hatch, poly, smoothstep } from "./colouredPencilKit";
import { desenhar } from "./lapis";

const W = 1200, H = 600, ANG = -1.02, K = 2.6;
const tudo = poly([[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]] as P[]);
const sw = (base: string, over: string, a: number, seed: number) => () => {
  const S = new Sheet();
  S.pass("base", 1);
  hatch(S, tudo, { ang: ANG, gap: 3 * K, len: 34 * K, w: 1.6 * K, col: base, a, seed, strip: 400 });
  S.pass("segunda", 1);
  hatch(S, tudo, { ang: ANG, gap: 4 * K, len: 30 * K, w: 1.5 * K, col: over, a: a * 0.6, seed: seed + 1, strip: 400, dens: (x, y) => smoothstep(500, 1400, x + y) });
  return S;
};
export const SWATCHES: [string, () => Sheet][] = [
  ["laranja", sw("#f6a04a", "#e0702a", 0.95, 10)],
  ["azul-claro", sw("#a9c6f5", "#7f9fe6", 0.8, 20)],
  ["verde", sw("#8fd19e", "#4fae6a", 0.85, 30)],
  ["roxo", sw("#c9b8f2", "#9b84de", 0.85, 40)],
  ["amarelo", sw("#fbe07a", "#f3c13f", 0.9, 50)],
  ["azul", sw("#5d8ae6", "#3a5fc4", 0.95, 60)],
  ["rosa", sw("#f6b3c2", "#e57a95", 0.85, 70)],
];
export const texturas: Film = {
  meta: { title: "texturas", W, H, fps: 30, bpm: 60, durationFrames: SWATCHES.length * 30 },
  assets: { images: {} },
  shots: SWATCHES.map(([id, mk], i) => ({ id, start: i * 30, end: (i + 1) * 30, draw: (ctx: Ctx, _l: number, env: Env) => {
    // the tooth field is square: lay the swatch on a W x W design square and keep its top half
    const k = `tex:${id}`; let S = env.cache.get(k) as Sheet | undefined; if (!S) { S = mk(); env.cache.set(k, S); }
    desenhar(ctx, env, S, { D: W, ang: ANG, k: K });
  } })),
};

// A seamless tile: hatch a square a little bigger than itself, then repeat every mark one tile to
// each side, so a stroke that leaves the right edge comes back on the left. The app repeats it at
// one fixed size, so a stroke is the same length on a small button and on a big card.
import type { Mark } from "./colouredPencilKit";
const T = 600;
const ladrilho = () => {
  const S = new Sheet(), area = poly([[-60, -60], [T + 60, -60], [T + 60, T + 60], [-60, T + 60]] as P[]);
  S.pass("base", 1);
  hatch(S, area, { ang: ANG, gap: 3 * 1.6, len: 30 * 1.6, w: 1.6 * 1.6, col: "#000", a: 0.95, seed: 300, strip: 300 });
  const base = S.passes[0].marks.filter((m) => { const [x, y] = m.c[m.c.length >> 1]; return x >= 0 && x < T && y >= 0 && y < T; });
  const mover = (m: Mark, dx: number, dy: number): Mark => { const poly2 = new Float32Array(m.poly.length); for (let i = 0; i < m.poly.length; i += 2) { poly2[i] = m.poly[i] + dx; poly2[i + 1] = m.poly[i + 1] + dy; } return { ...m, c: m.c.map(([x, y]) => [x + dx, y + dy] as P), poly: poly2 }; };
  S.passes[0].marks = base.flatMap((m) => [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => mover(m, i * T, j * T))));
  return S;
};
export const ladrilhoFilm: Film = {
  meta: { title: "ladrilho", W: T, H: T, fps: 30, bpm: 60, durationFrames: 30 },
  assets: { images: {} },
  shots: [{ id: "ladrilho", start: 0, end: 30, draw: (ctx: Ctx, _l: number, env: Env) => {
    let S = env.cache.get("tile") as Sheet | undefined; if (!S) { S = ladrilho(); env.cache.set("tile", S); }
    desenhar(ctx, env, S, { D: T, ang: ANG, k: 1.6 });
  } }],
};
