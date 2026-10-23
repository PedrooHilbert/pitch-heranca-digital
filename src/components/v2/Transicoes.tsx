// Transições entre cenas (cobrem o corte): formas na cor da marca, alternando o tipo.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cenas } from "../../data/timeline";
import { colors } from "../../data/theme";
import { Wipe } from "../fx";
import type { Cue } from "../../data/sfx";

// Tipo de transição na ENTRADA de cada cena (s1 não tem). "whip" é feito pelas próprias cenas.
export const TIPO_TRANSICAO: Record<string, "diagonal" | "circulo" | "barras" | "whip"> = {
  s2: "whip", s3: "circulo", s4: "barras", s5: "diagonal", s6: "circulo", s7: "barras", s8: "diagonal", s9: "circulo",
};

/** Ponte de luz no whip escuro → claro (S1 → S2): o fim da cena clareia até o fundo da próxima, que depois abre.
 *  Sem ela o corte ia do verde-escuro borrado ao claro em 1 quadro (revisão "corte estranho"). */
const PonteDeLuz: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 6, at, at + 8], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(70% 70% at 50% 50%, #FFFFFF, #E6F2EF)", opacity: o }} />;
};

export const Transicoes: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
    {cenas()
      .slice(1)
      .map((c, i) => {
        const tipo = TIPO_TRANSICAO[c.id];
        if (tipo === "whip") return <PonteDeLuz key={c.id} at={c.from} />;
        return <Wipe key={c.id} at={c.from} dur={16} tipo={tipo} cor={i % 2 ? colors.teal900 : colors.teal700} cor2={colors.mint} />;
      })}
  </AbsoluteFill>
);

/** Sons das transições (quadro = corte). */
export const sfxTransicoes = (): Cue[] =>
  cenas()
    .slice(1)
    .map((c): Cue => (TIPO_TRANSICAO[c.id] === "whip" ? { f: c.from, som: "whoosh_long" } : { f: c.from - 2, som: "whoosh_short" }));
