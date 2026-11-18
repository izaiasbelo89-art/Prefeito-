/* =====================================================================
   VERSÃO 2 — "O hotel por dentro"
   Hotel em corte com quatro setores (Quartos, Gestão, Recepção, Restaurante)
   funcionando ao mesmo tempo. Usa as funções de core.js.
   ===================================================================== */
const DUR2 = 44.0;
const T2 = { open: 0, prob: 6.4, acc: 14.4, logo: 17.8, obs: 19.3, svc: 21.0, flow: 30.6, pan: 35.0, end: 40.0 };
const PD = 2.0, SD = 2.4;
const RW = 470, RH = 380;
const ROOMS = {
  quartos: { x: 60, y: 560, label: 'QUARTOS' },
  gestao: { x: 550, y: 560, label: 'ADMINISTRAÇÃO' },
  recepcao: { x: 60, y: 960, label: 'RECEPÇÃO' },
  restaurante: { x: 550, y: 960, label: 'RESTAURANTE' },
};
const PROB_ORDER = [
  { id: 'recepcao', tag: 'Reservas', icon: 'reservas' },
  { id: 'restaurante', tag: 'Restaurante', icon: 'restaurante' },
  { id: 'quartos', tag: 'Quartos', icon: 'quartos' },
  { id: 'gestao', tag: 'Gestão', icon: 'gestao' },
];
const rc = id => [ROOMS[id].x + RW / 2, ROOMS[id].y + RH / 2];
const FULL = [540, 955, 0.86];
const roomCam = (id, z = 1.85) => { const [x, y] = rc(id); return [x, y + 8, z]; };
const lerp3 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
// tempo "acelerado" para as atividades da abertura
const warp = t => t + Math.pow(Math.max(0, Math.min(t, 7) - 3.6), 2) * 0.35;

