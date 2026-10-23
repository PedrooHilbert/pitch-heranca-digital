// Fundos vivos por tema (claro / escuro / âmbar / preto) — sempre há algo se mexendo.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../data/theme";
import { Particles } from "../fx";

export type Tema = "claro" | "escuro" | "ambar" | "preto";

export const Fundo: React.FC<{ tema: Tema; seed?: string; children?: React.ReactNode; curvas?: boolean }> = ({
  tema, seed = "f", children, curvas = true,
}) => {
  const frame = useCurrentFrame();
  const gx = 50 + 22 * Math.sin(frame / 83);
  const gy = 38 + 16 * Math.cos(frame / 64);
  const gx2 = 50 - 26 * Math.cos(frame / 97);
  const a = Math.sin(frame / 90) * 30;
  const b = Math.cos(frame / 120) * 26;
  const cfg = {
    escuro: {
      bg: `linear-gradient(160deg, ${colors.teal800} 0%, ${colors.teal900} 45%, ${colors.teal700} 100%)`,
      glow: "rgba(127,209,197,0.30)", glow2: "rgba(47,167,154,0.22)", part: colors.mint, op: 0.5, curva: colors.mint, co: 0.2,
    },
    claro: {
      bg: `linear-gradient(180deg, #F6F9F7 0%, ${colors.bg2} 100%)`,
      glow: "rgba(47,167,154,0.20)", glow2: "rgba(127,209,197,0.22)", part: colors.teal400, op: 0.22, curva: colors.teal400, co: 0.1,
    },
    ambar: {
      bg: "linear-gradient(160deg, #3A1A05 0%, #7A3A08 55%, #B45309 100%)",
      glow: "rgba(245,200,107,0.40)", glow2: "rgba(255,140,40,0.30)", part: "#F5C86B", op: 0.55, curva: "#F5C86B", co: 0.22,
    },
    preto: {
      bg: "linear-gradient(160deg, #020606 0%, #061413 100%)",
      glow: "rgba(127,209,197,0.16)", glow2: "rgba(47,167,154,0.10)", part: colors.mint, op: 0.35, curva: colors.mint, co: 0.1,
    },
  }[tema];
  return (
    <AbsoluteFill style={{ background: cfg.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(52% 50% at ${gx}% ${gy}%, ${cfg.glow}, rgba(0,0,0,0) 66%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(40% 38% at ${gx2}% ${78 - gy / 3}%, ${cfg.glow2}, rgba(0,0,0,0) 70%)` }} />
      <Particles cor={cfg.part} opacidade={cfg.op} seed={`${seed}-${tema}`} />
      {curvas ? (
        <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <g stroke={cfg.curva} fill="none" strokeWidth={2.2}>
            <path d={`M-120 ${770 + a} C 420 ${690 + b}, 980 ${910 - a}, 2040 ${750 + a}`} opacity={cfg.co} />
            <path d={`M-120 ${860 - b} C 540 ${820 - a}, 1180 ${980 + b}, 2040 ${840 - b}`} opacity={cfg.co * 0.7} />
          </g>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};
