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
`video/out/gj-tilapias-reels.mp4`: 1080×1920, 30 fps, 40 s, −14 LUFS (locução + música com ducking + efeitos).
A logomarca fica fixa no canto superior direito (some só quando a logo aparece grande).

Locução recortada no início real da fala (38,3 s). Os primeiros cortes tinham um trecho repetido
("Tem tilápia…") de quando o áudio foi reiniciado na gravação; foi removido.

| Tempo | Fala | Imagem |
|---|---|---|
| 0–2,5 | Já sabe o que vai pra panela hoje? | Fachada da loja, nuvens passando, brilho no letreiro |
| 2,6–5,2 | Se bateu vontade de comer peixe, | Câmera se aproxima da placa oval; bolhas nos peixes pintados |
| 5,2–7,5 | vem pra GJ Tilápias! | A placa oval da fachada vira o selo da GJ |
| 7,8–13,8 | Tilápia inteira / filé / frutos do mar | Quadro "Tem na GJ Tilápias" sobre o interior da loja |
| 14,0–16,0 | E pra chegar é fácil. | Satélite com aproximação |
| 16,4–20,5 | Av. Francisco Sá → Rua Ana Facó | Carro percorre a rota no mapa |
| 20,5–23,1 | Perto do Mercado do Carlito Pamplona | Mercado destacado no mapa |
| 23,1–26,7 | …fachada azul da GJ Tilápias | Fachada com contorno animado |
| 26,7–31,5 | Número 85, Álvaro Weyne, Fortaleza | Caminhão + cartão de endereço |
| 31,6–36,4 | Quer consultar… WhatsApp que tá na tela | Celular + (85) 99965-8758 |
| 36,5–40,0 | GJ Tilápias! | Selo, @gj_tilapias, endereço |

Gerar de novo (em `video/`): `python3 audio_gj.py`, normalizar para −14 LUFS em `out/audio_mix.wav`, `node render.js` e juntar vídeo + áudio com ffmpeg.
