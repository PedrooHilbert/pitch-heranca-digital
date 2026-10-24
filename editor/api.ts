// API local do Estúdio de Revisão (roda dentro do servidor do Vite — sem nuvem, sem login, sem telemetria).
//   GET  /api/projeto               → src/data/project.json
//   PUT  /api/projeto               → valida (Zod), guarda cópia em revisoes/historico/ (últimas 50), salva
//                                     e regenera a composição do Studio
//   GET  /api/revisoes              → revisoes/revisoes.json
//   POST /api/revisoes              → cria pin (+ still do quadro em revisoes/pins/<id>.png)
//   PATCH/DELETE /api/revisoes/:id  → muda status/texto · apaga
//   POST /api/still                 → { frame, projeto, escala? } → PNG (usa o MESMO código das cenas)
//   POST /api/render                → { tipo: "rascunho" | "final", projeto } ; GET /api/render → progresso
//   POST /api/abrir-out             → abre a pasta out/ no Explorer
//   GET  /screens/… /audio/… /brand/… → arquivos de public/ (com suporte a Range, para o áudio)
//   GET  /revisoes/…                → stills dos pins
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const ROOT = path.resolve(__dirname, "..");
const PUB = path.join(ROOT, "public");
const PROJ = path.join(ROOT, "src", "data", "project.json");
const REVDIR = path.join(ROOT, "revisoes");
const REV = path.join(REVDIR, "revisoes.json");
const PINS = path.join(REVDIR, "pins");
const HIST = path.join(REVDIR, "historico");
const OUT = path.join(ROOT, "out");

const TIPOS: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".mp4": "video/mp4",
};

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

/** Arquivo estático com suporte a Range (o <audio> do navegador precisa para pular no tempo). */
function servirArquivo(req: IncomingMessage, res: ServerResponse, f: string) {
  const st = fs.statSync(f);
  res.setHeader("Content-Type", TIPOS[path.extname(f).toLowerCase()] ?? "application/octet-stream");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-cache");
  const r = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (r) {
    const ini = r[1] ? Number(r[1]) : 0;
    const fim = r[2] ? Math.min(Number(r[2]), st.size - 1) : st.size - 1;
    if (ini >= st.size) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${st.size}`);
      return res.end();
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${ini}-${fim}/${st.size}`);
    res.setHeader("Content-Length", String(fim - ini + 1));
    return fs.createReadStream(f, { start: ini, end: fim }).pipe(res);
  }
  res.setHeader("Content-Length", String(st.size));
  fs.createReadStream(f).pipe(res);
}

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

async function regenerarStudio() {
  try {
    const m = await import(pathToFileURL(path.join(ROOT, "scripts", "gerar-studio.mjs")).href);
    m.gerarStudio();
  } catch (e) {
    console.error("[estúdio] não consegui regenerar a composição do Studio:", e);
  }
}