/* ---------- exterior ---------- */
function outside(t) {
  const g = ctx.createLinearGradient(0, -400, 0, 1400); g.addColorStop(0, '#CFE2FA'); g.addColorStop(1, '#F4F8FE');
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, 4100, 2900);
  for (let i = 0; i < 6; i++) {
    const x = ((i * 430 + t * 18) % 2600) - 900, y = 120 + (i % 3) * 140;
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(x, y, 110, 34, 0, 0, TAU); ctx.ellipse(x + 60, y - 22, 70, 34, 0, 0, TAU); ctx.ellipse(x - 50, y - 12, 60, 28, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = C.sky3; ctx.fillRect(-1500, 1380, 4100, 1500);
  ctx.fillStyle = '#E6EEF9'; ctx.fillRect(-1500, 1380, 4100, 34);
  for (const [x, s] of [[-120, 1.2], [-330, .9], [1200, 1.25], [1420, .95]]) tree(x, 1384, s);
}
function tree(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillRR(-10, -120, 20, 120, 6, '#6B4A33');
  circle(0, -170, 70, '#2F9E7A'); circle(-44, -130, 50, '#278A6A'); circle(46, -132, 52, '#35AD86');
  ctx.restore();
}
function facadeHalf(side, openP) { // side -1 esquerda, 1 direita
  const x0 = side < 0 ? 40 : 540, x1 = side < 0 ? 540 : 1040;
  const pivot = side < 0 ? 40 : 1040;
  const sx = Math.cos(openP * Math.PI / 2);
  if (sx <= 0.01) return;
  ctx.save(); ctx.translate(pivot, 0); ctx.scale(sx, 1); ctx.translate(-pivot, 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0, 520, x1 - x0, 860);
  ctx.fillStyle = C.sky2; ctx.fillRect(x0, 940, x1 - x0, 20);
  // janelas do andar superior
  for (let i = 0; i < 2; i++) {
    const wx = x0 + 70 + i * 230;
    fillRR(wx, 620, 140, 200, 10, C.navy); fillRR(wx + 10, 630, 120, 180, 6, '#FFE7C2'); line(wx + 70, 630, wx + 70, 810, C.navy, 6); line(wx + 10, 720, wx + 130, 720, C.navy, 6);
    fillRR(wx - 10, 820, 160, 14, 6, C.sky4);
  }
  // térreo
  if (side < 0) { fillRR(x0 + 70, 1060, 260, 200, 10, C.navy); fillRR(x0 + 80, 1070, 240, 180, 6, '#CFE4FA'); line(x0 + 200, 1070, x0 + 200, 1250, C.navy, 6); }
  else { fillRR(x0 + 170, 1060, 260, 200, 10, C.navy); fillRR(x0 + 180, 1070, 240, 180, 6, '#CFE4FA'); line(x0 + 300, 1070, x0 + 300, 1250, C.navy, 6); }
  // porta central (metade)
  const dx = side < 0 ? 440 : 540;
  fillRR(dx, 1130, 100, 250, 0, C.navy2); fillRR(dx + 12, 1145, 76, 220, 4, '#9CC4F2');
  // toldo
  ctx.fillStyle = C.orange; ctx.fillRect(side < 0 ? 400 : 540, 1090, 140, 34);
  // sombreamento conforme abre
  if (openP > 0) { ctx.fillStyle = `rgba(11,37,84,${.35 * openP})`; ctx.fillRect(x0, 520, x1 - x0, 860); }
  ctx.restore();
}
function hotelShell(t, openP) {
  // lateral em perspectiva + telhado
  ctx.fillStyle = '#BFD3EE'; ctx.beginPath(); ctx.moveTo(1040, 520); ctx.lineTo(1110, 480); ctx.lineTo(1110, 1350); ctx.lineTo(1040, 1380); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(10, 520); ctx.lineTo(1070, 520); ctx.lineTo(1130, 480); ctx.lineTo(70, 480); ctx.closePath(); ctx.fill();
  fillRR(10, 500, 1060, 30, 6, C.navy2);
  // placa
  const w = 250;
  fillRR(540 - w / 2, 420, w, 64, 14, '#fff'); strokeRR(540 - w / 2, 420, w, 64, 14, C.navy, 5);
  'HOTEL'.split('').forEach((ch, i) => txt(ch, 488 + i * 34, 454, 40, C.navy, 900));
  circle(540 - w / 2 + 26, 452, 8, C.orange);
  // estrutura interna (lajes/paredes)
  ctx.fillStyle = C.navy2; ctx.fillRect(40, 530, 1000, 30); ctx.fillRect(40, 940, 1000, 20); ctx.fillRect(40, 1340, 1000, 44);
  ctx.fillRect(40, 530, 20, 850); ctx.fillRect(1020, 530, 20, 850);
  ctx.fillRect(530, 560, 20, 380); ctx.fillRect(530, 960, 20, 150); // parede com passagem no térreo
}

/* ---------- salas ---------- */
function roomBase(label, wall = C.sky) {
  ctx.fillStyle = wall; ctx.fillRect(0, 0, RW, RH);
  ctx.fillStyle = C.sky2; ctx.fillRect(0, 240, RW, 100);
  ctx.fillStyle = C.sky3; ctx.fillRect(0, 340, RW, 40); ctx.fillStyle = C.sky4; ctx.fillRect(0, 338, RW, 4);
  ctx.save(); font(17, 800); ctx.letterSpacing = '3px'; const w = ctx.measureText(label).width + 34;
  fillRR(14, 14, w, 34, 17, '#fff'); circle(28, 31, 5, C.orange); ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, 38, 32); ctx.restore();
}
function warnBadge(x, y, s, t) {
  if (s <= 0) return;
  const pul = 1 + .08 * Math.sin(t * 10);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * pul, s * pul);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(30, 24); ctx.lineTo(-30, 24); ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = C.orange; ctx.stroke(); ctx.fill();
  txt('!', 0, 6, 34, '#fff', 900); ctx.restore();
}
function okBadge(x, y, s) { if (s > 0) iconCheck(x, y, 24, C.green, '#fff', s); }
function miniPill(x, y, label, col, s = 1) {
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); font(18, 800); const w = ctx.measureText(label).width + 30;
  fillRR(-w / 2, -16, w, 32, 16, col); txt(label, 0, 1, 18, '#fff', 800); ctx.restore();
}
// st.mode: idle | problem | ok | checkout | happy ; st.lt: tempo local ; st.p: progresso da fase
function roomRecepcao(st) {
  const lt = st.lt, m = st.mode;
  roomBase('RECEPÇÃO');
  plant(445, 340, .55);
  const prob = m === 'problem', ok = m === 'ok' || m === 'checkout' || m === 'happy';
  person(110, 382, .72, { shirt: C.navy2, collar: true, skin: C.skin2, hair: C.hair2, hairStyle: 'bun', noLegs: true, nametag: true,
    mood: prob ? 'worried' : (ok ? 'happy' : null), look: prob ? (Math.sin(lt * 5) > 0 ? .9 : .3) : .8,
    armR: m === 'checkout' ? -2.5 + .3 * Math.sin(lt * 9) : -0.9 + .12 * Math.sin(lt * 14), blink: blinkAt(lt, 1) });
  monitor(160, 186, 120, 80, () => {
    if (prob) uiBusca(lt, 0); else if (m === 'checkout') uiCheckoutOK(); else if (ok) uiBusca(lt, 1); else uiReservasBO(lt, 0);
  }, { glow: ok ? .6 + .4 * Math.sin(lt * 6) : 0 });
  fillRR(20, 272, 280, 16, 6, C.navy); fillRR(30, 288, 260, 52, [0, 0, 8, 8], '#fff'); fillRR(40, 306, 240, 5, 3, C.orange);
  // hóspede
  let gx = 362; if (m === 'checkout') gx = lerp(362, 520, eio(clamp((st.p - .35) / .65)));
  const walking = m === 'checkout' && st.p > .35 && st.p < 1;
  suitcase(gx + (walking ? -48 : 46), 382, .72);
  person(gx, 382, .72, { shirt: C.orange, skin: C.skin1, hair: C.hair1, mood: prob ? 'worried' : (ok ? 'happy' : null), look: m === 'checkout' ? .8 : -.8,
    walk: walking ? lt * 13 : null, armR: m === 'checkout' ? -2.6 + .35 * Math.sin(lt * 9) : .2, blink: blinkAt(lt, 2) });
  if (prob) {
    const s = eback(clamp(st.p * 4)); ctx.save(); ctx.translate(220, 120); ctx.scale(s, s); circle(0, 0, 26, C.orange); iconBell(0, 2, 30, '#fff'); ctx.restore();
    bubble(380, 150, 90, 50, eback(clamp((st.p - .3) * 4)), () => { for (let i = 0; i < 3; i++) circle(-24 + i * 24, 0, 6 + 2 * Math.max(0, Math.sin(lt * 8 - i)), C.navy); });
  }
  if (st.warn) warnBadge(420, 70, st.warn, lt);
  if (st.okb) okBadge(420, 70, st.okb);
}
function roomRestaurante(st) {
  const lt = st.lt, m = st.mode, prob = m === 'problem', ok = m === 'ok' || m === 'happy';
  roomBase('RESTAURANTE', '#F2F6FD');
  line(200, 0, 200, 110, C.navy2, 3); ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(172, 132); ctx.quadraticCurveTo(200, 92, 228, 132); ctx.closePath(); ctx.fill(); circle(200, 134, 7, '#FFE3B8');
  fillRR(330, 150, 120, 9, 4, C.navy2); for (let i = 0; i < 3; i++) circle(352 + i * 38, 136, 13, i % 2 ? '#fff' : C.blue3);
  person(160, 350, .72, { shirt: C.orange, skin: C.skin1, hair: C.hair1, noLegs: true, mood: prob ? null : 'happy', look: .7, armR: -.5, armL: .4, blink: blinkAt(lt, 3) });
  // garçom
  let wx = 370; if (m === 'idle') wx = 360 + Math.sin(lt * 2.4) * 40;
  person(wx, 382, .72, { shirt: C.navy2, apron: true, skin: C.skin3, hair: C.hair3, mood: 'happy', look: -.8, armL: .6, armR: .75, blink: blinkAt(lt, 4),
    walk: m === 'idle' ? lt * 10 : null });
  ctx.save(); ctx.translate(wx - 38, 290); ctx.rotate(-.1); fillRR(-30, -22, 60, 44, 7, C.navy); fillRR(-25, -17, 50, 34, 4, '#fff'); fillRR(-20, 6, 40, 8, 4, prob ? C.orange : C.blue3); ctx.restore();
  // mesa
  fillRR(70, 282, 210, 14, 7, '#fff'); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(76, 294); ctx.lineTo(274, 294); ctx.lineTo(266, 330); ctx.lineTo(84, 330); ctx.closePath(); ctx.fill();
  fillRR(84, 326, 182, 5, 3, C.blue3); fillRR(100, 330, 10, 50, 3, C.navy2); fillRR(240, 330, 10, 50, 3, C.navy2);
  ctx.beginPath(); ctx.ellipse(150, 280, 40, 8, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.gray2; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(150, 275, 22, 9, 0, Math.PI, TAU); ctx.fillStyle = C.orange2; ctx.fill(); fillRR(205, 258, 18, 22, [2, 2, 6, 6], C.blue3);
  if (prob || ok) {
    const s = eback(clamp(st.p * 4));
    ctx.save(); ctx.translate(250, 190); ctx.scale(s, s);
    shadow(12, 5); fillRR(-92, -42, 184, 84, 14, '#fff'); noShadow(); strokeRR(-92, -42, 184, 84, 14, prob ? C.orange : C.green, 3);
    txt('Consumo · 204', 0, -20, 17, C.navy, 800);
    if (prob) { fillRR(-70, 2, 140, 28, 14, C.orange); txt('Pendente', 10, 17, 16, '#fff', 800); iconClock(-52, 16, 10, lt, '#fff'); }
    else { fillRR(-70, 2, 140, 28, 14, C.green); txt('Na conta', 8, 17, 16, '#fff', 800); }
    ctx.restore();
  }
  if (st.warn) warnBadge(420, 70, st.warn, lt);
  if (st.okb) okBadge(420, 70, st.okb);
}
function roomQuartos(st) {
  const lt = st.lt, m = st.mode, prob = m === 'problem', ok = m === 'ok' || m === 'happy';
  roomBase('QUARTOS', '#F3F7FE');
  fillRR(40, 70, 110, 110, 8, C.navy); fillRR(48, 78, 94, 94, 4, '#CFE4FA'); line(95, 78, 95, 172, C.navy, 4); line(48, 125, 142, 125, C.navy, 4);
  // cama
  fillRR(40, 210, 16, 130, 6, C.navy); fillRR(40, 280, 230, 30, 8, '#fff'); strokeRR(40, 280, 230, 30, 8, C.gray2, 2);
  fillRR(110, 272, 160, 40, [10, 10, 4, 4], C.blue3); fillRR(62, 262, 46, 20, 9, '#fff'); fillRR(256, 310, 12, 30, 3, C.navy2);
  fillRR(280, 290, 44, 50, 6, C.navy2); fillRR(292, 262, 20, 28, [8, 8, 2, 2], C.orange2);
  // painel de status na porta
  fillRR(335, 70, 120, 92, 12, C.navy); txt('Quarto 305', 395, 94, 16, '#fff', 800);
  const avail = ok || m === 'happy';
  fillRR(347, 112, 96, 34, 17, avail ? C.green : C.orange); txt(avail ? 'Disponível' : 'Ocupado', 395, 130, 15, '#fff', 800);
  if (prob) { ctx.save(); ctx.globalAlpha *= .5 + .5 * Math.sin(lt * 10); strokeRR(331, 66, 128, 100, 14, C.orange, 4); ctx.restore(); }
  // camareira
  const hx = 380;
  person(hx, 382, .72, { shirt: C.blue2, apron: true, skin: C.skin3, hair: C.hair1, hairStyle: 'long', mood: prob ? 'worried' : 'happy',
    look: prob ? (Math.sin(lt * 3) > 0 ? .3 : -.6) : -.7, armL: m === 'idle' ? 1.2 + .4 * Math.sin(lt * 7) : .3, armR: prob ? -2.2 : -.2, blink: blinkAt(lt, 5) });
  if (prob || ok || m === 'happy') { // brilhos: quarto pronto
    for (let i = 0; i < 4; i++) { const a = lt * 3 + i * 1.6, s = .5 + .5 * Math.sin(a); const x = 90 + i * 50, y = 240 - (i % 2) * 30;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * .3); ctx.globalAlpha *= s; ctx.fillStyle = C.orange2; ctx.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 4 : 12; ctx.lineTo(Math.cos(k * Math.PI / 4) * r, Math.sin(k * Math.PI / 4) * r); } ctx.fill(); ctx.restore(); }
  }
  if (st.warn) warnBadge(300, 40, st.warn, lt);
  if (st.okb) okBadge(300, 40, st.okb);
}
function roomGestao(st) {
  const lt = st.lt, m = st.mode, prob = m === 'problem', ok = m === 'ok' || m === 'happy';
  roomBase('ADMINISTRAÇÃO', '#F2F6FD');
  fillRR(320, 70, 130, 100, 10, '#fff'); strokeRR(320, 70, 130, 100, 10, C.gray2, 3); iconChart(385, 122, 70, C.navy2);
  manager(170, 382, .72, { noLegs: true, mood: prob ? 'worried' : (ok ? 'happy' : null), look: prob ? Math.sin(lt * 4) : .8, armR: -.9 + .12 * Math.sin(lt * 14), blink: blinkAt(lt, 6) });
  monitor(220, 186, 120, 80, () => {
    if (ok) { uiHeader('Painel'); fillRR(30, 150, 50, 80, 6, C.blue3); fillRR(100, 110, 50, 120, 6, C.blue); fillRR(170, 80, 50, 150, 6, C.blue2); iconCheck(330, 140, 34, C.green); }
    else uiPlanilha();
  });
  fillRR(20, 272, 330, 16, 6, C.navy); fillRR(30, 288, 310, 52, [0, 0, 8, 8], '#fff');
  if (ok) { for (let i = 0; i < 4; i++) fillRR(60, 262 - i * 5, 70, 6, 2, i % 2 ? '#fff' : C.gray3); }
  if (prob) { // papéis e telas espalhados
    for (let i = 0; i < 6; i++) {
      const a = lt * .9 + i * 1.05, x = 200 + Math.cos(a) * 150, y = 150 + Math.sin(a * 1.3) * 60;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(a) * .5);
      shadow(6, 3); fillRR(-24, -30, 48, 60, 4, '#fff'); noShadow(); strokeRR(-24, -30, 48, 60, 4, C.gray2, 2);
      for (let k = 0; k < 3; k++) line(-14, -16 + k * 12, 14, -16 + k * 12, C.gray2, 3);
      if (i % 2 === 0) { circle(16, -26, 11, C.orange); txt('?', 16, -25, 15, '#fff', 900); }
      ctx.restore();
    }
  }
  if (st.warn) warnBadge(420, 210, st.warn, lt);
  if (st.okb) okBadge(420, 210, st.okb);
}
const ROOM_FN = { recepcao: roomRecepcao, restaurante: roomRestaurante, quartos: roomQuartos, gestao: roomGestao };
function drawHotel(t, states, openP = 1) {
  outside(t);
  // interior
  for (const id in ROOMS) {
    const r = ROOMS[id];
    ctx.save(); ctx.translate(r.x, r.y); ctx.beginPath(); ctx.rect(0, 0, RW, RH); ctx.clip();
    ROOM_FN[id](states[id]);
    if (states.focus && states.focus.id !== id && states.focus.a > 0) { ctx.fillStyle = `rgba(11,37,84,${.55 * states.focus.a})`; ctx.fillRect(0, 0, RW, RH); }
    ctx.restore();
  }
  hotelShell(t, openP);
  if (openP < 1) { facadeHalf(-1, openP); facadeHalf(1, openP); }
}

