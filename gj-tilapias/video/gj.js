'use strict';
/* GJ Tilápias e Frutos do Mar — vídeo vertical 9:16 (1080x1920), 41 s.
   Sincronizado com a locução (audio/locucao-gj-tilapias.wav, 39,5 s).
   Toda a animação é função pura do tempo: renderFrame(t). */
const W = 1080, H = 1920, FPS = 30, DUR = 40.0;
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
const T = { store: 0, logo: 5.22, prod: 7.55, sat: 13.85, map: 16.05, merc: 20.5, fac: 23.1, addr: 26.7, wpp: 31.55, end: 36.45 };
const DUR2 = 40.0;

/* ---- fachada: coordenadas na foto (941x1672) ---- */
const FAC = { oval: [441, 855], ovalW: 312, sign: [270, 478, 390, 86], door: [445, 1075], fishes: [[668, 805], [652, 848], [668, 887]], sky: 425 };
let SKY = null;
function skyColors() {
  if (SKY || !IMG.fachada) return SKY;
  const c = document.createElement('canvas'); c.width = 941; c.height = 40; const x = c.getContext('2d'); x.drawImage(IMG.fachada, 0, 0);
  const d = x.getImageData(0, 0, 941, 6).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  SKY = `rgb(${r / n | 0},${g / n | 0},${b / n | 0})`; return SKY;
}
function facadeCover(t, zoom, fx, fy, sy = 960) {
  const img = IMG.fachada; if (!img) return 1;
  const s = (H / img.height) * zoom;
  const top = sy - fy * s; if (top > 0) { ctx.fillStyle = skyColors(); ctx.fillRect(0, 0, W, top + 4); }
  imgCover(img, s, fx, fy, 540, sy);
  return s;
}
function facadeOverlays(t, s, fx, fy, sy = 960, o = {}) {
  // desenha por cima da foto, em coordenadas da foto
  ctx.save(); ctx.translate(540, sy); ctx.scale(s, s); ctx.translate(-fx, -fy);
  // nuvens passando no céu
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 941, FAC.sky); ctx.clip(); ctx.filter = 'blur(10px)';
  for (let i = 0; i < 4; i++) { const x = ((i * 330 + t * 22) % 1300) - 250, y = 90 + (i % 2) * 140;
    ctx.globalAlpha = .55; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y, 110, 30, 0, 0, TAU); ctx.ellipse(x + 60, y - 18, 70, 30, 0, 0, TAU); ctx.ellipse(x - 50, y - 8, 60, 24, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
  // brilho correndo pelos letreiros
  const sweep = (a, b, clipFn) => { const p = P(t, a, b); if (p <= 0 || p >= 1) return;
    ctx.save(); clipFn(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const x = lerp(-200, 1100, p); const g = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 941, 1672); ctx.restore(); };
  const sg = FAC.sign, ov = FAC.oval;
  for (const a of (o.signSweeps || [])) sweep(a, a + .9, () => { ctx.beginPath(); ctx.rect(sg[0], sg[1], sg[2], sg[3]); });
  for (const a of (o.ovalSweeps || [])) sweep(a, a + .8, () => { ctx.beginPath(); ctx.ellipse(ov[0], ov[1], FAC.ovalW / 2, 64, 0, 0, TAU); });
  // bolhas saindo dos peixes pintados
  if (o.bubbles) for (const [k, [fx2, fy2]] of FAC.fishes.entries()) for (let i = 0; i < 3; i++) {
    const ph = (t * .7 + k * .33 + i * .33) % 1; ctx.globalAlpha = o.bubbles * Math.sin(ph * Math.PI) * .9;
    ring(fx2 + 28 + Math.sin(ph * 6 + i) * 4, fy2 - 6 - ph * 50, 3 + ph * 4, '#DDF0FF', 1.6); }
  // contorno da fachada
  if (o.outline) { ctx.globalAlpha = o.outline; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 60; strokeRR(44, 424, 830, 784, 8, '#fff', 7); ctx.setLineDash([]); }
  ctx.restore();
}

