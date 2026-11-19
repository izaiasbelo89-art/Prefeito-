'use strict';
/* Bonequinho guia da Corbã — personagem único (mesma roupa, proporções e estilo em todo o vídeo).
   guia(ctx, x, y, s, pose, t, o) — x,y = pés; s = escala (1 ≈ 520 px de altura).
   Poses: 'convite' (olha p/ câmera e acena), 'aponta' (dir), 'apresenta' (palma aberta, mão esq.), 'anda', 'segura' (mão com objeto),
   'toca' (toca no mapa), 'curioso' (mão no queixo), 'parado'. o.dir = 1 olha p/ direita, -1 p/ esquerda; o.blend p/ transição entre poses. */
const GUIA = { pele: '#E9B48A', pele2: '#D79A6E', cabelo: '#2B1C14', camisa: '#E2231A', camisa2: '#B9170F', calca: '#1B2F8F', calca2: '#14236B',
  tenis: '#FFFFFF', sola: '#3FA2E8', bone: '#3FA2E8', bone2: '#1B2F8F', olho: '#1A1A2E' };
const POSES = {
  //            braçoE(ombro,cotovelo)  braçoD(ombro,cotovelo)  cabeça  tronco
  parado:    { aL: [.15, .25], aR: [-.15, -.25], head: 0, lean: 0 },
  convite:   { aL: [.2, .3], aR: [-2.5, -.6], head: 0, lean: 0 },
  aponta:    { aL: [.15, .2], aR: [-1.45, -.05], head: .1, lean: .04 },
  apresenta: { aL: [1.2, .7], aR: [-.15, -.25], head: -.08, lean: -.02 },
  segura:    { aL: [.9, 1.3], aR: [-.9, -1.3], head: .12, lean: 0 },
  toca:      { aL: [.15, .2], aR: [-1.15, -.55], head: .15, lean: .06 },
  curioso:   { aL: [.2, .25], aR: [-.5, -2.3], head: -.12, lean: 0 },
  anda:      { aL: [.0, .2], aR: [.0, -.2], head: 0, lean: .03 },
};
function guiaPose(name, t) {
  const p = JSON.parse(JSON.stringify(POSES[name] || POSES.parado));
  if (name === 'convite') { p.aR[1] = -.6 + Math.sin(t * 9) * .35; }        // acenando
  if (name === 'anda') { p.aL[0] = Math.sin(t * 9) * .45; p.aR[0] = -Math.sin(t * 9) * .45; }
  if (name === 'curioso') { p.head += Math.sin(t * 2) * .05; }
  return p;
}
function lerpPose(a, b, k) { const L = (x, y) => x + (y - x) * k; return { aL: [L(a.aL[0], b.aL[0]), L(a.aL[1], b.aL[1])], aR: [L(a.aR[0], b.aR[0]), L(a.aR[1], b.aR[1])], head: L(a.head, b.head), lean: L(a.lean, b.lean) }; }
function guia(c, x, y, s, pose, t, o = {}) {
  const G = GUIA, dir = o.dir || 1;
  let P = typeof pose === 'string' ? guiaPose(pose, t) : pose;
  const walking = o.walk != null;
  const bob = walking ? -Math.abs(Math.sin(o.walk)) * 10 : Math.sin(t * 2.2) * 3;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  // sombra
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 95, 16, 0, 0, Math.PI * 2); c.fill();
  c.translate(0, bob);
  // pernas
  const lg = walking ? Math.sin(o.walk) * .4 : 0;
  for (const [lx, a, col] of [[-22, lg, G.calca2], [22, -lg, G.calca]]) {
    c.save(); c.translate(lx, -190); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.roundRect(-20, 0, 40, 172, 18); c.fill();
    c.fillStyle = G.tenis; c.beginPath(); c.roundRect(-24, 160, 62, 30, [14, 18, 8, 8]); c.fill();
    c.fillStyle = G.sola; c.fillRect(-24, 184, 62, 8);
    c.restore();
  }
  c.save(); c.translate(0, -190); c.rotate(P.lean);
  // braço de trás (esquerdo)
  arm(c, -54, -170, P.aL, G.camisa2, G.pele2, o.holdL);
  // tronco (camisa polo vermelha da Corbã)
  c.fillStyle = G.camisa; c.beginPath(); c.roundRect(-62, -190, 124, 200, [40, 40, 22, 22]); c.fill();
  c.fillStyle = G.calca; c.beginPath(); c.roundRect(-62, -6, 124, 26, 10); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-26, -190); c.lineTo(0, -150); c.lineTo(26, -190); c.closePath(); c.fill();
  c.fillStyle = G.camisa2; c.fillRect(-4, -170, 8, 40);
  // crachá com a marca
  c.fillStyle = '#fff'; c.beginPath(); c.roundRect(14, -132, 40, 28, 6); c.fill();
  c.fillStyle = G.camisa; c.font = '900 13px Inter, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Corbã', 34, -118);
  // cabeça
  c.save(); c.translate(0, -214); c.rotate(P.head);
  c.fillStyle = G.pele; c.beginPath(); c.roundRect(-14, 0, 28, 30, 8); c.fill();
  c.beginPath(); c.ellipse(0, -62, 64, 70, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-62, -58, 12, 18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = G.cabelo; c.beginPath(); c.ellipse(0, -96, 62, 36, 0, Math.PI, Math.PI * 2); c.fill();
  // boné azul (aba para frente)
  c.fillStyle = G.bone; c.beginPath(); c.ellipse(0, -112, 66, 46, 0, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = G.bone2; c.beginPath(); c.roundRect(10, -118, 82, 16, 8); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-4, -136, 9, 0, Math.PI * 2); c.fill();
  // rosto
  const blink = ((t * 1.0 + .3) % 3.3) < .12 ? .12 : 1, look = o.look != null ? o.look : 0;
  c.fillStyle = G.olho;
  c.beginPath(); c.ellipse(14 + look * 8, -66, 7, 9 * blink, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(42 + look * 8, -66, 6.5, 8.5 * blink, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(16 + look * 8, -69, 2.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(226,35,26,.25)'; c.beginPath(); c.ellipse(52, -40, 10, 6, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#7A3B22'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); if (o.mouth === 'o') { c.fillStyle = '#7A3B22'; c.ellipse(30, -32, 7, 9, 0, 0, Math.PI * 2); c.fill(); } else c.arc(30, -40, 15, .2 * Math.PI, .85 * Math.PI); c.stroke();
  c.strokeStyle = G.cabelo; c.lineWidth = 5; c.beginPath(); c.moveTo(6, -84); c.lineTo(22, -88); c.moveTo(36, -88); c.lineTo(50, -84); c.stroke();
  c.restore();
  // braço da frente (direito)
  arm(c, 54, -170, P.aR, G.camisa, G.pele, o.holdR);
  c.restore();
  c.restore();
}
function arm(c, x, y, [sh, el], cs, sk, hold) {
  c.save(); c.translate(x, y); c.rotate(sh);
  c.fillStyle = cs; c.beginPath(); c.roundRect(-19, -10, 38, 66, 18); c.fill();     // manga
  c.fillStyle = sk; c.beginPath(); c.roundRect(-14, 40, 28, 40, 14); c.fill();
  c.translate(0, 74); c.rotate(el);
  c.beginPath(); c.roundRect(-13, -6, 26, 64, 13); c.fill();
  c.beginPath(); c.arc(0, 66, 16, 0, Math.PI * 2); c.fill();                           // mão
  if (hold) { c.save(); c.translate(0, 70); hold(c); c.restore(); }
  c.restore();
}
window.guia = guia; window.guiaPose = guiaPose; window.lerpPose = lerpPose;
