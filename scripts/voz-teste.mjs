// Banco de testes de voz (revisão de voz): 3 frases da narração em várias vozes femininas, com o MESMO
// pós-processamento da narração final, e uma página para ouvir e escolher: out/voz-teste/index.html.
//   npm run voz:teste
// Só entra o que roda nesta máquina: edge-tts sempre; Kokoro se o pacote estiver instalado; ElevenLabs/OpenAI/
// Google só com chave (hoje não há nenhuma — a página diz isso).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { P, ffLog, duracao, carregarNarracao, carregarPronuncia, carregarConfig, FILTRO_VOZ, lerJSON, gravarJSON } from "./lib/projeto.mjs";
import { montarFala } from "./lib/fala.mjs";

const OUT = P("out", "voz-teste");
const BRUTO = path.join(OUT, "bruto");
fs.mkdirSync(BRUTO, { recursive: true });

const NARR = await carregarNarracao();
const PRON = await carregarPronuncia();
const GRUPO = (await carregarConfig()).NOME_DO_GRUPO;
const FRASES = ["s01_01", "s03_01", "s06_03"].map((id) => {
  const f = NARR.find((x) => x.id === id);
  return { id, texto: f.texto, fala: montarFala(f.texto, GRUPO, PRON).fala };
});

const VOZES = [
  { motor: "edge", voz: "pt-BR-ThalitaMultilingualNeural", rate: "+0%", rotulo: "Thalita", desc: "Microsoft, pt-BR, geração multilíngue (a mais nova das pt-BR). Velocidade natural." },
  { motor: "edge", voz: "pt-BR-ThalitaMultilingualNeural", rate: "-3%", rotulo: "Thalita −3 %", desc: "A mesma, 3 % mais calma." },
  { motor: "edge", voz: "pt-BR-FranciscaNeural", rate: "+0%", rotulo: "Francisca", desc: "Microsoft, pt-BR, voz feminina clássica. Velocidade natural." },
  { motor: "edge", voz: "pt-BR-FranciscaNeural", rate: "-3%", rotulo: "Francisca −3 %", desc: "A mesma, 3 % mais calma." },
  { motor: "edge", voz: "en-US-AvaMultilingualNeural", rate: "+0%", rotulo: "Ava (multilíngue)", desc: "Microsoft, multilíngue, perfil “expressiva, calorosa”. Fala português, mas o sotaque pode puxar para o inglês." },
  { motor: "edge", voz: "en-US-EmmaMultilingualNeural", rate: "+0%", rotulo: "Emma (multilíngue)", desc: "Microsoft, multilíngue, perfil “alegre, conversacional”. Sotaque pode puxar para o inglês." },
  { motor: "edge", voz: "pt-BR-AntonioNeural", rate: "+8%", rotulo: "Antonio +8 % (a voz ATUAL, referência)", desc: "Masculina, acelerada 8 % — a que estava no vídeo. Só para comparar." },
];

const temKokoro = spawnSync("python", ["-c", "import kokoro"], { encoding: "utf8" }).status === 0;
if (temKokoro) VOZES.push({ motor: "kokoro", voz: "pf_dora", rate: "+0%", rotulo: "Dora (Kokoro, local)", desc: "Kokoro 82M, offline e gratuito, voz feminina pt-BR “pf_dora”." });

const nomeArq = (v, f) => `${v.motor}_${v.voz}${v.rate === "+0%" ? "" : "_r" + v.rate.replace("%", "")}_${f}`;

