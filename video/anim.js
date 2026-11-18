'use strict';
/* TC Soluções Tecnológicas — vídeo vertical 9:16 (1080x1920), ~43,5 s
   Toda a animação é função pura do tempo: renderFrame(t). */

const W = 1080, H = 1920, FPS = 30, DUR = 43.5;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

const C = {
  navy: '#0B2554', navy2: '#16397A', blue: '#1F66E0', blue2: '#4C8DF6', blue3: '#A9C8F8',
  sky: '#EEF4FC', sky2: '#E2EBF8', sky3: '#D3E0F2', sky4: '#C2D3EC',
  white: '#FFFFFF', orange: '#FF7A1A', orange2: '#FFB57A', orange3: '#FFE6D2',
  ink: '#0B1F44', gray: '#8EA0BC', gray2: '#C9D4E5', gray3: '#E7EDF6',
  green: '#16A36B', green2: '#D5F3E6',
  skin1: '#F2C6A0', skin2: '#C98E63', skin3: '#8D5B3C',
  hair1: '#2A1E17', hair2: '#5A3A22', hair3: '#1B1B22',
};

/* ---------- Logo (preserva o arquivo original quando presente) ---------- */
const logoImg = new Image();
let logoOK = false;
const logoReady = new Promise(res => {
  logoImg.onload = () => { logoOK = true; res(); };
  logoImg.onerror = () => res();
  logoImg.src = 'assets/logo.png';
});
window.ready = Promise.all([
  logoReady,
  document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter'),
  document.fonts.load('700 60px Inter'), document.fonts.load('600 60px Inter'),
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
function shadow(blur, oy, col = 'rgba(11,37,84,.18)') { ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0; }
function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function ring(x, y, r, c, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function font(size, weight = 700) { ctx.font = `${weight} ${size}px Inter, "DejaVu Sans", sans-serif`; }
function txt(s, x, y, size, col, weight = 700, align = 'center', base = 'middle') {
  font(size, weight); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}
function line(x1, y1, x2, y2, c, lw, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.stroke();
}
function balancedLines(s, maxW) {
  if (ctx.measureText(s).width <= maxW) return [s];
  const w = s.split(' '); let best = null, bw = 1e9;
  for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '); const m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width); if (m < bw) { bw = m; best = [a, b]; } }
  return best;
}
function wrapLines(s, maxW) {
  const words = s.split(' '); const out = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test; }
  if (cur) out.push(cur); return out;
}

/* ---------- ícones ---------- */
function iconCheck(x, y, r, bg = C.green, fg = '#fff', sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  circle(0, 0, r, bg);
  ctx.beginPath(); ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .35); ctx.lineTo(r * .48, -r * .32);
  ctx.strokeStyle = fg; ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
function iconBell(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-34, 22); ctx.quadraticCurveTo(-30, -38, 0, -40); ctx.quadraticCurveTo(30, -38, 34, 22); ctx.closePath(); ctx.fill();
  fillRR(-46, 20, 92, 14, 7, col); circle(0, -44, 7, col); fillRR(-10, 36, 20, 10, 5, col);
  ctx.restore();
}
function iconCalendar(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-44, -36, 88, 80, 12, col); fillRR(-36, -14, 72, 50, 6, '#fff');
  fillRR(-28, -50, 10, 22, 5, col); fillRR(18, -50, 10, 22, 5, col);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) fillRR(-28 + i * 22, -6 + j * 20, 14, 12, 3, i === 2 && j === 1 ? C.orange : col);
  ctx.restore();
}
function iconBed(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-50, -4, 100, 30, 8, col); fillRR(-50, -40, 12, 76, 5, col); fillRR(38, 10, 12, 26, 5, col);
  fillRR(-34, -22, 30, 18, 8, col); fillRR(0, -18, 50, 16, 6, col);
  ctx.restore();
}
function iconCutlery(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.fillStyle = col;
  fillRR(-30, -44, 8, 34, 4, col); fillRR(-18, -44, 8, 34, 4, col); fillRR(-42, -44, 8, 34, 4, col);
  fillRR(-38, -16, 24, 12, 6, col); fillRR(-31, -10, 10, 56, 5, col);
  ctx.beginPath(); ctx.moveTo(22, -46); ctx.quadraticCurveTo(44, -30, 34, 6); ctx.lineTo(22, 6); ctx.closePath(); ctx.fill();
  fillRR(22, -46, 10, 92, 5, col);
  ctx.restore();
}
function iconChart(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-44, 10, 18, 34, 4, col); fillRR(-16, -10, 18, 54, 4, col); fillRR(12, -30, 18, 74, 4, col);
  ctx.beginPath(); ctx.moveTo(-40, -6); ctx.lineTo(-10, -28); ctx.lineTo(10, -20); ctx.lineTo(40, -46);
  ctx.strokeStyle = C.orange; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
function iconWifi(x, y, s, col, p = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.lineCap = 'round';
  circle(0, 30, 8, col);
  for (let i = 0; i < 3; i++) {
    const a = clamp(p * 3 - i); if (a <= 0) continue;
    ctx.globalAlpha *= 1; ctx.beginPath(); ctx.arc(0, 30, 22 + i * 18, -Math.PI * .78, -Math.PI * .22);
    ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.save(); ctx.globalAlpha *= a; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function iconMonitor(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-46, -36, 92, 60, 8, col); fillRR(-38, -28, 76, 44, 4, '#fff'); fillRR(-6, 24, 12, 14, 0, col); fillRR(-22, 36, 44, 8, 4, col);
  ctx.restore();
}
function iconPrinter(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-28, -44, 56, 30, 4, '#fff'); strokeRR(-28, -44, 56, 30, 4, col, 6);
  fillRR(-46, -20, 92, 46, 10, col); fillRR(-28, 14, 56, 30, 4, '#fff'); strokeRR(-28, 14, 56, 30, 4, col, 6); circle(32, -6, 5, C.orange);
  ctx.restore();
}
function iconServer(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  for (let i = 0; i < 3; i++) { fillRR(-38, -44 + i * 30, 76, 26, 6, col); circle(24, -31 + i * 30, 4, i === 1 ? C.orange : '#7CF0B8'); fillRR(-28, -34 + i * 30, 30, 6, 3, 'rgba(255,255,255,.5)'); }
  ctx.restore();
}
function iconLaptop(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-36, -34, 72, 48, 6, col); fillRR(-29, -27, 58, 34, 3, '#fff'); fillRR(-48, 16, 96, 10, 5, col);
  ctx.restore();
}
function iconPhone(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-22, -42, 44, 84, 10, col); fillRR(-16, -32, 32, 58, 4, '#fff'); circle(0, 34, 4, '#fff');
  ctx.restore();
}
function iconRouter(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(-44, 4, 88, 30, 8, col); fillRR(-30, -36, 6, 44, 3, col); fillRR(24, -36, 6, 44, 3, col);
  circle(-22, 19, 4, '#7CF0B8'); circle(-8, 19, 4, '#7CF0B8'); circle(6, 19, 4, C.orange);
  ctx.restore();
}
function iconClock(x, y, r, t, col = C.orange) {
  circle(x, y, r, '#fff'); ring(x, y, r, col, r * .16);
  const a = t * 4; line(x, y, x + Math.cos(a - Math.PI / 2) * r * .55, y + Math.sin(a - Math.PI / 2) * r * .55, col, r * .14);
  line(x, y, x + r * .38, y, col, r * .14);
}
function iconMagnifier(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.beginPath(); ctx.arc(-8, -8, 30, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); ring(-8, -8, 30, col, 10);
  ctx.save(); ctx.translate(14, 14); ctx.rotate(Math.PI / 4); fillRR(0, -8, 44, 16, 8, col); ctx.restore();
  ctx.restore();
}
function iconWrench(x, y, s, col, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s / 100, s / 100);
  fillRR(-8, -10, 16, 60, 8, col);
  ctx.beginPath(); ctx.arc(0, -22, 20, 0, TAU); ctx.fillStyle = col; ctx.fill();
  fillRR(-7, -48, 14, 24, 3, '#fff');
  ctx.restore();
}
const SECTOR_ICONS = { reservas: iconCalendar, recepcao: iconBell, quartos: iconBed, restaurante: iconCutlery, gestao: iconChart };

