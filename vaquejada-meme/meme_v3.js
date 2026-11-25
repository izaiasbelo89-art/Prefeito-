'use strict';
/* Meme da vaquejada v3 — padrão TikTok: legenda nativa (caixa branca), sem gráficos extras.
   Chegada com o narrador → câmera lenta com 3 travamentos (zoom de impacto) → ele no chão → o boi → risada. */
const W = 1080, H = 1920, FPS = 30;
const ctx = document.getElementById('c').getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* sequência: play [src0, src1, velocidade] | freeze [src, duração] (tempos do vídeo original) */
const SEQ = [['play', 14.2, 19.75, 1], ['play', 19.75, 19.95, .35], ['freeze', 19.95, .85], ['play', 19.95, 20.25, .3], ['freeze', 20.25, .75],
  ['play', 20.25, 20.48, .3], ['freeze', 20.48, 1.0], ['play', 20.48, 21.05, .6], ['play', 21.05, 23.8, 1]];
let acc = 0; const TL = SEQ.map(s => { const d = s[0] === 'play' ? (s[2] - s[1]) / s[3] : s[2]; const r = { k: s[0], t0: acc, t1: acc + d, a: s[1], b: s[0] === 'play' ? s[2] : s[1], v: s[3] || 0 }; acc += d; return r; });
const T = { fim: acc }; T.boi = T.fim; T.riso = T.boi + 1.8; const DUR = T.riso + 3.3;
function seg(t) { return TL.find(s => t < s.t1) || TL[TL.length - 1]; }
function src(t) { const s = seg(t); return s.k === 'freeze' ? s.a : s.a + (t - s.t0) * s.v; }
window.TIMES = { TL, ...T, DUR };

const pad = n => String(n).padStart(4, '0');
function frames(t) {
  if (t < T.fim) { const x = src(t);
    if (x < 19.5) return [`aprox/${pad(clamp(Math.floor((x - 14.2) * 30) + 1, 1, 163))}`, null, 0];
    if (x < 21.05) { const f = (x - 19.5) * 60, i = Math.floor(f); return [`queda60/${pad(clamp(i + 1, 1, 93))}`, `queda60/${pad(clamp(i + 2, 1, 93))}`, seg(t).k === 'freeze' ? 0 : f - i]; }
    return [`chao/${pad(clamp(Math.floor((x - 21.0) * 30) + 1, 1, 87))}`, null, 0]; }
  if (t < T.riso) return [`boi/${pad(Math.min(60, Math.floor((t - T.boi) * 30) + 1))}`, null, 0];
  return [`riso/${pad(Math.min(102, Math.floor((t - T.riso) * 30) + 1))}`, null, 0];
}
const FR = new Map();
window.prepare = async t => {
  const [a, b] = frames(t); const ks = [a, b].filter(Boolean);
  await Promise.all(ks.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = `out/frames/${k}.jpg`; })));
  if (FR.size > 10) for (const k of [...FR.keys()]) { if (!ks.includes(k)) FR.delete(k); if (FR.size <= 4) break; }
};
window.ready = Promise.all([document.fonts.load('800 60px Inter')]).catch(() => {});
function cover(im, zoom, fx, fy, alpha = 1) {
  if (!im) return; const s = Math.max(W / im.width, H / im.height) * zoom;
  let cx = fx * im.width, cy = fy * im.height; const hw = W / 2 / s, hh = H / 2 / s;
  cx = clamp(cx, hw, im.width - hw); cy = clamp(cy, hh, im.height - hh);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(im, 0, 0); ctx.restore();
}
const KEYS = (k, x) => { for (let i = 0; i < k.length - 1; i++) { const [a, x0, y0, z0] = k[i], [b, x1, y1, z1] = k[i + 1]; if (x <= b) { const q = eio(P(x, a, b)); return [lerp(x0, x1, q), lerp(y0, y1, q), lerp(z0, z1, q)]; } } return k[k.length - 1].slice(1); };
// câmera: acompanha o vaqueiro (frações do quadro + zoom), mais aberta que antes
const CAM = [[14.2, .57, .45, 1.45], [15.5, .6, .43, 1.55], [16.5, .55, .40, 1.6], [17.5, .48, .36, 1.7], [18.5, .50, .36, 1.75], [19.55, .56, .34, 1.85],
  [19.8, .55, .335, 2.0], [20.0, .54, .345, 2.1], [20.2, .54, .37, 2.1], [20.35, .52, .40, 2.05], [20.5, .49, .425, 2.0], [20.7, .45, .44, 1.9], [21.05, .42, .445, 1.75],
  [22.0, .40, .44, 1.65], [23.8, .40, .44, 1.55]];
// alvo do zoom de cada travamento
const PUNCH = { 19.95: [.54, .34, 1.45], 20.25: [.535, .385, 1.5], 20.48: [.48, .43, 1.6] };

/* legenda nativa do TikTok: texto preto em caixas brancas arredondadas, linha a linha */
function tiktokCaption(lines, y, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const size = 52, lh = size * 1.32;
  ctx.font = `800 ${size}px Inter, "Noto Color Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { const w = ctx.measureText(l).width + 44, yy = y + i * (lh - 4);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(540 - w / 2, yy - lh / 2, w, lh, 14); ctx.fill(); });
  lines.forEach((l, i) => { ctx.fillStyle = '#111'; ctx.fillText(l, 540, y + i * (lh - 4) + 2); });
  ctx.restore();
}
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const [k1, k2, mixF] = frames(t);
  ctx.save();
  if (t < T.fim) {
    const s = seg(t), x = src(t); let [fx, fy, z] = KEYS(CAM, x);
    if (s.k === 'freeze') { const dt = t - s.t0, p = PUNCH[s.a], k = eo(P(dt, 0, .12));
      fx = lerp(fx, p[0], k); fy = lerp(fy, p[1], k); z = z * lerp(1, p[2], k) * (1 + .015 * dt);
      const sh = Math.exp(-dt * 14) * 26; ctx.translate(Math.sin(dt * 95) * sh, Math.cos(dt * 80) * sh); }
    cover(FR.get(k1), z, fx, fy); if (k2 && mixF > .02) cover(FR.get(k2), z, fx, fy, mixF);
    if (s.k === 'freeze') { const f = 1 - P(t - s.t0, 0, .1); if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${.5 * f})`; ctx.fillRect(-40, -40, W + 80, H + 80); } }
  } else if (t < T.riso) cover(FR.get(k1), lerp(1.12, 1.25, P(t, T.boi, T.riso)), .45, .3);
  else cover(FR.get(k1), lerp(1.04, 1.1, P(t, T.riso, DUR)), .5, .4);
  ctx.restore();
  // legendas (uma ideia por vez, sem animação exagerada)
  if (t < T.boi) tiktokCaption(['POV: o Negão garantiu', 'que hoje derrubava o boi 😎'], 420);
  else if (t < T.riso) tiktokCaption(['o boi depois: 🧍‍♂️'], 420);
  else tiktokCaption(['treino é treino né 😭'], 420);
}
window.renderFrame = render; window.DUR = DUR; window.FPS = FPS;
