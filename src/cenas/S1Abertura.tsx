// S1 — Abertura (≈ 12 s, escuro). Revisão #1 (gancho A): impacto desde o primeiro quadro.
//   f0–f5   preto total e silêncio · f6 impact_low + flash menta (2 q)
//   gancho  "QUANDO VOCÊ MORRER…" gigante, palavra por palavra com slam, junto com a voz
//   3 perguntas, uma por fala: texto grande + ícone ENORME que estoura (pop, whoosh, soco de zoom,
//           fundo pisca preto → verde-petróleo → preto)
//   clímax  13 ícones em órbita, cadeados batendo em sequência, riser, glitch, tremida
//   implosão: a órbita é sugada para o centro e vira um cadeado grande → flash → logo real (que tem cadeado) + stinger,
//           varredura de luz, partículas → título, chip, slogan → whip-pan
//   (o blackout de 6 q em silêncio da revisão #1 saiu: no vídeo parecia que a imagem e o som tinham caído)
// Textos e fundos: project.json → cenas[s1] (editáveis no Estúdio de Revisão). *palavra* = destaque.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Lock } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { MARCAS, type MarcaId } from "../data/marcas";
import { cena, frase, relogio } from "../data/timeline";
import { colors, sloganCaixaAlta } from "../data/theme";
import { config } from "../data/config";
import { textos, fundo } from "../data/projeto";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { LogoRevela, Chip } from "../components/v2/kit";
import { CameraRig, KineticText, Flash, Glitch, Burst, Orbit, TypeText } from "../components/fx";
import { Placeholder } from "../components/Placeholder";
import type { Cue } from "../data/sfx";

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S1 = {
  textos: {
    gancho: "QUANDO VOCÊ MORRER…",
    pergunta1: "QUEM FICA COM O SEU *INSTAGRAM?*",
    pergunta2: "COM O SEU *E-MAIL?*",
    pergunta3: "COM AS SUAS *CRIPTOMOEDAS?*",
    titulo: "Sua história também vive no *digital.*",
    chip: "Squad",
  },
  fundos: { gancho: "preto", estouro: "escuro", logo: "escuro" },
  telas: {},
} as const;

/** Logo pedido na revisão #1 (versão menta para fundo escuro). */
const LOGO_ESCURO = "brand/logo-simbolo-menta-fundo-escuro.png";
const MEIA_BATIDA = 8; // 16 q por batida (112,5 BPM, a trilha) — ver README "Decisões"
const TRANSICAO = 6; // quadros da passagem pergunta → órbita
const IMPLOSAO = 12; // quadros da órbita sendo sugada até virar o cadeado do logo
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PERGUNTAS = [
  { fala: "s01_02", texto: "pergunta1", marca: "instagram" },
  { fala: "s01_03", texto: "pergunta2", marca: "gmail" },
  { fala: "s01_04", texto: "pergunta3", marca: "bitcoin" },
] as const;
// logos reais (revisão #4) — domínio e banco digital não têm logo: ícone genérico
const ORBITA: MarcaId[] = [
  "instagram", "gmail", "bitcoin", "facebook", "linkedin", "x", "netflix",
  "spotify", "google-drive", "icloud", "binance", "dominio", "banco",
];
const THUNKS = 7; // um cadeado a cada meia batida; cada batida tranca 2 tiles (i e i + 7)

/** Quadro local de cada palavra dita (pela ordem), para sincronizar texto ↔ voz. Sobra → última + 3. */
const temposDa = (fraseId: string, n: number, antes = 3) => {
  const ini = cena("s1").from;
  const ps = frase(fraseId).palavras.map((p) => p.from - ini - antes);
  return Array.from({ length: n }, (_, i) => ps[i] ?? (ps[ps.length - 1] ?? 0) + 3 * (i - ps.length + 1));
};
const nPalavras = (s: string) => s.split(/\s+/).filter(Boolean).length;

