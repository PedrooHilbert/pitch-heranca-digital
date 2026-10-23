// Estima quanto a narração inteira dura num nível de expressividade (sem mexer no vídeo):
//   node scripts/voz-estimar.mjs 0.75   → sintetiza as 34 frases em scripts/.cache/estimar-<nível>/ e soma as durações
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { P, carregarNarracao, carregarPronuncia, carregarConfig, carregarVoz, gravarJSON, duracao } from "./lib/projeto.mjs";
import { carregarEntonacao, planejar } from "./lib/expressiva.mjs";

const nivel = parseFloat(process.argv[2] ?? "0.75");
const DIR = P("scripts", ".cache", `estimar-${nivel}`);
fs.mkdirSync(DIR, { recursive: true });
const NARR = await carregarNarracao();
const ENT = await carregarEntonacao();
const VOZ = await carregarVoz();
const PRON = await carregarPronuncia();
const GRUPO = (await carregarConfig()).NOME_DO_GRUPO;
const plano = NARR.map((f) => planejar(f, ENT, nivel, parseInt(VOZ.rate, 10), GRUPO, PRON));
const pf = path.join(DIR, "plano.json");
gravarJSON(pf, { voz: VOZ.voz, crossfadeMs: ENT.PARAMS.crossfade, frases: plano });
const r = spawnSync("python", [P("scripts", "voz_expressiva.py"), pf, DIR], { stdio: ["ignore", "ignore", "inherit"] });
if (r.status !== 0) throw new Error("síntese falhou");
let total = 0;
const porCena = {};
for (const f of NARR) {
  const s = duracao(path.join(DIR, f.id + ".wav"));
  total += s;
  porCena[f.cena] = (porCena[f.cena] ?? 0) + s;
}
console.log(JSON.stringify({ nivel, fala_total_s: +total.toFixed(1), por_cena: Object.fromEntries(Object.entries(porCena).map(([k, v]) => [k, +v.toFixed(1)])) }));
