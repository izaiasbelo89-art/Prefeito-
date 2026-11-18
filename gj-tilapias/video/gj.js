'use strict';
/* GJ Tilápias e Frutos do Mar — vídeo vertical 9:16 (1080x1920), 41 s.
   Sincronizado com a locução (audio/locucao-gj-tilapias.wav, 39,5 s).
   Toda a animação é função pura do tempo: renderFrame(t). */
const W = 1080, H = 1920, FPS = 30, DUR = 41.0;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

const C = {
  navy: '#0A1F7A', navy2: '#06134F', blue: '#1D3FB5', blue2: '#3D66E0', sky: '#DCE7FB',
  red: '#D7141A', red2: '#FF4A4F', cream: '#F7F4EC', white: '#FFFFFF', ink: '#0B1640',
  gray: '#8C97B3', gold: '#E2A447', gold2: '#B9741F', green: '#1FAF5A', green2: '#25D366',
};

/* ---------- imagens ---------- */
const IMG = {};
const SRC = {
  logo: '../assets/logo.png', fachada: '../assets/fotos/fachada.png', caminhao: '../assets/fotos/caminhao-recorte.png',
  mapa: '../assets/mapas/como-chegar-sem-rota.png', satA: '../assets/mapas/satelite-bairro.png', satB: '../assets/mapas/satelite-zoom.png',
};
window.ready = Promise.all([
  ...Object.entries(SRC).map(([k, s]) => new Promise(res => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => res(); i.src = s; })),
  document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter'), document.fonts.load('600 60px Inter'),
]).catch(() => {});

