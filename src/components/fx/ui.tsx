// Interface do protótipo animada (PROMPT_V2 §3): UIBlock, ScreenAssembly, Cursor.
// Usa public/screens/regions.json (retângulos em px LÓGICOS, medidos no DOM; os PNGs são 2×).
import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import regions from "../../../public/screens/regions.json";
import { colors } from "../../data/theme";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Regiao = { tag: string; label: string; x: number; y: number; w: number; h: number };
type Tela = { logical_size: [number, number]; regions: Regiao[] };
const R = regions as unknown as Record<string, Tela>;

export const tela = (nome: string): Tela => {
  const t = R[nome.endsWith(".png") ? nome : `${nome}.png`];
  if (!t) throw new Error(`tela ${nome} não está em regions.json`);
  return t;
};
export const regiao = (nome: string, r: number | string): Regiao => {
  const t = tela(nome);
  if (typeof r === "number") return t.regions[r];
  const achou = t.regions.find((g) => g.label.toLowerCase().startsWith(r.toLowerCase()));
  if (!achou) throw new Error(`região "${r}" não encontrada em ${nome}`);
  return achou;
};
const src = (nome: string) => staticFile(`screens/${nome.replace(/\.png$/, "")}.png`);

type Pop = { at: number; ate?: number; escala?: number };

/** Recorta UMA região real de uma tela e anima a entrada (sobe + escala + desfoque). */
export const UIBlock: React.FC<{
  tela: string;
  regiao: number | string;
  escala: number;
  x?: number;
  y?: number;
  inicio: number;
  entrada?: "sobe" | "zoom" | "esquerda" | "direita" | "nenhuma";
  raio?: number;
  sombra?: boolean;
  pop?: Pop;
  margem?: number;
  style?: React.CSSProperties;
}> = ({ tela: nome, regiao: r, escala, x = 0, y = 0, inicio, entrada = "sobe", raio = 14, sombra = true, pop, margem = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tela(nome);
  const g = regiao(nome, r);
  const gx = Math.max(0, g.x - margem);
  const gy = Math.max(0, g.y - margem);
  const gw = Math.min(t.logical_size[0] - gx, g.w + margem * 2);
  const gh = Math.min(t.logical_size[1] - gy, g.h + margem * 2);
  const s = spring({ frame: frame - inicio, fps, config: { damping: 14, stiffness: 170, mass: 0.75 } });
  const blur = interpolate(frame - inicio, [0, 4, 10], [8, 3, 0], clampOpt);
  const off = (1 - s) * 70;
  const tr =
    entrada === "sobe" ? `translateY(${off}px) scale(${0.94 + 0.06 * s})`
      : entrada === "zoom" ? `scale(${0.6 + 0.4 * s})`
        : entrada === "esquerda" ? `translateX(${-off * 2}px)`
          : entrada === "direita" ? `translateX(${off * 2}px)`
            : "none";
  const p = pop ? spring({ frame: frame - pop.at, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } }) : 0;
  const pFim = pop?.ate != null ? interpolate(frame, [pop.ate, pop.ate + 8], [1, 0], clampOpt) : 1;
  const popK = frame >= (pop?.at ?? Infinity) ? p * pFim : 0;
  const popEsc = 1 + popK * ((pop?.escala ?? 1.06) - 1);
  if (entrada !== "nenhuma" && frame < inicio - 1) return null;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: gw * escala, height: gh * escala, overflow: "hidden",
        borderRadius: raio, opacity: entrada === "nenhuma" ? 1 : Math.min(1, s * 1.4),
        transform: `${tr} scale(${popEsc})`, filter: blur > 0.2 && entrada !== "nenhuma" ? `blur(${blur}px)` : undefined,
        boxShadow: sombra
          ? `0 ${18 + popK * 22}px ${44 + popK * 40}px rgba(11,63,61,${0.18 + popK * 0.22})${popK > 0 ? `, 0 0 0 ${3 * popK}px ${colors.mint}` : ""}`
          : undefined,
        zIndex: popK > 0 ? 20 : 1,
        ...style,
      }}
    >
      <Img
        src={src(nome)}
        style={{ position: "absolute", left: -gx * escala, top: -gy * escala, width: t.logical_size[0] * escala, height: t.logical_size[1] * escala, maxWidth: "none" }}
      />
    </div>
  );
};

/**
 * A tela se MONTA bloco a bloco (regiões reais entram em cascata) e depois a captura inteira
 * aparece por baixo (sem emendas). `pop` destaca um bloco enquanto o resto escurece.
 */
