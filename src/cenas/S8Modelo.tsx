// S8 — Modelo de negócio (≈ 13 s, escuro). Revisão "modelo novo": 3 estações num caminho horizontal e a câmera
// percorrendo — EM VIDA (grátis) → NA LIBERAÇÃO (taxa única a definir, isenção prevista) → QUEM SUSTENTA (4 parceiros
// previstos) → frase final + rodapé. Nada de valores nem de parcerias fechadas: tudo "a definir"/"previsto".
// Textos: project.json → cenas[s8] (editáveis no Estúdio de Revisão). *palavra* = destaque.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ClipboardList, LockKeyhole, Users, ListChecks, Scale, FileCheck2, ShieldCheck, Briefcase, FileSignature, Landmark, Building2, Check } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { textos, fundo } from "../data/projeto";
import { Fundo } from "../components/v2/Fundo";
import { CameraRig, Stamp, TypeText, Burst, KineticText } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S8 = {
  textos: {
    est1: "Em vida", gratis: "GRÁTIS",
    item1: "Inventário", item2: "Cofre", item3: "Herdeiros", item4: "Regras",
    est2: "Na liberação", valida: "Validação", custodia: "Custódia",
    taxa: "Taxa única", adefinir: "A DEFINIR", isencao: "Isenção prevista",
    est3: "Quem sustenta",
    p1: "Escritórios", p1Sub: "plano profissional",
    p2: "Cartórios", p2Sub: "validação e custódia",
    p3: "Governo", p3Sub: "convênio",
    p4: "Bancos e seguradoras", p4Sub: "canal",
    previsto: "PREVISTO",
    final: "Grátis para o cidadão. *Sustentável* para quem opera em escala.",
    rodape: "Valores a definir após pesquisa com usuários e parecer jurídico.",
  },
  fundos: { negocio: "escuro" },
  telas: {},
} as const;

const ITENS = [ClipboardList, LockKeyhole, Users, ListChecks];
// pílulas da estação 3: ícones genéricos (sem logos de governo ou de empresas)
const PILULAS = [
  { Ic: Briefcase, x: -430, y: -150, w: "Escritórios" },
  { Ic: FileSignature, x: 430, y: -150, w: "cartórios" },
  { Ic: Landmark, x: -430, y: 150, w: "governo" },
  { Ic: Building2, x: 430, y: 150, w: "" }, // não é dito na fala: entra logo depois de "governo"
];
const TROCA = 14; // quadros da câmera indo de uma estação para a outra

const T = () => {
  const r = relogio("s8");
  const a = "s08_01", b = "s08_02", c = "s08_03";
  const governo = r.em(c, "governo", 6);
  const fimFala = r.fim(c);
  return {
    r,
    gratis: r.em(a, "gratuito", 2),
    itens: [0, 1, 2, 3].map((k) => r.em(a, "Em", 0) + 6 + k * 5),
    e2: r.ini(b) - 8,
    taxa: r.em(b, "taxa", 3),
    adefinir: r.em(b, "definir", 2),
    isencao: r.em(b, "isenção", 3),
    e3: r.ini(c) - 8,
    pilulas: PILULAS.map((p, i) => (p.w ? r.em(c, p.w, 6) : governo + 8)),
    previstos: r.em(c, "previstos", 2),
    // revisão #18: a frase final entra logo depois dos carimbos "previsto" e o rodapé aparece rápido — a cena
    // guarda ~4 s depois da fala para dar tempo de ler
    final: Math.min(fimFala + 4, r.em(c, "previstos", 2) + 16),
    rodape: Math.min(fimFala + 22, r.em(c, "previstos", 2) + 30),
  };
};

export const sfxS8 = (): Cue[] => {
  const t = T();
  return [
    { f: 3, som: "whoosh_short" },
    { f: t.gratis, som: "impact_low", ganho: 0.22 },
    ...t.itens.map((f) => ({ f, som: "pop" as const, ganho: 0.1 })),
    { f: t.e2, som: "whoosh_long" },
    { f: t.taxa, som: "pop" },
    { f: t.adefinir, som: "thunk" },
    { f: t.isencao, som: "ping", ganho: 0.1 },
    { f: t.e3, som: "whoosh_long" },
    ...t.pilulas.map((f) => ({ f: f + 8, som: "pop" as const })),
    ...[0, 3, 6, 9].map((k) => ({ f: t.previstos + k, som: "thunk" as const, ganho: 0.12 })),
    { f: t.final, som: "whoosh_short" },
    ...Array.from({ length: 6 }, (_, k) => ({ f: t.rodape + k * 3, som: "type" as const })),
  ];
};

/** Título da estação (entra deslizando com a câmera). */
const Titulo: React.FC<{ texto: string; at: number }> = ({ texto, at }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
    <KineticText texto={texto} inicio={at} stagger={4} tamanho={96} />
  </AbsoluteFill>
);

