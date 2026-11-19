'use strict';
/* Corbã Utilidades — vídeo vertical 9:16 (1080x1920), 61 s, sincronizado com audio/locucao-final.wav.
   Usa cenarios.js (ilustrações da região) e clips.js (trechos dos vídeos reais, extraídos por extract.py). */
const W = 1080, H = 1920, FPS = 30, DUR = 61.0;
const ctx = cx;
const C = { red: '#E2231A', blue: '#3FA2E8', navy: '#1B2F8F', navy2: '#0E1A5C', white: '#FFFFFF', ink: '#0E1A44', green: '#1FAF5A', gold: '#F4B63F' };

/* ---------- carregamento ---------- */
const IMG = {};
window.ready = Promise.all([
  new Promise(r => { const i = new Image(); i.onload = () => { IMG.logo = i; r(); }; i.onerror = r; i.src = '../assets/logo.png'; }),
  document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter'), document.fonts.load('600 60px Inter'),
]).catch(() => {});
const FR = new Map();
function frameKey(c, t) { return `${c.id}/${String(Math.min(c.n, Math.max(1, Math.floor((t - c.t0) * 30) + 1))).padStart(4, '0')}`; }
function activeClips(t) { return CLIPS.filter(c => t >= c.t0 - .04 && t <= c.t1 + .04); }
window.prepare = async t => {
  const keys = activeClips(t).map(c => frameKey(c, t));
  await Promise.all(keys.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = `out/frames/${k}.jpg`; })));
  if (FR.size > 40) { for (const k of FR.keys()) { if (!keys.includes(k)) FR.delete(k); if (FR.size <= 20) break; } }
};
function clip(id, t, alpha = 1, zoom = 1) {
  const c = CLIPS.find(x => x.id === id); const im = FR.get(frameKey(c, t)); if (!im || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(540, 960); ctx.scale(zoom, zoom); ctx.drawImage(im, -540, -960, 1080, 1920); ctx.restore();
}
function clipA(id, t, fi = .3, fo = .3) { const c = CLIPS.find(x => x.id === id); return Math.min(P(t, c.t0, c.t0 + fi), 1 - P(t, c.t1 - fo, c.t1)); }

/* ---------- utilidades ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = .3, fo = .3) => Math.min(P(t, a, a + fi), 1 - P(t, b - fo, b));
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function shadow(b, oy, c = 'rgba(14,26,92,.3)') { ctx.shadowColor = c; ctx.shadowBlur = b; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0; }
function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function ring(x, y, r, c, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function font(s, w = 800) { ctx.font = `${w} ${s}px Inter, "DejaVu Sans", sans-serif`; }
function txt(s, x, y, size, col, w = 800, al = 'center') { font(size, w); ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
function check(x, y, r, bg = C.green, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, 0, r, bg);
  ctx.beginPath(); ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .35); ctx.lineTo(r * .48, -r * .32);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function pinIcon(x, y, col, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); shadow(14, 6, 'rgba(0,0,0,.35)');
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, -26, -34, -40, -34, -62); ctx.arc(0, -62, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 18, -26, 0, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); noShadow(); circle(0, -62, 13, '#fff'); ctx.restore();
}
function darken(a) { ctx.fillStyle = `rgba(14,26,92,${a})`; ctx.fillRect(0, 0, W, H); }
function bottomFade(a = .8) { const g = ctx.createLinearGradient(0, 1000, 0, 1920); g.addColorStop(0, 'rgba(14,26,92,0)'); g.addColorStop(.5, `rgba(14,26,92,${a * .7})`); g.addColorStop(1, `rgba(14,26,92,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 1000, W, 920); }

/* ---------- textos ---------- */
function headline(t, a, b, lines, o = {}) {
  if (t < a || t > b) return;
  const pin = eo(P(t, a, a + .3)), pout = eio(P(t, b - .25, b)), alpha = pin * (1 - pout);
  let size = o.size || 72; font(size, 900);
  const meas = () => lines.map(l => l.reduce((s, [tx]) => s + ctx.measureText(tx).width, 0));
  let widths = meas(); if (Math.max(...widths) > 880) { size = Math.floor(size * 880 / Math.max(...widths)); font(size, 900); widths = meas(); }
  const lh = size * 1.18, cw = Math.max(...widths) + 96, ch = lines.length * lh + 60, cy = o.y || 470;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(540, cy + (1 - pin) * 34 - pout * 20); const sc = 0.92 + 0.08 * eback(pin); ctx.scale(sc, sc);
  shadow(34, 14, 'rgba(14,26,92,.35)'); fillRR(-cw / 2, -ch / 2, cw, ch, 30, '#fff'); noShadow();
  fillRR(-60, -ch / 2 - 8, 60, 16, [8, 0, 0, 8], C.red); fillRR(0, -ch / 2 - 8, 60, 16, [0, 8, 8, 0], C.blue);
  lines.forEach((l, i) => {
    const lp = eo(P(t, a + .08 + i * .12, a + .45 + i * .12));
    let x = -widths[i] / 2; const y = -ch / 2 + 30 + lh * (i + .5);
    ctx.save(); ctx.globalAlpha = alpha * lp; ctx.translate(0, (1 - lp) * 24); font(size, 900); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [tx, col] of l) { ctx.fillStyle = col || C.navy; ctx.fillText(tx, x, y + 2); x += ctx.measureText(tx).width; }
    ctx.restore();
  });
  ctx.restore();
}
function addressCard(t, a, b, l1, l2, l3, y = 1290) {
  const al = win(t, a, b, .3, .25); if (al <= 0) return;
  const p = eback(P(t, a, a + .4));
  ctx.save(); ctx.globalAlpha = al; ctx.translate(540, y); ctx.scale(p, p);
  shadow(36, 14, 'rgba(0,0,0,.4)'); fillRR(-450, -130, 900, 260, 36, '#fff'); noShadow();
  fillRR(-450, -130, 450, 18, [36, 0, 0, 0], C.red); fillRR(0, -130, 450, 18, [0, 36, 0, 0], C.blue);
  pinIcon(-370, 60, C.red, 1.25);
  font(58, 900); const s1 = Math.min(58, 58 * 640 / ctx.measureText(l1).width);
  txt(l1, -300, -40, s1, C.navy, 900, 'left');
  txt(l2, -300, 26, 44, C.red, 800, 'left');
  if (l3) txt(l3, -300, 82, 36, C.navy, 700, 'left');
  ctx.restore();
}
function chip(t, a, label, x, y, o = {}) {
  if (t < a) return;
  const p = eback(P(t, a, a + .35)), out = o.out ? P(t, o.out - .25, o.out) : 0; if (out >= 1) return;
  ctx.save(); ctx.globalAlpha = clamp(p * 1.5) * (1 - out); ctx.translate(x + (1 - clamp(p)) * -120, y); ctx.scale(lerp(.8, 1, clamp(p)), lerp(.8, 1, clamp(p)));
  font(o.size || 46, 800); const w = ctx.measureText(label).width + 110;
  shadow(20, 8, 'rgba(0,0,0,.35)'); fillRR(0, -40, w, 80, 40, o.bg || '#fff'); noShadow();
  circle(42, 0, 24, o.dot || C.red); check(42, 0, 18, o.dot || C.red, 1);
  txt(label, 78, 2, o.size || 46, o.col || C.navy, 800, 'left');
  ctx.restore();
}
function statCard(t, a, x, y, big, small, icon) {
  if (t < a) return;
  const p = eback(P(t, a, a + .4));
  ctx.save(); ctx.globalAlpha = clamp(p * 1.4); ctx.translate(x, y); ctx.scale(p, p);
  shadow(30, 12, 'rgba(0,0,0,.4)'); fillRR(-215, -150, 430, 300, 34, '#fff'); noShadow();
  circle(0, -70, 52, icon === 'r' ? C.red : C.blue); drawIcon(icon, 0, -70);
  txt(big, 0, 30, big.length > 8 ? 46 : 64, C.navy, 900); txt(small, 0, 92, 30, C.red, 800);
  ctx.restore();
}
function drawIcon(kind, x, y) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (kind === 'loja') { ctx.fillRect(-26, -6, 52, 30); ctx.beginPath(); ctx.moveTo(-32, -6); ctx.lineTo(-24, -26); ctx.lineTo(24, -26); ctx.lineTo(32, -6); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.blue; ctx.fillRect(-8, 6, 16, 18); }
  else if (kind === 'r') { ctx.beginPath(); ctx.roundRect(-28, -12, 56, 32, [4, 4, 12, 12]); ctx.fill(); ctx.fillRect(-36, -18, 72, 8); ctx.fillRect(28, -16, 18, 6); }
  else if (kind === 'cd') { ctx.fillRect(-34, -16, 40, 30); ctx.fillRect(8, -6, 24, 20); circle(-20, 18, 7, '#fff'); circle(22, 18, 7, '#fff'); }
  else { ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(0, -28); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill(); ctx.fillRect(-22, -2, 44, 28); ctx.fillStyle = C.blue; ctx.fillRect(-7, 8, 14, 18); }
  ctx.restore();
}
function drawLogo(x, y, d, a = 1) { if (!IMG.logo || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; shadow(30, 12, 'rgba(0,0,0,.35)'); ctx.drawImage(IMG.logo, x - d / 2, y - d / 2, d, d); noShadow(); ctx.restore(); }
function watermark(t) {
  const a = P(t, .2, .6) * (1 - P(t, 56.0, 56.4));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; drawLogo(970, 268, 132); ctx.restore();
}
function flash(t, at, d = .35) { const f = 1 - Math.abs(t - at) / d; if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); } }

