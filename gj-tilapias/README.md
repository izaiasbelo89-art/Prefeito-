# GJ Tilápias e Frutos do Mar — vídeo

- `audio/locucao-gj-tilapias.(mp3|wav)`: locução cortada (39,5 s, voz "Renato").
- `assets/logo.png`: logomarca original (selo redondo, fundo transparente).
- `assets/fotos/`: fotos da loja (a receber).

Marca: azul-marinho (~#00187A), vermelho (~#C00000), branco/creme.
WhatsApp (na logo): (85) 99965-8758.

## Localização
Rua Ana Facó, 85 — Álvaro Weyne, Fortaleza/CE (acesso pela Av. Francisco Sá, perto do Mercado do Carlito Pamplona).
Coordenadas: 3°42'55.2"S 38°33'41.6"W.

## Material recebido
- `assets/mapas/como-chegar-rota.png` / `como-chegar-sem-rota.png`: mapa OpenStreetMap 1080×1920 (rota desde a Av. Francisco Sá). Animação do carro chegando.
- `assets/mapas/satelite-bairro.png` / `satelite-zoom.png`: vista de satélite (Google) para a aproximação aérea.
- `assets/fotos/fachada.png`: fachada da loja (Street View, © 2022 Google).
- `assets/fotos/caminhao-print-instagram.png`: print de um Reels do @gj_tilapias (caminhão em frente à loja, à noite).
- `assets/fotos/caminhao-recorte.png`: recorte sem a interface do Instagram (975×1325).

Instagram: @gj_tilapias. Slogan no caminhão: "Qualidade Incomparável".

## Vídeo (Reels/TikTok)
`video/out/gj-tilapias-reels.mp4`: 1080×1920, 30 fps, 41 s, −14 LUFS (locução + música com ducking + efeitos).

| Tempo | Fala | Imagem |
|---|---|---|
| 0–3,7 | Já sabe o que vai pra panela hoje? | Panela no fogo, "?" |
| 3,8–6,5 | Se bateu vontade de comer peixe… | Tilápia pula na panela e doura |
| 6,6–8,8 | …vem pra GJ Tilápias! | Selo da GJ |
| 9,0–15,2 | Tilápia inteira / filé / frutos do mar | Ilustrações dos três produtos |
| 15,2–17,3 | E pra chegar é fácil. | Satélite com aproximação |
| 17,6–21,2 | Av. Francisco Sá → Rua Ana Facó | Carro percorre a rota no mapa |
| 21,7–24,3 | Perto do Mercado do Carlito Pamplona | Mercado destacado no mapa |
| 24,3–27,9 | …fachada azul da GJ Tilápias | Foto da fachada |
| 27,9–32,8 | Número 85, Álvaro Weyne, Fortaleza | Caminhão + cartão de endereço |
| 32,8–37,6 | Quer consultar… WhatsApp que tá na tela | Celular + (85) 99965-8758 |
| 37,6–41,0 | GJ Tilápias! | Selo, @gj_tilapias, endereço |

Gerar de novo (em `video/`): `python3 audio_gj.py`, normalizar para −14 LUFS em `out/audio_mix.wav`, `node render.js` e juntar vídeo + áudio com ffmpeg.
