// S8 — Modelo de negócio (≈ 15 s, escuro). PROMPT_V2 §5: logo no centro; 5 pílulas disparam com
// rastro de luz e encaixam quando citadas; carimbos "previsto"; faixa final digitando.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CalendarClock, HandCoins, Briefcase, Landmark, Building2 } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { textos, fundo } from "../data/projeto";
import { Fundo } from "../components/v2/Fundo";
import { LogoRevela, Eyebrow } from "../components/v2/kit";
import { CameraRig, Stamp, TypeText, Burst } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S8 = {
  textos: {
    chamada: "COMO O PROJETO SE SUSTENTA",
    pilula1: "Assinatura anual do titular", pilula1Sub: "plano grátis + plano completo",
    pilula2: "Taxa na liberação", pilula2Sub: "paga pelo espólio / herdeiros",
    pilula3: "Plano para escritórios", pilula3Sub: "advogados de sucessões",
    pilula4: "Parceria com cartórios", pilula4Sub: "repasse por cofre ativo",
    pilula5: "Bancos, seguradoras, planos funerários", pilula5Sub: "canais de venda",
    previsto: "PREVISTO",
    valores: "Valores a definir após pesquisa com usuários.",
  },
  fundos: { negocio: "escuro" },
  telas: {},
} as const;
const CX = 960;
const CY = 480;

const PILULAS = [
  { Ic: CalendarClock, t: "Assinatura anual do titular", s: "plano grátis + plano completo", x: 960, y: 190, w: "assinatura", f: "s08_01", previsto: false },
  { Ic: HandCoins, t: "Taxa na liberação", s: "paga pelo espólio / herdeiros", x: 1500, y: 380, w: "taxa", f: "s08_01", previsto: false },
  { Ic: Briefcase, t: "Plano para escritórios", s: "advogados de sucessões", x: 1340, y: 720, w: "Escritórios", f: "s08_02", previsto: false },
  { Ic: Landmark, t: "Parceria com cartórios", s: "repasse por cofre ativo", x: 580, y: 720, w: "cartórios", f: "s08_02", previsto: true },
  { Ic: Building2, t: "Bancos, seguradoras, planos funerários", s: "canais de venda", x: 420, y: 380, w: "bancos", f: "s08_02", previsto: true },
];

const T = () => {
  const r = relogio("s8");
  return {
    r,
    pilulas: PILULAS.map((p) => r.em(p.f, p.w, 6)),
    previstos: r.em("s08_02", "previstos"),
    valores: r.em("s08_03", "valores"),
  };
};

export const sfxS8 = (): Cue[] => {
  const t = T();
  return [
    { f: 4, som: "impact_low", ganho: 0.18 },
    ...t.pilulas.flatMap((f) => [{ f, som: "whoosh_short" as const }, { f: f + 10, som: "pop" as const }]),
    { f: t.previstos, som: "thunk" },
    { f: t.previstos + 5, som: "thunk" },
    ...Array.from({ length: 8 }, (_, k) => ({ f: t.valores + k * 3, som: "type" as const })),
  ];
};

export const S8Modelo: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s8");
  return (
    <AbsoluteFill>
      <CameraRig
        dur={dur} zoom={[1, 1.1]} panX={[-40, 40]}
        tremidas={[...t.pilulas.map((at) => ({ at: at + 10, amp: 7, dur: 6 })), { at: t.previstos, amp: 10 }, { at: t.previstos + 5, amp: 8 }]}
        socos={[...t.pilulas.map((at) => ({ at: at + 10, para: 1.04, dur: 10 })), { at: t.valores, para: 1.07, dur: 14 }]}
      >
        <Fundo tema={fundo("s8", "negocio", "escuro")} seed="s8" />
        <AbsoluteFill style={{ paddingLeft: 150, paddingTop: 112 }}>
          <Eyebrow texto={tx("chamada")} at={2} cor={colors.mint} />
        </AbsoluteFill>
        <Burst at={4} x={CX} y={CY} n={34} raio={420} />
        <div style={{ position: "absolute", left: CX - 150, top: CY - 150, width: 300, height: 300, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(127,209,197,.45)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${50 + 20 * Math.sin(frame / 10)}px rgba(127,209,197,.35)` }}>
          <LogoRevela at={4} tamanho={120} wordmark={false} />
        </div>

        {PILULAS.map((p, i) => {
          const at = t.pilulas[i];
          if (frame < at) return null;
          const voo = interpolate(frame, [at, at + 10], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
          const encaixe = spring({ frame: frame - at - 10, fps, config: { damping: 10, stiffness: 260, mass: 0.6 } });
          // depois do "previstos" a constelação inteira gira devagar em volta do logo (nunca para)
          const giro = interpolate(frame, [t.previstos, dur], [0, 0.3], clampOpt);
          const px = CX + (p.x - CX) * Math.cos(giro) - (p.y - CY) * 1.6 * Math.sin(giro);
          const py = CY + (p.x - CX) / 1.6 * Math.sin(giro) + (p.y - CY) * Math.cos(giro);
          const x = CX + (px - CX) * voo;
          const y = CY + (py - CY) * voo;
          const flut = Math.sin((frame + i * 30) / 26) * 6;
          return (
            <React.Fragment key={i}>
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <line x1={CX} y1={CY} x2={x} y2={y} stroke={colors.mint} strokeWidth={voo < 1 ? 6 : 2} opacity={voo < 1 ? 0.9 : 0.3} strokeDasharray={voo < 1 ? undefined : "6 10"} style={{ filter: voo < 1 ? `drop-shadow(0 0 10px ${colors.mint})` : undefined }} />
              </svg>
              <div style={{ position: "absolute", left: x, top: y + flut, transform: `translate(-50%,-50%) scale(${voo < 1 ? 0.4 + 0.5 * voo : 0.9 + 0.1 * encaixe})`, width: 400, padding: "18px 22px", borderRadius: 22, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(127,209,197,.45)", boxShadow: "0 18px 44px rgba(0,0,0,.35)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 62, height: 62, borderRadius: 16, background: "rgba(127,209,197,.18)", color: colors.mint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <p.Ic size={34} strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontFamily, fontWeight: 800, fontSize: 25, color: "#fff", lineHeight: 1.15 }}>{tx(`pilula${i + 1}`)}</div>
                  <div style={{ fontFamily, fontWeight: 600, fontSize: 18, color: colors.mintSoft }}>{tx(`pilula${i + 1}Sub`)}</div>
                </div>
                {p.previsto ? (
                  <div style={{ position: "absolute", right: -26, top: -24 }}>
                    <Stamp texto={tx("previsto")} at={t.previstos + (i === 4 ? 5 : 0)} cor="#F5C86B" tamanho={22} rot={8} />
                  </div>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}

        <AbsoluteFill style={{ alignItems: "center", paddingTop: 845 }}>
          {frame >= t.valores ? (
            <div style={{ padding: "10px 26px", borderRadius: 999, background: "rgba(245,200,107,0.14)", border: "1.5px solid #F5C86B" }}>
              <TypeText texto={tx("valores")} inicio={t.valores} cps={1.6} style={{ fontFamily, fontWeight: 700, fontSize: 26, color: "#FCE7B8" }} />
            </div>
          ) : null}
        </AbsoluteFill>
      </CameraRig>
    </AbsoluteFill>
  );
};
