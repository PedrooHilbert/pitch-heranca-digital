// S7 — Concorrência (≈ 14 s, claro). PROMPT_V2 §5. Comparação CONCEITUAL e honesta (§2 do PROMPT.md).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, X } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { textos, fundo } from "../data/projeto";
import { Fundo } from "../components/v2/Fundo";
import { CameraRig, KineticText, LightSweep } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Marca = "sim" | "parcial" | "nao";

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto.
 *  Marcas de cada linha: "sim", "parcial" ou "nao" para [gerenciadores, legado, Herança Digital]. */
export const PADRAO_S7 = {
  textos: {
    titulo: "Por que não só um *gerenciador* de senhas?",
    col1: "Gerenciadores de senha", col1Sub: "Bitwarden, 1Password",
    col2: "Contatos de legado", col2Sub: "Google · Apple · Meta",
    col3: "Herança Digital", col3Sub: "nossa proposta",
    linha1: "Inventário de todos os ativos", linha1Marcas: "parcial, nao, sim",
    linha2: "Funciona entre plataformas", linha2Marcas: "sim, nao, sim",
    linha3: "Segue o rito legal brasileiro", linha3Marcas: "nao, nao, sim",
    linha4: "Entrega por herdeiro, com auditoria", linha4Marcas: "nao, parcial, sim",
    rodape: "Comparação conceitual — a validar com pesquisa de mercado.",
  },
  fundos: { tabela: "claro" },
  telas: {},
} as const;