/* ---------- utilidades ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = .3, fo = .3) => Math.min(P(t, a, a + fi), 1 - P(t, b - fo, b));
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const TAU = Math.PI * 2;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function strokeRR(x, y, w, h, r, c, lw) { rr(x, y, w, h, r); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function shadow(b, oy, c = 'rgba(6,19,79,.25)') { ctx.shadowColor = c; ctx.shadowBlur = b; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0; }
function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function ring(x, y, r, c, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function font(s, w = 800) { ctx.font = `${w} ${s}px Inter, "DejaVu Sans", sans-serif`; }
function txt(s, x, y, size, col, w = 800, al = 'center') { font(size, w); ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
function line(x1, y1, x2, y2, c, lw) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
function check(x, y, r, bg = C.green, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, 0, r, bg);
  ctx.beginPath(); ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .35); ctx.lineTo(r * .48, -r * .32);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
// imagem cobrindo a tela com zoom em torno de um ponto da imagem (fx,fy) posicionado em (sx,sy)
function imgCover(img, s, fx, fy, sx = 540, sy = 960, alpha = 1) {
  if (!img) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(sx, sy); ctx.scale(s, s); ctx.translate(-fx, -fy); ctx.drawImage(img, 0, 0); ctx.restore();
}

/* ---------- ilustrações ---------- */
function fishPath(L) {
  ctx.beginPath();
  ctx.moveTo(L * .5, L * .02);
  ctx.quadraticCurveTo(L * .38, -L * .30, 0, -L * .30);
  ctx.quadraticCurveTo(-L * .28, -L * .28, -L * .40, -L * .06);
  ctx.lineTo(-L * .40, L * .06);
  ctx.quadraticCurveTo(-L * .26, L * .27, 0, L * .26);
  ctx.quadraticCurveTo(L * .38, L * .25, L * .5, L * .02);
  ctx.closePath();
}
function fish(x, y, L, o = {}) {
  const cooked = o.cooked;
  const body = cooked ? C.gold : '#8EA4BC', dark = cooked ? C.gold2 : '#5D7591', belly = cooked ? '#F2C77A' : '#D5E0EC';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.a || 0); if (o.flip) ctx.scale(-1, 1);
  const wag = Math.sin((o.t || 0) * 12) * (o.wag || 0);
  // cauda
  ctx.save(); ctx.translate(-L * .38, 0); ctx.rotate(wag * .3);
  ctx.beginPath(); ctx.moveTo(0, -L * .06); ctx.quadraticCurveTo(-L * .12, -L * .2, -L * .22, -L * .24); ctx.quadraticCurveTo(-L * .15, 0, -L * .22, L * .22); ctx.quadraticCurveTo(-L * .12, L * .18, 0, L * .06); ctx.closePath();
  ctx.fillStyle = dark; ctx.fill(); ctx.restore();
  // nadadeira dorsal
  ctx.beginPath(); ctx.moveTo(-L * .26, -L * .25);
  for (let i = 0; i <= 8; i++) { const px = lerp(-L * .26, L * .2, i / 8); ctx.lineTo(px, -L * (.27 + (i % 2 ? .12 : .02) * Math.sin(Math.PI * i / 8 + .3))); }
  ctx.lineTo(L * .22, -L * .27); ctx.closePath(); ctx.fillStyle = dark; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L * .1, L * .22); ctx.lineTo(-L * .2, L * .34); ctx.lineTo(L * .05, L * .25); ctx.closePath(); ctx.fill();
  // corpo
  fishPath(L);
  const g = ctx.createLinearGradient(0, -L * .3, 0, L * .26); g.addColorStop(0, dark); g.addColorStop(.45, body); g.addColorStop(1, belly);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); fishPath(L); ctx.clip();
  if (cooked) { for (let i = -3; i <= 3; i++) { ctx.save(); ctx.translate(i * L * .13, 0); ctx.rotate(.5); fillRR(-L * .015, -L * .4, L * .03, L * .8, 4, 'rgba(110,55,10,.55)'); ctx.restore(); } }
  else { for (let i = -2; i <= 2; i++) fillRR(i * L * .12 - L * .025, -L * .3, L * .05, L * .38, 6, 'rgba(40,60,90,.18)'); }
  ctx.restore();
  // guelra, olho, boca
  ctx.beginPath(); ctx.arc(L * .24, 0, L * .14, -1.2, 1.2); ctx.strokeStyle = dark; ctx.lineWidth = L * .018; ctx.stroke();
  circle(L * .36, -L * .07, L * .05, '#fff'); circle(L * .37, -L * .07, L * .028, C.ink);
  line(L * .44, L * .06, L * .5, L * .04, dark, L * .016);
  if (o.pectoral !== false) { ctx.beginPath(); ctx.moveTo(L * .16, L * .04); ctx.quadraticCurveTo(L * .02, L * .1 + wag * L * .05, L * .04, L * .17); ctx.quadraticCurveTo(L * .12, L * .12, L * .16, L * .04); ctx.fillStyle = dark; ctx.fill(); }
  ctx.restore();
}
function lemon(x, y, r) {
  circle(x, y, r, '#F5D63D'); circle(x, y, r * .82, '#FFF2A6');
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(x, y, x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, '#F5D63D', r * .08); }
}
function leaf(x, y, s, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 18 * s, 7 * s, 0, 0, TAU); ctx.fillStyle = '#3E9B4F'; ctx.fill(); ctx.restore(); }
function fillet(x, y, s, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, 0); ctx.bezierCurveTo(-80, -42, 40, -46, 90, -10); ctx.bezierCurveTo(100, 10, 60, 40, -10, 36); ctx.bezierCurveTo(-60, 32, -96, 22, -90, 0); ctx.closePath();
  const g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#F3C46A'); g.addColorStop(1, '#C98428'); ctx.fillStyle = g; ctx.fill();
  for (let i = 0; i < 9; i++) circle(-60 + rnd(i) * 130, -20 + rnd(i + 5) * 40, 4 + rnd(i + 2) * 5, 'rgba(150,80,15,.35)');
  ctx.restore();
}
function shrimp(x, y, s, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  for (let i = 0; i < 7; i++) { const ang = Math.PI * (1.1 - i * .17), r = 46; const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
    circle(px, py, 24 - i * 2.4, i % 2 ? '#FF7B54' : '#FF936F'); }
  ctx.beginPath(); ctx.moveTo(40, -18); ctx.lineTo(70, -40); ctx.lineTo(62, -8); ctx.closePath(); ctx.fillStyle = '#E8603A'; ctx.fill();
  line(-46, -10, -90, -50, '#E8603A', 3); line(-46, -4, -96, -30, '#E8603A', 3); circle(-40, -8, 4, C.ink);
  ctx.restore();
}
function mussel(x, y, s, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 54, 26, 0, 0, TAU); ctx.fillStyle = '#1B2350'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -2, 42, 17, 0, 0, TAU); ctx.fillStyle = '#F29A5B'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 54, 26, 0, 0, TAU); ctx.strokeStyle = '#3B4A8C'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function pan(x, y, s, t, heat = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // chamas
  for (let i = 0; i < 7; i++) { const fx = -150 + i * 50, h = 30 + 14 * Math.sin(t * 14 + i * 2);
    ctx.beginPath(); ctx.moveTo(fx - 14, 112); ctx.quadraticCurveTo(fx, 112 - h * 2 * heat, fx + 14, 112); ctx.fillStyle = i % 2 ? '#3D7BFF' : '#7FB0FF'; ctx.fill(); }
  fillRR(-210, 110, 420, 26, 12, '#2B3242');
  // cabo
  fillRR(190, 10, 240, 34, 17, '#1C2230');
  // panela (vista lateral)
  ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.lineTo(176, 92); ctx.quadraticCurveTo(170, 108, 150, 108); ctx.lineTo(-150, 108); ctx.quadraticCurveTo(-170, 108, -176, 92); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, 108); g.addColorStop(0, '#454E63'); g.addColorStop(1, '#1F2533'); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 200, 34, 0, 0, TAU); ctx.fillStyle = '#2E3546'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 4, 182, 26, 0, 0, TAU); ctx.fillStyle = '#151A26'; ctx.fill();
  ctx.restore();
}
function steam(x, y, s, t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a * .7; ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = (t * .6 + i / 3) % 1; ctx.globalAlpha = a * .7 * Math.sin(ph * Math.PI);
    ctx.beginPath(); const bx = x + (i - 1) * 90 * s; for (let k = 0; k <= 20; k++) { const yy = y - k * 8 * s - ph * 80 * s; const xx = bx + Math.sin(k * .5 + t * 3 + i) * 16 * s; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
function bubbles(t, n = 18, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) { const sp = 60 + rnd(i) * 120, x = rnd(i + 3) * W + Math.sin(t * 1.5 + i) * 20, y = H - ((t * sp + rnd(i + 7) * H) % (H + 100));
    ring(x, y, 6 + rnd(i + 1) * 14, 'rgba(255,255,255,.25)', 3); }
  ctx.restore();
}
function oceanBG(t, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.blue); g.addColorStop(1, C.navy2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha *= .12; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(200 + i * 200 + Math.sin(t * .4 + i) * 40, -100); ctx.rotate(.25); ctx.fillStyle = '#fff'; ctx.fillRect(-30, 0, 60 + i * 10, 2200); ctx.restore(); }
  ctx.restore();
  bubbles(t, 18, alpha);
  waves(t, 1700, alpha);
}
function waves(t, y0, alpha = 1, cols = ['rgba(255,255,255,.10)', 'rgba(255,255,255,.16)']) {
  ctx.save(); ctx.globalAlpha *= alpha;
  cols.forEach((c, k) => { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y0 + k * 60 + Math.sin(x / 120 + t * (1.4 + k * .5) + k) * 18); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); });
  ctx.restore();
}
function creamBG(t) {
  ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .06; for (let i = 0; i < 6; i++) fish(((i * 260 + t * 50) % 1500) - 200, 300 + i * 260, 180, { t, flip: i % 2 === 1 }); ctx.restore();
  waves(t, 1640, 1, ['rgba(10,31,122,.10)', 'rgba(10,31,122,.18)']);
}

