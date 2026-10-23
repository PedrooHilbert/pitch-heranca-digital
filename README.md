# Pitch "Herança Digital" — vídeo v2 (Remotion)

Pitch de **≤ 3 min** do projeto **Herança Digital** (Sprint 2 do UC HUB, entrega 18/11).
1920×1080, 30 fps, H.264. v2 = mesma estrutura e conteúdo da v1, refeita para **prender a atenção**:
tipografia cinética, telas do protótipo se montando em 3D, contadores, órbitas, carimbos, transições na batida,
**voz**, **trilha** e **efeitos sonoros**. A lógica de ritmo foi medida nas referências: `docs/RECEITA_DE_MOVIMENTO.md`.

## Rodar e renderizar

```bash
cd video
npm install
npm run dev            # Remotion Studio (pré-visualização)
npm run render         # confere placeholders e gera os arquivos finais (≈ 20–30 min)
npm run render:draft   # rascunho rápido (só com voz), sem travar nos placeholders
npm run stills         # 2 quadros por cena em out/stills-v2/
npm run audit          # auditoria: movimento, áudio, legendas, duração → out/auditoria.json
```

Saídas: `out/pitch-v2.mp4` (com voz) · `out/pitch-v2-musica-e-sfx.mp4` (sem voz, para gravar por cima e testar tempos) · `out/audio-mix.wav`.

## Voz (o vídeo inteiro se ajusta a ela)

O texto da narração está em **`src/data/narracao.ts`** (uma frase por `id`). A timeline é **guiada pelo áudio**:
cada cena dura o que as frases dela duram (+ respiros na grade da batida), e as animações estão presas às
**palavras** (ex.: o cofre congela quando a voz diz "congelado"). Se o total passar de 180 s, o pipeline encurta
respiros e, com voz sintética, acelera a fala até +8 %.

**A) Voz do grupo (recomendado).** Siga **`docs/ROTEIRO_GRAVACAO.md`** (guia + tabela com dica de entonação).
Salve cada frase como `video/gravacoes/<id>.m4a|wav|mp3` (ex.: `s01_01.m4a`) e rode:
```bash
npm run voz:importar   # corta silêncio, remove cliques, normaliza −16 LUFS, alinha palavra a palavra (whisper) e refaz tudo
npm run render
```
Frases sem gravação continuam com a voz sintética. O alinhamento usa **whisper.cpp** (já instalado em `whisper.cpp/`;
se apagar, `npm run whisper:instalar`).

**B) Voz sintética** (está no vídeo agora): `npm run voz:sintetica` — edge-tts, `pt-BR-AntonioNeural`, +8 %.
Trocar de voz: `TTS_VOZ=pt-BR-FranciscaNeural npm run voz:sintetica` (ou `pt-BR-ThalitaMultilingualNeural`).
Não havia `ELEVENLABS_API_KEY` nem `OPENAI_API_KEY` nesta máquina, então usei a opção 3 do PROMPT (edge-tts).
Pronúncias especiais (MVP, UC HUB…) em `src/data/pronuncia.ts`.

Depois de mudar texto/voz: `npm run sync` (refaz timings, timeline, legendas, efeitos e trilha) e `npm run roteiro`.

## Trilha e efeitos

- **Trilha**: `scripts/make_music.py` gera `public/audio/trilha.wav` a partir da timeline (Am–F–C–G, 112,5 BPM,
  arco de energia por cena, −26 LUFS). Para usar uma trilha do grupo (livre de direitos), substitua o arquivo,
  ajuste `BPM` em `src/data/music.ts` e **não** rode o `make_music.py`.
- **Efeitos**: `npm run sfx` gera 15 sons sintetizados em `public/audio/sfx/`. Os disparos saem dos mesmos tempos das
  animações (`sfxSx()` em cada cena → `src/data/sfx-cues.ts`). Pacote próprio? Coloque wavs com os mesmos nomes.
- **Mixagem** (`src/components/v2/Mix.tsx`): voz −16 LUFS; trilha −26 LUFS e −6 dB extra sob a voz (rampa de 9 q);
  SFX −11 a −22 dB, antecipando a imagem em 2–3 q, com variação de ±3 % de pitch e ±1 dB. Final: loudnorm −14 LUFS.

## O que preencher (aparece em AMARELO)

`src/data/config.ts`: `NOME_DO_GRUPO`, `MEMBROS` (nome + função de todos), `CONTATO`, e o logo real em
`public/brand/` + `LOGO_SIMBOLO`. Depois de mudar o nome do grupo, rode `npm run voz:sintetica` (a voz sintética
pula o nome enquanto ele for placeholder) e `npm run render`. `npm run check` lista o que falta.

## Estrutura

```
src/data/        narracao.ts · pronuncia.ts · music.ts · timeline.json (gerado) · voice-timings.json (gerado)
                 timeline.ts · legendas.ts · sfx.ts · sfx-cues.ts · config.ts · theme.ts
src/components/fx/   biblioteca de movimento (KineticText, Counter, Roleta, ScrambleText, CameraRig, Tilt3D, Shake,
                     Wipe, Flash, LightSweep, Glitch, DrawPath, Stamp, Particles, Burst, Orbit, UIBlock, ScreenAssembly, Cursor)
src/components/v2/   Fundo · Legendas · Transicoes · Mix · kit
src/cenas/           S1Abertura … S9Fechamento (cada uma exporta a cena e seus efeitos sonoros)
public/screens/regions.json   blocos reais de cada tela (recortados e animados pelo UIBlock)
scripts/  sync.mjs · voz_sintetica.py · make_sfx.py · make_music.py · render-final.mjs · audit.py · render-stills.mjs
          medir_referencias.py · transcrever-ref.mjs · gen-roteiro.mjs · check-placeholders.mjs
```

## Decisões (ambiguidades do PROMPT_V2)

- **BPM 112,5** (16 q/batida) em vez de 120: é o medido na ref2 (112,3) e dá número inteiro de quadros.
- Cortes de cena na **meia batida** (8 q) para não desperdiçar até 15 q por cena.
- Voz sintética em **frases separadas** com o silêncio final cortado (o edge-tts deixa ~0,8 s em cada uma).
- Enquanto `NOME_DO_GRUPO` for placeholder, a voz sintética **não fala** o nome (a legenda mostra o placeholder).
- Ícones da abertura são **genéricos** (câmera, envelope, ₿, nuvem…), sem logos reais. Concorrência continua
  **conceitual**, parcerias sempre **"previstas"**, nomes nas telas são fictícios (PROMPT.md §2).
- Ritmo de fala ~170 palavras/min (a ref2 tem ~280; seria ilegível para conteúdo técnico).
