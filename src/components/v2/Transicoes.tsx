// Transições entre cenas (cobrem o corte): formas na cor da marca, alternando o tipo.
import React from "react";
import { AbsoluteFill } from "remotion";
import { TL } from "../../data/timeline";
import { colors } from "../../data/theme";
import { Wipe } from "../fx";
import type { Cue } from "../../data/sfx";

// Tipo de transição na ENTRADA de cada cena (s1 não tem).
export const TIPO_TRANSICAO: Record<string, "diagonal" | "circulo" | "barras" | "whip"> = {
  s2: "whip", s3: "circulo", s4: "barras", s5: "diagonal", s6: "circulo", s7: "barras", s8: "diagonal", s9: "circulo",
};

export const Transicoes: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
    {TL.cenas.slice(1).map((c, i) => {
      const tipo = TIPO_TRANSICAO[c.id];
      if (tipo === "whip") return null; // o whip-pan é feito pelas próprias cenas (S1 sai, S2 entra)
      return <Wipe key={c.id} at={c.from} dur={16} tipo={tipo} cor={i % 2 ? colors.teal900 : colors.teal700} cor2={colors.mint} />;
    })}
  </AbsoluteFill>
);

/** Sons das transições (frame = corte). */
export const sfxTransicoes = (): Cue[] =>
  TL.cenas.slice(1).map((c): Cue =>
    TIPO_TRANSICAO[c.id] === "whip" ? { f: c.from, som: "whoosh_long" } : { f: c.from - 2, som: "whoosh_short" },
  );