const T = () => {
  const r = relogio("s1");
  const tx = textos("s1");
  const impacto = 6;
  // gancho: "QUANDO" bate em f10 (logo depois do impacto); as outras 3 q antes de serem ditas
  const gancho = temposDa("s01_01", nPalavras(tx("gancho"))).map((f, i) => (i === 0 ? 10 : Math.max(10, f)));
  const perguntas = PERGUNTAS.map((p) => {
    const tempos = temposDa(p.fala, nPalavras(tx(p.texto)));
    // a pergunta entra quando a 1ª palavra dela bate (a anterior fica até lá: nenhum quadro vazio)
    return { ...p, ini: tempos[0], tempos, estouro: tempos[tempos.length - 1] - 1 };
  });
  // o clímax entra no fim de "criptomoedas" (revisão #4: antes o ₿ sumia 12 q depois de estourar); a pausa de 42 q
  // antes de "Somos" (narracao.ts) cobre cadeados + glitch + implosão (12 q) até o logo
  const climax = Math.max(perguntas[2].estouro + 12, r.apos("s01_04", "criptomoedas") - 14);
  const logo = r.em("s01_05", "Somos", 6);
  const implosao = logo - IMPLOSAO;
  const glitch = implosao - 4;
  const entradas = ORBITA.map((_, i) => climax + (i < 3 ? 0 : i - 2));
  // 7 cadeados: na meia batida se couber; senão mais juntos (mínimo 4 q), sempre antes do glitch
  const passo = Math.max(4, Math.min(MEIA_BATIDA, Math.floor((glitch - 2 - (climax + 4)) / (THUNKS - 1))));
  const batidas = Array.from({ length: THUNKS }, (_, k) => Math.min(glitch - 2, climax + 4 + k * passo));
  const travas = ORBITA.map((_, i) => batidas[i % THUNKS]);
  const chip = r.apos("s01_05", "grupo");
  const titulo = logo + 10;
  const slogan = Math.max(chip + 24, r.em("s01_05", "Herança", 2));
  return { r, impacto, gancho, perguntas, climax, logo, implosao, glitch, entradas, travas, batidas, chip, titulo, slogan, whip: r.dur - 9 };
};

/** Janelas de silêncio total (locais) — o Mix zera a trilha nelas. */
export const silenciosS1 = (): [number, number][] => {
  const t = T();
  return [[0, t.impacto]];
};

export const sfxS1 = (): Cue[] => {
  const t = T();
  const dB = (x: number) => Math.pow(10, x / 20);
  return [
    // o mixer antecipa 2 q: +2 faz o som nascer exatamente no quadro do impacto/logo
    { f: t.impacto + 2, som: "impact_low", ganho: dB(-8) },
    ...t.gancho.map((f) => ({ f, som: "thunk" as const, ganho: dB(-19) })),
    ...t.perguntas.flatMap((p) => [
      { f: p.ini + 2, som: "whoosh_short" as const },
      { f: p.estouro, som: "pop" as const, ganho: dB(-13) },
      { f: p.estouro + 1, som: "impact_low" as const, ganho: dB(-17) },
    ]),
    { f: t.climax + 2, som: "whoosh_long" as const },
    ...t.entradas.slice(3).filter((_, i) => i % 3 === 0).map((f) => ({ f, som: "pop" as const, ganho: dB(-20) })),
    ...t.batidas.map((f) => ({ f, som: "thunk" as const, ganho: dB(-13) })),
    { f: t.logo - 2, som: "riser" }, // o riser sobe até o logo
    { f: t.glitch - 3, som: "glitch_zap", ganho: dB(-14) },
    { f: t.implosao + 2, som: "rewind", ganho: dB(-15) }, // a órbita sendo sugada
    { f: t.logo + 2, som: "impact_low", ganho: dB(-9) },
    { f: t.logo + 2, som: "stinger_logo" },
    { f: t.chip, som: "pop" },
    ...Array.from({ length: 6 }, (_, k) => ({ f: t.slogan + k * 3, som: "type" as const })),
  ];
};