// ---------- still: o Remotion (bundle + Chrome) roda num processo à parte (scripts/editor-still-worker.mjs) ----------
// Se ele cair (falha nativa do webpack/Chrome), só ele morre: o editor responde erro àquele pedido e sobe outro
// worker no próximo. Um still por vez; o bundle fica em cache no worker e é refeito quando src/ muda.
type Pendente = { ok: () => void; falha: (e: Error) => void };
let worker: ReturnType<typeof spawn> | null = null;
const pendentes = new Map<number, Pendente>();
let nPedido = 0;
function abrirWorker() {
  if (worker) return worker;
  const w = spawn(process.execPath, ["--no-warnings", path.join(ROOT, "scripts", "editor-still-worker.mjs")], { cwd: ROOT, stdio: ["pipe", "pipe", "inherit"] });
  let resto = "";
  w.stdout!.on("data", (b: Buffer) => {
    resto += b.toString();
    const linhas = resto.split("\n");
    resto = linhas.pop() ?? "";
    for (const l of linhas) {
      let r: { id?: number; ok?: boolean; erro?: string } | null = null;
      try {
        r = JSON.parse(l);
      } catch {
        /* log do Remotion, não é resposta */
      }
      const p = r?.id != null ? pendentes.get(r.id) : undefined;
      if (!p) {
        if (l.trim()) console.log("[estúdio·still]", l);
        continue;
      }
      pendentes.delete(r!.id!);
      if (r!.ok) p.ok();
      else p.falha(new Error(r!.erro ?? "still falhou"));
    }
  });
  const morreu = (motivo: string) => {
    if (worker !== w) return;
    worker = null;
    if (pendentes.size) console.error(`[estúdio] o processo de stills parou (${motivo}); o próximo pedido abre outro.`);
    for (const p of pendentes.values()) p.falha(new Error(`processo de stills parou (${motivo})`));
    pendentes.clear();
  };
  w.on("exit", (c) => morreu(`código ${c}`));
  w.on("error", (e) => morreu(String(e)));
  w.stdin!.on("error", () => undefined);
  worker = w;
  return w;
}
function pedirWorker(pedido: Record<string, unknown>) {
  return new Promise<void>((ok, falha) => {
    const id = ++nPedido;
    pendentes.set(id, { ok, falha });
    abrirWorker().stdin!.write(JSON.stringify({ id, ...pedido }) + "\n");
  });
}
const aquecerStills = () => pedirWorker({ tipo: "aquecer" });
// Um still por vez: pedidos simultâneos (miniaturas recarregadas + pin) entram na fila.
let filaStill: Promise<unknown> = Promise.resolve();
function renderStillPNG(frame: number, projeto: unknown, saida: string, escala = 0.5) {
  const pedido = { tipo: "still", frame, projeto, saida, escala };
  // se o worker caiu no meio, tenta de novo uma vez (com um worker novo)
  const vez = filaStill.then(() =>
    pedirWorker(pedido).catch((e: Error) => (/processo de stills parou/.test(e.message) ? pedirWorker(pedido) : Promise.reject(e))),
  );
  filaStill = vez.catch(() => undefined);
  return vez;
}
let nStill = 0;

