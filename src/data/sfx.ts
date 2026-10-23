// Catálogo de efeitos sonoros (PROMPT_V2 §6.2). Gerados por scripts/make_sfx.py em public/audio/sfx/.
// Ganhos lineares: SFX ≈ −14 a −18 dB; impactos até −10 dB (§6.4).
export type Som =
  | "whoosh_short" | "whoosh_long" | "pop" | "lock_click" | "thunk" | "impact_low" | "riser"
  | "tick" | "chime_ok" | "type" | "ping" | "shutter" | "glitch_zap" | "rewind" | "stinger_logo";

/** Um disparo de som. `f` = frame do EVENTO VISUAL (o mixer antecipa 2–3 quadros). */
export type Cue = { f: number; som: Som; ganho?: number };

const dB = (x: number) => Math.pow(10, x / 20);

export const GANHO: Record<Som, number> = {
  whoosh_short: dB(-17), whoosh_long: dB(-16), pop: dB(-17), lock_click: dB(-15), thunk: dB(-14),
  impact_low: dB(-11), riser: dB(-17), tick: dB(-21), chime_ok: dB(-16), type: dB(-22), ping: dB(-17),
  shutter: dB(-15), glitch_zap: dB(-17), rewind: dB(-15), stinger_logo: dB(-12),
};

/** Duração aproximada (s) de cada som — usada para posicionar o riser e dimensionar a Sequence. */
export const DURACAO: Record<Som, number> = {
  whoosh_short: 0.35, whoosh_long: 0.8, pop: 0.18, lock_click: 0.2, thunk: 0.3, impact_low: 1.1, riser: 1.5,
  tick: 0.05, chime_ok: 0.6, type: 0.06, ping: 0.5, shutter: 0.25, glitch_zap: 0.25, rewind: 0.9, stinger_logo: 2.2,
};

/** Quantos quadros o som "antecipa" a imagem (som antecipa imagem — §6.1). */
export const ANTECIPA: Partial<Record<Som, number>> = { riser: Math.round(1.5 * 30) - 2, whoosh_long: 8, whoosh_short: 3 };
