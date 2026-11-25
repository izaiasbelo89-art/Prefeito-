# Meme — treino de vaquejada (queda do vaqueiro)

Vídeo vertical 1080×1920, 30 fps, 19,3 s, −14 LUFS. Arquivo local (fora do git): `out/meme-vaquejada.mp4`.
Versão 3, padrão TikTok: legenda nativa (caixa branca, texto preto), sem placar/círculo/selos.

| Tempo | O que acontece |
|---|---|
| 0–5,55 | Chegada em tempo real com o narrador; câmera acompanha. Legenda: "POV: o Negão garantiu que hoje derrubava o boi 😎" |
| 5,55–11,44 | Câmera lenta com 3 travamentos (no ar, de cabeça para baixo, cara na areia), cada um com zoom de impacto, tremida e boom grave |
| 11,44–14,19 | No chão, narrador reagindo em tempo real |
| 14,19–15,99 | O boi: "o boi depois: 🧍‍♂️" |
| 15,99–19,3 | Ele rindo: "treino é treino né 😭" |

Versões anteriores: `meme_v1.js` (18 s, VAR) e `meme_v2.js` (placar + círculo), com `audio_meme_v2.py`.

Gerar de novo: `python3 extrair.py` (+ trecho 4K da queda), `python3 audio_meme.py`, normalizar para −14 LUFS,
`node render.js` e juntar vídeo e áudio com ffmpeg. Efeitos sonoros são sintetizados (sem material de terceiros).
