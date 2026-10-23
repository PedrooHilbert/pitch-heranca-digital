// Timeline GUIADA PELO ÁUDIO (PROMPT_V2 §4.3).
// Gerada por `npm run sync` (scripts/sync.mjs → scripts/lib/timeline.mjs) em timeline.json:
// cenas, frases da narração e cada PALAVRA com o frame exato em que é dita.
// As cenas ancoram as animações nas palavras (ex.: o cadeado fecha quando a voz diz "congelado"),
// então regravar a voz e rodar `npm run sync` reajusta tudo sozinho.
import tl from "./timeline.json";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type CenaId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9";
export type Palavra = { w: string; from: number; to: number };
export type FraseTL = {
  id: string;
  cena: CenaId;
  texto: string;
  fonte: string;
  from: number;
  dur: number;
  src: string;
  palavras: Palavra[];
};
export type CenaTL = { id: CenaId; nome: string; tema: string; from: number; dur: number };

type TimelineJSON = {
  fps: number;
  bpm: number;
  framesPerBeat: number;
  fonteVoz: string;
  vozSintetica: string | null;
  nivel: string;
  total: number;
  estourou: boolean;
  cenas: CenaTL[];
  frases: FraseTL[];
};

export const TL = tl as unknown as TimelineJSON;
export const TOTAL_FRAMES = TL.total;

export const cena = (id: CenaId): CenaTL => {
  const c = TL.cenas.find((x) => x.id === id);
  if (!c) throw new Error(`cena ${id} ausente na timeline — rode npm run sync`);
  return c;
};

export const frase = (id: string): FraseTL => {
  const f = TL.frases.find((x) => x.id === id);
  if (!f) throw new Error(`frase ${id} ausente na timeline — rode npm run sync`);
  return f;
};

export const frasesDa = (c: CenaId) => TL.frases.filter((f) => f.cena === c);

const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Frame ABSOLUTO em que a n-ésima palavra que começa com `alvo` é dita na frase.
 * `fim=true` devolve o fim da palavra. Se não achar, devolve o início da frase.
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

/** Ferramentas de tempo LOCAL (relativo ao início da cena), usadas dentro das cenas. */
export const relogio = (c: CenaId) => {
  const C = cena(c);
  return {
    dur: C.dur,
    /** início local da frase */
    ini: (fraseId: string) => frase(fraseId).from - C.from,
    /** fim local da frase */
    fim: (fraseId: string) => frase(fraseId).from + frase(fraseId).dur - C.from,
    /** frame local da palavra (antecipa `antes` quadros: o visual entra antes da voz) */
    em: (fraseId: string, alvo: string, antes = 3, n = 1) => palavra(fraseId, alvo, n) - C.from - antes,
    /** frame local do fim da palavra */
    apos: (fraseId: string, alvo: string, n = 1) => palavra(fraseId, alvo, n, true) - C.from,
  };
};

// Compatibilidade com os nomes da v1
export const TOTAL = TOTAL_FRAMES;
export const timeline = TL.cenas.map((c) => ({ ...c, durationInFrames: c.dur }));
