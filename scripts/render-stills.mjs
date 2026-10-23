// Stills da v2 (PROMPT_V2 §7.5): 2 quadros por cena (início do movimento e clímax) + 1 por
// sub-cena da demo, em out/stills-v2/. Uso: npm run stills  [-- s5 s6] para só algumas cenas.
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { P } from "./lib/projeto.mjs";
import { linhaDoTempo } from "./lib/projeto-json.mjs";
import { gerarStudio } from "./gerar-studio.mjs";

gerarStudio();

const tl = linhaDoTempo();
const args = process.argv.slice(2);
// --quadros=s1:175,s2:315  → quadros LOCAIS específicos (para conferir um momento)
const qArg = args.find((a) => a.startsWith("--quadros="));
// --a-cada=15 → um still a cada 15 quadros do vídeo inteiro (revisão completa)
const cadaArg = args.find((a) => a.startsWith("--a-cada="));
const dirArg = args.find((a) => a.startsWith("--dir="));
const so = args.filter((a) => !a.startsWith("--"));
const fr = (id) => tl.frases.find((f) => f.id === id);
const quadros = [];
if (cadaArg) {
  const passo = Number(cadaArg.slice(9));
  for (let f = 0; f < tl.total; f += passo) {
    const c = tl.cenas.find((x) => f >= x.from && f < x.from + x.dur);
    const s = f / 30;
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = (s % 60).toFixed(1).padStart(4, "0");
    quadros.push([`f${String(f).padStart(4, "0")}_${mm}-${ss.replace(".", "_")}_${c.id}`, f]);
  }
} else if (qArg) {
  for (const par of qArg.slice(10).split(",")) {
    const [cid, loc] = par.split(":");
    const c = tl.cenas.find((x) => x.id === cid);
    quadros.push([`${cid}-q${loc}`, c.from + Number(loc)]);
  }
}
for (const c of qArg || cadaArg ? [] : tl.cenas) {
  if (so.length && !so.includes(c.id)) continue;
  quadros.push([`${c.id}-a-inicio`, c.from + Math.round(c.dur * 0.18)]);
  quadros.push([`${c.id}-b-climax`, c.from + Math.round(c.dur * 0.72)]);
  if (c.id === "s5") {
    for (let k = 1; k <= 7; k++) {
      const f = fr(`s05_0${k}`);
      quadros.push([`s5-sub${k}`, f.from + Math.round(f.dur * 0.75)]);
    }
  }
}
const out = dirArg ? P(...dirArg.slice(6).split("/")) : P("out", "stills-v2");
fs.mkdirSync(out, { recursive: true });
console.log("Empacotando…");
const serveUrl = await bundle({ entryPoint: P("src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "PitchHerancaDigital" });
for (const [nome, frame] of quadros) {
  await renderStill({ serveUrl, composition, output: path.join(out, `${nome}.png`), frame, overwrite: true, scale: 0.5 });
  console.log("✓", nome, "@", frame);
}
