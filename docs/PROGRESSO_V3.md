# Progresso da v3 (PROMPT_V3_EDITOR_REVISAO.md)

O projeto **compila e renderiza** (`npm run render`, `npm run check`, `npm run stills`, `npm run sync` funcionando). Commit: "v3 fase 0+1".

## Feito
- **Fase 0 (autorrevisão)**: 357 stills a cada 0,5 s revisados; 20 problemas, 16 corrigidos e conferidos em stills. Lista completa em `revisoes/auto-revisao.md`.
- **Fase 1 (dados)**: `src/data/project.json` é a fonte única (cenas, durações, textos, fundos, telas/recortes, falas, legendas, efeitos, níveis de áudio, equipe, tema), validado pelo schema Zod (`src/data/schema.ts`). A composição lê o projeto via props; o schema está registrado na `<Composition>`. `npm run sync` regenera o projeto a partir da voz e preserva as edições manuais. Destaque no texto: `*palavra*`.
- **Editor (início)**: API local em `editor/api.ts` (projeto, revisões com still, render, abrir out/), `editor/vite.config.ts`, `npm run revisoes`. Dependências instaladas: zod 4.5.4, @remotion/zod-types, @remotion/player, vite 7, tsx.

## Falta
1. **Salvar pelo Studio**: o Studio só grava quando `defaultProps` está escrito direto no arquivo da composição. Plano: `scripts/gerar-studio.mjs` gera `src/studio/Composicao.gerada.tsx` a partir do `project.json`, e o `npm run dev` passa a observar esse arquivo e copiar as mudanças de volta (validando com Zod).
2. **Interface do Estúdio de Revisão** (`editor/index.html`, `main.tsx`, `App.tsx`, `Timeline.tsx`, `Inspector.tsx`, `Revisoes.tsx`), na ordem de prioridade: pins com still e painel → inspetor de textos → timeline de cenas → trilhas de áudio. Também falta servir `../public` pelo middleware (com suporte a range), em vez de usar o `publicDir`.
3. Script `npm run editor`, histórico e desfazer, validação ao vivo e contador de placeholders.
4. Verificar no navegador (screenshots), atualizar o README (ciclo de trabalho + "Como reportar um erro"), render final e auditoria.