/* ---------- textos ---------- */
function headline(t, a, b, lines, o = {}) {
  if (t < a || t > b) return;
  const pin = eo(P(t, a, a + .3)), pout = eio(P(t, b - .25, b)), alpha = pin * (1 - pout);
  let size = o.size || 74; font(size, 900);
  const meas = () => lines.map(l => l.reduce((s, [tx]) => s + ctx.measureText(tx).width, 0));
  let widths = meas(); if (Math.max(...widths) > 880) { size = Math.floor(size * 880 / Math.max(...widths)); font(size, 900); widths = meas(); }
  const lh = size * 1.18, cw = Math.max(...widths) + 96, ch = lines.length * lh + 60, cy = o.y || 420;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(540, cy + (1 - pin) * 34 - pout * 20); const sc = lerp(.92, 1, eback(pin)); ctx.scale(sc, sc);
  shadow(34, 14, 'rgba(6,19,79,.35)'); fillRR(-cw / 2, -ch / 2, cw, ch, 30, '#fff'); noShadow();
  fillRR(-46, -ch / 2 - 8, 92, 16, 8, C.red);
  lines.forEach((l, i) => {
    const lp = eo(P(t, a + .08 + i * .12, a + .45 + i * .12));
    let x = -widths[i] / 2; const y = -ch / 2 + 30 + lh * (i + .5);
    ctx.save(); ctx.globalAlpha = alpha * lp; ctx.translate(0, (1 - lp) * 24); font(size, 900); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [tx, col] of l) { ctx.fillStyle = col || C.navy; ctx.fillText(tx, x, y + 2); x += ctx.measureText(tx).width; }
    ctx.restore();
  });
  ctx.restore();
}
function credit(s, a = 1) { ctx.save(); ctx.globalAlpha = a; font(22, 600); const w = ctx.measureText(s).width + 24; fillRR(540 - w / 2, 1462, w, 34, 17, 'rgba(6,19,79,.55)'); txt(s, 540, 1480, 22, '#fff', 600); ctx.restore(); }
function drawLogo(cx, cy, d, a = 1) { if (!IMG.logo || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; shadow(40, 16, 'rgba(6,19,79,.4)'); ctx.drawImage(IMG.logo, cx - d / 2, cy - d / 2, d, d * IMG.logo.height / IMG.logo.width); noShadow(); ctx.restore(); }

/* =====================================================================
   LINHA DO TEMPO (segundos da locução)
   ===================================================================== */
const T = { fish: 3.75, prod: 8.9, sat: 15.2, map: 17.3, merc: 21.7, fac: 24.3, addr: 27.9, wpp: 32.8, end: 37.65 };

/* ---- 1. "Já sabe o que vai pra panela hoje?" / "Se bateu vontade de comer peixe, vem pra GJ Tilápias!" ---- */
function sceneKitchen(t) {
  // fundo: azulejo de cozinha em tons de azul
  ctx.fillStyle = '#EAF0FB'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(29,63,181,.10)'; ctx.lineWidth = 4;
  for (let x = 0; x <= W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1340); ctx.stroke(); }
  for (let y = 0; y <= 1340; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = '#C9D6EE'; ctx.fillRect(0, 1340, W, 30); ctx.fillStyle = '#DDE5F4'; ctx.fillRect(0, 1370, W, 600);
  const zoom = lerp(1, 1.08, P(t, 0, T.fish)) * (t > T.fish ? 1 + .04 * Math.exp(-(t - T.fish - .25) * 4) * P(t, T.fish + .15, T.fish + .3) : 1);
  ctx.save(); ctx.translate(540, 1100); ctx.scale(zoom, zoom); ctx.translate(-540, -1100);
  // panela
  const bounce = t < T.fish ? Math.abs(Math.sin(t * 3)) * 6 : 0;
  steam(470, 1020, 1.6, t, t < T.fish ? .8 : 1);
  // peixe salta para a panela
  if (t > T.fish - .25 && t < T.fish + 3.4) {
    const p = P(t, T.fish - .25, T.fish + .45);
    const x = lerp(1250, 490, p), y = lerp(1250, 1048, p) - Math.sin(p * Math.PI) * 560, a = lerp(-.9, .35, p);
    if (p < 1) fish(x, y, 380, { t, a, wag: 1 });
    else fish(490, 1048 + Math.sin(t * 20) * 2 * Math.exp(-(t - T.fish - .45) * 2), 380, { t, a: .0, cooked: P(t, T.fish + .6, T.fish + 2.2) > .5 ? true : false, wag: .1 });
  }
  pan(470, 1090 - bounce, 1.5, t);
  // chiado: gotículas
  if (t > T.fish + .4 && t < T.fish + 2.5) for (let i = 0; i < 12; i++) { const ph = ((t - T.fish) * 2 + rnd(i)) % 1; const a = -Math.PI * (.2 + rnd(i + 3) * .6);
    circle(470 + Math.cos(a) * (150 + ph * 200) * (i % 2 ? 1 : -1), 1050 + Math.sin(a) * ph * 260, 6 * (1 - ph), '#FFD48A'); }
  ctx.restore();
  // pergunta
  if (t < T.fish + .2) { const s = eback(P(t, .35, .7)) * (1 - P(t, T.fish - .1, T.fish + .1)); ctx.save(); ctx.translate(800, 820 + Math.sin(t * 3) * 8); ctx.scale(s, s); shadow(20, 8); circle(0, 0, 80, '#fff'); noShadow(); txt('?', 0, 6, 110, C.red, 900); ctx.restore(); }
  // GJ entra
  const lp = eback(P(t, 6.55, 7.0));
  if (lp > 0) { ctx.save(); ctx.globalAlpha = clamp(lp * 1.5) * (1 - P(t, 8.65, 8.95)); ctx.fillStyle = 'rgba(10,31,122,.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    for (let k = 0; k < 2; k++) { const p = P(t, 6.55 + k * .15, 7.6 + k * .15); if (p > 0 && p < 1) ring(540, 1050, 260 + eo(p) * 420, `rgba(255,255,255,${.6 * (1 - p)})`, 10 * (1 - p) + 2); }
    ctx.save(); ctx.translate(540, 1050); ctx.rotate((1 - clamp(lp)) * -.4); drawLogo(0, 0, 620 * lp, (1 - P(t, 8.65, 8.95))); ctx.restore(); }
}

/* ---- 2. Produtos ---- */
const PRODUCTS = [
  { t: 8.98, title: 'Tilápia inteira', sub: 'pra assar', draw: drawWhole },
  { t: 11.15, title: 'Filé', sub: 'pra fritar', draw: drawFillets },
  { t: 12.35, title: 'Frutos do mar', sub: 'pra caprichar no almoço', draw: drawSeafood },
];
function drawWhole(t, s) {
  ctx.save(); ctx.scale(s, s);
  fillRR(-260, -110, 520, 220, 40, '#C4CDDB'); fillRR(-240, -92, 480, 184, 32, '#E4E9F1');
  fish(0, 0, 400, { cooked: true, pectoral: false });
  lemon(-150, 70, 30); lemon(140, -70, 26); leaf(-60, 82, 1.6, .4); leaf(70, 78, 1.4, -.3); leaf(170, 40, 1.4, .8);
  steam(0, -80, .8, t, .7);
  ctx.restore();
}
function drawFillets(t, s) {
  ctx.save(); ctx.scale(s, s);
  // frigideira vista de cima
  fillRR(170, -24, 230, 48, 24, '#1C2230');
  circle(0, 0, 230, '#2E3546'); circle(0, 0, 208, '#151A26');
  for (let i = 0; i < 14; i++) { const a = rnd(i) * TAU, r = rnd(i + 4) * 180, ph = (t * 3 + rnd(i + 9)) % 1; ring(Math.cos(a) * r, Math.sin(a) * r, 3 + ph * 7, `rgba(255,220,140,${.6 * (1 - ph)})`, 2); }
  fillet(-40, -70, 1.05, .2); fillet(30, 30, 1.1, -.25); fillet(-70, 100, .85, .5);
  lemon(130, -120, 26);
  ctx.restore();
}
function drawSeafood(t, s) {
  ctx.save(); ctx.scale(s, s);
  circle(0, 0, 250, '#fff'); ring(0, 0, 250, '#D9E1EE', 10); circle(0, 0, 200, '#F4F7FC');
  shrimp(-70, -40, 1.2, .2 + Math.sin(t * 2) * .03); shrimp(90, -70, 1.0, -.6); shrimp(30, 90, 1.1, 2.6);
  mussel(-120, 90, .9, .5); mussel(130, 60, .85, -.7); mussel(-20, -150, .7, .1);
  lemon(150, -150, 24); leaf(-170, -20, 1.5, .9);
  ctx.restore();
}
function productCard(t, i, x, y, s) {
  const pr = PRODUCTS[i];
  ctx.save(); ctx.translate(x, y);
  pr.draw(t, s);
  ctx.restore();
}
function sceneProducts(t) {
  oceanBG(t);
  const cur = t < PRODUCTS[1].t ? 0 : (t < PRODUCTS[2].t ? 1 : 2);
  // cartão principal (produto atual)
  PRODUCTS.forEach((pr, i) => {
    const inP = eback(P(t, pr.t - .12, pr.t + .3)), next = PRODUCTS[i + 1];
    const outP = next ? eio(P(t, next.t - .12, next.t + .2)) : 0;
    if (inP <= 0 || outP >= 1) return;
    const x = lerp(1400, 540, clamp(inP)) - outP * 900, y = 1000;
    ctx.save(); ctx.globalAlpha = clamp(inP * 2) * (1 - outP);
    ctx.translate(x, y); ctx.rotate((1 - clamp(inP)) * .25);
    productCard(t, i, 0, 0, lerp(.6, 1, clamp(inP)) * 1.25);
    ctx.restore();
    // título do produto
    const ta = clamp(inP * 1.4) * (1 - outP);
    ctx.save(); ctx.globalAlpha = ta; ctx.translate(lerp(900, 540, eo(clamp(inP))) - outP * 900, 1400);
    font(78, 900); const tw = ctx.measureText(pr.title).width + 80;
    shadow(24, 10, 'rgba(0,0,0,.3)'); fillRR(-tw / 2, -56, tw, 112, 56, C.red); noShadow(); txt(pr.title, 0, 4, 78, '#fff', 900);
    txt(pr.sub, 0, 120, 52, '#fff', 800);
    ctx.restore();
  });
  // contador
  ctx.save(); ctx.globalAlpha = P(t, T.prod, T.prod + .3) * (1 - P(t, 14.75, 15.1));
  for (let i = 0; i < 3; i++) circle(480 + i * 60, 1600, i === cur ? 14 : 9, i === cur ? '#fff' : 'rgba(255,255,255,.4)');
  ctx.restore();
}

/* ---- 3. "E pra chegar é fácil." (satélite) ---- */
const SAT_A_PIN = [362, 470], SAT_B_PIN = [310, 380];
function sceneSatellite(t) {
  oceanBG(t);
  const a = P(t, T.sat, T.sat + .35);
  const cx = 540, cy = 1020, cw = 900, ch = 1000;
  const grow = eio(P(t, 16.9, T.map + .1));
  const x = lerp(cx - cw / 2, 0, grow), y = lerp(cy - ch / 2, 0, grow), w = lerp(cw, W, grow), h = lerp(ch, H, grow), rad = lerp(40, 0, grow);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 1020); const sc = lerp(.85, 1, eback(a)); ctx.scale(sc, sc); ctx.translate(-540, -1020);
  shadow(40, 16, 'rgba(0,0,0,.4)'); fillRR(x - 10, y - 10, w + 20, h + 20, rad + 8, '#fff'); noShadow();
  ctx.save(); rr(x, y, w, h, rad); ctx.clip();
  const p = P(t, T.sat, T.map + .1);
  const sA = lerp(1.7, 4.2, eio(clamp(p / .62)));
  imgCover(IMG.satA, sA, SAT_A_PIN[0], SAT_A_PIN[1] - 20 / sA, cx, cy);
  const bA = P(t, 16.15, 16.55);
  if (bA > 0) { const sB = lerp(1.7, 2.6, eio(P(t, 16.15, T.map + .1))); imgCover(IMG.satB, sB, SAT_B_PIN[0], SAT_B_PIN[1], cx, cy, bA); }
  ctx.restore();
  // pino
  font(20, 600); txt('Imagens: Google', x + w - 20, y + h - 24, 20, 'rgba(255,255,255,.9)', 600, 'right');
  ctx.restore();
  const fl = P(t, T.map - .05, T.map + .1) * (1 - P(t, T.map + .1, T.map + .35));
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
}
function pinIcon(x, y, col) {
  ctx.save(); ctx.translate(x, y);
  shadow(14, 6, 'rgba(0,0,0,.35)');
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, -26, -34, -40, -34, -62); ctx.arc(0, -62, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 18, -26, 0, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); noShadow(); circle(0, -62, 13, '#fff');
  ctx.restore();
}

