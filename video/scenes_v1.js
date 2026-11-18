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
