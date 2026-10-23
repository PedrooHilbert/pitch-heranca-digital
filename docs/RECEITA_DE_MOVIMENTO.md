# Receita de movimento — v2 (medida nas referências)

Fonte: `referencias/ref1_azul.mp4`, `ref2_vermelho.mp4`, `ref3_laranja.mp4` (gravações verticais 576×1024, 30 fps, de anúncios de TikTok filmados na tela de um notebook).
Medições: `scripts/medir_referencias.py` → `referencias/medicoes/medidas.json`; mosaicos a 4 fps em `referencias/medicoes/*_4fps_*s.png` (1 folha = 10 s, 40 quadros, ordem de leitura).

**Como medi.** Diferença média entre quadros consecutivos (30 fps, reduzidos a 64×96), **só dentro da área da tela filmada** (para não contar mão/teclado/tremida do celular). "Mudança visual" = pico com proeminência ≥ 4× o piso de ruído, distância mínima 0,3 s. "Quase parado" = sequência abaixo de 2× o piso. Cortes duros = filtro `scene` do ffmpeg (> 0,30). Áudio: `librosa` (BPM, batidas, transientes) e linha de base por acaso (tempos visuais deslocados aleatoriamente, 400×). Janela de conteúdo exclui o início (mão abrindo o vídeo na ref1) e o encerramento do TikTok.

## 1. Números

| Métrica | ref1 azul | ref2 vermelho | ref3 laranja |
|---|---|---|---|
| Janela de conteúdo | 4,75–34,0 s | 0–45,8 s | 0–54,2 s |
| Mudanças visuais / min | **26,7** | **35,4** | **44,3** |
| Intervalo entre mudanças (média / mediana) | 2,21 / 1,57 s | **1,56 / 1,20 s** | 1,34 / 1,07 s |
| Duração de uma "rajada" de animação (mediana) | 5 q | **8 q** | 8 q |
| Maior trecho quase parado | 3,1 s | 4,7 s (logo final) | 3,9 s |
| Cortes duros (> 0,30) | 0 no conteúdo | 1,4 · 10,4 · 15,3 · 32,4 · 39,1 s | 31,0 · 46,4 s |

Medidas pontuais (ref2, a 30 fps):
- **Entrada de elemento:** 8 quadros típicos (faixa 5–14).
- **Itens de uma série** (ícone que estoura + rótulo; marca-texto empilhando): um a cada **14–26 quadros** (0,5–0,9 s).
- **Palavras de um "slam"**: ~1 palavra a cada 6–8 quadros (mosaicos a 4 fps mostram 1–2 palavras novas por quadro de 0,25 s).
- **Roleta de anos (contador):** ~27 quadros do giro até assentar.
- **Revelação do logo final:** segurada ~5 s (40,8 → 45,8 s) com varredura leve.
- **Interruptor de padrão** (inversão creme ↔ preto ou corte duro): média de **~9,4 s** entre eles.

Áudio:
- **ref2** (única com áudio forte, RMS médio −18,9 dBFS): **BPM ≈ 112,3** → **16,02 quadros/batida**.
- **Alinhamento imagem × som (ref2):** mudanças visuais a ≤ 100 ms de uma batida = **37 %** (acaso: 39 %); de um transiente = 81 % (acaso: 86 %); de um transiente forte = 11 % (acaso: 22 %). **Conclusão: o ritmo da ref2 vem da animação contínua, não de cortes "na batida".** O som acompanha a imagem só em alguns impactos.
- ref1 e ref3: praticamente mudas (−40,6 e −34,8 dBFS, ruído de ambiente). O BPM 161 detectado na ref3 é **não confiável** (sinal fraco).
- **Narração/transcrição:** ver §4 (whisper).

Limitações honestas: as refs são filmagens de uma tela, então a "perspectiva 3D" vista vem em parte do **ângulo da câmera**; a métrica de picos não pega mudanças em área pequena (ex.: ícones entrando numa órbita, manchas desfocadas se mexendo), por isso a "maior lacuna entre eventos" (7,5–7,6 s) **não** é um trecho parado — é animação pequena. **Eu não consigo ouvir** os áudios: só medi níveis, ritmo e transientes.