const marcas = (txt: string): [Marca, Marca, Marca] => {
  const m = txt.split(",").map((x) => x.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const ok = (x: string): Marca => (x === "sim" || x === "parcial" ? x : "nao");
  return [ok(m[0] ?? ""), ok(m[1] ?? ""), ok(m[2] ?? "")];
};
const LW = 560;
const CW = 300;
const X0 = (1920 - (LW + 3 * CW)) / 2;
const Y0 = 250;
const RH = 104;

const T = () => {
  const r = relogio("s7");
  const a = "s07_01", b = "s07_02", c = "s07_03";
  const col = [r.em(a, "Gerenciadores"), r.em(b, "contatos"), r.em(c, "Herança")];
  const marcas = [r.em(a, "dia"), r.em(b, "legado"), r.em(c, "reúne")];
  return {
    r, col, marcas,
    dim1: r.em(a, "sucessão"),
    dim2: r.em(b, "própria"),
    brilho: r.em(c, "tudo"),
    sweep: r.em(c, "lugar"),
    rito: r.em(c, "rito"),
  };
};

const tempoMarca = (t: ReturnType<typeof T>, ci: number, li: number) => t.marcas[ci] + li * (ci === 2 ? 7 : 6);

export const sfxS7 = (): Cue[] => {
  const t = T();
  const out: Cue[] = [];
  t.col.forEach((f) => out.push({ f, som: "whoosh_short" }));
  [0, 1, 2].forEach((ci) => [0, 1, 2, 3].forEach((li) => out.push({ f: tempoMarca(t, ci, li), som: ci === 2 ? "thunk" : "lock_click", ganho: ci === 2 ? undefined : 0.12 })));
  out.push({ f: t.brilho, som: "chime_ok" }, { f: t.sweep, som: "whoosh_long" });
  return out;
};

const IconeMarca: React.FC<{ m: Marca; at: number }> = ({ m, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 300, mass: 0.6 } });
  const bg = m === "sim" ? colors.greenBg : m === "nao" ? "#ECEDEB" : colors.amberBg;
  return (
    <div style={{ width: 58, height: 58, borderRadius: 999, background: bg, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${2.2 - 1.2 * s}) rotate(${(1 - s) * -20}deg)`, opacity: Math.min(1, s * 2) }}>
      {m === "sim" ? <Check size={34} strokeWidth={3.4} color={colors.green} /> : m === "nao" ? <X size={30} strokeWidth={3} color={colors.ink3} /> : (
        <svg width={32} height={32} viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} fill="none" stroke={colors.amber} strokeWidth={2.6} /><path d="M12 3 A9 9 0 0 1 12 21 Z" fill={colors.amber} /></svg>
      )}
    </div>
  );
};

export const S7Concorrencia: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s7");
  const LINHAS = [1, 2, 3, 4].map((k) => ({ t: tx(`linha${k}`), m: marcas(tx(`linha${k}Marcas`)) }));
  const COLS = [1, 2, 3].map((k) => ({ t: tx(`col${k}`), s: tx(`col${k}Sub`) }));
  const dim = (ci: number) => (ci === 0 ? interpolate(frame, [t.dim1, t.dim1 + 10], [0, 0.55], clampOpt) : ci === 1 ? interpolate(frame, [t.dim2, t.dim2 + 10], [0, 0.55], clampOpt) : 0);
  const brilho = spring({ frame: frame - t.brilho, fps, config: { damping: 14, stiffness: 160 } });

  return (
    <AbsoluteFill>
      <CameraRig
        dur={dur} zoom={[1, 1.06]} panX={[30, -30]}
        socos={[...t.col, ...t.marcas, t.dim1, t.dim2, t.brilho, t.rito].map((at) => ({ at, para: 1.035, dur: 10 }))}
      >
        <Fundo tema={fundo("s7", "tabela", "claro")} seed="s7" />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
          <KineticText texto={tx("titulo")} inicio={2} stagger={3} cor={colors.ink} tamanho={58} />
        </AbsoluteFill>

        {/* coluna Herança Digital com brilho e borda */}
        <div style={{ position: "absolute", left: X0 + LW + 2 * CW, top: Y0 - 14, width: CW, height: 96 + 4 * RH + 20, borderRadius: 22, background: colors.tealTint, border: `3px solid ${colors.teal700}`, opacity: interpolate(frame, [t.col[2], t.col[2] + 8], [0, 1], clampOpt), boxShadow: `0 0 ${50 * brilho}px rgba(47,167,154,${0.55 * brilho})`, overflow: "hidden" }}>
          <LightSweep at={t.sweep} dur={20} largura={140} />
        </div>

        {COLS.map((c, ci) => {
          const o = interpolate(frame, [t.col[ci], t.col[ci] + 8], [0, 1], clampOpt);
          return (
            <div key={ci} style={{ position: "absolute", left: X0 + LW + ci * CW, top: Y0, width: CW, textAlign: "center", opacity: o * (1 - dim(ci)), transform: `translateY(${(1 - o) * -20}px)` }}>
              <div style={{ fontFamily, fontWeight: 800, fontSize: 26, color: ci === 2 ? colors.teal700 : colors.ink, lineHeight: 1.15 }}>{c.t}</div>
              <div style={{ fontFamily, fontWeight: 600, fontSize: 17, color: colors.ink3, marginTop: 4 }}>{c.s}</div>
            </div>
          );
        })}

        {LINHAS.map((l, li) => {
          const o = interpolate(frame, [4 + li * 5, 12 + li * 5], [0, 1], clampOpt);
          const destacada = li === 2 && frame >= t.rito;
          return (
            <div key={li} style={{ position: "absolute", left: X0, top: Y0 + 96 + li * RH, width: LW + 3 * CW, height: RH, display: "flex", alignItems: "center", borderTop: `1px solid ${colors.cardBorder}`, opacity: o, transform: `translateX(${(1 - o) * -40}px)` }}>
              <div style={{ width: LW, fontFamily, fontWeight: 700, fontSize: 28, color: colors.ink, background: destacada ? colors.mint : "transparent", borderRadius: 10, padding: destacada ? "4px 12px" : 0, marginRight: 20 }}>{l.t}</div>
              {l.m.map((m, ci) => (
                <div key={ci} style={{ width: CW, display: "flex", justifyContent: "center", opacity: 1 - dim(ci) }}>
                  <IconeMarca m={m} at={tempoMarca(t, ci, li)} />
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ position: "absolute", top: Y0 + 96 + 4 * RH + 34, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 600, fontSize: 20, color: colors.ink3 }}>
          {tx("rodape")}
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};
