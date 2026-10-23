import React from "react";
import { ComposicaoPitch } from "./studio/Composicao.gerada";

// A composição é gerada de src/data/project.json (scripts/gerar-studio.mjs) com o defaultProps escrito
// direto no arquivo, para o botão "Salvar" do painel de props do Remotion Studio funcionar.
// `npm run dev` mantém os dois sincronizados; render, sync e o editor regeneram antes de usar.
export const RemotionRoot: React.FC = () => <ComposicaoPitch />;