/* ---------- estados por fase ---------- */
function statesAt(t) {
  const S = {}; const lt = warp(t);
  for (const id in ROOMS) S[id] = { mode: 'idle', lt, p: 0 };
  if (t >= T2.prob && t < T2.logo) {
    PROB_ORDER.forEach((o, i) => {
      const s0 = T2.prob + i * PD;
      if (t >= s0 - .2) S[o.id] = { mode: 'problem', lt: t, p: clamp((t - s0) / PD) };
    });
  }
  if (t >= T2.prob - .1 && t < T2.acc + .8) {
    const cur = clamp(Math.floor((t - T2.prob) / PD), 0, 3);
    S.focus = { id: PROB_ORDER[cur].id, a: P(t, T2.prob - .1, T2.prob + .4) * (1 - P(t, T2.acc, T2.acc + .7)) };
  }
  if (t >= T2.acc && t < T2.logo) {
    ['recepcao', 'restaurante', 'quartos', 'gestao'].forEach((id, i) => { S[id].warn = eback(P(t, 14.9 + i * .38, 15.2 + i * .38)); });
  }
  if (t >= T2.flow) {
    for (const id in ROOMS) S[id] = { mode: 'happy', lt: t, p: 1 };
    const ev = FLOW_EVENTS;
    S.recepcao = { mode: t < ev[0].t ? 'problem' : (t < ev[3].t ? 'ok' : 'checkout'), lt: t, p: t < ev[3].t ? 1 : clamp((t - ev[3].t) / 1.6) };
    S.quartos = { mode: t < ev[1].t ? 'problem' : 'ok', lt: t, p: 1 };
    S.restaurante = { mode: t < ev[2].t + .5 ? 'problem' : 'ok', lt: t, p: 1 };
    S.gestao = { mode: t < ev[4].t ? 'idle' : 'ok', lt: t, p: 1 };
    if (t < T2.flow + .5) { for (const id in S) if (S[id].mode === 'problem') S[id].p = 1; }
    ev.forEach(e => { if (t > e.t) S[e.room].okb = eback(P(t, e.t, e.t + .3)) * (1 - P(t, T2.pan - .2, T2.pan + .2)); });
    if (t >= T2.pan) { for (const id in ROOMS) S[id] = { mode: 'happy', lt: t, p: 1 }; S.recepcao.mode = 'ok'; }
  }
  return S;
}
const FLOW_EVENTS = [
  { t: 31.0, room: 'recepcao', label: 'Reserva consultada' },
  { t: 31.95, room: 'quartos', label: 'Quarto atualizado' },
  { t: 32.9, room: 'restaurante', label: 'Consumo na conta' },
  { t: 33.85, room: 'recepcao', label: 'Check-out concluído' },
  { t: 34.4, room: 'gestao', label: '' },
];

