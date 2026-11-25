'use strict';
/* Meme da vaquejada v2 — 1080x1920.
   Gancho → chegada em tempo real com o narrador (câmera acompanhando) → queda em câmera bem lenta (rampa)
   → ele no chão com o narrador reagindo → o boi → risada → volta ao gancho (loop). */
const W = 1080, H = 1920, FPS = 30;
const ctx = document.getElementById('c').getContext('2d');
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* ---- linha do tempo (tempo do vídeo final ↔ tempo no vídeo original) ---- */
const HOOK = 1.0;
const AP0 = 14.2, AP1 = 19.55;                                   // chegada (tempo real)
const RAMP = [[19.55, 19.8, .5], [19.8, 20.6, .2], [20.6, 21.05, .55]];  // câmera lenta: [ini, fim, velocidade]
const CH0 = 21.05, CH1 = 23.8;                                   // no chão, narrador reagindo
const T = {}; T.aprox = HOOK; T.lenta = T.aprox + (AP1 - AP0);
let acc = T.lenta; const RAMP_T = RAMP.map(([a, b, v]) => { const r = [acc, acc + (b - a) / v, a, b, v]; acc = r[1]; return r; });
T.chao = acc; T.boi = T.chao + (CH1 - CH0); T.riso = T.boi + 1.8; T.loop = T.riso + 3.2; const DUR = T.loop + .4;
function srcLenta(t) { for (const [t0, t1, a, b, v] of RAMP_T) if (t <= t1) return a + (t - t0) * v; return RAMP[RAMP.length - 1][1]; }
function tLenta(src) { for (const [t0, t1, a, b, v] of RAMP_T) if (src <= b) return t0 + (src - a) / v; return T.chao; }
const IMPACTO = tLenta(20.45);
window.TIMES = { ...T, DUR, IMPACTO, RAMP_T };

