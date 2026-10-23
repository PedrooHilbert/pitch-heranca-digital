// Tipografia cinética e números vivos (PROMPT_V2 §3): KineticText, ScrambleText, Counter, Roleta, TypeText.
import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../data/theme";
import { fontFamily } from "../../fonts";

export const MOLA = { damping: 14, stiffness: 180, mass: 0.7 }; // overshoot ~5%
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const normW = (w: string) =>
  w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

type KTProps = {
  texto: string;
  inicio: number;
  /** quadros entre palavras (se `tempos` não for dado) */
  stagger?: number;
  /** frame local de entrada de cada palavra (ex.: sincronizado com a voz) */
  tempos?: number[];
  /** frame local de saída (palavras sobem e somem) */
  fim?: number;
  /** palavras (sem acento/pontuação) que recebem destaque */
  destaque?: string[];
  estilo?: "caixa" | "cor";
  cor?: string;
  corDestaque?: string;
  caixaCor?: string;
  caixaTexto?: string;
  tamanho?: number;
  peso?: number;
  alinhar?: "center" | "left";
  maxLargura?: number;
  entreLinhas?: number;
  style?: React.CSSProperties;
};

/** Palavra por palavra: máscara + subida com mola, desfoque de movimento, destaque em caixa/cor. */
export const KineticText: React.FC<KTProps> = ({
  texto, inicio, stagger = 5, tempos, fim, destaque = [], estilo = "caixa",
  cor = colors.white, corDestaque = colors.mint, caixaCor = colors.mint, caixaTexto = colors.teal900,
  tamanho = 84, peso = 800, alinhar = "center", maxLargura = 1500, entreLinhas = 1.08, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // *palavra* (ou *várias palavras*) no texto = destaque; os asteriscos não aparecem.
  let dentro = false;
  const itens = texto.split(/\s+/).filter(Boolean).map((tok) => {
    let t = tok;
    let d = dentro;
    if (t.startsWith("*")) {
      d = true;
      dentro = true;
      t = t.slice(1);
    }
    const fecha = /\*([.,!?…:;]*)$/.exec(t);
    if (fecha) {
      t = t.slice(0, fecha.index) + fecha[1];
      dentro = false;
      d = true;
    }
    return { t, d };
  });
  const palavras = itens.map((x) => x.t);
  const dest = new Set(destaque.map(normW));
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", justifyContent: alinhar === "center" ? "center" : "flex-start",
        columnGap: tamanho * 0.26, rowGap: tamanho * 0.06, maxWidth: maxLargura,
        fontFamily, fontWeight: peso, fontSize: tamanho, lineHeight: entreLinhas, letterSpacing: "-0.02em",
        color: cor, ...style,
      }}
    >
      {palavras.map((p, i) => {
        const t0 = tempos?.[i] ?? inicio + i * stagger;
        const s = spring({ frame: frame - t0, fps, config: MOLA });
        const blur = interpolate(frame - t0, [0, 3, 8], [8, 3, 0], clampOpt);
        const sai = fim != null ? interpolate(frame, [fim + i * 1, fim + i * 1 + 7], [0, 1], clampOpt) : 0;
        const ehDest = itens[i].d || dest.has(normW(p));
        const caixa = ehDest && estilo === "caixa" ? spring({ frame: frame - t0 - 4, fps, config: { damping: 18, stiffness: 160 } }) : 0;
        if (frame < t0 - 1) return <span key={i} style={{ opacity: 0 }}>{p}</span>;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.04em 0.06em", margin: "-0.04em -0.06em" }}>
            <span
              style={{
                display: "inline-block", position: "relative",
                transform: `translateY(${(1 - s) * 105 - sai * 60}%) scale(${0.92 + s * 0.08})`,
                opacity: 1 - sai, filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                color: ehDest ? (estilo === "caixa" ? caixaTexto : corDestaque) : cor,
              }}
            >
              {ehDest && estilo === "caixa" ? (
                <span
                  style={{
                    position: "absolute", left: "-0.12em", right: "-0.12em", top: "0.06em", bottom: "0.02em",
                    background: caixaCor, borderRadius: "0.12em", transformOrigin: "left center",
                    transform: `scaleX(${caixa})`, zIndex: -1,
                  }}
                />
              ) : null}
              <span style={{ position: "relative" }}>{p}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

const GLIFOS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@*+=?";
/** Texto que embaralha/decifra (cena de criptografia). modo "cifrar": legível → lixo. */
export const ScrambleText: React.FC<{
  texto: string; inicio: number; dur?: number; modo?: "decifrar" | "cifrar"; seed?: string; style?: React.CSSProperties;
}> = ({ texto, inicio, dur = 24, modo = "decifrar", seed = "s", style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [inicio, inicio + dur], [0, 1], clampOpt);
  const passo = Math.floor(frame / 2);
  const chars = texto.split("").map((ch, i) => {
    if (ch === " ") return " ";
    const limiar = i / Math.max(1, texto.length);
    const legivel = modo === "decifrar" ? p > limiar : p < limiar;
    if (legivel) return ch;
    return GLIFOS[Math.floor(random(`${seed}-${i}-${passo}`) * GLIFOS.length)];
  });
  return <span style={{ fontFamily: "monospace", whiteSpace: "pre", ...style }}>{chars.join("")}</span>;
};

/** Número que rola até o valor (nunca aparece pronto), com desfoque de movimento e "pop" no fim. */
export const Counter: React.FC<{
  de?: number; ate: number; inicio: number; dur?: number; formato?: (n: number) => string; style?: React.CSSProperties;
}> = ({ de = 0, ate, inicio, dur = 27, formato = (n) => String(Math.round(n)), style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [inicio, inicio + dur], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  const v = de + (ate - de) * p;
  const vel = Math.abs(interpolate(frame, [inicio, inicio + dur], [1, 0], clampOpt));
  const pop = spring({ frame: frame - inicio - dur, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const escala = frame >= inicio + dur ? 1 + (1 - pop) * 0.18 : 1;
  return (
    <span
      style={{
        display: "inline-block", fontVariantNumeric: "tabular-nums", transform: `scale(${escala})`,
        filter: vel > 0.15 && frame >= inicio ? `blur(${vel * 2.2}px)` : undefined,
        opacity: frame < inicio ? 0 : 1, ...style,
      }}
    >
      {formato(v)}
    </span>
  );
};

/** Roleta vertical que percorre valores (ex.: 15 → 30 → 60 → 90) e para no último/escolhido. */
export const Roleta: React.FC<{
  valores: string[]; tempos: number[]; altura: number; style?: React.CSSProperties; itemStyle?: (ativo: boolean) => React.CSSProperties;
}> = ({ valores, tempos, altura, style, itemStyle }) => {
  const frame = useCurrentFrame();
  let pos = 0;
  tempos.forEach((t, i) => {
    pos += interpolate(frame, [t, t + 8], [0, i === 0 ? 0 : 1], { ...clampOpt, easing: Easing.out(Easing.back(1.6)) });
  });
  const ativo = Math.round(pos);
  const moving = tempos.some((t) => frame > t && frame < t + 8);
  return (
    <div style={{ height: altura, overflow: "hidden", position: "relative", ...style }}>
      <div style={{ transform: `translateY(${-pos * altura}px)`, filter: moving ? "blur(1.6px)" : undefined }}>
        {valores.map((v, i) => (
          <div key={i} style={{ height: altura, display: "flex", alignItems: "center", justifyContent: "center", ...(itemStyle?.(i === ativo) ?? {}) }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Digitação com cursor piscando. */
export const TypeText: React.FC<{ texto: string; inicio: number; cps?: number; cursor?: boolean; style?: React.CSSProperties }> = ({
  texto, inicio, cps = 1.4, cursor = true, style,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor((frame - inicio) * cps));
  const done = n >= texto.length;
  const pisca = Math.floor(frame / 8) % 2 === 0;
  if (frame < inicio) return <span style={{ ...style, opacity: 0 }}>{texto}</span>;
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {texto.slice(0, n)}
      {cursor && (!done || pisca) ? <span style={{ opacity: 0.85 }}>▍</span> : null}
    </span>
  );
};