/* ---------- câmera ---------- */
function camAt(t) {
  if (t < T2.prob) {
    const a = lerp3([540, 900, 0.48], FULL, eio(P(t, 0, 2.5)));
    return lerp3(a, [540, 955, 0.9], P(t, 3.6, 6.4));
  }
  if (t < T2.acc + 1) {
    let c = [540, 955, 0.9];
    PROB_ORDER.forEach((o, i) => {
      const s0 = T2.prob + i * PD; const rcm = roomCam(o.id);
      c = lerp3(c, [rcm[0], rcm[1], rcm[2] + .06 * P(t, s0, s0 + PD)], eio(P(t, s0 - .05, s0 + .45)));
    });
    c = lerp3(c, FULL, eio(P(t, T2.acc, T2.acc + .7)));
    return c;
  }
  if (t < T2.logo) { const sh = P(t, 16.2, 17.8) * 4; return [FULL[0] + Math.sin(t * 37) * sh, FULL[1] + Math.cos(t * 29) * sh, FULL[2] + .04 * P(t, 15, 17.8)]; }
  if (t < T2.pan) return [540, 960, lerp(.86, .9, P(t, T2.flow, T2.pan))];
  // passeio final pelo hotel
  const keys = [[T2.pan, roomCam('quartos', 1.55)], [36.25, roomCam('gestao', 1.55)], [37.5, roomCam('restaurante', 1.55)], [38.75, roomCam('recepcao', 1.55)], [40.0, [540, 960, .86]]];
  let c = lerp3([540, 960, .9], keys[0][1], eio(P(t, T2.pan - .1, T2.pan + .55)));
  for (let i = 1; i < keys.length; i++) c = lerp3(c, keys[i][1], eio(P(t, keys[i][0] - .75, keys[i][0] - .05)));
  return c;
}

