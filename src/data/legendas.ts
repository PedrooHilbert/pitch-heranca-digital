// Legendas queimadas (karaokê). Em tempo de render vêm do projeto (project.json → legendas, editáveis
// no Estúdio de Revisão). `gerarLegendas()` cria os blocos a partir dos tempos por palavra da voz e é
// usada pelo `npm run sync` quando a narração muda.
// Tempo mínimo de leitura de um bloco: max(20 q, nº palavras × 10 q + 12) — PROMPT_V2 §2.
import { derivado, type FraseAbs, type LegendaAbs, type PalavraAbs } from "./projeto";
import { config } from "./config";

const MAX_CHARS = 124; // até 3 linhas: quase toda fala cabe num bloco só
const PONTO_FORTE = /[.!?…:]$/;
const PONTO = /[,;]$/;

export const leituraMin = (n: number) => Math.max(20, n * 10 + 12);

function quebrar(palavras: PalavraAbs[]): PalavraAbs[][] {
  const out: PalavraAbs[][] = [];
  let atual: PalavraAbs[] = [];
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
    const ult = out[out.length - 1];
    if (ult && atual.length <= 2 && ult.map((p) => p.w).join(" ").length + 12 < MAX_CHARS + 8) ult.push(...atual);
    else out.push(atual);
  }
  return out;
}

/** Gera os blocos de legenda (tempos ABSOLUTOS) a partir das falas. */
export function gerarLegendas(frases: FraseAbs[], total: number): Omit<LegendaAbs, "id" | "cena">[] {
  const blocos: Omit<LegendaAbs, "id" | "cena">[] = [];
  for (const f of frases) {
    for (const ps of quebrar(f.palavras)) blocos.push({ fraseId: f.id, from: ps[0].from - 4, to: ps[ps.length - 1].to + 10, palavras: ps });
  }
  // leitura mínima: aparece até 15 q antes da 1ª palavra (sem invadir o anterior) e fica mais;
  // se ainda faltar, o próximo bloco entra até 10 q depois da sua 1ª palavra.
  for (let i = 0; i < blocos.length; i++) {
    const b = blocos[i];
    const ant = blocos[i - 1];
    const prox = blocos[i + 1];
    const minimo = leituraMin(b.palavras.length);
    if (b.to - b.from < minimo) b.from = Math.max(ant ? ant.to : 0, b.palavras[0].from - 15, b.to - minimo);
    if (b.to - b.from < minimo) {
      const alvo = b.from + minimo;
      const limite = prox ? Math.min(alvo, prox.palavras[0].from + 10) : Math.min(alvo, total);
      b.to = Math.max(b.to, limite);
      if (prox && prox.from < b.to) prox.from = b.to;
    } else if (prox && b.to > prox.from) {
      b.to = prox.from;
    }
  }
  return blocos;
}

export const legendas = () => derivado().legendas;
export const legendaEm = (frame: number) => derivado().legendas.find((b) => frame >= b.from && frame < b.to);

/** Usado pela auditoria de legibilidade. */
export const auditoriaLegendas = () =>
  derivado().legendas.map((b) => ({
    id: b.id,
    fraseId: b.fraseId,
    palavras: b.palavras.length,
    naTela: b.to - b.from,
    minimo: leituraMin(b.palavras.length),
    ok: b.to - b.from >= leituraMin(b.palavras.length),
    texto: b.palavras.map((p) => p.w).join(" "),
  }));

// Palavras que pertencem a um placeholder ainda não preenchido (pintadas de amarelo).
export const temPlaceholder = (w: string) => {
  if (w.includes("[") || w.includes("]")) return true;
  const nome = config.NOME_DO_GRUPO;
  if (!nome.includes("[")) return false;
  const limpa = (s: string) => s.replace(/[^\p{L}\p{N}[\]]/gu, "");
  return nome.split(/\s+/).map(limpa).includes(limpa(w));
};