/* fundo com a fachada da loja desfocada (no lugar de fundos lisos) */
function storeBG(t, dark = .6, light = false) {
  ctx.fillStyle = C.navy2; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(12px)'; facadeCover(t, 1.32 + .04 * Math.sin(t * .3), 470 + Math.sin(t * .25) * 20, 830, 1060); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(6,19,79,${dark * .85})`); g.addColorStop(.5, `rgba(6,19,79,${dark})`); g.addColorStop(1, `rgba(6,19,79,${Math.min(.95, dark + .25)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  bubbles(t, 10, .6);
}

/* ---- 1. Abertura na fachada ---- */
function storeCam(t) { // [zoom, fx, fy]
  const a = eio(P(t, 0, 5.2));
  let z = lerp(1.15, 1.8, a), fx = lerp(470, FAC.oval[0], a), fy = lerp(836, FAC.oval[1], a), sy = lerp(1117, 1090, a);
  const b = eio(P(t, T.logo - .1, T.logo + .55));
  z = lerp(z, 3.0, b); sy = lerp(sy, 1060, b);
  return [z, fx, fy, sy];
}
function sceneStore(t) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const [z, fx, fy, sy0] = storeCam(t);
  const s = facadeCover(t, z, fx, fy, sy0);
  facadeOverlays(t, s, fx, fy, sy0, { signSweeps: [0.9, 3.4], ovalSweeps: [4.4, T.logo], bubbles: P(t, 2.4, 3.0) });
  // a placa oval vira a logo
  const lp = P(t, T.logo + .05, T.logo + .75);
  if (lp > 0 && IMG.logo) {
    const ovalScreenW = FAC.ovalW * s, d0 = ovalScreenW / .87;
    const sx = 540 + (FAC.oval[0] - fx) * s, sy = sy0 + (FAC.oval[1] - fy) * s + d0 * .06;
    const e = eio(lp);
    ctx.save(); ctx.globalAlpha = clamp(lp * 1.6) * .6; ctx.fillStyle = C.navy2; ctx.fillRect(0, 0, W, H); ctx.restore();
    for (let k = 0; k < 2; k++) { const p = P(t, T.logo + .5 + k * .15, T.logo + 1.5 + k * .15); if (p > 0 && p < 1) ring(540, 1010, 300 + eo(p) * 380, `rgba(255,255,255,${.6 * (1 - p)})`, 10 * (1 - p) + 2); }
    drawLogo(lerp(sx, 540, e), lerp(sy, 1010, e), lerp(d0, 620, e), clamp(lp * 3));
  }
}

