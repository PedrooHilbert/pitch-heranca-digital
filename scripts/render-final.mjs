// Render final da v2 (PROMPT_V2 §6.4 e §9).
//   1) vídeo SEM áudio (H.264, CRF 18)
//   2) mixagem renderizada em WAV (voz + trilha + SFX) e versão SEM VOZ (trilha + SFX)
//   3) loudnorm em 2 passadas → −14 LUFS, true-peak −1,5 dBTP (linear) → out/audio-mix.wav
//   4) junta → out/pitch-v2.mp4 ; versão sem voz recebe o MESMO ganho → out/pitch-v2-musica-e-sfx.mp4
// Uso: npm run render  (verifica placeholders antes)  ·  npm run render:draft (rápido, só com voz)
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { P, ffLog } from "./lib/projeto.mjs";

const draft = process.argv.includes("--draft");
const OUT = P("out");
const CACHE = P("out", ".cache");
fs.mkdirSync(CACHE, { recursive: true });

const remotion = (args) => {
  const r = spawnSync("npx", ["remotion", "render", "PitchHerancaDigital", ...args], { stdio: "inherit", shell: true, cwd: P() });
  if (r.status !== 0) throw new Error("render do Remotion falhou");
};
const props = (obj, nome) => {
  const f = `${CACHE}/${nome}.json`;
  fs.writeFileSync(f, JSON.stringify(obj));
  return `--props=${f}`;
};
const loud = (file) => {
  const s = ffLog(["-hide_banner", "-i", file, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
  return JSON.parse(s.slice(s.lastIndexOf("{"), s.lastIndexOf("}") + 1));
};

const t0 = Date.now();
const video = `${CACHE}/video-mudo.mp4`;
console.log("▶ 1/4 vídeo (sem áudio)…");
remotion([video, "--codec=h264", `--crf=${draft ? 26 : 18}`, "--muted", "--log=error"]);

console.log("▶ 2/4 mixagem (WAV)…");
const mix = `${CACHE}/mix.wav`;
remotion([mix, "--codec=wav", props({ semVoz: false }, "props-voz"), "--log=error"]);
let semVoz = null;
if (!draft) {
  semVoz = `${CACHE}/mix-sem-voz.wav`;
  remotion([semVoz, "--codec=wav", props({ semVoz: true }, "props-sem-voz"), "--log=error"]);
}

console.log("▶ 3/4 loudnorm (2 passadas, −14 LUFS / −1,5 dBTP)…");
const m = loud(mix);
const ln = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
const mixFinal = `${OUT}/audio-mix.wav`;
ffLog(["-hide_banner", "-y", "-i", mix, "-af", ln, "-ar", "48000", "-c:a", "pcm_s24le", mixFinal]);

console.log("▶ 4/4 juntando…");
const final = `${OUT}/${draft ? "pitch-v2-draft" : "pitch-v2"}.mp4`;
ffLog(["-hide_banner", "-y", "-i", video, "-i", mixFinal, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", final]);
if (semVoz) {
  // mesmo ganho da versão com voz (para o grupo testar os tempos por cima), com limitador de pico
  const ganho = Number(m.output_i ?? -14) - Number(m.input_i);
  const semVozWav = `${CACHE}/mix-sem-voz-norm.wav`;
  ffLog(["-hide_banner", "-y", "-i", semVoz, "-af", `volume=${(-14 - Number(m.input_i)).toFixed(2)}dB,alimiter=limit=0.84:level=false`, "-ar", "48000", semVozWav]);
  ffLog(["-hide_banner", "-y", "-i", video, "-i", semVozWav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", `${OUT}/pitch-v2-musica-e-sfx.mp4`]);
  void ganho;
}
const dep = loud(mixFinal);
console.log(`\n✓ ${final}`);
if (semVoz) console.log(`✓ ${OUT}/pitch-v2-musica-e-sfx.mp4`);
console.log(`✓ ${mixFinal}`);
console.log(`  loudness antes: ${m.input_i} LUFS / pico ${m.input_tp} dBTP  →  depois: ${dep.input_i} LUFS / pico ${dep.input_tp} dBTP`);
console.log(`  tempo total: ${((Date.now() - t0) / 60000).toFixed(1)} min`);
