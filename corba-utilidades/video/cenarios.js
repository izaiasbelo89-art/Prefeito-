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
window.SCENES = { juazeiro: sceneJuazeiro };
