// Stills da v2 (PROMPT_V2 §7.5): 2 quadros por cena (início do movimento e clímax) + 1 por
// sub-cena da demo, em out/stills-v2/. Uso: npm run stills  [-- s5 s6] para só algumas cenas.
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { P, lerJSON } from "./lib/projeto.mjs";

const tl = lerJSON(P("src", "data", "timeline.json"));
const args = process.argv.slice(2);
// --quadros=s1:175,s2:315  → quadros LOCAIS específicos (para conferir um momento)
const qArg = args.find((a) => a.startsWith("--quadros="));
const so = args.filter((a) => !a.startsWith("--"));
const fr = (id) => tl.frases.find((f) => f.id === id);
const quadros = [];
if (qArg) {
  for (const par of qArg.slice(10).split(",")) {
    const [cid, loc] = par.split(":");
    const c = tl.cenas.find((x) => x.id === cid);
    quadros.push([`${cid}-q${loc}`, c.from + Number(loc)]);
  }
}
for (const c of qArg ? [] : tl.cenas) {
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
const out = P("out", "stills-v2");
fs.mkdirSync(out, { recursive: true });
console.log("Empacotando…");
const serveUrl = await bundle({ entryPoint: P("src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "PitchHerancaDigital" });
for (const [nome, frame] of quadros) {
  await renderStill({ serveUrl, composition, output: path.join(out, `${nome}.png`), frame, overwrite: true, scale: 0.5 });
  console.log("✓", nome, "@", frame);
}
