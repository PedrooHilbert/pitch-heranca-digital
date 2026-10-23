import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TL, CenaId } from "./data/timeline";
import { Transicoes } from "./components/v2/Transicoes";
import { Legendas } from "./components/v2/Legendas";
import { Mix } from "./components/v2/Mix";
import { S1Abertura } from "./cenas/S1Abertura";
import { S2Problema } from "./cenas/S2Problema";
import { S3Proposta } from "./cenas/S3Proposta";
import { S4ComoFunciona } from "./cenas/S4ComoFunciona";
import { S5Demo } from "./cenas/S5Demo";
import { S6Seguranca } from "./cenas/S6Seguranca";
import { S7Concorrencia } from "./cenas/S7Concorrencia";
import { S8Modelo } from "./cenas/S8Modelo";
import { S9Fechamento } from "./cenas/S9Fechamento";

const CENAS: Record<CenaId, React.FC<{ dur: number }>> = {
  s1: S1Abertura, s2: S2Problema, s3: S3Proposta, s4: S4ComoFunciona, s5: S5Demo,
  s6: S6Seguranca, s7: S7Concorrencia, s8: S8Modelo, s9: S9Fechamento,
};

export type PitchProps = { semVoz?: boolean };

/** v2: cenas guiadas pela voz + transições + legendas karaokê + mixagem (voz, trilha, SFX). */
export const PitchHerancaDigital: React.FC<PitchProps> = ({ semVoz = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {TL.cenas.map((c) => {
      const Cena = CENAS[c.id];
      return (
        <Sequence key={c.id} from={c.from} durationInFrames={c.dur} premountFor={30} name={`${c.id} · ${c.nome}`}>
          <Cena dur={c.dur} />
        </Sequence>
      );
    })}
    <Transicoes />
    <Legendas />
    <Mix semVoz={semVoz} />
  </AbsoluteFill>
);
