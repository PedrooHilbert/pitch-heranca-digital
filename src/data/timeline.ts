// Tempos do vídeo, lidos do projeto (project.json) — PROMPT_V3 §Fase 1.
// Cenas, falas e cada PALAVRA com o quadro em que é dita. As animações das cenas se ancoram nas
// palavras (ex.: o cofre congela quando a voz diz "congelado"): regravar a voz e rodar `npm run sync`
// reajusta tudo; mudar a duração de uma cena no editor desloca as cenas seguintes.
import { derivado, type CenaAbs, type FraseAbs, type PalavraAbs } from "./projeto";
import type { CenaId } from "./schema";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type { CenaId };
export type Palavra = PalavraAbs;
export type FraseTL = FraseAbs;
export type CenaTL = CenaAbs;

export const total = () => derivado().total;
export const cenas = () => derivado().cenas;
export const frases = () => derivado().frases;

export const cena = (id: CenaId): CenaTL => {
  const c = derivado().cenas.find((x) => x.id === id);
  if (!c) throw new Error(`cena ${id} ausente no projeto`);
  return c;
};

export const frase = (id: string): FraseTL => {
  const f = derivado().frases.find((x) => x.id === id);
  if (!f) throw new Error(`fala ${id} ausente no projeto — rode npm run sync`);
  return f;
};

export const frasesDa = (c: CenaId) => derivado().frases.filter((f) => f.cena === c);

const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Quadro ABSOLUTO em que a n-ésima palavra que começa com `alvo` é dita na fala.
 * `fim=true` devolve o fim da palavra. Se não achar, devolve o início da fala.
 */
export const palavra = (fraseId: string, alvo: string, n = 1, fim = false): number => {
  const f = frase(fraseId);
  const a = norm(alvo);
  let k = 0;
  for (const p of f.palavras) {
    if (norm(p.w).startsWith(a)) {
      k++;
      if (k === n) return fim ? p.to : p.from;
    }
  }
  return f.from;
};

/** Tempo LOCAL (relativo ao início da cena), usado dentro das cenas. */
export const relogio = (c: CenaId) => {
  const C = cena(c);
  return {
    dur: C.dur,
    /** início local da fala */
    ini: (fraseId: string) => frase(fraseId).from - C.from,
    /** fim local da fala */
    fim: (fraseId: string) => frase(fraseId).from + frase(fraseId).dur - C.from,
    /** quadro local da palavra (antecipa `antes` quadros: o visual entra antes da voz) */
    em: (fraseId: string, alvo: string, antes = 3, n = 1) => palavra(fraseId, alvo, n) - C.from - antes,
    /** quadro local do fim da palavra */
    apos: (fraseId: string, alvo: string, n = 1) => palavra(fraseId, alvo, n, true) - C.from,
  };
};
