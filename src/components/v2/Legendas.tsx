// Legendas queimadas estilo karaokê: o bloco aparece antes da fala e cada palavra "acende"
// no frame em que é dita; palavras-chave ganham marca-texto menta. Faixa inferior (y ≥ 900).
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { legendaEm, temPlaceholder } from "../../data/legendas";
import { colors } from "../../data/theme";
import { fontFamily } from "../../fonts";

const CHAVE = new Set([
  "quem", "fica", "heranca", "digital", "senhas", "cofre", "inventario", "liberacao", "legal", "congelado",
  "parte", "prototipo", "destino", "carencia", "selfie", "contestar", "seguranca", "coracao", "cifrado",
  "tres", "duas", "desfazer", "sucessao", "previstos", "obrigado", "golpe", "perdidos", "lugar",
]);
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

export const Legendas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = legendaEm(frame);
  if (!b) return null;
  const entra = interpolate(frame, [b.from, b.from + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sai = interpolate(frame, [b.to - 5, b.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 100 }}>
      <div
        style={{
          maxWidth: 1500, margin: "0 80px", padding: "10px 26px", borderRadius: 16,
          background: "rgba(5,26,25,0.80)", boxShadow: "0 14px 40px rgba(0,0,0,.35)",
          opacity: Math.min(entra, sai), transform: `translateY(${(1 - entra) * 14}px)`,
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 10, rowGap: 0,
          fontFamily, fontSize: 31, fontWeight: 700, lineHeight: 1.26,
        }}
      >
        {b.palavras.map((p, i) => {
          const dita = frame >= p.from;
          const s = spring({ frame: frame - p.from, fps, config: { damping: 12, stiffness: 240, mass: 0.5 } });
          const ph = temPlaceholder(p.w);
          const chave = CHAVE.has(norm(p.w));
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: ph ? "#5a3d00" : dita ? (chave ? colors.teal900 : "#FFFFFF") : "rgba(255,255,255,0.42)",
                background: ph ? colors.amberBorder : dita && chave ? colors.mint : "transparent",
                padding: ph || (dita && chave) ? "0 8px" : 0,
                borderRadius: 7,
                transform: dita ? `scale(${1 + (1 - s) * 0.06}) translateY(${(1 - s) * -3}px)` : "none",
                transformOrigin: "50% 60%",
              }}
            >
              {p.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
