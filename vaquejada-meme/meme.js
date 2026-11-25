'use strict';
/* Meme da vaquejada — 1080x1920, 18 s. Gancho → corrida → queda → VAR → replay em câmera lenta → o boi → risada (loop). */
const W = 1080, H = 1920, FPS = 30, DUR = 18.0;
const ctx = document.getElementById('c').getContext('2d');
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* linha do tempo */
const T = { corrida: 1.1, queda: 6.0, chao: 7.0, var: 7.65, replay: 8.45, boi: 12.6, riso: 14.4, loop: 17.6 };
const SLOW = 0.35, R0 = 19.55;                       // replay: tempo no vídeo original = R0 + (t - T.replay) * SLOW
const TCHAO_REPLAY = T.replay + (20.45 - R0) / SLOW; // impacto no replay

/* quadros */
const FR = new Map(); const IMGS = {};
function key(t) {
  if (t < T.corrida || t >= T.loop) return 'gancho';
  if (t < T.replay) { const src = t < T.var ? 14.6 + (t - T.corrida) : 21.1; return `corrida/${pad(Math.min(197, Math.floor((src - 14.6) * 30) + 1))}`; }
  if (t < T.boi) { const src = R0 + (t - T.replay) * SLOW; return `queda60/${pad(Math.min(93, Math.floor((src - 19.5) * 60) + 1))}`; }
  if (t < T.riso) return `boi/${pad(Math.min(60, Math.floor((t - T.boi) * 30) + 1))}`;
  return `riso/${pad(Math.min(102, Math.floor((t - T.riso) * 30) + 1))}`;
}
const pad = n => String(n).padStart(4, '0');
window.prepare = async t => {
  const ks = [key(t)]; if (t >= T.loop - .05) ks.push(key(T.riso + 3.15));
  await Promise.all(ks.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = k === 'gancho' ? 'out/frames/gancho.jpg' : `out/frames/${k}.jpg`; })));
  if (FR.size > 12) for (const k of [...FR.keys()]) { if (!ks.includes(k) && k !== 'gancho') FR.delete(k); if (FR.size <= 6) break; }
};
window.ready = Promise.all([document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter')]).catch(() => {});

// desenha a imagem cobrindo a tela, com zoom em torno de (fx, fy) (frações da imagem)
function cover(im, zoom = 1, fx = .5, fy = .5) {
  if (!im) return; const s = Math.max(W / im.width, H / im.height) * zoom;
  let cx = fx * im.width, cy = fy * im.height; const hw = W / 2 / s, hh = H / 2 / s;
  cx = clamp(cx, hw, im.width - hw); cy = clamp(cy, hh, im.height - hh);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(im, 0, 0); ctx.restore();
  return { s, cx, cy, iw: im.width, ih: im.height };
}
// posição do vaqueiro durante a queda (frações do quadro), medida nos quadros do vídeo
const TRACK = [[19.5, .56, .34], [19.8, .55, .335], [20.0, .54, .345], [20.2, .54, .37], [20.35, .52, .40], [20.5, .49, .425], [20.7, .45, .44], [20.9, .43, .445], [21.05, .42, .445]];
function track(src) { for (let i = 0; i < TRACK.length - 1; i++) { const [a, x0, y0] = TRACK[i], [b, x1, y1] = TRACK[i + 1]; if (src <= b) { const k = P(src, a, b); return [lerp(x0, x1, k), lerp(y0, y1, k)]; } } return TRACK[TRACK.length - 1].slice(1); }

/* textos estilo meme */
function memeText(s, x, y, size, col = '#fff', o = {}) {
  ctx.save(); ctx.font = `900 ${size}px Inter, "Noto Color Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let w = ctx.measureText(s).width; if (w > 960) { size = Math.floor(size * 960 / w); ctx.font = `900 ${size}px Inter, "Noto Color Emoji", sans-serif`; }
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .2; ctx.strokeStyle = o.stroke || '#000'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}
function popText(t, a, b, lines, y, size, col) {
  if (t < a || t > b) return; const p = eback(P(t, a, a + .3)), out = P(t, b - .15, b);
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(540, y); ctx.scale(p, p); ctx.rotate((1 - clamp(p)) * -.08);
  lines.forEach((l, i) => memeText(l, 0, (i - (lines.length - 1) / 2) * size * 1.15, size, Array.isArray(col) ? col[i] : col)); ctx.restore();
}
function placar(t) {
  if (t < T.corrida || t >= T.loop) return;
  const a = P(t, T.corrida, T.corrida + .3), virou = t >= T.chao; const pop = virou ? eback(P(t, T.chao, T.chao + .35)) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 300);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.roundRect(-400, -56, 800, 112, 26); ctx.fillStyle = '#111'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.roundRect(-400, -56, 260, 112, [26, 0, 0, 26]); ctx.fillStyle = '#C62828'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(140, -56, 260, 112, [0, 26, 26, 0]); ctx.fillStyle = '#1565C0'; ctx.fill();
  ctx.font = '900 50px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText('🐂 BOI', -270, 3); ctx.font = '900 38px Inter, sans-serif'; ctx.fillText('VAQUEIRO', 270, 3);
  ctx.save(); ctx.scale(pop, pop); ctx.font = '900 66px Inter, sans-serif'; ctx.fillStyle = virou ? '#FFD54F' : '#fff'; ctx.fillText(virou ? '1 × 0' : '0 × 0', 0, 4); ctx.restore();
  ctx.restore();
}
function varBanner(t) {
  if (t < T.var || t >= T.boi) return;
  if (t < T.replay + .2) {
    const p = eo(P(t, T.var, T.var + .25)), out = P(t, T.replay, T.replay + .2);
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, H);
    ctx.translate((1 - p) * -W, 960); ctx.fillStyle = '#111'; ctx.fillRect(0, -110, W, 220); ctx.fillStyle = '#FFD54F'; ctx.fillRect(0, -110, W, 14); ctx.fillRect(0, 96, W, 14);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(110, -55, 140, 100, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(150, 60); ctx.lineTo(210, 60); ctx.stroke();
    ctx.font = '900 78px Inter, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('REVISÃO DO VAR', 290, 4);
    ctx.restore();
  } else {
    // selos do replay
    const blink = Math.sin(t * 8) > 0;
    ctx.save(); ctx.beginPath(); ctx.roundRect(60, 400, 250, 74, 16); ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fill();
    ctx.beginPath(); ctx.arc(98, 437, 13, 0, TAU); ctx.fillStyle = blink ? '#E53935' : '#7a1c1c'; ctx.fill();
    ctx.font = '900 40px Inter, sans-serif'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText('REPLAY', 124, 439);
    ctx.font = '800 32px Inter, sans-serif'; ctx.fillStyle = '#FFD54F'; ctx.fillText('VAR', 868, 439); ctx.restore();
  }
}

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // tremida no impacto
  const sh = Math.max(Math.exp(-(t - T.chao) * 9) * (t >= T.chao ? 1 : 0), Math.exp(-(t - TCHAO_REPLAY) * 7) * (t >= TCHAO_REPLAY ? 1 : 0)) * 26;
  ctx.save(); if (sh > .5) ctx.translate(Math.sin(t * 90) * sh, Math.cos(t * 77) * sh);
  const im = FR.get(key(t));
  if (t < T.corrida || t >= T.loop) {
    // GANCHO: vaqueiro congelado no ar, aproximando
    const z = t < T.corrida ? lerp(1.15, 2.1, eo(P(t, 0, 1.0))) : lerp(2.1, 1.6, P(t, T.loop, DUR));
    cover(FR.get('gancho'), z, .54, .36);
    if (t >= T.loop) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - P(t, T.loop, T.loop + .2))})`; ctx.fillRect(0, 0, W, H); }
  } else if (t < T.replay) {
    const z = t < T.queda ? lerp(1.0, 1.25, P(t, T.corrida, T.queda)) : 1.25 + .35 * eio(P(t, T.queda, T.chao));
    const [fx, fy] = t < T.queda ? [.5, lerp(.42, .36, P(t, T.corrida, T.queda))] : track(19.5 + (t - T.queda));
    cover(im, z, fx, fy);
    if (t >= T.var) { ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(0, 0, W, H); }
  } else if (t < T.boi) {
    const src = R0 + (t - T.replay) * SLOW; const [fx, fy] = track(src); const z = lerp(2.0, 2.3, P(t, T.replay, T.boi));
    const g = cover(im, z, fx, fy);
    // círculo vermelho seguindo o vaqueiro
    if (g) { const sx = W / 2 + (fx * g.iw - g.cx) * g.s, sy = H / 2 + (fy * g.ih - g.cy) * g.s; const r = 150 + 12 * Math.sin(t * 7);
      ctx.save(); ctx.globalAlpha *= 1 - P(t, TCHAO_REPLAY + .35, TCHAO_REPLAY + .6); ctx.strokeStyle = '#E53935'; ctx.lineWidth = 12; ctx.setLineDash([]); ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU * eo(P(t, T.replay + .1, T.replay + .6))); ctx.stroke(); ctx.restore(); }
    // leve vinheta de "câmera lenta"
    const vg = ctx.createRadialGradient(540, 960, 500, 540, 960, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  } else if (t < T.riso) {
    cover(im, lerp(1.15, 1.3, P(t, T.boi, T.riso)), .45, .3);
  } else {
    cover(im, lerp(1.05, 1.12, P(t, T.riso, T.loop)), .5, .4);
  }
  ctx.restore();
  // transições: flash na entrada de cada parte
  for (const at of [T.corrida, T.replay, T.boi, T.riso]) { const f = 1 - Math.abs(t - at) / .12; if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f * .85})`; ctx.fillRect(0, 0, W, H); } }
  placar(t); varBanner(t);
  // textos
  if (t < T.corrida) { const p = eback(P(t, .05, .35)); ctx.save(); ctx.translate(540, 1440); ctx.scale(p * (1 + .04 * Math.sin(t * 12)), p * (1 + .04 * Math.sin(t * 12))); memeText('ESPERA O FINAL 😂', 0, 0, 96, '#FFD54F'); ctx.restore(); }
  popText(t, T.corrida + .1, 3.5, ['Treino de vaquejada 🐎'], 1330, 70, '#fff');
  popText(t, 3.55, T.queda + .15, ['Será que ele', 'derruba o boi? 🤔'], 1330, 76, '#fff');
  popText(t, T.chao + .02, T.var, ['UUUUUH! 😱'], 1330, 110, '#FFD54F');
  if (t >= TCHAO_REPLAY && t < TCHAO_REPLAY + .9) { const p = eback(P(t, TCHAO_REPLAY, TCHAO_REPLAY + .25)); ctx.save(); ctx.translate(540, 1300); ctx.rotate(-.12); ctx.scale(p, p); memeText('TUM! 💥', 0, 0, 140, '#FF7043'); ctx.restore(); }
  if (t >= TCHAO_REPLAY + .6 && t < T.boi) { const p = eback(P(t, TCHAO_REPLAY + .6, TCHAO_REPLAY + .9)); ctx.save(); ctx.translate(540, 1420); ctx.rotate(-.06); ctx.scale(p, p);
    ctx.fillStyle = 'rgba(27,94,32,.92)'; ctx.beginPath(); ctx.roundRect(-430, -80, 860, 160, 22); ctx.fill(); ctx.strokeStyle = '#A5D6A7'; ctx.lineWidth = 8; ctx.stroke(); memeText('LANCE CONFIRMADO ✅', 0, 2, 66, '#fff', { stroke: '#0B3D0E' }); ctx.restore(); }
  popText(t, T.boi + .1, T.riso, ['O boi: tá tudo bem', 'aí, parceiro? 🐂'], 1330, 74, '#fff');
  popText(t, T.riso + .15, T.loop + .02, ['Treino é treino… 😂'], 1330, 88, '#FFD54F');
}
window.renderFrame = render; window.DUR = DUR; window.FPS = FPS;