/* ---------- personagens ---------- */
function arm(x, y, ang, sh, sk, hold) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  fillRR(-11, -6, 22, 94, 11, sh); circle(0, 92, 11.5, sk);
  if (hold) hold();
  ctx.restore();
}
function person(x, y, s, o = {}) {
  const sh = o.shirt || C.blue, sk = o.skin || C.skin1, hr = o.hair || C.hair1, pa = o.pants || C.navy;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.noLegs) {
    const a = o.walk != null ? Math.sin(o.walk) * 0.38 : 0;
    for (const [lx, ang] of [[-15, a], [15, -a]]) {
      ctx.save(); ctx.translate(lx, -110 + (o.bob || 0)); ctx.rotate(ang);
      fillRR(-13, 0, 26, 104, 12, pa); fillRR(-15, 94, 34, 16, 8, '#18233A');
      ctx.restore();
    }
  }
  ctx.translate(0, o.bob || 0);
  if (o.backArmL != null) arm(-36, -200, o.backArmL, sh, sk);
  fillRR(-42, -214, 84, 114, 26, sh);
  if (o.vest) { fillRR(-42, -186, 84, 86, [0, 0, 26, 26], o.vest); }
  if (o.collar) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-14, -214); ctx.lineTo(0, -190); ctx.lineTo(14, -214); ctx.closePath(); ctx.fill(); }
  if (o.tie) { ctx.fillStyle = o.tie; ctx.beginPath(); ctx.moveTo(-5, -206); ctx.lineTo(5, -206); ctx.lineTo(8, -160); ctx.lineTo(0, -150); ctx.lineTo(-8, -160); ctx.closePath(); ctx.fill(); }
  if (o.apron) { fillRR(-34, -170, 68, 80, 10, '#fff'); fillRR(-34, -170, 68, 8, 4, C.gray2); }
  if (o.badge) { fillRR(10, -190, 24, 16, 4, C.orange); txt('TC', 22, -182, 10, '#fff', 900); }
  if (o.nametag) { fillRR(12, -188, 20, 10, 3, '#fff'); }
  arm(-38, -200, o.armL != null ? o.armL : 0.12, sh, sk, o.holdL);
  arm(38, -200, o.armR != null ? o.armR : -0.12, sh, sk, o.holdR);
  // cabeça
  const lk = (o.look || 0) * 6;
  fillRR(-10, -224, 20, 18, 6, sk);
  ctx.save(); ctx.translate(0, -252); ctx.rotate(o.tilt || 0);
  if (o.hairStyle === 'long') fillRR(-37, -28, 74, 78, 30, hr);
  circle(0, 0, 32, sk);
  ctx.fillStyle = hr; ctx.beginPath(); ctx.arc(0, -3, 33.5, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(20, -14, -33.5, -3); ctx.closePath(); ctx.fill();
  if (o.hairStyle === 'bun') circle(0, -38, 13, hr);
  if (o.hairStyle === 'long') { fillRR(-35, -10, 10, 40, 5, hr); fillRR(25, -10, 10, 40, 5, hr); }
  const bl = o.blink ? 0.15 : 1;
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.ellipse(lk - 11, 4, 3.8, 3.8 * bl, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(lk + 11, 4, 3.8, 3.8 * bl, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  if (o.mood === 'worried') { line(lk - 17, -8, lk - 6, -11, C.ink, 3); line(lk + 6, -11, lk + 17, -8, C.ink, 3); }
  ctx.beginPath();
  if (o.mood === 'happy') ctx.arc(lk, 12, 9, 0.12 * Math.PI, 0.88 * Math.PI);
  else if (o.mood === 'worried') ctx.arc(lk, 25, 8, 1.2 * Math.PI, 1.8 * Math.PI);
  else { ctx.moveTo(lk - 6, 17); ctx.lineTo(lk + 6, 17); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
function suitcase(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(-12, -128, -12, -196, C.gray, 6); line(12, -128, 12, -196, C.gray, 6); fillRR(-18, -202, 36, 12, 6, C.navy);
  fillRR(-34, -132, 68, 120, 12, C.navy2); fillRR(-34, -86, 68, 12, 0, C.orange);
  line(-14, -124, -14, -20, 'rgba(255,255,255,.18)', 4); line(14, -124, 14, -20, 'rgba(255,255,255,.18)', 4);
  circle(-22, -6, 7, '#18233A'); circle(22, -6, 7, '#18233A');
  ctx.restore();
}
const blinkAt = (t, seed) => ((t + seed * 1.7) % 3.1) < 0.12;

/* ---------- monitores e telas ilustrativas (espaço 400x250) ---------- */
function monitor(x, y, w, h, fn, o = {}) {
  fillRR(x + w / 2 - 10, y + h - 4, 20, 22, 0, C.navy2); fillRR(x + w / 2 - 42, y + h + 14, 84, 8, 4, C.navy2);
  shadow(16, 6); fillRR(x, y, w, h, 10, C.navy); noShadow();
  const sx = x + 7, sy = y + 7, sw = w - 14, sh = h - 14;
  ctx.save(); rr(sx, sy, sw, sh, 5); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, sw, sh);
  if (fn) { ctx.translate(sx, sy); ctx.scale(sw / 400, sh / 250); fn(); }
  ctx.restore();
  if (o.dim) { ctx.save(); rr(sx, sy, sw, sh, 5); ctx.fillStyle = `rgba(11,37,84,${o.dim})`; ctx.fill(); ctx.restore(); }
  if (o.glow) { ctx.save(); ctx.globalAlpha *= o.glow; strokeRR(x - 4, y - 4, w + 8, h + 8, 13, C.orange, 6); ctx.restore(); }
}
function uiHeader(title, col = C.blue) { ctx.fillStyle = col; ctx.fillRect(0, 0, 400, 50); txt(title, 18, 26, 24, '#fff', 800, 'left'); circle(372, 25, 9, 'rgba(255,255,255,.5)'); }
function uiBar(x, y, w, c = C.gray3, h = 14) { fillRR(x, y, w, h, h / 2, c); }
function spinner(cx, cy, r, t, col = C.blue) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = C.gray3; ctx.lineWidth = r * .28; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, t * 7, t * 7 + 1.9); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
}
function uiReservasBO(t, toastP) {
  uiHeader('Reservas');
  for (let i = 0; i < 4; i++) { const y = 72 + i * 42; fillRR(16, y, 368, 32, 8, i % 2 ? '#fff' : C.sky); uiBar(30, y + 9, 120); uiBar(220, y + 9, 60, C.blue3); uiBar(300, y + 9, 66); }
  if (toastP > 0) {
    const y = lerp(-90, 14, eback(clamp(toastP)));
    ctx.save(); shadow(18, 6, 'rgba(11,37,84,.3)'); fillRR(124, y, 262, 84, 14, '#fff'); noShadow();
    fillRR(124, y, 8, 84, [14, 0, 0, 14], C.orange);
    circle(170, y + 42, 24, C.orange); iconBell(170, y + 43, 30, '#fff');
    txt('Nova reserva', 206, y + 28, 22, C.navy, 800, 'left'); txt('Quarto 204 · 2 diárias', 206, y + 58, 17, C.ink, 600, 'left');
    ctx.restore();
  }
}
function uiBusca(t, state) { // state: 0 carregando, 1 encontrada
  uiHeader('Recepção · Reservas');
  fillRR(16, 64, 368, 44, 10, C.sky); strokeRR(16, 64, 368, 44, 10, C.blue3, 2);
  ring(40, 85, 9, C.gray, 3); line(47, 92, 53, 98, C.gray, 3);
  txt('Quarto 204', 62, 87, 20, C.ink, 600, 'left');
  if (state < 1) {
    spinner(200, 168, 26, t); txt('Carregando...', 200, 220, 18, C.gray, 600);
  } else {
    fillRR(16, 124, 368, 64, 10, C.orange3); strokeRR(16, 124, 368, 64, 10, C.orange, 3);
    txt('Quarto 204 · 2 diárias', 30, 156, 21, C.navy, 800, 'left'); iconCheck(354, 156, 16, C.green);
    uiBar(16, 206, 220); uiBar(250, 206, 100, C.blue3);
  }
}
function uiPlanilha() {
  uiHeader('Planilha', '#5C6F91');
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) {
    const x = 12 + c * 94, y = 60 + r * 30; ctx.strokeStyle = C.gray2; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, 94, 30);
    if ((r * 7 + c * 3) % 5 === 0) uiBar(x + 10, y + 9, 50, C.gray2, 12);
  }
}
function uiEmail() {
  uiHeader('E-mails', '#5C6F91');
  for (let i = 0; i < 4; i++) { const y = 64 + i * 44; circle(36, y + 16, 14, i === 1 ? C.orange2 : C.gray2); uiBar(60, y + 4, 200, C.gray2, 12); uiBar(60, y + 22, 280, C.gray3, 10); }
}
function uiHosp(ok = true) {
  uiHeader('Hospedagem · 204');
  txt('Quarto 204', 22, 86, 22, C.navy, 800, 'left'); txt('2 diárias', 22, 122, 20, C.ink, 600, 'left');
  if (ok) iconCheck(352, 100, 22, C.green);
  uiBar(22, 160, 300); uiBar(22, 190, 220);
}
function uiConsumo(state) { // 0 pendente, 1 lançado
  uiHeader('Consumo · 204');
  txt('Restaurante', 22, 92, 22, C.navy, 800, 'left');
  if (state < 1) { fillRR(220, 72, 160, 40, 20, C.orange); txt('Pendente', 300, 93, 19, '#fff', 800); }
  else { fillRR(220, 72, 160, 40, 20, C.green); txt('Lançado', 286, 93, 19, '#fff', 800); iconCheck(352, 92, 12, '#fff', C.green); }
  uiBar(22, 140, 260); uiBar(22, 172, 200); uiBar(22, 204, 240);
}
function uiValores() {
  uiHeader('Valores · 204', '#5C6F91');
  for (let i = 0; i < 3; i++) { const y = 70 + i * 50; uiBar(22, y + 12, 170, C.gray2); fillRR(290, y, 90, 36, 8, C.orange3); txt('?', 335, y + 19, 24, C.orange, 900); }
}
function uiConta(state) {
  uiHeader('Conta · Quarto 204');
  txt('Hospedagem', 22, 88, 20, C.navy, 700, 'left'); iconCheck(352, 88, 14, C.green);
  txt('Restaurante', 22, 132, 20, C.navy, 700, 'left');
  if (state < 1) { uiBar(250, 124, 80, C.gray2, 16); txt('—', 352, 132, 24, C.orange, 900); }
  else iconCheck(352, 132, 14, C.green);
  uiBar(22, 176, 300); uiBar(22, 206, 200);
}
function uiCheckoutOK() {
  uiHeader('Check-out · 204', C.green);
  iconCheck(200, 130, 46, C.green); txt('Concluído', 200, 210, 26, C.navy, 800);
}

/* ---------- cenários ---------- */
function sign(label, x, y, size = 30) {
  ctx.save(); font(size, 800); ctx.letterSpacing = '6px'; const w = ctx.measureText(label).width + 60;
  fillRR(x - w / 2, y - size, w, size * 2, size, '#fff'); fillRR(x - w / 2 + 22, y - 5, 10, 10, 5, C.orange);
  ctx.fillStyle = C.navy; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 12, y + 1);
  ctx.restore();
}
function wall(x0, x1) {
  ctx.fillStyle = C.sky; ctx.fillRect(x0, -1200, x1 - x0, 2700);
  ctx.fillStyle = C.sky2; ctx.fillRect(x0, 1170, x1 - x0, 250);
  ctx.fillStyle = C.sky4; ctx.fillRect(x0, 1166, x1 - x0, 6);
  ctx.fillStyle = C.sky3; ctx.fillRect(x0, 1420, x1 - x0, 1600);
  ctx.fillStyle = C.sky4; ctx.fillRect(x0, 1420, x1 - x0, 8);
  for (let x = Math.ceil(x0 / 180) * 180; x < x1; x += 180) { ctx.fillStyle = 'rgba(194,211,236,.35)'; ctx.fillRect(x, 1500, 4, 600); }
}
function lamp(x, y0, y1, glow = 0) {
  line(x, y0, x, y1, C.navy2, 3);
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(x - 38, y1 + 34); ctx.quadraticCurveTo(x, y1 - 20, x + 38, y1 + 34); ctx.closePath(); ctx.fill();
  circle(x, y1 + 36, 10, '#FFE3B8');
  if (glow) { const g = ctx.createRadialGradient(x, y1 + 40, 0, x, y1 + 40, 160); g.addColorStop(0, `rgba(255,214,150,${.35 * glow})`); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160, y1 - 120, 320, 320); }
}
function plant(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(-0.9 + i * 0.36); ctx.fillStyle = i % 2 ? '#2F9E7A' : '#1F7F62'; ctx.beginPath(); ctx.ellipse(0, -70, 18, 64, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  fillRR(-34, -24, 68, 64, [6, 6, 16, 16], C.white); fillRR(-34, -24, 68, 10, 4, C.orange);
  ctx.restore();
}
function wallClock(x, y, r, minuteA, hourA) {
  shadow(10, 4); circle(x, y, r, '#fff'); noShadow(); ring(x, y, r, C.navy, 7);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, x + Math.cos(a) * r * .88, y + Math.sin(a) * r * .88, C.gray, 3); }
  line(x, y, x + Math.cos(hourA - Math.PI / 2) * r * .45, y + Math.sin(hourA - Math.PI / 2) * r * .45, C.navy, 6);
  line(x, y, x + Math.cos(minuteA - Math.PI / 2) * r * .7, y + Math.sin(minuteA - Math.PI / 2) * r * .7, C.orange, 4);
  circle(x, y, 5, C.navy);
}
function stickyNote(x, y, a, c = '#FFD9A8') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); shadow(6, 3, 'rgba(0,0,0,.15)'); fillRR(-22, -22, 44, 44, 3, c); noShadow();
  line(-13, -8, 12, -8, 'rgba(11,37,84,.45)', 3); line(-13, 2, 6, 2, 'rgba(11,37,84,.45)', 3); line(-13, 12, 10, 12, 'rgba(11,37,84,.45)', 3);
  ctx.restore();
}
function dataPacket(x, y, label, s = 1, alpha = 1, col = C.orange, icon = 'bell') {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
  font(26, 800); const w = ctx.measureText(label).width + 86;
  shadow(20, 8, 'rgba(255,122,26,.35)'); fillRR(-w / 2, -32, w, 64, 32, col); noShadow();
  circle(-w / 2 + 32, 0, 22, '#fff');
  if (icon === 'bell') iconBell(-w / 2 + 32, 2, 26, col); else iconCutlery(-w / 2 + 32, 0, 26, col);
  txt(label, -w / 2 + 62, 1, 26, '#fff', 800, 'left');
  ctx.restore();
}
function bubble(x, y, w, h, s, fn) { // balão de fala com ponta para baixo-direita
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadow(16, 6); rr(-w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * .15, h / 2 - 2); ctx.lineTo(w * .32, h / 2 + 26); ctx.lineTo(w * .3, h / 2 - 2); ctx.fill(); noShadow();
  fn && fn(); ctx.restore();
}

