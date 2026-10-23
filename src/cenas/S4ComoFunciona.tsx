// S4 — Como funciona (≈ 14 s, claro). PROMPT_V2 §5: trilho horizontal com token-cadeado
// viajando entre Em vida → Falecimento (congela) → Liberação (stepper + carência + só a sua parte).
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Lock, LockOpen, Camera, Mail, Bitcoin, UserRound, FileText, ShieldCheck, Clock, KeyRound } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { textos, fundo, telaDe } from "../data/projeto";
import { Fundo } from "../components/v2/Fundo";
import { Stamp, DrawPath, UIBlock, Roleta, Counter, Shake, vidro } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920;

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S4 = {
  textos: {
    estacao1: "Em vida",
    estacao2: "Falecimento",
    estacao3: "Liberação",
    ativo1: "Instagram", destino1: "Memorial",
    ativo2: "E-mail", destino2: "Entregar ao Lucas",
    ativo3: "Criptomoedas", destino3: "Conforme a partilha",
    carimbo: "COFRE CONGELADO",
    passo1: "Pedido", passo2: "Validação", passo3: "Carência", passo4: "Liberação",
    carencia: "Carência:",
    dias: "dias para contestar",
    herdeiro1: "Lucas", herdeiro2: "Ana", herdeiro3: "Carlos",
    suaParte: "só a sua parte",
    diasOk: "dias ✓",
  },
  fundos: { trilho: "claro" },
  telas: { aviso: { tela: "AvisoObito", regioes: [0, 1] } },
} as const;

const T = () => {
  const r = relogio("s4");
  const a = "s04_01";
  const b = "s04_02";
  const c = "s04_03";
  const e2 = r.ini(b) - 6;
  const e3 = r.ini(c) - 6;
  return {
    r, e2, e3,
    cadastra: Math.min(r.em(a, "cadastra"), r.em(a, "vida") + 6),
    destino: r.em(a, "destino"),
    falec: r.em(b, "falecimento"),
    congelado: r.em(b, "congelado"),
    pedido: r.em(c, "inventário"),
    validacao: r.em(c, "inventário") + 14,
    prazo: r.em(c, "prazo"),
    contest: r.em(c, "contestação"),
    libera: r.em(c, "cada"),
    herdeiro: r.em(c, "herdeiro"),
    parte: r.em(c, "parte"),
  };
};

export const sfxS4 = (): Cue[] => {
  const t = T();
  return [
    ...[0, 8, 16].map((k) => ({ f: t.cadastra + k, som: "pop" as const })),
    ...[0, 6, 12].map((k) => ({ f: t.destino + k, som: "tick" as const })),
    { f: t.e2, som: "whoosh_short" },
    { f: t.falec + 4, som: "pop" },
    { f: t.congelado, som: "impact_low" },
    { f: t.congelado + 2, som: "thunk" },
    { f: t.e3, som: "whoosh_short" },
    { f: t.pedido, som: "tick" },
    { f: t.validacao, som: "tick" },
    ...[0, 6, 12, 18].map((k) => ({ f: t.prazo + k, som: "tick" as const })),
    { f: t.contest + 10, som: "chime_ok" },
    { f: t.libera, som: "lock_click" },
    ...[0, 8, 16].map((k) => ({ f: t.herdeiro + k, som: "pop" as const })),
    { f: t.parte, som: "chime_ok" },
  ];
};

const Estacao: React.FC<{ n: number; titulo: string; at: number; cor?: string; children: React.ReactNode }> = ({ n, titulo, at, cor = colors.teal700, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 8], [0, 1], clampOpt);
  return (
    <div style={{ position: "absolute", top: 0, width: W, height: 1080, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 110 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
        <div style={{ width: 62, height: 62, borderRadius: 999, background: cor, color: "#fff", fontFamily, fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 64, color: colors.ink, letterSpacing: "-0.02em" }}>{titulo}</div>
      </div>
      {children}
    </div>
  );
};

const Linha: React.FC<{ at: number; destinoAt: number; icone: React.ReactNode; nome: string; destino: string; cor: string }> = ({ at, destinoAt, icone, nome, destino, cor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 200 } });
  const d = spring({ frame: frame - destinoAt, fps, config: { damping: 9, stiffness: 240 } });
  return (
    <div style={{ ...vidro(false), width: 760, height: 92, display: "flex", alignItems: "center", gap: 20, padding: "0 26px", transform: `translateX(${(1 - s) * -120}px)`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ color: colors.teal700 }}>{icone}</div>
      <div style={{ flex: 1, fontFamily, fontWeight: 700, fontSize: 30, color: colors.ink }}>{nome}</div>
      {frame >= destinoAt ? (
        <div style={{ transform: `scale(${d})`, padding: "8px 18px", borderRadius: 999, background: cor, color: "#fff", fontFamily, fontWeight: 800, fontSize: 22 }}>{destino}</div>
      ) : null}
    </div>
  );
};