/* ---------- elementos de interface ---------- */
function sectorBanner(t, i) {
  const o = PROB_ORDER[i]; const s0 = T2.prob + i * PD, s1 = s0 + PD;
  const a = win(t, s0 + .05, s1 + (i === 3 ? .1 : .02), .25, .2);
  if (a <= 0) return;
  const p = eback(P(t, s0 + .05, s0 + .4));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, 410); ctx.scale(p, p);
  font(66, 800); const w = ctx.measureText(o.tag).width + 170;
  shadow(30, 12, 'rgba(11,37,84,.3)'); fillRR(-w / 2, -58, w, 116, 58, C.navy); noShadow();
  circle(-w / 2 + 62, 0, 40, C.orange); SECTOR_ICONS[o.icon](-w / 2 + 62, 0, 46, '#fff');
  txt(o.tag, -w / 2 + 118, 3, 66, '#fff', 800, 'left');
  ctx.restore();
}
function breadcrumb(t) {
  const a = win(t, T2.prob + .1, T2.acc + .3, .3, .3); if (a <= 0) return;
  const cur = clamp(Math.floor((t - T2.prob) / PD), 0, 3);
  ctx.save(); ctx.globalAlpha = a; font(30, 700);
  const parts = PROB_ORDER.map(o => o.tag); const sep = '  ·  ';
  const widths = parts.map(p => ctx.measureText(p).width); const sw = ctx.measureText(sep).width;
  const total = widths.reduce((s, w) => s + w, 0) + sw * 3;
  shadow(16, 6); fillRR(540 - total / 2 - 30, 512, total + 60, 60, 30, '#fff'); noShadow();
  let x = 540 - total / 2;
  parts.forEach((p, i) => {
    const done = i < cur, on = i === cur;
    txt(p, x, 543, 30, on ? C.orange : (done ? C.navy : C.gray), on ? 800 : 700, 'left'); x += widths[i];
    if (i < 3) { txt(sep, x, 543, 30, C.gray, 700, 'left'); x += sw; }
  });
  ctx.restore();
}
function eventPill(t, a, b, label) {
  const al = win(t, a, b, .2, .2); if (al <= 0) return;
  const p = eback(P(t, a, a + .3));
  ctx.save(); ctx.globalAlpha = al; ctx.translate(540, 440); ctx.scale(p, p);
  font(54, 800); const w = ctx.measureText(label).width + 150;
  shadow(30, 12, 'rgba(11,37,84,.25)'); fillRR(-w / 2, -54, w, 108, 54, '#fff'); noShadow();
  iconCheck(-w / 2 + 58, 0, 32, C.green); txt(label, -w / 2 + 104, 3, 54, C.navy, 800, 'left');
  ctx.restore();
}

