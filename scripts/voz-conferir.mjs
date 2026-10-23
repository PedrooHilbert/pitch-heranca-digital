// Confere os arquivos de voz: duração, sample rate, loudness (LUFS), pico (dBTP), clipping e silêncios
// maiores que 0,6 s DENTRO da frase.   npm run voz:conferir [pasta]   (padrão: public/audio/voz)
import fs from "node:fs";
import path from "node:path";
import { P, ffLog, run, FFPROBE } from "./lib/projeto.mjs";

const pasta = path.resolve(process.argv[2] ?? P("public", "audio", "voz"));
const arqs = fs.readdirSync(pasta).filter((f) => f.endsWith(".mp3")).sort();
let problemas = 0;
const linhas = [];
for (const f of arqs) {
  const a = path.join(pasta, f);
  const info = JSON.parse(run(FFPROBE, ["-v", "error", "-show_entries", "stream=sample_rate:format=duration", "-of", "json", a]).toString());
  const dur = parseFloat(info.format.duration);
  const sr = parseInt(info.streams[0].sample_rate, 10);
  const log = ffLog(["-hide_banner", "-i", a, "-af", "silencedetect=noise=-40dB:d=0.6,loudnorm=I=-16:TP=-1.5:print_format=json", "-f", "null", "-"]);
  const j = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));
  // silêncios internos: começam depois de 0,15 s e terminam antes do fim (ignora as bordas)
  const ini = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const fim = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => ({ e: +m[1], d: +m[2] }));
  const internos = fim.filter((s, i) => (ini[i] ?? 0) > 0.15 && s.e < dur - 0.05);
  const lufs = +j.input_i;
  const pico = +j.input_tp;
  const erros = [];
  if (sr !== 44100 && sr !== 48000) erros.push(`sample rate ${sr}`);
  if (Math.abs(lufs + 16) > 1.5) erros.push(`${lufs} LUFS`);
  if (pico > -1) erros.push(`pico ${pico} dBTP`);
  if (internos.length) erros.push(`silêncio interno ${internos.map((s) => s.d.toFixed(2) + " s").join(", ")}`);
  problemas += erros.length ? 1 : 0;
  linhas.push(`${erros.length ? "✗" : "✓"} ${f.padEnd(58)} ${dur.toFixed(2).padStart(6)} s  ${sr} Hz  ${lufs.toFixed(1)} LUFS  pico ${pico.toFixed(1)} dBTP${erros.length ? "  ← " + erros.join("; ") : ""}`);
}
console.log(linhas.join("\n"));
console.log(`\n${arqs.length} arquivos · ${problemas ? `${problemas} com problema` : "todos OK"} (${pasta})`);
process.exitCode = problemas ? 1 : 0;
