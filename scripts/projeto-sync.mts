// Atualiza src/data/project.json (fonte única de verdade) a partir da voz — PROMPT_V3 §Fase 1.
// Chamado pelo `npm run sync` depois de gerar src/data/timeline.json (tempos da voz).
//   • cenas: duração vinda da voz (mantém as marcadas `durTravada` se ainda couber a fala)
//   • frases: tempos por palavra (relativos à cena)
//   • legendas: regeneradas a partir das falas (mantém as marcadas `manual`)
//   • sfx: regenerados a partir dos eventos de animação das cenas (mantém os `manual`)
//   • textos/fundos/telas: preserva o que já está no projeto; completa chaves novas com o padrão das cenas
//   • equipe/tema/audio: preservados (na primeira vez vêm de config/tema padrão)
// Valida tudo com o schema Zod antes de gravar.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projetoSchema, LIMITE_QUADROS, type Projeto, type CenaId } from "../src/data/schema";
import { setProjeto, derivado } from "../src/data/projeto";
import { gerarLegendas } from "../src/data/legendas";
import { gerarCues } from "../src/data/sfx-cues";
import { PADRAO_S1 } from "../src/cenas/S1Abertura";
import { PADRAO_S2 } from "../src/cenas/S2Problema";
import { PADRAO_S3 } from "../src/cenas/S3Proposta";
import { PADRAO_S4 } from "../src/cenas/S4ComoFunciona";
import { PADRAO_S5 } from "../src/cenas/S5Demo";
import { PADRAO_S6 } from "../src/cenas/S6Seguranca";
import { PADRAO_S7 } from "../src/cenas/S7Concorrencia";
import { PADRAO_S8 } from "../src/cenas/S8Modelo";
import { PADRAO_S9 } from "../src/cenas/S9Fechamento";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARQ = path.join(ROOT, "src", "data", "project.json");
const TLJ = path.join(ROOT, "src", "data", "timeline.json");

type TLCena = { id: CenaId; nome: string; from: number; dur: number };
type TLFrase = { id: string; cena: CenaId; texto: string; fonte: string; from: number; dur: number; src: string; palavras: { w: string; from: number; to: number }[] };
const tl = JSON.parse(fs.readFileSync(TLJ, "utf8")) as { bpm: number; framesPerBeat: number; vozSintetica: string | null; cenas: TLCena[]; frases: TLFrase[] };

const PADRAO: Record<CenaId, { textos: object; fundos: object; telas: object }> = {
  s1: PADRAO_S1, s2: PADRAO_S2, s3: PADRAO_S3, s4: PADRAO_S4, s5: PADRAO_S5,
  s6: PADRAO_S6, s7: PADRAO_S7, s8: PADRAO_S8, s9: PADRAO_S9,
};

const TEMA_PADRAO = {
  teal900: "#0B3F3D", teal800: "#07302F", teal700: "#0E5A57", teal600: "#14706B", teal400: "#2FA79A",
  mint: "#7FD1C5", mintSoft: "#CFE3DF", mintSoft2: "#A9C7C2", tealTint: "#E2F0ED", bg: "#F3F6F4", bg2: "#E9F1EE",
  card: "#FFFFFF", cardBorder: "#DCE3E0", ink: "#13211F", ink2: "#44544F", ink3: "#5E6E69",
  amber: "#B45309", amberBg: "#FFF3D6", amberBorder: "#F5C86B", green: "#15803D", greenBg: "#E3F4E8",
  blue: "#1E4E6B", blueBg: "#D7E9F5", red: "#B42318", white: "#FFFFFF",
};
const EQUIPE_PADRAO = {
  marca: "Herança Digital",
  nomeDoGrupo: "[NOME DO GRUPO]",
  disciplina: "Projeto UC HUB · Sprint 2",
  contato: "[E-MAIL / @ DO GRUPO]",
  membros: [
    { nome: "Walison Librelon", funcao: "[FUNÇÃO]" },
    { nome: "Pedro Morais Hilbert", funcao: "[FUNÇÃO]" },
    { nome: "[DEMAIS INTEGRANTES]", funcao: "[FUNÇÃO]" },
  ],
  logoSimbolo: null as string | null,
  slogan: "Seus dados, sua história, seu futuro.",
};

const antigo: Partial<Projeto> = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, "utf8")) : {};
const antCena = (id: CenaId) => antigo.cenas?.find((c) => c.id === id);