/* ---------- pacotes acumulados entre os setores ---------- */
const JAMS = [[540, 1250, 0], [300, 950, 1], [790, 950, 2], [540, 760, 3]];
function drawJams(t) {
  const g = P(t, 14.6, 17.6); if (g <= 0) return;
  JAMS.forEach(([x, y, k]) => {
    const n = Math.floor(clamp(g * 1.4 - k * .1) * 5);
    for (let i = 0; i < n; i++) {
      const pop = eback(P(t, 14.6 + (k * 5 + i) * .12, 14.85 + (k * 5 + i) * .12));
      ctx.save(); ctx.translate(x + (rnd(k * 9 + i) - .5) * 30, y - i * 26 + Math.sin(t * 6 + i) * 2); ctx.rotate((rnd(k * 7 + i) - .5) * .5); ctx.scale(pop, pop);
      shadow(8, 3, 'rgba(255,122,26,.4)'); fillRR(-38, -16, 76, 32, 9, i % 2 ? C.orange : '#FF9442'); noShadow();
      fillRR(-26, -5, 30, 6, 3, 'rgba(255,255,255,.8)'); fillRR(-26, 4, 44, 5, 3, 'rgba(255,255,255,.5)');
      ctx.restore();
    }
    if (n >= 3) { ctx.save(); ctx.globalAlpha = .5 + .5 * Math.sin(t * 9 + k); ring(x, y - 50, 70, C.orange, 4); ctx.restore(); }
  });
}
/* ---------- circulação organizada ---------- */
const LOOP = [[295, 1318], [785, 1318], [785, 918], [295, 918], [295, 1318]];
function loopPt(u) {
  const segs = []; let tot = 0; for (let i = 0; i < LOOP.length - 1; i++) { const d = Math.hypot(LOOP[i + 1][0] - LOOP[i][0], LOOP[i + 1][1] - LOOP[i][1]); segs.push(d); tot += d; }
  let s = (((u % 1) + 1) % 1) * tot, i = 0; while (s > segs[i]) { s -= segs[i]; i++; }
  const q = s / segs[i]; return [lerp(LOOP[i][0], LOOP[i + 1][0], q), lerp(LOOP[i][1], LOOP[i + 1][1], q)];
}
function drawFlow(t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); LOOP.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 22; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 12; ctx.stroke();
  for (let k = 0; k < 12; k++) { const [x, y] = loopPt(t * .16 + k / 12); circle(x, y, 13, '#fff'); circle(x, y, 9, k % 4 === 0 ? C.orange : C.blue2); }
  for (const id in ROOMS) { const [x, y] = rc(id); const yy = id === 'quartos' || id === 'gestao' ? 918 : 1318; circle(x, yy, 22, C.blue); circle(x, yy, 10, '#fff'); }
  ctx.restore();
}

