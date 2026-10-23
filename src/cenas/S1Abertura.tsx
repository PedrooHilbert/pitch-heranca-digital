// S1 — Abertura (≈ 11 s, escuro). PROMPT_V2 §5.
// Preto → flash menta → ícones estourando → cadeados travam enquanto a tipografia escreve o gancho →
// glitch + tremida → revelação do logo (clímax) → título → whip-pan.
// Textos, fundos: project.json → cenas[s1] (editáveis no Estúdio de Revisão). *palavra* = destaque.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera, Mail, Bitcoin, Cloud, Play, Globe } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors, sloganCaixaAlta } from "../data/theme";
import { config } from "../data/config";
import { textos, fundo } from "../data/projeto";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { Tile, LogoRevela, Chip } from "../components/v2/kit";
import { CameraRig, KineticText, Flash, Glitch, Burst, TypeText } from "../components/fx";
import { Placeholder } from "../components/Placeholder";
import type { Cue } from "../data/sfx";

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S1 = {
  textos: {
    gancho1: "Quando você morrer…",
    gancho2: "quem fica com o seu *digital?*",
    titulo: "Sua história também vive no *digital.*",
    chip: "Projeto UC HUB · Squad",
  },
  fundos: { gancho: "preto", logo: "escuro" },
  telas: {},
} as const;

const ICONES = [Camera, Mail, Bitcoin, Cloud, Play, Globe];

const T = () => {
  const r = relogio("s1");
  const f1 = "s01_01";
  const pops = [3, 11, 19, 27, 35, 43];
  const nomeados = [r.em(f1, "Instagram"), r.em(f1, "e-mail"), r.em(f1, "criptomoedas")];
  const quando = r.em(f1, "quando");
  const travas = ICONES.map((_, i) => quando + i * 8);
  const com = r.em(f1, "com");
  // o logo espera a voz começar "Somos…", para o gancho "…digital?" ficar ~0,7 s na tela
  const logo = Math.max(r.fim(f1) + 4, r.em("s01_02", "Somos", 2));
  const titulo = Math.max(logo + 14, r.em("s01_02", "esta", 2));
  const slogan = Math.max(titulo + 40, r.fim("s01_02") + 2);
  return {
    r, pops, nomeados, travas, logo, titulo, slogan,
    quando: [r.em(f1, "quando"), r.em(f1, "você"), r.em(f1, "morrer")],
    quem: [r.em(f1, "quem"), r.em(f1, "fica"), com, com + 4, com + 8, com + 12],
    chip: r.em("s01_02", "grupo"),
    whip: r.dur - 9,
  };
};

export const sfxS1 = (): Cue[] => {
  const t = T();
  return [
    { f: 1, som: "impact_low", ganho: 0.22 },
    ...t.pops.map((f) => ({ f, som: "pop" as const })),
    ...t.travas.map((f, i) => ({ f, som: i === 0 || i === t.travas.length - 1 ? ("thunk" as const) : ("lock_click" as const) })),
    { f: t.quem[5], som: "tick" },
    { f: t.logo - 3, som: "glitch_zap" },
    { f: t.logo, som: "riser" },
    { f: t.logo, som: "impact_low" },
    { f: t.chip, som: "pop" },
    ...Array.from({ length: 6 }, (_, k) => ({ f: t.slogan + k * 3, som: "type" as const })),
  ];
};

export const S1Abertura: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const t = T();
  const tx = textos("s1");
  const fase2 = frame >= t.logo;
  // whip-pan de saída: desliza + escala (o quadro continua coberto, sem faixa preta) com desfoque
  const whip = interpolate(frame, [t.whip, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const implode = interpolate(frame, [t.logo - 6, t.logo], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ transform: `translateX(${-whip * 110}px) scale(${1 + whip * 0.12})`, filter: whip > 0 ? `blur(${whip * 22}px)` : undefined }}>
      <CameraRig dur={dur} zoom={[1.0, 1.06]} tremidas={[...t.travas.map((at) => ({ at, amp: 4, dur: 5 })), { at: t.logo - 3, amp: 22, dur: 6 }, { at: t.logo, amp: 12, dur: 8 }]}>
        {!fase2 ? (
          <Glitch at={t.logo - 3} dur={3}>
            <Fundo tema={fundo("s1", "gancho", "preto")} seed="s1a" curvas={false} />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
              <div style={{ display: "flex", gap: 46, transform: `scale(${1 - implode * 0.6})`, opacity: 1 - implode }}>
                {ICONES.map((Ic, i) => (
                  <Tile key={i} entra={t.pops[i]} tranca={t.travas[i]} destaca={i < 3 ? t.nomeados[i] : undefined} icone={<Ic size={62} strokeWidth={1.8} />} />
                ))}
              </div>
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 470 }}>
              {frame < t.quem[0] ? (
                <KineticText texto={tx("gancho1")} inicio={t.quando[0]} tempos={t.quando} tamanho={96} fim={t.quem[0] - 8} />
              ) : (
                <KineticText texto={tx("gancho2")} inicio={t.quem[0]} tempos={t.quem} tamanho={96} />
              )}
            </AbsoluteFill>
          </Glitch>
        ) : (
          <>
            <Fundo tema={fundo("s1", "logo", "escuro")} seed="s1b" />
            <Burst at={t.logo} y={330} n={60} raio={700} />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
              <LogoRevela at={t.logo} tamanho={130} wordmark={false} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 430 }}>
              <KineticText texto={tx("titulo")} inicio={t.titulo} stagger={5} estilo="cor" tamanho={92} maxLargura={1400} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 680 }}>
              <Chip at={t.chip}>
                {config.MARCA} · {tx("chip")} <Placeholder>{config.NOME_DO_GRUPO}</Placeholder>
              </Chip>
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 790 }}>
              <TypeText texto={sloganCaixaAlta()} inicio={t.slogan} cps={2} style={{ fontFamily, fontWeight: 600, fontSize: 22, letterSpacing: "0.14em", color: colors.mintSoft2 }} />
            </AbsoluteFill>
          </>
        )}
      </CameraRig>
      <Flash at={1} dur={3} cor={colors.mint} max={0.85} />
      <Flash at={t.logo} dur={4} cor="#FFFFFF" max={0.75} />
    </AbsoluteFill>
  );
};
