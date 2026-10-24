// Versão EM PÉ (1080×1920, TikTok/Reels/Shorts) — composição "PitchVertical" (src/Vertical.tsx).
//   npm run stills:vertical -- --quadros=300,2400 [--escala=0.5]   → stills em out/revisao/vertical/
// O vídeo completo é `npm run render:vertical` (scripts/render-final.mjs --vertical, com mixagem própria).
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { P } from "./lib/projeto.mjs";
import { gerarStudio } from "./gerar-studio.mjs";

gerarStudio();
const args = process.argv.slice(2);
const quadros = args.find((a) => a.startsWith("--quadros="))?.slice(10).split(",").map(Number);
const escala = parseFloat(args.find((a) => a.startsWith("--escala="))?.slice(9) ?? "0.5");
const projeto = JSON.parse(fs.readFileSync(P("src", "data", "project-vertical.json"), "utf8"));

console.log("▶ empacotando…");
const serveUrl = await bundle({ entryPoint: P("src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: "PitchVertical", inputProps: projeto });

if (quadros) {
  const dir = P("out", "revisao", "vertical");
  fs.mkdirSync(dir, { recursive: true });
  for (const q of quadros) {
    await renderStill({ serveUrl, composition, frame: q, inputProps: projeto, output: path.join(dir, `v-q${q}.png`), overwrite: true, scale: escala });
    console.log(`✓ v-q${q}`);
  }
  process.exit(0);
}

console.log("Use --quadros=… para stills. O vídeo completo: npm run render:vertical (render-final --vertical).");