const vidroEscuro: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(127,209,197,.45)", boxShadow: "0 18px 44px rgba(0,0,0,.35)",
};

export const S8Modelo: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s8");
  const mola = (at: number, cfg = { damping: 10, stiffness: 220, mass: 0.6 }) => spring({ frame: frame - at, fps, config: cfg });

  // câmera no caminho: estação 0 → 1 → 2 (cada uma ocupa 1920 px; troca em 14 q com aceleração e freio)
  const ease = { ...clampOpt, easing: Easing.inOut(Easing.cubic) };
  const pos = interpolate(frame, [t.e2, t.e2 + TROCA], [0, 1], ease) + interpolate(frame, [t.e3, t.e3 + TROCA], [0, 1], ease);
  const borrao = Math.max(interpolate(frame, [t.e2, t.e2 + TROCA / 2, t.e2 + TROCA], [0, 10, 0], clampOpt), interpolate(frame, [t.e3, t.e3 + TROCA / 2, t.e3 + TROCA], [0, 10, 0], clampOpt));
  const fimEsc = interpolate(frame, [t.final, t.final + 10], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill>
      <Fundo tema={fundo("s8", "negocio", "escuro")} seed="s8" />
      <CameraRig
        dur={dur} zoom={[1, 1.06]}
        tremidas={[{ at: t.gratis, amp: 14, dur: 8 }, { at: t.adefinir, amp: 8 }, ...t.pilulas.map((at) => ({ at: at + 8, amp: 5, dur: 5 }))]}
        socos={[{ at: t.gratis, para: 1.06, dur: 12 }, ...t.pilulas.map((at) => ({ at: at + 8, para: 1.03, dur: 10 }))]}
      >
        {/* o caminho: 3 estações lado a lado; a câmera desliza por ele */}
        <AbsoluteFill style={{ transform: `translateX(${-pos * 1920}px)`, filter: borrao > 0.3 ? `blur(${borrao}px)` : undefined, opacity: 1 - 0.85 * fimEsc }}>
          {/* linha do caminho ligando as estações */}
          <svg width={1920 * 3} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <line x1={260} y1={880} x2={1920 * 2 + 1660} y2={880} stroke="rgba(127,209,197,.25)" strokeWidth={3} strokeDasharray="10 14" />
            <line x1={260} y1={880} x2={260 + (1920 * 2 + 1400) * interpolate(frame, [0, t.final], [0, 1], clampOpt)} y2={880} stroke={colors.mint} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${colors.mint})` }} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={960 + k * 1920} cy={880} r={pos >= k - 0.1 ? 14 : 9} fill={pos >= k - 0.1 ? colors.mint : "rgba(127,209,197,.4)"} />
            ))}
          </svg>

          {/* 1 — EM VIDA */}
          <AbsoluteFill style={{ left: 0, width: 1920 }}>
            <Titulo texto={tx("est1")} at={2} />
            <div style={{ position: "absolute", left: 960, top: 400, transform: "translate(-50%, -50%)" }}>
              <Stamp texto={tx("gratis")} at={t.gratis} cor={colors.mint} tamanho={130} rot={-6} />
            </div>
            <Burst at={t.gratis} x={960} y={400} n={40} raio={520} />
            <div style={{ position: "absolute", left: 960, top: 660, transform: "translateX(-50%)", display: "flex", gap: 44 }}>
              {ITENS.map((Ic, k) => {
                const s = mola(t.itens[k]);
                return (
                  <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${s})`, opacity: Math.min(1, s * 1.5) }}>
                    <div style={{ ...vidroEscuro, width: 112, height: 112, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", color: colors.mint }}>
                      <Ic size={54} strokeWidth={1.7} />
                    </div>
                    <div style={{ fontFamily, fontWeight: 700, fontSize: 24, color: "#fff" }}>{tx(`item${k + 1}`)}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>

          {/* 2 — NA LIBERAÇÃO */}
          <AbsoluteFill style={{ left: 1920, width: 1920 }}>
            <Titulo texto={tx("est2")} at={t.e2 + 6} />
            {(() => {
              const s = mola(t.e2 + 8, { damping: 12, stiffness: 180, mass: 0.7 });
              return (
                <div style={{ position: "absolute", left: 960, top: 300, transform: `translateX(-50%) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.4), display: "flex", alignItems: "center", gap: 34 }}>
                  <div style={{ ...vidroEscuro, width: 180, height: 180, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", color: colors.mint }}>
                    <Scale size={96} strokeWidth={1.5} style={{ transform: `rotate(${Math.sin(frame / 14) * 4}deg)` }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[{ Ic: FileCheck2, k: "valida", at: t.e2 + 14 }, { Ic: ShieldCheck, k: "custodia", at: t.e2 + 20 }].map(({ Ic, k, at }) => {
                      const m = mola(at);
                      return (
                        <div key={k} style={{ ...vidroEscuro, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 18, transform: `translateX(${(1 - m) * 60}px)`, opacity: Math.min(1, m * 1.5) }}>
                          <Ic size={36} color={colors.mint} />
                          <span style={{ fontFamily, fontWeight: 800, fontSize: 30, color: "#fff" }}>{tx(k)}</span>
                          <Check size={28} color={colors.mint} strokeWidth={3} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {frame >= t.taxa - 1 ? (
              <div style={{ position: "absolute", left: 960, top: 600, transform: `translateX(-50%) scale(${mola(t.taxa)})`, display: "flex", alignItems: "center", gap: 26 }}>
                <div style={{ ...vidroEscuro, padding: "16px 34px", borderRadius: 999, fontFamily, fontWeight: 800, fontSize: 40, color: "#fff" }}>{tx("taxa")}</div>
                <Stamp texto={tx("adefinir")} at={t.adefinir} cor="#F5C86B" tamanho={44} rot={-8} />
              </div>
            ) : null}
            {frame >= t.isencao - 1 ? (
              <div
                style={{
                  position: "absolute", left: 960, top: 745, transform: `translateX(-50%) scale(${mola(t.isencao) * (1 + 0.045 * Math.sin((frame - t.isencao) / 4))})`,
                  padding: "10px 26px", borderRadius: 999, background: "rgba(127,209,197,0.16)", border: `2px solid ${colors.mint}`,
                  fontFamily, fontWeight: 800, fontSize: 30, color: colors.mint, boxShadow: `0 0 ${16 + 10 * Math.sin((frame - t.isencao) / 4)}px rgba(127,209,197,.45)`,
                }}
              >
                {tx("isencao")}
              </div>
            ) : null}
          </AbsoluteFill>

          {/* 3 — QUEM SUSTENTA */}
          <AbsoluteFill style={{ left: 3840, width: 1920 }}>
            <Titulo texto={tx("est3")} at={t.e3 + 6} />
            <div style={{ position: "absolute", left: 960 - 60, top: 500 - 60, width: 120, height: 120, borderRadius: 999, ...vidroEscuro, boxShadow: `0 0 ${40 + 16 * Math.sin(frame / 9)}px rgba(127,209,197,.35)` }} />
            {PILULAS.map((p, i) => {
              const at = t.pilulas[i];
              if (frame < at) return null;
              const voo = interpolate(frame, [at, at + 8], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
              const enc = mola(at + 8, { damping: 10, stiffness: 260, mass: 0.6 });
              const x = 960 + p.x * voo;
              const y = 500 + p.y * voo + Math.sin((frame + i * 30) / 26) * 5;
              return (
                <React.Fragment key={i}>
                  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    <line x1={960} y1={500} x2={x} y2={y} stroke={colors.mint} strokeWidth={voo < 1 ? 6 : 2} opacity={voo < 1 ? 0.9 : 0.3} strokeDasharray={voo < 1 ? undefined : "6 10"} style={{ filter: voo < 1 ? `drop-shadow(0 0 10px ${colors.mint})` : undefined }} />
                  </svg>
                  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${voo < 1 ? 0.4 + 0.5 * voo : 0.9 + 0.1 * enc})`, width: 430, padding: "18px 22px", borderRadius: 22, ...vidroEscuro, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 16, background: "rgba(127,209,197,.18)", color: colors.mint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <p.Ic size={34} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontFamily, fontWeight: 800, fontSize: 27, color: "#fff", lineHeight: 1.15 }}>{tx(`p${i + 1}`)}</div>
                      <div style={{ fontFamily, fontWeight: 600, fontSize: 19, color: colors.mintSoft }}>{tx(`p${i + 1}Sub`)}</div>
                    </div>
                    <div style={{ position: "absolute", right: -24, top: -24 }}>
                      <Stamp texto={tx("previsto")} at={Math.max(t.previstos + i * 3, at + 10)} cor="#F5C86B" tamanho={22} rot={8} />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </AbsoluteFill>
        </AbsoluteFill>

        {/* frase final + rodapé (a estação 3 escurece por trás) */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 140, opacity: fimEsc }}>
          <KineticText texto={tx("final")} inicio={t.final} stagger={3} estilo="cor" tamanho={70} maxLargura={1500} />
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 690 }}>
          {frame >= t.rodape ? (
            <div style={{ padding: "10px 26px", borderRadius: 999, background: "rgba(245,200,107,0.14)", border: "1.5px solid #F5C86B" }}>
              <TypeText texto={tx("rodape")} inicio={t.rodape} cps={4} style={{ fontFamily, fontWeight: 700, fontSize: 24, color: "#FCE7B8" }} />
            </div>
          ) : null}
        </AbsoluteFill>
      </CameraRig>
    </AbsoluteFill>
  );
};
