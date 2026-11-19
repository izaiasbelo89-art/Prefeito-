'use strict';
/* Cenários ilustrados da região (vetor, em camadas com parallax). Função pura do tempo. */
const CW = 1080, CH = 1920;
const cx = document.getElementById('c').getContext('2d');
const K = { red: '#E2231A', blue: '#3FA2E8', navy: '#1B2F8F', sky1: '#5DB4F0', sky2: '#BFE3FA', sand: '#E9C58C', sand2: '#D9A866', earth: '#C98A4E',
  serra1: '#8FA9C9', serra2: '#6E8DB6', caat1: '#7A8F3C', caat2: '#5E7330', caat3: '#4A5E26', white: '#FFFFFF', stone: '#D8D2C6' };
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
function sky(t, warm = 0) {
  const g = cx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, warm ? '#4FA3E8' : K.sky1); g.addColorStop(1, warm ? '#FFE2B0' : K.sky2);
  cx.fillStyle = g; cx.fillRect(0, 0, CW, CH);
  // sol
  const sx = 820, sy = 360; const sg = cx.createRadialGradient(sx, sy, 20, sx, sy, 300); sg.addColorStop(0, 'rgba(255,240,180,.9)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
  cx.fillStyle = sg; cx.fillRect(0, 0, CW, 900); cx.beginPath(); cx.arc(sx, sy, 80, 0, TAU); cx.fillStyle = '#FFF1BF'; cx.fill();
  // nuvens
  for (let i = 0; i < 4; i++) { const x = ((i * 380 + t * 18) % 1600) - 300, y = 230 + (i % 2) * 170; cloud(x, y, 1 + (i % 3) * .2); }
}
function cloud(x, y, s) {
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.fillStyle = 'rgba(255,255,255,.95)';
  cx.beginPath(); cx.ellipse(0, 0, 120, 38, 0, 0, TAU); cx.ellipse(-50, -20, 60, 40, 0, 0, TAU); cx.ellipse(40, -34, 70, 50, 0, 0, TAU); cx.fill(); cx.restore();
}
function chapada(y, col, off) { // Chapada do Araripe: topo plano
  cx.fillStyle = col; cx.beginPath(); cx.moveTo(-50, CH);
  cx.lineTo(-50, y + 40); cx.lineTo(80 + off, y + 6); cx.lineTo(160 + off, y); cx.lineTo(980 + off, y - 4); cx.lineTo(1060 + off, y + 10); cx.lineTo(1200, y + 50); cx.lineTo(1200, CH); cx.closePath(); cx.fill();
}
function hills(y, amp, col, seed, off) {
  cx.fillStyle = col; cx.beginPath(); cx.moveTo(-50, CH);
  for (let x = -50; x <= 1150; x += 30) cx.lineTo(x, y - amp * (.5 + .5 * Math.sin((x + off) / 170 + seed)) - amp * .3 * Math.sin((x + off) / 61 + seed * 2));
  cx.lineTo(1150, CH); cx.closePath(); cx.fill();
}
function caatingaTree(x, y, s, col) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  cx.strokeStyle = '#6B4E2E'; cx.lineWidth = 7; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -60); cx.moveTo(0, -40); cx.lineTo(-26, -78); cx.moveTo(0, -50); cx.lineTo(28, -86); cx.stroke();
  cx.fillStyle = col; for (const [a, b, r] of [[-30, -88, 30], [30, -96, 34], [0, -104, 36], [-6, -78, 26]]) { cx.beginPath(); cx.arc(a, b, r, 0, TAU); cx.fill(); }
  cx.restore();
}
function mandacaru(x, y, s, t = 0) {
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.rotate(Math.sin(t * .8 + x) * .01);
  const c1 = '#3E8E4A', c2 = '#2F7039';
  const arm = (ax, ay, h, dir) => { cx.fillStyle = c1; cx.beginPath(); cx.roundRect(ax, ay - 18, 46 * dir, 36, 18); cx.fill(); cx.beginPath(); cx.roundRect(ax + 28 * dir - 18, ay - h, 36, h, 18); cx.fill(); };
  arm(16, -150, 120, 1); arm(-16, -110, 100, -1);
  cx.fillStyle = c1; cx.beginPath(); cx.roundRect(-24, -260, 48, 260, 24); cx.fill();
  cx.strokeStyle = c2; cx.lineWidth = 4; for (const dx of [-10, 0, 10]) { cx.beginPath(); cx.moveTo(dx, -250); cx.lineTo(dx, -6); cx.stroke(); }
  cx.fillStyle = '#F4D35E'; cx.beginPath(); cx.arc(0, -262, 9, 0, TAU); cx.fill();
  cx.restore();
}
function houses(y, n, seed, s = 1) {
  for (let i = 0; i < n; i++) {
    const r = Math.abs(Math.sin(i * 12.9898 + seed) * 43758.5453) % 1, x = 30 + i * (1020 / n) + r * 20, w = (40 + r * 40) * s, h = (30 + ((r * 7) % 1) * 30) * s;
    const cols = ['#F6E7C8', '#F2C9A0', '#E9EEF5', '#F7D6D0', '#D8E8F6'];
    cx.fillStyle = cols[i % 5]; cx.fillRect(x, y - h, w, h);
    cx.fillStyle = '#C8553D'; cx.beginPath(); cx.moveTo(x - 6 * s, y - h); cx.lineTo(x + w / 2, y - h - 18 * s); cx.lineTo(x + w + 6 * s, y - h); cx.closePath(); cx.fill();
    cx.fillStyle = 'rgba(27,47,143,.35)'; cx.fillRect(x + w * .3, y - h * .6, w * .18, h * .3);
  }
}
/* Estátua do Padre Cícero (silhueta estilizada: chapéu, batina longa, bengala) */
function padreCicero(x, y, s, t) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  // pedestal
  cx.fillStyle = '#E7E1D6'; cx.beginPath(); cx.roundRect(-120, -40, 240, 40, 6); cx.fill();
  cx.fillStyle = '#D3CBBD'; cx.beginPath(); cx.roundRect(-90, -120, 180, 84, 6); cx.fill();
  cx.fillStyle = '#E7E1D6'; cx.beginPath(); cx.roundRect(-100, -132, 200, 16, 6); cx.fill();
  const W = '#FBFBF8', S = '#DCDCD4';
  cx.translate(0, -132);
  cx.shadowColor = 'rgba(27,47,143,.35)'; cx.shadowBlur = 18;
  // batina
  cx.fillStyle = W; cx.beginPath(); cx.moveTo(-62, 0); cx.lineTo(-44, -300); cx.quadraticCurveTo(0, -330, 44, -300); cx.lineTo(62, 0); cx.closePath(); cx.fill();
  cx.fillStyle = S; cx.beginPath(); cx.moveTo(10, 0); cx.lineTo(22, -290); cx.quadraticCurveTo(40, -300, 44, -300); cx.lineTo(62, 0); cx.closePath(); cx.fill();
  // braço com bengala
  cx.strokeStyle = '#EDEDE6'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(78, -150); cx.lineTo(70, 0); cx.stroke();
  cx.fillStyle = W; cx.beginPath(); cx.roundRect(38, -270, 30, 120, 15); cx.fill(); cx.beginPath(); cx.arc(70, -152, 13, 0, TAU); cx.fill();
  cx.beginPath(); cx.roundRect(-66, -270, 28, 110, 14); cx.fill();
  // cabeça e chapéu
  cx.fillStyle = W; cx.beginPath(); cx.arc(0, -350, 32, 0, TAU); cx.fill();
  cx.beginPath(); cx.ellipse(0, -378, 62, 13, 0, 0, TAU); cx.fill();
  cx.beginPath(); cx.roundRect(-32, -420, 64, 44, [16, 16, 4, 4]); cx.fill();
  cx.fillStyle = S; cx.beginPath(); cx.ellipse(0, -372, 58, 6, 0, 0, Math.PI); cx.fill();
  cx.shadowColor = 'transparent';
  cx.restore();
}
function hortoPlaza(x, y, s) { // praça em estrela ao pé da estátua
  cx.save(); cx.translate(x, y); cx.scale(s, .32 * s);
  cx.fillStyle = '#EADBC4'; cx.beginPath(); cx.arc(0, 0, 300, 0, TAU); cx.fill();
  cx.fillStyle = '#B5624A'; cx.beginPath(); for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, r = i % 2 ? 120 : 270; cx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } cx.closePath(); cx.fill();
  cx.fillStyle = '#EADBC4'; cx.beginPath(); cx.arc(0, 0, 110, 0, TAU); cx.fill();
  cx.restore();
}
function sceneJuazeiro(t, cam = 0) {
  sky(t);
  const p = cam; // 0..1 deslocamento de câmera (parallax)
  chapada(820 - p * 20, K.serra1, -p * 30);
  hills(1000 - p * 40, 70, K.serra2, 1.3, p * 80);
  houses(1150 - p * 70, 18, 3, 1.1);
  // colina do Horto
  cx.fillStyle = K.caat1; cx.beginPath(); cx.moveTo(-60, CH); cx.lineTo(-60, 1250); cx.quadraticCurveTo(300, 1040 - p * 100, 560, 1030 - p * 100); cx.quadraticCurveTo(820, 1040 - p * 100, 1140, 1260); cx.lineTo(1140, CH); cx.closePath(); cx.fill();
  for (let i = 0; i < 9; i++) caatingaTree(40 + i * 125 + Math.sin(i) * 20, 1230 + Math.abs(i - 4) * 18 - p * 110, .7 + (i % 3) * .1, i % 2 ? K.caat2 : K.caat3);
  hortoPlaza(560, 1040 - p * 100, 1.0);
  padreCicero(560, 1046 - p * 100, 1.15 + p * .1, t);
  // primeiro plano
  hills(1560 - p * 160, 60, K.sand2, 4.1, p * 200);
  cx.fillStyle = K.sand; cx.fillRect(0, 1600 - p * 170, CW, 600);
  mandacaru(150, 1640 - p * 180, 1.15, t); mandacaru(950, 1690 - p * 190, .95, t);
  caatingaTree(820, 1650 - p * 180, 1.3, K.caat2);
}


