'use strict';
/* Meme da vaquejada v5 — "O NEGÃO E O BOI". Padrão TikTok + memes da internet e da vaquejada. */
const W = 1080, H = 1920, FPS = 30;
const ctx = document.getElementById('c').getContext('2d');
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* sequência: [tipo, origem0, origem1|duração, velocidade, etiqueta] — tempos do vídeo original */
const SEQ = [
  ['play', 19.7, 20.48, .55, 'hook'], ['freeze', 20.48, .7, 0, 'hook'], ['play', 20.48, 14.4, -15, 'rewind'],
  ['play', 0, 3, .75, 'trailer'], ['play', 3, 14.2, 2, 'fast'], ['play', 14.2, 19.0, 1, 'narra'], ['play', 19.0, 19.95, .45, 'momento'],
  ['freeze', 19.95, 1.5, 0, 'f1'], ['play', 19.95, 20.25, .5, 'q'], ['freeze', 20.25, 1.5, 0, 'f2'], ['play', 20.25, 20.48, .5, 'q'], ['freeze', 20.48, 1.7, 0, 'f3'],
  ['play', 19.75, 20.6, .22, 'replay'], ['play', 20.6, 23.8, 1, 'chao'],
];
let acc = 0; const TL = SEQ.map(s => { const d = s[0] === 'play' ? (s[2] - s[1]) / s[3] : s[2]; const r = { k: s[0], tag: s[4], t0: acc, t1: acc + d, a: s[1], b: s[0] === 'play' ? s[2] : s[1], v: s[3] }; acc += d; return r; });
const T = { fim: acc }; T.boi = T.fim; T.riso = T.boi + 2.2; T.cont = T.riso + 3.4; const DUR = T.cont + 1.6;
function seg(t) { return TL.find(s => t < s.t1) || TL[TL.length - 1]; }
function src(t) { const s = seg(t); return s.k === 'freeze' ? s.a : s.a + (t - s.t0) * s.v; }
window.TIMES = { TL, ...T, DUR };

