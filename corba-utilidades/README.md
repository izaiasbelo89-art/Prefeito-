# Corbã Utilidades — vídeo

- `audio/locucao-original-recortada.wav` / `audio/locucao-corba.mp3`: locução (voz "Gabriel – Bright and charismatic"), 83,4 s.
  Cortada no início real da fala: os 2,45 s iniciais da gravação de tela eram uma repetição de um trecho
  (fala de antes do reinício do player) e foram removidos; termina em "…que ela vai abrir.".

Tema: a Corbã vai abrir a quinta loja (hoje são quatro lojas em três cidades) e pergunta ao público
em que cidade ela vai abrir.

Final do texto (visível na gravação): "Por enquanto, são quatro lojas em três cidades. E lembra da pergunta lá do
começo? A quinta loja da Corbã tá a caminho. Qual é o seu palpite? Conta aqui nos comentários em que cidade você
acha que ela vai abrir."

## Locução tratada
`audio/locucao-final.wav` / `audio/locucao-corba-tratada.mp3`: 68,2 s (original 83,4 s). Gerada por
`video/process_voice.py`: pausas encurtadas, ritmo 8% mais rápido sem mudar o tom, equalização e compressão.
`video/warp.json` mapeia tempo original → tratado.

Texto completo em `video/texto.txt`; tempos de cada frase (na locução tratada) em `video/timing.json` (`video/align.py`).
