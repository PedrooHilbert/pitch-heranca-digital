// Projeto em tempo de execução (PROMPT_V3 §Fase 1).
// A composição recebe o projeto (project.json) como props e chama setProjeto() antes de renderizar
// as cenas; tudo o que é derivado (tempos absolutos, legendas, efeitos) é calculado daqui, com cache
// por referência — editar no Studio/Estúdio de Revisão gera um objeto novo e tudo recalcula.
import base from "./project.json";
import type { Projeto, CenaId, TemaFundo } from "./schema";

let atual: Projeto = base as unknown as Projeto;

export const setProjeto = (p: Projeto) => {
  atual = p;
};
export const getProjeto = (): Projeto => atual;
export const projetoBase = base as unknown as Projeto;

export type PalavraAbs = { w: string; from: number; to: number };
export type CenaAbs = { id: CenaId; nome: string; from: number; dur: number; tema: TemaFundo };
export type FraseAbs = { id: string; cena: CenaId; texto: string; fonte: string; from: number; dur: number; src: string; palavras: PalavraAbs[] };
export type LegendaAbs = { id: string; fraseId: string; cena: CenaId; from: number; to: number; palavras: PalavraAbs[] };
export type SfxAbs = { id: string; f: number; som: string; ganhoDb: number };

export type Derivado = {
  total: number;
  cenas: CenaAbs[];
  frases: FraseAbs[];
  legendas: LegendaAbs[];
  sfx: SfxAbs[];
  inicioDe: Record<CenaId, number>;
};

const cache = new WeakMap<Projeto, Derivado>();

export const derivado = (p: Projeto = atual): Derivado => {
  const em = cache.get(p);
  if (em) return em;
  const inicioDe = {} as Record<CenaId, number>;
  let acc = 0;
  const cenas = p.cenas.map((c) => {
    inicioDe[c.id] = acc;
    const r: CenaAbs = { id: c.id, nome: c.nome, from: acc, dur: c.dur, tema: (Object.values(c.fundos)[0] ?? "claro") as TemaFundo };
    acc += c.dur;
    return r;
  });
  const abs = (cena: CenaId, q: number) => inicioDe[cena] + q;
  const frases = p.frases.map((f) => ({
    id: f.id, cena: f.cena, texto: f.texto, fonte: f.fonte, src: f.src, dur: f.dur,
    from: abs(f.cena, f.inicio),
    palavras: f.palavras.map((w) => ({ w: w.w, from: abs(f.cena, w.de), to: abs(f.cena, w.ate) })),
  }));
  const legendas = p.legendas.map((l) => ({
    id: l.id, fraseId: l.fraseId, cena: l.cena, from: abs(l.cena, l.de), to: abs(l.cena, l.ate),
    palavras: l.palavras.map((w) => ({ w: w.w, from: abs(l.cena, w.de), to: abs(l.cena, w.ate) })),
  }));
  const sfx = p.sfx.map((s) => ({ id: s.id, f: abs(s.cena, s.frame), som: s.som, ganhoDb: s.ganhoDb })).sort((a, b) => a.f - b.f);
  const d: Derivado = { total: acc, cenas, frases, legendas, sfx, inicioDe };
  cache.set(p, d);
  return d;
};

/** Textos de uma cena: tx("s2")("semLista"). Chave ausente = erro visível (nada some em silêncio). */
export const textos = (cena: CenaId) => {
  const c = atual.cenas.find((x) => x.id === cena);
  return (chave: string): string => c?.textos[chave] ?? `⟦${cena}.${chave}⟧`;
};

/** Fundo de um bloco da cena. */
export const fundo = (cena: CenaId, bloco: string, padrao: TemaFundo = "claro"): TemaFundo =>
  (atual.cenas.find((x) => x.id === cena)?.fundos[bloco] as TemaFundo | undefined) ?? padrao;

/** Tela + recorte de um plano da cena. */
export const telaDe = (cena: CenaId, plano: string, padrao: { tela: string; regioes: number[] }) =>
  atual.cenas.find((x) => x.id === cena)?.telas[plano] ?? padrao;