/* ---- 4. Mapa com o carro ---- */
const ROUTE = [[170, 880], [858, 1117], [874, 1110], [890, 1082], [886, 1068], [795, 962]];
const GJ = [781, 965], MERC = [853, 941];
const ROUTE_T = [17.65, 21.15];
function routeLen() { let L = 0; for (let i = 0; i < ROUTE.length - 1; i++) L += Math.hypot(ROUTE[i + 1][0] - ROUTE[i][0], ROUTE[i + 1][1] - ROUTE[i][1]); return L; }
const RL = routeLen();
function routeAt(d) { // distância -> ponto e ângulo
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const a = ROUTE[i], b = ROUTE[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= l || i === ROUTE.length - 2) { const q = clamp(d / l); return [lerp(a[0], b[0], q), lerp(a[1], b[1], q), Math.atan2(b[1] - a[1], b[0] - a[0]), i]; }
    d -= l;
  }
}
function carProgress(t) { // avenida mais longa: velocidade constante com aceleração suave no início e fim
  return eio(P(t, ROUTE_T[0], ROUTE_T[1]));
}
function car(x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  shadow(8, 3, 'rgba(0,0,0,.35)'); fillRR(-24, -12, 48, 24, 7, C.red); noShadow();
  fillRR(-8, -10, 18, 20, 4, '#FFFFFF'); fillRR(10, -9, 7, 18, 2, '#9FC3F2'); fillRR(-16, -9, 6, 18, 2, '#9FC3F2');
  circle(23, -8, 2.4, '#FFF3B0'); circle(23, 8, 2.4, '#FFF3B0');
  ctx.restore();
}
function mapCam(t) {
  const p = carProgress(t); const [x, y] = routeAt(p * RL);
  let cx = x, cy = y;
  const m = eio(P(t, T.merc, T.merc + .9)); cx = lerp(cx, (GJ[0] + MERC[0]) / 2, m); cy = lerp(cy, (GJ[1] + MERC[1]) / 2, m);
  const z = eio(P(t, T.fac - .45, T.fac + .1));
  let s = 2.0 + z * 2.5;
  cx = lerp(cx, GJ[0], z); cy = lerp(cy, GJ[1], z);
  const hw = W / 2 / s, hh = H / 2 / s;
  // não mostrar fora do recorte do mapa (x 68–1012, y 490–1510)
  cx = clamp(cx, 68 + hw, 1012 - hw); cy = clamp(cy + 60 / s, 490 + hh, 1510 - hh);
  return [cx, cy, s];
}
function sceneMap(t) {
  const [cx, cy, s] = mapCam(t);
  ctx.fillStyle = '#F2EFE9'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 960); ctx.scale(s, s); ctx.translate(-cx, -cy);
  if (IMG.mapa) { ctx.save(); ctx.beginPath(); ctx.rect(68, 490, 944, 1020); ctx.clip(); ctx.drawImage(IMG.mapa, 0, 0); ctx.restore(); }
  const p = carProgress(t), d = p * RL, [x, y, a, seg] = routeAt(d);
  // rota já percorrida
  ctx.beginPath(); ctx.moveTo(ROUTE[0][0], ROUTE[0][1]); for (let i = 1; i <= seg; i++) ctx.lineTo(ROUTE[i][0], ROUTE[i][1]); ctx.lineTo(x, y);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 8; ctx.stroke();
  // rota restante (tracejada)
  ctx.save(); ctx.setLineDash([2, 10]); ctx.beginPath(); ctx.moveTo(x, y); for (let i = seg + 1; i < ROUTE.length; i++) ctx.lineTo(ROUTE[i][0], ROUTE[i][1]);
  ctx.strokeStyle = 'rgba(29,63,181,.6)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  // destaque do mercado
  const mh = win(t, T.merc + .1, T.fac, .3, .3);
  if (mh > 0) { for (let k = 0; k < 2; k++) { const q = ((t - T.merc) * .8 + k * .5) % 1; ring(MERC[0], MERC[1], 10 + q * 40, `rgba(31,175,90,${mh * (1 - q)})`, 4); } }
  // GJ: pino de chegada
  const arr = P(t, ROUTE_T[1] - .05, ROUTE_T[1] + .35);
  if (arr > 0) { for (let k = 0; k < 2; k++) { const q = ((t - ROUTE_T[1]) * .9 + k * .5) % 1; ring(GJ[0], GJ[1], 8 + q * 46, `rgba(215,20,26,${.8 * (1 - q)})`, 4); }
    ctx.save(); ctx.translate(GJ[0], GJ[1] - (1 - eback(arr)) * 40); ctx.scale(.55, .55); pinIcon(0, 0, C.red); ctx.restore(); }
  car(x, y, a, 1.5);
  ctx.restore();
  credit('© OpenStreetMap contributors', 1);
  // chegada: zoom/branco para a fachada
  const fl = P(t, T.fac - .2, T.fac) * (1 - P(t, T.fac, T.fac + .25));
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
}

