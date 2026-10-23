// Janelas de SILÊNCIO TOTAL pedidas pelas cenas (ex.: S1 abre com 6 q de preto mudo e tem um blackout
// antes do logo). O Mix zera a trilha nelas; as cenas não disparam efeitos dentro delas.
import { cena } from "./timeline";
import type { Derivado } from "./projeto";
import { silenciosS1 } from "../cenas/S1Abertura";

const cache = new WeakMap<Derivado, [number, number][]>();

/** O quadro absoluto `f` cai numa janela de silêncio? (cache por projeto) */
export const silenciado = (d: Derivado, f: number) => {
  let j = cache.get(d);
  if (!j) {
    const ini = cena("s1").from;
    j = silenciosS1().map(([a, b]) => [a + ini, b + ini] as [number, number]);
    cache.set(d, j);
  }
  return j.some(([a, b]) => f >= a && f < b);
};

const RAMPA_SAI = 8; // quadros: a trilha some antes do silêncio (revisão "corte estranho": era cortada de uma vez)
const RAMPA_VOLTA = 6; // quadros: volta depois do silêncio (o impacto cobre o começo)

/** Ganho da trilha (0..1) em volta das janelas de silêncio: rampa de saída, 0 dentro, rampa de volta. */
export const ganhoSilencio = (d: Derivado, f: number) => {
  silenciado(d, f); // garante o cache
  let g = 1;
  for (const [a, b] of cache.get(d)!) {
    if (f >= a && f < b) return 0;
    if (f >= a - RAMPA_SAI && f < a) g = Math.min(g, (a - f) / RAMPA_SAI);
    if (f >= b && f < b + RAMPA_VOLTA) g = Math.min(g, (f - b + 1) / RAMPA_VOLTA);
  }
  return g;
};
