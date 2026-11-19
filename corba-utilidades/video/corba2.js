'use strict';
/* Corbã Utilidades — versão 2 (com o guia). 1080x1920, 92 s, sincronizado com audio/locucao-final.wav (90 s, ritmo natural).
   Dependências: clips.js (trechos reais), dados.js (palavras, legendas, rotas OSM, mapas), cenarios.js (ilustrações), guia.js (personagem). */
const W = 1080, H = 1920, FPS = 30, DUR = 92.0;
const ctx = cx;
const C = { red: '#E2231A', red2: '#B9170F', blue: '#3FA2E8', navy: '#1B2F8F', navy2: '#0E1A5C', green: '#1FAF5A', wa: '#25D366', ink: '#0E1A44' };

/* ---------- carregamento ---------- */
const IMG = {};
function loadImg(k, src) { return new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = r; i.src = src; }); }
window.ready = Promise.all([
  loadImg('logo', '../assets/logo.png'), loadImg('pm', '../assets/pokermoon.png'),
  ...Object.entries(MAPAS).map(([k, m]) => loadImg(k, '../mapas/' + m.img)),
  document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter'), document.fonts.load('600 60px Inter'),
]).catch(() => {});
const FR = new Map();
function frameKey(c, t) { return `${c.id}/${String(Math.min(c.n, Math.max(1, Math.floor((t - c.t0) * 30) + 1))).padStart(4, '0')}`; }
window.prepare = async t => {
  const keys = CLIPS.filter(c => t >= c.t0 - .04 && t <= c.t1 + .04).map(c => frameKey(c, t));
  await Promise.all(keys.map(k => FR.has(k) ? null : new Promise(r => { const i = new Image(); i.onload = () => { FR.set(k, i); r(); }; i.onerror = r; i.src = `out/frames/${k}.jpg`; })));
  if (FR.size > 60) for (const k of [...FR.keys()]) { if (!keys.includes(k)) FR.delete(k); if (FR.size <= 30) break; }
};
const CL = id => CLIPS.find(x => x.id === id);
function clipImg(id, t) { return FR.get(frameKey(CL(id), t)); }
// desenha o vídeo cobrindo o retângulo (x,y,w,h) com cantos arredondados
function clipBox(id, t, x, y, w, h, r = 0, zoom = 1, alpha = 1) {
  const im = clipImg(id, t); if (!im || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; rr(x, y, w, h, r); ctx.clip();
  const s = Math.max(w / 1080, h / 1920) * zoom; ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.drawImage(im, -540, -960, 1080, 1920); ctx.restore();
}
function clipFull(id, t, zoom = 1, alpha = 1) { clipBox(id, t, 0, 0, W, H, 0, zoom, alpha); }
function clipIn(id, t, fi = .3, fo = .3) { const c = CL(id); return Math.min(P(t, c.t0, c.t0 + fi), 1 - P(t, c.t1 - fo, c.t1)); }

/* ---------- utilidades ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b, fi = .3, fo = .3) => Math.min(P(t, a, a + fi), 1 - P(t, b - fo, b));
const WT = (w, after = 0) => (WORDS.find(d => d.w === w && d.t0 >= after) || { t0: 0 }).t0;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function shadow(b, oy, c = 'rgba(14,26,92,.3)') { ctx.shadowColor = c; ctx.shadowBlur = b; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0; }
function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function ring(x, y, r, c, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
function font(s, w = 800) { ctx.font = `${w} ${s}px Inter, "DejaVu Sans", sans-serif`; }
function txt(s, x, y, size, col, w = 800, al = 'center') { font(size, w); ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
function pinIcon(x, y, col, s = 1, glyph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); shadow(14, 6, 'rgba(0,0,0,.35)');
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-18, -26, -34, -40, -34, -62); ctx.arc(0, -62, 34, Math.PI, 0); ctx.bezierCurveTo(34, -40, 18, -26, 0, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); noShadow();
  if (glyph) txt(glyph, 0, -60, 40, '#fff', 900); else circle(0, -62, 13, '#fff');
  ctx.restore();
}
function darken(a) { ctx.fillStyle = `rgba(14,26,92,${a})`; ctx.fillRect(0, 0, W, H); }
function flash(t, at, d = .3) { const f = 1 - Math.abs(t - at) / d; if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f * .9})`; ctx.fillRect(0, 0, W, H); } }
function drawLogo(x, y, d, a = 1) { if (!IMG.logo || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; shadow(24, 10, 'rgba(0,0,0,.35)'); ctx.drawImage(IMG.logo, x - d / 2, y - d / 2, d, d); noShadow(); ctx.restore(); }
// máscara circular: revela a cena `fn` a partir de (x,y)
function irisIn(t, a, b, x, y, fn) { const p = eio(P(t, a, b)); if (p <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(x, y, p * 2300 + 1, 0, TAU); ctx.clip(); fn(); ctx.restore(); if (p < 1) ring(x, y, p * 2300, 'rgba(255,255,255,.9)', 14); }

/* ---------- textos ---------- */
function captions(t) {
  const cap = CAPS.find((c, i) => t >= c.t0 - .08 && t < (CAPS[i + 1] ? Math.min(CAPS[i + 1].t0 - .08, c.t1 + .6) : c.t1 + .6)); if (!cap) return;
  const words = cap.w.map(w => w[0]);
  let size = 58; font(size, 900); const sp = ctx.measureText(' ').width;
  let widths = words.map(w => ctx.measureText(w).width); let tot = widths.reduce((a, b) => a + b, 0) + sp * 1.6 * (words.length - 1);
  if (tot > 900) { size = Math.floor(size * 900 / tot); font(size, 900); widths = words.map(w => ctx.measureText(w).width); tot = widths.reduce((a, b) => a + b, 0) + ctx.measureText(' ').width * 1.6 * (words.length - 1); }
  const pin = eo(P(t, cap.t0 - .08, cap.t0 + .12)); const y = 400 + (1 - pin) * 14; let x = 540 - tot / 2;
  ctx.save(); ctx.globalAlpha = pin; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  words.forEach((w, i) => {
    const on = t >= cap.w[i][1] - .03 && (i === words.length - 1 || t < cap.w[i + 1][1] - .03);
    if (on) { const k = eback(P(t, cap.w[i][1] - .03, cap.w[i][1] + .12)); ctx.save(); ctx.translate(x + widths[i] / 2, y); ctx.scale(k, k); fillRR(-widths[i] / 2 - 14, -size * .62, widths[i] + 28, size * 1.24, 16, C.red); ctx.restore(); }
    font(size, 900); ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = on ? 'rgba(0,0,0,0)' : 'rgba(14,26,92,.85)'; ctx.strokeText(w, x, y + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(w, x, y + 2); x += widths[i] + ctx.measureText(' ').width * 1.6;
  });
  ctx.restore();
}
function addressCard(t, a, b, l1, l2, l3, y = 1010) {
  const al = win(t, a, b, .3, .25); if (al <= 0) return;
  const p = eback(P(t, a, a + .4));
  ctx.save(); ctx.globalAlpha = al; ctx.translate(540, y); ctx.scale(p, p);
  shadow(36, 14, 'rgba(0,0,0,.4)'); fillRR(-440, -125, 880, 250, 36, '#fff'); noShadow();
  fillRR(-440, -125, 440, 16, [36, 0, 0, 0], C.red); fillRR(0, -125, 440, 16, [0, 36, 0, 0], C.blue);
  pinIcon(-360, 60, C.red, 1.2);
  font(56, 900); const s1 = Math.min(56, 56 * 640 / ctx.measureText(l1).width);
  txt(l1, -290, -38, s1, C.navy, 900, 'left'); txt(l2, -290, 26, 42, C.red, 800, 'left'); if (l3) txt(l3, -290, 80, 34, C.navy, 700, 'left');
  ctx.restore();
}
function badge(t, a, b, label, x, y, bg = C.red, size = 50) {
  const al = win(t, a, b, .25, .25); if (al <= 0) return;
  const p = eback(P(t, a, a + .35));
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(p, p); font(size, 900); const w = ctx.measureText(label).width + 80;
  shadow(24, 10); fillRR(-w / 2, -size * .95, w, size * 1.9, size * .95, bg); noShadow(); txt(label, 0, 3, size, '#fff', 900); ctx.restore();
}
function watermark(t) { const a = P(t, 2.28, 2.4) * (1 - P(t, 86.6, 87.0)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; drawLogo(968, 268, 130); ctx.restore(); } }

/* ---------- produtos (ilustrações fiéis à categoria; trocar por fotos de catálogo quando houver) ---------- */
function panela(s) {
  ctx.save(); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-170, 0, 170, 0); g.addColorStop(0, '#9AA5B1'); g.addColorStop(.35, '#F1F4F7'); g.addColorStop(.6, '#C9D1D9'); g.addColorStop(1, '#8D98A5');
  fillRR(-230, -40, 70, 26, 13, '#2B2F38'); fillRR(160, -40, 70, 26, 13, '#2B2F38');
  rr(-170, -80, 340, 190, [10, 10, 40, 40]); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -80, 172, 26, 0, 0, TAU); ctx.fillStyle = '#DCE2E8'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -96, 160, 30, 0, Math.PI, TAU); ctx.fillStyle = '#E7ECF1'; ctx.fill(); ctx.strokeStyle = '#A7B1BC'; ctx.lineWidth = 3; ctx.stroke();
  fillRR(-24, -142, 48, 26, 12, '#2B2F38');
  fillRR(-70, 10, 140, 42, 10, '#fff'); txt('Corbã', 0, 32, 30, C.red, 900);
  ctx.restore();
}
function portaUtensilios(s, t, a) { // a = instante de entrada dos utensílios
  ctx.save(); ctx.scale(s, s);
  const drop = (dx, rot, d, fn) => { const p = P(t, a + d, a + d + .45); if (p <= 0) return; const y = lerp(-520, -150, eo(p)) + (p > .7 ? Math.sin((p - .7) * 20) * 6 * (1 - p) : 0);
    ctx.save(); ctx.translate(dx, y); ctx.rotate(rot); fn(); ctx.restore(); };
  drop(-40, -.18, 0, () => { fillRR(-9, -200, 18, 260, 9, '#C8102E'); ctx.beginPath(); ctx.ellipse(0, -220, 46, 34, 0, 0, TAU); ctx.fillStyle = '#C8102E'; ctx.fill(); });       // concha
  drop(40, .16, .25, () => { fillRR(-9, -200, 18, 260, 9, '#2B2F38'); fillRR(-40, -290, 80, 100, 14, '#2B2F38'); for (let i = 0; i < 3; i++) fillRR(-26 + i * 20, -280, 10, 70, 5, '#555D6B'); }); // espátula
  drop(0, .02, .45, () => { fillRR(-8, -230, 16, 280, 8, '#D8B07A'); ctx.beginPath(); ctx.ellipse(0, -250, 26, 36, 0, 0, TAU); ctx.fillStyle = '#D8B07A'; ctx.fill(); });  // colher de pau
  const g = ctx.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, '#B8C1CB'); g.addColorStop(.4, '#F3F6F9'); g.addColorStop(1, '#9EA8B4');
  rr(-110, -150, 220, 250, [8, 8, 30, 30]); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -150, 110, 20, 0, 0, TAU); ctx.fillStyle = '#6E7783'; ctx.fill();
  ctx.restore();
}
function caixas(s, t, a) {
  ctx.save(); ctx.scale(s, s);
  const cols = [['#8FC9F0', '#5FAEE3'], ['#F6B4C0', '#EE8EA1'], ['#B9E3B0', '#8ACF7B']];
  cols.forEach(([c1, c2], i) => {
    const p = eback(P(t, a + i * .3, a + i * .3 + .45)); if (p <= 0) return;
    const y = 60 - i * 130, x = (1 - clamp(p)) * (i % 2 ? -500 : 500);
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - clamp(p)) * (i % 2 ? -.3 : .3));
    fillRR(-160, -60, 320, 120, 14, c1); fillRR(-160, -60, 320, 26, [14, 14, 0, 0], c2); fillRR(-40, -10, 80, 16, 8, 'rgba(255,255,255,.7)');
    ctx.restore();
  });
  ctx.restore();
}
function vaso(s, t, a) {
  ctx.save(); ctx.scale(s, s);
  fillRR(-220, 120, 440, 22, 8, '#B88A5A');
  const grow = eo(P(t, a + .25, a + 1.1));
  ctx.strokeStyle = '#3E8E4A'; ctx.lineCap = 'round';
  [[-.5, 210], [-.15, 260], [.25, 240], [.6, 190]].forEach(([ang, len], i) => {
    const L = len * grow; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -60); const ex = Math.sin(ang) * L, ey = -60 - Math.cos(ang) * L; ctx.quadraticCurveTo(ex * .3, -60 - L * .6, ex, ey); ctx.stroke();
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(0, 0, 26 * grow, 60 * grow, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#4FA35C' : '#3E8E4A'; ctx.fill(); ctx.restore();
  });
  const g = ctx.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, '#E98C6B'); g.addColorStop(.45, '#F7B79A'); g.addColorStop(1, '#D77556');
  ctx.beginPath(); ctx.moveTo(-60, -70); ctx.quadraticCurveTo(-120, 30, -70, 120); ctx.lineTo(70, 120); ctx.quadraticCurveTo(120, 30, 60, -70); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  fillRR(-70, -84, 140, 20, 10, '#D77556');
  ctx.restore();
}
function toalhas(s, t, a) {
  ctx.save(); ctx.scale(s, s);
  const cols = ['#FFFFFF', '#3FA2E8', '#F4D6C6', '#1B2F8F', '#E2231A'];
  cols.forEach((c, i) => {
    const p = eback(P(t, a + i * .16, a + i * .16 + .4)); if (p <= 0) return;
    const y = 110 - i * 58 - (1 - clamp(p)) * 300;
    ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(0, y);
    shadow(10, 4, 'rgba(0,0,0,.2)'); fillRR(-190, -30, 380, 60, 24, c); noShadow();
    fillRR(-190, 12, 380, 10, 5, 'rgba(0,0,0,.08)'); if (c === '#FFFFFF') { ctx.strokeStyle = '#DDE3EA'; ctx.lineWidth = 3; rr(-190, -30, 380, 60, 24); ctx.stroke(); }
    ctx.restore();
  });
  ctx.restore();
}
/* palco de produtos: cada produto entra pela lateral, cresce, inclina levemente e acomoda com sombra */
const PRODS = [
  { a: WT('panelas') - .05, label: 'Fabricação própria', draw: (t, a) => panela(1.15) },
  { a: WT('utensílios') - .05, label: 'Utensílios de cozinha', draw: (t, a) => portaUtensilios(1.05, t, a) },
  { a: WT('organização,') - .05, label: 'Organização', draw: (t, a) => caixas(1.1, t, a) },
  { a: WT('decoração,') - .05, label: 'Decoração', draw: (t, a) => vaso(1.1, t, a) },
  { a: WT('cama,') - .05, label: 'Cama, mesa e banho', draw: (t, a) => toalhas(1.15, t, a) },
];
function productStage(t, cx0, cy0, end) {
  PRODS.forEach((p, i) => {
    const next = PRODS[i + 1] ? PRODS[i + 1].a : end;
    if (t < p.a || t > next + .4) return;
    const ein = eback(P(t, p.a, p.a + .5)), out = eio(P(t, next - .05, next + .35));
    const x = cx0 + (1 - clamp(ein)) * 600 - out * 700, rot = (1 - clamp(ein)) * .18 - out * .2, sc = lerp(.6, 1, clamp(ein)) * (1 + .03 * Math.sin((t - p.a) * 3));
    ctx.save(); ctx.globalAlpha = clamp(ein * 1.5) * (1 - out);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, cy0 + 150, 230 * sc, 28 * sc, 0, 0, TAU); ctx.fill();
    ctx.translate(x, cy0); ctx.rotate(rot); ctx.scale(sc * .86, sc * .86); p.draw(t, p.a); ctx.restore();
    // rótulo discreto sob o produto
    const la = win(t, p.a + .2, next + .1, .25, .2); if (la > 0) { ctx.save(); ctx.globalAlpha = la * (1 - out); font(40, 900); const w = ctx.measureText(p.label).width + 60;
      fillRR(cx0 - w / 2, cy0 + 205, w, 64, 32, C.navy); txt(p.label, cx0, cy0 + 238, 40, '#fff', 900); ctx.restore(); }
  });
}

