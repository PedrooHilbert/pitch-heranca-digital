import React from "react";
import { Composition } from "remotion";
import { ComposicaoPitch } from "./studio/Composicao.gerada";
import { PitchVertical, V_LARGURA, V_ALTURA } from "./Vertical";
import projetoVertical from "./data/project-vertical.json";
import type { Projeto } from "./data/schema";

// A composição é gerada de src/data/project.json (scripts/gerar-studio.mjs) com o defaultProps escrito
// direto no arquivo, para o botão "Salvar" do painel de props do Remotion Studio funcionar.
// `npm run dev` mantém os dois sincronizados; render, sync e o editor regeneram antes de usar.
// "PitchVertical" (1080×1920, TikTok/Reels) tem o PRÓPRIO projeto: src/data/project-vertical.json (editor:vertical).
export const RemotionRoot: React.FC = () => (
  <>
    <ComposicaoPitch />
    <Composition
      id="PitchVertical"
      component={PitchVertical}
      fps={30}
      width={V_LARGURA}
      height={V_ALTURA}
      durationInFrames={(projetoVertical as unknown as Projeto).cenas.reduce((a, c) => a + c.dur, 0)}
      calculateMetadata={({ props }) => ({ durationInFrames: (props as Projeto).cenas.reduce((a, c) => a + c.dur, 0) })}
      defaultProps={projetoVertical as unknown as Projeto}
    />
  </>
);
