// Pipeline de voz → timeline → música (PROMPT_V2 §4.2 e §4.3).
//
//   npm run voz             gera a narração inteira com a VOZ_ESCOLHIDA (src/data/voz.ts) e refaz tudo
//   npm run voz:sintetica   o mesmo (nome antigo)
//   npm run voz:importar    processa as gravações do grupo (gravacoes/<id>.wav|mp3|m4a) e refaz tudo
//   npm run sync            só refaz timings + timeline + trilha com o áudio que já existe
//
// Variáveis (só para testar sem mexer em voz.ts): TTS_VOZ, TTS_RATE. A velocidade fica na natural (±3 %): nada de acelerar para caber.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  P, ffmpeg, ffLog, duracao, carregarNarracao, carregarPronuncia, carregarConfig, carregarVoz, FILTRO_VOZ,
  carregarMusica, lerJSON, gravarJSON, tokens,
} from "./lib/projeto.mjs";
import { montarFala, alinhar, distribuir } from "./lib/fala.mjs";
import { montarTimeline } from "./lib/timeline.mjs";

const args = new Set(process.argv.slice(2));
// --so=s1 (ou --so=s01_02,s01_03): gera a voz sintética só dessas cenas/frases; as outras ficam como estão
const SO = process.argv.find((a) => a.startsWith("--so="))?.slice(5).split(",");
const escolhida = (f) => !SO || SO.includes(f.cena) || SO.includes(f.id);
const VOZDIR = P("public", "audio", "voz");
const ESCOLHIDA = await carregarVoz();
const VOZ = process.env.TTS_VOZ || ESCOLHIDA.voz;
const RATE0 = parseInt((process.env.TTS_RATE || ESCOLHIDA.rate).replace("%", ""), 10);
if (Math.abs(RATE0) > 3) console.log(`⚠ rate ${RATE0}% passa de ±3 %: a voz deixa de soar natural.`);
fs.mkdirSync(VOZDIR, { recursive: true });

const NARR = await carregarNarracao();
const PRON = await carregarPronuncia();
const CFG = await carregarConfig();
const { framesPerBeat, BPM } = await carregarMusica();
const GRUPO = CFG.NOME_DO_GRUPO;

const log = (...a) => console.log(...a);

