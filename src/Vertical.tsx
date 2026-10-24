// Versão EM PÉ (TikTok / Reels / Shorts, 1080×1920) do mesmo pitch: o vídeo horizontal inteiro no meio da tela
// (ampliado até a largura, cortando só a margem de segurança das laterais), cabeçalho com a marca e a cena atual,
// barra de progresso e legenda grande de 3–4 palavras com a palavra falada acesa — acima da faixa que a interface
// do app cobre embaixo. Mesmo project.json, mesmos tempos e o MESMO áudio do horizontal (scripts/render-vertical.mjs).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PitchHerancaDigital, type PitchProps } from "./PitchHerancaDigital";
import { setProjeto, derivado } from "./data/projeto";
import type { Projeto } from "./data/schema";
import { legendaEm, temPlaceholder } from "./data/legendas";
import { colors } from "./data/theme";
import { fontFamily } from "./fonts";
import { Fundo } from "./components/v2/Fundo";
import { LogoSymbol } from "./components/Logo";
import { marcaPartes } from "./data/config";

export const V_LARGURA = 1080;
export const V_ALTURA = 1920;
const ZOOM = 1.08; // corta ~71 px de cada lateral do horizontal — menos que a margem de segurança de 80 px
const ESC = (V_LARGURA / 1920) * ZOOM;
const JANELA_H = Math.round(1080 * ESC); // 656
const JANELA_Y = 520;
const LEGENDA_Y = JANELA_Y + JANELA_H + 90; // ~1176: fora da faixa inferior que o app cobre (~1500+)

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Legenda estilo TikTok: o bloco da legenda é quebrado em pedaços de até 4 palavras / 22 letras; mostra o pedaço
 *  que tem a palavra sendo dita, com ela acesa. */
const LegendaGrande: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = legendaEm(frame);
  if (!b) return null;
  const pedacos: (typeof b.palavras)[] = [];
  let atual: typeof b.palavras = [];
  for (const p of b.palavras) {
    const letras = atual.reduce((n, x) => n + x.w.length + 1, 0) + p.w.length;
    if (atual.length && (atual.length >= 4 || letras > 22)) {
      pedacos.push(atual);
      atual = [];
    }
    atual.push(p);
    if (/[.,!?…:;]$/.test(p.w) && atual.length >= 2) {
      pedacos.push(atual);
      atual = [];
    }
  }
  if (atual.length) pedacos.push(atual);
  // pedaço atual: o último que já começou (antes da 1ª palavra, o primeiro)
  let k = 0;
  pedacos.forEach((pd, i) => {
    if (frame >= pd[0].from - 2) k = i;
  });
  const pd = pedacos[k];
  const entra = spring({ frame: frame - Math.max(b.from, pd[0].from - 2), fps, config: { damping: 14, stiffness: 260, mass: 0.5 } });
  const sai = interpolate(frame, [b.to - 4, b.to], [1, 0], clampOpt);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: LEGENDA_Y, display: "flex", justifyContent: "center", opacity: sai }}>
      <div
        style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 18, rowGap: 6, maxWidth: 960,
          transform: `scale(${0.9 + 0.1 * entra})`, fontFamily, fontWeight: 800, fontSize: 76, lineHeight: 1.12, letterSpacing: "-0.01em",
        }}
      >
        {pd.map((p, i) => {
          const dita = frame >= p.from - 1;
          // só UMA palavra acesa: a última que já começou (os tempos das vizinhas se sobrepõem)
          const prox = pd[i + 1];
          const agora = dita && frame < p.to + 4 && !(prox && frame >= prox.from - 1);
          const ph = temPlaceholder(p.w);
          return (
            <span
              key={i}
              style={{
                position: "relative", padding: "0 10px", borderRadius: 14,
                color: ph ? colors.amber : agora ? colors.teal900 : dita ? "#fff" : "rgba(255,255,255,0.55)",
                background: agora && !ph ? colors.mint : "transparent",
                textShadow: agora ? "none" : "0 4px 18px rgba(0,0,0,0.6)",
                transform: agora ? "scale(1.06)" : "none",
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

export const PitchVertical: React.FC<PitchProps> = (props) => {
  const frame = useCurrentFrame();
  const projeto: Projeto = props;
  setProjeto(projeto);
  const d = derivado(projeto);
  const i = Math.max(0, d.cenas.findIndex((c) => frame >= c.from && frame < c.from + c.dur));
  const c = d.cenas[i] ?? d.cenas[0];
  const troca = interpolate(frame - c.from, [0, 8], [0, 1], clampOpt);
  const [ini, fim] = marcaPartes();
  return (
    <AbsoluteFill style={{ background: "#061413" }}>
      <Fundo tema="escuro" seed="vertical" />

      {/* barra de progresso */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 150, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.14)" }}>
        <div style={{ width: `${(frame / d.total) * 100}%`, height: "100%", borderRadius: 99, background: colors.mint, boxShadow: `0 0 14px ${colors.mint}` }} />
      </div>

      {/* marca + cena atual */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <LogoSymbol size={78} />
          <div style={{ fontFamily, fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "-0.01em" }}>
            {ini}
            <span style={{ color: colors.mint }}>{fim}</span>
          </div>
        </div>
        <div
          style={{
            fontFamily, fontWeight: 700, fontSize: 30, letterSpacing: "0.16em", color: colors.mintSoft,
            padding: "10px 26px", borderRadius: 999, border: "1.5px solid rgba(127,209,197,0.45)", background: "rgba(255,255,255,0.06)",
            opacity: troca, transform: `translateY(${(1 - troca) * 12}px)`,
          }}
        >
          {String(i + 1).padStart(2, "0")} · {c.nome.toUpperCase()}
        </div>
      </div>

      {/* o vídeo horizontal (sem a legenda dele — a legenda daqui é maior) */}
      <div style={{ position: "absolute", left: 0, top: JANELA_Y, width: V_LARGURA, height: JANELA_H, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "absolute", left: (V_LARGURA - 1920 * ESC) / 2, top: 0, width: 1920, height: 1080, transform: `scale(${ESC})`, transformOrigin: "0 0" }}>
          <PitchHerancaDigital {...props} semLegendas />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: JANELA_Y - 2, height: 2, background: "rgba(127,209,197,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: JANELA_Y + JANELA_H, height: 2, background: "rgba(127,209,197,0.5)" }} />

      <LegendaGrande />
    </AbsoluteFill>
  );
};
