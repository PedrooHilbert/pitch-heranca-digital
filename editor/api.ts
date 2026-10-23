// API local do Estúdio de Revisão (roda dentro do servidor do Vite — sem nuvem, sem login, sem telemetria).
//   GET  /api/projeto               → src/data/project.json
//   PUT  /api/projeto               → valida (Zod), salva e guarda cópia em revisoes/historico/ (últimas 50)
//   GET  /api/revisoes              → revisoes/revisoes.json
//   POST /api/revisoes              → cria pin (+ still do quadro em revisoes/pins/<id>.png)
//   PATCH/DELETE /api/revisoes/:id  → muda status/texto · apaga
//   POST /api/still                 → { frame, projeto } → PNG (usa o MESMO código das cenas)
//   POST /api/render                → { tipo: "rascunho" | "final", projeto } ; GET /api/render → progresso
//   POST /api/abrir-out             → abre a pasta out/ no Explorer
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const ROOT = path.resolve(__dirname, "..");
const PROJ = path.join(ROOT, "src", "data", "project.json");
const REVDIR = path.join(ROOT, "revisoes");
const REV = path.join(REVDIR, "revisoes.json");
const PINS = path.join(REVDIR, "pins");
const HIST = path.join(REVDIR, "historico");
const OUT = path.join(ROOT, "out");

const lerJSON = (f: string, padrao: unknown) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : padrao);
const gravar = (f: string, obj: unknown) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj, null, 1), "utf8");
};
const corpo = (req: IncomingMessage): Promise<any> =>
  new Promise((ok, erro) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => {
      try {
        ok(s ? JSON.parse(s) : {});
      } catch (e) {
        erro(e);
      }
    });
  });
const enviar = (res: ServerResponse, status: number, obj: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
};

const carimbo = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
};

function salvarHistorico() {
  if (!fs.existsSync(PROJ)) return;
  fs.mkdirSync(HIST, { recursive: true });
  fs.copyFileSync(PROJ, path.join(HIST, `${carimbo()}.json`));
  const todos = fs.readdirSync(HIST).filter((f) => f.endsWith(".json")).sort();
  for (const velho of todos.slice(0, Math.max(0, todos.length - 50))) fs.unlinkSync(path.join(HIST, velho));
}

// ---------- still (bundle reaproveitado; recriado se o código das cenas mudar) ----------
let bundleP: Promise<string> | null = null;
let bundleCarimbo = 0;
const codigoMudou = () => {
  let ultimo = 0;
  const varre = (d: string) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) varre(p);
      else if (/\.(tsx?|css)$/.test(f.name)) ultimo = Math.max(ultimo, fs.statSync(p).mtimeMs);
    }
  };
  varre(path.join(ROOT, "src"));
  return ultimo;
};
async function serveUrl() {
  const m = codigoMudou();
  if (!bundleP || m > bundleCarimbo) {
    bundleCarimbo = m;
    const { bundle } = await import("@remotion/bundler");
    bundleP = bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });
  }
  return bundleP;
}
async function renderStillPNG(frame: number, projeto: unknown, saida: string, escala = 0.5) {
  const { renderStill, selectComposition } = await import("@remotion/renderer");
  const url = await serveUrl();
  const composition = await selectComposition({ serveUrl: url, id: "PitchHerancaDigital", inputProps: projeto as Record<string, unknown> });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  await renderStill({ serveUrl: url, composition, frame, output: saida, overwrite: true, scale: escala, inputProps: projeto as Record<string, unknown> });
}

// ---------- render (rascunho / final) ----------
type Job = { tipo: string; status: "rodando" | "ok" | "erro"; progresso: number; log: string; saida: string; inicio: number };
let job: Job | null = null;
function iniciarRender(tipo: "rascunho" | "final", projeto: unknown) {
  const cache = path.join(OUT, ".cache");
  fs.mkdirSync(cache, { recursive: true });
  let cmd: string;
  let args: string[];
  let saida: string;
  if (tipo === "rascunho") {
    const props = path.join(cache, "props-editor.json");
    fs.writeFileSync(props, JSON.stringify(projeto));
    saida = path.join(OUT, "rascunho-540p.mp4");
    cmd = "npx";
    args = ["remotion", "render", "PitchHerancaDigital", saida, "--scale=0.5", "--crf=28", `--props=${props}`];
  } else {
    saida = path.join(OUT, "pitch-v2.mp4");
    cmd = "node";
    args = ["--no-warnings", "scripts/render-final.mjs"];
  }
  job = { tipo, status: "rodando", progresso: 0, log: "", saida, inicio: Date.now() };
  const p = spawn(cmd, args, { cwd: ROOT, shell: true });
  const atual = job;
  const ler = (b: Buffer) => {
    const s = b.toString();
    atual.log = (atual.log + s).slice(-4000);
    const m = [...s.matchAll(/(\d+)\s*\/\s*(\d+)/g)].pop();
    if (m && Number(m[2]) > 0) atual.progresso = Math.min(0.99, Number(m[1]) / Number(m[2]));
    const etapa = s.match(/▶ (\d)\/4/);
    if (etapa) atual.progresso = Math.max(atual.progresso, (Number(etapa[1]) - 1) / 4);
  };
  p.stdout.on("data", ler);
  p.stderr.on("data", ler);
  p.on("close", (code) => {
    atual.status = code === 0 ? "ok" : "erro";
    if (code === 0) atual.progresso = 1;
  });
}

