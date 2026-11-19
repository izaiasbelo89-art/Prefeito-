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
