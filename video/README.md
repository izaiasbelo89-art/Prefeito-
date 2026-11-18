# TC Soluções Tecnológicas — vídeo de apresentação (Reels / TikTok)

Vídeo vertical 1080×1920 (9:16), 30 fps, **43,5 s**, H.264 + AAC, áudio normalizado em −14 LUFS.

Arquivo final: `out/tc-solucoes-reels.mp4`

## Roteiro e tempos

| Tempo | Cena | Ação visual | Texto na tela | Som |
|---|---|---|---|---|
| 0,0–2,4 | Reserva | Notificação "Nova reserva · Quarto 204" no computador do setor de Reservas; a informação vira um cartão laranja e a câmera a acompanha até a recepção | — | notificação, whoosh |
| 2,0–6,5 | Chegada | Hóspede chega com a mala; a informação se perde no caminho ("?"); recepcionista alterna entre telas (busca, planilha, e-mails), carregando; hóspede espera ("...") | **A reserva chegou. / A informação também?** | rodinhas da mala, glitch, cliques, tique de carregamento |
| 5,4–7,2 | Transição | Reserva localizada; cartão-chave "204" é entregue e voa até a mesa do restaurante | — | confirmação discreta, whoosh |
| 7,0–8,9 | Restaurante | Hóspede faz o pedido; garçom toca em "Lançar na conta do quarto" | — | pops, clique |
| 8,9–12,2 | Restaurante → recepção | Câmera se afasta: o consumo percorre o caminho até a recepção e para no meio: **Pendente** | **O consumo do restaurante / entrou na conta?** | envio, alerta, tique |
| 12,2–18,0 | Check-out | Hóspede volta com a mala; recepcionista confere hospedagem, consumo (pendente) e valores (?) entre telas e anotações; relógio acelera; hóspede olha o relógio | **Na saída, tudo precisa fechar.** → **Sua tecnologia acompanha a operação?** | relógio acelerando, papéis, cliques |
| 18,0–24,0 | Virada | A recepção vira um dos cartões do hotel: Reservas, Recepção, Gestão, Quartos, Restaurante. Ligações tracejadas/travadas → ligações azuis, fluxo contínuo | **Seu hotel funciona em conjunto.** → **A tecnologia precisa acompanhar.** | respiro musical, subida, blips |
| 24,0–25,6 | Logo | Setores convergem; impacto e revelação da logomarca | — | impacto + brilho |
| 25,6–28,2 | 01 Consultoria em TI | Profissional da TC e gestor; equipamentos desorganizados viram um planejamento (Diagnóstico, Prioridades, Plano de ação) | Orientação para suas decisões de tecnologia. | |
| 28,2–30,8 | 02 Infraestrutura | Hotel em corte: rack, cabos, pontos de Wi-Fi em cada andar; dados circulando | A base tecnológica da sua operação. | |
| 30,8–33,4 | 03 Suporte técnico | Chamado "Aberto → Em atendimento → Resolvido"; técnico atua no equipamento; recepção volta a funcionar | Apoio para resolver os problemas do dia a dia. | notificação, cliques, confirmação |
| 33,4–36,0 | 04 Consultoria em hotelaria | Reunião com o gestor; lupa percorre o mapa dos setores do hotel | Um olhar sobre as necessidades do seu hotel. | |
| 36,0–38,6 | Retomar a jornada | Reserva localizada ✓ · Consumo na conta ✓ · Check-out concluído ✓ (objetivo dos serviços) | — | 3 confirmações |
| 38,6–43,5 | Encerramento | Logo · **Da reserva ao check-out, conte com a TC.** · Consultoria em TI • Infraestrutura • Suporte técnico / Consultoria em hotelaria · botão **Converse com a nossa equipe.** · **@tc_solucoes** | | acorde final |

Áreas seguras: todo texto e ação importante ficam entre y≈260 e y≈1460 px e longe da coluna de ícones à direita (marque "Áreas da interface" na prévia para visualizar).

## Pontos para validação

- **Logomarca:** o arquivo original não estava no repositório; o vídeo usa um **logo provisório** ("TC SOLUÇÕES TECNOLÓGICAS"). Coloque a logo original em `assets/logo.png` (PNG com fundo transparente, versão para fundo claro) e renderize de novo. Ela entra automaticamente, sem distorção, em todas as aparições.
- **Telas de sistema:** todas são ilustrativas e genéricas (sem marcas de software, integrações ou prazos de atendimento).
- Rótulos ilustrativos usados dentro das telas e cenas: "Nova reserva · Quarto 204 · 2 diárias", "Pendente", "Lançar na conta do quarto", "Chamado aberto · Recepção: computador sem conexão", "Planejamento de TI: Diagnóstico / Prioridades / Plano de ação", "Rotina do hotel". Ajuste se preferir outra redação.
- Música e efeitos são **originais, sintetizados por código** (`audio.py`), sem uso de faixas de terceiros.

## Como gerar novamente

Requisitos: Node + Playwright (Chromium), Python 3 com numpy/scipy e ffmpeg.

```bash
cd video
python3 audio.py                                  # trilha -> out/audio_raw.wav
ffmpeg -y -i out/audio_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 out/audio.wav
node render.js                                    # quadros -> out/video_noaudio.mp4
ffmpeg -y -i out/video_noaudio.mp4 -i out/audio.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/tc-solucoes-reels.mp4
```

Prévia interativa com áudio: sirva a pasta (`python3 -m http.server` dentro de `video/`) e abra `index.html`.
Quadros avulsos: `node render.js --stills 3.5,10,24.5`.
