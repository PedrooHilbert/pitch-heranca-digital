// S3 — Proposta de valor (≈ 18 s, escuro → claro). PROMPT_V2 §5.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Mail, Share2, Landmark, Bitcoin, Images, RefreshCw, Globe, Lock, LockOpen, ClipboardList, ShieldCheck, Scale } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { Eyebrow } from "../components/v2/kit";
import { textos, fundo, telaDe } from "../data/projeto";
import { config } from "../data/config";
import { CameraRig, KineticText, Counter, Tilt3D, ScreenAssembly, UIBlock, ScrambleText, LightSweep, Flash, vidro } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S3 = {
  textos: {
    abertura: "Um *cofre* para a sua vida digital",
    pilares: "pilares numa plataforma só",
    t1Titulo: "Inventário digital",
    t1Sub: "A lista do que existe e o destino de cada item.",
    t2Titulo: "Cofre de acessos",
    t2Sub: "Senhas cifradas. Ninguém lê — nem a empresa.",
    t3Titulo: "Liberação pela via legal",
    t3Sub: "Só depois do inventário — na justiça ou em cartório.",
    fecho: "Uma plataforma. Três *pilares.*",
    card1: "Inventário digital",
    card2: "Cofre de acessos",
    card3: "Liberação via legal",
  },
  fundos: { abertura: "escuro", t1: "claro", t2: "escuro", t3: "claro", fecho: "claro" },
  telas: {
    t1: { tela: "Inventario", regioes: [0, 2, 3, 5, 6, 7] },
    t2: { tela: "Confirmar", regioes: [0] },
    t3: { tela: "Regras", regioes: [0, 2, 3, 4, 5, 6] },
  },
} as const;
const telaPadrao = (k: "t1" | "t2" | "t3") => ({ tela: PADRAO_S3.telas[k].tela as string, regioes: [...PADRAO_S3.telas[k].regioes] as number[] });
const ICONES = [Mail, Share2, Landmark, Bitcoin, Images, RefreshCw, Globe];

const T = () => {
  const r = relogio("s3");
  const a = "s03_01";
  const b = "s03_02";
  const c = "s03_03";
  return {
    r,
    cofre: r.em(a, "cofre"),
    vida: r.em(a, "vida"),
    tudo: r.em(a, "tudo"),
    tres: r.em(b, "três"),
    t1: r.em(b, "inventário", 6),
    t2: r.em(b, "cofre", 6),
    cripto: r.em(b, "criptografado"),
    t3: r.em(c, "liberação", 6),
    legal: r.em(c, "legal"),
    cartorio: r.em(c, "cartório"),
    justica: r.em(c, "justiça"),
    fecho: r.apos(c, "justiça") - 16,
  };
};

export const sfxS3 = (): Cue[] => {
  const t = T();
  return [
    { f: t.cofre, som: "impact_low", ganho: 0.2 },
    { f: t.tudo, som: "whoosh_long" },
    { f: t.tudo + 18, som: "lock_click" },
    ...[0, 9, 18].map((k) => ({ f: t.tres + k, som: "tick" as const })),
    { f: t.tres + 27, som: "pop" },
    ...[t.t1, t.t2, t.t3].flatMap((f) => [{ f, som: "whoosh_short" as const }, { f: f + 4, som: "pop" as const }]),
    { f: t.cripto, som: "glitch_zap" },
    { f: t.cripto + 18, som: "lock_click" },
    { f: t.legal, som: "chime_ok" },
    { f: t.fecho, som: "whoosh_long" },
    { f: t.fecho + 10, som: "pop" },
    { f: t.fecho + 16, som: "pop" },
    { f: t.fecho + 22, som: "pop" },
  ];
};

const Numero: React.FC<{ n: string; at: number; escuro?: boolean }> = ({ n, at, escuro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });
  return (
    <div style={{ fontFamily, fontWeight: 900, fontSize: 230, lineHeight: 0.9, color: "transparent", WebkitTextStroke: `4px ${escuro ? colors.mint : colors.teal700}`, transform: `scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * -12}deg)`, transformOrigin: "left bottom", opacity: Math.min(1, s * 2) }}>
      {n}
    </div>
  );
};

const Tomada: React.FC<{ n: string; at: number; titulo: string; sub: string; escuro?: boolean; children: React.ReactNode }> = ({ n, at, titulo, sub, escuro, children }) => (
  <>
    <AbsoluteFill style={{ paddingLeft: 120, paddingTop: 200 }}>
      <Numero n={n} at={at} escuro={escuro} />
      <div style={{ height: 24 }} />
      <KineticText texto={titulo} inicio={at + 6} stagger={4} alinhar="left" tamanho={76} maxLargura={640} cor={escuro ? "#fff" : colors.ink} />
      <div style={{ height: 18 }} />
      <KineticText texto={sub} inicio={at + 14} stagger={3} alinhar="left" tamanho={30} peso={600} maxLargura={600} cor={escuro ? colors.mintSoft : colors.ink2} />
    </AbsoluteFill>
    <AbsoluteFill style={{ paddingLeft: 820, paddingTop: 150 }}>{children}</AbsoluteFill>
  </>
);

