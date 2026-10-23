// Lista ÚNICA de disparos de efeitos sonoros (PROMPT_V2 §6.2), derivada dos MESMOS tempos
// que as cenas usam para animar (cada cena exporta sfxSx() a partir da sua função de tempos).
// Para ajustar um som, ajuste o evento na cena — o som acompanha.
import { cena, CenaId } from "./timeline";
import type { Cue } from "./sfx";
import { sfxS1 } from "../cenas/S1Abertura";
import { sfxS2 } from "../cenas/S2Problema";
import { sfxS3 } from "../cenas/S3Proposta";
import { sfxS4 } from "../cenas/S4ComoFunciona";
import { sfxS5 } from "../cenas/S5Demo";
import { sfxS6 } from "../cenas/S6Seguranca";
import { sfxS7 } from "../cenas/S7Concorrencia";
import { sfxS8 } from "../cenas/S8Modelo";
import { sfxS9 } from "../cenas/S9Fechamento";
import { sfxTransicoes } from "../components/v2/Transicoes";

const POR_CENA: [CenaId, () => Cue[]][] = [
  ["s1", sfxS1], ["s2", sfxS2], ["s3", sfxS3], ["s4", sfxS4], ["s5", sfxS5],
  ["s6", sfxS6], ["s7", sfxS7], ["s8", sfxS8], ["s9", sfxS9],
];

export const SFX_CUES: Cue[] = (() => {
  const out: Cue[] = [];
  for (const [id, fn] of POR_CENA) {
    const c = cena(id);
    for (const q of fn()) {
      if (q.f < -40 || q.f > c.dur + 20) continue;
      out.push({ ...q, f: q.f + c.from });
    }
  }
  out.push(...sfxTransicoes());
  // "tick" no máximo 1 a cada 3 quadros (§6.2)
  const ord = out.sort((a, b) => a.f - b.f);
  let ultimoTick = -99;
  return ord.filter((q) => {
    if (q.som !== "tick" && q.som !== "type") return true;
    if (q.f - ultimoTick < 3) return false;
    ultimoTick = q.f;
    return true;
  });
})();
