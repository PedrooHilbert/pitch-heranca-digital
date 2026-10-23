// Utilitários compartilhados pelos scripts do pipeline (voz, timeline, áudio).
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const P = (...a) => path.join(ROOT, ...a);

// ffmpeg COMPLETO (imageio-ffmpeg, instalado via pip) — o do Remotion é uma build enxuta.
let ff;
export const ffmpeg = () =>
  (ff ??= execFileSync("python", ["-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"])
    .toString()
    .trim());
export const FFPROBE = P("node_modules", "@remotion", "compositor-win32-x64-msvc", "ffprobe.exe");

export const run = (bin, args, opts = {}) =>
  execFileSync(bin, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, ...opts });

/** Roda o ffmpeg e devolve stderr+stdout como texto (é onde ele escreve as medições). */
export const ffLog = (args) => {
  const r = spawnSync(ffmpeg(), args, { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0 && !/loudnorm|silencedetect|ebur128|volumedetect/.test(args.join(" "))) {
    throw new Error(`ffmpeg falhou (${r.status}): ${(r.stderr ?? "").slice(-800)}`);
  }
  return (r.stderr ?? "") + (r.stdout ?? "");
};

export const duracao = (file) =>
  parseFloat(run(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());

const imp = async (rel) => import(pathToFileURL(P(rel)).href);
export const carregarNarracao = async () => (await imp("src/data/narracao.ts")).NARRACAO;
export const carregarPronuncia = async () => (await imp("src/data/pronuncia.ts")).PRONUNCIA;
export const carregarVoz = async () => (await imp("src/data/voz.ts")).VOZ_ESCOLHIDA;

// Pós-processamento leve da voz (revisão de voz), antes da normalização para −16 LUFS:
// corta graves abaixo de 80 Hz, de-esser suave (sibilância ~6–8 kHz), compressão 2,2:1 e fade de 20 ms
// no início (o do fim é feito no corte do silêncio final). Nada de time-stretch.
export const FILTRO_VOZ = "highpass=f=80,deesser=i=0.25:m=0.5:f=0.5:s=o,acompressor=threshold=-21dB:ratio=2.2:attack=8:release=140:makeup=1.5,afade=t=in:d=0.02";
// config.ts lê o projeto (imports sem extensão, que o Node puro não resolve): os scripts leem o project.json direto
export const carregarConfig = async () => {
  const e = lerJSON(P("src", "data", "project.json")).equipe;
  return { NOME_DO_GRUPO: e.nomeDoGrupo, MARCA: e.marca, CONTATO: e.contato, MEMBROS: e.membros };
};
export const carregarMusica = async () => imp("src/data/music.ts");

export const tokens = (s) => s.split(/\s+/).filter(Boolean);
export const norm = (w) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

export const lerJSON = (f, padrao = null) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : padrao);
export const gravarJSON = (f, obj) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj, null, 1), "utf8");
};
