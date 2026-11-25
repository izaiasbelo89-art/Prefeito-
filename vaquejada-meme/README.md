# Meme — treino de vaquejada (queda do vaqueiro)

Vídeo vertical 1080×1920, 30 fps, 39 s, −14 LUFS. Arquivo local (fora do git): `out/meme-vaquejada.mp4`.
Versão 5 — "mais engraçado": padrão TikTok + memes da internet e da vaquejada.

| Tempo | O que acontece | Som |
|---|---|---|
| 0–2,1 | Gancho: a queda, trava na cara na areia. "ele disse que hoje o boi caía 😎" | disco arranhando, boom |
| 2,1–2,5 | Rebobina ◀◀ | fita voltando |
| 2,5–6,5 | Trailer de filme: barras de cinema, "NO SERTÃO DO CEARÁ… UM VAQUEIRO… UMA MISSÃO… DERRUBAR O BOI 🐂" | drone + braams épicos |
| 6,5–12,1 | Corrida acelerada ⏩ 2x: "o boi: 🐂 de boa" / "Negão: confia 😎" | música de perseguição |
| 12,1–16,9 | Aproximação com o narrador; "modo vaquejada: ATIVADO 🔥"; mira de videogame "🎯 ALVO LOCALIZADO" | narrador original |
| 16,9–19,0 | Câmera lenta: "foi aqui que tudo deu errado 💀" | silêncio + coração |
| 19,0–20,5 | Trava 1 (no ar): "PLANO INFALÍVEL ✅" + trajetória "calculada pela NASA 🚀" | boom + ding |
| 21,1–22,6 | Trava 2 (de cabeça para baixo): janela "vaqueiro.exe parou de funcionar 💀" | boom + erro |
| 23,1–24,8 | Trava 3 (cara na areia): tela cinza "MISSÃO FRACASSADA — o boi venceu" | boom + game over |
| 24,8–28,7 | REPLAY 🔁 em câmera lentíssima | narrador desacelerado (voz grossa) |
| 28,7–31,9 | Placar BOI 1 × 0 NEGÃO; placa "ZERO!" do locutor; "Negão meditando na areia 🧘‍♂️" | buzina |
| 31,9–34,1 | O boi: "o boi indo embora: valeu, parceiro 👋🐂" | trombone triste |
| 34,1–37,5 | Ele rindo: "tá tudo bem, foi só treino 😭" | áudio original |
| 37,5–39,1 | Congela em sépia + seta amarela "CONTINUA…" / "na próxima ele volta…" | riff de "continua" |

Versões anteriores: `meme_v1.js` (18 s, VAR), `meme_v2.js` (placar + círculo), `meme_v3.js` (19 s, sem gancho de queda), `meme_v4.js` (34 s, sério) + `audio_meme_v4.py`, com `audio_meme_v2.py`.

Gerar de novo: `python3 extrair.py` (+ trecho 4K da queda), `python3 audio_meme.py`, normalizar para −14 LUFS,
`node render.js` e juntar vídeo e áudio com ffmpeg. Efeitos sonoros são sintetizados (sem material de terceiros).