/* ---- 2. Quadro "Tem na GJ" sobre o interior da loja ---- */
const PRODUCTS = [
  { t: 7.79, title: 'Tilápia inteira', sub: 'pra assar', draw: drawWhole, s: .27 },
  { t: 9.96, title: 'Filé', sub: 'pra fritar', draw: drawFillets, s: .27 },
  { t: 11.16, title: 'Frutos do mar', sub: 'pra caprichar no almoço', draw: drawSeafood, s: .26 },
];
function sceneBoard(t) {
  ctx.fillStyle = C.navy2; ctx.fillRect(0, 0, W, H);
  // interior visto pela porta do meio
  const p = P(t, T.prod - .1, T.sat);
  ctx.save(); ctx.filter = 'blur(7px)'; facadeCover(t, lerp(3.2, 3.6, p), FAC.door[0], FAC.door[1] - 30); ctx.restore();
  ctx.fillStyle = 'rgba(6,19,79,.55)'; ctx.fillRect(0, 0, W, H);
  const cp = eback(P(t, T.prod, T.prod + .4));
  ctx.save(); ctx.translate(540, 1060); ctx.scale(cp, cp); ctx.rotate((1 - clamp(cp)) * -.08);
  shadow(50, 20, 'rgba(0,0,0,.45)'); fillRR(-450, -420, 900, 840, 40, '#fff'); noShadow();
  fillRR(-450, -420, 900, 130, [40, 40, 0, 0], C.red);
  txt('TEM NA', -150, -352, 54, '#fff', 900, 'right');
  if (IMG.logo) { ctx.save(); ctx.beginPath(); ctx.arc(-70, -355, 52, 0, TAU); ctx.clip(); ctx.drawImage(IMG.logo, -124, -409, 108, 108 * IMG.logo.height / IMG.logo.width); ctx.restore(); }
  txt('GJ TILÁPIAS', 0, -352, 54, '#fff', 900, 'left');
  PRODUCTS.forEach((pr, i) => {
    const rp = eback(P(t, pr.t - .1, pr.t + .3)); if (rp <= 0) return;
    const y = -170 + i * 230, on = (i === 2 ? t < T.sat : t < PRODUCTS[i + 1].t) && t >= pr.t - .1;
    ctx.save(); ctx.translate((1 - clamp(rp)) * 500, y); ctx.globalAlpha = clamp(rp * 1.5);
    fillRR(-410, -100, 820, 200, 30, on ? '#FFF1F1' : '#F5F7FC'); if (on) strokeRR(-410, -100, 820, 200, 30, C.red, 4);
    circle(-300, 0, 84, '#E9EEF8'); ctx.save(); ctx.translate(-300, 0); pr.draw(t, pr.s * 1.35); ctx.restore();
    font(56, 900); txt(pr.title, -180, -28, pr.title.length > 13 ? 52 : 58, C.navy, 900, 'left');
    txt(pr.sub, -180, 40, pr.sub.length > 12 ? 34 : 42, C.red, 800, 'left');
    check(350, -60, 26, C.green, eback(P(t, pr.t + .25, pr.t + .55)));
    ctx.restore();
  });
  ctx.restore();
}

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

/* ---- 3. "E pra chegar é fácil." (satélite) ---- */
const SAT_A_PIN = [362, 470], SAT_B_PIN = [310, 380];
function sceneSatellite(t) {
  storeBG(t, .62);
  const a = P(t, T.sat, T.sat + .35);
  const cx = 540, cy = 1085, cw = 900, ch = 860;
  const grow = eio(P(t, T.map - .45, T.map + .1));
  const x = lerp(cx - cw / 2, 0, grow), y = lerp(cy - ch / 2, 0, grow), w = lerp(cw, W, grow), h = lerp(ch, H, grow), rad = lerp(40, 0, grow);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 1020); const sc = lerp(.85, 1, eback(a)); ctx.scale(sc, sc); ctx.translate(-540, -1020);
  shadow(40, 16, 'rgba(0,0,0,.4)'); fillRR(x - 10, y - 10, w + 20, h + 20, rad + 8, '#fff'); noShadow();
  ctx.save(); rr(x, y, w, h, rad); ctx.clip();
  const p = P(t, T.sat, T.map + .1);
  const sA = lerp(1.7, 4.2, eio(clamp(p / .62)));
  imgCover(IMG.satA, sA, SAT_A_PIN[0], SAT_A_PIN[1] - 20 / sA, cx, cy);
  const bA = P(t, T.sat + .9, T.sat + 1.3);
  if (bA > 0) { const sB = lerp(1.7, 2.6, eio(P(t, T.sat + .9, T.map + .1))); imgCover(IMG.satB, sB, SAT_B_PIN[0], SAT_B_PIN[1], cx, cy, bA); }
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
const ROUTE_T = [16.45, 19.85];
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
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const p = eio(P(t, T.fac, T.addr + .3));
  const z = lerp(1.3, 1.15, p), fx = 470, fy = 836, sy = 1117;
  const s = facadeCover(t, z, fx, fy, sy);
  facadeOverlays(t, s, fx, fy, sy, { signSweeps: [T.fac + 1.2], outline: win(t, 24.2, T.addr + .2, .4, .3), bubbles: 1 });
  const ap = eback(P(t, 24.3, 24.7));
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
  const l1 = eo(P(t, T.addr + .1, T.addr + .45)), l2 = eo(P(t, 28.81, 29.15)), l3 = eo(P(t, 30.2, 30.55));
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
  storeBG(t, .66);
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
  const np = eback(P(t, 33.89, 34.3));
  if (np > 0) {
    const pulse = 1 + .03 * Math.sin((t - 34) * 6) * P(t, 34.3, 34.6);
    ctx.save(); ctx.translate(540, 1395); ctx.scale(np * pulse * .95, np * pulse * .95);
    shadow(30, 12, 'rgba(0,0,0,.45)'); fillRR(-470, -88, 940, 176, 88, C.green); noShadow();
    waIcon(-372, 0, 62, '#fff'); ctx.save(); ctx.translate(-372, 0); waIcon(0, 0, 54, C.green); ctx.restore();
    txt('(85) 99965-8758', 46, 4, 80, '#fff', 900);
    ctx.restore();
  }
}