/* ---- quadros ---- */
const pad = n => String(n).padStart(4, '0');
function frames(t) { // [chave, chave2, mistura] — mistura entre quadros vizinhos na câmera lenta
  if (t < T.aprox || t >= T.loop) return ['gancho', null, 0];
  if (t < T.lenta) return [`aprox/${pad(Math.min(163, Math.floor((t - T.aprox) * 30) + 1))}`, null, 0];
  if (t < T.chao) { const f = (srcLenta(t) - 19.5) * 60; const i = Math.floor(f); return [`queda60/${pad(clamp(i + 1, 1, 93))}`, `queda60/${pad(clamp(i + 2, 1, 93))}`, f - i]; }
  if (t < T.boi) return [`chao/${pad(Math.min(87, Math.floor((t - T.chao + .05) * 30) + 1))}`, null, 0];
  if (t < T.riso) return [`boi/${pad(Math.min(60, Math.floor((t - T.boi) * 30) + 1))}`, null, 0];
  return [`riso/${pad(Math.min(102, Math.floor((t - T.riso) * 30) + 1))}`, null, 0];
}
const FR = new Map();
window.prepare = async t => {
  const [a, b] = frames(t); const ks = [a, b].filter(Boolean);
  await Promise.all(ks.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = k === 'gancho' ? 'out/frames/gancho.jpg' : `out/frames/${k}.jpg`; })));
  if (FR.size > 10) for (const k of [...FR.keys()]) { if (!ks.includes(k) && k !== 'gancho') FR.delete(k); if (FR.size <= 5) break; }
};
window.ready = Promise.all([document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter')]).catch(() => {});

function cover(im, zoom, fx, fy, alpha = 1) {
  if (!im) return null; const s = Math.max(W / im.width, H / im.height) * zoom;
  let cx = fx * im.width, cy = fy * im.height; const hw = W / 2 / s, hh = H / 2 / s;
  cx = clamp(cx, hw, im.width - hw); cy = clamp(cy, hh, im.height - hh);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(im, 0, 0); ctx.restore();
  return { s, cx, cy, iw: im.width, ih: im.height };
}
// trajetórias [tempo original, x, y, zoom] (frações do quadro), medidas nos quadros originais
const KEYS = (k, src) => { for (let i = 0; i < k.length - 1; i++) { const [a, x0, y0, z0] = k[i], [b, x1, y1, z1] = k[i + 1]; if (src <= b) { const q = eio(P(src, a, b)); return [lerp(x0, x1, q), lerp(y0, y1, q), lerp(z0, z1, q)]; } } return k[k.length - 1].slice(1); };
const K_APROX = [[14.2, .57, .45, 1.7], [15.0, .56, .45, 1.8], [15.5, .6, .43, 1.85], [16.0, .59, .42, 1.9], [16.5, .55, .40, 1.95], [17.0, .50, .37, 2.0], [17.5, .48, .36, 2.05], [18.0, .50, .37, 2.1], [18.5, .50, .36, 2.1], [19.0, .54, .35, 2.15], [19.55, .56, .34, 2.2]];
const K_QUEDA = [[19.55, .56, .34, 2.2], [19.8, .55, .335, 2.5], [20.0, .54, .345, 2.6], [20.2, .54, .37, 2.6], [20.35, .52, .40, 2.6], [20.5, .49, .425, 2.5], [20.7, .45, .44, 2.3], [20.9, .43, .445, 2.1], [21.05, .42, .445, 2.0]];
const K_CHAO = [[21.05, .41, .44, 2.0], [22.0, .40, .44, 1.9], [23.8, .40, .44, 1.75]];

/* ---- textos ---- */
const FONT = s => `900 ${s}px Inter, "Noto Color Emoji", sans-serif`;
function memeText(s, x, y, size, col = '#fff', stroke = '#000') {
  ctx.save(); ctx.font = FONT(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width; if (w > 960) { size = Math.floor(size * 960 / w); ctx.font = FONT(size); }
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .2; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}
function popText(t, a, b, lines, y, size, col = '#fff') {
  if (t < a || t > b) return; const p = eback(P(t, a, a + .3)), out = P(t, b - .15, b);
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(540, y); ctx.scale(p, p); ctx.rotate((1 - clamp(p)) * -.08);
  lines.forEach((l, i) => memeText(l, 0, (i - (lines.length - 1) / 2) * size * 1.15, size, col)); ctx.restore();
}
function placar(t) {
  if (t < T.aprox || t >= T.loop) return;
  const a = P(t, T.aprox, T.aprox + .3), virou = t >= IMPACTO, pop = virou ? eback(P(t, IMPACTO, IMPACTO + .35)) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 300); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.roundRect(-400, -56, 800, 112, 26); ctx.fillStyle = '#111'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(-400, -56, 260, 112, [26, 0, 0, 26]); ctx.fillStyle = '#C62828'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(140, -56, 260, 112, [0, 26, 26, 0]); ctx.fillStyle = '#1565C0'; ctx.fill();
  ctx.font = FONT(50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('🐂 BOI', -270, 3);
  ctx.font = FONT(46); ctx.fillText('NEGÃO', 270, 3);
  ctx.save(); ctx.scale(pop, pop); ctx.font = FONT(66); ctx.fillStyle = virou ? '#FFD54F' : '#fff'; ctx.fillText(virou ? '1 × 0' : '0 × 0', 0, 4); ctx.restore();
  ctx.restore();
}
function seloLenta(t) {
  if (t < T.lenta || t >= T.chao) return; const blink = Math.sin(t * 8) > 0;
  ctx.save(); ctx.globalAlpha = P(t, T.lenta, T.lenta + .2) * (1 - P(t, T.chao - .2, T.chao));
  ctx.beginPath(); ctx.roundRect(60, 400, 410, 74, 16); ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fill();
  ctx.beginPath(); ctx.arc(98, 437, 13, 0, TAU); ctx.fillStyle = blink ? '#E53935' : '#7a1c1c'; ctx.fill();
  ctx.font = FONT(38); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText('CÂMERA LENTA', 124, 439); ctx.restore();
}

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sh = (t >= IMPACTO ? Math.exp(-(t - IMPACTO) * 6) : 0) * 30;
  ctx.save(); if (sh > .5) ctx.translate(Math.sin(t * 90) * sh, Math.cos(t * 77) * sh);
  const [k1, k2, mixF] = frames(t);
  let g = null, tgt = null;
  if (t < T.aprox || t >= T.loop) {
    const z = t < T.aprox ? lerp(1.15, 2.1, eo(P(t, 0, HOOK))) : lerp(2.1, 1.6, P(t, T.loop, DUR));
    cover(FR.get('gancho'), z, .54, .36);
    if (t >= T.loop) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - P(t, T.loop, T.loop + .2))})`; ctx.fillRect(0, 0, W, H); }
  } else if (t < T.lenta) {
    const src = AP0 + (t - T.aprox); const [fx, fy, z] = KEYS(K_APROX, src); cover(FR.get(k1), z, fx, fy);
  } else if (t < T.chao) {
    const src = srcLenta(t); const [fx, fy, z] = KEYS(K_QUEDA, src);
    g = cover(FR.get(k1), z, fx, fy); if (k2 && mixF > .02) cover(FR.get(k2), z, fx, fy, mixF);
    if (g) tgt = [W / 2 + (fx * g.iw - g.cx) * g.s, H / 2 + (fy * g.ih - g.cy) * g.s];
    const vg = ctx.createRadialGradient(540, 960, 450, 540, 960, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  } else if (t < T.boi) {
    const src = CH0 + (t - T.chao); const [fx, fy, z] = KEYS(K_CHAO, src); cover(FR.get(k1), z, fx, fy);
  } else if (t < T.riso) cover(FR.get(k1), lerp(1.15, 1.3, P(t, T.boi, T.riso)), .45, .3);
  else cover(FR.get(k1), lerp(1.05, 1.12, P(t, T.riso, T.loop)), .5, .4);
  ctx.restore();
  if (tgt) { const r = 160 + 12 * Math.sin(t * 7); ctx.save(); ctx.globalAlpha = 1 - P(t, IMPACTO + .5, IMPACTO + .9);
    ctx.strokeStyle = '#E53935'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(tgt[0], tgt[1], r, 0, TAU * eo(P(t, T.lenta + .1, T.lenta + .6))); ctx.stroke(); ctx.restore(); }
  for (const at of [T.aprox, T.boi, T.riso]) { const f = 1 - Math.abs(t - at) / .12; if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f * .85})`; ctx.fillRect(0, 0, W, H); } }
  { const f = 1 - Math.abs(t - T.lenta) / .1; if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f * .6})`; ctx.fillRect(0, 0, W, H); } }
  placar(t); seloLenta(t);
  if (t < T.aprox) { const p = eback(P(t, .05, .35)); ctx.save(); ctx.translate(540, 1440); ctx.scale(p * (1 + .04 * Math.sin(t * 12)), p * (1 + .04 * Math.sin(t * 12))); memeText('ESPERA O FINAL 😂', 0, 0, 96, '#FFD54F'); ctx.restore(); }
  popText(t, T.aprox + .1, T.aprox + 2.4, ['Lá vem o Negão 🐎'], 1440, 76);
  popText(t, T.aprox + 2.5, T.lenta + .2, ['Será que ele', 'derruba o boi? 🤔'], 1440, 76);
  if (t >= IMPACTO && t < IMPACTO + 1.1) { const p = eback(P(t, IMPACTO, IMPACTO + .25)); ctx.save(); ctx.translate(540, 1420); ctx.rotate(-.12); ctx.scale(p, p); memeText('TUM! 💥', 0, 0, 150, '#FF7043'); ctx.restore(); }
  popText(t, T.chao + .05, T.chao + 1.3, ['UUUUUH! 😱'], 1440, 110, '#FFD54F');
  if (t >= T.chao + 1.3 && t < T.boi) { const p = eback(P(t, T.chao + 1.3, T.chao + 1.6)); ctx.save(); ctx.translate(540, 1440); ctx.rotate(-.06); ctx.scale(p, p);
    ctx.fillStyle = 'rgba(27,94,32,.92)'; ctx.beginPath(); ctx.roundRect(-440, -80, 880, 160, 22); ctx.fill(); ctx.strokeStyle = '#A5D6A7'; ctx.lineWidth = 8; ctx.stroke(); memeText('VAR: LANCE CONFIRMADO ✅', 0, 2, 58, '#fff', '#0B3D0E'); ctx.restore(); }
  popText(t, T.boi + .1, T.riso, ['O boi: tá tudo bem', 'aí, Negão? 🐂'], 1440, 74);
  popText(t, T.riso + .15, T.loop + .02, ['Treino é treino… 😂'], 1440, 88, '#FFD54F');
}
window.renderFrame = render; window.DUR = DUR; window.FPS = FPS;
