// CORUJA SE DESENHANDO · the cheering owl drawn pass by pass, in the medium's own order (graphite
// lay-in, local colour light to dark, second hues, darks, contours), the hand moving mark by mark.
// Plays once at the app's special moments (a right answer, a lesson done, a finished training).
// 24 fps, 2 s: the drawing takes 40 frames, the last 8 hold the finished owl (== the still).
import type { Ctx, Env } from "./core";
import type { Film } from "./film";
import type { Sheet } from "./colouredPencilKit";
import { D, coruja } from "./simuladinho";
import { desenhar } from "./lapis";

const FPS = 24, DRAW = 40, HOLD = 8, N = DRAW + HOLD;
const POSE = { asas: 1, olhos: "felizes" as const, bico: "aberto" as const };

const draw = (ctx: Ctx, frame: number, env: Env) => {
  let a = env.cache.get("cd:sheet") as { S: Sheet; K: number; cum: number[] } | undefined;
  if (!a) {
    const { S, K } = coruja(POSE);
    // time per pass ~ its ink (marks), every pass at least a few frames so nothing pops in
    const peso = S.passes.map((p) => Math.max(p.marks.length, 40));
    const tot = peso.reduce((x, y) => x + y, 0), cum = [0];
    peso.forEach((w) => cum.push(cum[cum.length - 1] + w / tot));
    a = { S, K, cum }; env.cache.set("cd:sheet", a);
  }
  const t = Math.min(1, frame / DRAW);
  if (t >= 1) { desenhar(ctx, env, a.S, { D, ang: -1.02, k: a.K }); return; }
  let i = 0; while (i < a.S.passes.length - 1 && a.cum[i + 1] <= t) i++;
  const part = (t - a.cum[i]) / (a.cum[i + 1] - a.cum[i]);
  desenhar(ctx, env, a.S, { D, ang: -1.02, k: a.K, upTo: i + 1, part });
};

export const corujaDesenho: Film = {
  meta: { title: "corujaDesenho", W: D, H: D, fps: FPS, bpm: 60, durationFrames: N, kind: "drawing" },
  assets: { images: {} },
  shots: [{ id: "desenho", start: 0, end: N, draw }],
} as Film;
