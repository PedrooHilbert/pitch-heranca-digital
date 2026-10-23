import React from "react";
import { Composition } from "remotion";
import { PitchHerancaDigital } from "./PitchHerancaDigital";
import { FPS, HEIGHT, WIDTH } from "./data/timeline";
import { projetoBase } from "./data/projeto";
import { projetoSchema, LIMITE_QUADROS, type Projeto } from "./data/schema";

// O projeto (src/data/project.json) é o defaultProps: no Remotion Studio os campos aparecem na barra
// lateral (textos, cores, números) com preview ao vivo e botão de salvar, validados pelo schema Zod.
// A duração = soma das cenas (máx. 5400 quadros = 180 s).
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PitchHerancaDigital"
      component={PitchHerancaDigital}
      schema={projetoSchema}
      defaultProps={projetoBase}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={projetoBase.cenas.reduce((a, c) => a + c.dur, 0)}
      calculateMetadata={({ props }) => {
        const total = (props as Projeto).cenas.reduce((a, c) => a + c.dur, 0);
        if (total > LIMITE_QUADROS) throw new Error(`Duração total ${total} q passa de ${LIMITE_QUADROS} (180 s).`);
        return { durationInFrames: total };
      }}
    />
  );
};
