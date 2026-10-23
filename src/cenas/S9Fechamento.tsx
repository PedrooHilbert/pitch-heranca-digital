// S9 — Equipe, próximos passos e fechamento (≈ 23 s, claro → escuro). PROMPT_V2 §5.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Briefcase, Landmark, ScanFace, Scale, Users, Hammer } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors, SLOGAN_SPACED } from "../data/theme";
import { config, isPlaceholder } from "../data/config";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { LogoRevela, Chip } from "../components/v2/kit";
import { CameraRig, KineticText, Stamp, DrawPath, Burst, Flash, TypeText, LightSweep, vidro } from "../components/fx";
import { Placeholder } from "../components/Placeholder";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const iniciais = (n: string) => (isPlaceholder(n) ? "+" : n.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase());

const T = () => {
  const r = relogio("s9");
  const a = "s09_01", b = "s09_02", c = "s09_03";
  return {
    r,
    somos: r.em(a, "Somos"),
    faculdade: r.em(a, "faculdade"),
    parceiros: [r.em(a, "escritórios"), r.em(a, "cartórios"), r.em(a, "verificação")],
    previstos: r.em(a, "previstos"),
    B: r.ini(b) - 6,
    passos: [r.em(b, "validar"), r.em(b, "ouvir"), r.em(b, "construir")],
    mvp: r.em(b, "MVP"),
    implode: r.ini(c) - 14,
    logo: r.ini(c) - 2,
    // "seu" (2ª palavra que começa com "seu" — a 1ª é "seus")
    slogan: [r.em(c, "seus"), r.em(c, "dados"), r.em(c, "sua"), r.em(c, "história"), r.em(c, "seu", 3, 2), r.em(c, "futuro")],
    obrigado: r.em(c, "Obrigado"),
    preto: r.dur - 26,
  };
};

export const sfxS9 = (): Cue[] => {
  const t = T();
  return [
    ...[0, 7, 14].map((k) => ({ f: t.somos + k, som: "pop" as const })),
    ...Array.from({ length: 8 }, (_, k) => ({ f: t.somos + 6 + k * 3, som: "type" as const })),
    { f: t.faculdade, som: "pop" },
    ...t.parceiros.map((f) => ({ f, som: "pop" as const })),
    ...[0, 4, 8].map((k) => ({ f: t.previstos + k, som: "thunk" as const })),
    { f: t.B, som: "whoosh_short" },
    ...t.passos.map((f) => ({ f: f + 6, som: "chime_ok" as const })),
    { f: t.implode, som: "whoosh_long" },
    { f: t.logo, som: "riser" },
    { f: t.logo, som: "stinger_logo" },
    { f: t.obrigado, som: "impact_low", ganho: 0.2 },
  ];
};