function carnauba(x, y, s, t = 0) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  cx.strokeStyle = '#8A6A45'; cx.lineWidth = 12; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(10, -150, 4, -300); cx.stroke();
  cx.translate(4, -300); cx.rotate(Math.sin(t * 1.2 + x) * .03);
  for (let i = 0; i < 13; i++) { const a = -Math.PI + i / 12 * Math.PI; cx.save(); cx.rotate(a);
    cx.fillStyle = i % 2 ? '#4E8A3E' : '#5FA24B'; cx.beginPath(); cx.moveTo(0, -6); cx.lineTo(95, -16); cx.lineTo(100, 0); cx.lineTo(95, 16); cx.lineTo(0, 6); cx.closePath(); cx.fill(); cx.restore(); }
  cx.restore();
}
function letreiroIguatu(x, y, s, t) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  cx.fillStyle = '#5E9A43'; cx.beginPath(); cx.ellipse(0, 20, 330, 60, 0, 0, TAU); cx.fill();
  cx.fillStyle = '#EDEFF3'; cx.beginPath(); cx.roundRect(-300, -20, 600, 40, 8); cx.fill();
  cx.font = '900 120px Inter, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
  cx.fillStyle = '#1C3F9E'; cx.fillText('IGUATU', -34, -20 + 6);
  cx.fillStyle = '#3F6CD8'; cx.fillText('IGUATU', -40, -20);
  // coração
  const hb = 1 + .06 * Math.max(0, Math.sin(t * 5));
  cx.save(); cx.translate(240, -70); cx.scale(hb, hb); cx.rotate(.15); cx.fillStyle = '#E2231A';
  cx.beginPath(); cx.moveTo(0, 40); cx.bezierCurveTo(-70, -5, -40, -60, 0, -26); cx.bezierCurveTo(40, -60, 70, -5, 0, 40); cx.fill(); cx.restore();
  cx.restore();
}
function sceneIguatu(t, p = 0) {
  sky(t, 1);
  hills(860 - p * 20, 50, K.serra1, 2.2, p * 40);
  hills(960 - p * 40, 60, K.serra2, .7, p * 80);
  houses(1080 - p * 60, 20, 7, 1.0);
  // lagoa
  cx.fillStyle = '#6EB8E0'; cx.beginPath(); cx.ellipse(300, 1110 - p * 70, 420, 40, 0, 0, TAU); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 5; i++) { cx.fillRect(140 + i * 80 + Math.sin(t * 2 + i) * 10, 1106 - p * 70, 40, 3); }
  hills(1210 - p * 90, 40, K.caat1, 3.3, p * 120);
  for (let i = 0; i < 6; i++) carnauba(70 + i * 190, 1240 - p * 100 + (i % 2) * 20, .62 + (i % 3) * .08, t);
  cx.fillStyle = '#8DB04F'; cx.fillRect(0, 1260 - p * 120, CW, 900);
  letreiroIguatu(540, 1380 - p * 140, 1.05 + p * .08, t);
  cx.fillStyle = K.sand; cx.beginPath(); cx.moveTo(0, CH); cx.lineTo(0, 1660 - p * 180); for (let x = 0; x <= CW; x += 40) cx.lineTo(x, 1650 - p * 180 + Math.sin(x / 90) * 12); cx.lineTo(CW, CH); cx.closePath(); cx.fill();
  mandacaru(110, 1760 - p * 190, 1.0, t); carnauba(1000, 1780 - p * 200, 1.0, t); caatingaTree(860, 1760 - p * 190, 1.2, K.caat2);
}
function igrejaPompeu(x, y, s) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  const Wl = '#FAF6EC', Sh = '#E6DCC6', Bl = '#7FB5E6', Dk = '#4E5D7A';
  // naves laterais
  for (const d of [-1, 1]) { cx.fillStyle = Wl; cx.fillRect(d > 0 ? 80 : -260, -170, 180, 170);
    cx.fillStyle = Sh; cx.beginPath(); cx.moveTo(d > 0 ? 80 : -260, -170); cx.lineTo(d > 0 ? 170 : -170, -230); cx.lineTo(d > 0 ? 260 : -80, -170); cx.closePath(); cx.fill();
    for (let i = 0; i < 2; i++) { cx.fillStyle = Dk; cx.beginPath(); cx.roundRect((d > 0 ? 110 : -230) + i * 70, -130, 40, 80, [20, 20, 0, 0]); cx.fill(); } }
  // corpo central
  cx.fillStyle = Wl; cx.fillRect(-80, -330, 160, 330);
  cx.fillStyle = Sh; cx.fillRect(40, -330, 40, 330);
  cx.fillStyle = Dk; cx.beginPath(); cx.roundRect(-36, -120, 72, 120, [36, 36, 0, 0]); cx.fill();
  cx.fillStyle = Bl; cx.beginPath(); cx.arc(0, -200, 26, 0, TAU); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, -200, 20, 0, TAU); cx.fill();
  cx.strokeStyle = Dk; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(0, -200); cx.lineTo(0, -214); cx.moveTo(0, -200); cx.lineTo(10, -196); cx.stroke();
  // torre
  cx.fillStyle = Wl; cx.fillRect(-56, -520, 112, 200); cx.fillStyle = Sh; cx.fillRect(30, -520, 26, 200);
  cx.fillStyle = Dk; cx.beginPath(); cx.roundRect(-22, -480, 44, 70, [22, 22, 0, 0]); cx.fill();
  cx.fillStyle = Wl; cx.fillRect(-66, -530, 132, 16);
  cx.fillStyle = Bl; cx.beginPath(); cx.moveTo(-50, -530); cx.quadraticCurveTo(-50, -640, 0, -680); cx.quadraticCurveTo(50, -640, 50, -530); cx.closePath(); cx.fill();
  cx.strokeStyle = '#E2B13C'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(0, -680); cx.lineTo(0, -740); cx.moveTo(-20, -718); cx.lineTo(20, -718); cx.stroke();
  cx.restore();
}
function scenePompeu(t, p = 0) {
  sky(t);
  hills(900 - p * 20, 110, K.serra1, 5.1, p * 40);
  hills(1010 - p * 40, 70, K.serra2, 2.6, p * 80);
  houses(1150 - p * 70, 16, 11, 1.0);
  cx.fillStyle = '#EADFC8'; cx.fillRect(0, 1160 - p * 80, CW, 900);
  igrejaPompeu(540, 1300 - p * 110, 1.05 + p * .08);
  // praça
  cx.fillStyle = '#D9C7A6'; cx.fillRect(0, 1300 - p * 110, CW, 40);
  for (let i = 0; i < 6; i++) caatingaTree(i < 3 ? 60 + i * 90 : 760 + (i - 3) * 100, 1330 - p * 120, .9, i % 2 ? K.caat1 : K.caat2);
  cx.fillStyle = K.sand; cx.fillRect(0, 1640 - p * 180, CW, 600);
  mandacaru(950, 1760 - p * 190, 1.0, t); carnauba(120, 1780 - p * 200, .95, t);
}
function lojinha2002(x, y, s, open = 1) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  cx.shadowColor = 'rgba(0,0,0,.25)'; cx.shadowBlur = 30; cx.fillStyle = '#FFFFFF'; cx.fillRect(-260, -380, 520, 380); cx.shadowColor = 'transparent';
  cx.fillStyle = '#F2EEE6'; cx.fillRect(-260, -60, 520, 60);
  // letreiro
  cx.fillStyle = '#FFFFFF'; cx.fillRect(-230, -370, 460, 100); cx.strokeStyle = '#1B2F8F'; cx.lineWidth = 6; cx.strokeRect(-230, -370, 460, 100);
  cx.font = '900 76px Inter, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#E2231A'; cx.fillText('Corbã', 0, -320);
  // toldo listrado
  for (let i = 0; i < 10; i++) { cx.fillStyle = i % 2 ? '#3FA2E8' : '#E2231A'; cx.beginPath(); cx.moveTo(-260 + i * 52, -262); cx.lineTo(-208 + i * 52, -262); cx.lineTo(-208 + i * 52, -222); cx.quadraticCurveTo(-234 + i * 52, -200, -260 + i * 52, -222); cx.closePath(); cx.fill(); }
  // vitrine com panelas
  cx.fillStyle = '#CFE6F7'; cx.fillRect(-230, -190, 200, 130);
  for (let i = 0; i < 3; i++) { cx.fillStyle = '#B9C2CC'; cx.beginPath(); cx.roundRect(-215 + i * 62, -120, 50, 36, [4, 4, 12, 12]); cx.fill(); cx.fillStyle = '#8E98A5'; cx.fillRect(-222 + i * 62, -126, 64, 7); }
  // portas abrindo
  cx.fillStyle = '#2B3A66'; cx.fillRect(20, -200, 200, 200);
  const dw = 100 * (1 - open * .85);
  cx.fillStyle = '#9CC9EE'; cx.fillRect(20, -196, dw, 196); cx.fillRect(220 - dw, -196, dw, 196);
  cx.fillStyle = 'rgba(255,230,160,' + (.5 * open) + ')'; cx.fillRect(20 + dw, -196, 200 - 2 * dw, 196);
  cx.restore();
}
/* ---- mapa do Ceará (ilustrativo) ---- */
const CE = [[-41.42,-2.9],[-40.5,-2.8],[-39.9,-2.95],[-39.0,-3.45],[-38.5,-3.72],[-38.0,-4.15],[-37.5,-4.55],[-37.25,-4.83],[-37.6,-5.2],[-38.05,-5.65],[-38.5,-6.1],[-38.6,-6.5],[-38.75,-7.0],[-39.0,-7.55],[-39.3,-7.85],[-39.9,-7.6],[-40.5,-7.42],[-40.85,-7.2],[-40.8,-6.5],[-40.6,-5.9],[-41.0,-5.3],[-41.3,-4.7],[-41.2,-4.0],[-41.4,-3.4]];
const CITIES = { fortaleza: [-38.54, -3.73], iguatu: [-39.30, -6.36], juazeiro: [-39.31, -7.21], pompeu: [-39.37, -5.59] };
const MAP = { k: 205, x0: 95, y0: 360 };
function mp([lon, lat]) { return [MAP.x0 + (lon + 41.6) * MAP.k, MAP.y0 + (-lat - 2.6) * MAP.k]; }
function cearaMap(t) {
  const g = cx.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#CDE9F8'); g.addColorStop(1, '#EAF5FC'); cx.fillStyle = g; cx.fillRect(0, 0, CW, CH);
  // oceano (canto superior direito)
  cx.fillStyle = '#EFE6D3'; cx.fillRect(0, 0, CW, CH);   // estados vizinhos
  cx.fillStyle = '#9FD3F0'; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(CW, 0); cx.lineTo(CW, mp(CE[7])[1] - 40);
  for (let i = 7; i >= 0; i--) { const [x, y] = mp(CE[i]); cx.lineTo(x, y); } cx.lineTo(0, mp(CE[0])[1]); cx.closePath(); cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 3; for (let k = 0; k < 6; k++) { cx.beginPath(); for (let x = 300; x < CW; x += 20) cx.lineTo(x, 300 + k * 60 + Math.sin(x / 40 + t * 2 + k) * 5); cx.stroke(); }
  // estado
  cx.shadowColor = 'rgba(27,47,143,.25)'; cx.shadowBlur = 30; cx.shadowOffsetY = 10;
  cx.beginPath(); CE.forEach((c, i) => { const [x, y] = mp(c); i ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.closePath();
  const sg = cx.createLinearGradient(0, 400, 0, 1500); sg.addColorStop(0, '#F6E2B8'); sg.addColorStop(1, '#E9C58C'); cx.fillStyle = sg; cx.fill();
  cx.shadowColor = 'transparent'; cx.shadowOffsetY = 0; cx.strokeStyle = '#fff'; cx.lineWidth = 6; cx.stroke();
  // chapada do Araripe (sul)
  cx.fillStyle = 'rgba(122,143,60,.45)'; cx.beginPath(); cx.ellipse(...mp([-39.8, -7.45]), 140, 26, -.15, 0, TAU); cx.fill();
  const [fx, fy] = mp(CITIES.fortaleza); cx.fillStyle = '#1B2F8F'; cx.beginPath(); cx.arc(fx, fy, 8, 0, TAU); cx.fill();
  cx.font = '700 30px Inter, sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillStyle = '#1B2F8F'; cx.fillText('Fortaleza', fx + 16, fy);
  cx.font = '800 34px Inter, sans-serif'; cx.fillStyle = 'rgba(27,47,143,.45)'; cx.textAlign = 'center'; cx.fillText('CEARÁ', ...mp([-40.3, -4.6]));
}
function truck(x, y, s, a = 0, flip = false) {
  cx.save(); cx.translate(x, y); cx.rotate(a); cx.scale(flip ? -s : s, s);
  cx.shadowColor = 'rgba(0,0,0,.3)'; cx.shadowBlur = 10; cx.shadowOffsetY = 4;
  cx.fillStyle = '#FFFFFF'; cx.beginPath(); cx.roundRect(-70, -50, 100, 50, 6); cx.fill();
  cx.shadowColor = 'transparent';
  cx.fillStyle = '#E2231A'; cx.fillRect(-70, -16, 100, 8); cx.fillStyle = '#3FA2E8'; cx.fillRect(-70, -8, 100, 5);
  cx.fillStyle = '#E2231A'; cx.beginPath(); cx.roundRect(32, -38, 38, 38, [10, 10, 4, 4]); cx.fill();
  cx.fillStyle = '#BFE1FF'; cx.fillRect(48, -32, 16, 14);
  cx.fillStyle = '#222'; for (const wx of [-48, 8, 52]) { cx.beginPath(); cx.arc(wx, 2, 11, 0, TAU); cx.fill(); cx.fillStyle = '#999'; cx.beginPath(); cx.arc(wx, 2, 4, 0, TAU); cx.fill(); cx.fillStyle = '#222'; }
  cx.restore();
}
window.SCENES = { juazeiro: sceneJuazeiro, iguatu: sceneIguatu, pompeu: scenePompeu };
