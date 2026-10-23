import type { Projeto } from "../src/data/schema";

export const FPS = 30;

/** mm:ss.f */
export const tempo = (frame: number) => {
  const s = Math.max(0, frame) / FPS;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};

/** Arredonda para a grade de batidas (Shift desliga). */
export const encaixar = (q: number, grade: number, livre = false) => (livre ? Math.round(q) : Math.round(q / grade) * grade);

/** Todos os [PLACEHOLDERS] que ainda aparecem no vídeo. */
export const placeholders = (p: Projeto) => {
  const re = /\[[^\]\n]+\]/g;
  const out: { valor: string; onde: string }[] = [];
  const varrer = (v: unknown, onde: string) => {
    if (typeof v === "string") for (const m of v.match(re) ?? []) out.push({ valor: m, onde });
    else if (Array.isArray(v)) v.forEach((x, i) => varrer(x, `${onde}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) varrer(x, onde ? `${onde}.${k}` : k);
  };
  varrer(p.equipe, "equipe");
  p.cenas.forEach((c) => varrer(c.textos, `${c.id}.textos`));
  return out;
};

/** Redistribui os tempos das palavras de uma legenda quando o texto muda (proporcional às letras). */
export const redistribuir = (texto: string, de: number, ate: number) => {
  const ws = texto.split(/\s+/).filter(Boolean);
  const pesos = ws.map((w) => w.length + 1);
  const tot = pesos.reduce((a, b) => a + b, 0) || 1;
  let acc = de;
  return ws.map((w, i) => {
    const d = ((ate - de) * pesos[i]) / tot;
    const r = { w, de: Math.round(acc), ate: Math.max(Math.round(acc) + 1, Math.round(acc + d)) };
    acc += d;
    return r;
  });
};

export const CATEGORIAS = ["Texto", "Visual", "Animação", "Áudio/Voz", "Tempo", "Conteúdo"] as const;
export const GRAVIDADES = ["Alta", "Média", "Baixa"] as const;

export type Revisao = {
  id: number;
  frame: number;
  tempo: string;
  cena: string;
  cenaNome: string;
  x: number | null;
  y: number | null;
  categoria: (typeof CATEGORIAS)[number];
  gravidade: (typeof GRAVIDADES)[number];
  texto: string;
  queroQue?: string;
  still: string | null;
  status: "aberto" | "em-andamento" | "feito";
  criadoEm: string;
};

export const TEMAS_FUNDO = ["claro", "escuro", "ambar", "preto"] as const;

/** O que está selecionado (inspetor). */
export type Selecao =
  | { tipo: "cena"; id: string }
  | { tipo: "legenda"; id: string }
  | { tipo: "sfx"; id: string }
  | { tipo: "frase"; id: string }
  | { tipo: "pin"; id: number }
  | { tipo: "projeto" }
  | { tipo: "audio" };

export type TrilhaId = "cenas" | "legendas" | "voz" | "sfx" | "trilha" | "comentarios";

/** Arrasto com o mouse: chama `mover(dxPx, shift)` e `fim()` ao soltar. */
export function arrastar(e: { clientX: number; preventDefault(): void; stopPropagation(): void }, mover: (dx: number, shift: boolean) => void, fim?: () => void) {
  e.preventDefault();
  e.stopPropagation();
  const x0 = e.clientX;
  const mv = (ev: MouseEvent) => mover(ev.clientX - x0, ev.shiftKey);
  const up = () => {
    window.removeEventListener("mousemove", mv);
    window.removeEventListener("mouseup", up);
    fim?.();
  };
  window.addEventListener("mousemove", mv);
  window.addEventListener("mouseup", up);
}

export const limitar = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
