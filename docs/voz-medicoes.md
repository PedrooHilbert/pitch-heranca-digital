# Medições da voz — revisão "voz expressiva"

Voz: **Thalita** (`pt-BR-ThalitaMultilingualNeural`, edge-tts), velocidade natural. Medido com librosa (pyin 70–400 Hz,
RMS, tempo das palavras). Scripts: `scripts/voz_medir.py` (frases), `scripts/voz_emendas.py` (cliques nas emendas).
Dados brutos: `docs/medicoes/*.json`.

> Eu (Claude) **não ouço** o áudio: estes números mostram se a variação aumentou, não se ficou natural ou emocionante.
> Isso só dá para julgar de ouvido — `out/voz-teste/index.html`.

## O que o motor aceita (teste real — `docs/medicoes/motor-edge.md`)

| Recurso | Resultado |
|---|---|
| `rate` (%) | ✓ funciona (frase de 5,32 s: −10 % → 5,99 s; +10 % → 4,92 s) |
| `pitch` em Hz | ✓ funciona (+15 Hz → mediana +22 Hz; −15 Hz → −22 Hz) |
| `pitch` em % | ✗ recusado ("Invalid pitch") |
| `volume` (%) | ✓ funciona (+30 % ≈ +2,4 dB) |
| SSML `<break>`, `<emphasis>`, `<prosody>`, `mstts:express-as` (estilos) | ✗ a biblioteca escapa o texto e a voz **lê as tags em voz alta** |

→ Expressividade por **emenda de palavras**: para cada combinação de rate/pitch de uma frase, a frase INTEIRA é
sintetizada; de cada versão sai só o trecho do seu segmento (ênfase, final de pergunta…), cortado no meio do
silêncio entre palavras, com fade de 10 ms e crossfade de 15 ms. A 1ª tentativa (cada segmento sintetizado
sozinho) alongava ~0,35 s por corte — a voz "recomeçava" a cada pedaço — e passava de 180 s; a emenda custa ~0.

## Antes × depois — narração inteira (34 frases)

"Antes" = voz da revisão anterior (Thalita plana). "Depois" = expressividade 0,75 (padrão provisório).

| Medida | Antes | Depois |
|---|---|---|
| Variação de tom **entre frases** (dp do pitch mediano) | 1,10 st | **1,39 st** (+26 %) |
| Variação de tom dentro da frase (dp) | 3,68 st | 3,65 st |
| Faixa de tom dentro da frase (p95 − p5) | 11,7 st | 11,7 st |
| Variação de energia dentro da frase (dp do RMS) | 7,32 dB | 7,40 dB |
| Variação de energia entre frases | 1,29 dB | 1,07 dB |
| Velocidade média | 2,89 palavras/s | 2,87 palavras/s |
| Variação de velocidade entre frases (dp) | 0,62 | 0,63 |

## Antes × depois — nas palavras marcadas (onde a direção atua)

Comparação de cada palavra marcada com o resto da própria frase. "Antes" = mesma frase no nível 0.

| Palavras | Versão | Tom vs. resto | Volume vs. resto | Duração por letra vs. resto |
|---|---|---|---|---|
| Ênfase (61 palavras) | antes | +2,08 st | +0,1 dB | ×1,18 |
| Ênfase (61 palavras) | **depois** | **+3,26 st** | **+1,0 dB** | **×1,25** |
| Fim de pergunta sem ênfase (1: "você?" na S6) | antes | −0,45 st | −0,1 dB | ×1,68 |
| Fim de pergunta sem ênfase | depois | −0,95 st | −0,2 dB | ×1,57 |

Leitura honesta: a mudança é **localizada** — as ênfases ficaram claramente mais altas, mais fortes e mais lentas,
e o tom entre frases varia mais (as cenas "sombrias" mais graves, as "brilhantes" mais agudas). As médias da frase
inteira quase não mudam porque as marcas cobrem poucas palavras. A variação de energia entre frases caiu um pouco:
cada frase é normalizada (−16 LUFS ± o volume do mapa de energia, que é pequeno: até ±2 dB × 0,75). O único fim de
pergunta sem ênfase ("você?") não subiu na medição — com 1 palavra o número não é confiável; vale ouvir.
As perguntas da abertura (Instagram?, e-mail?, criptomoedas?) contam como ênfase (+ final ascendente).

## Os 4 níveis (trecho de teste: s01_01–03, s03_02, s05_04, s06_03, s09_03)

Versão final (emenda de palavras). Com só 7 frases as médias oscilam — os níveis **não** sobem de forma regular
nestas medidas (a diferença está nas palavras marcadas, ver a tabela acima); servem para ver a ordem de grandeza.

| Nível | Tom entre frases | Tom dentro (dp) | Energia dentro (dp) | Palavras/s |
|---|---|---|---|---|
| plano (0) | 1,29 st | 4,09 st | 7,40 dB | 2,96 |
| leve (0,5) | 1,20 st | 4,25 st | 8,00 dB | 2,89 |
| média (0,75) | 1,26 st | 4,01 st | 7,31 dB | 2,84 |
| forte (1) | 1,58 st | 4,06 st | 6,97 dB | 2,82 |

(Na 1ª versão, com segmentos sintetizados à parte, o tom entre frases ia de 1,30 a 2,01 st, mas a fala ficava
~18 % mais lenta e a narração passava de 180 s — foi descartada.)

Duração da narração inteira (emenda de palavras): plano 162,2 s · média 163,3 s · forte 164,2 s.

## Emendas (cliques)

36 emendas na narração final. Energia acima de 6 kHz nos ±6 ms de cada emenda vs. 40 ms em volta: mediana −3,3 dB
(as emendas caem no silêncio entre palavras), máximo +7,8 dB (s02_03, entre "de" e "golpe", palavras coladas).
Critério de clique: ≥ +15 dB em ≤ 3 ms — nenhuma emenda chega perto. A versão sem emendas tem mais "falsos cliques"
(oclusivas da própria voz) que a versão com emendas.