/* ---------- cenas ---------- */
function sceneMap(t, mode) {
  cearaMap(t);
  const pin = (id, col, s, a = 1) => { if (a <= 0) return; const [x, y] = mp(CITIES[id]); ctx.save(); ctx.globalAlpha *= a; for (let k = 0; k < 2; k++) { const q = ((t * .9) + k * .5) % 1; ring(x, y, 10 + q * 50, `rgba(226,35,26,${.6 * (1 - q)})`, 4); } pinIcon(x, y, col, s); ctx.restore(); };
  const label = (id, s, dx = 46, a = 1) => { if (a <= 0) return; const [x, y] = mp(CITIES[id]); ctx.save(); ctx.globalAlpha *= a; font(34, 800); const w = ctx.measureText(s).width + 36; shadow(12, 4); fillRR(x + dx, y - 70, w, 56, 28, C.navy); noShadow(); txt(s, x + dx + 18, y - 41, 34, '#fff', 800, 'left'); ctx.restore(); };
  if (mode === 'pompeu') {
    // rota Juazeiro -> Iguatu -> Senador Pompeu, com caminhão
    const pts = ['juazeiro', 'iguatu', 'pompeu'].map(k => mp(CITIES[k]));
    const p = eio(P(t, 45.1, 46.6));
    ctx.save(); ctx.setLineDash([4, 16]); ctx.lineCap = 'round'; ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.lineTo(...pts[2]); ctx.stroke(); ctx.restore();
    const L1 = pts[1][1] - pts[0][1], tot = Math.abs(L1) + Math.abs(pts[2][1] - pts[1][1]);
    let d = p * tot, x, y; if (d <= Math.abs(L1)) { const q = d / Math.abs(L1); x = lerp(pts[0][0], pts[1][0], q); y = lerp(pts[0][1], pts[1][1], q); } else { const q = (d - Math.abs(L1)) / (tot - Math.abs(L1)); x = lerp(pts[1][0], pts[2][0], q); y = lerp(pts[1][1], pts[2][1], q); }
    pin('iguatu', C.blue, .8); pin('juazeiro', C.blue, .8);
    pin('pompeu', C.red, eback(P(t, 46.4, 46.8)) * 1.0, P(t, 46.4, 46.5));
    label('pompeu', 'Senador Pompeu', 46, P(t, 46.5, 46.8));
    truck(x + 70, y, .9, 0);
    const b = eback(P(t, 45.05, 45.45));
    if (b > 0) { ctx.save(); ctx.translate(540, 1470); ctx.scale(b, b); shadow(30, 12); fillRR(-300, -70, 600, 140, 70, C.red); noShadow(); txt('AGOSTO DE 2026', 0, 4, 54, '#fff', 900); ctx.restore(); }
  } else {
    const ap = k => eback(P(t, 51.9 + k * .25, 52.25 + k * .25));
    pin('iguatu', C.red, ap(0)); pin('juazeiro', C.red, ap(1)); pin('pompeu', C.red, ap(2));
    label('iguatu', 'Iguatu · 1', 46, P(t, 52.1, 52.4)); label('juazeiro', 'Juazeiro do Norte · 2', 46, P(t, 52.35, 52.65)); label('pompeu', 'Senador Pompeu · 1', 46, P(t, 52.6, 52.9));
    // 5ª loja: pino "?" que salta pelo mapa
    const q = P(t, 53.1, 53.4);
    if (q > 0) {
      const spots = [[-38.6, -4.2], [-40.3, -3.7], [-38.95, -6.0], [-40.6, -5.2], [-39.6, -4.9]];
      const k = Math.floor((t - 53.1) / .55) % spots.length, f = ((t - 53.1) / .55) % 1;
      const A = mp(spots[k]), B = mp(spots[(k + 1) % spots.length]); const e = eio(clamp(f * 1.6));
      const x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], e) - Math.sin(e * Math.PI) * 60;
      ctx.save(); ctx.globalAlpha = q; ctx.translate(x, y); const s = 1.3 * eback(q) * (1 + .06 * Math.sin(t * 9));
      ctx.scale(s, s); shadow(16, 6, 'rgba(0,0,0,.4)');
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, -26, -34, -40, -34, -62); ctx.arc(0, -62, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 18, -26, 0, 0); ctx.closePath(); ctx.fillStyle = C.blue; ctx.fill(); noShadow();
      txt('?', 0, -60, 46, '#fff', 900); ctx.restore();
    }
    const o = eback(P(t, 54.45, 54.8));
    if (o > 0 && t < 55.05) { ctx.save(); ctx.translate(540, 1470); ctx.scale(o, o); shadow(30, 12); fillRR(-210, -80, 420, 160, 80, C.blue); noShadow(); txt('Onde?', 0, 4, 84, '#fff', 900); ctx.restore(); }
  }
}
function sceneShop(t) {
  SCENES.iguatu(t, 1);
  darken(.35);
  const p = eback(P(t, 10.85, 11.3));
  ctx.save(); ctx.translate(540, 1380); ctx.scale(p * 1.25, p * 1.25); lojinha2002(0, 0, 1, eio(P(t, 12.3, 13.0))); ctx.restore();
  // calendário
  const c = eback(P(t, 10.8, 11.2));
  if (c > 0) {
    ctx.save(); ctx.translate(540, 680); ctx.scale(c, c); ctx.rotate((1 - clamp(c)) * .2);
    shadow(30, 12, 'rgba(0,0,0,.4)'); fillRR(-210, -170, 420, 340, 30, '#fff'); noShadow();
    fillRR(-210, -170, 420, 100, [30, 30, 0, 0], C.red); txt('JANEIRO', 0, -118, 50, '#fff', 900);
    txt('2002', 0, 30, 130, C.navy, 900); txt('1ª loja de varejo', 0, 122, 34, C.red, 800);
    for (const dx of [-120, 120]) fillRR(dx - 10, -190, 20, 50, 10, C.navy);
    ctx.restore();
  }
}
function sceneEnd(t) {
  sky(t);
  hills(1250, 80, K.serra1, 2.2, t * 8); hills(1400, 60, K.serra2, .9, t * 14);
  ctx.fillStyle = K.sand; ctx.fillRect(0, 1500, W, 420);
  mandacaru(140, 1700, 1.0, t); carnauba(960, 1720, 1.0, t);
  const lp = eback(P(t, 56.4, 56.9));
  for (let k = 0; k < 2; k++) { const p = P(t, 56.4 + k * .15, 57.5 + k * .15); if (p > 0 && p < 1) ring(540, 860, 300 + eo(p) * 380, `rgba(255,255,255,${.7 * (1 - p)})`, 10 * (1 - p) + 2); }
  ctx.save(); ctx.translate(540, 860); ctx.rotate((1 - clamp(lp)) * .3); drawLogo(0, 0, 640 * lp, clamp(lp * 1.4)); ctx.restore();
  const a = eback(P(t, 57.7, 58.1));
  if (a > 0) { ctx.save(); ctx.translate(540, 1300); ctx.scale(a, a); font(66, 900); const w = ctx.measureText('Sua casa merece Corbã.').width + 100;
    shadow(30, 12); fillRR(-w / 2, -64, w, 128, 64, C.red); noShadow(); txt('Sua casa merece Corbã.', 0, 4, 66, '#fff', 900); ctx.restore(); }
}

