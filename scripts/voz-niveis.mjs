// Teste dos níveis de EXPRESSIVIDADE (revisão "voz expressiva"): o mesmo trecho em plano (0), leve (0,5), média (0,75)
// e forte (1) → out/voz-teste/thalita_<nivel>_<frase>.mp3 e out/voz-teste/index.html (players lado a lado).
//   npm run voz:niveis
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { P, ffLog, carregarNarracao, carregarPronuncia, carregarConfig, carregarVoz, FILTRO_VOZ, gravarJSON, lerJSON } from "./lib/projeto.mjs";
import { carregarEntonacao, planejar } from "./lib/expressiva.mjs";

const OUT = P("out", "voz-teste");
const BRUTO = path.join(OUT, "niveis-bruto");
fs.mkdirSync(BRUTO, { recursive: true });
const NARR = await carregarNarracao();
const PRON = await carregarPronuncia();
const GRUPO = (await carregarConfig()).NOME_DO_GRUPO;
const VOZ = await carregarVoz();
const ENT = await carregarEntonacao();

const IDS = ["s01_01", "s01_02", "s01_03", "s03_02", "s05_04", "s06_03", "s09_03"];
const NIVEIS = [
  { n: 0, nome: "plano", desc: "como está hoje: frase inteira num pedido só" },
  { n: 0.5, nome: "leve", desc: "metade dos deltas" },
  { n: 0.75, nome: "media", desc: "padrão provisório no vídeo" },
  { n: 1, nome: "forte", desc: "deltas cheios (no limite de ±15 % / ±25 Hz)" },
];
const baseRate = parseInt(VOZ.rate, 10);

// mesmo tratamento do npm run voz: −16 LUFS ± o volume do mapa de energia (cena + frase) × nível
function normalizar(wav, mp3, alvo = -16) {
  const I = alvo.toFixed(1);
  const m = ffLog(["-hide_banner", "-i", wav, "-af", `${FILTRO_VOZ},loudnorm=I=${I}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
  const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
  const ln = `loudnorm=I=${I}:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  ffLog(["-hide_banner", "-y", "-i", wav, "-af", `${FILTRO_VOZ},${ln}`, "-ar", "44100", "-ac", "1", "-b:a", "192k", mp3]);
}

const planos = {};
for (const nv of NIVEIS) {
  const frases = IDS.map((id) => {
    const pl = planejar(NARR.find((f) => f.id === id), ENT, nv.n, baseRate, GRUPO, PRON);
    return { ...pl, id: `thalita_${nv.nome}_${id}` };
  });
  planos[nv.nome] = frases;
  const pf = path.join(BRUTO, `plano-${nv.nome}.json`);
  gravarJSON(pf, { voz: VOZ.voz, crossfadeMs: ENT.PARAMS.crossfade, frases });
  console.log(`▶ ${nv.nome} (${nv.n})`);
  const r = spawnSync("python", [P("scripts", "voz_expressiva.py"), pf, BRUTO], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`falhou: ${nv.nome}`);
  for (const f of frases) {
    const id = f.id.split("_").slice(-2).join("_");
    const cena = NARR.find((x) => x.id === id).cena;
    const vol = ((ENT.CENAS[cena]?.volumeDb ?? 0) + (ENT.FRASES[id]?.delta?.volumeDb ?? 0)) * nv.n;
    normalizar(path.join(BRUTO, f.id + ".wav"), path.join(OUT, f.id + ".mp3"), -16 + vol);
    fs.copyFileSync(path.join(BRUTO, f.id + ".words.json"), path.join(OUT, f.id + ".words.json"));
  }
}

// ---------- página: uma linha por frase, os 4 níveis lado a lado ----------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const linhas = IDS.map((id) => {
  const f = NARR.find((x) => x.id === id);
  const marcado = ENT.FRASES[id]?.marcado ?? f.texto;
  const celulas = NIVEIS.map((nv) => {
    const pl = planos[nv.nome].find((x) => x.id.endsWith(id));
    const segs = pl.segmentos.map((s) => `<span title="rate ${s.rate} · pitch ${s.pitch} · ${s.volumeDb >= 0 ? "+" : ""}${s.volumeDb} dB">${esc(s.texto)}</span>`).join(" <i>/</i> ");
    return `<td><audio controls preload="none" src="thalita_${nv.nome}_${id}.mp3"></audio><div class="segs">${segs}</div></td>`;
  }).join("");
  return `<tr><th><b>${id}</b><q>${esc(marcado)}</q><small>${esc(ENT.CENAS[f.cena]?.tom ?? "")}</small></th>${celulas}</tr>`;
}).join("\n");
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Expressividade da voz · Herança Digital</title>
<style>
  :root { --bg:#0b1f1e; --card:#12302e; --txt:#e9f4f1; --sub:#9fc4bd; --mint:#7fd1c5; --amber:#f5c86b; }
  * { box-sizing: border-box; } body { margin:0; background:var(--bg); color:var(--txt); font:15px/1.45 system-ui,sans-serif; padding:24px 16px 60px; }
  main { max-width: 1400px; margin: 0 auto; } h1 { margin:0 0 6px; font-size:24px; }
  .aviso { background:#1b3b38; border-left:4px solid var(--amber); padding:12px 14px; border-radius:8px; margin:14px 0 20px; color:var(--sub); }
  .tabela { overflow-x:auto; } table { border-collapse:separate; border-spacing:0 10px; width:100%; min-width:1050px; }
  th, td { background:var(--card); padding:12px; vertical-align:top; text-align:left; }
  th { width:24%; border-radius:12px 0 0 12px; font-weight:400; } td:last-child { border-radius:0 12px 12px 0; }
  thead th, thead td { background:none; color:var(--mint); font-weight:700; padding:4px 12px; }
  q { display:block; margin:4px 0; } small { color:var(--sub); }
  audio { width:100%; height:36px; } .segs { color:var(--sub); font-size:12px; margin-top:6px; } .segs i { color:#4d7b75; }
  code { background:#0b2422; padding:1px 6px; border-radius:5px; }
</style></head><body><main>
<h1>Expressividade da Thalita — 4 níveis</h1>
<p>Mesmo trecho em cada nível. Embaixo de cada player: os segmentos em que a frase foi dividida (passe o mouse para ver rate/pitch/volume).</p>
<div class="aviso">O edge-tts não aceita SSML nem estilos de emoção (ver <code>docs/medicoes/motor-edge.md</code>): a variação vem de pedir cada segmento com velocidade, tom e volume próprios.
Para escolher: diga o nível ao Claude, ou mude <code>expressividade</code> em <code>src/data/voz.ts</code> e rode <code>npm run voz</code>.
<a href="vozes.html" style="color:var(--mint)">Comparação de vozes (teste anterior)</a></div>
<div class="tabela"><table>
<thead><tr><th>Frase</th>${NIVEIS.map((nv) => `<td>${nv.nome === "media" ? "média" : nv.nome} (${String(nv.n).replace(".", ",")})<br><small>${nv.desc}</small></td>`).join("")}</tr></thead>
<tbody>
${linhas}
</tbody></table></div>
</main></body></html>
`;
fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log(`\n✓ ${IDS.length} frases × ${NIVEIS.length} níveis · ${OUT}\\index.html`);