/* ---------- mapas de ruas (OpenStreetMap) com o carrinho ---------- */
function gpx(lat, lon, z) { const n = 2 ** z * 256; return [(lon + 180) / 360 * n, (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n]; }
const ROUTE_PX = {};
function routePx(key) {
  if (ROUTE_PX[key]) return ROUTE_PX[key];
  const m = MAPAS['rua_' + key] || MAPAS[key], r = ROTAS[key];
  const pts = r.geom.map(([la, lo]) => { const [x, y] = gpx(la, lo, 16); return [x - m.ox, y - m.oy]; });
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const [dx, dy] = gpx(r.destino[0], r.destino[1], 16);
  return (ROUTE_PX[key] = { pts, cum, L: cum[cum.length - 1], dest: [dx - m.ox, dy - m.oy], m });
}
function alongRoute(R, d) {
  d = clamp(d, 0, R.L); let i = 1; while (i < R.cum.length - 1 && R.cum[i] < d) i++;
  const q = (d - R.cum[i - 1]) / Math.max(1e-6, R.cum[i] - R.cum[i - 1]); const a = R.pts[i - 1], b = R.pts[i];
  // direção suavizada (média das próximas ~25 px)
  let j = i; while (j < R.pts.length - 1 && R.cum[j] - d < 25) j++;
  const c2 = R.pts[j]; return [lerp(a[0], b[0], q), lerp(a[1], b[1], q), Math.atan2(c2[1] - a[1], c2[0] - a[0]) || 0, i];
}
function carTop(x, y, ang, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  shadow(10, 4, 'rgba(0,0,0,.35)'); fillRR(-30, -16, 60, 32, 9, C.red); noShadow();
  fillRR(-10, -13, 22, 26, 5, '#FFFFFF'); fillRR(12, -12, 9, 24, 3, '#9FC3F2'); fillRR(-20, -12, 8, 24, 3, '#9FC3F2');
  circle(29, -10, 3, '#FFF3B0'); circle(29, 10, 3, '#FFF3B0');
  ctx.restore();
}
/* Poker Moon (cavalo do dono, com ele montado) — substitui o carrinho. O desenho original olha para a esquerda. */
function pokerMoon(x, y, h, face, t, moving, alpha = 1) {
  if (!IMG.pm || alpha <= 0) return;
  const im = IMG.pm, w = h * im.width / im.height;
  const gal = moving ? Math.abs(Math.sin(t * 13)) : 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y - gal * h * .05);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, gal * h * .05 + 4, w * .42, h * .05, 0, 0, TAU); ctx.fill();
  if (moving) { for (let i = 0; i < 4; i++) { const ph = (t * 3 + i / 4) % 1; ctx.fillStyle = `rgba(200,170,120,${.45 * (1 - ph)})`; ctx.beginPath(); ctx.arc(-face * (w * .45 + ph * 60), -8 - ph * 20 + gal * h * .05, 10 + ph * 18, 0, TAU); ctx.fill(); } }
  ctx.rotate(moving ? Math.sin(t * 13) * .035 : Math.sin(t * 2) * .01);
  ctx.scale(face > 0 ? -1 : 1, 1 + (moving ? (gal - .5) * .03 : 0));
  ctx.drawImage(im, -w / 2, -h, w, h);
  ctx.restore();
}
function routeFace(R, d, fallback) { const a = alongRoute(R, d), b = alongRoute(R, d + 60); const dx = b[0] - a[0]; return Math.abs(dx) > 6 ? Math.sign(dx) : fallback; }

