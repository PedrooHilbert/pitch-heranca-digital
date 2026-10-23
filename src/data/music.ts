// Grade rítmica do vídeo (PROMPT_V2 §2 + medição da ref2 em docs/RECEITA_DE_MOVIMENTO.md).
// Medido: ref2 ≈ 112,3 BPM → 16,02 quadros/batida. Usamos 112,5 BPM = 16 quadros EXATOS.
// Se trocar a trilha por uma com outro BPM, mude aqui e rode `npm run sync`.
// (Prefira BPM com número inteiro de quadros: 100 → 18 q, 112,5 → 16 q, 120 → 15 q, 150 → 12 q.)
export const FPS = 30;
export const BPM = 112.5;
export const framesPerBeat = (FPS * 60) / BPM; // 16 quadros = 0,533 s
export const halfBeat = framesPerBeat / 2; // 8 quadros

/** Arredonda um frame para a grade (padrão: batida inteira). */
export const snap = (frame: number, grid = framesPerBeat) =>
  Math.round(frame / grid) * grid;

/** Arredonda PARA CIMA para a grade. */
export const snapUp = (frame: number, grid = framesPerBeat) =>
  Math.ceil(frame / grid) * grid;

/** Frame da n-ésima batida a partir de `from`. */
export const beat = (n: number, from = 0) => from + Math.round(n * framesPerBeat);
