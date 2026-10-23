# Progresso da v3 (PROMPT_V3_EDITOR_REVISAO.md) — concluída

## Fase 0 — autorrevisão
357 stills a cada 0,5 s revisados; 20 problemas, 16 corrigidos e conferidos em stills, 4 deixados como decisão do
grupo. Lista completa em `revisoes/auto-revisao.md`.

## Fase 1 — dados
`src/data/project.json` é a fonte única (cenas, durações, textos, fundos, telas/recortes, falas, legendas, efeitos,
níveis de áudio, equipe, tema), validado por `src/data/schema.ts`. Schema registrado na `<Composition>`; o Studio
salva via `src/studio/Composicao.gerada.tsx` + ponte (`scripts/gerar-studio.mjs --observar`). `npm run sync`
preserva edições manuais.

## Fase 2 — Estúdio de Revisão (`npm run editor`)
`editor/`: `App.tsx` (player, controles, atalhos, pins, render), `Timeline.tsx`, `Inspector.tsx`, `Revisoes.tsx`,
`store.ts` (desfazer/refazer, autosave, validação), `api.ts` (projeto, revisões com still, render, abrir out/).

### Verificado (23/10)
- Editor abre sem erros no console; screenshots conferidos (player, timeline com ondas, inspetor, revisões).
- Texto da S3 alterado → preview mudou na hora → `project.json` e `.gerada.tsx` atualizados → still renderizado pela
  CLI mostra o texto novo → Ctrl+Z desfez a digitação inteira → arquivo idêntico ao commit.
- **C** → diálogo → clique no vídeo → Ctrl+Enter: `revisoes/revisoes.json` + `revisoes/pins/1.png` criados, pin aparece no
  vídeo e na faixa Comentários; "feito" pelo painel grava `status: "feito"`; `npm run revisoes` lista certo. Pin de
  teste apagado depois.
- Borda da S3 arrastada: 544 → 592 q (múltiplo de 16), cenas seguintes deslocadas, parou em 5400 q com o aviso
  "Limite de 180 s". Desfeito.
- API recusa (422) projeto com mais de 180 s, tela inexistente e texto vazio/só espaços (este último corrigido no
  teste: o schema aceitava espaços).
- Remotion Studio abre com o painel Default Props (Schema/JSON).
- Botão "Rascunho 540p" renderiza com barra de progresso.

## Fase 3 — documentação
README reescrito: ciclo de trabalho, modelo "Como reportar um erro", atalhos, limites do editor, Studio, decisões.