/* cena de mapa: amplo (cidade, z13) -> ruas (z16) -> percurso -> chegada.
   cfg: {key, city, t0, ta, tb, t1, label, origin} — ta..tb: carrinho andando; antes de ta a câmera desce da cidade para as ruas. */
function mapScene(t, cfg) {
  const R = routePx(cfg.key), m = R.m, city = MAPAS[cfg.city];
  const p = eio(P(t, cfg.ta, cfg.tb)), [carx, cary, ang] = alongRoute(R, p * R.L);
  const start = R.pts[0];
  const sMin = Math.max(W / m.w, H / m.h) * 1.02;
  // câmera em pixels z16
  // fase 1 (t0..ta-.25): visão ampla da cidade (z13) nítida, aproximando do ponto de saída
  if (t < cfg.ta - .1 && city && IMG[cfg.city]) {
    const [gx, gy] = gpx(ROTAS[cfg.key].geom[0][0], ROTAS[cfg.key].geom[0][1], 13); const zc = eio(P(t, cfg.t0, cfg.ta));
    const sc = lerp(Math.max(W / city.w, H / city.h) * 1.02, 2.2, zc); let ux = lerp(city.w / 2, gx - city.ox, zc), uy = lerp(city.h / 2, gy - city.oy, zc);
    const hw = W / 2 / sc, hh = H / 2 / sc; ux = clamp(ux, hw, city.w - hw); uy = clamp(uy, hh, city.h - hh);
    ctx.save(); ctx.fillStyle = '#F2EFE9'; ctx.fillRect(0, 0, W, H); ctx.translate(540, 960); ctx.scale(sc, sc); ctx.translate(-ux, -uy); ctx.drawImage(IMG[cfg.city], 0, 0);
    const [ox, oy] = [gx - city.ox, gy - city.oy]; circle(ox, oy, 14 / sc, C.navy); circle(ox, oy, 7 / sc, '#fff'); ctx.restore();
    if (cfg.origin) badge(t, cfg.t0 + .15, cfg.ta + .1, 'Saída: ' + cfg.origin, 540, 1420, C.navy, 34);
    font(22, 600); const cr0 = '© OpenStreetMap contributors'; const cw0 = ctx.measureText(cr0).width + 24; fillRR(540 - cw0 / 2, 1468, cw0, 34, 17, 'rgba(14,26,92,.6)'); txt(cr0, 540, 1486, 22, '#fff', 600);
    if (t < cfg.ta - .35) return;
    ctx.save(); ctx.globalAlpha = P(t, cfg.ta - .35, cfg.ta - .1);
  } else ctx.save();
  let s = Math.max(sMin, 1.0);
  let camx = start[0], camy = start[1];
  if (t > cfg.ta) { const k = P(t, cfg.ta, cfg.ta + .4); camx = lerp(start[0], carx, k); camy = lerp(start[1], cary, k); s = lerp(Math.max(sMin, 1.0), Math.max(sMin, 1.15), p); }
  if (t > cfg.tb) { const k = eio(P(t, cfg.tb, cfg.tb + .6)); camx = lerp(carx, R.dest[0], k); camy = lerp(cary, R.dest[1] + 120, k); s = lerp(s, Math.max(sMin, 1.45), k); }
  // limites da imagem (apenas quando o mapa de ruas ocupa a tela)
  if (s >= sMin) { const hw = W / 2 / s, hh = H / 2 / s; camx = clamp(camx, hw, m.w - hw); camy = clamp(camy, hh, m.h - hh); }
  ctx.save(); ctx.fillStyle = '#F2EFE9'; ctx.fillRect(0, 0, W, H);
  ctx.translate(540, 960); ctx.scale(s, s); ctx.translate(-camx, -camy);
  if (IMG[cfg.key]) ctx.drawImage(IMG[cfg.key], 0, 0);
  const k = 1 / s;
  // rota completa (tracejada) e percorrida
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.setLineDash([3 * k * 6, 10 * k * 2]); ctx.strokeStyle = 'rgba(27,47,143,.55)'; ctx.lineWidth = 8 * k; ctx.beginPath(); R.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
  if (t > cfg.ta) {
    const [, , , seg] = alongRoute(R, p * R.L);
    ctx.beginPath(); ctx.moveTo(...R.pts[0]); for (let i = 1; i < seg; i++) ctx.lineTo(...R.pts[i]); ctx.lineTo(carx, cary);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 20 * k; ctx.stroke(); ctx.strokeStyle = C.blue; ctx.lineWidth = 12 * k; ctx.stroke();
  }
  // origem
  circle(start[0], start[1], 12 * k, C.navy); circle(start[0], start[1], 6 * k, '#fff');
  // destino
  const arr = P(t, cfg.tb - .05, cfg.tb + .4);
  if (arr > 0) { for (let q = 0; q < 2; q++) { const ph = ((t - cfg.tb) * .9 + q * .5) % 1; ring(R.dest[0], R.dest[1], (12 + ph * 60) * k, `rgba(226,35,26,${.8 * (1 - ph)})`, 5 * k); }
    ctx.save(); ctx.translate(R.dest[0], R.dest[1] - (1 - eback(arr)) * 60 * k); ctx.scale(k * 1.3, k * 1.3); pinIcon(0, 0, C.red, 1); ctx.restore(); }
  ctx.restore();
  // Poker Moon em coordenadas de tela (tamanho constante)
  if (t >= cfg.ta - .3) {
    const sx = 540 + (carx - camx) * s, sy = 960 + (cary - camy) * s;
    ctx.save(); ctx.globalAlpha *= P(t, cfg.ta - .3, cfg.ta); carTop(sx, sy, ang, 1.5); ctx.restore();
  }
  // rótulos em tela
  ctx.restore();
  if (cfg.label) {
    const [dx, dy] = [540 + (R.dest[0] - camx) * s, 960 + (R.dest[1] - camy) * s];
    const la = win(t, cfg.tb + .1, cfg.labelEnd || cfg.t1, .3, .2); if (la > 0) { const pp = eback(P(t, cfg.tb + .1, cfg.tb + .45)); ctx.save(); ctx.globalAlpha = la; ctx.translate(dx, dy + 70); ctx.scale(pp, pp);
      font(44, 900); const w = ctx.measureText(cfg.label).width + 70; shadow(20, 8); fillRR(-w / 2, -40, w, 80, 40, C.red); noShadow(); txt(cfg.label, 0, 2, 44, '#fff', 900);
      if (cfg.sub) { font(32, 800); const w2 = ctx.measureText(cfg.sub).width + 50; fillRR(-w2 / 2, 50, w2, 56, 28, '#fff'); txt(cfg.sub, 0, 78, 32, C.navy, 800); } ctx.restore(); }
  }
  font(22, 600); const cr = '© OpenStreetMap contributors'; const cw = ctx.measureText(cr).width + 24; fillRR(540 - cw / 2, 1468, cw, 34, 17, 'rgba(14,26,92,.6)'); txt(cr, 540, 1486, 22, '#fff', 600);
}

