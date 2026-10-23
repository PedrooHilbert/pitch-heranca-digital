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