const pad = n => String(n).padStart(4, '0');
function frames(t) {
  if (t < T.fim) { const x = src(t), s = seg(t);
    if (x < 14.2) return [`inicio/${pad(clamp(Math.floor(x * 30) + 1, 1, 428))}`, null, 0];
    if (x < 19.5) return [`aprox/${pad(clamp(Math.floor((x - 14.2) * 30) + 1, 1, 163))}`, null, 0];
    if (x < 21.05) { const f = (x - 19.5) * 60, i = Math.floor(f); return [`queda60/${pad(clamp(i + 1, 1, 93))}`, `queda60/${pad(clamp(i + 2, 1, 93))}`, s.k === 'play' && s.v > 0 && s.v < 1 ? f - i : 0]; }
    return [`chao/${pad(clamp(Math.floor((x - 21.0) * 30) + 1, 1, 87))}`, null, 0]; }
  if (t < T.riso) return [`boi/${pad(Math.min(60, Math.floor((t - T.boi) * 30 * .82) + 1))}`, null, 0];
  if (t < T.cont) return [`riso/${pad(Math.min(102, Math.floor((t - T.riso) * 30) + 1))}`, null, 0];
  return [`riso/${pad(40)}`, null, 0];
}
const FR = new Map();
window.prepare = async t => {
  const [a, b] = frames(t); const ks = [a, b].filter(Boolean);
  await Promise.all(ks.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = `out/frames/${k}.jpg`; })));
  if (FR.size > 10) for (const k of [...FR.keys()]) { if (!ks.includes(k)) FR.delete(k); if (FR.size <= 4) break; }
};
window.ready = Promise.all([document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter')]).catch(() => {});
function cover(im, zoom, fx, fy, alpha = 1) {
  if (!im) return; const s = Math.max(W / im.width, H / im.height) * zoom;
  let cx = fx * im.width, cy = fy * im.height; const hw = W / 2 / s, hh = H / 2 / s;
  cx = clamp(cx, hw, im.width - hw); cy = clamp(cy, hh, im.height - hh);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(im, 0, 0); ctx.restore();
}
const KEYS = (k, x) => { for (let i = 0; i < k.length - 1; i++) { const [a, x0, y0, z0] = k[i], [b, x1, y1, z1] = k[i + 1]; if (x <= b) { const q = eio(P(x, a, b)); return [lerp(x0, x1, q), lerp(y0, y1, q), lerp(z0, z1, q)]; } } return k[k.length - 1].slice(1); };
const CAM = [[0, .45, .60, 1.35], [1, .5, .58, 1.35], [2, .54, .52, 1.38], [3, .58, .48, 1.4], [4, .68, .41, 1.42], [5, .66, .36, 1.45], [6, .72, .35, 1.45], [7, .64, .40, 1.45],
  [8, .68, .38, 1.45], [9, .63, .40, 1.45], [10, .62, .43, 1.45], [11, .58, .45, 1.45], [12, .61, .42, 1.45], [13, .6, .44, 1.45], [14.2, .57, .45, 1.45],
  [15.5, .6, .43, 1.55], [16.5, .55, .40, 1.6], [17.5, .48, .36, 1.7], [18.5, .50, .36, 1.75], [19.55, .56, .34, 1.85],
  [19.8, .55, .335, 2.0], [20.0, .54, .345, 2.1], [20.2, .54, .37, 2.1], [20.35, .52, .40, 2.05], [20.5, .49, .425, 2.0], [20.7, .45, .44, 1.9], [21.05, .42, .445, 1.75],
  [22.0, .40, .44, 1.65], [23.8, .40, .44, 1.55]];
const PUNCH = { 19.95: [.54, .34, 1.45], 20.25: [.535, .385, 1.5], 20.48: [.48, .43, 1.6] };

/* ---------- textos ---------- */
const F = (s, w = 800) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
function tiktokCaption(lines, y = 420, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const size = 52, lh = size * 1.32;
  ctx.font = F(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { const w = ctx.measureText(l).width + 44, yy = y + i * (lh - 4); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(540 - w / 2, yy - lh / 2, w, lh, 14); ctx.fill(); });
  lines.forEach((l, i) => { ctx.fillStyle = '#111'; ctx.fillText(l, 540, y + i * (lh - 4) + 2); });
  ctx.restore();
}
function bigText(s, x, y, size, fill, stroke = '#000', rot = 0, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.font = F(size, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width; if (w > 980) { ctx.scale(980 / w, 980 / w); }
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .18; ctx.strokeStyle = stroke; ctx.strokeText(s, 0, 0); ctx.fillStyle = fill; ctx.fillText(s, 0, 0); ctx.restore();
}
function badge(text, x, y, bg = 'rgba(0,0,0,.75)', dot = null) {
  ctx.save(); ctx.font = F(38, 900); const w = ctx.measureText(text).width + (dot ? 70 : 40);
  ctx.beginPath(); ctx.roundRect(x, y, w, 72, 16); ctx.fillStyle = bg; ctx.fill();
  if (dot) { ctx.beginPath(); ctx.arc(x + 36, y + 36, 13, 0, TAU); ctx.fillStyle = dot; ctx.fill(); }
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + (dot ? 58 : 20), y + 38); ctx.restore();
}

/* ---------- memes ---------- */
function trailer(lt, d) {
  // barras de cinema + cartelas
  const bar = eo(P(lt, 0, .35)) * 330; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  const cards = ['NO SERTÃO DO CEARÁ…', 'UM VAQUEIRO…', 'UMA MISSÃO…', 'DERRUBAR O BOI 🐂'];
  const k = Math.min(3, Math.floor(lt / (d / 4))), lk = lt - k * d / 4, a = Math.min(P(lk, 0, .18), 1 - P(lk, d / 4 - .15, d / 4));
  ctx.save(); ctx.globalAlpha = a; ctx.font = F(k === 3 ? 92 : 74, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 30; ctx.fillStyle = k === 3 ? '#FFC94A' : '#fff';
  const sc = 1 + lk * .06; ctx.translate(540, 960); ctx.scale(sc, sc); ctx.fillText(cards[k], 0, 0); ctx.restore();
}
function reticle(lt) {
  const a = P(lt, 0, .25), s = lerp(420, 230, eo(P(lt, 0, .4))), x = 540, y = 930;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#39FF6A'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(x + sx * s / 2, y + sy * s / 2 - sy * 60); ctx.lineTo(x + sx * s / 2, y + sy * s / 2); ctx.lineTo(x + sx * s / 2 - sx * 60, y + sy * s / 2); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fillStyle = '#39FF6A'; ctx.fill();
  if (lt > .4 && Math.sin(lt * 14) > -.3) { ctx.font = F(40, 900); ctx.textAlign = 'center'; ctx.fillStyle = '#39FF6A'; ctx.shadowColor = '#000'; ctx.shadowBlur = 10; ctx.fillText('🎯 ALVO LOCALIZADO', x, y + s / 2 + 60); }
  ctx.restore();
}
function trajetoria(lt) {
  // arco "calculado pela NASA" do vaqueiro até o chão
  const p = eo(P(lt, .15, .9)); const x0 = 520, y0 = 900, x1 = 240, y1 = 1380, cxp = 300, cyp = 820;
  ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 9; ctx.strokeStyle = '#FFD54F'; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 40 * p; i++) { const q = i / 40, x = (1 - q) ** 2 * x0 + 2 * (1 - q) * q * cxp + q * q * x1, y = (1 - q) ** 2 * y0 + 2 * (1 - q) * q * cyp + q * q * y1; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.setLineDash([]);
  if (p > .95) { ctx.font = F(70, 900); ctx.textAlign = 'center'; ctx.fillText('❌', x1, y1); }
  ctx.font = F(32, 800); ctx.fillStyle = '#FFD54F'; ctx.shadowColor = '#000'; ctx.shadowBlur = 8; ctx.textAlign = 'left'; ctx.fillText('trajetória calculada pela NASA 🚀', 90, 1500 + (1 - P(lt, .5, .8)) * 30);
  ctx.restore();
  const st = eback(P(lt, 0, .3)); ctx.save(); ctx.translate(540, 640); ctx.rotate(-.08); ctx.scale(st, st);
  ctx.fillStyle = '#1B8A3A'; ctx.beginPath(); ctx.roundRect(-380, -70, 760, 140, 20); ctx.fill(); ctx.strokeStyle = '#B9F6CA'; ctx.lineWidth = 8; ctx.stroke();
  ctx.font = F(64, 900); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PLANO INFALÍVEL ✅', 0, 4); ctx.restore();
}
function errorWindow(lt) {
  const p = eback(P(lt, .05, .35)); if (p <= 0) return;
  ctx.save(); ctx.translate(540, 1180); ctx.scale(p, p);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#ECE9D8'; ctx.fillRect(-430, -190, 860, 380); ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(0, -190, 0, -130); g.addColorStop(0, '#2B6FE0'); g.addColorStop(1, '#0A47B8'); ctx.fillStyle = g; ctx.fillRect(-430, -190, 860, 64);
  ctx.font = F(34, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('vaqueiro.exe', -405, -157);
  ctx.fillStyle = '#D9432F'; ctx.fillRect(360, -180, 54, 44); ctx.fillStyle = '#fff'; ctx.fillText('✕', 372, -157);
  ctx.beginPath(); ctx.arc(-330, -30, 52, 0, TAU); ctx.fillStyle = '#D9432F'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-352, -52); ctx.lineTo(-308, -8); ctx.moveTo(-308, -52); ctx.lineTo(-352, -8); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.font = F(42, 800); ctx.fillText('vaqueiro.exe parou', -250, -60); ctx.fillText('de funcionar 💀', -250, -6);
  for (const [bx, lab] of [[-90, 'OK'], [140, 'Tentar de novo']]) { ctx.fillStyle = '#F4F3EE'; ctx.fillRect(bx - 100, 90, bx > 0 ? 300 : 200, 66); ctx.strokeStyle = '#003C74'; ctx.lineWidth = 3; ctx.strokeRect(bx - 100, 90, bx > 0 ? 300 : 200, 66); ctx.fillStyle = '#111'; ctx.font = F(32, 700); ctx.textAlign = 'center'; ctx.fillText(lab, bx - 100 + (bx > 0 ? 150 : 100), 124); ctx.textAlign = 'left'; }
  ctx.restore();
}
function missao(lt) {
  const a = P(lt, .1, .4); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 850, W, 240);
  ctx.font = F(84, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px'; ctx.fillStyle = '#E53935'; ctx.shadowColor = '#000'; ctx.shadowBlur = 16;
  const sc = (1 + .06 * (1 - P(lt, .1, .5))) * Math.min(1, 980 / ctx.measureText('MISSÃO FRACASSADA').width); ctx.translate(540, 940); ctx.scale(sc, sc); ctx.fillText('MISSÃO FRACASSADA', 0, 0);
  ctx.font = F(40, 800); ctx.fillStyle = '#fff'; ctx.letterSpacing = '0px'; ctx.fillText('o boi venceu 🐂', 0, 92); ctx.restore();
}
function zero(lt) {
  if (lt > 1.9) return; const p = eback(P(lt, 0, .25)), blink = Math.floor(lt * 7) % 2 === 0;
  ctx.save(); ctx.translate(540, 980); ctx.rotate(-.12); ctx.scale(p * 1.1, p * 1.1);
  ctx.fillStyle = blink ? '#E53935' : '#B71C1C'; ctx.beginPath(); ctx.roundRect(-330, -150, 660, 300, 40); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.stroke();
  ctx.font = F(190, 900); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ZERO!', 0, 10); ctx.restore();
  bigText('o locutor: 📢', 540, 1260, 56, '#fff', '#000', 0, P(lt, .2, .4));
}
function placar(t) {
  ctx.save(); const a = P(t, 0, .3); ctx.globalAlpha = a; ctx.translate(540, 300);
  ctx.beginPath(); ctx.roundRect(-380, -52, 760, 104, 24); ctx.fillStyle = '#111'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-380, -52, 250, 104, [24, 0, 0, 24]); ctx.fillStyle = '#C62828'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(130, -52, 250, 104, [0, 24, 24, 0]); ctx.fillStyle = '#1565C0'; ctx.fill();
  ctx.font = F(46, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('🐂 BOI', -255, 3); ctx.fillText('NEGÃO', 255, 3);
  ctx.font = F(62, 900); ctx.fillStyle = '#FFD54F'; ctx.fillText('1 × 0', 0, 4); ctx.restore();
}
function continua(lt) {
  const p = eo(P(lt, .05, .45));
  ctx.save(); ctx.translate(lerp(-700, 60, p), 1560);
  ctx.fillStyle = '#F2C230'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(560, -60); ctx.lineTo(560, -100); ctx.lineTo(690, 0); ctx.lineTo(560, 100); ctx.lineTo(560, 60); ctx.lineTo(0, 60); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3B2A06'; ctx.lineWidth = 8; ctx.stroke();
  ctx.font = F(56, 900); ctx.fillStyle = '#3B2A06'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('CONTINUA…', 50, 4); ctx.restore();
}

/* ---------- render ---------- */
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const [k1, k2, mixF] = frames(t); const s = t < T.fim ? seg(t) : null, lt = s ? t - s.t0 : 0, d = s ? s.t1 - s.t0 : 0;
  ctx.save();
  if (s) {
    const x = src(t); let [fx, fy, z] = KEYS(CAM, x);
    if (s.k === 'freeze') { const p = PUNCH[s.a], k = eo(P(lt, 0, .12)); fx = lerp(fx, p[0], k); fy = lerp(fy, p[1], k); z = z * lerp(1, p[2], k) * (1 + .015 * lt);
      const sh = Math.exp(-lt * 14) * 26; ctx.translate(Math.sin(lt * 95) * sh, Math.cos(lt * 80) * sh); }
    if (s.tag === 'momento') { z *= 1 + .1 * eio(P(lt, 0, d)) + .02 * Math.max(0, Math.sin(lt * 7.8)); }
    if (s.tag === 'trailer') ctx.filter = 'sepia(.35) contrast(1.1) saturate(1.1)';
    if (s.tag === 'f3') ctx.filter = `grayscale(${P(lt, 0, .35)})`;
    if (s.tag === 'replay') ctx.filter = 'contrast(1.05)';
    cover(FR.get(k1), z, fx, fy); if (k2 && mixF > .02) cover(FR.get(k2), z, fx, fy, mixF);
    ctx.filter = 'none';
    if (s.k === 'freeze') { const f = 1 - P(lt, 0, .1); if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${.5 * f})`; ctx.fillRect(-40, -40, W + 80, H + 80); } }
    if (s.tag === 'rewind') { ctx.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 14; i++) { const yy = ((i * 173 + t * 2600) % 2000) - 40; ctx.fillRect(-40, yy, W + 80, 10 + (i % 3) * 8); } }
    if (s.tag === 'momento') { const vg = ctx.createRadialGradient(540, 960, 350, 540, 960, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${.7 * P(lt, 0, .5)})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
  } else if (t < T.riso) cover(FR.get(k1), lerp(1.12, 1.3, P(t, T.boi, T.riso)), .45, .3);
  else if (t < T.cont) cover(FR.get(k1), lerp(1.04, 1.12, P(t, T.riso, T.cont)), .5, .4);
  else { ctx.filter = 'sepia(.6) contrast(1.1)'; cover(FR.get(k1), 1.15, .45, .4); ctx.filter = 'none'; }
  ctx.restore();
  // camadas de meme por momento
  if (s) {
    if (s.tag === 'hook') tiktokCaption(['ele disse que hoje', 'o boi caía 😎']);
    if (s.tag === 'rewind') { ctx.font = F(70, 900); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('◀◀ voltando…', 70, 1700); }
    if (s.tag === 'trailer') trailer(lt, d);
    if (s.tag === 'fast') { badge('⏩ 2x', 60, 420, 'rgba(0,0,0,.75)'); tiktokCaption(lt < d / 2 ? ['o boi: 🐂 de boa'] : ['Negão: confia 😎'], 600); }
    if (s.tag === 'narra') { tiktokCaption(lt < 2.4 ? ['o narrador já tava', 'animado 🎙️'] : ['modo vaquejada:', 'ATIVADO 🔥']); if (lt > 2.0) reticle(lt - 2.0); }
    if (s.tag === 'momento') tiktokCaption(['foi aqui que tudo', 'deu errado 💀']);
    if (s.tag === 'f1') trajetoria(lt);
    if (s.tag === 'f2') errorWindow(lt);
    if (s.tag === 'f3') missao(lt);
    if (s.tag === 'replay') { badge('REPLAY 🔁', 60, 420, 'rgba(0,0,0,.75)', Math.sin(t * 8) > 0 ? '#E53935' : '#7a1c1c'); tiktokCaption(['de novo, pra ninguém', 'ficar sem ver 🔁'], 1500); }
    if (s.tag === 'chao') { placar(lt); if (lt < 1.9) zero(lt); else tiktokCaption(['Negão meditando', 'na areia 🧘‍♂️'], 1500); }
  } else if (t < T.riso) { placar(1); tiktokCaption(['o boi indo embora:', 'valeu, parceiro 👋🐂'], 1500); }
  else if (t < T.cont) tiktokCaption(['tá tudo bem,', 'foi só treino 😭'], 1500);
  else { tiktokCaption(['na próxima ele volta…'], 1300); continua(t - T.cont); }
}
window.renderFrame = render; window.DUR = DUR; window.FPS = FPS;