export const S9Fechamento: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const fase = frame < t.B ? 0 : frame < t.logo ? 1 : 2;
  const suga = interpolate(frame, [t.implode, t.logo], [0, 1], { ...clampOpt, easing: Easing.in(Easing.cubic) });
  const preto = interpolate(frame, [t.preto, dur], [0, 1], clampOpt);

  return (
    <AbsoluteFill>
      <CameraRig
        dur={dur} zoom={[1, 1.07]}
        tremidas={[{ at: t.logo, amp: 16, dur: 8 }, ...[0, 4, 8].map((k) => ({ at: t.previstos + k, amp: 4, dur: 4 }))]}
        socos={[t.somos, t.somos + 14, t.faculdade, ...t.parceiros, t.previstos, t.B, ...t.passos].map((at) => ({ at, para: 1.035, dur: 10 }))}
      >
        {fase === 0 ? (
          <>
            <Fundo tema="claro" seed="s9a" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
              <KineticText texto="Quem somos" inicio={t.somos - 4} stagger={5} cor={colors.ink} tamanho={70} />
            </AbsoluteFill>
            {config.MEMBROS.map((m, i) => {
              const n = config.MEMBROS.length;
              const x = 960 + (i - (n - 1) / 2) * 380;
              const y = 300 + Math.abs(i - (n - 1) / 2) * 40;
              const s = spring({ frame: frame - (t.somos + i * 7), fps, config: { damping: 11, stiffness: 200 } });
              const arco = (1 - s) * (i - (n - 1) / 2) * 200;
              return (
                <div key={i} style={{ position: "absolute", left: x - 170, top: y + (1 - s) * 160, width: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `translateX(${arco}px) scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.6) }}>
                  <div style={{ width: 132, height: 132, borderRadius: 999, background: colors.teal700, color: "#fff", fontFamily, fontWeight: 900, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 16px 36px rgba(11,63,61,.25), 0 0 0 6px ${colors.tealTint}` }}>{iniciais(m.nome)}</div>
                  <div style={{ fontFamily, fontWeight: 800, fontSize: 28, color: colors.ink, textAlign: "center", minHeight: 36 }}>
                    {isPlaceholder(m.nome) ? <Placeholder>{m.nome}</Placeholder> : <TypeText texto={m.nome} inicio={t.somos + 6 + i * 7} cps={1.8} cursor={false} />}
                  </div>
                  <div style={{ fontFamily, fontWeight: 600, fontSize: 20, color: colors.ink2 }}><Placeholder>{m.funcao}</Placeholder></div>
                </div>
              );
            })}
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 585 }}>
              <Chip at={t.faculdade} escuro={false}>Projeto de faculdade · UC HUB · Sprint 2</Chip>
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 690 }}>
              <div style={{ display: "flex", gap: 40 }}>
                {[{ Ic: Briefcase, t: "Escritórios" }, { Ic: Landmark, t: "Cartórios" }, { Ic: ScanFace, t: "Verificação de identidade" }].map((p, i) => {
                  const s = spring({ frame: frame - t.parceiros[i], fps, config: { damping: 10, stiffness: 230 } });
                  if (frame < t.parceiros[i]) return <div key={i} style={{ width: 300 }} />;
                  return (
                    <div key={i} style={{ position: "relative", ...vidro(false), padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, transform: `scale(${s})` }}>
                      <p.Ic size={30} color={colors.teal700} />
                      <span style={{ fontFamily, fontWeight: 800, fontSize: 24, color: colors.ink }}>{p.t}</span>
                      <div style={{ position: "absolute", right: -22, top: -26 }}>
                        <Stamp texto="PREVISTO" at={t.previstos + i * 4} cor={colors.amber} tamanho={20} rot={8} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AbsoluteFill>
          </>
        ) : null}

        {fase === 1 ? (
          <>
            <Fundo tema="claro" seed="s9b" />
            <AbsoluteFill style={{ transform: `scale(${1 - suga * 0.95}) rotate(${suga * 25}deg)`, opacity: 1 - suga * 0.9, filter: suga > 0 ? `blur(${suga * 10}px)` : undefined }}>
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
                <KineticText texto="Próximos passos" inicio={t.B + 4} stagger={5} destaque={["passos"]} cor={colors.ink} tamanho={84} />
              </AbsoluteFill>
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  {[
                    { Ic: Scale, t: "Validar com um advogado de sucessões", s: "a lista de pontos legais em aberto" },
                    { Ic: Users, t: "Ouvir usuários", s: "preço, carência e primeiro público" },
                    { Ic: Hammer, t: "Construir o MVP", s: "login, inventário, cofre cifrado, herdeiros, liberação, auditoria" },
                  ].map((p, i) => {
                    const at = t.passos[i];
                    const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 200 } });
                    if (frame < at - 2) return <div key={i} style={{ height: 112 }} />;
                    return (
                      <div key={i} style={{ ...vidro(false), width: 1100, padding: "20px 28px", display: "flex", alignItems: "center", gap: 24, transform: `translateX(${(1 - s) * -160}px)`, opacity: Math.min(1, s * 1.5) }}>
                        <svg width={64} height={64} viewBox="0 0 64 64">
                          <circle cx={32} cy={32} r={28} fill={colors.greenBg} />
                          <DrawPath d="M18 33 L28 43 L46 22" inicio={at + 6} dur={8} cor={colors.green} largura={6} />
                        </svg>
                        <p.Ic size={36} color={colors.teal700} />
                        <div>
                          <div style={{ fontFamily, fontWeight: 800, fontSize: 32, color: colors.ink }}>{p.t}</div>
                          <div style={{ fontFamily, fontWeight: 600, fontSize: 21, color: colors.ink2 }}>{p.s}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AbsoluteFill>
            </AbsoluteFill>
          </>
        ) : null}

        {fase === 2 ? (
          <>
            <Fundo tema="escuro" seed="s9c" />
            <Burst at={t.logo} x={960} y={330} n={80} raio={900} />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
              <div style={{ position: "relative", overflow: "hidden", padding: 20 }}>
                <LogoRevela at={t.logo} tamanho={150} />
                <LightSweep at={t.logo + 30} dur={26} largura={260} />
              </div>
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 480 }}>
              <KineticText texto="Seus dados, sua história, seu futuro." inicio={t.slogan[0]} tempos={t.slogan} destaque={["futuro"]} estilo="cor" tamanho={64} peso={700} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 610 }}>
              <KineticText texto="Obrigado!" inicio={t.obrigado} stagger={4} tamanho={110} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 780 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: interpolate(frame, [t.obrigado + 10, t.obrigado + 18], [0, 1], clampOpt) }}>
                <div style={{ fontFamily, fontWeight: 600, fontSize: 24, color: colors.mintSoft }}><Placeholder>{config.CONTATO}</Placeholder></div>
                <div style={{ fontFamily, fontWeight: 600, fontSize: 17, letterSpacing: "0.14em", color: colors.mintSoft2 }}>{SLOGAN_SPACED}</div>
              </div>
            </AbsoluteFill>
          </>
        ) : null}
      </CameraRig>
      <Flash at={t.logo} dur={5} max={0.95} />
      {preto > 0 ? <AbsoluteFill style={{ background: "#000", opacity: preto }} /> : null}
    </AbsoluteFill>
  );
};
