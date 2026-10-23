// Gera os disparos de efeitos sonoros a partir dos MESMOS tempos que as cenas usam para animar
// (cada cena exporta sfxSx()). Usado pelo `npm run sync` para preencher project.json → sfx
// (efeitos marcados como `manual: true` no editor são preservados). Em tempo de render o Mix lê project.json.
import { cena, cenas, type CenaId } from "./timeline";
import { GANHO, type Cue } from "./sfx";
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

const db = (g: number) => Math.round(20 * Math.log10(g) * 10) / 10;

/** Disparos em tempo LOCAL de cada cena (formato do project.json). */
export function gerarCues() {
  const abs: Cue[] = [];
  for (const [id, fn] of POR_CENA) {
    const c = cena(id);
    for (const q of fn()) {
      if (q.f < -40 || q.f > c.dur + 20) continue;
      abs.push({ ...q, f: q.f + c.from });
    }
  }
  abs.push(...sfxTransicoes());
  const ord = abs.sort((a, b) => a.f - b.f);
  // "tick"/"type" no máximo 1 a cada 3 quadros (§6.2)
  let ultimo = -99;
  const filtrados = ord.filter((q) => {
    if (q.som !== "tick" && q.som !== "type") return true;
    if (q.f - ultimo < 3) return false;
    ultimo = q.f;
    return true;
  });
  const lista = cenas();
  return filtrados.map((q, i) => {
    const f = Math.max(0, q.f);
    const c = lista.find((x) => f >= x.from && f < x.from + x.dur) ?? lista[lista.length - 1];
    return { id: `x${String(i + 1).padStart(3, "0")}`, cena: c.id, frame: q.f - c.from, som: q.som, ganhoDb: db(q.ganho ?? GANHO[q.som]) };
  });
}