/* ---- 8. Final ---- */
function sceneEnd(t) {
  storeBG(t, .5, true);
  const lp = eback(P(t, T.end, T.end + .5));
  for (let k = 0; k < 2; k++) { const p = P(t, T.end + k * .15, T.end + 1.1 + k * .15); if (p > 0 && p < 1) ring(540, 820, 300 + eo(p) * 380, `rgba(10,31,122,${.35 * (1 - p)})`, 10 * (1 - p) + 2); }
  ctx.save(); ctx.translate(540, 820); ctx.rotate((1 - clamp(lp)) * .3); drawLogo(0, 0, 700 * lp, clamp(lp * 1.4)); ctx.restore();
  const a1 = eo(P(t, T.end + .5, T.end + .85));
  ctx.save(); ctx.globalAlpha = a1;
  font(54, 900); const w = 600; shadow(20, 8); fillRR(540 - w / 2, 1262 - 44 + (1 - a1) * 20, w, 88, 44, C.red); noShadow();
  txt('@gj_tilapias', 540, 1266 + (1 - a1) * 20, 54, '#fff', 900);
  ctx.restore();
  const a2 = eo(P(t, T.end + .8, T.end + 1.15));
  ctx.save(); ctx.globalAlpha = a2; shadow(12, 3, 'rgba(0,0,0,.6)'); txt('Rua Ana Facó, 85 · Álvaro Weyne', 540, 1380, 40, '#fff', 800); txt('Fortaleza – CE', 540, 1432, 36, '#FFD9DA', 800); noShadow(); ctx.restore();
}

/* =====================================================================
   RENDER
   ===================================================================== */
