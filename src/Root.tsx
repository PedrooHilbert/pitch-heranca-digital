import React from "react";
import { Composition } from "remotion";
import { PitchHerancaDigital, PitchProps } from "./PitchHerancaDigital";
import { FPS, HEIGHT, WIDTH, TL } from "./data/timeline";

// A duração vem da timeline guiada pelo áudio (src/data/timeline.json, gerada por `npm run sync`).
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PitchHerancaDigital"
      component={PitchHerancaDigital}
      durationInFrames={TL.total}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ semVoz: false } as PitchProps}
      calculateMetadata={() => ({ durationInFrames: TL.total })}
    />
  );
};