// mesmo tratamento da narração final: filtros + −16 LUFS (2 passadas) + corte do silêncio final com fade de 20 ms
function finalizar(bruto, palavras, saida) {
  let fim = palavras?.at(-1)?.e;
  const corte = fim ? `,atrim=end=${(fim + 0.08).toFixed(3)},afade=t=out:st=${(fim + 0.06).toFixed(3)}:d=0.02` : "";
  const pre = `${FILTRO_VOZ}${corte},`;
  const m = ffLog(["-hide_banner", "-i", bruto, "-af", `${pre}loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  const ln = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  ffLog(["-hide_banner", "-y", "-i", bruto, "-af", `${pre}${ln}`, "-ar", "44100", "-ac", "1", "-b:a", "192k", saida]);
}

const resultado = [];
for (const v of VOZES) {
  console.log(`▶ ${v.rotulo}`);
  const jobs = FRASES.map((f) => ({ id: nomeArq(v, f.id), fala: f.fala }));
  const jf = path.join(BRUTO, "jobs.json");
  gravarJSON(jf, jobs);
  const script = v.motor === "kokoro" ? "kokoro_tts.py" : "voz_sintetica.py";
  const r = spawnSync("python", [P("scripts", script), jf, v.voz, v.rate, BRUTO], { stdio: "inherit" });
  if (r.status !== 0) {
    console.log(`  ✗ ${v.rotulo} falhou — fica de fora`);
    continue;
  }
  const arquivos = [];
  for (const f of FRASES) {
    const id = nomeArq(v, f.id);
    const ext = fs.existsSync(path.join(BRUTO, id + ".mp3")) ? ".mp3" : ".wav";
    const palavras = lerJSON(path.join(BRUTO, id + ".words.json"))?.palavras;
    finalizar(path.join(BRUTO, id + ext), palavras, path.join(OUT, id + ".mp3"));
    arquivos.push({ frase: f.id, texto: f.texto, arquivo: id + ".mp3", seg: +duracao(path.join(OUT, id + ".mp3")).toFixed(2) });
  }
  resultado.push({ ...v, arquivos });
}
gravarJSON(path.join(OUT, "vozes.json"), resultado);

// ---------- página para ouvir ----------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cartoes = resultado
  .map(
    (v) => `<section class="voz${v.voz === "pt-BR-AntonioNeural" ? " ref" : ""}">
  <h2>${esc(v.rotulo)}</h2>
  <p class="desc">${esc(v.desc)}</p>
  <p class="tec">motor <code>${v.motor}</code> · voz <code>${v.voz}</code> · rate <code>${v.rate}</code></p>
  ${v.arquivos.map((a) => `<div class="frase"><span>${a.frase} · ${a.seg} s</span><q>${esc(a.texto)}</q><audio controls preload="none" src="${a.arquivo}"></audio></div>`).join("\n  ")}
</section>`,
  )
  .join("\n");
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste de vozes · Herança Digital</title>
<style>
  :root { --bg: #0b1f1e; --card: #12302e; --txt: #e9f4f1; --sub: #9fc4bd; --mint: #7fd1c5; --amber: #f5c86b; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--txt); font: 15px/1.5 system-ui, sans-serif; padding: 24px 16px 60px; }
  main { max-width: 980px; margin: 0 auto; }
  h1 { margin: 0 0 6px; font-size: 24px; } h2 { margin: 0 0 4px; font-size: 18px; color: var(--mint); }
  .aviso { background: #1b3b38; border-left: 4px solid var(--amber); padding: 12px 14px; border-radius: 8px; margin: 14px 0 22px; color: var(--sub); }
  .voz { background: var(--card); border-radius: 14px; padding: 16px; margin-bottom: 14px; }
  .voz.ref { opacity: .75; border: 1px dashed #5a7d78; }
  .desc { margin: 0 0 2px; } .tec { margin: 0 0 10px; color: var(--sub); font-size: 13px; }
  code { background: #0b2422; padding: 1px 6px; border-radius: 5px; }
  .frase { display: grid; grid-template-columns: 140px 1fr; gap: 4px 12px; align-items: center; padding: 8px 0; border-top: 1px solid #1f4a46; }
  .frase span { color: var(--sub); font-size: 13px; } .frase q { color: var(--txt); }
  .frase audio { grid-column: 1 / -1; width: 100%; height: 36px; }
  @media (min-width: 720px) { .frase { grid-template-columns: 140px 1fr 360px; } .frase audio { grid-column: auto; } }
</style>
</head>
<body><main>
<h1>Teste de vozes — narração do pitch</h1>
<p>Mesmas 3 frases em cada voz, já com o tratamento final (filtro de graves, de-esser, compressão leve, −16 LUFS). Nada acelerado, exceto a referência antiga.</p>
<div class="aviso">
  <b>Motores disponíveis nesta máquina:</b> edge-tts (Microsoft)${temKokoro ? " e Kokoro (local)" : ""}.<br>
  <b>Não testados por falta de chave/credencial:</b> ElevenLabs (<code>ELEVENLABS_API_KEY</code>), OpenAI TTS (<code>OPENAI_API_KEY</code>), Google Chirp 3 HD (credenciais do Google Cloud).${temKokoro ? "" : "<br><b>Kokoro:</b> não ficou disponível nesta máquina."}<br>
  <b>Para escolher:</b> diga o nome da voz ao Claude, ou edite <code>src/data/voz.ts</code> e rode <code>npm run voz</code>.
</div>
${cartoes}
</main></body></html>
`;
fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log(`\n✓ ${resultado.length} vozes · ${OUT}\\index.html`);