let showSafe = false;
function drawSafeZones() { ctx.save(); ctx.fillStyle = 'rgba(255,0,80,.18)'; ctx.fillRect(0, 0, W, 220); ctx.fillRect(0, 1500, W, 420); ctx.fillRect(950, 900, 130, 600); ctx.restore(); }
function cross(t, a, d) { return eio(P(t, a, a + d)); }
function watermark(t) { // logo fixa no canto
  const hide = Math.max(win(t, T.logo, T.prod + .2, .25, .35), P(t, T.end - .1, T.end + .25));
  const a = P(t, .2, .6) * (1 - hide);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(970, 268); const pul = 1 + .02 * Math.sin(t * 2);
  ctx.scale(pul, pul); shadow(16, 6, 'rgba(0,0,0,.35)'); circle(0, 0, 66, '#fff'); noShadow();
  if (IMG.logo) ctx.drawImage(IMG.logo, -63, -63, 126, 126 * IMG.logo.height / IMG.logo.width);
  ctx.restore();
}
function renderOld(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  if (t < T.prod + .45) sceneStore(t);
  if (t >= T.prod && t < T.sat + .4) { ctx.save(); ctx.globalAlpha = cross(t, T.prod, .45); sceneBoard(t); ctx.restore(); }
  if (t >= T.sat && t < T.map + .4) { ctx.save(); ctx.globalAlpha = cross(t, T.sat, .3); sceneSatellite(t); ctx.restore(); }
  if (t >= T.map + .05 && t < T.fac + .3) { ctx.save(); ctx.globalAlpha = cross(t, T.map + .05, .1); sceneMap(t); ctx.restore(); }
  if (t >= T.fac && t < T.addr + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.fac, .15); sceneFacade(t); ctx.restore(); }
  if (t >= T.addr && t < T.wpp + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.addr, .4); sceneAddress(t); ctx.restore(); }
  if (t >= T.wpp && t < T.end + .45) { ctx.save(); ctx.globalAlpha = cross(t, T.wpp, .4); sceneWhats(t); ctx.restore(); }
  if (t >= T.end) { ctx.save(); ctx.globalAlpha = cross(t, T.end, .4); sceneEnd(t); ctx.restore(); }
  watermark(t);
  const Y = 470;
  headline(t, 0.08, 2.55, [[['Já sabe o que vai']], [['pra '], ['panela', C.red], [' hoje?']]], { y: Y });
  headline(t, 2.6, 5.15, [[['Bateu vontade']], [['de comer '], ['peixe?', C.red]]], { y: Y });
  headline(t, 5.2, 7.5, [[['Vem pra ']], [['GJ Tilápias!', C.red]]], { y: Y });
  headline(t, 14.05, 16.05, [[['Pra chegar']], [['é fácil!', C.red]]], { y: Y });
  headline(t, 16.3, 18.15, [[['Pela ']], [['Av. Francisco Sá', C.red]]], { y: Y });
  headline(t, 18.15, 20.5, [[['Entre na ']], [['Rua Ana Facó', C.red]]], { y: Y });
  headline(t, 20.5, 23.1, [[['Perto do Mercado']], [['do Carlito Pamplona', C.red]]], { y: Y });
  headline(t, 23.15, 26.65, [[['Você vai ver a']], [['fachada azul', C.blue], [' da GJ']]], { y: Y });
  headline(t, 31.65, 36.4, [[['Quer consultar']], [['o que tem '], ['hoje?', C.red]]], { y: Y });
  if (showSafe) drawSafeZones();
}
function unwarp(tn) { // tempo final -> tempo original (linear por trechos)
  for (let i = 0; i < WARP.length - 1; i++) { const [o0, n0] = WARP[i], [o1, n1] = WARP[i + 1];
    if (tn <= n1) return n1 > n0 ? lerp(o0, o1, (tn - n0) / (n1 - n0)) : o0; }
  const [oL, nL] = WARP[WARP.length - 1]; return oL + (tn - nL);
}
const DUR_FINAL = WARP[WARP.length - 1][1] + (DUR - WARP[WARP.length - 1][0]);
window.renderFrame = tn => renderOld(unwarp(tn)); window.DUR = DUR_FINAL; window.FPS = FPS;

if (!/render/.test(location.search)) {
  const btn = document.getElementById('play'), tc = document.getElementById('tc');
  document.getElementById('safe').onchange = e => { showSafe = e.target.checked; };
  const audio = new Audio('out/audio_mix.wav');
  let start = null, playing = false;
  window.ready.then(() => window.renderFrame(0));
  btn.onclick = () => {
    if (playing) { playing = false; audio.pause(); btn.textContent = '▶ Reproduzir'; return; }
    playing = true; btn.textContent = '❚❚ Pausar'; audio.currentTime = 0; audio.play().catch(() => {}); start = performance.now();
    const loop = now => { if (!playing) return; const t = (now - start) / 1000; if (t > DUR_FINAL) { playing = false; btn.textContent = '▶ Reproduzir'; return; } window.renderFrame(t); tc.textContent = t.toFixed(1) + 's'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };
} else { document.body.classList.add('render'); }