/* ---------- linha do tempo ---------- */
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.navy2; ctx.fillRect(0, 0, W, H);
  // 1. fachada real (abertura)
  if (t < 5.9) { clip('intro', t, 1, lerp(1, 1.06, P(t, 0, 5.7))); bottomFade(.35); }
  // 2. Iguatu ilustrado
  if (t >= 5.45 && t < 7.9) { ctx.save(); ctx.globalAlpha = P(t, 5.45, 5.75); SCENES.iguatu(t, eio(P(t, 5.5, 7.9))); ctx.restore(); }
  if (t >= 5.6 && t < 7.9) { const p = eback(P(t, 6.0, 6.4)); if (p > 0) { ctx.save(); ctx.translate(540, 1090); ctx.scale(p, p); pinIcon(0, 0, C.red, 1.4); ctx.restore(); } }
  // 3. fábrica
  if (t >= 7.5 && t < 9.1) { clip('galpoes', t, clipA('galpoes', t, .25, .2)); }
  if (t >= 8.9 && t < 10.95) { clip('esteira', t, clipA('esteira', t, .2, .2)); }
  if (t >= 7.6 && t < 10.9) { bottomFade(.7); chip(t, 8.0, 'Indústria de alumínio', 80, 1350, { out: 10.75, dot: C.blue }); }
  // 4. 2002 – primeira loja
  if (t >= 10.7 && t < 14.3) { ctx.save(); ctx.globalAlpha = P(t, 10.7, 10.95) * (1 - P(t, 14.05, 14.3)); sceneShop(t); ctx.restore(); }
  // 5. hoje: números
  if (t >= 14.0 && t < 20.2) {
    clip('embalagem', t, clipA('embalagem', t, .3, .3)); ctx.save(); ctx.globalAlpha = clipA('embalagem', t, .3, .3); darken(.55);
    statCard(t, 14.92, 300, 860, '4 lojas', 'em 3 cidades', 'loja'); statCard(t, 15.6, 780, 860, 'Fabricação', 'própria', 'r');
    statCard(t, 16.77, 300, 1200, 'Centro de', 'distribuição', 'cd'); statCard(t, 17.95, 780, 1200, 'Variedade', 'para o lar', 'casa');
    ctx.restore();
  }
  // 6. loja de Iguatu
  if (t >= 19.9 && t < 23.85) { clip('fachada', t, clipA('fachada', t, .3, .25)); addressCard(t, 20.1, 23.7, 'Rua Santos Dumont', 'Centro', 'Iguatu – CE'); }
  // 7. interior
  if (t >= 23.6 && t < 29.85) { clip('interior', t, clipA('interior', t, .25, .25)); bottomFade(.6);
    const it = [['Panelas de fabricação própria', 23.76], ['Utensílios de cozinha', 25.43], ['Organização', 26.77], ['Decoração', 27.77], ['Cama, mesa e banho', 28.44]];
    it.forEach(([s, a], i) => chip(t, a, s, 70, 1000 + i * 100, { out: 29.75, size: 42, dot: i === 0 ? C.red : C.blue })); }
  if (t >= 29.6 && t < 33.95) { clip('corredor', t, clipA('corredor', t, .25, .3)); bottomFade(.6);
    chip(t, 29.75, 'Produtos nacionais', 70, 1200, { out: 33.85, dot: C.blue }); chip(t, 31.0, 'Artigos que vêm da China', 70, 1310, { out: 33.85, dot: C.red }); }
  // 8. Juazeiro
  if (t >= 33.7 && t < 35.65) { ctx.save(); ctx.globalAlpha = P(t, 33.7, 34.0) * (1 - P(t, 35.35, 35.65)); SCENES.juazeiro(t, eio(P(t, 33.7, 35.6))); ctx.restore(); }
  if (t >= 35.3 && t < 39.1) { clip('mundo', t, clipA('mundo', t, .3, .2)); addressCard(t, 36.0, 38.85, 'Atacarejo', 'Av. Padre Cícero', 'São José · Juazeiro do Norte'); }
  if (t >= 38.8 && t < 41.65) { clip('saopedro', t, clipA('saopedro', t, .2, .25)); addressCard(t, 38.85, 41.5, 'Rua São Pedro', 'Salesianos', 'Juazeiro do Norte'); }
  if (t >= 41.4 && t < 45.15) { clip('cd', t, clipA('cd', t, .25, .3)); bottomFade(.6); chip(t, 41.55, 'Centro de distribuição', 70, 1260, { out: 45.0, dot: C.red }); chip(t, 43.0, 'Atende o atacado', 70, 1370, { out: 45.0, dot: C.blue }); }
  // 9. Senador Pompeu
  if (t >= 44.9 && t < 47.05) { ctx.save(); ctx.globalAlpha = P(t, 44.9, 45.2) * (1 - P(t, 46.8, 47.05)); sceneMap(t, 'pompeu'); ctx.restore(); }
  if (t >= 46.8 && t < 48.7) { ctx.save(); ctx.globalAlpha = P(t, 46.8, 47.1) * (1 - P(t, 48.4, 48.7)); SCENES.pompeu(t, eio(P(t, 46.8, 48.7))); ctx.restore(); }
  if (t >= 48.4 && t < 51.95) { clip('pompeu', t, clipA('pompeu', t, .3, .3)); addressCard(t, 48.6, 51.8, 'Av. Francisco França Cambraia', 'Centro', 'Senador Pompeu – CE'); }
  // 10. quinta loja
  if (t >= 51.7 && t < 56.45) { ctx.save(); ctx.globalAlpha = P(t, 51.7, 52.0) * (1 - P(t, 56.2, 56.45)); sceneMap(t, 'final'); ctx.restore(); }
  // 11. final
  if (t >= 56.2) { ctx.save(); ctx.globalAlpha = P(t, 56.2, 56.5); sceneEnd(t); ctx.restore(); }
  flash(t, 5.55, .3);
  watermark(t);
  // textos (sincronizados com a fala)
  headline(t, 0.05, 1.75, [[['Você já entrou numa']], [['loja '], ['Corbã?', C.red]]]);
  headline(t, 1.8, 5.45, [[['Essa história começou']], [['muito antes', C.red]]]);
  headline(t, 5.65, 7.6, [[['Iguatu', C.red], [' · Ceará']]]);
  headline(t, 7.65, 10.7, [[['Começou na indústria,']], [['fabricando '], ['alumínio', C.red]]]);
  headline(t, 14.25, 19.9, [[['Hoje, a '], ['Corbã', C.red], [' reúne']]]);
  headline(t, 23.0, 24.4, [[['Bora '], ['entrar?', C.red]]], { size: 84 });
  headline(t, 33.85, 35.6, [[['Juazeiro do Norte']], [['duas lojas', C.red]]], { y: 1390 });
  headline(t, 46.85, 48.5, [[['Senador Pompeu']], [['a '], ['quarta loja', C.red]]], { y: 1420 });
  headline(t, 51.75, 53.05, [[['E essa história']], [['continua...', C.red]]]);
  headline(t, 53.08, 54.4, [[['A '], ['5ª loja', C.red], [' vem aí!']]]);
  headline(t, 55.05, 56.3, [[['A gente conta']], [['em breve!', C.red]]]);
}
window.renderFrame = renderFrame; window.DUR = DUR; window.FPS = FPS;
if (/render/.test(location.search)) document.body.classList.add('render');
