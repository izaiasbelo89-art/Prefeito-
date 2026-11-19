# Corbã Utilidades — vídeo

- `audio/locucao-original-recortada.wav` / `audio/locucao-corba.mp3`: narração atual (voz "Gabriel – Bright and charismatic"), 72,5 s.
  Os 2,4 s iniciais da gravação eram sobra de uma reprodução anterior (player em 00:03, reiniciado no 1º segundo) e foram cortados.
- `audio/locucao-final.wav` / `audio/locucao-corba-tratada.mp3`: versão tratada, 59,2 s (pausas encurtadas, ritmo 8% mais rápido,
  equalização e compressão; `video/process_voice.py`). `video/warp.json` mapeia tempo original → tratado.
- Texto em `video/texto.txt`; tempo de cada frase na versão tratada em `video/timing.json` (`video/align.py`).
- `audio/v1-quinta-loja/`: narração anterior ("A Corbã vai abrir a quinta loja…"), substituída.

Tema: história da Corbã: começou na indústria de alumínio em Iguatu (CE); 1ª loja de varejo em janeiro de 2002;
hoje 4 lojas (Iguatu – R. Santos Dumont, Centro; Juazeiro do Norte – Atacarejo na Av. Padre Cícero, São José, e R. São Pedro,
Salesianos; Senador Pompeu – Av. Francisco França Cambraia, Centro, inaugurada em agosto de 2026), fabricação própria e
centro de distribuição (Juazeiro). A quinta loja vem aí. Slogan: "Sua casa merece Corbã."

## Identidade
- `assets/logo.png`: logo redonda (fundo branco circular, recortada do print do perfil, 735×735, fundo transparente).
- Cores: vermelho (~#E2231A), azul-claro (~#3FA2E8), azul-marinho (~#1B2F8F), branco. Assinatura na logo: "seu dia mas feliz".

## Vídeos recebidos (mantidos só localmente em `assets/videos/`, fora do git)
464×832, 60 fps, câmera 360° reenquadrada.

| Arquivo | Conteúdo | Uso previsto |
|---|---|---|
| fabrica-galpoes-aereo.mov (9 s) | galpões da fábrica vistos do alto | Iguatu – indústria |
| fabrica-esteira-panelas.mov (20 s) | esteira com panelas | indústria de alumínio |
| fabrica-maquinas.mov (4 s) | máquinas | indústria |
| fabrica-robos.mov (10 s) | braços robóticos | indústria |
| fabrica-linha-panelas.mov (7 s) | panelas na esteira | fabricação própria |
| fabrica-embalagem.mov (7 s) | linha de embalagem | fabricação própria |
| iguatu-letreiro.mov (4 s) | letreiro "IGUATU" | chegada em Iguatu |
| juazeiro-padre-cicero-aereo.mov (17 s) | estátua do Padre Cícero | chegada em Juazeiro do Norte |
| senador-pompeu-letreiro-praca.mov (9 s) | praça com letreiro "SENADOR POMPEU" | chegada em Senador Pompeu |
| senador-pompeu-igreja-aereo.mov (20 s) | igreja matriz, aérea | Senador Pompeu |
| galpao-aereo-a-identificar.mov (19 s) | galpão visto do alto | a confirmar (centro de distribuição?) |
| loja-fachada-a-identificar.mov (7 s) | fachada de vidro de uma loja Corbã | a confirmar qual loja |
| juazeiro-mundo-avenida-loja.mov (15 s, 720×1280) | efeito "mundinho" abrindo → avenida → loja Corbã | abertura de Juazeiro do Norte (Atacarejo?) |
| iguatu-fachada-aereo.mov (10 s, 720×1280) | fachada da loja de Iguatu, aérea até a entrada | "A loja de Iguatu fica na Rua Santos Dumont" |
| loja-interior-decoracao.mov (14 s, 720×1280) | interior: decoração, utensílios, organização | "Bora entrar?" / variedade (loja a confirmar) |
| loja-interior-corredor.mov (7 s, 720×1280) | corredor com cadeiras, baldes, organização | variedade (loja a confirmar) |

(Um 5º arquivo enviado era idêntico ao vídeo do "mundinho" de Juazeiro e foi descartado.)

## Rascunho 1 (61 s)
Arquivo local: `video/out/corba-rascunho-1.mp4` (e `-leve.mp4`). Por conter os vídeos com pessoas, o MP4 e os quadros
extraídos ficam fora do git.
Montagem: `video/extract.py` (trechos dos vídeos → quadros, definidos em `clips.json`), `video/cenarios.js` (cenários
ilustrados: Iguatu, Juazeiro/Padre Cícero, Senador Pompeu/igreja, lojinha 2002, mapa do Ceará), `video/corba.js`
(linha do tempo), `video/audio_corba.py` (trilha), `node render.js`.

## Versão 2 (com o guia) — 92 s
Narração: `audio/locucao-final.wav` (90 s, ritmo natural, só corte + limpeza de som). Texto em `video/texto.txt`,
frases em `video/timing.json`, palavras em `video/words.json`, legendas em `video/legendas.json` (`align.py`, `palavras.py`).
Mapas reais (OpenStreetMap): `mapas/rotas.py` (rotas de carro OSRM) e `mapas/tiles.py` (mapas de ruas z16 e cidades z13).
Pontos de saída: Rodoviária de Iguatu; Basílica de N. Sra. das Dores (Juazeiro); Centro de Senador Pompeu.
Destinos: Iguatu pela coordenada do guia comercial; Atacarejo, Salesianos e Senador Pompeu **aproximados** (ruas certas,
número da entrada a confirmar). Montagem: `video/index2.html` + `video/corba2.js` + `guia.js` + `cenarios.js`; trilha `video/audio_corba2.py`.
Vídeo local (fora do git): `video/out/corba-v2.mp4` e `corba-v2-leve.mp4`.

## Versão 3
- O carrinho dos mapas foi trocado pelo **Poker Moon** (cavalo do dono, com ele montado), a partir do desenho enviado
  (`assets/pokermoon.png`, recortado sem a logo; mantido fora do git por conter a imagem de uma pessoa). Trota pela rota real,
  vira para o lado do movimento e sai de lado na chegada para o pino aparecer. Também conduz os trajetos entre cidades.
- Som de cascos no lugar do motor.
- Rua São Pedro (Salesianos): não há vídeo dessa loja; fica só mapa + endereço. A fachada de vidro é do Atacarejo (avenida).
Vídeo local: `video/out/corba-v3.mp4` / `corba-v3-leve.mp4`.