/* ---------- mapa do Ceará (ligação entre cidades) ---------- */
function cearaLink(t, from, to, ta, tb, o = {}) {
  cearaMap(t);
  const A = mp(CITIES[from]), B = mp(CITIES[to]); const p = eio(P(t, ta, tb));
  ['iguatu', 'juazeiro', 'pompeu'].forEach(k => { if (o.show && !o.show.includes(k)) return; const [x, y] = mp(CITIES[k]); pinIcon(x, y, k === to ? C.red : C.blue, k === to ? .95 : .7); });
  ctx.save(); ctx.setLineDash([4, 16]); ctx.lineCap = 'round'; ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(lerp(A[0], B[0], p), lerp(A[1], B[1], p)); ctx.stroke(); ctx.restore();
  truck(lerp(A[0], B[0], p) + 60, lerp(A[1], B[1], p), .8, 0, B[0] < A[0]);
  const lb = o.label; if (lb) { const [x, y] = B; const la = P(t, tb - .1, tb + .2); if (la > 0) { ctx.save(); ctx.globalAlpha = la; font(36, 900); const w = ctx.measureText(lb).width + 40; shadow(12, 4); fillRR(x + 40, y - 74, w, 60, 30, C.navy); noShadow(); txt(lb, x + 60, y - 43, 36, '#fff', 900, 'left'); ctx.restore(); } }
}
function touchRipple(t, at, x, y) { const p = P(t, at, at + .6); if (p > 0 && p < 1) { ring(x, y, 20 + p * 90, `rgba(63,162,232,${1 - p})`, 8); circle(x, y, 14 * (1 - p), 'rgba(63,162,232,.8)'); } }

/* ---------- o guia: trilha de posições/poses ao longo do vídeo ---------- */
// [t, x, y(pés), escala, pose, dir, extras]
const GK = [
  [0.0, -160, 1480, .62, 'anda', 1], [0.9, 220, 1480, .62, 'convite', 1], [4.4, 220, 1480, .62, 'convite', 1], [4.7, 220, 1480, .62, 'aponta', 1],
  [6.7, 220, 1480, .62, 'aponta', 1], [6.95, 170, 1500, .48, 'parado', 1], [7.1, 170, 1500, .48, 'toca', 1], [8.2, 170, 1500, .48, 'parado', 1],
  [9.7, 170, 1500, .48, 'parado', 1], [10.0, 150, 1500, .4, 'parado', 1], [12.1, 150, 1500, .4, 'aponta', 1], [14.6, 150, 1500, .4, 'aponta', 1],
  [14.75, 850, 1520, .6, 'parado', -1], [15.6, 850, 1520, .6, 'apresenta', -1], [18.3, 850, 1520, .6, 'aponta', -1], [20.6, 850, 1520, .6, 'aponta', -1],
  [20.8, 130, 1500, .4, 'parado', 1], [21.6, 130, 1500, .4, 'aponta', 1], [26.5, 130, 1500, .4, 'parado', 1],
  [26.7, 910, 1580, .42, 'parado', -1], [27.4, 910, 1580, .42, 'apresenta', -1], [33.5, 910, 1580, .42, 'apresenta', -1],
  [33.7, 140, 1500, .42, 'parado', 1], [35.6, 140, 1500, .42, 'parado', 1],
  [35.8, 210, 1480, .55, 'parado', 1], [36.1, 210, 1480, .55, 'aponta', 1], [37.75, 210, 1480, .55, 'parado', 1], [37.9, 210, 1480, .55, 'anda', 1], [38.95, 560, 1180, .3, 'anda', 1],
  [39.0, 200, 1480, .5, 'parado', 1], [39.55, 200, 1480, .5, 'segura', 1], [41.4, 200, 1480, .5, 'apresenta', 1], [45.9, 200, 1480, .5, 'apresenta', 1],
  [52.9, 170, 1500, .5, 'parado', 1], [53.1, 170, 1500, .5, 'toca', 1], [54.6, 170, 1500, .5, 'parado', 1],
  [54.85, 850, 1660, .55, 'parado', -1], [55.2, 850, 1660, .55, 'apresenta', -1], [56.5, 850, 1660, .55, 'apresenta', -1],
  [56.65, 140, 1500, .42, 'parado', 1], [59.4, 140, 1500, .42, 'parado', 1],
  [63.1, 140, 1500, .42, 'parado', 1], [64.6, 140, 1500, .42, 'parado', 1], [64.75, 150, 1500, .42, 'aponta', 1], [67.0, 150, 1500, .42, 'aponta', 1],
  [67.1, -120, 1560, .45, 'anda', 1], [72.3, 760, 1560, .45, 'anda', 1],
  [72.45, 170, 1500, .5, 'parado', 1], [72.6, 170, 1500, .5, 'toca', 1], [74.2, 170, 1500, .5, 'parado', 1],
  [74.45, 860, 1650, .55, 'parado', -1], [74.7, 860, 1650, .55, 'apresenta', -1], [75.8, 860, 1650, .55, 'apresenta', -1],
  [75.9, 140, 1500, .42, 'parado', 1], [77.3, 140, 1500, .42, 'parado', 1], [77.45, 150, 1500, .42, 'aponta', 1], [80.6, 150, 1500, .42, 'aponta', 1],
  [80.75, 170, 1500, .55, 'parado', 1], [82.6, 170, 1500, .55, 'curioso', 1], [86.5, 170, 1500, .55, 'curioso', 1],
  [86.75, 920, 1730, .45, 'parado', -1], [87.2, 920, 1730, .45, 'convite', -1], [92, 920, 1730, .45, 'convite', -1],
];
const HIDE = [[39.0, 39.85], [45.95, 52.85], [59.45, 63.05]];   // momentos em que o vídeo real ocupa a tela toda
function guideAt(t) {
  let i = 0; while (i < GK.length - 1 && GK[i + 1][0] <= t) i++;
  const a = GK[i], b = GK[Math.min(i + 1, GK.length - 1)];
  const jump = b[0] - a[0] < .3;                      // troca de cena: muda de lugar no corte
  const moving = a[1] !== b[1] || a[2] !== b[2] || a[3] !== b[3];
  const k = b[0] > a[0] ? P(t, a[0], b[0]) : 1, km = jump ? (k > .5 ? 1 : 0) : (a[4] === 'anda' ? k : eio(k));
  const x = lerp(a[1], b[1], moving ? km : 0), y = lerp(a[2], b[2], moving ? km : 0), s = lerp(a[3], b[3], moving ? km : 0);
  // pose: transição curta com antecipação e acomodação
  const pk = b[0] - t < .28 && !jump ? eback(1 - (b[0] - t) / .28) : 0;
  const pose = pk > 0 ? lerpPose(guiaPose(a[4], t), guiaPose(b[4], t), pk) : a[4];
  const hide = HIDE.some(([h0, h1]) => t >= h0 && t < h1);
  return { x, y, s, pose, dir: k > .5 && jump ? b[5] : a[5], walk: a[4] === 'anda' ? t * 9 : null, hide, curious: a[4] === 'curioso' };
}
function drawGuide(t) {
  const g = guideAt(t); if (g.hide) return;
  const o = { dir: g.dir, walk: g.walk, look: g.pose === 'convite' ? 0 : .6 };
  if (g.curious && t > WT('Onde?') - .1 && t < WT('Onde?') + .8) o.mouth = 'o';
  if (g.pose === 'segura') o.holdR = c => { c.save(); c.rotate(-.2); c.scale(.22, .22); panela(1); c.restore(); };
  guia(ctx, g.x, g.y, g.s, g.pose, t, o);
}

