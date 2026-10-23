// Transcreve o áudio de uma referência com whisper.cpp (Fase 1 §1.3) para saber se há narração.
// Uso: node scripts/transcrever-ref.mjs ref2_vermelho
import fs from "node:fs";
import path from "node:path";
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { P, ffLog } from "./lib/projeto.mjs";

const nome = process.argv[2] || "ref2_vermelho";
const med = path.join(P(), "..", "referencias", "medicoes");
const wav16 = path.join(med, `${nome}.16k.wav`);
ffLog(["-hide_banner", "-y", "-i", path.join(P(), "..", "referencias", `${nome}.mp4`), "-vn", "-ar", "16000", "-ac", "1", wav16]);
const out = await transcribe({ inputPath: wav16, whisperPath: P("whisper.cpp"), whisperCppVersion: "1.5.5", model: "small", tokenLevelTimestamps: true, language: "pt", printOutput: false });
const { captions } = toCaptions({ whisperCppOutput: out });
const linhas = [];
let atual = null;
for (const c of captions) {
  const s = (c.startMs / 1000).toFixed(1);
  if (!atual || c.startMs / 1000 - atual.t > 3) {
    atual = { t: c.startMs / 1000, txt: "" };
    linhas.push(atual);
  }
  atual.txt += c.text;
  atual.s ??= s;
}
const txt = linhas.map((l) => `[${l.t.toFixed(1)} s] ${l.txt.trim()}`).join("\n");
fs.writeFileSync(path.join(med, `${nome}_transcricao.txt`), txt, "utf8");
console.log(txt || "(nenhuma fala detectada)");
console.log(`\npalavras: ${captions.length}`);
