// Peças reutilizadas pelas cenas da v2.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Lock } from "lucide-react";
import { colors } from "../../data/theme";
import { fontFamily } from "../../fonts";
import { LogoSymbol } from "../Logo";
import { marcaPartes } from "../../data/config";
import { LightSweep } from "../fx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ícone genérico num "tile" de vidro que estoura (pop) e pode ser trancado (cadeado âmbar). */
export const Tile: React.FC<{
  icone: React.ReactNode; entra: number; tranca?: number; destaca?: number; tamanho?: number; escuro?: boolean;
}> = ({ icone, entra, tranca, destaca, tamanho = 132, escuro = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - entra, fps, config: { damping: 9, stiffness: 230, mass: 0.6 } });
  const t = tranca != null ? spring({ frame: frame - tranca, fps, config: { damping: 10, stiffness: 260, mass: 0.6 } }) : 0;
  const trancado = tranca != null && frame >= tranca;
  const d = destaca != null ? interpolate(frame, [destaca, destaca + 4, destaca + 16], [0, 1, 0], clampOpt) : 0;
  const flut = Math.sin((frame + entra * 3) / 22) * 5;
  if (frame < entra) return <div style={{ width: tamanho, height: tamanho }} />;
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho, transform: `translateY(${flut}px) scale(${s * (1 + d * 0.16)})` }}>
      <div
        style={{
          width: "100%", height: "100%", borderRadius: tamanho * 0.24, display: "flex", alignItems: "center", justifyContent: "center",
          background: escuro ? "rgba(255,255,255,0.07)" : colors.white,
          border: `2px solid ${trancado ? colors.amberBorder : escuro ? "rgba(127,209,197,0.35)" : colors.cardBorder}`,
          boxShadow: `0 16px 40px rgba(0,0,0,${escuro ? 0.35 : 0.12})${d > 0 ? `, 0 0 ${30 * d}px ${colors.mint}` : ""}`,
          color: trancado ? "rgba(245,200,107,0.55)" : escuro ? colors.mint : colors.teal700,
        }}
      >
        {icone}
      </div>
      {tranca != null && frame >= tranca ? (
        <div
          style={{
            position: "absolute", right: -tamanho * 0.12, bottom: -tamanho * 0.12, width: tamanho * 0.46, height: tamanho * 0.46,
            borderRadius: 999, background: colors.amberBg, border: `3px solid ${colors.amberBorder}`, color: colors.amber,
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `translateY(${(1 - t) * -40}px) scale(${0.4 + t * 0.6})`, boxShadow: "0 8px 20px rgba(0,0,0,.3)",
          }}
        >
          <Lock size={tamanho * 0.24} strokeWidth={2.6} />
        </div>
      ) : null}
    </div>
  );
};

/** Logo com revelação (escala + varredura de luz) e "respiração". */
export const LogoRevela: React.FC<{ at: number; tamanho?: number; variante?: "dark" | "light"; wordmark?: boolean; arquivo?: string }> = ({
  at, tamanho = 150, variante = "dark", wordmark = true, arquivo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 140, mass: 0.8 } });
  const resp = 1 + 0.025 * Math.sin(((frame - at) / fps) * Math.PI * 0.9);
  const wm = spring({ frame: frame - at - 8, fps, config: { damping: 14, stiffness: 160 } });
  const dark = variante === "dark";
  const [ini, fim] = marcaPartes();
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: tamanho * 0.22, transform: `scale(${(0.55 + 0.45 * s) * resp})`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ filter: `drop-shadow(0 0 ${24 * s}px ${colors.mint})` }}>
        <LogoSymbol size={tamanho} variant={variante} arquivo={arquivo} />
      </div>
      {wordmark ? (
        <div style={{ fontFamily, fontWeight: 800, fontSize: tamanho * 0.5, color: dark ? "#fff" : colors.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap", clipPath: `inset(0 ${(1 - wm) * 100}% 0 0)` }}>
          {ini}
          <span style={{ color: dark ? colors.mint : colors.teal700 }}>{fim}</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: -20, overflow: "hidden" }}>
        <LightSweep at={at + 6} dur={24} largura={160} intensidade={0.55} />
      </div>
    </div>
  );
};

/** Pílula/etiqueta simples. */
export const Chip: React.FC<{ children: React.ReactNode; at: number; escuro?: boolean; style?: React.CSSProperties }> = ({ children, at, escuro = true, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 999,
        background: escuro ? "rgba(255,255,255,0.08)" : colors.white, border: `1.5px solid ${escuro ? "rgba(127,209,197,0.4)" : colors.cardBorder}`,
        color: escuro ? colors.mintSoft : colors.ink2, fontFamily, fontWeight: 600, fontSize: 26,
        transform: `scale(${s})`, boxShadow: "0 10px 26px rgba(0,0,0,.18)", ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Título de seção pequeno (eyebrow) que entra deslizando. */
export const Eyebrow: React.FC<{ texto: string; at: number; cor?: string }> = ({ texto, at, cor = colors.teal400 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 8], [0, 1], clampOpt);
  return (
    <div style={{ fontFamily, fontWeight: 700, fontSize: 22, letterSpacing: "0.18em", color: cor, opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>
      {texto}
    </div>
  );
};
