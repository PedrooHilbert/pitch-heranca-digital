| Teste | Aceito? | Duração (s) | Pitch mediano (Hz) | RMS (dB) | Palavras que a voz disse |
|---|---|---|---|---|---|
| base | ✓ | 1.02 | 176 | -21.1 | Com o seu e-mail |
| rate −10% | ✗ recusado: No audio was received. Please verify that your parameters ar | | | | |
| rate +10% | ✓ | 1.00 | 183 | -21.1 | Com o seu e-mail |
| pitch +15Hz | ✓ | 1.00 | 198 | -21.4 | Com o seu e-mail |
| pitch −15Hz | ✓ | 1.09 | 154 | -20.9 | Com o seu e-mail |
| pitch +10% (formato %) | ✗ recusado: Invalid pitch '+10%'. | | | | |
| volume +30% | ✓ | 1.04 | 183 | -18.7 | Com o seu e-mail |
| volume −30% | ✓ | 1.04 | 172 | -24.1 | Com o seu e-mail |
| SSML <break 600ms> | ✗ recusado: No audio was received. Please verify that your parameters ar | | | | |
| SSML <emphasis> | ✓ | 3.83 | 164 | -21.8 | Com o seu emphasis level = strong e-mail emphasis |
| SSML <prosody pitch=+20Hz> | ✓ | 4.18 | 188 | -21.8 | Com o seu prosody pitch = + 20Hz e-mail prosody |
| SSML mstts:express-as cheerful | ✓ | 6.87 | 191 | -22.3 | mstts express-as style = cheerful Com o seu e-mail mstts express-as |

Retestes com frase longa (s03_01, 5,32 s na base): rate −8 % → 5,90 s · −10 % → 5,99 s · −15 % → 6,27 s · +10 % → 4,92 s
(o "recusado" de rate −10 % acima foi falha de rede: na nova tentativa funcionou). `<break>` com retentativa: 3,27 s
para "Com o seu e-mail?" (1,02 s na base) — a voz LÊ a tag.

**Conclusão:** o edge-tts aceita, por requisição, `rate` (%), `pitch` (só em Hz) e `volume` (%). Pitch em % é recusado.
Todo SSML (`<break>`, `<emphasis>`, `<prosody>`, `mstts:express-as`) é escapado pela biblioteca e LIDO em voz alta.
→ A expressividade é feita por SEGMENTOS: cada frase vira 1–4 pedidos com rate/pitch/volume próprios, emendados com
fades/crossfade e silêncios reais.