/* ---- 5. Fachada ---- */
function sceneFacade(t) {
  const img = IMG.fachada; if (!img) return;
  const p = P(t, T.fac, T.addr + .3);
  const s = (H / img.height) * lerp(1.0, 1.12, eio(p));
  imgCover(img, s, img.width / 2, lerp(img.height / 2, 760, eio(p)), 540, 960);
  // seta apontando para a fachada
  const ap = eback(P(t, T.fac + 1.6, T.fac + 2.0));
  if (ap > 0) { ctx.save(); ctx.globalAlpha = clamp(ap) * (1 - P(t, T.addr - .2, T.addr)); ctx.translate(540, 1390 + Math.sin(t * 6) * 10); ctx.scale(ap, ap);
    shadow(20, 8, 'rgba(0,0,0,.4)'); fillRR(-250, -50, 500, 100, 50, C.red); noShadow(); txt('Fachada azul', 0, 3, 50, '#fff', 900); ctx.restore(); }
}

/* ---- 6. Endereço (caminhão em frente à loja) ---- */
function sceneAddress(t) {
  const img = IMG.caminhao; if (!img) return;
  const p = P(t, T.addr, T.wpp + .3);
  const s = (H / img.height) * lerp(1.04, 1.12, p);
  imgCover(img, s, lerp(img.width * .52, img.width * .5, p), img.height * .5, 540, 960);
  const g = ctx.createLinearGradient(0, 1000, 0, 1920); g.addColorStop(0, 'rgba(6,19,79,0)'); g.addColorStop(.35, 'rgba(6,19,79,.75)'); g.addColorStop(1, 'rgba(6,19,79,.95)');
  ctx.fillStyle = g; ctx.fillRect(0, 1000, W, 920);
  const ca = eback(P(t, T.addr + .05, T.addr + .45));
  ctx.save(); ctx.translate(540, 1300); ctx.scale(ca, ca);
  shadow(36, 14, 'rgba(0,0,0,.4)'); fillRR(-450, -190, 900, 380, 40, '#fff'); noShadow();
  fillRR(-450, -190, 900, 22, [40, 40, 0, 0], C.red);
  ctx.save(); ctx.translate(-360, -80); ctx.scale(1.3, 1.3); pinIcon(0, 40, C.red); ctx.restore();
  const l1 = eo(P(t, T.addr + .1, T.addr + .45)), l2 = eo(P(t, 29.95, 30.3)), l3 = eo(P(t, 31.35, 31.7));
  ctx.globalAlpha = l1; txt('Rua Ana Facó, 85', -290, -90 + (1 - l1) * 20, 70, C.navy, 900, 'left');
  ctx.globalAlpha = l2; txt('Álvaro Weyne', -290, 10 + (1 - l2) * 20, 58, C.red, 900, 'left');
  ctx.globalAlpha = l3; txt('Fortaleza – CE', -290, 100 + (1 - l3) * 20, 50, C.navy, 800, 'left');
  ctx.restore();
}