export const ScreenAssembly: React.FC<{
  tela: string;
  largura: number;
  altura?: number;
  inicio: number;
  ordem: number[];
  stagger?: number;
  pops?: { regiao: number; at: number; ate?: number; escala?: number }[];
  /** rolagem vertical em px LÓGICOS: [de, até] entre os frames [f0, f1] */
  rolagem?: { de: number; ate: number; f0: number; f1: number };
  raio?: number;
}> = ({ tela: nome, largura, altura, inicio, ordem, stagger = 8, pops = [], rolagem, raio = 18 }) => {
  const frame = useCurrentFrame();
  const t = tela(nome);
  const esc = largura / t.logical_size[0];
  const h = altura ?? t.logical_size[1] * esc;
  const montada = inicio + ordem.length * stagger + 10;
  const fundo = interpolate(frame, [montada, montada + 10], [0, 1], clampOpt);
  const sy = rolagem
    ? interpolate(frame, [rolagem.f0, rolagem.f1], [rolagem.de, rolagem.ate], { ...clampOpt, easing: Easing.inOut(Easing.cubic) })
    : 0;
  const popAtivo = pops.find((p) => frame >= p.at && (p.ate == null || frame < p.ate + 8));
  const dim = popAtivo
    ? interpolate(frame, [popAtivo.at, popAtivo.at + 8], [0, 0.55], clampOpt) *
      (popAtivo.ate != null ? interpolate(frame, [popAtivo.ate, popAtivo.ate + 8], [1, 0], clampOpt) : 1)
    : 0;
  return (
    <div style={{ position: "relative", width: largura, height: h, overflow: "hidden", borderRadius: raio, background: colors.bg }}>
      <div style={{ position: "absolute", left: 0, top: -sy * esc, width: largura, height: t.logical_size[1] * esc }}>
        <Img src={src(nome)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fundo }} />
        {ordem.map((ri, k) => {
          const g = t.regions[ri];
          return <UIBlock key={ri} tela={nome} regiao={ri} escala={esc} x={g.x * esc} y={g.y * esc} inicio={inicio + k * stagger} raio={10} sombra={fundo < 0.9} />;
        })}
        {dim > 0 ? <div style={{ position: "absolute", inset: 0, background: `rgba(7,48,47,${dim})`, zIndex: 15 }} /> : null}
        {popAtivo ? (() => {
          const g = t.regions[popAtivo.regiao];
          return (
            <UIBlock tela={nome} regiao={popAtivo.regiao} escala={esc} x={g.x * esc} y={g.y * esc} inicio={0} entrada="nenhuma"
              pop={{ at: popAtivo.at, ate: popAtivo.ate, escala: popAtivo.escala ?? 1.05 }} raio={12} style={{ zIndex: 20 }} />
          );
        })() : null}
      </div>
    </div>
  );
};

export type PontoCursor = { f: number; x: number; y: number };

/** Cursor com trajeto em CURVA, estado "pressionado" e onda no clique. */
export const Cursor: React.FC<{ pontos: PontoCursor[]; cliques?: number[]; escala?: number }> = ({ pontos, cliques = [], escala = 1 }) => {
  const frame = useCurrentFrame();
  if (frame < pontos[0].f - 4) return null;
  let x = pontos[0].x;
  let y = pontos[0].y;
  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = interpolate(frame, [a.f, b.f], [0, 1], { ...clampOpt, easing: Easing.inOut(Easing.cubic) });
      const cx = (a.x + b.x) / 2 - (b.y - a.y) * 0.25;
      const cy = (a.y + b.y) / 2 + (b.x - a.x) * 0.25;
      x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t ** 2 * b.x;
      y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t ** 2 * b.y;
    } else if (frame > b.f) {
      x = b.x;
      y = b.y;
    }
  }
  const aparece = interpolate(frame, [pontos[0].f - 4, pontos[0].f], [0, 1], clampOpt);
  let press = 0;
  const ondas: React.ReactNode[] = [];
  for (const c of cliques) {
    press = Math.max(press, interpolate(frame, [c - 2, c, c + 5], [0, 1, 0], clampOpt));
    for (const d of [0, 5]) {
      const k = frame - c - d;
      if (k >= 0 && k < 16) {
        const r = interpolate(k, [0, 16], [6, 46]);
        ondas.push(
          <div key={`${c}-${d}`} style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `3px solid ${colors.teal600}`, opacity: 1 - k / 16 }} />,
        );
      }
    }
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 50, opacity: aparece, transform: `scale(${escala})`, transformOrigin: "0 0" }}>
      {ondas}
      <svg width={44} height={44} viewBox="0 0 24 24" style={{ transform: `translate(-6px,-3px) scale(${1 - press * 0.18})`, transformOrigin: "6px 3px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.35))" }}>
        <path d="M5 3l14 7.5-6.2 1.6L9.5 19 5 3z" fill={colors.ink} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Cartão de "vidro" para widgets flutuantes. */
export const vidro = (escuro = false): React.CSSProperties => ({
  background: escuro ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.92)",
  border: escuro ? "1px solid rgba(127,209,197,0.32)" : `1px solid ${colors.cardBorder}`,
  borderRadius: 22,
  boxShadow: escuro ? "0 20px 50px rgba(0,0,0,.35)" : "0 22px 56px rgba(11,63,61,.18)",
  backdropFilter: "blur(6px)",
});
