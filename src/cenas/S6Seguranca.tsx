// S6 — Segurança (≈ 21 s, escuro): a "magia". PROMPT_V2 §5.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ShieldCheck, Smartphone, Server, KeyRound, Lock, LockOpen, X, UserRound, RotateCcw, Check } from "lucide-react";
import { relogio } from "../data/timeline";
import { textos, fundo, telaDe } from "../data/projeto";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { CameraRig, KineticText, ScrambleText, DrawPath, Burst, Flash, Shake, UIBlock, Cursor, Counter, vidro } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const T = () => {
  const r = relogio("s6");
  const a = "s06_01", b = "s06_02", c = "s06_03", d = "s06_04";
  return {
    r,
    coracao: r.em(a, "coração"),
    B: r.ini(b) - 6,
    cifrado: r.em(b, "cifrado"),
    voa: r.em(b, "aparelho"),
    ilegivel: r.em(b, "titular"),
    C: r.ini(c) - 6,
    chave: r.em(c, "chave"),
    tres: r.em(c, "três"),
    partes: r.em(c, "partes"),
    duas: r.em(c, "duas"),
    abre: r.em(c, "abri-la"),
    nem: r.em(c, "nem"),
    sozinha: r.em(c, "sozinha"),
    D: r.ini(d) - 6,
    remover: r.em(d, "remover"),
    alerta: r.em(d, "alerta"),
    desfazer: r.em(d, "Desfazer"),
  };
};

export const sfxS6 = (): Cue[] => {
  const t = T();
  return [
    { f: t.coracao, som: "thunk" },
    { f: t.coracao + 14, som: "thunk", ganho: 0.12 },
    { f: t.cifrado, som: "glitch_zap" },
    { f: t.voa, som: "whoosh_short" },
    { f: t.ilegivel, som: "tick" },
    { f: t.tres, som: "riser" },
    { f: t.tres, som: "impact_low" },
    ...[0, 6, 12].map((k) => ({ f: t.partes + k, som: "pop" as const })),
    { f: t.duas + 10, som: "lock_click" },
    { f: t.abre, som: "chime_ok" },
    { f: t.sozinha, som: "glitch_zap" },
    { f: t.D, som: "whoosh_short" },
    { f: t.remover + 6, som: "whoosh_short" },
    { f: t.alerta, som: "ping" },
    { f: t.desfazer, som: "rewind" },
    { f: t.desfazer + 24, som: "chime_ok" },
  ];
};


/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S6 = {
  textos: {
    titulo: "Segurança é o *coração* do produto.",
    cifrado: "*Cifrado* no aparelho.",
    aparelho: "Aparelho do titular",
    linha1: "Gmail: maria@exemplo",
    linha2: "Senha: ••••••••",
    linha3: "Instruções: memorial",
    servidor: "Servidor",
    ilegivel: "só conteúdo ilegível",
    chave: "A *chave* de sucessão",
    sozinha: "Nem a empresa abre *sozinha.*",
    parte1: "Plataforma (HSM)",
    parte2: "Custodiante independente",
    parte3: "Cópia offline",
    deTres: "de 3",
    alerta: "Mudança crítica? *Alerta* na hora.",
    herdeira: "Ana Souza",
    herdeiraSub: "herdeira · 2 ativos",
    restaurada: "restaurada",
  },
  fundos: { seguranca: "escuro" },
  telas: { alerta: { tela: "Seguranca", regioes: [5] } },
} as const;

const POS = [{ x: 560, y: 470 }, { x: 960, y: 300 }, { x: 1360, y: 470 }];

