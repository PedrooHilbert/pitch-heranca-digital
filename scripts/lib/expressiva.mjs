// Voz expressiva por segmentos (revisão "voz expressiva"): transforma a marcação de src/data/entonacao.ts num plano
// de síntese — cada frase vira 1–5 segmentos, cada um com rate/pitch/volume próprios — que o
// scripts/voz_expressiva.py executa (edge-tts + emendas).
import { pathToFileURL } from "node:url";
import { P, tokens, norm } from "./projeto.mjs";
import { montarFala } from "./fala.mjs";

export const carregarEntonacao = async () => import(pathToFileURL(P("src", "data", "entonacao.ts")).href);

const PONT = /[.,;:!?…]$/;

/** Texto marcado → segmentos [{texto, enfase, pausa: "retic"|"pont"|null, pergunta, exclamacao}] */
export function segmentar(marcado) {
  const segs = [];
  for (const parte of marcado.split("|").map((s) => s.trim()).filter(Boolean)) {
    let dentro = false;
    const toks = tokens(parte).map((tok) => {
      let t = tok;
      let e = dentro;
      if (t.startsWith("*")) {
        e = dentro = true;
        t = t.slice(1);
      }
      const fecha = /\*([.,;:!?…]*)$/.exec(t);
      if (fecha) {
        t = t.slice(0, fecha.index) + fecha[1];
        e = true;
        dentro = false;
      }
      return { t, e };
    });
    // agrupa por ênfase; corta também depois de "…" (pausa dramática)
    let atual = null;
    for (const { t, e } of toks) {
      if (!atual || atual.enfase !== e) {
        atual = { palavras: [], enfase: e };
        segs.push(atual);
      }
      atual.palavras.push(t);
      if (t.endsWith("…")) atual = null;
    }
    if (segs.length) segs[segs.length - 1].corteExplicito = true;
  }
  // pergunta: a última palavra antes de "?" vira segmento próprio com final ascendente
  const out = [];
  for (const s of segs) {
    const ult = s.palavras[s.palavras.length - 1];
    if (ult.endsWith("?") && s.palavras.length > 1 && !s.enfase) {
      out.push({ ...s, palavras: s.palavras.slice(0, -1), corteExplicito: false });
      out.push({ palavras: [ult], enfase: false, pergunta: true, corteExplicito: s.corteExplicito });
    } else out.push({ ...s, pergunta: ult.endsWith("?") });
  }
  return out.map((s) => {
    const texto = s.palavras.join(" ");
    const fim = texto.at(-1);
    return {
      texto,
      enfase: s.enfase,
      pergunta: !!s.pergunta,
      exclamacao: fim === "!",
      pausa: fim === "…" ? "retic" : PONT.test(texto) || s.corteExplicito ? "pont" : null,
    };
  });
}

const soma = (...ds) => ds.reduce((a, d) => ({ rate: a.rate + (d?.rate ?? 0), pitch: a.pitch + (d?.pitch ?? 0), volumeDb: a.volumeDb + (d?.volumeDb ?? 0) }), { rate: 0, pitch: 0, volumeDb: 0 });
const limitar = (x, l) => Math.max(-l, Math.min(l, x));
const sinal = (n, un) => {
  const r = Math.round(n) || 0; // sem "-0"
  return `${r >= 0 ? "+" : ""}${r}${un}`;
};

/**
 * Plano de síntese de uma frase.
 * @param f frase de narracao.ts · @param ent módulo entonacao.ts · @param expr 0..1 · @param baseRate rate base da voz (%)
 */
export function planejar(f, ent, expr, baseRate, grupo, pron) {
  const conf = ent.FRASES[f.id] ?? {};
  const marcado = conf.marcado ?? f.texto;
  // as palavras do texto marcado têm de ser as da narração (só muda a pontuação/marcação)
  const limpa = (s) => tokens(s.replace(/[*|]/g, " ")).map(norm).filter(Boolean).join(" ");
  if (limpa(marcado) !== limpa(f.texto)) throw new Error(`entonacao.ts: ${f.id} não tem as mesmas palavras da narração`);
  const base = soma(ent.CENAS[f.cena], conf.delta);
  const P_ = ent.PARAMS;
  const segs = expr > 0 ? segmentar(marcado) : [{ texto: f.texto, enfase: false, pergunta: false, exclamacao: false, pausa: null }];
  return {
    id: f.id,
    padIniMs: 70,
    padFimMs: 40,
    // "…" no fim da frase: pausa dramática dentro do próprio arquivo
    silencioFimMs: expr > 0 && marcado.trim().endsWith("…") ? Math.round(P_.pausaReticencias * expr) : 0,
    segmentos: segs.map((s, i) => {
      const d = soma(base, s.enfase ? P_.enfase : null, s.pergunta ? P_.pergunta : null, s.exclamacao ? P_.exclamacao : null);
      const rate = limitar(baseRate + d.rate * expr, P_.limite.rate);
      const pitch = limitar(d.pitch * expr, P_.limite.pitch);
      const ultimo = i === segs.length - 1;
      return {
        texto: s.texto,
        fala: montarFala(s.texto, grupo, pron).fala,
        rate: sinal(rate, "%"),
        pitch: sinal(pitch, "Hz"),
        volumeDb: +(d.volumeDb * expr).toFixed(2),
        // silêncio depois do segmento (ms); -1 = colado com crossfade
        // a pausa natural da pontuação já vem na própria síntese (a frase é falada inteira); só "…" ganha silêncio a mais
        pausaDepoisMs: ultimo ? 0 : s.pausa === "retic" ? Math.round(P_.pausaReticencias * expr) : -1,
        marcas: [s.enfase && "ênfase", s.pergunta && "pergunta", s.exclamacao && "exclamação"].filter(Boolean),
      };
    }),
  };
}
