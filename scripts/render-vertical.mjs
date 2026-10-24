// Versão EM PÉ (1080×1920, TikTok/Reels/Shorts) — composição "PitchVertical" (src/Vertical.tsx).
//   npm run render:vertical                   → out/pitch-vertical.mp4 (usa o áudio final do horizontal)
//   npm run render:vertical -- --quadros=300,2400 [--escala=0.5]   → só stills em out/revisao/vertical/
// O áudio é o MESMO do horizontal (mesma timeline): out/audio-mix.wav, já em −14 LUFS. Rode `npm run render`
// antes se o projeto mudou.
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";
import { P, ffLog } from "./lib/projeto.mjs";
import { gerarStudio } from "./gerar-studio.mjs";

gerarStudio();
const args = process.argv.slice(2);
const quadros = args.find((a) => a.startsWith("--quadros="))?.slice(10).split(",").map(Number);
const escala = parseFloat(args.find((a) => a.startsWith("--escala="))?.slice(9) ?? "0.5");
const projeto = JSON.parse(fs.readFileSync(P("src", "data", "project.json"), "utf8"));

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

const mix = P("out", "audio-mix.wav");
if (!fs.existsSync(mix)) throw new Error("falta out/audio-mix.wav — rode `npm run render` antes");
const mudo = P("out", ".cache", "vertical-mudo.mp4");
fs.mkdirSync(path.dirname(mudo), { recursive: true });
console.log("▶ 1/2 vídeo em pé (sem áudio)…");
let ultimo = -1;
await renderMedia({
  serveUrl, composition, inputProps: projeto, codec: "h264", crf: 18, muted: true, outputLocation: mudo,
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 20);
    if (p !== ultimo) {
      ultimo = p;
      process.stdout.write(`  ${p * 5}%\n`);
    }
  },
});
console.log("▶ 2/2 juntando com o áudio final do horizontal…");
const saida = P("out", "pitch-vertical.mp4");
ffLog(["-hide_banner", "-y", "-i", mudo, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", saida]);
console.log(`\n✓ ${saida}`);