export const S6Seguranca: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s6");
  const alertaTela = telaDe("s6", "alerta", { tela: "Seguranca", regioes: [5] });
  const fase = frame < t.B ? 0 : frame < t.C ? 1 : frame < t.D ? 2 : 3;
  const bat = (k: number) => 1 + 0.12 * Math.max(0, Math.sin(((frame - t.coracao - k) / 14) * Math.PI)) * (frame > t.coracao + k ? 1 : 0);

  return (
    <AbsoluteFill>
      <CameraRig dur={dur} zoom={[1, 1.06]} socos={[t.B, t.C, t.D].map((at) => ({ at, para: 1.05 }))} tremidas={[{ at: t.tres, amp: 20, dur: 9 }, { at: t.sozinha, amp: 12 }, { at: t.desfazer, amp: 10 }]}>
        <Fundo tema={fundo("s6", "seguranca", "escuro")} seed="s6" />

        {fase === 0 ? (
          <>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
              <div style={{ color: colors.mint, transform: `scale(${bat(0) * bat(14)})`, filter: `drop-shadow(0 0 30px ${colors.mint})` }}>
                <ShieldCheck size={210} strokeWidth={1.5} />
              </div>
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 470 }}>
              <KineticText texto={tx("titulo")} inicio={6} stagger={5} tamanho={92} />
            </AbsoluteFill>
          </>
        ) : null}

        {fase === 1 ? (
          <>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
              <KineticText texto={tx("cifrado")} inicio={t.B + 4} stagger={5} tamanho={80} />
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 260, top: 330, ...vidro(true), width: 420, height: 400, padding: 30, boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: colors.mint, fontFamily, fontWeight: 800, fontSize: 26 }}><Smartphone size={34} /> {tx("aparelho")}</div>
              <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                {[tx("linha1"), tx("linha2"), tx("linha3")].map((l, i) => (
                  <ScrambleText key={i} texto={l} inicio={t.cifrado + i * 3} dur={14} modo="cifrar" seed={`c${i}`} style={{ fontSize: 26, color: "#fff" }} />
                ))}
              </div>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <DrawPath d="M 690 530 C 860 420, 1060 420, 1230 530" inicio={t.voa} dur={14} cor={colors.mint} largura={4} glow />
            </svg>
            {frame >= t.voa ? (() => {
              const p = interpolate(frame, [t.voa, t.voa + 14], [0, 1], { ...clampOpt, easing: Easing.inOut(Easing.cubic) });
              const x = (1 - p) ** 3 * 690 + 3 * (1 - p) ** 2 * p * 860 + 3 * (1 - p) * p ** 2 * 1060 + p ** 3 * 1230;
              const y = (1 - p) ** 3 * 530 + 3 * (1 - p) ** 2 * p * 420 + 3 * (1 - p) * p ** 2 * 420 + p ** 3 * 530;
              return p < 1 ? <div style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 14, background: colors.mint, color: colors.teal900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${colors.mint}` }}><Lock size={32} /></div> : null;
            })() : null}
            <div style={{ position: "absolute", left: 1240, top: 330, ...vidro(true), width: 420, height: 400, padding: 30, boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: colors.mint, fontFamily, fontWeight: 800, fontSize: 26 }}><Server size={34} /> {tx("servidor")}</div>
              {frame >= t.voa + 14 ? (
                <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                  {[0, 1, 2].map((i) => <ScrambleText key={i} texto="x9#Q@7f%2L!k0zR" inicio={10000} seed={`sv${i}-${Math.floor(frame / 3)}`} style={{ fontSize: 26, color: colors.mintSoft2 }} />)}
                  <div style={{ marginTop: 10, fontFamily, fontWeight: 800, fontSize: 30, color: colors.amberBorder, opacity: interpolate(frame, [t.ilegivel, t.ilegivel + 6], [0, 1], clampOpt) }}>{tx("ilegivel")}</div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {fase === 2 ? (
          <>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
              {frame < t.nem ? (
                <KineticText texto={tx("chave")} inicio={t.C + 4} stagger={4} tamanho={72} />
              ) : (
                <KineticText texto={tx("sozinha")} inicio={t.nem} stagger={4} tamanho={72} />
              )}
            </AbsoluteFill>
            {/* chave inteira → quebra em 3 */}
            {frame < t.tres ? (
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
                <div style={{ color: colors.amberBorder, transform: `scale(${spring({ frame: frame - t.chave, fps, config: { damping: 10, stiffness: 160 } })}) rotate(${Math.sin(frame / 6) * 4}deg)`, filter: `drop-shadow(0 0 ${20 + 14 * Math.sin(frame / 4)}px #F5C86B)` }}>
                  <KeyRound size={260} strokeWidth={1.4} />
                </div>
              </AbsoluteFill>
            ) : null}
            {frame >= t.tres ? (
              <>
                {(() => {
                  const k = frame - t.tres;
                  const r = interpolate(k, [0, 18], [40, 900], clampOpt);
                  return k < 18 ? <div style={{ position: "absolute", left: 960 - r, top: 470 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `6px solid ${colors.mint}`, opacity: 1 - k / 18 }} /> : null;
                })()}
                <Burst at={t.tres} x={960} y={470} n={50} raio={600} cores={["#F5C86B", colors.mint, "#fff"]} />
                {/* fechadura central */}
                <div style={{ position: "absolute", left: 870, top: 560, width: 180, height: 180, borderRadius: 40, ...vidro(true), display: "flex", alignItems: "center", justifyContent: "center", color: frame >= t.abre ? colors.mint : "#fff", transform: `scale(${frame >= t.abre ? 1 + 0.2 * (1 - spring({ frame: frame - t.abre, fps, config: { damping: 8 } })) : 1})` }}>
                  {frame >= t.abre && frame < t.sozinha ? <LockOpen size={96} /> : <Lock size={96} />}
                </div>
                {POS.map((p, i) => {
                  const orb = frame / 22 + (i * Math.PI * 2) / 3;
                  const sai = spring({ frame: frame - t.tres - i * 2, fps, config: { damping: 12, stiffness: 140 } });
                  let x = 960 + (p.x - 960 + Math.cos(orb) * 30) * sai;
                  let y = 470 + (p.y - 470 + Math.sin(orb) * 20) * sai;
                  // duas partes encaixam na fechadura (a 1ª e a 2ª); a 3ª fica de fora
                  const encaixa = i < 2 ? interpolate(frame, [t.duas + i * 5, t.duas + i * 5 + 10], [0, 1], { ...clampOpt, easing: Easing.in(Easing.cubic) }) : 0;
                  // "nem a empresa consegue sozinha": a 1ª parte FICA na fechadura (entra uma vez só — revisão #6) e
                  // a 2ª sai devagar e apaga; com uma parte só a fechadura volta a trancar (t.sozinha)
                  const solta = i === 1 ? interpolate(frame, [t.nem, t.nem + 14], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) }) : 0;
                  const dentro = encaixa * (1 - solta);
                  const alvoX = 960;
                  const alvoY = 650;
                  x = x + (alvoX - x) * dentro;
                  y = y + (alvoY - y) * dentro;
                  const sumida = 1 - 0.75 * solta;
                  return (
                    <div key={i} style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: sumida }}>
                      <div style={{ width: 120, height: 120, borderRadius: 30, ...vidro(true), color: "#F5C86B", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(i - 1) * 25 + Math.sin(frame / 8 + i) * 6}deg)` }}>
                        <KeyRound size={64} />
                      </div>
                      {frame >= t.partes + i * 6 && dentro < 0.5 ? (
                        <div style={{ fontFamily, fontWeight: 800, fontSize: 24, color: "#fff", whiteSpace: "nowrap", textAlign: "center", opacity: interpolate(frame, [t.partes + i * 6, t.partes + i * 6 + 6], [0, 1], clampOpt) }}>{tx(`parte${i + 1}`)}</div>
                      ) : null}
                    </div>
                  );
                })}
                {frame >= t.duas + 14 ? (
                  <div style={{ position: "absolute", left: 1110, top: 600, fontFamily, fontWeight: 900, fontSize: 84, color: frame >= t.sozinha ? colors.red : colors.mint, display: "flex", alignItems: "baseline", gap: 14 }}>
                    {frame >= t.sozinha ? (
                      <Shake tremidas={[{ at: t.sozinha, amp: 14 }]}><span style={{ display: "flex", alignItems: "center", gap: 10 }}>1 {tx("deTres")} <X size={70} strokeWidth={3.4} /></span></Shake>
                    ) : (
                      <><Counter ate={2} inicio={t.duas + 14} dur={14} /> <span>{tx("deTres")}</span></>
                    )}
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {fase === 3 ? (
          <>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
              <KineticText texto={tx("alerta")} inicio={t.D + 4} stagger={4} tamanho={70} />
            </AbsoluteFill>
            {/* herdeira sendo removida e depois "rebobinada" */}
            {(() => {
              const sai = interpolate(frame, [t.remover + 6, t.remover + 18], [0, 1], { ...clampOpt, easing: Easing.in(Easing.cubic) });
              const volta = interpolate(frame, [t.desfazer + 4, t.desfazer + 22], [0, 1], { ...clampOpt, easing: Easing.inOut(Easing.cubic) });
              const k = sai * (1 - volta);
              const rebob = frame >= t.desfazer + 4 && frame < t.desfazer + 22;
              return (
                <>
                  {rebob ? [0.25, 0.5, 0.75].map((g) => (
                    <div key={g} style={{ position: "absolute", left: 640 + (k + g * 0.3) * 420, top: 420, width: 640, height: 130, borderRadius: 22, border: `2px solid ${colors.mint}`, opacity: 0.25 * (1 - g) }} />
                  )) : null}
                  <div style={{ position: "absolute", left: 640 + k * 420, top: 420, width: 640, ...vidro(true), padding: "24px 28px", display: "flex", alignItems: "center", gap: 18, opacity: 1 - k * 0.65, transform: `scale(${1 - k * 0.12})`, filter: rebob ? "hue-rotate(60deg) blur(1px)" : undefined }}>
                    <div style={{ width: 70, height: 70, borderRadius: 999, background: "rgba(127,209,197,.2)", color: colors.mint, display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={40} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily, fontWeight: 800, fontSize: 30, color: "#fff", textDecoration: k > 0.2 ? "line-through" : "none" }}>{tx("herdeira")}</div>
                      <div style={{ fontFamily, fontWeight: 600, fontSize: 20, color: colors.mintSoft }}>{tx("herdeiraSub")}</div>
                    </div>
                    {frame >= t.desfazer + 22 ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.mint, fontFamily, fontWeight: 800, fontSize: 22 }}><Check size={26} strokeWidth={3} /> {tx("restaurada")}</div> : null}
                  </div>
                </>
              );
            })()}
            {/* alerta real do protótipo descendo do topo */}
            {frame >= t.alerta ? (() => {
              const s = spring({ frame: frame - t.alerta, fps, config: { damping: 12, stiffness: 170 } });
              return (
                <div style={{ position: "absolute", left: 260, top: 640 + (1 - s) * -520, width: 1400, height: 124, opacity: Math.min(1, s * 1.5) }}>
                  <UIBlock tela={alertaTela.tela} regiao={alertaTela.regioes[0] ?? 0} escala={1400 / 1008} x={0} y={0} inicio={t.alerta} entrada="nenhuma" raio={18} />
                </div>
              );
            })() : null}
            <Cursor pontos={[{ f: t.alerta + 10, x: 1000, y: 880 }, { f: t.desfazer - 2, x: 1560, y: 702 }]} cliques={[t.desfazer]} />
            {frame >= t.desfazer && frame < t.desfazer + 26 ? (
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ color: colors.mint, opacity: 0.85, transform: `rotate(${-(frame - t.desfazer) * 22}deg)` }}><RotateCcw size={150} strokeWidth={2} /></div>
              </AbsoluteFill>
            ) : null}
          </>
        ) : null}
      </CameraRig>
      <Flash at={t.tres} dur={3} max={0.6} />
      <Flash at={t.abre} dur={3} cor={colors.mint} max={0.55} />
      <Flash at={t.alerta} dur={2} cor="#F5C86B" max={0.45} />
    </AbsoluteFill>
  );
};
