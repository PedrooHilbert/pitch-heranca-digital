# Autorrevisão da v2 → v3 (PROMPT_V3 §Fase 0)

**Método.** Stills de **todo o vídeo a cada 0,5 s** (357 quadros, `out/revisao/stills/`), montados em 23 folhas de contato com tempo/quadro/cena e a margem de 80 px desenhada (`out/revisao/folhas/`), **todas olhadas**. Sincronia conferida no código (cada visual-chave entra 3 q antes da palavra; SFX antecipam 2–3 q). Fatos conferidos recortando as telas reais do protótipo. Auditoria da v2 rodada antes (`out/auditoria.json`). Stills de cada correção: `out/revisao/correcoes/`.

**Resumo: achei 20 problemas, corrigi 16, 4 dependem de decisão/dados do grupo.**

| # | Tempo (quadro) | Cena | Problema | Grav. | Correção | Status |
|---|---|---|---|---|---|---|
| 1 | 00:42.0 (1260) | S3 | Barra da senha cifrada ficava **atrás** do card "Confirme que é você" (z-index) e transparente sobre branco — o visual do "cofre criptografado" não aparecia | Alta | Barra abaixo do card, fundo sólido, acima na pilha | feito |
| 2 | 00:07.5 (225) · 02:20.5 (4215) · 02:50.5 (5115) | S1·S8·S9 | Varredura de luz do logo virava um **retângulo branco** duro sobre o fundo escuro | Média | `LightSweep` com máscara radial + desfoque | feito |
| 3 | 00:11.5 (345) | S1→S2 | Whip-pan deixava **¼ da tela preta** (fundo da composição aparecendo) | Média | Whip por deslize + escala (quadro sempre coberto) | feito |
| 4 | 00:32.0–00:33.5 (960–1005) | S3 | **1,5 s de tela vazia** enquanto a voz já dizia "A Herança Digital é um…" | Média | Cofre e "Um…" entram no q8; "cofre" continua na palavra | feito |
| 5 | 00:06.5 (195) | S1 | No gancho, "digital?" ficava só ~0,3 s na tela antes do logo | Média | Palavras mais juntas + logo espera "Somos" (~0,7 s de leitura) | feito |
| 6 | 01:13.0 (2190) | S5 | Rótulo "X (Twitter): sem destino" **cortado na borda direita** | Média | Reposicionado (x 1700→1560) | feito |
| 7 | 01:10.0 (2100) · 01:14.0 (2220) | S5 | Widgets (contadores, tipos de ativo) a 40–60 px da borda (margem 80) | Média | x ≥ 88 px | feito |
| 8 | 01:05.5 (1965) | S5 | Barra "PROTÓTIPO · etapa x de 7" a 46 px do topo | Baixa | top 82 px | feito |
| 9 | 02:00.0–02:03.5 (3600–3705) | S6 | Card "Ana Souza" removida ficava ~3 s **saindo da tela** (cortado) | Média | Desliza menos e vira "fantasma" dentro do quadro | feito |
| 10 | 02:15.0 (4050) · 02:24.0 (4320) | S7·S8 | Título da S7 e rótulo da S8 entravam na margem com o zoom da câmera | Média | Movidos para dentro (compensa o zoom) | feito |
| 11 | 02:37.0 (4710) | S9 | Chip "Projeto de faculdade…" **sobre** o "[FUNÇÃO]" do 3º integrante | Média | Chip e parceiros descem | feito |
| 12 | 02:28.0 (4440) | S8 | Pílula dizia "funerárias"; o roteiro (PROMPT §7) diz **"planos funerários"** | Média | Texto corrigido para o do roteiro | feito |
| 13 | 01:22.0 (2460) | S5 | Cartões de herdeiros "em leque" se sobrepunham, ilegíveis | Baixa | Abrem lado a lado com leve rotação | feito |
| 14 | 00:50.5 (1515) | S4 | 1,5 s só com o título "Em vida" | Baixa | Linhas do inventário entram já em "vida" | feito |
| 15 | 02:43.5–02:45.0 (4905–4950) | S9 | 1,8 s de "Próximos passos" com a tela vazia | Baixa | Os 3 passos aparecem como esboço e se preenchem quando citados | feito |
| 16 | todo o vídeo | — | Legenda a 34 px da borda inferior | Baixa | 46 px | feito |
| 17 | 00:08–02:58 | S1·S9 | **Placeholders visíveis**: [NOME DO GRUPO], 3× [FUNÇÃO], [DEMAIS INTEGRANTES], [E-MAIL / @ DO GRUPO] | Alta | Preencher no editor (Projeto → Equipe) | **depende do grupo** |
| 18 | S1·S8·S9 | — | Logo real ausente (símbolo provisório desenhado) | Média | Colocar `public/brand/logo-simbolo.png` e apontar em Projeto → Equipe | **depende do grupo** |
| 19 | vários | — | 9 de 39 legendas ficam abaixo do tempo mínimo de leitura porque a **voz fala rápido** nesses trechos (~7,5 q/palavra) | Média | ver opções abaixo | **decisão** |
| 20 | todo o vídeo | — | Voz ainda é **sintética** (Antonio, edge-tts) | Média | ver opções abaixo | **decisão** |

**Conferido e OK (sem mudança):** fatos das telas recortados do protótipo (donut 5/3/2/2 = 12; Lucas *filho*, Ana *filha* com 2 ativos, Carlos *irmão*); parcerias sempre "previstas"; concorrência com rodapé "conceitual"; português/acentuação; áudio −14,02 LUFS / −1,35 dBTP, trilha −6 dB sob a voz; flashes brancos curtos nas transições são intencionais (2–4 q).

## Decisões para o grupo
- **#19 Legendas rápidas** — (a) **aceitar** (são frases ditas rápido; o karaokê acompanha a voz); (b) **enxugar 3–4 falas longas** em `src/data/narracao.ts` (ex.: s05_05, s06_03); (c) **gravar a voz do grupo** um pouco mais pausada (`npm run voz:importar` recalcula tudo). Desacelerar a voz sintética passaria de 180 s.
- **#20 Voz** — manter a sintética ou gravar seguindo `docs/ROTEIRO_GRAVACAO.md`.