// --- cenas (duração da voz, ou a travada se couber a fala) ---
const inicioTL = Object.fromEntries(tl.cenas.map((c) => [c.id, c.from]));
const cenas = tl.cenas.map((c) => {
  const a = antCena(c.id);
  const pad = PADRAO[c.id];
  const fimFala = Math.max(0, ...tl.frases.filter((f) => f.cena === c.id).map((f) => f.from + f.dur - c.from));
  const travada = a?.durTravada && a.dur >= fimFala + 8;
  const textos = { ...(pad.textos as Record<string, string>), ...(a?.textos ?? {}) };
  const fundos = { ...(pad.fundos as Record<string, string>), ...(a?.fundos ?? {}) };
  const telas = { ...(pad.telas as Record<string, { tela: string; regioes: number[] }>), ...(a?.telas ?? {}) };
  for (const [k, v] of Object.entries(telas)) telas[k] = { tela: v.tela, regioes: [...v.regioes] };
  return { id: c.id, nome: a?.nome ?? c.nome, dur: travada ? a!.dur : c.dur, ...(travada ? { durTravada: true } : {}), fundos, textos, telas };
});

// --- falas (tempos relativos à cena) ---
const frases = tl.frases.map((f) => ({
  id: f.id, cena: f.cena, texto: f.texto, fonte: f.fonte, src: f.src, dur: f.dur,
  inicio: f.from - inicioTL[f.cena],
  palavras: f.palavras.map((w) => ({ w: w.w, de: w.from - inicioTL[f.cena], ate: w.to - inicioTL[f.cena] })),
}));

const base = {
  versao: 3 as const,
  fps: 30 as const,
  largura: 1920 as const,
  altura: 1080 as const,
  bpm: tl.bpm,
  framesPorBatida: tl.framesPerBeat,
  vozSintetica: tl.vozSintetica,
  equipe: { ...EQUIPE_PADRAO, ...(antigo.equipe ?? {}) },
  tema: { ...TEMA_PADRAO, ...(antigo.tema ?? {}) },
  audio: antigo.audio ?? {
    voz: { ativo: true, ganhoDb: 0 },
    trilha: { ativo: true, ganhoDb: 0, duckingDb: -6 },
    sfx: { ativo: true, ganhoDb: 0 },
  },
  cenas,
  frases,
  legendas: [] as Projeto["legendas"],
  sfx: [] as Projeto["sfx"],
} as Projeto;

// Calcula legendas e efeitos com o projeto novo ativo (as cenas leem os tempos dele)
setProjeto(base);
const d = derivado(base);
const inicio = d.inicioDe;
// legenda manual só sobrevive se a fala dela não mudou de texto (fala reescrita → legenda gerada de novo)
const textoAntigo = new Map((antigo.frases ?? []).map((f) => [f.id, f.texto]));
const manuaisLeg = (antigo.legendas ?? []).filter((l) => {
  if (!l.manual) return false;
  const nova = d.frases.find((f) => f.id === l.fraseId);
  const ok = !!nova && nova.texto === textoAntigo.get(l.fraseId);
  if (!ok) console.log(`  legenda manual ${l.id} (${l.fraseId}) descartada: a fala mudou de texto`);
  return ok;
});
const fraseManual = new Set(manuaisLeg.map((l) => l.fraseId));
const geradas = gerarLegendas(d.frases.filter((f) => !fraseManual.has(f.id)), d.total).map((l) => {
  const cena = d.frases.find((f) => f.id === l.fraseId)!.cena;
  return { cena, fraseId: l.fraseId, de: l.from - inicio[cena], ate: l.to - inicio[cena], palavras: l.palavras.map((w) => ({ w: w.w, de: w.from - inicio[cena], ate: w.to - inicio[cena] })) };
});
const legendas = [...geradas, ...manuaisLeg.map(({ id: _i, ...r }) => r)]
  .sort((a, b) => inicio[a.cena] + a.de - (inicio[b.cena] + b.de))
  .map((l, i) => ({ id: `L${String(i + 1).padStart(2, "0")}`, ...l }));

const manuaisSfx = (antigo.sfx ?? []).filter((s) => s.manual);
const sfx = [...gerarCues(), ...manuaisSfx]
  .sort((a, b) => inicio[a.cena] + a.frame - (inicio[b.cena] + b.frame))
  .map((s, i) => ({ ...s, id: "manual" in s && s.manual ? s.id : `x${String(i + 1).padStart(3, "0")}` }));

const projeto = { ...base, legendas, sfx };
const v = projetoSchema.safeParse(projeto);
if (!v.success) {
  console.error("✗ projeto inválido — NÃO gravei:");
  for (const i of v.error.issues) console.error(`   ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
fs.writeFileSync(ARQ, JSON.stringify(projeto, null, 1), "utf8");
const total = projeto.cenas.reduce((a, c) => a + c.dur, 0);
console.log(`✓ project.json: ${total} q = ${(total / 30).toFixed(2)} s (máx. ${LIMITE_QUADROS}) · ${frases.length} falas · ${legendas.length} legendas (${manuaisLeg.length} manuais) · ${sfx.length} efeitos (${manuaisSfx.length} manuais)`);
