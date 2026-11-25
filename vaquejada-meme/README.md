# Meme — treino de vaquejada (queda do vaqueiro)

Vídeo vertical 1080×1920, 30 fps, 34 s, −14 LUFS. Arquivo local (fora do git): `out/meme-vaquejada.mp4`.
Versão 4, padrão TikTok: legenda nativa (caixa branca), sem gráficos extras.

| Tempo | O que acontece |
|---|---|
| 0–2,0 | Gancho: a queda em câmera lenta e trava com a cara na areia (boom) |
| 2,0–2,4 | Rebobina (◀◀ + som de fita) |
| 2,4–22,3 | A corrida desde o começo do vídeo, em tempo normal, câmera acompanhando; narrador a partir de ~16 s |
| 22,3–25,6 | Trava 3 vezes na queda (no ar, de cabeça para baixo, cara na areia), com zoom, tremida e boom |
| 25,6–28,9 | Ele no chão, narrador reagindo |
| 28,9–30,7 | O boi: "o boi depois: 🧍‍♂️" |
| 30,7–34,0 | Ele rindo: "treino é treino né 😭" |
Legenda fixa até o boi: "POV: o Negão garantiu que hoje derrubava o boi 😎".

Versões anteriores: `meme_v1.js` (18 s, VAR), `meme_v2.js` (placar + círculo), `meme_v3.js` (19 s, sem gancho de queda), com `audio_meme_v2.py`.

Gerar de novo: `python3 extrair.py` (+ trecho 4K da queda), `python3 audio_meme.py`, normalizar para −14 LUFS,
`node render.js` e juntar vídeo e áudio com ffmpeg. Efeitos sonoros são sintetizados (sem material de terceiros).