const Cifrado: React.FC<{ at: number; cripto: number }> = ({ at, cripto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fecha = spring({ frame: frame - cripto - 18, fps, config: { damping: 10, stiffness: 240 } });
  const fechado = frame >= cripto + 18;
  const tl = telaDe("s3", "t2", telaPadrao("t2"));
  return (
    <div style={{ position: "relative", width: 900, height: 640 }}>
      <UIBlock tela={tl.tela} regiao={tl.regioes[0] ?? 0} escala={1.35} x={0} y={0} inicio={at} entrada="zoom" />
      <div style={{ position: "absolute", left: 0, top: 612, width: 594, zIndex: 5, ...vidro(true), background: colors.teal900, padding: "20px 26px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ transform: `scale(${1 + (fechado ? (1 - fecha) * 0.4 : 0)})`, color: fechado ? colors.mint : "#fff" }}>
          {fechado ? <Lock size={44} /> : <LockOpen size={44} />}
        </div>
        {frame < cripto ? (
          <span style={{ fontFamily, fontSize: 40, color: "#fff", letterSpacing: "0.18em" }}>{"•".repeat(Math.max(0, Math.min(12, Math.floor((frame - at - 8) / 2))))}</span>
        ) : (
          <ScrambleText texto="7f3a9c21e0b84d55" inicio={cripto} dur={16} modo="decifrar" seed="cof" style={{ fontSize: 38, color: colors.mint, letterSpacing: "0.06em" }} />
        )}
      </div>
    </div>
  );
};

export const S3Proposta: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const fase = frame < t.t1 ? 0 : frame < t.t2 ? 1 : frame < t.t3 ? 2 : frame < t.fecho ? 3 : 4;
  const cofreS = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 160 } });
  const tx = textos("s3");
  const nAbertura = tx("abertura").split(/\s+/).filter(Boolean).length;
  const temposAbertura = [8, ...Array.from({ length: Math.max(0, nAbertura - 1) }, (_, k) => t.cofre + k * 5)];
  const T1 = telaDe("s3", "t1", telaPadrao("t1"));
  const T3 = telaDe("s3", "t3", telaPadrao("t3"));
  const suga = interpolate(frame, [t.tudo, t.tudo + 18], [0, 1], { ...clampOpt });

  return (
    <AbsoluteFill>
      <CameraRig dur={dur} zoom={[1, 1.06]} socos={[t.t1, t.t2, t.t3, t.fecho].map((at) => ({ at, para: 1.05 }))} tremidas={[{ at: t.cofre, amp: 10 }, { at: t.tudo + 18, amp: 8 }]}>
        {fase === 0 ? (
          <>
            <Fundo tema={fundo("s3", "abertura", "escuro")} seed="s3a" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
              <KineticText texto={tx("abertura")} inicio={8} tempos={temposAbertura} tamanho={84} />
            </AbsoluteFill>
            {/* cofre + ativos sendo sugados para dentro */}
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
              <div style={{ position: "relative", width: 300, height: 300, transform: `scale(${cofreS})` }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 70, ...vidro(true), display: "flex", alignItems: "center", justifyContent: "center", color: colors.mint, boxShadow: `0 0 ${60 * suga}px ${colors.mint}` }}>
                  {frame >= t.tudo + 18 ? <Lock size={150} strokeWidth={1.6} /> : <LockOpen size={150} strokeWidth={1.6} />}
                </div>
              </div>
            </AbsoluteFill>
            {ICONES.map((Ic, i) => {
              const ang = (i / ICONES.length) * Math.PI * 2 + frame / 70;
              const R = 470 * (1 - suga);
              const x = 960 + Math.cos(ang) * R;
              const y = 480 + Math.sin(ang) * R * 0.5;
              const e = spring({ frame: frame - (t.vida + i * 3), fps, config: { damping: 10, stiffness: 220 } });
              return (
                <div key={i} style={{ position: "absolute", left: x - 42, top: y - 42, width: 84, height: 84, borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(127,209,197,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: colors.mint, transform: `scale(${e * (1 - suga * 0.8)})`, opacity: 1 - suga * 0.9 }}>
                  <Ic size={42} strokeWidth={1.8} />
                </div>
              );
            })}
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 700, opacity: interpolate(frame, [t.tres - 4, t.tres + 2], [0, 1], clampOpt) }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 22, fontFamily, color: "#fff" }}>
                <Counter de={0} ate={3} inicio={t.tres} dur={27} style={{ fontSize: 120, fontWeight: 900, color: colors.mint }} />
                <span style={{ fontSize: 56, fontWeight: 800 }}>{tx("pilares")}</span>
              </div>
            </AbsoluteFill>
          </>
        ) : null}

        {fase === 1 ? (
          <>
            <Fundo tema={fundo("s3", "t1", "claro")} seed="s3b" />
            <Tomada n="01" at={t.t1} titulo={tx("t1Titulo")} sub={tx("t1Sub")} escuro={fundo("s3", "t1", "claro") !== "claro"}>
              <Tilt3D inicio={t.t1} assenta={t.t1 + 22} rotY={-12}>
                <ScreenAssembly tela={T1.tela} largura={980} altura={640} inicio={t.t1 + 2} ordem={T1.regioes} stagger={6} />
              </Tilt3D>
            </Tomada>
          </>
        ) : null}

        {fase === 2 ? (
          <>
            <Fundo tema={fundo("s3", "t2", "escuro")} seed="s3c" />
            <Tomada n="02" at={t.t2} titulo={tx("t2Titulo")} sub={tx("t2Sub")} escuro={fundo("s3", "t2", "escuro") !== "claro"}>
              <Tilt3D inicio={t.t2} assenta={t.t2 + 20} rotY={12}>
                <Cifrado at={t.t2 + 2} cripto={t.cripto} />
              </Tilt3D>
            </Tomada>
          </>
        ) : null}

        {fase === 3 ? (
          <>
            <Fundo tema={fundo("s3", "t3", "claro")} seed="s3d" />
            <Tomada n="03" at={t.t3} titulo={tx("t3Titulo")} sub={tx("t3Sub")} escuro={fundo("s3", "t3", "claro") !== "claro"}>
              <Tilt3D inicio={t.t3} assenta={t.t3 + 22} rotY={-12}>
                <ScreenAssembly
                  tela={T3.tela} largura={980} altura={640} inicio={t.t3 + 2} ordem={T3.regioes} stagger={5}
                  rolagem={{ de: 100, ate: 560, f0: t.t3 + 30, f1: t.justica + 6 }}
                  pops={[{ regiao: 3, at: t.legal, ate: t.cartorio - 2 }, { regiao: 6, at: t.cartorio, ate: t.fecho }]}
                />
              </Tilt3D>
            </Tomada>
          </>
        ) : null}

        {fase === 4 ? (
          <>
            <Fundo tema={fundo("s3", "fecho", "claro")} seed="s3e" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
              <Eyebrow texto={config.MARCA.toLocaleUpperCase("pt-BR")} at={t.fecho} />
              <div style={{ height: 22 }} />
              <KineticText texto={tx("fecho")} inicio={t.fecho + 4} stagger={4} cor={colors.ink} tamanho={86} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 470 }}>
              <div style={{ position: "relative", display: "flex", gap: 34, overflow: "hidden", padding: 16 }}>
                {[
                  { Ic: ClipboardList, n: "01", t: tx("card1") },
                  { Ic: ShieldCheck, n: "02", t: tx("card2") },
                  { Ic: Scale, n: "03", t: tx("card3") },
                ].map((c, i) => {
                  const s = spring({ frame: frame - (t.fecho + 8 + i * 6), fps, config: { damping: 12, stiffness: 200 } });
                  return (
                    <div key={i} style={{ ...vidro(false), width: 420, padding: "26px 28px", display: "flex", alignItems: "center", gap: 20, transform: `scale(${2.2 - 1.2 * s})`, opacity: Math.min(1, s * 1.6) }}>
                      <div style={{ width: 72, height: 72, borderRadius: 18, background: colors.tealTint, color: colors.teal700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <c.Ic size={38} strokeWidth={1.8} />
                      </div>
                      <div>
                        <div style={{ fontFamily, fontWeight: 800, fontSize: 22, color: colors.teal400 }}>{c.n}</div>
                        <div style={{ fontFamily, fontWeight: 800, fontSize: 30, color: colors.ink }}>{c.t}</div>
                      </div>
                    </div>
                  );
                })}
                <LightSweep at={t.fecho + 26} dur={22} largura={220} />
              </div>
            </AbsoluteFill>
          </>
        ) : null}
      </CameraRig>
      {[t.t1, t.t2, t.t3].map((at) => <Flash key={at} at={at} dur={2} max={0.45} />)}
    </AbsoluteFill>
  );
};