export function apiPlugin(): Plugin {
  let server: ViteDevServer;
  const validar = async (p: unknown) => {
    const { projetoSchema } = await server.ssrLoadModule(path.join(ROOT, "src", "data", "schema.ts"));
    return projetoSchema.safeParse(p);
  };
  return {
    name: "estudio-api",
    configureServer(s) {
      server = s;
      s.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://x");
        try {
          if (url.pathname.startsWith("/revisoes/")) {
            const f = path.join(REVDIR, decodeURIComponent(url.pathname.slice("/revisoes/".length)));
            if (f.startsWith(REVDIR) && fs.existsSync(f)) {
              res.setHeader("Content-Type", f.endsWith(".png") ? "image/png" : "application/octet-stream");
              res.setHeader("Cache-Control", "no-store");
              return fs.createReadStream(f).pipe(res);
            }
          }
          if (!url.pathname.startsWith("/api/")) return next();
          const rota = `${req.method} ${url.pathname}`;

          if (rota === "GET /api/projeto") return enviar(res, 200, lerJSON(PROJ, null));
          if (rota === "PUT /api/projeto") {
            const p = await corpo(req);
            const v = await validar(p);
            if (!v.success) return enviar(res, 422, { erros: v.error.issues.map((i: any) => ({ caminho: i.path.join("."), msg: i.message })) });
            salvarHistorico();
            gravar(PROJ, p);
            return enviar(res, 200, { ok: true, salvoEm: new Date().toISOString() });
          }

          if (rota === "GET /api/revisoes") return enviar(res, 200, lerJSON(REV, []));
          if (rota === "POST /api/revisoes") {
            const { pin, projeto } = await corpo(req);
            const lista = lerJSON(REV, []) as any[];
            const id = (lista.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) || 0) + 1;
            const still = `revisoes/pins/${id}.png`;
            const novo = { id, ...pin, still, status: "aberto", criadoEm: new Date().toISOString() };
            lista.push(novo);
            gravar(REV, lista);
            try {
              await renderStillPNG(pin.frame, projeto, path.join(PINS, `${id}.png`), 1);
            } catch (e) {
              novo.still = null;
              novo.erroStill = String(e).slice(0, 300);
              gravar(REV, lista);
            }
            return enviar(res, 200, novo);
          }
          const mRev = url.pathname.match(/^\/api\/revisoes\/(\d+)$/);
          if (mRev && (req.method === "PATCH" || req.method === "DELETE")) {
            const lista = lerJSON(REV, []) as any[];
            const i = lista.findIndex((r) => String(r.id) === mRev[1]);
            if (i < 0) return enviar(res, 404, { erro: "não encontrado" });
            if (req.method === "DELETE") lista.splice(i, 1);
            else lista[i] = { ...lista[i], ...(await corpo(req)), atualizadoEm: new Date().toISOString() };
            gravar(REV, lista);
            return enviar(res, 200, lista[i] ?? { ok: true });
          }

          if (rota === "POST /api/still") {
            const { frame, projeto } = await corpo(req);
            const f = path.join(OUT, ".cache", "still-editor.png");
            await renderStillPNG(frame, projeto, f, 0.5);
            res.setHeader("Content-Type", "image/png");
            return fs.createReadStream(f).pipe(res);
          }

          if (rota === "POST /api/render") {
            if (job?.status === "rodando") return enviar(res, 409, { erro: "já há um render rodando" });
            const { tipo, projeto } = await corpo(req);
            if (tipo === "final") {
              const v = await validar(projeto);
              if (!v.success) return enviar(res, 422, { erro: "projeto inválido" });
              salvarHistorico();
              gravar(PROJ, projeto);
            }
            iniciarRender(tipo, projeto);
            return enviar(res, 200, { ok: true });
          }
          if (rota === "GET /api/render") return enviar(res, 200, job ? { ...job, segundos: Math.round((Date.now() - job.inicio) / 1000) } : null);

          if (rota === "POST /api/abrir-out") {
            fs.mkdirSync(OUT, { recursive: true });
            spawn(process.platform === "win32" ? "explorer" : "open", [OUT], { detached: true, stdio: "ignore" }).unref();
            return enviar(res, 200, { ok: true });
          }
          return enviar(res, 404, { erro: `rota desconhecida: ${rota}` });
        } catch (e) {
          return enviar(res, 500, { erro: String(e) });
        }
      });
    },
  };
}
