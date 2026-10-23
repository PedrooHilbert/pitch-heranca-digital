// Partículas e órbitas (PROMPT_V2 §3): Particles (ambiente), Burst (explosão), Orbit.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../data/theme";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Partículas ambientes flutuando (poucas, determinísticas). */
export const Particles: React.FC<{ n?: number; cor?: string; seed?: string; opacidade?: number; velocidade?: number }> = ({
  n = 26, cor = colors.mint, seed = "amb", opacidade = 0.45, velocidade = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1920;
        const v = (0.3 + random(`${seed}v${i}`) * 0.9) * velocidade;
        const y = 1120 - ((frame * v + random(`${seed}y${i}`) * 1250) % 1250);
        const x = x0 + Math.sin((frame + i * 37) / 46) * 16;
        const r = 1.5 + random(`${seed}r${i}`) * 3.5;
        const o = (0.25 + random(`${seed}o${i}`) * 0.75) * opacidade * (0.6 + 0.4 * Math.sin((frame + i * 13) / 20));
        return <circle key={i} cx={x} cy={y} r={r} fill={cor} opacity={Math.max(0, o)} />;
      })}
    </svg>
  );
};

/** Explosão de partículas a partir de um ponto (revelação do logo, impactos). */
export const Burst: React.FC<{ at: number; x?: number; y?: number; n?: number; raio?: number; dur?: number; cores?: string[]; seed?: string }> = ({
  at, x = 960, y = 540, n = 46, raio = 520, dur = 40, cores = [colors.mint, "#FFFFFF", colors.teal400], seed = "bu",
}) => {
  const frame = useCurrentFrame();
  const k = frame - at;
  if (k < 0 || k > dur) return null;
  const p = interpolate(k, [0, dur], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = random(`${seed}a${i}`) * Math.PI * 2;
        const dist = raio * (0.35 + random(`${seed}d${i}`) * 0.65) * p;
        const r = (2 + random(`${seed}r${i}`) * 5) * (1 - p * 0.7);
        return (
          <circle
            key={i} cx={x + Math.cos(ang) * dist} cy={y + Math.sin(ang) * dist} r={r}
            fill={cores[i % cores.length]} opacity={(1 - p) * 0.95}
          />
        );
      })}
    </svg>
  );
};

/** Ícones em órbita ao redor de um centro; cada um entra (pop) no seu frame. */
export const Orbit: React.FC<{
  itens: React.ReactNode[];
  cx: number; cy: number;
  raio: number;
  /** achatamento vertical (1 = círculo) */
  achata?: number;
  /** quadros por volta completa */
  periodo?: number;
  entradas: number[];
  /** frame em que a órbita "embaralha" (acelera e se desorganiza) */
  caos?: number;
  tamanho?: number;
  mostrarAnel?: boolean;
  corAnel?: string;
}> = ({ itens, cx, cy, raio, achata = 0.42, periodo = 360, entradas, caos, tamanho = 96, mostrarAnel = true, corAnel = colors.teal400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const extra = caos != null ? interpolate(frame, [caos, caos + 30], [0, 1], { ...clampOpt, easing: Easing.in(Easing.quad) }) : 0;
  const base = (frame / periodo) * Math.PI * 2 * (1 + extra * 2.2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {mostrarAnel ? (
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={cx} cy={cy} rx={raio} ry={raio * achata} fill="none" stroke={corAnel} strokeWidth={2} strokeDasharray="6 10" opacity={0.45} />
        </svg>
      ) : null}
      {itens.map((it, i) => {
        const ang = base + (i / itens.length) * Math.PI * 2 + extra * Math.sin(frame / 7 + i) * 0.8;
        const x = cx + Math.cos(ang) * raio * (1 + extra * 0.15 * Math.sin(frame / 5 + i));
        const y = cy + Math.sin(ang) * raio * achata;
        const s = spring({ frame: frame - entradas[i], fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
        const profundidade = 0.78 + 0.22 * ((Math.sin(ang) + 1) / 2); // da frente fica maior
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x - tamanho / 2, top: y - tamanho / 2, width: tamanho, height: tamanho,
              transform: `scale(${s * profundidade})`, opacity: frame < entradas[i] ? 0 : 1,
              zIndex: Math.round(profundidade * 100),
            }}
          >
            {it}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
