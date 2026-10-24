// Processo SEPARADO que faz o trabalho pesado do Remotion para o editor (bundle + stills).
// Roda fora do Vite: se o webpack ou o Chrome caírem, só este processo morre — o editor continua
// e sobe outro no próximo pedido. Protocolo: uma linha JSON por pedido no stdin, uma por resposta no stdout.
//   pedido:   {"id": 1, "tipo": "still", "frame": 120, "projeto": {...}, "saida": "...png", "escala": 0.25}
//             {"id": 2, "tipo": "aquecer"}
//   resposta: {"id": 1, "ok": true} | {"id": 1, "ok": false, "erro": "..."}
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { P } from "./lib/projeto.mjs";

// o bundle é refeito se algum arquivo de src/ mudou (menos a composição gerada para o Studio)
const ultimaMudanca = () => {
  let ultimo = 0;
  const varre = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) varre(p);
      else if (/\.(tsx?|css)$/.test(f.name) && !f.name.endsWith(".gerada.tsx")) ultimo = Math.max(ultimo, fs.statSync(p).mtimeMs);
    }
  };
  varre(P("src"));
  return ultimo;
};

let url = null;
let carimbo = 0;
async function serveUrl() {
  const m = ultimaMudanca();
  if (!url || m > carimbo) {
    carimbo = m;
    url = await bundle({
      entryPoint: P("src", "index.ts"),
      // cache do webpack só do editor: os scripts (render, stills) usam o padrão e podem montar ao mesmo tempo
      webpackOverride: (c) =>
        c.cache && typeof c.cache === "object" ? { ...c, cache: { ...c.cache, cacheDirectory: P("node_modules", ".cache", `webpack-editor-${process.env.FORMATO || "horizontal"}`) } } : c,
    });
  }
  return url;
}

async function still({ frame, projeto, saida, escala }) {
  const serve = await serveUrl();
  // o editor vertical (FORMATO=vertical) tira as fotos da composição em pé
  const id = process.env.FORMATO === "vertical" ? "PitchVertical" : "PitchHerancaDigital";
  const composition = await selectComposition({ serveUrl: serve, id, inputProps: projeto });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  await renderStill({ serveUrl: serve, composition, frame, output: saida, overwrite: true, scale: escala, inputProps: projeto });
}

const responder = (o) => process.stdout.write(JSON.stringify(o) + "\n");

// um pedido por vez (a fila fica do lado do editor também; aqui é só garantia)
let fila = Promise.resolve();
readline.createInterface({ input: process.stdin }).on("line", (linha) => {
  let p;
  try {
    p = JSON.parse(linha);
  } catch {
    return;
  }
  fila = fila.then(async () => {
    try {
      if (p.tipo === "aquecer") await serveUrl();
      else await still(p);
      responder({ id: p.id, ok: true });
    } catch (e) {
      responder({ id: p.id, ok: false, erro: String(e?.stack ?? e) });
    }
  });
});
process.stdin.on("end", () => process.exit(0));