/* ---------- RECEPÇÃO (coordenadas de palco 1080x1920) ---------- */
// st: {t, guest:{x, walk, mood, armL, armR, show, wave}, rec:{look, mood, armR}, monA, monB, dimA, dimB, notes, clock:{m,h}, key:{x,y,a}}
function drawReception(st) {
  const t = st.t;
  wall(-150, 1500);
  ctx.fillStyle = C.navy2; ctx.fillRect(-170, -1200, 40, 2700);
  lamp(240, -1200, 700, 1); lamp(800, -1200, 700, 1);
  sign('RECEPÇÃO', 330, 930);
  const cm = st.clock || { m: 1.2, h: 2.9 };
  wallClock(760, 930, 58, cm.m, cm.h);
  plant(48, 1420, 1.1);
  // recepcionista (atrás do balcão)
  const r = st.rec || {};
  person(250, 1430 + Math.sin(t * 2.2) * 1.5, 1, {
    shirt: C.navy2, collar: true, skin: C.skin2, hair: C.hair2, hairStyle: 'bun', mood: r.mood, look: r.look, nametag: true,
    armR: r.armR != null ? r.armR : -0.3, armL: 0.25, blink: blinkAt(t, 1), noLegs: true, holdR: r.holdR,
  });
  // monitores
  monitor(360, 1085, 200, 128, st.monA, { dim: st.dimA, glow: st.glowA });
  monitor(585, 1085, 200, 128, st.monB, { dim: st.dimB, glow: st.glowB });
  if (st.notes) { stickyNote(778, 1100, 0.2 * st.notes, '#FFD9A8'); stickyNote(372, 1102, -0.18, '#FFE9C9'); }
  // balcão
  shadow(24, 10); fillRR(120, 1245, 790, 190, [0, 0, 14, 14], '#fff'); noShadow();
  fillRR(120, 1225, 810, 28, 10, C.navy);
  fillRR(150, 1300, 730, 10, 5, C.blue3); fillRR(150, 1330, 730, 4, 2, C.orange);
  if (st.notes) { ctx.save(); ctx.translate(470, 1218); ctx.rotate(-.05); fillRR(-60, -8, 120, 10, 2, '#fff'); strokeRR(-60, -8, 120, 10, 2, C.gray2, 2); ctx.restore(); stickyNote(260, 1214, .3, '#FFD9A8'); }
  // teclado
  fillRR(400, 1214, 120, 12, 4, C.navy2);
  if (st.key) {
    ctx.save(); ctx.translate(st.key.x, st.key.y); ctx.rotate(st.key.a || 0); ctx.globalAlpha *= st.key.alpha != null ? st.key.alpha : 1;
    keyCard(0, 0, 1); ctx.restore();
  }
  // hóspede
  const g = st.guest;
  if (g && g.show !== false) {
    const gx = g.x;
    if (g.suitcase !== false) suitcase(gx + (g.sx != null ? g.sx : 70), 1452, 1);
    person(gx, 1452, 1.02, {
      shirt: C.orange, pants: C.navy, skin: C.skin1, hair: C.hair1, mood: g.mood, look: g.look != null ? g.look : -0.8,
      walk: g.walk, bob: g.bob || 0, armL: g.armL, armR: g.armR != null ? g.armR : 0.35, blink: blinkAt(t, 2), tilt: g.tilt || 0,
      holdL: g.watch ? () => { fillRR(-10, 64, 20, 14, 4, C.navy); fillRR(-6, 66, 12, 10, 3, '#BFE1FF'); } : null,
    });
  }
}
function keyCard(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadow(10, 4, 'rgba(11,37,84,.3)'); fillRR(-40, -26, 80, 52, 8, C.navy); noShadow();
  fillRR(-40, -26, 80, 12, [8, 8, 0, 0], C.orange);
  txt('204', 0, 8, 24, '#fff', 900);
  ctx.restore();
}
function keyCardBig(cx, cy, w, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); const s = w / 400; ctx.scale(s, s);
  shadow(40, 14, 'rgba(11,37,84,.35)'); fillRR(-200, -126, 400, 252, 30, C.navy); noShadow();
  fillRR(-200, -126, 400, 54, [30, 30, 0, 0], C.orange);
  txt('QUARTO', 0, -10, 36, C.blue3, 800); txt('204', 0, 62, 96, '#fff', 900);
  ctx.beginPath(); ctx.arc(150, -99, 12, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
  ctx.restore();
}

