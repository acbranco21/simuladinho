// MOLDURAS · a rounded box drawn freehand in coloured pencil, gone over twice (the second pass a
// little off the first, pressure lifting between strokes). Exported as a 9-slice border image, so
// every card and button in the app gets a real pencil edge instead of a CSS line.
import { type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { Sheet, contour } from "./colouredPencilKit";
import { desenhar } from "./lapis";

const D = 300, ANG = -1.02, K = 4.5;
const caixa = (m: number, r: number, wob: number, seed: number): P[] => {
  // rounded rectangle, corners slightly uneven, sides bowing a hair: a hand ruling without a ruler
  const pts: P[] = []; let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s / 2147483647 - 0.5) * 2; };
  const cs: [number, number, number][] = [[D - m - r, m + r, -Math.PI / 2], [D - m - r, D - m - r, 0], [m + r, D - m - r, Math.PI / 2], [m + r, m + r, Math.PI]];
  for (const [cx, cy, a0] of cs) { const rr = r * (1 + rnd() * 0.25); for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + Math.cos(a) * rr + rnd() * wob, cy + Math.sin(a) * rr + rnd() * wob]); } }
  return pts;
};
export const CORES: [string, string][] = [["grafite", "#3d3b4a"], ["azul", "#22408f"], ["laranja", "#9a4a12"], ["verde", "#22683a"], ["roxo", "#4b3a9e"]];
const folha = (col: string, seed: number) => () => {
  const S = new Sheet();
  S.pass("primeira", 2);
  contour(S, caixa(22, 34, 1.2, seed), { w: 1.4 * K, col, a: 0.9, seed, closed: true, seg: 90 });
  S.pass("segunda", 2);
  contour(S, caixa(23.5, 33, 1.6, seed + 7), { w: 1.1 * K, col, a: 0.55, seed: seed + 1, closed: true, seg: 70, skip: 0.25 });
  return S;
};
export const molduras: Film = {
  meta: { title: "molduras", W: D, H: D, fps: 30, bpm: 60, durationFrames: CORES.length * 30 },
  assets: { images: {} },
  shots: CORES.map(([id, col], i) => ({ id, start: i * 30, end: (i + 1) * 30, draw: (ctx: Ctx, _l: number, env: Env) => {
    const k = `mold:${id}`; let S = env.cache.get(k) as Sheet | undefined; if (!S) { S = folha(col, 101 + i * 13)(); env.cache.set(k, S); }
    desenhar(ctx, env, S, { D, ang: ANG, k: 1.5 });
  } })),
};