/* =====================================================================
   CENAS
   ===================================================================== */
function scene(t) {
  ctx.fillStyle = C.navy2; ctx.fillRect(0, 0, W, H);
  // 1. Fachada real + convite (0–6,9)
  if (t < 7.0) { clipFull('intro', t, lerp(1, 1.08, P(t, 0, 6.9))); const g = ctx.createLinearGradient(0, 1100, 0, 1920); g.addColorStop(0, 'rgba(14,26,92,0)'); g.addColorStop(1, 'rgba(14,26,92,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 1100, W, 820); }
  if (t < 7.0) openingFX(t);
  // "antes dessas portas se abrirem": portas da Corbã fecham e se abrem revelando o mapa
  const DA = WT('abrirem.') - .15;
  if (t >= DA && t < 9.9) sceneCearaIguatu(t);
  if (t >= 4.85 && t < DA + .9) doors(t, 4.85, DA);
  // 2. Fábrica
  if (t >= 9.8 && t < 12.1) irisIn(t, 9.8, 10.4, 540, 1000, () => clipFull('galpoes', t, lerp(1.0, 1.12, P(t, 9.8, 12))));
  if (t >= 11.8 && t < 14.9) { const c = clipIn('esteira', t, .15, .3); ctx.save(); ctx.globalAlpha = c; clipFull('esteira', t, lerp(1.15, 1, P(t, 11.8, 14.8))); ctx.restore(); }
  if (t >= 10.2 && t < 14.7) badge(t, 10.3, 14.6, 'Fábrica Corbã · Iguatu', 540, 1300, C.red, 42);
  if (t >= 12.9 && t < 14.7) badge(t, WT('alumínio.') - .1, 14.6, 'Produtos em alumínio', 540, 1180, C.navy, 38);
  // 3. 2002
  if (t >= 14.6 && t < 21.0) { ctx.save(); ctx.globalAlpha = P(t, 14.6, 14.9) * (1 - P(t, 20.7, 21.0)); scene2002(t); ctx.restore(); }
  // 4. Fábrica + atendimento
  if (t >= 20.7 && t < 27.0) { ctx.save(); ctx.globalAlpha = P(t, 20.7, 21.0) * (1 - P(t, 26.7, 27.0)); sceneExperiencia(t); ctx.restore(); }
  // 5. Hoje
  if (t >= 26.6 && t < 33.9) { ctx.save(); ctx.globalAlpha = clipIn('embalagem', t, .3, .3); sceneHoje(t); ctx.restore(); }
  // 6. Iguatu: mapa → fachada → "Bora entrar?"
  if (t >= 33.6 && t < 36.1) { ctx.save(); ctx.globalAlpha = P(t, 33.6, 33.9); mapScene(t, { key: 'iguatu', city: 'cidade_iguatu', t0: 33.6, ta: 34.1, tb: 35.3, t1: 36.0, label: 'Corbã Iguatu', origin: 'Rodoviária de Iguatu' }); ctx.restore(); }
  if (t >= 35.6 && t < 39.5) { const zoomDoor = 1 + 1.8 * eio(P(t, 38.6, 39.4)); irisIn(t, 35.6, 36.1, 540, 900, () => clipFull('fachada', t, zoomDoor)); addressCard(t, WT('Santos') - .1, 37.75, 'Rua Santos Dumont, 340', 'Centro', 'Iguatu – CE'); }
  // 7. Produtos
  if (t >= 39.0 && t < 46.4) sceneProdutos(t);
  // 8. Variedade + atendimento online
  if (t >= 46.0 && t < 53.0) { ctx.save(); ctx.globalAlpha = clipIn('corredor', t, .35, .3); clipFull('corredor', t, lerp(1.0, 1.1, P(t, 46, 53))); waCard(t); ctx.restore(); }
  // 9. Juazeiro
  if (t >= 52.8 && t < 55.1) { ctx.save(); ctx.globalAlpha = P(t, 52.8, 53.1); cearaLink(t, 'iguatu', 'juazeiro', 53.3, 54.7, { label: 'Juazeiro do Norte' }); touchRipple(t, 53.1, 170 + 105, 1500 - 270); ctx.restore(); }
  if (t >= 54.85 && t < 56.8) { ctx.save(); ctx.globalAlpha = P(t, 54.85, 55.1) * (1 - P(t, 56.55, 56.8)); SCENES.juazeiro(t, eio(P(t, 54.85, 56.8))); badge(t, WT('duas') - .1, 56.75, 'Duas lojas', 540, 1390, C.red, 50); ctx.restore(); }
  if (t >= 56.6 && t < 59.8) { ctx.save(); ctx.globalAlpha = P(t, 56.6, 56.9) * (1 - P(t, 59.5, 59.8)); mapScene(t, { key: 'atacarejo', city: 'cidade_juazeiro', t0: 56.6, ta: 57.0, tb: 58.5, t1: 59.8, label: 'Corbã Atacarejo', sub: 'Desde 2018', origin: 'Basílica de N. Sra. das Dores' }); ctx.restore(); }
  if (t >= 59.5 && t < 63.25) { clipFull('mundo', t, 1, clipIn('mundo', t, .3, .25)); addressCard(t, WT('Padre') - .45, 63.0, 'Av. Padre Cícero, 4370A', 'São José', 'Juazeiro do Norte – CE'); }
  if (t >= 63.0 && t < 67.3) { ctx.save(); ctx.globalAlpha = P(t, 63.0, 63.25) * (1 - P(t, 67.05, 67.3)); mapScene(t, { key: 'saopedro', city: 'cidade_juazeiro', t0: 63.0, ta: 63.25, tb: 64.3, t1: 67.3, labelEnd: 65.0, label: 'Corbã Salesianos', origin: 'Basílica de N. Sra. das Dores' }); addressCard(t, 64.9, 67.1, 'Rua São Pedro, 1227', 'Salesianos', 'Juazeiro do Norte – CE'); ctx.restore(); }
  if (t >= 67.0 && t < 72.6) { ctx.save(); ctx.globalAlpha = P(t, 67.0, 67.3) * (1 - P(t, 72.3, 72.6)); cdScene(t, 67.2, 1); sceneCD(t); ctx.restore(); }
  // 10. Senador Pompeu
  if (t >= 72.4 && t < 74.7) { ctx.save(); ctx.globalAlpha = P(t, 72.4, 72.7) * (1 - P(t, 74.45, 74.7)); cearaLink(t, 'juazeiro', 'pompeu', 72.8, 74.2, { label: 'Senador Pompeu' }); touchRipple(t, 72.6, 170 + 105, 1500 - 270);
    badge(t, WT('agosto') - .1, 74.6, 'Agosto de 2026', 540, 1420, C.red, 50); ctx.restore(); }
  if (t >= 74.45 && t < 76.1) { ctx.save(); ctx.globalAlpha = P(t, 74.45, 74.7) * (1 - P(t, 75.85, 76.1)); SCENES.pompeu(t, eio(P(t, 74.45, 76.1))); ctx.restore(); }
  if (t >= 75.85 && t < 77.65) { ctx.save(); ctx.globalAlpha = P(t, 75.85, 76.1) * (1 - P(t, 77.4, 77.65)); mapScene(t, { key: 'pompeu', city: 'cidade_pompeu', t0: 75.85, ta: 76.1, tb: 76.9, t1: 77.65, label: 'Corbã Senador Pompeu', sub: '4ª loja', origin: 'Centro de Senador Pompeu' }); ctx.restore(); }
  if (t >= 77.4 && t < 81.0) { clipFull('pompeu', t, 1, clipIn('pompeu', t, .25, .3)); addressCard(t, WT('Avenida') > 70 ? 77.55 : 77.55, 80.8, 'Av. Francisco França Cambraia, 338', 'Centro', 'Senador Pompeu – CE'); }
  // 11. Quinta loja
  if (t >= 80.7 && t < 86.9) { ctx.save(); ctx.globalAlpha = P(t, 80.7, 81.0) * (1 - P(t, 86.6, 86.9)); sceneQuinta(t); ctx.restore(); }
  // 12. Assinatura
  if (t >= 86.6) { ctx.save(); ctx.globalAlpha = P(t, 86.6, 86.95); sceneFim(t); ctx.restore(); }
}
function sparkle(x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const rr2 = i % 2 ? r * .22 : r; const ang = i / 8 * TAU; ctx.lineTo(Math.cos(ang) * rr2, Math.sin(ang) * rr2); } ctx.closePath(); ctx.fill(); ctx.restore(); }
function openingFX(t) {
  // moldura nas cores da marca desenhando-se em volta
  const fp = eio(P(t, .15, 1.1)), per = 2 * (W - 60 + H - 60);
  ctx.save(); ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.setLineDash([per * fp, per]);
  ctx.strokeStyle = C.red; rr(30, 30, W - 60, H - 60, 44); ctx.stroke(); ctx.lineDashOffset = -per / 2; ctx.strokeStyle = C.blue; ctx.stroke(); ctx.restore();
  // brilhos sobre a fachada
  for (let i = 0; i < 9; i++) { const ph = (t * .8 + rnd2(i)) % 1; sparkle(120 + rnd2(i + 3) * 840, 640 + rnd2(i + 7) * 420, 18 + rnd2(i + 1) * 16, Math.sin(ph * Math.PI) * P(t, .6, 1.2) * (1 - P(t, 4.6, 5.0))); }
  // logo entra quicando e vai para o canto
  const lp = eback(P(t, .15, .7)), mv = eio(P(t, 1.8, 2.35));
  if (lp > 0 && t < 2.4) { const x = lerp(540, 968, mv), y = lerp(760, 268, mv), d = lerp(380, 130, mv) * Math.min(1.15, lp);
    if (mv < .05) for (let k = 0; k < 2; k++) { const p = P(t, .3 + k * .15, 1.3 + k * .15); if (p > 0 && p < 1) ring(540, 760, 200 + eo(p) * 320, `rgba(255,255,255,${.8 * (1 - p)})`, 10 * (1 - p) + 2); }
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - clamp(lp)) * -.5); drawLogo(0, 0, d, 1); ctx.restore(); }
  // balão do guia
  const bp = eback(P(t, WT('Vem') - .05, WT('Vem') + .3)) * (1 - P(t, 4.5, 4.8));
  if (bp > 0) { ctx.save(); ctx.translate(430, 1060); ctx.scale(bp, bp); shadow(18, 6); fillRR(-170, -60, 340, 120, 40, '#fff');
    ctx.beginPath(); ctx.moveTo(-120, 55); ctx.lineTo(-170, 110); ctx.lineTo(-70, 55); ctx.fill(); noShadow(); txt('Vem comigo!', 0, 2, 46, C.red, 900); ctx.restore(); }
}
function rnd2(i) { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); }
function doors(t, a, open) {
  const close = eio(P(t, a, a + .55)), op = eio(P(t, open, open + .8));
  const k = close * (1 - op); if (k <= 0) return;
  for (const side of [-1, 1]) {
    const w = W / 2, x0 = side < 0 ? -w + w * k : W - w * k;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, w, H); ctx.clip();
    const g = ctx.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, 'rgba(160,205,240,.96)'); g.addColorStop(.5, 'rgba(215,236,252,.97)'); g.addColorStop(1, 'rgba(150,198,236,.96)');
    ctx.fillStyle = g; ctx.fillRect(x0, 0, w, H);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 26; ctx.strokeRect(x0 + 13, 13, w - 26, H - 26);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(x0 + 80, 200); ctx.lineTo(x0 + 200, 200); ctx.lineTo(x0 + 60, 900); ctx.lineTo(x0 + 0, 900); ctx.fill();
    fillRR(side < 0 ? x0 + w - 70 : x0 + 40, 820, 30, 280, 15, '#C9D3DD');
    // logo dividida entre as duas folhas
    if (IMG.logo) { const d = 520, lx = x0 + (side < 0 ? w : 0); ctx.drawImage(IMG.logo, lx - d / 2, 560, d, d); }
    fillRR(x0, 1580, w, 60, 0, side < 0 ? C.red : C.blue);
    ctx.restore();
  }
  line2(W / 2 - (1 - k) * W / 2, 0, W / 2 - (1 - k) * W / 2, H);
}
function line2() {}
function sceneCearaIguatu(t) {
  // mapa do estado aproxima em Iguatu; depois mapa real da cidade com a fábrica
  const z = eio(P(t, 6.3, 8.6));
  ctx.save(); const [ix, iy] = mp(CITIES.iguatu); ctx.translate(540, 960); ctx.scale(lerp(1, 4, z), lerp(1, 4, z)); ctx.translate(-lerp(540, ix, z), -lerp(960, iy, z));
  cearaMap(t); pinIcon(ix, iy, C.red, .9 / lerp(1, 4, z) * 1.6); ctx.restore();
  touchRipple(t, 7.1, 170 + 105, 1500 - 250);
  const lab = win(t, 7.2, 9.0, .3, .3); if (lab > 0) badge(t, 7.2, 9.0, 'Iguatu · Ceará', 540, 1180, C.navy, 54);
  const c = P(t, 8.5, 8.9);
  if (c > 0) { ctx.save(); ctx.globalAlpha = c; const m = MAPAS.cidade_iguatu, [fx, fy] = gpx(ROTAS.fabrica.destino[0], ROTAS.fabrica.destino[1], 13);
    const s = lerp(1.0, 1.7, eio(P(t, 8.5, 9.9))); ctx.save(); ctx.translate(540, 960); ctx.scale(s, s); ctx.translate(-(fx - m.ox), -(fy - m.oy)); if (IMG.cidade_iguatu) ctx.drawImage(IMG.cidade_iguatu, 0, 0); ctx.restore();
    const pp = eback(P(t, 8.8, 9.2)); ctx.save(); ctx.translate(540, 960); ctx.scale(pp * 1.3, pp * 1.3); pinIcon(0, 0, C.red, 1); ctx.restore();
    badge(t, 8.9, 9.95, 'Fábrica · Areias', 540, 1080, C.red, 42);
    font(22, 600); txt('© OpenStreetMap contributors', 540, 1486, 22, '#1B2F8F', 600); ctx.restore(); }
}
function scene2002(t) {
  SCENES.iguatu(t, 1); darken(.3);
  const sp = eback(P(t, 14.75, 15.2));
  ctx.save(); ctx.translate(430, 1430); ctx.scale(sp * 1.15, sp * 1.15); lojinha2002(0, 0, 1, eio(P(t, WT('abriu'), WT('abriu') + .7))); ctx.restore();
  // calendário: o ano gira até 2002
  const c = eback(P(t, 15.3, 15.75)); if (c <= 0) return;
  ctx.save(); ctx.translate(430, 720); ctx.scale(c, c); ctx.rotate((1 - clamp(c)) * .25);
  shadow(30, 12, 'rgba(0,0,0,.4)'); fillRR(-230, -190, 460, 380, 30, '#fff'); noShadow();
  fillRR(-230, -190, 460, 100, [30, 30, 0, 0], C.red); txt('JANEIRO', 0, -138, 52, '#fff', 900);
  txt('21', 0, -20, 120, C.navy, 900);
  const yr = Math.round(lerp(1995, 2002, eo(P(t, 15.8, 17.0)))); txt(String(yr), 0, 100, 76, C.red, 900);
  for (const dx of [-130, 130]) fillRR(dx - 10, -210, 20, 50, 10, C.navy);
  ctx.restore();
  badge(t, WT('primeira') - .1, 20.7, '1ª loja de varejo', 540, 1120, C.navy, 44);
}
function sceneExperiencia(t) {
  ctx.fillStyle = '#EAF3FC'; ctx.fillRect(0, 0, W, H);
  const a = eback(P(t, 20.8, 21.3)), b = eback(P(t, 21.1, 21.6));
  // cartão de cima: fábrica | cartão de baixo: loja
  ctx.save(); ctx.translate(0, (1 - clamp(a)) * -400); shadow(30, 12); fillRR(110, 520, 860, 430, 36, '#fff'); noShadow(); clipBox('linha', t, 122, 532, 836, 406, 28); badge(t, 21.0, 26.7, 'Fábrica', 260, 590, C.red, 34); ctx.restore();
  ctx.save(); ctx.translate(0, (1 - clamp(b)) * 400); shadow(30, 12); fillRR(110, 1000, 860, 430, 36, '#fff'); noShadow(); clipBox('lojaexp', t, 122, 1012, 836, 406, 28); badge(t, 21.3, 26.7, 'Loja', 230, 1070, C.blue, 34); ctx.restore();
  // a panela sai da fábrica e chega à loja (caminhar junto)
  const p = eio(P(t, WT('caminhar') - .6, WT('caminhar') + 1.0));
  if (p > 0 && p < 1) { const x = lerp(820, 820, p) + Math.sin(p * Math.PI) * 120, y = lerp(830, 1150, p); ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(p * Math.PI) * .3); ctx.scale(.42, .42); panela(1); ctx.restore(); }
  if (p >= 1) { const q = eback(P(t, WT('caminhar') + 1.0, WT('caminhar') + 1.4)); ctx.save(); ctx.translate(820, 1150); ctx.scale(.42 * q, .42 * q); panela(1); ctx.restore(); }
}
function cdScene(t, t0, big = 1) {
  // centro de distribuição ilustrado (galpão + caminhões + caixas)
  const g = ctx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, '#6DB9F0'); g.addColorStop(1, '#D9EEFB'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (big) { ctx.save(); ctx.globalAlpha = .35; padreCicero(860, 980, .55, t); ctx.restore(); }
  hills(1000, 50, K.serra1, 3, t * 5);
  ctx.fillStyle = '#CFC8B8'; ctx.fillRect(0, 1180, W, 740); ctx.fillStyle = '#B8B0A0'; ctx.fillRect(0, 1380, W, 120);
  for (let x = ((t * 400) % 160) - 160; x < W; x += 160) fillRR(x, 1436, 80, 10, 5, '#fff');
  // galpão
  ctx.fillStyle = '#E9EEF4'; ctx.fillRect(110, 820, 860, 380); ctx.fillStyle = '#9AA9BA'; ctx.beginPath(); ctx.moveTo(80, 830); ctx.lineTo(540, 690); ctx.lineTo(1000, 830); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(120 + i * 72, 828 - Math.min(i, 12 - i) * 12); ctx.lineTo(120 + i * 72, 830); ctx.stroke(); }
  fillRR(250, 870, 580, 90, 16, '#fff'); if (IMG.logo) ctx.drawImage(IMG.logo, 262, 876, 78, 78); txt('CENTRO DE DISTRIBUIÇÃO', 595, 916, 30, C.navy, 900);
  for (let i = 0; i < 3; i++) { const dx = 170 + i * 260; fillRR(dx, 1000, 210, 200, 6, '#5F6E80'); for (let k = 0; k < 6; k++) fillRR(dx, 1000 + k * 33, 210, 4, 0, 'rgba(255,255,255,.18)'); }
  // caixas sendo empilhadas
  for (let i = 0; i < 6; i++) { const p = eback(P(t, t0 + .2 + i * .18, t0 + .5 + i * .18)); if (p <= 0) continue; const bx = 190 + (i % 3) * 64, by = 1200 - Math.floor(i / 3) * 56 - (1 - clamp(p)) * 200;
    fillRR(bx, by - 54, 60, 54, 4, '#D6A866'); fillRR(bx, by - 30, 60, 8, 0, '#B9874A'); }
  // caminhões: um chega, outro sai
  const p1 = eio(P(t, t0, t0 + 1.6)), p2 = P(t, t0 + .6, t0 + 4.5);
  truck(lerp(-260, 560, p1), 1330, 2.4, 0); truck(lerp(700, 1500, eo(p2)), 1450, 2.4, 0);
}
function sceneHoje(t) {
  const T1 = WT('quatro', 26) - .1, T2 = WT('fabricação', 26) - .1, T3 = WT('centro', 26) - .1, T4 = WT('variedade', 26) - .1;
  const beats = [
    [26.6, () => { clipFull('embalagem', t, 1.05); darken(.5); const lp = eback(P(t, 26.85, 27.35)); ctx.save(); ctx.translate(540, 960); ctx.scale(lp, lp); drawLogo(0, 0, 420, 1); ctx.restore();
      for (let k = 0; k < 2; k++) { const p = P(t, 26.9 + k * .15, 27.9 + k * .15); if (p > 0 && p < 1) ring(540, 960, 230 + eo(p) * 300, `rgba(255,255,255,${.7 * (1 - p)})`, 10 * (1 - p) + 2); } }],
    [T1, () => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.blue); g.addColorStop(1, C.navy); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { const p = eback(P(t, T1 + .05 + i * .13, T1 + .4 + i * .13)); if (p <= 0) continue; ctx.save(); ctx.translate(150 + i * 260, 1060 - (1 - clamp(p)) * 600); ctx.scale(.44 * p, .44 * p); lojinha2002(0, 0, 1, 1); ctx.restore(); }
      const n = Math.min(4, Math.floor(P(t, T1 + .05, T1 + .6) * 4) + 1); const np = eback(P(t, T1, T1 + .3));
      ctx.save(); ctx.translate(540, 1300); ctx.scale(np, np); txt(String(n), -110, 0, 200, '#fff', 900); txt('lojas', 90, 20, 90, '#fff', 900); ctx.restore(); }],
    [T2, () => { clipFull('robos', t, 1.1); darken(.25); ctx.save(); ctx.translate(820, 760); ctx.rotate(t * 1.5); ctx.globalAlpha = .9;
      for (let i = 0; i < 10; i++) { ctx.rotate(TAU / 10); fillRR(-18, -150, 36, 40, 6, '#fff'); } ring(0, 0, 105, '#fff', 30); ctx.restore();
      badge(t, T2 + .05, T3 + .2, 'Fabricação própria', 540, 1260, C.red, 54); }],
    [T3, () => { cdScene(t, T3, 0); badge(t, T3 + .05, T4 + .2, 'Centro de distribuição', 540, 600, C.navy, 50); }],
    [T4, () => { clipFull('variedade', t, 1.05); darken(.2);
      const items = [(c) => panela(1), (c) => vaso(1, 99, 0), (c) => toalhas(1, 99, 0), (c) => caixas(1, 99, 0), (c) => portaUtensilios(1, 99, 0)];
      items.forEach((fn, i) => { const p = eo(P(t, T4 + .05 + i * .1, T4 + .9 + i * .1)); if (p <= 0) return; const ang = -Math.PI / 2 + (i - 2) * .55, d = p * 520;
        ctx.save(); ctx.translate(540 + Math.cos(ang) * d, 1150 + Math.sin(ang) * d * .9); ctx.rotate((i - 2) * .15 * p); ctx.scale(.42 * Math.min(1, p * 1.6), .42 * Math.min(1, p * 1.6)); fn(); ctx.restore(); });
      badge(t, T4 + .05, 33.9, 'Variedade para o lar', 540, 1300, C.red, 54); }],
  ];
  beats.forEach(([a, fn], i) => { if (t < a - .15) return; if (beats[i + 1] && t > beats[i + 1][0] + .3) return;
    const k = i === 0 ? 1 : eio(P(t, a - .15, a + .15)); ctx.save(); ctx.translate((1 - k) * W, 0); ctx.rotate((1 - k) * .06); fn(); ctx.restore(); });
}
function sceneProdutos(t) {
  // vídeo real em tela cheia → sobe para uma janela e abre espaço para o guia e o produto
  const up = eio(P(t, 39.6, 40.15)), out = P(t, 46.0, 46.4);
  ctx.fillStyle = '#EAF3FC'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(63,162,232,.15)'; for (let i = 0; i < 9; i++) { circle(((i * 197 + t * 30) % 1300) - 100, 1200 + (i % 3) * 120, 60 + (i % 4) * 20, 'rgba(63,162,232,.10)'); }
  const x = lerp(0, 90, up), y = lerp(0, 470, up), w = lerp(W, 900, up), h = lerp(H, 560, up), r = lerp(0, 36, up);
  ctx.save(); if (up > 0) { shadow(30, 12); fillRR(x - 8, y - 8, w + 16, h + 16, r + 6, '#fff'); noShadow(); }
  clipBox('interior', t, x, y, w, h, r, lerp(1, 1.25, up)); ctx.restore();
  if (up > .5) productStage(t, 690, 1210, 46.1);
  if (out > 0) { ctx.fillStyle = `rgba(234,243,252,${out})`; ctx.fillRect(0, 0, W, H); }
}
function waCard(t) {
  const a = win(t, 48.4, 52.7, .35, .3); if (a <= 0) return;
  const p = eback(P(t, 48.4, 48.8));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 1240); ctx.scale(p, p);
  shadow(30, 12, 'rgba(0,0,0,.45)'); fillRR(-420, -110, 840, 220, 36, '#fff'); noShadow();
  circle(-320, 0, 62, C.wa); ctx.save(); ctx.translate(-320, 0); ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.stroke();
  ctx.rotate(-.6); fillRR(-6, -20, 12, 40, 5, '#fff'); fillRR(-12, -22, 24, 9, 4, '#fff'); fillRR(-12, 13, 24, 9, 4, '#fff'); ctx.restore();
  txt('Atendimento online', -230, -38, 40, C.navy, 900, 'left'); txt('(88) 99484-8302', -230, 30, 58, C.green, 900, 'left');
  ctx.restore();
}
function sceneCD(t) {
  badge(t, 67.3, 72.4, 'Juazeiro do Norte', 540, 590, C.navy, 44);
  badge(t, WT('atacado.') - .2, 72.4, 'Atende o atacado', 540, 1600, C.red, 44);
}
function sceneQuinta(t) {
  cearaMap(t);
  [['iguatu', 'Iguatu · 1'], ['juazeiro', 'Juazeiro do Norte · 2'], ['pompeu', 'Senador Pompeu · 1']].forEach(([k, l], i) => {
    const pp = eback(P(t, 80.9 + i * .25, 81.25 + i * .25)); const [x, y] = mp(CITIES[k]); if (pp <= 0) return; pinIcon(x, y, C.red, pp);
    const la = P(t, 81.1 + i * .25, 81.4 + i * .25); ctx.save(); ctx.globalAlpha = la; font(32, 800); const w = ctx.measureText(l).width + 36; shadow(12, 4); fillRR(x + 46, y - 70, w, 54, 27, C.navy); noShadow(); txt(l, x + 64, y - 42, 32, '#fff', 800, 'left'); ctx.restore();
  });
  const q = P(t, WT('quinta') - .1, WT('quinta') + .25);
  if (q > 0) { const spots = [[-38.6, -4.2], [-40.3, -3.7], [-38.95, -6.0], [-40.6, -5.2], [-39.6, -4.9]];
    const k = Math.floor((t - 82.8) / .55) % spots.length, f = ((t - 82.8) / .55) % 1; const A = mp(spots[(k + spots.length) % spots.length]), B = mp(spots[(k + 1 + spots.length) % spots.length]); const e = eio(clamp(f * 1.6));
    const x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], e) - Math.sin(e * Math.PI) * 60;
    ctx.save(); ctx.globalAlpha = q; pinIcon(x, y, C.blue, 1.4 * eback(q) * (1 + .06 * Math.sin(t * 9)), '?'); ctx.restore(); }
  badge(t, WT('quinta') - .1, WT('Onde?') - .1, 'A 5ª loja vem aí!', 540, 1420, C.red, 50);
  const o = eback(P(t, WT('Onde?') - .05, WT('Onde?') + .3)); if (o > 0 && t < WT('breve.') - .6) { ctx.save(); ctx.translate(560, 1420); ctx.scale(o, o); shadow(30, 12); fillRR(-200, -80, 400, 160, 80, C.blue); noShadow(); txt('Onde?', 0, 4, 84, '#fff', 900); ctx.restore(); }
  badge(t, WT('breve.') - .55, 86.6, 'Conta em breve!', 560, 1420, C.navy, 48);
}
function sceneFim(t) {
  sky(t); hills(1250, 80, K.serra1, 2.2, t * 8); hills(1400, 60, K.serra2, .9, t * 14);
  ctx.fillStyle = K.sand; ctx.fillRect(0, 1500, W, 420); mandacaru(130, 1700, 1.0, t); carnauba(990, 1720, 1.0, t);
  const lp = eback(P(t, 86.75, 87.25));
  for (let k = 0; k < 2; k++) { const p = P(t, 86.75 + k * .15, 87.85 + k * .15); if (p > 0 && p < 1) ring(540, 820, 300 + eo(p) * 380, `rgba(255,255,255,${.7 * (1 - p)})`, 10 * (1 - p) + 2); }
  ctx.save(); ctx.translate(540, 820); ctx.rotate((1 - clamp(lp)) * .3); drawLogo(0, 0, 600 * lp, clamp(lp * 1.4)); ctx.restore();
  const a = eback(P(t, WT('merece') - .5, WT('merece') - .1));
  if (a > 0) { ctx.save(); ctx.translate(540, 1240); ctx.scale(a, a); font(62, 900); const w = ctx.measureText('Sua casa merece Corbã.').width + 100; shadow(30, 12); fillRR(-w / 2, -62, w, 124, 62, C.red); noShadow(); txt('Sua casa merece Corbã.', 0, 4, 62, '#fff', 900); ctx.restore(); }
  const ig = eo(P(t, 89.9, 90.3)); if (ig > 0) { ctx.save(); ctx.globalAlpha = ig; font(44, 900); const w = ctx.measureText('@corba.utilidades').width + 80; fillRR(540 - w / 2, 1330, w, 84, 42, C.navy); txt('@corba.utilidades', 540, 1373, 44, '#fff', 900);
    txt('Acompanhe a novidade da 5ª loja', 540, 1450, 32, C.navy, 800); ctx.restore(); }
}

/* ---------- render ---------- */
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, W, H);
  scene(t);
  drawGuide(t);
  flash(t, 9.8, .2); flash(t, 39.0, .2);
  watermark(t);
  if (t < 86.7) captions(t);
}
window.renderFrame = renderFrame; window.DUR = DUR; window.FPS = FPS;
if (/render/.test(location.search)) document.body.classList.add('render');