/** Palavras que "batem" na tela: entram grandes e borradas, assentam em 4 q. */
const Slam: React.FC<{ texto: string; tempos: number[]; tamanho: number; fim?: number; corDestaque?: string }> = ({
  texto, tempos, tamanho, fim, corDestaque = colors.mint,
}) => {
  const frame = useCurrentFrame();
  let dentro = false;
  const itens = texto.split(/\s+/).filter(Boolean).map((tok) => {
    let w = tok;
    let d = dentro;
    if (w.startsWith("*")) {
      d = dentro = true;
      w = w.slice(1);
    }
    const fecha = /\*([.,!?…:;]*)$/.exec(w);
    if (fecha) {
      w = w.slice(0, fecha.index) + fecha[1];
      d = true;
      dentro = false;
    }
    return { w, d };
  });
  const sai = fim != null ? interpolate(frame, [fim, fim + 3], [0, 1], clampOpt) : 0;
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: tamanho * 0.24, rowGap: tamanho * 0.02,
        maxWidth: 1700, fontFamily, fontWeight: 800, fontSize: tamanho, lineHeight: 1.02, letterSpacing: "-0.03em",
        color: colors.white, textAlign: "center", opacity: 1 - sai, transform: `scale(${1 + sai * 0.15})`,
      }}
    >
      {itens.map(({ w, d }, i) => {
        const t0 = tempos[i] ?? tempos[tempos.length - 1] ?? 0;
        const k = frame - t0;
        if (k < 0) return <span key={i} style={{ opacity: 0 }}>{w}</span>;
        const e = interpolate(k, [0, 4], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
        return (
          <span
            key={i}
            style={{
              display: "inline-block", transform: `scale(${2.1 - 1.1 * e})`, opacity: interpolate(k, [0, 1], [0.35, 1], clampOpt),
              filter: e < 0.95 ? `blur(${(1 - e) * 10}px)` : undefined, color: d ? corDestaque : undefined,
              textShadow: d ? `0 0 40px rgba(127,209,197,0.45)` : "0 6px 30px rgba(0,0,0,0.5)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Ícone ENORME que estoura no centro: mola com overshoot, brilho e anel de choque. */
const Estouro: React.FC<{ at: number; marca: MarcaId; tamanho?: number }> = ({ at, marca, tamanho = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame - at;
  if (k < 0) return <div style={{ width: tamanho, height: tamanho }} />;
  const s = spring({ frame: k, fps, config: { damping: 8, stiffness: 260, mass: 0.55 } });
  const anel = interpolate(k, [0, 16], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  const glow = interpolate(k, [0, 3, 20], [1.6, 1.2, 0.7], clampOpt);
  const flut = Math.sin(k / 9) * 6;
  const cor = MARCAS[marca].glow;
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho, transform: `translateY(${flut}px) scale(${s})` }}>
      <div
        style={{
          position: "absolute", inset: -tamanho * 0.18, borderRadius: "50%",
          border: `6px solid ${cor[0]}`, opacity: 1 - anel, transform: `scale(${0.7 + anel * 1.1})`,
        }}
      />
      <div
        style={{
          width: "100%", height: "100%", borderRadius: tamanho * 0.26, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(160deg, rgba(127,209,197,0.22), rgba(255,255,255,0.06))",
          border: `3px solid rgba(127,209,197,0.7)`,
          boxShadow: `0 0 ${70 * glow}px ${cor[0]}88, 0 0 ${110 * glow}px ${(cor[1] ?? cor[0])}55, inset 0 0 40px rgba(127,209,197,0.15)`,
        }}
      >
        <BrandLogo nome={marca} tamanho={Math.round(tamanho * 0.66)} glow={glow * 0.6} />
      </div>
    </div>
  );
};

/** Tile da órbita do clímax: o cadeado âmbar bate em cima dele no quadro `tranca`. */
const TileTrava: React.FC<{ marca: MarcaId; tranca: number; tamanho: number }> = ({ marca, tranca, tamanho }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame - tranca;
  const t = k >= 0 ? spring({ frame: k, fps, config: { damping: 9, stiffness: 320, mass: 0.5 } }) : 0;
  const trancado = k >= 0;
  const amassa = trancado ? interpolate(k, [0, 2, 6], [1, 0.86, 1], clampOpt) : 1;
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho, transform: `scale(${amassa})` }}>
      <div
        style={{
          width: "100%", height: "100%", borderRadius: tamanho * 0.24, display: "flex", alignItems: "center", justifyContent: "center",
          background: trancado ? "rgba(245,200,107,0.12)" : "rgba(255,255,255,0.08)",
          border: `3px solid ${trancado ? colors.amberBorder : "rgba(127,209,197,0.55)"}`,
          boxShadow: `0 18px 40px rgba(0,0,0,0.45)${trancado ? `, 0 0 26px rgba(245,200,107,0.35)` : ""}`,
        }}
      >
        <BrandLogo nome={marca} tamanho={Math.round(tamanho * 0.56)} glow={trancado ? 0 : 0.35} />
      </div>
      {trancado ? (
        <div
          style={{
            position: "absolute", right: -tamanho * 0.16, bottom: -tamanho * 0.16, width: tamanho * 0.5, height: tamanho * 0.5,
            borderRadius: 999, background: colors.amberBg, border: `4px solid ${colors.amberBorder}`, color: colors.amber,
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,.45)",
            transform: `translateY(${(1 - t) * -120}px) scale(${1.6 - 0.6 * t})`, opacity: Math.min(1, k / 2 + 0.3),
          }}
        >
          <Lock size={tamanho * 0.26} strokeWidth={2.8} />
        </div>
      ) : null}
    </div>
  );
};

export const S1Abertura: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const t = T();
  const tx = textos("s1");
  const whip = interpolate(frame, [t.whip, dur], [0, 1], clampOpt);

  // fundo verde-petróleo que acende em cada estouro e volta ao preto ("interruptor de padrão")
  const pisca = Math.max(0, ...t.perguntas.map((p) => interpolate(frame, [p.estouro, p.estouro + 2, p.estouro + 12, p.estouro + 24], [0, 1, 0.85, 0], clampOpt)));
  const pergunta = [...t.perguntas].reverse().find((p) => frame >= p.ini);
  const fase =
    frame < t.impacto ? "preto" : frame < t.perguntas[0].ini ? "gancho" : frame < t.climax ? "perguntas" : frame < t.logo ? "climax" : "logo";
  const tremidas = [
    ...t.gancho.map((at) => ({ at, amp: 5, dur: 5 })),
    ...t.batidas.map((at) => ({ at, amp: 7, dur: 5 })),
    { at: t.glitch, amp: 22, dur: 6 },
    { at: t.logo, amp: 14, dur: 8 },
  ];
  const socos = t.perguntas.map((p) => ({ at: p.estouro, para: 1.15, dur: 12 }));

  return (
    <AbsoluteFill style={{ background: "#000", transform: `translateX(${-whip * 110}px) scale(${1 + whip * 0.12})`, filter: whip > 0 ? `blur(${whip * 22}px)` : undefined }}>
      {fase === "preto" ? null : (
        <CameraRig dur={dur} zoom={[1.0, 1.08]} tremidas={tremidas} socos={socos}>
          {fase !== "logo" ? (
            <Glitch at={t.glitch} dur={3}>
              <Fundo tema={fundo("s1", "gancho", "preto")} seed="s1a" curvas={false} />
              <AbsoluteFill style={{ opacity: pisca }}>
                <Fundo tema={fundo("s1", "estouro", "escuro")} seed="s1p" curvas={false} />
              </AbsoluteFill>

              {fase === "gancho" ? (
                <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
                  <Slam texto={tx("gancho")} tempos={t.gancho} tamanho={200} fim={t.perguntas[0].ini - 3} />
                </AbsoluteFill>
              ) : null}

              {/* revisão #4: sem corte seco — a última pergunta "voa" para a câmera (cresce e apaga em 6 q)
                  enquanto a órbita do clímax aparece por baixo */}
              {(fase === "perguntas" || (fase === "climax" && frame < t.climax + TRANSICAO)) && pergunta ? (
                <AbsoluteFill
                  style={{
                    opacity: interpolate(frame, [t.climax, t.climax + TRANSICAO], [1, 0], clampOpt),
                    transform: `scale(${interpolate(frame, [t.climax, t.climax + TRANSICAO], [1, 1.45], { ...clampOpt, easing: Easing.in(Easing.cubic) })})`,
                    filter: frame > t.climax ? `blur(${interpolate(frame, [t.climax, t.climax + TRANSICAO], [0, 8], clampOpt)}px)` : undefined,
                    zIndex: 2,
                  }}
                >
                  <AbsoluteFill style={{ alignItems: "center", paddingTop: 96 }}>
                    <Slam key={pergunta.fala} texto={tx(pergunta.texto)} tempos={pergunta.tempos} tamanho={124} />
                  </AbsoluteFill>
                  <AbsoluteFill style={{ alignItems: "center", paddingTop: 440 }}>
                    <Estouro key={pergunta.fala} at={pergunta.estouro} marca={pergunta.marca} tamanho={320} />
                  </AbsoluteFill>
                </AbsoluteFill>
              ) : null}

              {fase === "climax" ? (
                (() => {
                  // implosão: a órbita encolhe para o centro (aceleração no fim), os ícones somem dentro de um
                  // cadeado grande que cresce no meio — e o flash do logo nasce dele
                  const imp = interpolate(frame, [t.implosao, t.logo], [0, 1], { ...clampOpt, easing: Easing.in(Easing.cubic) });
                  const cad = spring({ frame: frame - t.implosao - 2, fps: 30, config: { damping: 12, stiffness: 220, mass: 0.6 } });
                  return (
                    <AbsoluteFill style={{ opacity: interpolate(frame, [t.climax, t.climax + TRANSICAO], [0, 1], clampOpt) }}>
                      <AbsoluteFill style={{ background: "#000", opacity: imp * 0.45 }} />
                      <AbsoluteFill style={{ opacity: 1 - imp * imp, transform: `scale(${1 - 0.55 * imp})`, transformOrigin: "960px 470px" }}>
                        <Orbit
                          itens={ORBITA.map((m, i) => <TileTrava key={i} marca={m} tranca={t.travas[i]} tamanho={150} />)}
                          cx={960} cy={470} raio={700 * (1 - imp)} achata={0.46} periodo={170} entradas={t.entradas} tamanho={150}
                          corAnel={colors.mint} mostrarAnel={imp < 0.3}
                        />
                      </AbsoluteFill>
                      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
                        <div
                          style={{
                            fontFamily, fontWeight: 800, fontSize: 64, letterSpacing: "0.12em", color: colors.amber,
                            opacity: interpolate(frame, [t.travas[0], t.travas[0] + 4], [0, 1], clampOpt) * (1 - Math.min(1, cad * 1.8)), // sai quando o cadeado entra
                            transform: `scale(${interpolate(frame, [t.travas[0], t.implosao], [1, 1.12], clampOpt) * (1 - 0.4 * imp)})`,
                            textShadow: "0 0 30px rgba(245,200,107,0.35)",
                          }}
                        >
                          TUDO TRANCADO
                        </div>
                      </AbsoluteFill>
                      {frame >= t.implosao ? (
                        <div
                          style={{
                            position: "absolute", left: 960 - 150, top: 470 - 150, width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center",
                            color: colors.amber, transform: `scale(${0.25 + 0.95 * cad})`, opacity: Math.min(1, cad * 1.6),
                            filter: `drop-shadow(0 0 ${30 + 50 * imp}px rgba(245,200,107,${0.5 + 0.4 * imp}))`,
                          }}
                        >
                          <Lock size={230} strokeWidth={2.2} />
                        </div>
                      ) : null}
                    </AbsoluteFill>
                  );
                })()
              ) : null}
            </Glitch>
          ) : (
            <>
              <Fundo tema={fundo("s1", "logo", "escuro")} seed="s1b" />
              <Burst at={t.logo} y={300} n={70} raio={760} />
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
                <LogoRevela at={t.logo} tamanho={300} wordmark={false} arquivo={LOGO_ESCURO} />
              </AbsoluteFill>
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 440 }}>
                <KineticText texto={tx("titulo")} inicio={t.titulo} stagger={4} estilo="cor" tamanho={96} maxLargura={1500} />
              </AbsoluteFill>
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 690 }}>
                <Chip at={t.chip}>
                  {tx("chip")} <Placeholder>{config.NOME_DO_GRUPO}</Placeholder>
                </Chip>
              </AbsoluteFill>
              <AbsoluteFill style={{ alignItems: "center", paddingTop: 800 }}>
                <TypeText texto={sloganCaixaAlta()} inicio={t.slogan} cps={2} style={{ fontFamily, fontWeight: 600, fontSize: 24, letterSpacing: "0.14em", color: colors.mintSoft2 }} />
              </AbsoluteFill>
            </>
          )}
        </CameraRig>
      )}
      <Flash at={t.impacto} dur={2} cor={colors.mint} max={0.9} />
      <Flash at={t.logo} dur={4} cor="#FFFFFF" max={0.75} />
    </AbsoluteFill>
  );
};