/* ---------- cenas ---------- */
function sceneHotel(t) {
  const cam = camAt(t); const st = statesAt(t);
  const openP = eio(P(t, 2.3, 3.5));
  camera(cam[0], cam[1], cam[2], () => {
    drawHotel(t, st, openP);
    if (t >= T2.acc && t < T2.logo) drawJams(t);
    if (t >= T2.flow) {
      drawFlow(t, P(t, T2.flow, T2.flow + .6) * (1 - P(t, T2.pan, T2.pan + .6)));
      // consumo viaja do restaurante para a recepção
      const e = FLOW_EVENTS[2];
      if (t > e.t - .55 && t < e.t + .2) { const p = eio(P(t, e.t - .55, e.t)); dataPacket(lerp(785, 295, p), 1290 - Math.sin(p * Math.PI) * 60, 'Consumo 204', 1.1, 1 - P(t, e.t, e.t + .2), C.orange, 'cutlery'); }
    }
  });
  // vinheta de tensão
  const v = P(t, 15.2, 17.6) * (1 - P(t, 17.6, 17.8));
  if (v > 0) { const g = ctx.createRadialGradient(540, 1000, 500, 540, 1000, 1150); g.addColorStop(0, 'rgba(255,122,26,0)'); g.addColorStop(1, `rgba(255,122,26,${.2 * v * (0.8 + .2 * Math.sin(t * 9))})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
}
function headerLogo2(t) { const m = eio(P(t, 19.0, 19.5)); return { x: 540, y: lerp(980, 320, m), h: lerp(260, 110, m) }; }
function sceneLogo2(t) {
  logoBG(); bgNetwork(t, P(t, T2.logo, T2.logo + .6));
  const s = eback(P(t, T2.logo, T2.logo + .45));
  for (let k = 0; k < 3; k++) { const p = P(t, T2.logo + k * .12, T2.logo + 1 + k * .12); if (p > 0 && p < 1) ring(540, 980, 140 + eo(p) * 520, k === 1 ? `rgba(227,30,45,${.45 * (1 - p)})` : `rgba(21,96,189,${.45 * (1 - p)})`, 10 * (1 - p) + 2); }
  for (let i = 0; i < 22; i++) { const p = P(t, T2.logo, T2.logo + 1.1); if (p <= 0 || p >= 1) continue; const a = rnd(i) * TAU, d = eo(p) * (300 + rnd(i + 4) * 360); circle(540 + Math.cos(a) * d, 980 + Math.sin(a) * d, 8 * (1 - p), i % 3 ? C.blue2 : '#19A8F2'); }
  const hl = headerLogo2(t);
  ctx.save(); ctx.translate(hl.x, hl.y); ctx.scale(lerp(.6, 1, s), lerp(.6, 1, s)); drawLogo(0, 0, hl.h, clamp(s * 1.5)); ctx.restore();
  const fl = 1 - P(t, T2.logo, T2.logo + .35); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
}
function sceneObserve(t) {
  logoBG(); bgNetwork(t, 1);
  const u = t - T2.obs, a = P(t, T2.obs, T2.obs + .35);
  ctx.save(); ctx.globalAlpha = a;
  // hotel em miniatura
  ctx.save(); ctx.translate(540, 930); const sc = lerp(.5, .6, eo(a)); ctx.scale(sc, sc); ctx.translate(-575, -930);
  ctx.save(); rr(-40, 380, 1180, 1040, 40); ctx.clip();
  const st = statesAt(T2.logo - .3); for (const id in st) { st[id].lt = t; st[id].warn = 0; }
  drawHotel(t, st, 1);
  // varredura de análise
  const sy = lerp(450, 1380, (u * .7) % 1);
  const g = ctx.createLinearGradient(0, sy - 120, 0, sy); g.addColorStop(0, 'rgba(25,168,242,0)'); g.addColorStop(1, 'rgba(25,168,242,.35)');
  ctx.fillStyle = g; ctx.fillRect(-40, sy - 120, 1180, 120); line(-40, sy, 1140, sy, '#19A8F2', 6);
  ctx.restore();
  ctx.restore();
  // gestor e profissional da TC observando
  manager(330, 1470, 1.0, { mood: null, look: .4, blink: blinkAt(t, 3), armL: .1, armR: -.2, tilt: -.05 });
  tcPro(760, 1470, 1.0, { mood: 'happy', look: -.5, armR: -2.55 + .08 * Math.sin(t * 4), blink: blinkAt(t, 4), holdL: () => { fillRR(-22, 84, 44, 30, 5, C.navy); fillRR(-18, 88, 36, 22, 3, '#BFE1FF'); } });
  ctx.restore();
  drawLogo(540, 320, 110);
}
const SVC2 = [
  { title: 'Consultoria em TI', text: 'Análise dos sistemas e planejamento.', draw: svcConsultTI },
  { title: 'Infraestrutura', text: 'Rede e equipamentos organizados.', draw: svcInfra },
  { title: 'Suporte técnico', text: 'Atendimento técnico no dia a dia.', draw: svcSupport },
  { title: 'Consultoria em hotelaria', text: 'Um olhar sobre a rotina do seu hotel.', draw: svcHotel },
];
function serviceHeader2(t, i, alpha) {
  const s = SVC2[i]; const t0 = T2.svc + i * SD;
  const p = eback(P(t, t0 + .05, t0 + .4)), q = P(t, t0 + .15, t0 + .5);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(540, 470); ctx.scale(p, p);
  font(54, 800); const w = ctx.measureText(s.title).width + 150;
  shadow(20, 8, 'rgba(255,122,26,.35)'); fillRR(-w / 2, -48, w, 96, 48, C.orange); noShadow();
  circle(-w / 2 + 48, 0, 30, '#fff'); txt(String(i + 1).padStart(2, '0'), -w / 2 + 48, 1, 26, C.orange, 900);
  txt(s.title, -w / 2 + 92, 2, 54, '#fff', 800, 'left');
  ctx.restore();
  ctx.globalAlpha = alpha * q; txt(s.text, 540, 592 + (1 - eo(q)) * 20, 42, C.navy, 600);
  ctx.restore();
}
function sceneServices2(t) {
  logoBG(); bgNetwork(t, 1);
  const k = clamp(Math.floor((t - T2.svc) / SD), 0, 3);
  for (let i = Math.max(0, k - 1); i <= k; i++) {
    const t0 = T2.svc + i * SD, u = t - t0;
    const inP = i === 0 ? 1 : eio(P(t, t0 - .02, t0 + .38));
    const outP = i < 3 ? eio(P(t, t0 + SD - .02, t0 + SD + .38)) : 0;
    if (outP >= 1) continue;
    ctx.save(); ctx.translate((1 - inP) * 1100 - outP * 1100, 0); ctx.globalAlpha *= i === 0 ? P(t, T2.svc - .1, T2.svc + .35) : 1;
    SVC2[i].draw(Math.max(0, u * (2.6 / SD))); ctx.restore();
    serviceHeader2(t, i, i < 3 ? 1 - P(t, t0 + SD - .1, t0 + SD + .15) : 1);
  }
  drawLogo(540, 320, 110);
}
function sceneEnd2(t) {
  logoBG(); bgNetwork(t, 1);
  const lp = eback(P(t, T2.end + .05, T2.end + .55));
  ctx.save(); ctx.translate(540, 860); ctx.scale(lp, lp); drawLogo(0, 0, 280, clamp(lp)); ctx.restore();
  const a = eo(P(t, T2.end + .7, T2.end + 1.1));
  ctx.save(); ctx.globalAlpha = a; fillRR(470, 1062, 140, 6, 3, C.orange);
  txt('@tc_solucoes', 540, 1160 + (1 - a) * 20, 76, C.blue, 900); ctx.restore();
}

/* ---------- render ---------- */
let showSafe = false;
function drawSafeZones() { ctx.save(); ctx.fillStyle = 'rgba(255,0,80,.18)'; ctx.fillRect(0, 0, W, 220); ctx.fillRect(0, 1500, W, 420); ctx.fillRect(950, 900, 130, 600); ctx.restore(); }
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.sky; ctx.fillRect(0, 0, W, H);
  if (t < T2.logo || (t >= T2.flow && t < T2.end + .4)) sceneHotel(t);
  if (t >= T2.logo && t < T2.obs) sceneLogo2(t);
  if (t >= T2.obs && t < T2.svc) sceneObserve(t);
  if (t >= T2.svc && t < T2.flow) sceneServices2(t);
  // transição serviços → hotel
  if (t >= T2.flow && t < T2.flow + .45) { ctx.save(); ctx.globalAlpha = 1 - eio(P(t, T2.flow, T2.flow + .45)); sceneServices2(T2.flow - .001); ctx.restore(); }
  if (t >= T2.end) { ctx.save(); ctx.globalAlpha = eio(P(t, T2.end, T2.end + .4)); sceneEnd2(t); ctx.restore(); }
  // textos
  headline(t, 0.9, 3.7, [[['Seu hotel tem']], [['vários setores.', C.orange]]]);
  headline(t, 3.85, 6.45, [[['E todos precisam']], [['funcionar juntos.', C.orange]]]);
  for (let i = 0; i < 4; i++) sectorBanner(t, i);
  breadcrumb(t);
  headline(t, 14.75, 17.75, [[['Quando uma etapa falha,']], [['outras sentem.', C.orange]]]);
  FLOW_EVENTS.slice(0, 4).forEach((e, i) => eventPill(t, e.t, i < 3 ? FLOW_EVENTS[i + 1].t - .02 : T2.pan - .05, e.label));
  headline(t, 35.25, 37.7, [[['Da reserva ao']], [['fechamento da conta.', C.orange]]]);
  headline(t, 37.85, 40.15, [[['Tecnologia e consultoria']], [['para a sua operação.', C.orange]]]);
  if (showSafe) drawSafeZones();
}
window.renderFrame = renderFrame;
window.DUR = DUR2; window.FPS = FPS;

if (!/render/.test(location.search)) {
  const btn = document.getElementById('play'), tc = document.getElementById('tc');
  document.getElementById('safe').onchange = e => { showSafe = e.target.checked; };
  const audio = new Audio('out/audio_v2.wav');
  let start = null, playing = false;
  window.ready.then(() => renderFrame(0));
  btn.onclick = () => {
    if (playing) { playing = false; audio.pause(); btn.textContent = '▶ Reproduzir'; return; }
    playing = true; btn.textContent = '❚❚ Pausar'; audio.currentTime = 0; audio.play().catch(() => {}); start = performance.now();
    const loop = now => { if (!playing) return; const t = (now - start) / 1000; if (t > DUR2) { playing = false; btn.textContent = '▶ Reproduzir'; return; } renderFrame(t); tc.textContent = t.toFixed(1) + 's'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };
} else { document.body.classList.add('render'); }
