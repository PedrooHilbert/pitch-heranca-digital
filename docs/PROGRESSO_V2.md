# Progresso da v2 (PROMPT_V2_DINAMICO.md)

✅ Refatoração concluída — o projeto compila e renderiza (`npm run render`). A lista abaixo é histórica.

## Feito
- **Fase 1:** `scripts/medir_referencias.py` → `referencias/medicoes/medidas.json` + mosaicos 4 fps; `docs/RECEITA_DE_MOVIMENTO.md` com os números (BPM ref2 ≈ 112,3 → grade 16 q/batida; mudança visual a cada ~1,2–1,6 s; entradas de 8 q; interruptor de padrão a cada ~9 s). Falta só a seção 4 (transcrição com whisper).
- **Fase 2:** `src/data/narracao.ts` (31 frases), `pronuncia.ts`, `music.ts` (112,5 BPM); pipeline `scripts/sync.mjs` (`npm run voz:sintetica` / `voz:importar` / `sync`) com voz por frase (edge-tts Antonio +8 %, tempo por palavra, −16 LUFS, silêncio final cortado) → `voice-timings.json` + `timeline.json` (**178,4 s**, 170 palavras/min). `docs/ROTEIRO_GRAVACAO.md` (`npm run roteiro`).
- **Biblioteca de movimento** `src/components/fx/` (KineticText, ScrambleText, Counter, Roleta, TypeText, CameraRig, Tilt3D, Shake, Wipe, Flash, LightSweep, Glitch, DrawPath, Stamp, Particles, Burst, Orbit, UIBlock, ScreenAssembly, Cursor).
- **Infra v2** `src/components/v2/`: Fundo, Legendas (karaokê), Transicoes, Mix (voz + trilha com ducking + SFX), kit; `src/data/timeline.ts` (lê timeline.json), `legendas.ts`, `sfx.ts`, `sfx-cues.ts`.
- **Cena S1** (`src/cenas/S1Abertura.tsx`).

## Falta
1. Cenas S2–S9 em `src/cenas/` (cada uma exporta `SxNome` e `sfxSx()`), seguindo o plano de batidas do PROMPT_V2 §5.
2. Nova composição (cenas + `<Transicoes/>` + `<Legendas/>` + `<Mix/>`) e `Root.tsx` com duração vinda do `timeline.json`; trocar `config.AUDIO` para `{ voz, trilha, sfx }`.
3. Apagar os arquivos da v1 que importam o `timeline.ts` antigo (`src/scenes/*`, `data/script.ts`, `data/narration.ts`, `components/{Caption,KineticCaption,NarrationDraft,SfxTrack,AudioTrack,SceneWrap}.tsx`).
4. `scripts/make_sfx.py` (15 sons → `public/audio/sfx/*.wav`) e `scripts/make_music.py` (Am–F–C–G, 112,5 BPM, arco de energia por cena, −26 LUFS → `public/audio/trilha.wav`).
5. `scripts/render-final.mjs` (render + loudnorm 2 passadas −14 LUFS/−1,5 dBTP → `out/pitch-v2.mp4`, `out/pitch-v2-musica-e-sfx.mp4`, `out/audio-mix.wav`).
6. `scripts/audit.py` (movimento, áudio, legibilidade, duração) + stills em `out/stills-v2/` + relatório final.
7. Whisper (`npm run whisper:instalar`) — conferir se terminou; transcrever a ref2 para a receita.
8. (Opcional) teaser vertical 9:16.