## 2. Vocabulário visual observado (lógica, não a arte)
Gancho com pergunta/afirmação nos 2 primeiros segundos · palavras entrando uma a uma, com 1 palavra em **cor de destaque** ou **marca-texto** · **curva desenhando** com rótulos que estouram · **ícones estourando dentro de um círculo** + rótulo em caixa · **órbitas** que ganham ícones um a um · **roleta de números** desfocada que assenta · **inversão claro ↔ escuro** como reinício de atenção · manchas de cor desfocadas (bokeh) se movendo atrás · cartões de vidro · **logo final** segurado com brilho.

## 3. Regras que aplico na v2
Quando a medição diverge das metas do PROMPT_V2 §2, **prevalece o medido** se continuar legível:

1. **Grade rítmica = 112,5 BPM = 16 quadros/batida** (`src/data/music.ts`; o medido na ref2, número inteiro). Meia batida = 8 q. A trilha sintetizada usa esse BPM.
2. **Entradas 8 q** (6–12), saídas 6 q, `spring` damping 12–16 / stiffness 150–200 / mass 0,6–0,8 com overshoot 4–8 %; blur de movimento 0→8→0 px em arrancadas.
3. **Elemento principal muda a cada ~1,2–1,6 s** (36–48 q; mediana medida 1,2 s); teto de 2,5 s.
4. **Itens de série** entram a cada **1 batida (16 q)**; ícone + rótulo: rótulo 8 q depois do ícone.
5. **Palavras-chave de "slam"**: stagger **5–6 q** (≤ 6 palavras por slam); as palavras faladas seguem a **voz** (cada palavra-chave entra 2–3 q antes de ser dita).
6. **Contadores**: rolam por ~**27 q** e assentam com overshoot; nunca aparecem prontos.
7. **Interruptor de padrão a cada ~9 s**: inversão claro ↔ escuro (ou âmbar de alerta), zoom brusco ou flash de 2 q.
8. **Nunca parado**: nenhuma janela ≥ 45 q quase parada (mais rígido que as refs, que só seguram parado no logo final); sempre há respiração de câmera, partículas, brilho ou órbita.
9. **Logo = clímax**: varredura de luz + partículas + tremida de 6–8 q; no fechamento, logo vivo ~3 s.
10. **Som segue a imagem**: SFX 2–3 q **antes** do evento visual (o ref2 mostra que a sincronia relevante é evento↔impacto, não corte↔batida); só as **transições de cena** caem na batida da nossa trilha.
11. **Legibilidade manda**: tempo mínimo na tela = `max(20 q, nº palavras × 10 q + 12)`; margens de 80 px.

## 4. Narração da ref2 (whisper)
Transcrevi o áudio da ref2 com whisper.cpp (modelo `small`, pt) — `scripts/transcrever-ref.mjs`, texto completo em `referencias/medicoes/ref2_vermelho_transcricao.txt`. **Há narração contínua** (209 palavras em ~45 s ≈ **280 palavras/min** — locução de anúncio, bem acelerada) sobre trilha, terminando em música de encerramento. Isso explica os números acima: a imagem acompanha a **fala** (cada frase vira um "slam" de texto), não a batida.

Consequência para a v2: as animações de cada cena são **ancoradas nas palavras da narração** (`timeline.json` guarda o quadro de cada palavra; as cenas usam `relogio().em(frase, palavra)`), com o visual entrando 2–3 quadros antes da palavra. Mantive o ritmo de fala em **~170 palavras/min** (a meta do PROMPT_V2 §4.1) — 280 seria ilegível para um pitch de 3 min com conteúdo técnico.

Eu **não consigo ouvir**: a transcrição é automática (pode ter erros) e não julgo timbre nem qualidade da locução.