const Stepper: React.FC<{ tempos: number[] }> = ({ tempos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tx = textos("s4");
  const passos = [
    { t: tx("passo1"), Ic: FileText },
    { t: tx("passo2"), Ic: ShieldCheck },
    { t: tx("passo3"), Ic: Clock },
    { t: tx("passo4"), Ic: KeyRound },
  ];
  return (
    <div style={{ position: "relative", display: "flex", gap: 120 }}>
      <svg width={1100} height={20} style={{ position: "absolute", left: 50, top: 40 }}>
        <line x1={0} x2={1000} y1={10} y2={10} stroke={colors.cardBorder} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} x2={1000 * interpolate(frame, [tempos[0], tempos[3]], [0, 1], clampOpt)} y1={10} y2={10} stroke={colors.teal400} strokeWidth={6} strokeLinecap="round" />
      </svg>
      {passos.map((p, i) => {
        const on = frame >= tempos[i];
        const s = spring({ frame: frame - tempos[i], fps, config: { damping: 9, stiffness: 240 } });
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 150 }}>
            <div style={{ width: 100, height: 100, borderRadius: 999, background: on ? colors.teal700 : colors.white, border: `3px solid ${on ? colors.teal700 : colors.cardBorder}`, color: on ? "#fff" : colors.ink3, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 0.8 + 0.2 * s : 0.85})`, boxShadow: on ? `0 0 0 ${10 * s}px ${colors.tealTint}` : "none", zIndex: 1 }}>
              <p.Ic size={44} strokeWidth={1.9} />
            </div>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 26, color: on ? colors.ink : colors.ink3 }}>{p.t}</div>
          </div>
        );
      })}
    </div>
  );
};

export const S4ComoFunciona: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s4");
  const aviso = telaDe("s4", "aviso", { tela: "AvisoObito", regioes: [0, 1] });
  const ease = { ...clampOpt, easing: Easing.inOut(Easing.cubic) };
  const camX = interpolate(frame, [t.e2, t.e2 + 14, t.e3, t.e3 + 14], [0, W, W, 2 * W], ease);
  const velocidade = Math.abs(interpolate(frame, [t.e2, t.e2 + 7, t.e2 + 14], [0, 1, 0], clampOpt)) + Math.abs(interpolate(frame, [t.e3, t.e3 + 7, t.e3 + 14], [0, 1, 0], clampOpt));
  const congela = interpolate(frame, [t.congelado, t.congelado + 10], [0, 1], clampOpt) * interpolate(frame, [t.e3, t.e3 + 10], [1, 0], clampOpt);
  const abre = frame >= t.libera;
  const respira = 1 + 0.03 * Math.sin(frame / 9);
  // token-cadeado viaja pelo trilho (na tela: fica perto do centro, deslizando com a câmera)
  // começa à esquerda e "viaja": chega ao centro quando a câmera passa para a estação 2
  const tokenX = 960 + interpolate(frame, [0, t.e2 + 14], [-640, 0], ease);
  const tokenS = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 180 } });

  return (
    <AbsoluteFill>
      <Fundo tema={fundo("s4", "trilho", "claro")} seed="s4" />
      <AbsoluteFill style={{ filter: `${velocidade > 0.05 ? `blur(${velocidade * 10}px)` : ""} ${congela > 0 ? `grayscale(${congela * 0.85}) hue-rotate(${congela * -20}deg) brightness(${1 - congela * 0.06})` : ""}`.trim() || undefined }}>
        <div style={{ position: "absolute", left: -camX, top: 0, width: 3 * W, height: 1080, transform: `scale(${1 + frame / dur * 0.04})`, transformOrigin: `${camX + 960}px 540px` }}>
          {/* trilho */}
          <svg width={3 * W} height={1080} style={{ position: "absolute", inset: 0 }}>
            <DrawPath d={`M 200 820 L ${3 * W - 200} 820`} inicio={0} dur={Math.max(30, t.e3 + 20)} cor={colors.teal400} largura={6} tracejado />
          </svg>

          <div style={{ position: "absolute", left: 0 }}>
            <Estacao n={1} titulo={tx("estacao1")} at={2}>
              <div style={{ height: 60 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Linha at={t.cadastra} destinoAt={t.destino} icone={<Camera size={40} />} nome={tx("ativo1")} destino={tx("destino1")} cor={colors.teal600} />
                <Linha at={t.cadastra + 8} destinoAt={t.destino + 6} icone={<Mail size={40} />} nome={tx("ativo2")} destino={tx("destino2")} cor={colors.blue} />
                <Linha at={t.cadastra + 16} destinoAt={t.destino + 12} icone={<Bitcoin size={40} />} nome={tx("ativo3")} destino={tx("destino3")} cor={colors.amber} />
              </div>
            </Estacao>
          </div>

          <div style={{ position: "absolute", left: W }}>
            <Estacao n={2} titulo={tx("estacao2")} at={t.e2 + 10} cor={colors.ink2}>
              <div style={{ height: 60 }} />
              <Shake tremidas={[{ at: t.congelado, amp: 16, dur: 9 }]}>
                <div style={{ position: "relative" }}>
                  <UIBlock tela={aviso.tela} regiao={aviso.regioes[0] ?? 0} escala={1.6} inicio={t.falec} entrada="zoom" style={{ position: "relative" }} />
                  <div style={{ height: 24 }} />
                  {aviso.regioes[1] != null ? <UIBlock tela={aviso.tela} regiao={aviso.regioes[1]} escala={1.6} inicio={t.falec + 8} style={{ position: "relative" }} /> : null}
                </div>
              </Shake>
              <svg width={W} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                {["M 520 300 L 600 380 L 580 470 L 660 540", "M 1400 260 L 1330 350 L 1360 430 L 1290 520", "M 700 760 L 800 700 L 900 740 L 1000 690", "M 1250 780 L 1150 720 L 1080 760"].map((d, i) => (
                  <DrawPath key={i} d={d} inicio={t.congelado + 2 + i * 2} dur={10} cor="#BFE3F2" largura={4} glow />
                ))}
              </svg>
              <div style={{ position: "absolute", top: 660, left: 1180 }}>
                <Stamp texto={tx("carimbo")} at={t.congelado + 4} cor={colors.blue} tamanho={46} rot={-7} />
              </div>
            </Estacao>
          </div>

          <div style={{ position: "absolute", left: 2 * W }}>
            <Estacao n={3} titulo={tx("estacao3")} at={t.e3 + 10}>
              <div style={{ height: 70 }} />
              <Stepper tempos={[t.pedido, t.validacao, t.prazo, t.libera]} />
              <div style={{ height: 40 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: interpolate(frame, [t.prazo - 4, t.prazo + 4], [0, 1], clampOpt) }}>
                <span style={{ fontFamily, fontWeight: 700, fontSize: 30, color: colors.ink2 }}>{tx("carencia")}</span>
                <Roleta
                  valores={["15", "30", "60", "90", "30"]} tempos={[t.prazo, t.prazo + 6, t.prazo + 12, t.prazo + 18, t.contest + 6]} altura={78}
                  style={{ width: 120 }}
                  itemStyle={(ativo) => ({ fontFamily, fontWeight: 900, fontSize: 64, color: ativo ? colors.teal700 : colors.ink3 })}
                />
                <span style={{ fontFamily, fontWeight: 700, fontSize: 30, color: colors.ink2 }}>{tx("dias")}</span>
              </div>
              <div style={{ height: 34 }} />
              <div style={{ display: "flex", gap: 70 }}>
                {[{ Ic: Camera, n: tx("herdeiro1") }, { Ic: Mail, n: tx("herdeiro2") }, { Ic: Bitcoin, n: tx("herdeiro3") }].map((h, i) => {
                  const s = spring({ frame: frame - (t.herdeiro + i * 8), fps, config: { damping: 9, stiffness: 220 } });
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, transform: `scale(${s})`, opacity: Math.min(1, s * 2) }}>
                      <div style={{ width: 70, height: 70, borderRadius: 999, background: colors.tealTint, color: colors.teal700, display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={38} /></div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontFamily, fontWeight: 800, fontSize: 26, color: colors.ink }}>{h.n}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily, fontWeight: 700, fontSize: 18, color: colors.teal600 }}><h.Ic size={18} /> {tx("suaParte")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Estacao>
          </div>
        </div>
      </AbsoluteFill>

      {/* token-cadeado luminoso sobre o trilho */}
      <div style={{ position: "absolute", left: tokenX - 50, top: 770, width: 100, height: 100, borderRadius: 999, transform: `scale(${tokenS * respira})`, background: congela > 0.5 ? "#D9EEF7" : colors.teal700, color: congela > 0.5 ? colors.blue : "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${36 + 20 * Math.sin(frame / 6)}px ${congela > 0.5 ? "#9fd3ea" : colors.mint}` }}>
        {abre ? <LockOpen size={48} /> : <Lock size={48} />}
      </div>
      {abre ? (
        <div style={{ position: "absolute", left: tokenX + 70, top: 795, fontFamily, fontWeight: 800, fontSize: 30, color: colors.teal700 }}>
          <Counter de={0} ate={30} inicio={t.contest} dur={20} formato={(n) => `${Math.round(n)} ${tx("diasOk")}`} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