/* ---- 7. WhatsApp ---- */
function waIcon(x, y, r, bg = C.green2) {
  ctx.save(); ctx.translate(x, y);
  circle(0, 0, r, bg);
  ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, TAU); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * .48, r * .38); ctx.lineTo(-r * .6, r * .66); ctx.lineTo(-r * .3, r * .55); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  // fone
  ctx.rotate(-.6); fillRR(-r * .1, -r * .32, r * .2, r * .64, r * .08, '#fff'); fillRR(-r * .2, -r * .36, r * .4, r * .14, r * .06, '#fff'); fillRR(-r * .2, r * .22, r * .4, r * .14, r * .06, '#fff');
  ctx.restore();
}
function sceneWhats(t) {
  oceanBG(t);
  // celular
  const pin = eback(P(t, T.wpp, T.wpp + .45));
  ctx.save(); ctx.translate(540, 970); ctx.scale(pin * .8, pin * .8); ctx.rotate(Math.sin(t * 1.5) * .02);
  shadow(50, 20, 'rgba(0,0,0,.45)'); fillRR(-260, -420, 520, 840, 60, '#0E1430'); noShadow();
  fillRR(-240, -400, 480, 800, 46, '#ECE5DD');
  fillRR(-240, -400, 480, 120, [46, 46, 0, 0], '#075E54');
  if (IMG.logo) { ctx.save(); ctx.beginPath(); ctx.arc(-170, -340, 38, 0, TAU); ctx.clip(); ctx.drawImage(IMG.logo, -208, -378, 76, 76); ctx.restore(); }
  txt('GJ Tilápias', -116, -352, 32, '#fff', 800, 'left'); txt('online', -116, -318, 22, 'rgba(255,255,255,.8)', 600, 'left');
  // mensagem do cliente
  const m1 = eback(P(t, T.wpp + .4, T.wpp + .75));
  if (m1 > 0) { ctx.save(); ctx.translate(90, -170); ctx.scale(m1, m1); shadow(6, 2, 'rgba(0,0,0,.15)'); fillRR(-200, -60, 330, 120, 22, '#DCF8C6'); noShadow();
    txt('Oi! O que tem', -180, -22, 30, C.ink, 700, 'left'); txt('hoje?', -180, 20, 30, C.ink, 700, 'left'); ctx.restore(); }
  // digitando
  const m2 = P(t, T.wpp + 1.0, T.wpp + 1.3);
  if (m2 > 0) { ctx.save(); ctx.globalAlpha = m2; fillRR(-210, -40, 140, 70, 22, '#fff'); for (let i = 0; i < 3; i++) circle(-170 + i * 30, -5, 8 + 3 * Math.max(0, Math.sin(t * 8 - i)), C.gray); ctx.restore(); }
  ctx.restore();
  // número em destaque
  const np = eback(P(t, 35.05, 35.45));
  if (np > 0) {
    const pulse = 1 + .03 * Math.sin((t - 35) * 6) * P(t, 35.5, 35.8);
    ctx.save(); ctx.translate(540, 1395); ctx.scale(np * pulse * .95, np * pulse * .95);
    shadow(30, 12, 'rgba(0,0,0,.45)'); fillRR(-470, -88, 940, 176, 88, C.green); noShadow();
    waIcon(-372, 0, 62, '#fff'); ctx.save(); ctx.translate(-372, 0); waIcon(0, 0, 54, C.green); ctx.restore();
    txt('(85) 99965-8758', 46, 4, 80, '#fff', 900);
    ctx.restore();
  }
}

