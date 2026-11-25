# Meme — treino de vaquejada (queda do vaqueiro)

Vídeo vertical 1080×1920, 30 fps, 19,8 s, −14 LUFS. Arquivo local (fora do git, contém pessoas): `out/meme-vaquejada.mp4`.
Fontes: IMG_4652.mov (chegada e queda, 4K 60 fps, com o narrador) e IMG_4654.mov (vaqueiro rindo depois).

| Tempo | O que acontece |
|---|---|
| 0–1,0 | Gancho: vaqueiro congelado no ar + "ESPERA O FINAL 😂" |
| 1,0–6,35 | Chegada em tempo real com a narração original; câmera acompanha e aproxima. "Lá vem o Negão 🐎" / "Será que ele derruba o boi? 🤔". Placar BOI 0 × 0 NEGÃO |
| 6,35–11,67 | Queda em câmera lenta com rampa (50% → 20% → 55%), quadros mesclados, círculo vermelho seguindo ele, áudio desacelerado. "TUM! 💥" e placar 1 × 0 no impacto (10,1 s) |
| 11,67–14,42 | No chão, narrador reagindo em tempo real; "UUUUUH! 😱" e "VAR: LANCE CONFIRMADO ✅" |
| 14,42–16,22 | O boi olhando: "O boi: tá tudo bem aí, Negão? 🐂" |
| 16,22–19,42 | Ele rindo: "Treino é treino… 😂" |
| 19,42–19,8 | Volta para o gancho (loop) |

Versão anterior (18 s, com VAR separado): `meme_v1.js`.

Gerar de novo: `python3 extrair.py` (+ trecho 4K da queda), `python3 audio_meme.py`, normalizar para −14 LUFS,
`node render.js` e juntar vídeo e áudio com ffmpeg. Efeitos sonoros são sintetizados (sem material de terceiros).
