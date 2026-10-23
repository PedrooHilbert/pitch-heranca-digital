// Formas, transições e acentos (PROMPT_V2 §3): Wipe, Flash, LightSweep, Glitch, DrawPath, Stamp.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../data/theme";
import { fontFamily } from "../../fonts";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Transição em forma (cobre o corte em `at` e revela a próxima cena).
 * diagonal = cunha que atravessa; circulo = íris que fecha/abre; barras = 5 barras em cascata.
 */
export const Wipe: React.FC<{ at: number; dur?: number; tipo?: "diagonal" | "circulo" | "barras"; cor?: string; cor2?: string }> = ({
  at, dur = 16, tipo = "diagonal", cor = colors.teal700, cor2 = colors.mint,
}) => {
  const frame = useCurrentFrame();
  const h = dur / 2;
  if (frame < at - h || frame > at + h) return null;
  const ease = Easing.inOut(Easing.cubic);
  if (tipo === "circulo") {
    const r = frame < at
      ? interpolate(frame, [at - h, at], [0, 1300], { ...clampOpt, easing: ease })
      : interpolate(frame, [at, at + h], [1300, 0], { ...clampOpt, easing: ease });
    const fechando = frame < at;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          {fechando ? (
            <circle cx={960} cy={540} r={r} fill={cor} />
          ) : (
            <path fillRule="evenodd" fill={cor} d={`M0 0H1920V1080H0Z M${960 - (1300 - r)} 540a${1300 - r} ${1300 - r} 0 1 0 ${2 * (1300 - r)} 0a${1300 - r} ${1300 - r} 0 1 0 ${-2 * (1300 - r)} 0`} />
          )}
          <circle cx={960} cy={540} r={fechando ? r : 1300 - r} fill="none" stroke={cor2} strokeWidth={10} opacity={0.9} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (tipo === "barras") {
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const d = i * 1.2;
          const x = frame < at
            ? interpolate(frame, [at - h + d, at], [-1, 0], { ...clampOpt, easing: ease })
            : interpolate(frame, [at, at + h - d], [0, 1], { ...clampOpt, easing: ease });
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: i * 216, width: 1920, height: 218, background: i % 2 ? cor : colors.teal900, transform: `translateX(${x * 1920}px)` }} />
          );
        })}
      </AbsoluteFill>
    );
  }
  const x = interpolate(frame, [at - h, at, at + h], [-2600, -300, 2100], { ...clampOpt, easing: ease });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -400, left: x, width: 2600, height: 1900, background: cor, transform: "skewX(-18deg)" }} />
      <div style={{ position: "absolute", top: -400, left: x + 2600, width: 46, height: 1900, background: cor2, transform: "skewX(-18deg)" }} />
    </AbsoluteFill>
  );
};

/** Flash curto (1–3 quadros) em branco/menta. */
export const Flash: React.FC<{ at: number; dur?: number; cor?: string; max?: number }> = ({ at, dur = 3, cor = "#FFFFFF", max = 0.9 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 1, at, at + dur], [0, max, 0], clampOpt);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: cor, opacity: o, pointerEvents: "none" }} />;
};

/** Varredura de brilho diagonal (use dentro de um container com overflow hidden). */
export const LightSweep: React.FC<{ at: number; dur?: number; largura?: number; intensidade?: number }> = ({
  at, dur = 22, largura = 320, intensidade = 0.75,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + dur) return null;
  const p = interpolate(frame, [at, at + dur], [-0.35, 1.35], { ...clampOpt, easing: Easing.inOut(Easing.quad) });
  // máscara radial: o brilho some nas bordas do container (sem "retângulo" visível sobre fundo escuro)
  const mascara = "radial-gradient(ellipse 50% 50% at 50% 50%, #000 45%, transparent 100%)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", mixBlendMode: "screen", WebkitMaskImage: mascara, maskImage: mascara }}>
      <div
        style={{
          position: "absolute", top: "-50%", height: "200%", width: largura, left: `${p * 100}%`,
          transform: "rotate(18deg)", filter: "blur(10px)",
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${intensidade}) 50%, rgba(255,255,255,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Glitch de 2–4 quadros: fatias deslocadas + aberração cromática. Uso raro. */
export const Glitch: React.FC<{ at: number; dur?: number; children: React.ReactNode }> = ({ at, dur = 3, children }) => {
  const frame = useCurrentFrame();
  const ativo = frame >= at && frame < at + dur;
  if (!ativo) return <AbsoluteFill>{children}</AbsoluteFill>;
  const fatias = [0, 0.22, 0.47, 0.71, 1];
  return (
    <AbsoluteFill style={{ filter: "drop-shadow(6px 0 0 rgba(255,40,90,.75)) drop-shadow(-6px 0 0 rgba(40,240,255,.75))" }}>
      {fatias.slice(0, -1).map((y0, i) => {
        const y1 = fatias[i + 1];
        const dx = (random(`gl-${at}-${frame}-${i}`) * 2 - 1) * 70;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${y0 * 100}% 0 ${(1 - y1) * 100}% 0)`, transform: `translateX(${dx}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Linha/curva que se desenha (stroke animado). Use dentro de um <svg>. */
export const DrawPath: React.FC<{
  d: string; inicio: number; dur?: number; cor?: string; largura?: number; tracejado?: boolean; glow?: boolean;
}> = ({ d, inicio, dur = 20, cor = colors.mint, largura = 4, tracejado = false, glow = false }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inicio, inicio + dur], [0, 1], { ...clampOpt, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      {tracejado ? <path d={d} fill="none" stroke={cor} strokeWidth={largura} strokeDasharray="10 12" opacity={0.25} /> : null}
      <path
        d={d} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" pathLength={1}
        strokeDasharray="1" strokeDashoffset={1 - p}
        style={glow ? { filter: `drop-shadow(0 0 8px ${cor})` } : undefined}
      />
    </>
  );
};

/** Carimbo que bate (escala 2.2 → 1 com overshoot + rotação). */
export const Stamp: React.FC<{
  texto: string; at: number; cor?: string; rot?: number; tamanho?: number; style?: React.CSSProperties;
}> = ({ texto, at, cor = colors.amber, rot = -8, tamanho = 44, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
  const esc = 2.3 - 1.3 * s;
  return (
    <div
      style={{
        display: "inline-block", transform: `rotate(${rot}deg) scale(${esc})`, opacity: Math.min(1, s * 1.6),
        border: `${tamanho * 0.11}px solid ${cor}`, borderRadius: tamanho * 0.22, padding: `${tamanho * 0.12}px ${tamanho * 0.36}px`,
        color: cor, fontFamily, fontWeight: 900, fontSize: tamanho, letterSpacing: "0.08em",
        boxShadow: `inset 0 0 0 ${tamanho * 0.05}px ${cor}`, background: "rgba(255,255,255,0.04)", whiteSpace: "nowrap",
        ...style,
      }}
    >
      {texto}
    </div>
  );
};