/* ---- 8. Final ---- */
function sceneEnd(t) {
  creamBG(t);
  const lp = eback(P(t, T.end, T.end + .5));
  for (let k = 0; k < 2; k++) { const p = P(t, T.end + k * .15, T.end + 1.1 + k * .15); if (p > 0 && p < 1) ring(540, 820, 300 + eo(p) * 380, `rgba(10,31,122,${.35 * (1 - p)})`, 10 * (1 - p) + 2); }
  ctx.save(); ctx.translate(540, 820); ctx.rotate((1 - clamp(lp)) * .3); drawLogo(0, 0, 700 * lp, clamp(lp * 1.4)); ctx.restore();
  const a1 = eo(P(t, T.end + .5, T.end + .85));
  ctx.save(); ctx.globalAlpha = a1;
  font(54, 900); const w = 600; shadow(20, 8); fillRR(540 - w / 2, 1262 - 44 + (1 - a1) * 20, w, 88, 44, C.navy); noShadow();
  txt('@gj_tilapias', 540, 1266 + (1 - a1) * 20, 54, '#fff', 900);
  ctx.restore();
  const a2 = eo(P(t, T.end + .8, T.end + 1.15));
  ctx.save(); ctx.globalAlpha = a2; txt('Rua Ana Facó, 85 · Álvaro Weyne', 540, 1380, 38, C.navy, 800); txt('Fortaleza – CE', 540, 1430, 34, C.red, 800); ctx.restore();
}