// ---------- render (rascunho 540p / final 1080p) ----------
type Job = { tipo: string; status: "rodando" | "ok" | "erro"; progresso: number; etapa: string; log: string; saida: string; inicio: number };
let job: Job | null = null;
function iniciarRender(tipo: "rascunho" | "final", projeto: unknown) {
  const cache = path.join(OUT, ".cache");
  fs.mkdirSync(cache, { recursive: true });
  let args: string[];
  let saida: string;
  if (tipo === "rascunho") {
    const props = path.join(cache, "props-editor.json");
    fs.writeFileSync(props, JSON.stringify(projeto));
    saida = path.join(OUT, "rascunho-540p.mp4");
    args = ["remotion", "render", "PitchHerancaDigital", JSON.stringify(saida), "--scale=0.5", "--crf=28", `--props=${JSON.stringify(props)}`];
  } else {
    saida = path.join(OUT, "pitch-v2.mp4");
    args = ["--no-warnings", "scripts/render-final.mjs"];
  }
  job = { tipo, status: "rodando", progresso: 0, etapa: "preparando", log: "", saida, inicio: Date.now() };
  const p = spawn(tipo === "rascunho" ? "npx" : "node", args, { cwd: ROOT, shell: true });
  const atual = job;
  const ler = (b: Buffer) => {
    const s = b.toString();
    atual.log = (atual.log + s).slice(-4000);
    const etapa = s.match(/▶ (\d)\/4 ([^\n…]+)/);
    if (etapa) {
      atual.etapa = etapa[2].trim();
      atual.progresso = Math.max(atual.progresso, (Number(etapa[1]) - 1) / 4);
    }
    const m = [...s.matchAll(/Rendered (\d+)\/(\d+)/g)].pop();
    if (m && Number(m[2]) > 0) {
      const f = Number(m[1]) / Number(m[2]);
      atual.progresso = tipo === "rascunho" ? Math.min(0.99, f) : Math.max(atual.progresso, Math.min(0.99, (Math.floor(atual.progresso * 4) + f) / 4));
      if (tipo === "rascunho") atual.etapa = "renderizando";
    }
  };
  p.stdout.on("data", ler);
  p.stderr.on("data", ler);
  p.on("close", (code) => {
    atual.status = code === 0 ? "ok" : "erro";
    if (code === 0) {
      atual.progresso = 1;
      atual.etapa = "pronto";
    }
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
      // rede de segurança: um erro solto num pedido não derruba o editor inteiro (fica registrado no terminal)
      if (!process.listenerCount("uncaughtException")) {
        process.on("uncaughtException", (e) => console.error("[estúdio] erro inesperado (o editor continua rodando):", e));
      }
      server = s;
      // aquece o bundle do Remotion (primeiro still/pin fica rápido)
      setTimeout(() => aquecerStills().catch((e) => console.error("[estúdio] bundle:", e)), 1500);
      s.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://x");
        const rota = `${req.method} ${url.pathname}`;
        try {
          // arquivos de public/ (telas, áudio, marca)
          if (req.method === "GET" && /^\/(screens|audio|brand|fonts)\//.test(url.pathname)) {
            const f = path.join(PUB, decodeURIComponent(url.pathname));
            if (f.startsWith(PUB) && fs.existsSync(f) && fs.statSync(f).isFile()) return servirArquivo(req, res, f);
            res.statusCode = 404;
            return res.end("não encontrado");
          }
          if (req.method === "GET" && url.pathname.startsWith("/revisoes/")) {
            const f = path.join(REVDIR, decodeURIComponent(url.pathname.slice("/revisoes/".length)));
            if (f.startsWith(REVDIR) && fs.existsSync(f)) return servirArquivo(req, res, f);
          }
          if (!url.pathname.startsWith("/api/")) return next();

          if (rota === "GET /api/projeto") return enviar(res, 200, lerJSON(PROJ, null));
          if (rota === "PUT /api/projeto") {
            const p = await corpo(req);
            const v = await validar(p);
            if (!v.success) return enviar(res, 422, { erros: v.error.issues.map((i: any) => ({ caminho: i.path.join("."), msg: i.message })) });
            salvarHistorico();
            gravar(PROJ, p);
            await regenerarStudio();
            return enviar(res, 200, { ok: true, salvoEm: new Date().toISOString() });
          }

          if (rota === "GET /api/revisoes") return enviar(res, 200, lerJSON(REV, []));
          if (rota === "POST /api/revisoes") {
            const { pin, projeto } = await corpo(req);
            const lista = lerJSON(REV, []) as any[];
            const id = lista.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
            const novo: any = { id, ...pin, still: `revisoes/pins/${id}.png`, status: "aberto", criadoEm: new Date().toISOString() };
            try {
              await renderStillPNG(pin.frame, projeto, path.join(PINS, `${id}.png`), 1);
            } catch (e) {
              novo.still = null;
              novo.erroStill = String(e).slice(0, 300);
            }
            lista.push(novo);
            gravar(REV, lista);
            return enviar(res, 200, novo);
          }
          const mRev = url.pathname.match(/^\/api\/revisoes\/(\d+)$/);
          if (mRev && (req.method === "PATCH" || req.method === "DELETE")) {
            const lista = lerJSON(REV, []) as any[];
            const i = lista.findIndex((r) => String(r.id) === mRev[1]);
            if (i < 0) return enviar(res, 404, { erro: "não encontrado" });
            if (req.method === "DELETE") {
              const [rem] = lista.splice(i, 1);
              if (rem?.still) fs.rmSync(path.join(ROOT, rem.still), { force: true });
              gravar(REV, lista);
              return enviar(res, 200, { ok: true });
            }
            lista[i] = { ...lista[i], ...(await corpo(req)), atualizadoEm: new Date().toISOString() };
            gravar(REV, lista);
            return enviar(res, 200, lista[i]);
          }

          if (rota === "POST /api/still") {
            const { frame, projeto, escala } = await corpo(req);
            // arquivo único por pedido (dois pedidos do mesmo quadro não apagam o arquivo um do outro)
            const f = path.join(OUT, ".cache", `still-editor-${frame}-${process.pid}-${++nStill}.png`);
            try {
              await renderStillPNG(frame, projeto, f, escala ?? 0.25);
              const png = fs.readFileSync(f);
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-store");
              return res.end(png);
            } finally {
              fs.rmSync(f, { force: true });
            }
          }

          if (rota === "POST /api/render") {
            if (job?.status === "rodando") return enviar(res, 409, { erro: "já há um render rodando" });
            const { tipo, projeto } = await corpo(req);
            const v = await validar(projeto);
            if (!v.success) return enviar(res, 422, { erro: "projeto inválido — corrija os erros em vermelho antes de renderizar" });
            if (tipo === "final") {
              salvarHistorico();
              gravar(PROJ, projeto);
              await regenerarStudio();
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