// ---------- normalização de loudness (2 passadas, linear) ----------
function normalizar(entrada, saida, { cortarSilencio = false } = {}) {
  const pre = cortarSilencio
    ? "highpass=f=70,adeclick,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,"
    : "";
  const pos = `${pre}${FILTRO_VOZ},`;
  const medir = ffLog(["-hide_banner", "-i", entrada, "-af", `${pos}loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
  const j = JSON.parse(medir.slice(medir.lastIndexOf("{"), medir.lastIndexOf("}") + 1));
  const ln = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  const tmp = saida + ".tmp.mp3";
  ffLog(["-hide_banner", "-y", "-i", entrada, "-af", `${pos}${ln}`, "-ar", "44100", "-ac", "1", "-b:a", "192k", tmp]);
  fs.renameSync(tmp, saida);
}

// ---------- A) voz sintética (motor da VOZ_ESCOLHIDA: edge-tts ou Kokoro local) ----------
async function vozSintetica(rate) {
  const jobs = NARR.filter(escolhida).map((f) => ({ id: f.id, fala: montarFala(f.texto, GRUPO, PRON).fala }));
  const jf = P("scripts", ".cache", "tts-jobs.json");
  gravarJSON(jf, jobs);
  const MOTOR = process.env.TTS_VOZ ? "edge" : ESCOLHIDA.motor;
  log(`\n▶ voz sintética (${MOTOR}): ${VOZ} rate ${rate >= 0 ? "+" : ""}${rate}% (${jobs.length} frases)`);
  const script = MOTOR === "kokoro" ? "kokoro_tts.py" : "voz_sintetica.py";
  const r = spawnSync("python", [P("scripts", script), jf, VOZ, `${rate >= 0 ? "+" : ""}${rate}%`, VOZDIR], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("voz sintética falhou");
  if (MOTOR === "kokoro") {
    // Kokoro não dá tempo por palavra em português: corta silêncios, normaliza e alinha com o whisper
    log("▶ normalizando e alinhando palavra a palavra (whisper)…");
    for (const f of NARR.filter(escolhida)) {
      const wav = path.join(VOZDIR, f.id + ".wav");
      const mp3 = path.join(VOZDIR, f.id + ".mp3");
      normalizar(wav, mp3, { cortarSilencio: true });
      fs.rmSync(wav, { force: true });
      gravarJSON(path.join(VOZDIR, f.id + ".words.json"), { fonte: "kokoro", voz: VOZ, palavras: await palavrasWhisper(mp3, f.id) });
    }
    return;
  }
  log("▶ normalizando voz (−16 LUFS, true-peak −1,5 dB) e cortando o silêncio final…");
  for (const f of NARR.filter(escolhida)) {
    const mp3 = path.join(VOZDIR, f.id + ".mp3");
    normalizar(mp3, mp3);
    cortarFim(mp3, path.join(VOZDIR, f.id + ".words.json"));
  }
}

// O edge-tts deixa ~0,8 s de silêncio no fim de cada frase: corta em (última palavra + 0,08 s): pausa real entre frases ≈ 0,3–0,4 s.
// Não mexe no início, então os tempos das palavras continuam válidos.
function cortarFim(mp3, wordsJson) {
  const fim = lerJSON(wordsJson)?.palavras?.at(-1)?.e;
  if (!fim) return;
  const t = fim + 0.08;
  const tmp = mp3 + ".tmp.mp3";
  ffLog(["-hide_banner", "-y", "-i", mp3, "-t", t.toFixed(3), "-af", `afade=t=out:st=${(t - 0.02).toFixed(3)}:d=0.02`, "-ar", "44100", "-ac", "1", "-b:a", "192k", tmp]);
  fs.renameSync(tmp, mp3);
}

// ---------- tempo de cada palavra pelo whisper (gravações do grupo e Kokoro) ----------
const WHISPER = { dir: P("whisper.cpp"), modelo: null };
if (fs.existsSync(WHISPER.dir)) WHISPER.modelo = fs.readdirSync(WHISPER.dir).find((x) => x.startsWith("ggml-"))?.replace(/^ggml-|\.bin$/g, "") ?? null;
async function palavrasWhisper(audio, id) {
  if (!WHISPER.modelo) return []; // sem whisper: o timings() distribui pelas letras
  const { transcribe, toCaptions } = await import("@remotion/install-whisper-cpp");
  const wav16 = P("scripts", ".cache", `${id}.16k.wav`);
  fs.mkdirSync(path.dirname(wav16), { recursive: true });
  ffLog(["-hide_banner", "-y", "-i", audio, "-ar", "16000", "-ac", "1", wav16]);
  const out = await transcribe({ inputPath: wav16, whisperPath: WHISPER.dir, whisperCppVersion: "1.5.5", model: WHISPER.modelo, tokenLevelTimestamps: true, language: "pt", printOutput: false });
  return toCaptions({ whisperCppOutput: out }).captions
    .map((c) => ({ w: c.text.trim(), s: c.startMs / 1000, e: c.endMs / 1000 }))
    .filter((c) => c.w);
}

// ---------- B) gravações do grupo ----------
async function vozImportar() {
  const EXT = [".wav", ".mp3", ".m4a", ".ogg", ".aac", ".flac"];
  const achar = (id) => {
    for (const e of EXT) {
      const g = P("gravacoes", id + e);
      if (fs.existsSync(g)) return g;
    }
    const w = path.join(VOZDIR, id + ".wav");
    return fs.existsSync(w) ? w : null;
  };
  let n = 0;
  for (const f of NARR) {
    const bruto = achar(f.id);
    if (!bruto) continue;
    n++;
    const saida = path.join(VOZDIR, f.id + ".mp3");
    normalizar(bruto, saida, { cortarSilencio: true });
    const palavras = await palavrasWhisper(saida, f.id);
    gravarJSON(path.join(VOZDIR, f.id + ".words.json"), { fonte: "gravada", whisper: WHISPER.modelo, palavras });
    log(`  ${f.id}: gravação importada (${palavras.length} palavras com tempo${WHISPER.modelo ? "" : " — sem whisper: distribuição por letras"})`);
  }
  log(`▶ ${n} gravações importadas.`);
}

// ---------- timings (voice-timings.json) ----------
function timings() {
  const frases = [];
  const vt = {};
  for (const f of NARR) {
    const mp3 = path.join(VOZDIR, f.id + ".mp3");
    if (!fs.existsSync(mp3)) throw new Error(`falta ${mp3} — rode npm run voz:sintetica ou voz:importar`);
    const sec = duracao(mp3);
    const w = lerJSON(path.join(VOZDIR, f.id + ".words.json"), { fonte: "desconhecida", palavras: [] });
    const gravada = w.fonte === "gravada";
    const { itens } = montarFala(f.texto, GRUPO, PRON, { gravada });
    let tempos;
    if (w.palavras?.length) {
      const faladas = itens.flatMap((it, i) => it.s.map((s) => ({ s, i })));
      const al = alinhar(faladas.map((x) => x.s), w.palavras);
      tempos = itens.map((it, i) => {
        const meus = faladas.map((x, k) => (x.i === i ? al[k] : null)).filter(Boolean);
        return meus.length ? { s: meus[0].s, e: meus.at(-1).e } : null;
      });
      for (let i = 0; i < tempos.length; i++) {
        if (!tempos[i]) {
          const ant = tempos.slice(0, i).reverse().find(Boolean);
          tempos[i] = ant ? { s: ant.e, e: ant.e } : { s: 0, e: 0 };
        }
      }
    } else {
      tempos = distribuir(itens.map((x) => x.d), 0.08, Math.max(0.2, sec - 0.08));
    }
    const palavras = itens.map((it, i) => ({ w: it.d, s: +tempos[i].s.toFixed(3), e: +tempos[i].e.toFixed(3) }));
    const texto = tokens(f.texto.replace("[NOME DO GRUPO]", GRUPO)).join(" ");
    vt[f.id] = { sec: +sec.toFixed(3), fonte: w.fonte, voz: w.voz ?? null, palavras };
    frases.push({ id: f.id, cena: f.cena, texto, sec, palavras, fonte: w.fonte, pausa: f.pausa });
  }
  gravarJSON(P("src", "data", "voice-timings.json"), vt);
  const fala = frases.reduce((a, f) => a + f.sec, 0);
  const nPal = frases.reduce((a, f) => a + f.palavras.length, 0);
  log(`▶ voice-timings.json: ${frases.length} frases, ${fala.toFixed(1)} s de fala, ${nPal} palavras (${((nPal / fala) * 60).toFixed(0)} palavras/min)`);
  return frases;
}

function timeline(frases) {
  const tl = montarTimeline(frases, framesPerBeat);
  const fonte = [...new Set(frases.map((f) => f.fonte))].join("+");
  gravarJSON(P("src", "data", "timeline.json"), { fps: 30, bpm: BPM, framesPerBeat, fonteVoz: fonte, vozSintetica: fonte.includes("sintetica") ? VOZ : null, ...tl });
  log(`▶ timeline.json: ${tl.total} quadros = ${(tl.total / 30).toFixed(2)} s (nível: ${tl.nivel})${tl.estourou ? "  ⚠ ESTOUROU 180 s" : ""}`);
  tl.cenas.forEach((c) => log(`    ${c.id} ${c.nome.padEnd(22)} ${String(c.from).padStart(5)} +${c.dur} q (${(c.dur / 30).toFixed(1)} s)`));
  return tl;
}

function projeto() {
  log("▶ project.json (durações, falas, legendas, efeitos; preserva edições manuais)…");
  const r = spawnSync("npx", ["tsx", "scripts/projeto-sync.mts"], { stdio: "inherit", shell: true, cwd: P() });
  if (r.status !== 0) throw new Error("projeto-sync falhou");
  spawnSync("node", ["scripts/gerar-studio.mjs"], { stdio: "inherit", shell: true, cwd: P() });
}

function musica() {
  if (!fs.existsSync(P("scripts", "make_music.py"))) return;
  log("▶ trilha (make_music.py)…");
  const r = spawnSync("python", [P("scripts", "make_music.py")], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("trilha falhou");
}

// ---------- execução ----------
if (args.has("--sintetica") || args.has("--voz")) await vozSintetica(RATE0);
if (args.has("--importar")) await vozImportar();
const frases = timings();
const tl = timeline(frases);
// Passou de 180 s? NÃO acelera a voz (soa robótico): a timeline já encurtou os respiros; o que sobrar
// tem de sair do texto (enxugar frases em src/data/narracao.ts e registrar no README).
if (tl.estourou) {
  log("\n✗ Passa de 180 s mesmo com respiros mínimos. Enxugue frases em src/data/narracao.ts — o project.json NÃO foi atualizado.");
  process.exit(1);
}
projeto();
if (!args.has("--sem-musica")) musica();
log("\n✓ sync concluído.");