/* ---------- RESTAURANTE ---------- */
function drawRestaurant(st) {
  const t = st.t;
  wall(-200, 1300);
  sign('RESTAURANTE', 540, 860);
  // prateleira
  fillRR(90, 1010, 200, 12, 4, C.navy2); for (let i = 0; i < 4; i++) { circle(118 + i * 46, 990, 18, i % 2 ? '#fff' : C.blue3); }
  fillRR(800, 1010, 200, 12, 4, C.navy2); for (let i = 0; i < 3; i++) fillRR(820 + i * 56, 950, 26, 60, [12, 12, 4, 4], i === 1 ? C.orange2 : C.blue3);
  lamp(540, -1200, 760, 1.4);
  plant(1010, 1420, 1.0);
  // hóspede sentado
  person(450, 1405 + Math.sin(t * 2) * 1.2, 1.0, {
    shirt: C.orange, skin: C.skin1, hair: C.hair1, noLegs: true, mood: st.guestMood || 'happy', look: 0.6, blink: blinkAt(t, 3),
    armR: -0.5, armL: 0.4,
  });
  // garçom
  const tap = st.tap || 0;
  person(790, 1440, 1.0, {
    shirt: C.navy2, apron: true, skin: C.skin3, hair: C.hair3, mood: 'happy', look: -0.8, blink: blinkAt(t, 4),
    armL: 0.55, armR: 0.75 - tap * 0.25,
  });
  // tablet
  ctx.save(); ctx.translate(735, 1225); ctx.rotate(-0.12); fillRR(-50, -36, 100, 72, 10, C.navy); fillRR(-43, -29, 86, 58, 5, '#fff');
  fillRR(-36, -22, 72, 10, 4, C.blue3); fillRR(-36, -6, 50, 8, 4, C.gray3); fillRR(-36, 12, 72, 12, 6, tap > 0.5 ? C.navy2 : C.orange); ctx.restore();
  // mesa
  shadow(20, 8); fillRR(260, 1250, 520, 26, 12, '#fff'); noShadow();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(272, 1270); ctx.lineTo(768, 1270); ctx.lineTo(752, 1350); ctx.lineTo(288, 1350); ctx.closePath(); ctx.fill();
  fillRR(288, 1342, 464, 8, 4, C.blue3);
  fillRR(330, 1350, 18, 80, 4, C.navy2); fillRR(692, 1350, 18, 80, 4, C.navy2);
  // itens
  if (st.food) {
    const f = st.food;
    ctx.save(); ctx.globalAlpha *= clamp(f * 2);
    ctx.beginPath(); ctx.ellipse(430, 1246, 70 * f, 14 * f, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.gray2; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(430, 1238, 40 * f, 16 * f, 0, Math.PI, TAU); ctx.fillStyle = C.orange2; ctx.fill();
    fillRR(530, 1212 + (1 - f) * 20, 34, 38, [4, 4, 10, 10], C.blue3); ctx.restore();
  }
  // número do quarto na mesa
  if (st.tent) {
    ctx.save(); ctx.globalAlpha *= st.tent; ctx.translate(640, 1218);
    ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(-34, 32); ctx.lineTo(-24, -24); ctx.lineTo(24, -24); ctx.lineTo(34, 32); ctx.closePath(); ctx.fill();
    fillRR(-24, -24, 48, 10, 3, C.orange); txt('204', 0, 8, 22, '#fff', 900); ctx.restore();
  }
}

/* ---------- ESCRITÓRIO DE RESERVAS ---------- */
function drawBackOffice(t, toastP) {
  wall(-200, 1050);
  sign('RESERVAS', 540, 820);
  lamp(540, -1200, 640, .8);
  plant(140, 1420, 1.1);
  fillRR(250, 1230, 580, 24, 10, C.navy); fillRR(280, 1254, 26, 170, 6, C.navy2); fillRR(774, 1254, 26, 170, 6, C.navy2);
  monitor(330, 950, 420, 262, () => uiReservasBO(t, toastP));
  fillRR(450, 1218, 180, 12, 4, C.navy2); fillRR(660, 1214, 40, 16, 8, C.navy2);
}

/* ---------- câmera / transições ---------- */
function camera(cx, cy, z, fn) { ctx.save(); ctx.translate(540, 1060); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore(); }
function w2s(cam, x, y) { return [540 + (x - cam[0]) * cam[2], 1060 + (y - cam[1]) * cam[2]]; }
const REGION = { x: 80, y: 760, w: 920, h: 720 };
// desenha uma cena "palco" encaixada em um cartão (target {x,y,w}); p=0 tela cheia, p=1 cartão
function cardScene(drawFn, p, tgt, o = {}) {
  const s = lerp(1, tgt.w / REGION.w, p);
  const tx = lerp(0, tgt.x - REGION.x * tgt.w / REGION.w, p), ty = lerp(0, tgt.y - REGION.y * tgt.w / REGION.w, p);
  const th = tgt.w * REGION.h / REGION.w;
  const cx = lerp(-40, tgt.x, p), cy = lerp(-40, tgt.y, p), cw = lerp(W + 80, tgt.w, p), ch = lerp(H + 80, th, p), rad = lerp(0, 28, p);
  ctx.save();
  if (p > 0.02) { ctx.globalAlpha *= 1; shadow(30 * p, 12 * p, `rgba(11,37,84,${.25 * p})`); fillRR(cx, cy, cw, ch, rad, '#fff'); noShadow(); }
  rr(cx, cy, cw, ch, rad); ctx.clip();
  ctx.translate(tx, ty); ctx.scale(s, s); drawFn();
  ctx.restore();
  if (o.border) { ctx.save(); ctx.globalAlpha *= o.border; strokeRR(cx, cy, cw, ch, rad, o.borderCol || '#fff', 8); ctx.restore(); }
  return { x: cx, y: cy, w: cw, h: ch };
}
function mapBG(alpha = 1, t = 0) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F5F9FF'); g.addColorStop(1, '#E4EEFB'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(31,102,224,.10)';
  for (let y = 40; y < H; y += 60) for (let x = 30; x < W; x += 60) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ---------- textos principais ---------- */
function headline(t, a, b, lines, o = {}) {
  if (t < a || t > b) return;
  const pin = eo(P(t, a, a + .35)), pout = eio(P(t, b - .28, b));
  const alpha = pin * (1 - pout);
  let size = o.size || 72;
  font(size, 800);
  let widths = lines.map(l => l.reduce((s, [tx]) => s + ctx.measureText(tx).width, 0));
  const maxW = 860;
  if (Math.max(...widths) > maxW) { size = Math.floor(size * maxW / Math.max(...widths)); font(size, 800); widths = lines.map(l => l.reduce((s, [tx]) => s + ctx.measureText(tx).width, 0)); }
  const lh = size * 1.2, cw = Math.max(...widths) + 100, ch = lines.length * lh + 64;
  const cy = o.y || 430;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(540, cy + (1 - pin) * 36 - pout * 24);
  ctx.scale(lerp(.94, 1, pin), lerp(.94, 1, pin));
  shadow(36, 14, 'rgba(11,37,84,.25)'); fillRR(-cw / 2, -ch / 2, cw, ch, 30, '#fff'); noShadow();
  fillRR(-44, -ch / 2 - 7, 88, 14, 7, C.orange);
  lines.forEach((l, i) => {
    const lp = eo(P(t, a + .1 + i * .14, a + .5 + i * .14));
    let x = -widths[i] / 2; const y = -ch / 2 + 32 + lh * (i + .5);
    ctx.save(); ctx.globalAlpha *= alpha * lp; ctx.translate(0, (1 - lp) * 26);
    font(size, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const [tx, col] of l) { ctx.fillStyle = col || C.navy; ctx.fillText(tx, x, y + 2); x += ctx.measureText(tx).width; }
    ctx.restore();
  });
  ctx.restore();
}

/* ---------- LOGO ---------- */
function drawLogo(cx, cy, h, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (logoOK) {
    const w = h * logoImg.width / logoImg.height; ctx.drawImage(logoImg, cx - w / 2, cy - h / 2, w, h);
  } else {
    // LOGO PROVISÓRIO — substituir por assets/logo.png (arquivo original da TC)
    const s = h / 260; ctx.translate(cx, cy); ctx.scale(s, s);
    const g = ctx.createLinearGradient(-80, -130, 80, 30); g.addColorStop(0, C.blue); g.addColorStop(1, C.navy);
    shadow(24, 10, 'rgba(11,37,84,.3)'); rr(-80, -130, 160, 160, 40); ctx.fillStyle = g; ctx.fill(); noShadow();
    txt('TC', 0, -48, 82, '#fff', 900);
    fillRR(-36, 2, 72, 9, 5, C.orange);
    ctx.save(); font(50, 900); ctx.letterSpacing = '2px'; ctx.fillStyle = C.navy; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TC SOLUÇÕES', 0, 76); ctx.restore();
    ctx.save(); font(25, 700); ctx.letterSpacing = '9px'; ctx.fillStyle = C.blue; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TECNOLÓGICAS', 5, 120); ctx.restore();
  }
  ctx.restore();
}

/* =====================================================================
   LINHA DO TEMPO
   ===================================================================== */
const T = { s1: 0, s2: 6.5, s3: 12.2, s4: 18.0, logo: 24.0, svc: 25.6, recap: 36.0, end: 38.6 };
const SVC_D = 2.6;

/* ---- CENA 1: reserva e chegada (0 – 6,5) ---- */
const S1_CLICKS = [[3.0, 'A'], [3.6, 'B'], [4.25, 'A'], [4.85, 'B'], [5.4, 'A']];
function s1Focus(t) { let f = 'A'; for (const [ct, m] of S1_CLICKS) if (t >= ct) f = m; return f; }
function s1Cam(t) {
  const p = eio(P(t, 1.25, 2.45));
  let c = [lerp(-660, 540, p), lerp(1081, 1185, p), lerp(2.05, 1.12, p)];
  const q = eio(P(t, 2.9, 5.6));
  c = [lerp(c[0], 575, q), lerp(c[1], 1190, q), lerp(c[2], 1.4, q)];
  const r = eio(P(t, 5.6, 6.2));
  c = [lerp(c[0], 560, r), lerp(c[1], 1185, r), lerp(c[2], 1.28, r)];
  return c;
}
function receptionS1(t) {
  const walkP = P(t, 1.9, 3.05);
  const gx = lerp(1260, 830, eo(walkP));
  const walking = walkP > 0 && walkP < 1;
  const f = s1Focus(t);
  const found = t >= 5.4;
  const bview = Math.floor(P(t, 3.6, 5.4) * 2.99);
  const reach = eio(P(t, 5.5, 5.8)) * (1 - eio(P(t, 6.05, 6.4)));
  const keyP = eio(P(t, 5.62, 6.05));
  return {
    t,
    monA: () => uiBusca(t, found ? 1 : 0),
    monB: () => (bview % 2 === 0 ? uiPlanilha() : uiEmail()),
    dimA: t > 3.0 && f === 'B' ? .35 : 0, dimB: t > 3.0 && f === 'A' && !found ? .35 : 0,
    glowA: found ? win(t, 5.4, 6.4, .1, .4) : 0,
    rec: { look: t < 2.9 ? 0.4 : (f === 'A' ? 0.7 : 1), mood: found ? 'happy' : (t > 3.3 ? 'worried' : null), armR: lerp(-0.35, -1.45, reach) },
    key: t > 5.55 && t < 6.25 ? { x: lerp(360, 700, keyP), y: 1212, a: lerp(.2, -.05, keyP) } : null,
    guest: {
      x: gx, walk: walking ? t * 13 : null, bob: walking ? -Math.abs(Math.sin(t * 13)) * 5 : (t > 3.5 && t < 5.4 ? -Math.abs(Math.sin(t * 9)) * 3 : 0),
      mood: found ? 'happy' : (t > 4.4 ? 'worried' : null), look: -0.8,
      armR: walking ? 0.35 : 0.2,
    },
  };
}
function scene1(t) {
  const cam = s1Cam(t);
  camera(cam[0], cam[1], cam[2], () => {
    ctx.save(); ctx.translate(-1200, 0); drawBackOffice(t, P(t, 0.25, 0.65)); ctx.restore();
    drawReception(receptionS1(t));
    // pacote de informação da reserva
    if (t > 1.2 && t < 2.5) {
      const p = eio(P(t, 1.25, 2.3));
      const x0 = -591, y0 = 1006, x1 = 560, y1 = 1000;
      const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * 220;
      dataPacket(x, y, 'Reserva 204', lerp(1, 1.9, p), 1 - P(t, 2.3, 2.45));
    }
    // fragmentos: a informação se perde no caminho
    if (t > 2.3 && t < 3.2) {
      const p = P(t, 2.3, 3.1);
      for (let i = 0; i < 14; i++) {
        const a = rnd(i) * TAU, d = eo(p) * (80 + rnd(i + 9) * 140);
        ctx.save(); ctx.globalAlpha *= 1 - p; ctx.translate(560 + Math.cos(a) * d, 1000 + Math.sin(a) * d + p * 60); ctx.rotate(p * 4 * (rnd(i + 3) - .5));
        fillRR(-12, -12, 24, 24, 5, i % 3 ? C.orange : C.orange2); ctx.restore();
      }
    }
    if (t > 2.45 && t < 4.6) {
      const a = win(t, 2.45, 4.6, .25, .4), s = eback(P(t, 2.45, 2.8));
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(560, 990 - P(t, 2.45, 4.6) * 30); ctx.scale(s, s);
      circle(0, 0, 44, '#fff'); ring(0, 0, 44, C.orange, 6); txt('?', 0, 3, 56, C.orange, 900); ctx.restore();
    }
    // hóspede aguardando: "..."
    if (t > 3.5 && t < 5.45) {
      const s = eback(P(t, 3.5, 3.8)) * (1 - P(t, 5.3, 5.45));
      bubble(850, 1080, 150, 80, s, () => { for (let i = 0; i < 3; i++) circle(-40 + i * 40, 0, 10 + 3 * Math.max(0, Math.sin(t * 8 - i)), C.navy); });
    }
  });
  return cam;
}

/* ---- CENA 2: restaurante e conta do quarto (6,5 – 12,2) ---- */
const REST_MINI = { x: 90, y: 1110, w: 430 };
const REC_MINI = { x: 530, y: 650, w: 420 };
function restaurantState(t) {
  return { t, tent: P(t, 7.15, 7.3), food: eio(P(t, 8.0, 8.4)), tap: win(t, 8.25, 8.55, .08, .15), guestMood: 'happy' };
}
function receptionIdle(t, contaState) {
  return { t, monA: () => uiConta(contaState), monB: () => uiHosp(true), rec: { look: 0.6, mood: contaState ? 'happy' : null }, guest: null };
}
function pathPt(p) { // quadrática do restaurante para a recepção
  const a = [520, 1250], c = [860, 1240], b = [700, 985];
  const x = (1 - p) * (1 - p) * a[0] + 2 * (1 - p) * p * c[0] + p * p * b[0];
  const y = (1 - p) * (1 - p) * a[1] + 2 * (1 - p) * p * c[1] + p * p * b[1];
  return [x, y];
}
function drawPath(p0, p1, col, lw, dash) {
  ctx.save(); ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const [x, y] = pathPt(lerp(p0, p1, i / 40)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.restore();
}
function sectorTag(x, y, label, alpha = 1, icon) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; font(28, 800); const w = ctx.measureText(label).width + (icon ? 82 : 44);
  shadow(12, 4); fillRR(x - w / 2, y - 26, w, 52, 26, C.navy); noShadow();
  if (icon) { SECTOR_ICONS[icon](x - w / 2 + 34, y, 30, '#fff'); txt(label, x - w / 2 + 60, y + 1, 28, '#fff', 800, 'left'); }
  else txt(label, x, y + 1, 28, '#fff', 800);
  ctx.restore();
}
function scene2(t) {
  const mp = eio(P(t, 8.85, 9.6)); // mapa
  const out = eio(P(t, 12.2, 12.8));
  if (mp > 0) mapBG(1, t);
  // restaurante
  const rs = restaurantState(t);
  const rc = restCam(t, mp);
  ctx.save(); ctx.globalAlpha *= 1 - P(t, 12.2, 12.5);
  cardScene(() => camera(rc[0], rc[1], rc[2], () => drawRestaurant(rs)), mp, REST_MINI);
  ctx.restore();
  if (mp > 0) {
    // recepção em miniatura
    const ra = P(t, 9.15, 9.55);
    if (t < T.s3) {
      ctx.save(); ctx.globalAlpha *= ra; ctx.translate(REC_MINI.x + REC_MINI.w / 2, REC_MINI.y + 150); ctx.scale(lerp(.85, 1, eo(ra)), lerp(.85, 1, eo(ra))); ctx.translate(-(REC_MINI.x + REC_MINI.w / 2), -(REC_MINI.y + 150));
      cardScene(() => drawReception(receptionIdle(t, 0)), 1, REC_MINI); ctx.restore();
    }
    const la = P(t, 9.3, 9.6) * (1 - P(t, 12.2, 12.45));
    sectorTag(REST_MINI.x + 150, REST_MINI.y - 2, 'Restaurante', la, 'restaurante');
    sectorTag(REC_MINI.x + 140, REC_MINI.y - 2, 'Recepção', la * ra, 'recepcao');
    // caminho
    const dp = eio(P(t, 9.35, 9.85));
    ctx.save(); ctx.globalAlpha *= 1 - P(t, 12.2, 12.45);
    drawPath(0, dp, C.gray2, 10, [4, 18]);
    const pp = 0.5 * eo(P(t, 9.7, 10.75));
    drawPath(0, pp, C.orange, 10);
    if (t > 9.6) {
      const shake = t > 10.75 ? Math.sin(t * 40) * 3 * Math.exp(-(t - 10.75) * 3) : 0;
      const [x, y] = pathPt(pp);
      dataPacket(x + shake, y, 'Consumo 204', .95, P(t, 9.6, 9.8), C.orange, 'cutlery');
      if (t > 10.75) {
        const s = eback(P(t, 10.75, 11.05)); const pulse = 1 + .06 * Math.sin((t - 10.75) * 9);
        ctx.save(); ctx.translate(x, y - 86); ctx.scale(s * pulse, s * pulse);
        shadow(16, 6); fillRR(-118, -32, 236, 64, 32, '#fff'); noShadow(); strokeRR(-118, -32, 236, 64, 32, C.orange, 5);
        iconClock(-76, 0, 20, t); txt('Pendente', 16, 2, 30, C.orange, 900); ctx.restore();
      }
    }
    ctx.restore();
  }
  // transição: cartão-chave do quarto 204 (vem da cena 1)
  // painel do pedido (tablet ampliado)
  if (t > 7.85 && t < 9.1) {
    const a = win(t, 7.85, 9.1, .25, .3), s = eback(P(t, 7.85, 8.15));
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(560, 790); ctx.scale(s, s);
    shadow(30, 12, 'rgba(11,37,84,.3)'); fillRR(-300, -140, 600, 280, 30, '#fff'); noShadow();
    fillRR(-300, -140, 600, 70, [30, 30, 0, 0], C.navy); txt('Pedido · Quarto 204', -270, -104, 32, '#fff', 800, 'left');
    iconCutlery(-250, -16, 38, C.blue); txt('Jantar', -215, -16, 30, C.ink, 700, 'left');
    fillRR(60, -36, 200, 40, 20, C.sky); txt('+ bebida', 160, -15, 24, C.blue, 700);
    const pr = win(t, 8.25, 8.55, .06, .2);
    ctx.save(); ctx.translate(0, 72); ctx.scale(1 - pr * .05, 1 - pr * .05);
    fillRR(-250, -38, 500, 76, 38, pr > .3 ? '#E06510' : C.orange); txt('Lançar na conta do quarto', 0, 1, 30, '#fff', 800); ctx.restore();
    if (pr > 0) { ctx.globalAlpha *= (1 - P(t, 8.25, 8.7)); ring(120, 80, 20 + 80 * P(t, 8.25, 8.7), C.orange, 6); }
    ctx.restore();
  }
  if (t > 7.4 && t < 8.6) {
    const s = eback(P(t, 7.4, 7.7)) * (1 - P(t, 8.4, 8.6));
    const [bx, by] = w2s(restCam(t, 0), 300, 1010);
    bubble(bx, by, 210, 110, s, () => { iconCutlery(-45, 0, 54, C.blue); circle(40, 0, 26, C.blue3); fillRR(28, -16, 24, 30, [3, 3, 8, 8], C.blue); });
  }
}

function restCam(t, mp) { const z = lerp(1, 1.06, P(t, 6.8, 8.85)); return [540, lerp(1185, 1060, mp), lerp(1.12 * z, 1, mp)]; }

/* ---- CENA 3: check-out (12,2 – 18) ---- */
const S3_TOGGLES = [13.5, 14.2, 14.8, 15.3, 15.75, 16.15, 16.5, 16.8, 17.08, 17.33, 17.56, 17.77];
function s3Count(t) { let n = 0; for (const x of S3_TOGGLES) if (t >= x) n++; return n; }
function receptionS3(t) {
  const n = s3Count(t);
  const walkP = P(t, 12.55, 13.35), walking = walkP > 0 && walkP < 1;
  const w1 = win(t, 14.0, 14.95, .2, .2), w2 = win(t, 16.25, 17.2, .2, .2), wt = Math.max(w1, w2);
  const spd = lerp(2, 18, P(t, 12.2, 18) ** 1.6);
  const m = 1.2 + (t - 12.2) * spd * .5;
  return {
    t,
    monA: () => uiHosp(true),
    monB: () => (n % 2 === 0 ? uiConsumo(0) : uiValores()),
    dimA: n % 2 ? 0 : .3, dimB: n % 2 ? .3 : 0,
    glowB: n % 2 === 0 && t > 13.5 ? .6 + .4 * Math.sin(t * 10) : 0,
    notes: 1,
    clock: { m, h: 2.9 + (m - 1.2) / 12 },
    rec: { look: n % 2 ? 0.55 : 1, mood: 'worried', armR: -0.9 + .15 * Math.sin(t * 6) },
    guest: {
      x: lerp(1260, 830, eo(walkP)), walk: walking ? t * 13 : null, bob: walking ? -Math.abs(Math.sin(t * 13)) * 5 : 0,
      mood: t > 15.2 ? 'worried' : null, watch: wt > 0.05,
      armL: lerp(0.12, -1.95, eio(wt)), tilt: lerp(0, -0.12, wt), look: lerp(-0.8, 0.9, wt),
    },
  };
}
function scene3Cam(t) {
  const p = eio(P(t, 12.8, 17.9));
  let z = lerp(1.12, 1.32, p);
  if (t > 15.35) z += 0.07 * Math.exp(-(t - 15.35) * 5) * P(t, 15.35, 15.42) + 0.04 * P(t, 15.35, 15.5);
  return [lerp(540, 575, p), lerp(1185, 1200, p), z];
}
function scene3(t) {
  const zp = eio(P(t, 12.2, 12.85)); // da miniatura para tela cheia
  const st = receptionS3(t);
  if (zp < 1) mapBG(1, t);
  const c3 = scene3Cam(t), cam = [lerp(540, c3[0], zp), lerp(1060, c3[1], zp), lerp(1, c3[2], zp)];
  cardScene(() => camera(cam[0], cam[1], cam[2], () => drawReception(st)), 1 - zp, REC_MINI);
  // vinheta de tensão
  const v = P(t, 15.4, 17.9) * (1 - P(t, 17.9, 18.1));
  if (v > 0) { const g = ctx.createRadialGradient(540, 1000, 500, 540, 1000, 1150); g.addColorStop(0, 'rgba(255,122,26,0)'); g.addColorStop(1, `rgba(255,122,26,${.22 * v * (0.8 + .2 * Math.sin(t * 9))})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
}

/* ---- CENA 4: visão do hotel inteiro (18 – 24) ---- */
const TILES = [
  { id: 'reservas', label: 'Reservas', x: 120, y: 690 },
  { id: 'recepcao', label: 'Recepção', x: 640, y: 690 },
  { id: 'gestao', label: 'Gestão', x: 380, y: 960 },
  { id: 'quartos', label: 'Quartos', x: 120, y: 1230 },
  { id: 'restaurante', label: 'Restaurante', x: 640, y: 1230 },
];
const TW = 280, TH = 219;
const EDGES = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [1, 4], [0, 3]];
function tileCenter(i, t) {
  const tl = TILES[i];
  const snap = eback(P(t, 21.0, 21.45));
  const jx = (1 - snap) * (rnd(i * 3) - .5) * 26 * P(t, 19.2, 19.8), jy = (1 - snap) * (rnd(i * 5) - .5) * 22 * P(t, 19.2, 19.8);
  let x = tl.x + TW / 2 + jx, y = tl.y + TH / 2 + jy;
  const c = eio(P(t, 23.15, 23.9));
  x = lerp(x, 540, c); y = lerp(y, 1000, c);
  return [x, y];
}
function tileScale(i, t) {
  if (i === 1) return 1 - eio(P(t, 23.15, 23.9));
  return eback(P(t, 18.5 + i * .14, 18.85 + i * .14)) * (1 - eio(P(t, 23.15, 23.9)));
}
function drawTile(i, t, contentAlpha = 1) {
  const tl = TILES[i]; const s = tileScale(i, t); if (s <= 0.001) return;
  const [cx, cy] = tileCenter(i, t);
  const rot = (1 - eback(P(t, 21.0, 21.45))) * (rnd(i + 7) - .5) * .09 * P(t, 19.2, 19.8);
  const ok = P(t, 21.6 + i * .16, 21.85 + i * .16);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
  shadow(26, 10, 'rgba(11,37,84,.2)'); fillRR(-TW / 2, -TH / 2, TW, TH, 28, '#fff'); noShadow();
  strokeRR(-TW / 2, -TH / 2, TW, TH, 28, ok > 0 ? C.blue : C.gray3, 4);
  ctx.globalAlpha *= contentAlpha;
  circle(0, -24, 62, ok > 0 ? C.blue : C.sky2);
  SECTOR_ICONS[tl.id](0, -24, 70, ok > 0 ? '#fff' : C.navy2);
  txt(tl.label, 0, 72, 32, C.navy, 800);
  if (ok > 0) iconCheck(TW / 2 - 30, -TH / 2 + 30, 22, C.green, '#fff', eback(ok));
  ctx.restore();
}
function edgePt(e, p, t) { const [a, b] = EDGES[e]; const A = tileCenter(a, t), B = tileCenter(b, t); return [lerp(A[0], B[0], p), lerp(A[1], B[1], p)]; }
function scene4(t) {
  mapBG(1, t);
  const conn = P(t, 21.0, 21.9);
  const ea = P(t, 19.0, 19.6) * (1 - P(t, 23.3, 23.9));
  // ligações
  EDGES.forEach((e, k) => {
    const A = tileCenter(e[0], t), B = tileCenter(e[1], t);
    ctx.save(); ctx.globalAlpha *= ea;
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.strokeStyle = C.gray2; ctx.lineWidth = 8; ctx.setLineDash([6, 18]); ctx.lineCap = 'round';
    ctx.lineDashOffset = Math.floor(t * 4) % 2 ? 0 : 6; ctx.stroke(); ctx.setLineDash([]);
    const cp = eio(clamp(conn * 1.6 - k * .08));
    if (cp > 0) { ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(lerp(A[0], B[0], cp), lerp(A[1], B[1], cp)); ctx.strokeStyle = C.blue; ctx.lineWidth = 10; ctx.stroke(); }
    ctx.restore();
  });
  // circulação de informações
  if (t > 19.4 && t < 23.6) {
    const flow = t > 21.0;
    EDGES.forEach((e, k) => {
      const nd = flow ? 3 : (k % 3 === 0 ? 1 : 0);
      for (let d = 0; d < nd; d++) {
        let p;
        if (flow) p = ((t - 21) * .55 + d / 3 + rnd(k) ) % 1;
        else { const lt = (t - 19.4 + rnd(k) * 1.2) % 1.6; p = Math.min(.5, lt * .6) ; }
        const [x, y] = edgePt(k, k % 2 ? 1 - p : p, t);
        ctx.save(); ctx.globalAlpha *= ea * (flow ? P(t, 21.2, 21.6) : 1);
        if (flow) { circle(x, y, 12, '#fff'); circle(x, y, 8, C.blue2); }
        else { circle(x, y, 12, C.orange); if (p >= .5) { ring(x, y, 16 + 6 * Math.sin(t * 12), C.orange, 3); } }
        ctx.restore();
      }
    });
  }
  // brilho central antes da logo
  const gl = P(t, 23.3, 24.0);
  if (gl > 0) { const g = ctx.createRadialGradient(540, 1000, 0, 540, 1000, 420 * gl + 50); g.addColorStop(0, `rgba(255,255,255,${gl})`); g.addColorStop(.5, `rgba(76,141,246,${.4 * gl})`); g.addColorStop(1, 'rgba(76,141,246,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  // cartões
  for (let i = 0; i < TILES.length; i++) if (i !== 1) drawTile(i, t);
  // a recepção em tela cheia vira o cartão "Recepção"
  const zp = eio(P(t, 18.0, 18.9));
  if (t > 18.85) drawTile(1, t, P(t, 18.9, 19.3));
  if (t < 19.3) {
    const cam = scene3Cam(17.99);
    const ca = 1 - P(t, 18.9, 19.3);
    const tgt = { x: TILES[1].x, y: TILES[1].y + (TH - TW * REGION.h / REGION.w) / 2, w: TW };
    ctx.save(); ctx.globalAlpha *= ca;
    cardScene(() => camera(lerp(cam[0], 540, zp), lerp(cam[1], 1060, zp), lerp(cam[2], 1, zp), () => drawReception(receptionS3(17.99))), zp, tgt);
    ctx.restore();
  }
}

/* ---- LOGO (24 – 25,6) ---- */
function logoBG(alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const g = ctx.createRadialGradient(540, 900, 50, 540, 900, 1300); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#DCE8F8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function bgNetwork(t, alpha) { // rede sutil ao fundo nas cenas da TC
  ctx.save(); ctx.globalAlpha *= alpha;
  const pts = []; for (let i = 0; i < 14; i++) pts.push([rnd(i) * W + Math.sin(t * .4 + i) * 20, 150 + rnd(i + 30) * 1650 + Math.cos(t * .3 + i) * 20]);
  ctx.strokeStyle = 'rgba(31,102,224,.10)'; ctx.lineWidth = 3;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < 360) { ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); ctx.stroke(); } }
  for (const p of pts) circle(p[0], p[1], 6, 'rgba(31,102,224,.16)');
  ctx.restore();
}
function headerLogo(t) { // posição da logo após a revelação
  const m = eio(P(t, 25.25, 25.75));
  return { x: 540, y: lerp(990, 330, m), h: lerp(330, 128, m) };
}
function sceneLogo(t) {
  logoBG(); bgNetwork(t, P(t, 24, 24.6));
  const s = eback(P(t, 24.0, 24.45));
  for (let k = 0; k < 3; k++) {
    const p = P(t, 24.0 + k * .12, 25.0 + k * .12);
    if (p > 0 && p < 1) ring(540, 960, 120 + eo(p) * 520, k === 1 ? `rgba(255,122,26,${.6 * (1 - p)})` : `rgba(31,102,224,${.45 * (1 - p)})`, 10 * (1 - p) + 2);
  }
  for (let i = 0; i < 22; i++) { const p = P(t, 24.0, 25.1); if (p <= 0 || p >= 1) continue; const a = rnd(i) * TAU, d = eo(p) * (260 + rnd(i + 4) * 360); circle(540 + Math.cos(a) * d, 960 + Math.sin(a) * d, 8 * (1 - p), i % 3 ? C.blue2 : C.orange); }
  const hl = headerLogo(t);
  ctx.save(); ctx.translate(hl.x, hl.y); ctx.scale(lerp(.6, 1, s), lerp(.6, 1, s)); drawLogo(0, 0, hl.h, clamp(s * 1.5)); ctx.restore();
  const fl = 1 - P(t, 24.0, 24.35); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
}

/* ---- SERVIÇOS (25,6 – 36) ---- */
const SERVICES = [
  { title: 'Consultoria em TI', text: 'Orientação para suas decisões de tecnologia.', draw: svcConsultTI },
  { title: 'Infraestrutura', text: 'A base tecnológica da sua operação.', draw: svcInfra },
  { title: 'Suporte técnico', text: 'Apoio para resolver os problemas do dia a dia.', draw: svcSupport },
  { title: 'Consultoria em hotelaria', text: 'Um olhar sobre as necessidades do seu hotel.', draw: svcHotel },
];
function tcPro(x, y, s, o = {}) { person(x, y, s, Object.assign({ shirt: C.blue, badge: true, skin: C.skin2, hair: C.hair3 }, o)); }
function manager(x, y, s, o = {}) { person(x, y, s, Object.assign({ shirt: '#2C3E63', collar: true, tie: C.orange, skin: C.skin1, hair: C.hair2 }, o)); }
function meetingTable(y) { shadow(20, 8); fillRR(200, y, 680, 26, 12, '#fff'); noShadow(); fillRR(230, y + 26, 620, 14, 6, C.sky3); fillRR(260, y + 40, 18, 110, 4, C.navy2); fillRR(802, y + 40, 18, 110, 4, C.navy2); }
function board(x, y, w, h, title) {
  shadow(26, 10); fillRR(x, y, w, h, 26, '#fff'); noShadow();
  fillRR(x, y, w, 64, [26, 26, 0, 0], C.navy); txt(title, x + 30, y + 33, 28, '#fff', 800, 'left');
  circle(x + w - 34, y + 32, 8, C.orange); circle(x + w - 58, y + 32, 8, 'rgba(255,255,255,.5)');
}
function svcConsultTI(u) {
  board(150, 690, 780, 420, 'Planejamento de TI');
  const icons = [iconMonitor, iconRouter, iconPrinter, iconServer, iconLaptop, iconPhone];
  const org = eio(P(u, 0.45, 1.15));
  icons.forEach((fn, i) => {
    const mx = 250 + rnd(i + 2) * 560, my = 800 + rnd(i + 11) * 230, ma = (rnd(i + 5) - .5) * 1.1;
    const ox = 225 + i * 126, oy = 806;
    const x = lerp(mx, ox, org), y = lerp(my, oy, org), a = lerp(ma, 0, org);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); circle(0, 0, 46, org > .9 ? C.sky : C.sky2); fn(0, 0, 58, C.navy2); ctx.restore();
    if (org < .5) { ctx.save(); ctx.globalAlpha *= 1 - org * 2; circle(x + 34, y - 34, 14, C.orange); txt('!', x + 34, y - 33, 20, '#fff', 900); ctx.restore(); }
  });
  ['Diagnóstico', 'Prioridades', 'Plano de ação'].forEach((s, i) => {
    const p = eback(P(u, 1.05 + i * .32, 1.35 + i * .32)); if (p <= 0) return;
    const y = 900 + i * 64;
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(200 + (1 - clamp(p)) * 40, y);
    fillRR(0, 0, 680, 50, 25, C.sky); iconCheck(30, 25, 18, C.green, '#fff', clamp(p)); txt(s, 62, 26, 28, C.navy, 700, 'left'); fillRR(400, 18, 240 * clamp(p), 14, 7, C.blue3);
    ctx.restore();
  });
  // profissional e gestor
  tcPro(370, 1450, 1.0, { noLegs: true, mood: 'happy', look: 0.6, armR: lerp(-0.3, -2.5, eio(win(u, 0.3, 2.4, .3, .3))), blink: blinkAt(u, 5) });
  manager(720, 1450, 1.0, { noLegs: true, mood: u > 1.2 ? 'happy' : null, look: -0.4, blink: blinkAt(u, 6) });
  meetingTable(1250);
  iconLaptop(560, 1222, 66, C.navy2);
}
function svcInfra(u) {
  const bx = 160, by = 690, bw = 760, bh = 760;
  // prédio em corte
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(bx - 20, by + 40); ctx.lineTo(bx + bw / 2, by - 10); ctx.lineTo(bx + bw + 20, by + 40); ctx.closePath(); ctx.fill();
  shadow(26, 10); fillRR(bx, by + 34, bw, bh - 34, [0, 0, 24, 24], '#fff'); noShadow();
  const floors = [
    { y: by + 40, label: 'Quartos', items: [['quartos', 360], ['quartos', 560]] },
    { y: by + 280, label: 'Restaurante · Gestão', items: [['restaurante', 360], ['gestao', 560]] },
    { y: by + 520, label: 'Recepção', items: [['recepcao', 520]] },
  ];
  const flow = P(u, 0.5, 0.9);
  floors.forEach((f, i) => {
    fillRR(bx + 12, f.y, bw - 24, 228, 14, i % 2 ? C.sky : '#F7FAFE');
    txt(f.label, bx + 92, f.y + 36, 28, C.navy2, 800, 'left');
    f.items.forEach(([id, x]) => { circle(x, f.y + 140, 50, C.sky2); SECTOR_ICONS[id](x, f.y + 140, 56, C.navy2); });
    // ponto de Wi-Fi
    const ap = P(u, 0.35 + i * .12, 0.55 + i * .12);
    fillRR(780, f.y + 18, 70, 18, 9, C.navy2);
    iconWifi(815, f.y + 74, 70, C.blue, ap > 0 ? ((u * 1.6 + i * .3) % 1.2) / 1.0 * ap : 0);
    // cabo horizontal
    ctx.save(); ctx.globalAlpha *= .9; line(bx + 60, f.y + 204, 780, f.y + 204, flow > 0 ? C.blue : C.gray2, 6); ctx.restore();
  });
  // rack/roteador no térreo
  fillRR(bx + 26, by + 590, 100, 140, 12, C.navy); iconServer(bx + 76, by + 660, 70, C.blue2);
  // cabo vertical
  line(bx + 60, by + 244, bx + 60, by + 724, flow > 0 ? C.blue : C.gray2, 8);
  // dados circulando
  if (flow > 0) {
    const L = [[bx + 60, by + 724], [bx + 60, by + 244], [780, by + 244], [780, by + 484], [bx + 60, by + 484], [bx + 60, by + 724], [780, by + 724]];
    const segs = []; let tot = 0; for (let i = 0; i < L.length - 1; i++) { const d = Math.hypot(L[i + 1][0] - L[i][0], L[i + 1][1] - L[i][1]); segs.push(d); tot += d; }
    for (let k = 0; k < 9; k++) {
      let s = ((u * 520 + k * tot / 9) % tot); let i = 0; while (s > segs[i]) { s -= segs[i]; i++; }
      const q = s / segs[i]; const x = lerp(L[i][0], L[i + 1][0], q), y = lerp(L[i][1], L[i + 1][1], q);
      ctx.save(); ctx.globalAlpha *= flow; circle(x, y, 13, '#fff'); circle(x, y, 9, k % 3 === 0 ? C.orange : C.blue2); ctx.restore();
    }
  }
}
function svcSupport(u) {
  // chamado
  const st = u < 0.7 ? 0 : (u < 1.55 ? 1 : 2);
  shadow(26, 10); fillRR(140, 690, 800, 210, 26, '#fff'); noShadow();
  fillRR(140, 690, 14, 210, [26, 0, 0, 26], st === 2 ? C.green : C.orange);
  txt('Chamado aberto', 190, 740, 26, C.gray, 700, 'left');
  txt('Recepção: computador', 190, 790, 34, C.navy, 800, 'left');
  txt('sem conexão', 190, 838, 34, C.navy, 800, 'left');
  const pills = [['Aberto', C.gray], ['Em atendimento', C.orange], ['Resolvido', C.green]];
  const pp = eback(P(u, [0, .7, 1.55][st], [0, .7, 1.55][st] + .25));
  ctx.save(); ctx.translate(780, 744); ctx.scale(pp, pp); font(26, 800); const pw = ctx.measureText(pills[st][0]).width + 50;
  fillRR(-pw / 2 + 40, -24, pw, 48, 24, pills[st][1]); txt(pills[st][0], 40, 1, 26, '#fff', 800); ctx.restore();
  if (st === 2) iconCheck(880, 834, 26, C.green, '#fff', eback(P(u, 1.55, 1.85)));
  // recepção retomando
  const ok = st === 2;
  shadow(20, 8); fillRR(130, 1250, 520, 190, [0, 0, 14, 14], '#fff'); noShadow(); fillRR(120, 1230, 540, 26, 10, C.navy);
  person(260, 1440, 1, { shirt: C.navy2, collar: true, skin: C.skin2, hair: C.hair2, hairStyle: 'bun', noLegs: true, mood: ok ? 'happy' : 'worried', look: 0.8, armR: ok ? -2.5 + .25 * Math.sin(u * 10) : -0.3, blink: blinkAt(u, 7) });
  shadow(20, 8); fillRR(130, 1250, 520, 190, [0, 0, 14, 14], '#fff'); noShadow(); fillRR(120, 1230, 540, 26, 10, C.navy); fillRR(150, 1320, 480, 8, 4, C.blue3);
  monitor(400, 1090, 220, 140, () => {
    if (!ok) { uiHeader('Recepção', '#5C6F91'); ctx.save(); ctx.translate(200, 150); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(50, 40); ctx.lineTo(-50, 40); ctx.closePath(); ctx.fill(); txt('!', 0, 10, 50, '#fff', 900); ctx.restore(); }
    else { uiHeader('Recepção'); iconCheck(200, 150, 50, C.green); }
  }, { glow: ok ? win(u, 1.55, 2.6, .1, .4) : 0 });
  // equipamento + técnico
  fillRR(690, 1270, 110, 170, 12, C.navy2); for (let i = 0; i < 3; i++) fillRR(706, 1294 + i * 30, 78, 16, 6, 'rgba(255,255,255,.2)');
  circle(770, 1400, 9, ok ? '#7CF0B8' : (Math.sin(u * 14) > 0 ? C.orange : '#7A4A2A'));
  ctx.save(); ctx.strokeStyle = C.navy2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(700, 1300); ctx.bezierCurveTo(660, 1300, 660, 1200, 620, 1200); ctx.stroke(); ctx.restore();
  const work = u > 0.7 && u < 1.6;
  tcPro(880, 1452, 1.0, { mood: 'happy', look: -0.8, armL: work ? 1.15 + .25 * Math.sin(u * 16) : 0.3, armR: -0.2, blink: blinkAt(u, 8), pants: C.navy,
    holdL: () => { iconWrench(0, 96, 46, C.gray, 0.4); } });
  if (work) for (let i = 0; i < 4; i++) { const a = -1.2 + i * .5 + Math.sin(u * 20 + i) * .2; line(770 + Math.cos(a) * 60, 1300 + Math.sin(a) * 60, 770 + Math.cos(a) * 82, 1300 + Math.sin(a) * 82, C.orange, 5); }
  if (u > 0.2 && u < 0.95) { const s = eback(P(u, .2, .45)) * (1 - P(u, .8, .95)); ctx.save(); ctx.translate(560, 990); ctx.scale(s, s); circle(0, 0, 40, C.orange); iconBell(0, 3, 44, '#fff'); ctx.restore(); }
}
function svcHotel(u) {
  board(150, 690, 780, 470, 'Rotina do hotel');
  const cx = 540, cy = 935, R = 150;
  const nodes = ['reservas', 'recepcao', 'restaurante', 'quartos', 'gestao'];
  const pos = nodes.map((n, i) => { const a = -Math.PI / 2 + i / 5 * TAU; return [cx + Math.cos(a) * R * 1.55, cy + Math.sin(a) * R * .95]; });
  for (let i = 0; i < 5; i++) { const A = pos[i], B = pos[(i + 1) % 5]; line(A[0], A[1], B[0], B[1], C.blue3, 6); line(A[0], A[1], cx, cy, C.sky3, 4); }
  circle(cx, cy, 30, C.navy); txt('TC', cx, cy + 1, 22, '#fff', 900);
  const scan = clamp((u - 0.35) / 1.75) * 5; const cur = Math.min(4, Math.floor(scan));
  nodes.forEach((n, i) => {
    const [x, y] = pos[i]; const done = scan > i + .7;
    circle(x, y, 52, done ? C.blue : C.sky2); SECTOR_ICONS[n](x, y, 52, done ? '#fff' : C.navy2);
    if (done) iconCheck(x + 40, y - 38, 16, C.orange, '#fff', eback(P(scan, i + .7, i + 1)));
  });
  if (u > 0.3 && u < 2.35) {
    const f = scan - cur; const A = pos[cur], B = pos[Math.min(4, cur + 1)];
    const mx = lerp(A[0], B[0], eio(clamp((f - .7) / .3))), my = lerp(A[1], B[1], eio(clamp((f - .7) / .3)));
    ctx.save(); ctx.globalAlpha *= win(u, .3, 2.35, .2, .3); iconMagnifier(mx + 18, my + 18, 120, C.orange); ctx.restore();
  }
  tcPro(370, 1450, 1.0, { noLegs: true, mood: 'happy', look: 0.6, armR: -0.8 + .1 * Math.sin(u * 5), blink: blinkAt(u, 9), hairStyle: 'long', hair: C.hair1, skin: C.skin1 });
  manager(720, 1450, 1.0, { noLegs: true, mood: 'happy', look: -0.5, blink: blinkAt(u, 10), skin: C.skin3, hair: C.hair3 });
  meetingTable(1250);
  ctx.save(); ctx.translate(560, 1236); ctx.rotate(-.08); fillRR(-60, -16, 120, 18, 3, '#fff'); strokeRR(-60, -16, 120, 18, 3, C.gray2, 2); ctx.restore();
}
function serviceHeader(t, i, alpha) {
  const s = SERVICES[i]; const t0 = T.svc + i * SVC_D;
  const p = eback(P(t, t0 + .05, t0 + .4)), q = P(t, t0 + .15, t0 + .5);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.save(); ctx.translate(540, 470); ctx.scale(p, p);
  font(54, 800); const w = ctx.measureText(s.title).width + 150;
  shadow(20, 8, 'rgba(255,122,26,.35)'); fillRR(-w / 2, -48, w, 96, 48, C.orange); noShadow();
  circle(-w / 2 + 48, 0, 30, '#fff'); txt(String(i + 1).padStart(2, '0'), -w / 2 + 48, 1, 26, C.orange, 900);
  txt(s.title, -w / 2 + 92, 2, 54, '#fff', 800, 'left');
  ctx.restore();
  ctx.globalAlpha = alpha * q; font(42, 600);
  const lines = balancedLines(s.text, 900);
  lines.forEach((l, k) => txt(l, 540, 572 + k * 52 + (1 - eo(q)) * 20 + (lines.length === 1 ? 20 : 0), 42, C.navy, 600));
  ctx.restore();
}
function sceneServices(t) {
  logoBG(); bgNetwork(t, 1);
  const k = clamp(Math.floor((t - T.svc) / SVC_D), 0, 3);
  for (let i = Math.max(0, k - 1); i <= k; i++) {
    const t0 = T.svc + i * SVC_D, u = t - t0;
    const inP = i === 0 ? 1 : eio(P(t, t0 - .02, t0 + .38));
    const outP = i < 3 ? eio(P(t, t0 + SVC_D - .02, t0 + SVC_D + .38)) : 0;
    if (outP >= 1) continue;
    const x = (1 - inP) * 1100 - outP * 1100;
    ctx.save(); ctx.translate(x, 0); ctx.globalAlpha *= i === 0 ? P(t, T.svc - .1, T.svc + .35) : 1;
    SERVICES[i].draw(Math.max(0, u)); ctx.restore();
    serviceHeader(t, i, (1 - P(t, t0 + SVC_D - .1, t0 + SVC_D + .15) * (i < 3 ? 1 : 0)) * (i === 3 ? 1 - P(t, T.recap - .1, T.recap + .2) : 1));
  }
  const hl = headerLogo(t); drawLogo(hl.x, hl.y, hl.h);
}

/* ---- RETOMAR A JORNADA (36 – 38,6) ---- */
function recapCard(t, i, y) {
  const t0 = T.recap + .05 + i * .72;
  const p = eback(P(t, t0, t0 + .35)); if (t <= t0) return;
  const out = eio(P(t, T.end - .1, T.end + .35));
  const labels = [['Reserva', 'localizada'], ['Consumo', 'na conta'], ['Check-out', 'concluído']];
  ctx.save(); ctx.translate(540 + (1 - clamp(p)) * 300, y + 130 - out * 200); ctx.globalAlpha = clamp(p) * (1 - out); ctx.scale(lerp(.9, 1, clamp(p)), lerp(.9, 1, clamp(p)));
  shadow(26, 10); fillRR(-430, -130, 860, 260, 30, '#fff'); noShadow();
  // miniatura
  ctx.save(); rr(-410, -110, 330, 220, 20); ctx.clip(); ctx.fillStyle = C.sky; ctx.fillRect(-410, -110, 330, 220);
  const u = t - t0 + 1;
  if (i === 0 || i === 2) {
    ctx.translate(-245, 0); const sc = 0.5; ctx.scale(sc, sc);
    const cx = i === 0 ? 600 : 640, cy = 1210;
    ctx.translate(-cx, -cy);
    drawReception({
      t: u, monA: i === 0 ? () => uiBusca(u, 1) : () => uiConta(1), monB: i === 0 ? () => uiHosp(true) : () => uiCheckoutOK(), rec: { look: 0.9, mood: 'happy', armR: i === 2 ? -2.4 + .3 * Math.sin(u * 9) : -0.3 },
      glowA: i === 0 ? .8 : 0, glowB: i === 2 ? .8 : 0,
      guest: { x: i === 2 ? 860 + eo(P(t, t0 + .2, t0 + 1.2)) * 60 : 830, mood: 'happy', look: -0.8, armR: i === 2 ? -2.6 + .3 * Math.sin(u * 9) : 0.2 },
    });
  } else {
    ctx.translate(-245, 0);
    shadow(14, 6); fillRR(-120, -88, 240, 176, 16, '#fff'); noShadow();
    fillRR(-120, -88, 240, 46, [16, 16, 0, 0], C.blue); txt('Conta · 204', 0, -64, 24, '#fff', 800);
    txt('Hospedagem', -100, -12, 22, C.navy, 700, 'left'); iconCheck(90, -12, 14, C.green);
    txt('Restaurante', -100, 34, 22, C.navy, 700, 'left'); iconCheck(90, 34, 14, C.green, '#fff', eback(P(t, t0 + .25, t0 + .5)));
    const pp = eo(P(t, t0, t0 + .35)); dataPacket(lerp(-260, -60, pp), 70, '204', .6, 1 - P(t, t0 + .3, t0 + .4), C.orange, 'cutlery');
  }
  ctx.restore();
  txt(labels[i][0], -40, -28, 50, C.navy, 800, 'left');
  txt(labels[i][1], -40, 34, 44, C.blue, 700, 'left');
  iconCheck(360, 0, 40, C.green, '#fff', eback(P(t, t0 + .15, t0 + .45)));
  ctx.restore();
}
function sceneRecap(t) {
  logoBG(); bgNetwork(t, 1);
  [0, 1, 2].forEach(i => recapCard(t, i, 520 + i * 300));
  const hl = headerLogo(t); drawLogo(hl.x, hl.y, hl.h, 1 - P(t, T.end - .1, T.end + .3));
}

/* ---- ENCERRAMENTO (38,6 – 43,5) ---- */
function sceneEnd(t) {
  logoBG(); bgNetwork(t, 1);
  const lp = eback(P(t, T.end + .05, T.end + .55));
  ctx.save(); ctx.translate(540, 700); ctx.scale(lp, lp); drawLogo(0, 0, 300, clamp(lp)); ctx.restore();
  const a1 = eo(P(t, T.end + .45, T.end + .85)), a2 = eo(P(t, T.end + .65, T.end + 1.05));
  ctx.save(); ctx.globalAlpha *= a1; txt('Da reserva ao check-out,', 540, 940 + (1 - a1) * 24, 60, C.navy, 800); ctx.restore();
  ctx.save(); ctx.globalAlpha *= a2; font(60, 800); const w1 = ctx.measureText('conte com a ').width, w2 = ctx.measureText('TC.').width;
  const x0 = 540 - (w1 + w2) / 2; txt('conte com a ', x0, 1016 + (1 - a2) * 24, 60, C.navy, 800, 'left'); txt('TC.', x0 + w1, 1016 + (1 - a2) * 24, 60, C.orange, 900, 'left'); ctx.restore();
  const a3 = eo(P(t, T.end + 1.2, T.end + 1.6));
  ctx.save(); ctx.globalAlpha *= a3;
  fillRR(440, 1074, 200, 6, 3, C.orange);
  txt('Consultoria em TI • Infraestrutura • Suporte técnico', 540, 1122, 31, C.navy2, 700);
  txt('Consultoria em hotelaria', 540, 1168, 31, C.navy2, 700);
  ctx.restore();
  const a4 = eback(P(t, T.end + 1.9, T.end + 2.3));
  if (a4 > 0) {
    ctx.save(); ctx.translate(540, 1280); const pulse = 1 + .025 * Math.sin((t - T.end) * 5) * P(t, T.end + 2.3, T.end + 2.6); ctx.scale(a4 * pulse, a4 * pulse);
    shadow(24, 10, 'rgba(255,122,26,.4)'); fillRR(-380, -50, 760, 100, 50, C.orange); noShadow();
    txt('Converse com a nossa equipe.', 0, 2, 40, '#fff', 800); ctx.restore();
  }
  const a5 = eo(P(t, T.end + 2.3, T.end + 2.7));
  ctx.save(); ctx.globalAlpha *= a5; txt('@tc_solucoes', 540, 1400 + (1 - a5) * 20, 56, C.blue, 900); ctx.restore();
  const fade = P(t, DUR - .5, DUR); if (fade > 0) { ctx.fillStyle = `rgba(255,255,255,${fade * .0})`; ctx.fillRect(0, 0, W, H); }
}

/* =====================================================================
   RENDER
   ===================================================================== */
let showSafe = false;
function drawSafeZones() {
  ctx.save(); ctx.fillStyle = 'rgba(255,0,80,.18)';
  ctx.fillRect(0, 0, W, 220); ctx.fillRect(0, 1500, W, 420); ctx.fillRect(950, 900, 130, 600);
  ctx.restore();
}
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.sky; ctx.fillRect(0, 0, W, H);
  if (t < T.s2 + .9) { scene1(Math.min(t, T.s2 + .9)); }
  if (t >= 6.55 && t < T.s3 + .9) {
    ctx.save(); ctx.globalAlpha *= t < T.s3 ? P(t, 6.55, 6.85) : 1; scene2(t); ctx.restore();
  }
  // cartão-chave 204 (transição recepção → restaurante)
  if (t > 6.05 && t < 7.3) {
    const cam = s1Cam(Math.min(t, 6.2));
    const st = receptionS1(6.05); const [sx, sy] = w2s(cam, st.key.x, st.key.y);
    const a = eio(P(t, 6.05, 6.55)), b = eio(P(t, 6.75, 7.2));
    const z0 = 80 * cam[2];
    const [tx, ty] = w2s(restCam(t, 0), 640, 1218); const zr = restCam(t, 0)[2];
    let x = lerp(sx, 540, a), y = lerp(sy, 1000, a), w = lerp(z0, 760, a);
    x = lerp(x, tx, b); y = lerp(y, ty, b); w = lerp(w, 64 * zr, b);
    keyCardBig(x, y, w, 1 - P(t, 7.12, 7.3));
  }
  if (t >= T.s3 && t < T.s4 + .02) scene3(t);
  if (t >= T.s4 && t < T.logo) scene4(t);
  if (t >= T.logo && t < T.svc) sceneLogo(t);
  if (t >= T.svc && t < T.recap) sceneServices(t);
  if (t >= T.recap && t < T.end) sceneRecap(t);
  if (t >= T.end) sceneEnd(t);
  // transição suave entre logo → serviços (fundo igual)
  // textos principais
  headline(t, 2.75, 6.25, [[['A reserva chegou.']], [['A informação também?', C.orange]]]);
  headline(t, 8.45, 12.05, [[['O consumo do restaurante']], [['entrou na conta?', C.orange]]]);
  headline(t, 12.55, 15.25, [[['Na saída,']], [['tudo precisa '], ['fechar.', C.orange]]]);
  headline(t, 15.4, 17.95, [[['Sua tecnologia']], [['acompanha a operação?', C.orange]]]);
  headline(t, 18.55, 20.95, [[['Seu hotel funciona']], [['em conjunto.', C.orange]]]);
  headline(t, 21.05, 23.55, [[['A tecnologia precisa']], [['acompanhar.', C.orange]]]);
  if (showSafe) drawSafeZones();
}
window.renderFrame = renderFrame;
window.DUR = DUR; window.FPS = FPS;

/* ---------- modo prévia (navegador) ---------- */
if (!/render/.test(location.search)) {
  const btn = document.getElementById('play'), tc = document.getElementById('tc');
  document.getElementById('safe').onchange = e => { showSafe = e.target.checked; };
  const audio = new Audio('out/audio.wav');
  let start = null, playing = false;
  window.ready.then(() => renderFrame(0));
  btn.onclick = () => {
    if (playing) { playing = false; audio.pause(); btn.textContent = '▶ Reproduzir'; return; }
    playing = true; btn.textContent = '❚❚ Pausar'; audio.currentTime = 0; audio.play().catch(() => {}); start = performance.now();
    const loop = now => { if (!playing) return; const t = (now - start) / 1000; if (t > DUR) { playing = false; btn.textContent = '▶ Reproduzir'; return; } renderFrame(t); tc.textContent = t.toFixed(1) + 's'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };
} else { document.body.classList.add('render'); }
