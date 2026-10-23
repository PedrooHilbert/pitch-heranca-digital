// Schema Zod do projeto (PROMPT_V3 §Fase 1). Fonte única de verdade: src/data/project.json.
// Usado pela <Composition> (painel de props do Remotion Studio), pelo Estúdio de Revisão (validação ao vivo)
// e pela API local do editor (validação antes de salvar).
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import regions from "../../public/screens/regions.json";

export const LIMITE_QUADROS = 5400; // 180 s @ 30 fps

export const CENAS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"] as const;
export const TEMAS = ["claro", "escuro", "ambar", "preto"] as const;
export const SONS = [
  "whoosh_short", "whoosh_long", "pop", "lock_click", "thunk", "impact_low", "riser", "tick",
  "chime_ok", "type", "ping", "shutter", "glitch_zap", "rewind", "stinger_logo",
] as const;

const TELAS = regions as unknown as Record<string, { regions: unknown[] }>;
export const NOMES_TELAS = Object.keys(TELAS).map((k) => k.replace(/\.png$/, ""));

const quadro = z.number().int();

export const palavraSchema = z.object({
  w: z.string(),
  de: quadro.describe("quadro local (relativo ao início da cena)"),
  ate: quadro,
});

export const telaSchema = z.object({
  tela: z.string().describe("arquivo em public/screens (sem .png)"),
  regioes: z.array(z.number().int().min(0)).describe("índices de public/screens/regions.json"),
});

export const cenaSchema = z.object({
  id: z.enum(CENAS),
  nome: z.string().regex(/\S/, "nome vazio"),
  dur: z.number().int().min(30).max(LIMITE_QUADROS).describe("duração em quadros (30 = 1 s)"),
  durTravada: z.boolean().optional().describe("duração ajustada à mão: o `npm run sync` não muda (se couber a voz)"),
  fundos: z.record(z.string(), z.enum(TEMAS)).describe("fundo de cada bloco da cena"),
  textos: z.record(z.string(), z.string().regex(/\S/, "texto vazio")).describe("textos que aparecem na tela"),
  telas: z.record(z.string(), telaSchema).describe("tela do protótipo + recorte de cada plano"),
});

export const fraseSchema = z.object({
  id: z.string(),
  cena: z.enum(CENAS),
  texto: z.string(),
  inicio: quadro.min(0).describe("início local da fala na cena"),
  dur: quadro.min(1),
  src: z.string(),
  fonte: z.string(),
  palavras: z.array(palavraSchema),
});

export const legendaSchema = z.object({
  id: z.string(),
  cena: z.enum(CENAS),
  fraseId: z.string(),
  de: quadro,
  ate: quadro,
  palavras: z.array(palavraSchema).min(1, "legenda vazia"),
  manual: z.boolean().optional().describe("editada à mão: o `npm run sync` não sobrescreve"),
});

export const sfxSchema = z.object({
  id: z.string(),
  cena: z.enum(CENAS),
  frame: quadro.describe("quadro local do EVENTO visual (o som antecipa 2–3 q)"),
  som: z.enum(SONS),
  ganhoDb: z.number().min(-40).max(6),
  manual: z.boolean().optional().describe("editado à mão: o `npm run sync` não sobrescreve"),
});

export const temaSchema = z.object({
  teal900: zColor(), teal800: zColor(), teal700: zColor(), teal600: zColor(), teal400: zColor(),
  mint: zColor(), mintSoft: zColor(), mintSoft2: zColor(), tealTint: zColor(), bg: zColor(), bg2: zColor(),
  card: zColor(), cardBorder: zColor(), ink: zColor(), ink2: zColor(), ink3: zColor(),
  amber: zColor(), amberBg: zColor(), amberBorder: zColor(), green: zColor(), greenBg: zColor(),
  blue: zColor(), blueBg: zColor(), red: zColor(), white: zColor(),
});

export const projetoSchema = z
  .object({
    versao: z.literal(3),
    fps: z.literal(30),
    largura: z.literal(1920),
    altura: z.literal(1080),
    bpm: z.number().positive(),
    framesPorBatida: z.number().int().positive(),
    vozSintetica: z.string().nullable(),
    equipe: z.object({
      marca: z.string().min(1).describe("nome do produto (provisório); a última palavra fica na cor de destaque"),
      nomeDoGrupo: z.string().min(1),
      disciplina: z.string(),
      contato: z.string().describe("vazio = não aparece no fechamento"),
      membros: z.array(z.object({ nome: z.string().regex(/\S/, "nome vazio"), funcao: z.string().describe("vazio = só o nome") })).min(1),
      logoSimbolo: z.string().nullable().describe("ex.: brand/logo-simbolo.png (null = desenho provisório)"),
      slogan: z.string().min(1),
    }),
    tema: temaSchema,
    audio: z.object({
      voz: z.object({ ativo: z.boolean(), ganhoDb: z.number().min(-24).max(12) }),
      trilha: z.object({ ativo: z.boolean(), ganhoDb: z.number().min(-24).max(12), duckingDb: z.number().min(-24).max(0) }),
      sfx: z.object({ ativo: z.boolean(), ganhoDb: z.number().min(-24).max(12) }),
    }),
    cenas: z.array(cenaSchema).length(9),
    frases: z.array(fraseSchema),
    legendas: z.array(legendaSchema),
    sfx: z.array(sfxSchema),
  })
  .superRefine((p, ctx) => {
    const total = p.cenas.reduce((a, c) => a + c.dur, 0);
    if (total > LIMITE_QUADROS) {
      ctx.addIssue({ code: "custom", path: ["cenas"], message: `Duração total ${(total / 30).toFixed(1)} s passa de 180 s (${total} > ${LIMITE_QUADROS} quadros).` });
    }
    const durDe = Object.fromEntries(p.cenas.map((c) => [c.id, c.dur]));
    p.frases.forEach((f, i) => {
      if (f.inicio + f.dur > durDe[f.cena]) {
        ctx.addIssue({ code: "custom", path: ["frases", i], message: `A fala ${f.id} termina depois do fim da cena ${f.cena} — a voz seria cortada.` });
      }
    });
    p.cenas.forEach((c, ci) => {
      for (const [k, t] of Object.entries(c.telas)) {
        const info = TELAS[`${t.tela}.png`];
        if (!info) {
          ctx.addIssue({ code: "custom", path: ["cenas", ci, "telas", k], message: `Tela "${t.tela}" não existe em public/screens/.` });
          continue;
        }
        const ruim = t.regioes.filter((r) => r >= info.regions.length);
        if (ruim.length) ctx.addIssue({ code: "custom", path: ["cenas", ci, "telas", k], message: `Recorte ${ruim.join(", ")} não existe na tela ${t.tela}.` });
      }
    });
  });

export type Projeto = z.infer<typeof projetoSchema>;
export type Cena = z.infer<typeof cenaSchema>;
export type Frase = z.infer<typeof fraseSchema>;
export type Legenda = z.infer<typeof legendaSchema>;
export type SfxCue = z.infer<typeof sfxSchema>;
export type Som = (typeof SONS)[number];
export type TemaFundo = (typeof TEMAS)[number];
export type CenaId = (typeof CENAS)[number];
