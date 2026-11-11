// LÁPIS · renders a coloured-pencil Sheet (colouredPencilKit) onto a TRANSPARENT canvas, so the
// drawing sits on the app's own grid paper: wax lands on the tooth, the valleys show the sheet.
// Same pass model as the kit's replay (each pass on its own layer, punched by ONE tooth field
// shared by every pass, three pressure levels), with the tooth coarsened by `k` so the grain still
// reads after the art is shrunk to icon size. Pure: rng/fractal only, caches keyed by every input.
import { fractal, type Ctx, type Env, type Layer } from "./core";
import type { Mark, Sheet } from "./colouredPencilKit";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const LEVELS = [0.53, 0.575, 0.645];

const toothField = (env: Env, D: number, ang: number, k: number): Float32Array => {
  const key = `lapis:field:${D}:${ang}:${k}`; let f = env.cache.get(key) as Float32Array | undefined;
  if (f) return f;
  f = new Float32Array(D * D); const c = Math.cos(ang), s = Math.sin(ang);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) { const u = x * c + y * s, v = -x * s + y * c; f[y * D + x] = 0.62 * fractal(71, u, v, 0.12 / k, 0.62 / k, 2) + 0.38 * fractal(73, x, y, 0.8 / k, 0.8 / k, 1); }
  env.cache.set(key, f); return f;
};

const toothMask = (env: Env, D: number, ang: number, k: number, lvl: number): Layer => {
  const DW = Math.round(env.W * env.scale), DH = Math.round(env.H * env.scale), key = `lapis:mask:${lvl}:${D}:${ang}:${k}:${DW}x${DH}`;
  let L = env.cache.get(key) as Layer | undefined; if (L) return L;
  const f = toothField(env, D, ang, k), small = env.canvas(D, D), img = small.ctx.createImageData(D, D), d = img.data, T = LEVELS[lvl];
  for (let i = 0; i < D * D; i++) d[i * 4 + 3] = 255 * clamp((T - f[i]) * 11 + 0.5);
  small.ctx.putImageData(img, 0, 0);
  L = env.canvas(DW, DH); L.ctx.imageSmoothingEnabled = true; L.ctx.drawImage(small.canvas as CanvasImageSource, 0, 0, D, D, 0, 0, DW, DW); // one uniform scale: a wide sheet keeps the top of the square field
  env.cache.set(key, L); return L;
};

const fillMark = (c: Ctx, m: Mark) => { const p = m.poly; c.globalAlpha = m.a; c.fillStyle = m.col; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fill(); };

/** Draw passes [0, upTo) of the sheet (all by default), each punched by the tooth, on a transparent ctx. */
export const desenhar = (ctx: Ctx, env: Env, S: Sheet, o: { D: number; ang: number; k: number; upTo?: number; part?: number }) => {
  const DW = Math.round(env.W * env.scale), DH = Math.round(env.H * env.scale), key = `lapis:scratch:${DW}x${DH}`;
  let L = env.cache.get(key) as Layer | undefined; if (!L) { L = env.canvas(DW, DH); env.cache.set(key, L); }
  const c = L.ctx, kx = (env.scale * env.W) / o.D, ky = kx; // uniform: design units are square on every sheet shape
  const n = o.upTo ?? S.passes.length;
  for (let pi = 0; pi < n; pi++) {
    const pass = S.passes[pi];
    // the last pass may be part-drawn (a drawing that makes itself): marks up to a fraction
    const marks = pi === n - 1 && o.part !== undefined ? pass.marks.slice(0, Math.round(pass.marks.length * clamp(o.part))) : pass.marks;
    if (!marks.length) continue;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.clearRect(0, 0, DW, DH);
    c.setTransform(kx, 0, 0, ky, 0, 0);
    for (const m of marks) fillMark(c, m);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "destination-in";
    c.drawImage(toothMask(env, o.D, o.ang, o.k, pass.tooth).canvas as CanvasImageSource, 0, 0);
    c.globalCompositeOperation = "source-over";
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.drawImage(L.canvas as CanvasImageSource, 0, 0); ctx.restore();
  }
};
