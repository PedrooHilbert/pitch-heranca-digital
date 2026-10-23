import React from "react";
import { Img, staticFile } from "remotion";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { config, marcaPartes } from "../data/config";

// Símbolo = nuvem + cadeado. Usa o arquivo real (public/brand/) se config.LOGO_SIMBOLO
// estiver preenchido; caso contrário desenha um placeholder SVG simples (§4 do PROMPT).
export const LogoSymbol: React.FC<{
  size?: number;
  variant?: "dark" | "light";
}> = ({ size = 56, variant = "dark" }) => {
  if (config.LOGO_SIMBOLO) {
    return (
      <Img
        src={staticFile(config.LOGO_SIMBOLO)}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }

  const dark = variant === "dark";
  const cloud = dark ? "rgba(127,209,197,0.22)" : colors.tealTint;
  const cloudStroke = dark ? colors.mint : colors.teal600;
  const lock = dark ? colors.mint : colors.teal700;
  const hole = dark ? colors.teal900 : colors.white;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{ display: "block" }}
    >
      {/* nuvem */}
      <path
        d="M18 46 h30 a10.5 10.5 0 0 0 1.6 -20.9 a13.5 13.5 0 0 0 -25.6 -4.4 A9.5 9.5 0 0 0 18 46 Z"
        fill={cloud}
        stroke={cloudStroke}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* corpo do cadeado */}
      <rect x="24.5" y="31" width="17" height="14" rx="3.4" fill={lock} />
      {/* arco do cadeado */}
      <path
        d="M28 31 v-3.2 a5 5 0 0 1 10 0 V31"
        fill="none"
        stroke={lock}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* fechadura */}
      <circle cx="33" cy="37" r="2.2" fill={hole} />
      <rect x="32" y="38.4" width="2" height="4.4" rx="1" fill={hole} />
    </svg>
  );
};

// Logo completo: símbolo + wordmark (nome do produto vem do projeto → equipe.marca).
export const Logo: React.FC<{
  size?: number;
  variant?: "dark" | "light";
  showWordmark?: boolean;
}> = ({ size = 56, variant = "dark", showWordmark = true }) => {
  const dark = variant === "dark";
  const base = dark ? colors.white : colors.ink;
  const accent = dark ? colors.mint : colors.teal700;
  const [ini, fim] = marcaPartes();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <LogoSymbol size={size} variant={variant} />
      {showWordmark ? (
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: size * 0.5,
            letterSpacing: "-0.01em",
            color: base,
            whiteSpace: "nowrap",
          }}
        >
          {ini}
          <span style={{ color: accent }}>{fim}</span>
        </div>
      ) : null}
    </div>
  );
};
