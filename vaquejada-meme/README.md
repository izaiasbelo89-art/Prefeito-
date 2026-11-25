# Meme — treino de vaquejada (queda do vaqueiro)

Vídeo vertical 1080×1920, 30 fps, 18 s, −14 LUFS. Arquivo local (fora do git, contém pessoas): `out/meme-vaquejada.mp4`.
Fontes: IMG_4652.mov (corrida e queda, 4K 60 fps) e IMG_4654.mov (vaqueiro rindo depois), da pasta do Google Drive.

| Tempo | O que acontece |
|---|---|
| 0–1,1 | Gancho: vaqueiro congelado no ar com zoom + "ESPERA O FINAL 😂" |
| 1,1–7,0 | Corrida (som original da arena + suspense), placar BOI 0 × 0 NEGÃO (apelido do vaqueiro) |
| 7,0–7,65 | Queda com tremida, "UUUUUH! 😱", placar vira 1 × 0 |
| 7,65–8,45 | "REVISÃO DO VAR" (apito + bipe) |
| 8,45–12,6 | Replay em câmera lenta (35%), zoom no vaqueiro com círculo vermelho, "TUM! 💥", "LANCE CONFIRMADO ✅" |
| 12,6–14,4 | O boi olhando: "O boi: tá tudo bem aí, Negão? 🐂" |
| 14,4–17,6 | Vaqueiro rindo: "Treino é treino… 😂" |
| 17,6–18 | Volta para o quadro do gancho (loop) |

Gerar de novo: `python3 extrair.py` (+ trecho 4K da queda), `python3 audio_meme.py`, normalizar para −14 LUFS,
`node render.js` e juntar vídeo e áudio com ffmpeg. Efeitos sonoros são sintetizados (sem material de terceiros).