/* =====================================================================
   RENDER
   ===================================================================== */
let showSafe = false;
function drawSafeZones() { ctx.save(); ctx.fillStyle = 'rgba(255,0,80,.18)'; ctx.fillRect(0, 0, W, 220); ctx.fillRect(0, 1500, W, 420); ctx.fillRect(950, 900, 130, 600); ctx.restore(); }
function cross(t, a, d) { return eio(P(t, a, a + d)); }
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  if (t < T.prod + .3) sceneKitchen(t);
  if (t >= T.prod - .05 && t < T.sat + .4) { ctx.save(); ctx.globalAlpha = cross(t, T.prod - .05, .35); sceneProducts(t); ctx.restore(); }
  if (t >= T.sat && t < T.map + .4) { ctx.save(); ctx.globalAlpha = cross(t, T.sat, .3); sceneSatellite(t); ctx.restore(); }
  if (t >= T.map + .05 && t < T.fac + .3) { ctx.save(); ctx.globalAlpha = cross(t, T.map + .05, .1); sceneMap(t); ctx.restore(); }
  if (t >= T.fac && t < T.addr + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.fac, .15); sceneFacade(t); ctx.restore(); }
  if (t >= T.addr && t < T.wpp + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.addr, .4); sceneAddress(t); ctx.restore(); }
  if (t >= T.wpp && t < T.end + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.wpp, .4); sceneWhats(t); ctx.restore(); }
  if (t >= T.end) { ctx.save(); ctx.globalAlpha = cross(t, T.end, .4); sceneEnd(t); ctx.restore(); }
  // textos sincronizados com a fala
  headline(t, 0.1, 3.7, [[['Já sabe o que vai']], [['pra '], ['panela', C.red], [' hoje?']]]);
  headline(t, 3.85, 6.55, [[['Bateu vontade']], [['de comer '], ['peixe?', C.red]]]);
  headline(t, 6.6, 8.75, [[['Vem pra ']], [['GJ Tilápias!', C.red]]], { y: 400 });
  headline(t, 15.3, 17.35, [[['Pra chegar']], [['é fácil!', C.red]]]);
  headline(t, 17.6, 19.75, [[['Pela ']], [['Av. Francisco Sá', C.red]]]);
  headline(t, 19.75, 21.7, [[['Entre na ']], [['Rua Ana Facó', C.red]]]);
  headline(t, 21.75, 24.3, [[['Perto do Mercado']], [['do Carlito Pamplona', C.red]]]);
  headline(t, 24.4, 27.85, [[['Você vai ver a']], [['fachada azul', C.blue], [' da GJ']]]);
  headline(t, 32.9, 37.6, [[['Quer consultar']], [['o que tem '], ['hoje?', C.red]]]);
  if (showSafe) drawSafeZones();
}
window.renderFrame = renderFrame; window.DUR = DUR; window.FPS = FPS;

if (!/render/.test(location.search)) {
  const btn = document.getElementById('play'), tc = document.getElementById('tc');
  document.getElementById('safe').onchange = e => { showSafe = e.target.checked; };
  const audio = new Audio('out/audio_mix.wav');
  let start = null, playing = false;
  window.ready.then(() => renderFrame(0));
  btn.onclick = () => {
    if (playing) { playing = false; audio.pause(); btn.textContent = '▶ Reproduzir'; return; }
    playing = true; btn.textContent = '❚❚ Pausar'; audio.currentTime = 0; audio.play().catch(() => {}); start = performance.now();
    const loop = now => { if (!playing) return; const t = (now - start) / 1000; if (t > DUR) { playing = false; btn.textContent = '▶ Reproduzir'; return; } renderFrame(t); tc.textContent = t.toFixed(1) + 's'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };
} else { document.body.classList.add('render'); }
