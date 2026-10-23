// Legendas queimadas derivadas dos TEMPOS POR PALAVRA da narração (PROMPT_V2 §4.3).
// Cada frase vira 1+ blocos de até 2 linhas; o bloco inteiro aparece um pouco antes da
// primeira palavra e cada palavra "acende" no frame em que é dita (estilo karaokê).
// Tempo mínimo de leitura de um bloco: max(20 q, nº palavras × 10 q + 12) — PROMPT_V2 §2.
import { TL, Palavra } from "./timeline";
import { config } from "./config";

export type BlocoLegenda = {
  fraseId: string;
  from: number; // aparece
  to: number; // some
  palavras: Palavra[];
};

// até 3 linhas: quase toda frase cabe num bloco só — cada troca de bloco "rouba" tempo de leitura
const MAX_CHARS = 124;
const PONTO_FORTE = /[.!?…:]$/;
const PONTO = /[,;]$/;

const leituraMin = (n: number) => Math.max(20, n * 10 + 12);

function quebrar(palavras: Palavra[]): Palavra[][] {
  const out: Palavra[][] = [];
  let atual: Palavra[] = [];
  let chars = 0;
  palavras.forEach((p, i) => {
    atual.push(p);
    chars += p.w.length + 1;
    const resto = palavras.length - i - 1;
    const forte = PONTO_FORTE.test(p.w);
    const fraco = PONTO.test(p.w);
    const cheio = chars > MAX_CHARS - 10;
    if (resto > 0 && ((forte && atual.length >= 4 && chars > 30) || (fraco && chars > 70 && resto >= 4) || cheio)) {
      out.push(atual);
      atual = [];
      chars = 0;
    }
  });
  if (atual.length) {
    // bloco final muito curto gruda no anterior se couber
    const ult = out[out.length - 1];
    if (ult && atual.length <= 2 && ult.map((p) => p.w).join(" ").length + 12 < MAX_CHARS + 8) {
      ult.push(...atual);
    } else out.push(atual);
  }
  return out;
}

const nomeGrupo = config.NOME_DO_GRUPO;

export const LEGENDAS: BlocoLegenda[] = (() => {
  const blocos: BlocoLegenda[] = [];
  for (const f of TL.frases) {
    for (const ps of quebrar(f.palavras)) {
      blocos.push({ fraseId: f.id, from: ps[0].from - 4, to: ps[ps.length - 1].to + 10, palavras: ps });
    }
  }
  // garante leitura mínima: aparece mais cedo (até 15 q antes da 1ª palavra, sem invadir o bloco
  // anterior) e fica mais tempo (até o próximo bloco). Se ainda faltar, o próximo bloco entra
  // até 10 q depois da sua 1ª palavra (atraso imperceptível no karaokê).
  for (let i = 0; i < blocos.length; i++) {
    const b = blocos[i];
    const ant = blocos[i - 1];
    const prox = blocos[i + 1];
    const minimo = leituraMin(b.palavras.length);
    if (b.to - b.from < minimo) b.from = Math.max(ant ? ant.to : 0, b.palavras[0].from - 15, b.to - minimo);
    if (b.to - b.from < minimo) {
      const alvo = b.from + minimo;
      const limite = prox ? Math.min(alvo, prox.palavras[0].from + 10) : Math.min(alvo, TL.total);
      b.to = Math.max(b.to, limite);
      if (prox && prox.from < b.to) prox.from = b.to;
    } else if (prox && b.to > prox.from) {
      b.to = prox.from;
    }
  }
  return blocos;
})();

export const legendaEm = (frame: number) => LEGENDAS.find((b) => frame >= b.from && frame < b.to);

/** Usado pela auditoria de legibilidade. */
export const auditoriaLegendas = () =>
  LEGENDAS.map((b) => ({
    fraseId: b.fraseId,
    palavras: b.palavras.length,
    naTela: b.to - b.from,
    minimo: leituraMin(b.palavras.length),
    ok: b.to - b.from >= leituraMin(b.palavras.length),
    texto: b.palavras.map((p) => p.w).join(" "),
  }));

// Palavras que pertencem a um placeholder ainda não preenchido (pintadas de amarelo).
const tokensPlaceholder = new Set(
  nomeGrupo.includes("[") ? nomeGrupo.split(/\s+/).map((t) => t.replace(/[^\p{L}\p{N}[\]]/gu, "")) : [],
);
export const temPlaceholder = (w: string) =>
  w.includes("[") || w.includes("]") || tokensPlaceholder.has(w.replace(/[^\p{L}\p{N}[\]]/gu, ""));
