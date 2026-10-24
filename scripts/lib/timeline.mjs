// Monta a timeline GUIADA PELO ÁUDIO (PROMPT_V2 §4.3).
// Duração de cada cena = entrada + soma das frases + respiros + cauda, nunca menor que o
// mínimo nominal, arredondada PARA CIMA para meias batidas (as cenas começam na grade rítmica).
// Se a soma passar de 5400 quadros (180 s): ignora mínimos → encurta respiros/caudas.
// Se ainda assim estourar, o chamador acelera a voz (sync.mjs).

export const CENAS = [
  // min = duração nominal mínima (s); lead/respiro/cauda em quadros
  { id: "s1", nome: "Abertura", min: 9, lead: 16, respiro: 11, cauda: 12, tema: "escuro" }, // lead 16 + ~1 q de margem → 1ª palavra ≥ 10 q depois do impacto (f6)
  { id: "s2", nome: "Problema", min: 18, lead: 8, respiro: 13, cauda: 20, tema: "claro" },
  { id: "s3", nome: "Proposta de valor", min: 15, lead: 10, respiro: 11, cauda: 30, tema: "escuro" },
  { id: "s4", nome: "Como funciona", min: 12, lead: 8, respiro: 14, cauda: 26, tema: "claro" },
  { id: "s5", nome: "Demo do protótipo", min: 42, lead: 10, respiro: 11, cauda: 20, tema: "claro" },
  { id: "s6", nome: "Segurança", min: 17, lead: 8, respiro: 13, cauda: 26, tema: "escuro" },
  { id: "s7", nome: "Concorrência", min: 12, lead: 8, respiro: 11, cauda: 26, tema: "claro" },
  { id: "s8", nome: "Modelo de negócio", min: 10, lead: 8, respiro: 11, cauda: 150, tema: "escuro" }, // cauda longa: frase final + rodapé precisam de ~4 s para ler (revisão #18)
  { id: "s9", nome: "Equipe e fechamento", min: 16, lead: 8, respiro: 11, cauda: 96, tema: "claro" },
];

// Ordem de recuo quando estoura 180 s (PROMPT_V2 §4.3: reduzir respiros → acelerar voz → enxugar).
// Pausas-alvo entre frases: 0,25–0,4 s (8–12 q).
const NIVEIS = [
  { nome: "padrão", min: 1, respiro: 1, cauda: 1 },
  { nome: "sem mínimos", min: 0, respiro: 1, cauda: 1 },
  { nome: "respiros 80%", min: 0, respiro: 0.8, cauda: 0.85 },
  { nome: "respiros 65%", min: 0, respiro: 0.65, cauda: 0.7 },
  { nome: "enxuto", min: 0, respiro: 0.45, cauda: 0.55 },
];

/**
 * @param frases [{id, cena, texto, sec, palavras:[{w,s,e}], fonte}]  (ordem do roteiro)
 * @param fpb quadros por batida
 */
// Pausa entre frases: no máximo 6 q de timeline. Somada às bordas do áudio (~0,08 s depois da última palavra +
// ~0,07 s antes da primeira) dá ≈ 0,35 s de silêncio real — a faixa pedida é 0,25–0,4 s. O tempo que sobra vai
// para o fim das cenas (animação), não para buracos na fala.
const PAUSA_MAX = 6;

export function montarTimeline(frases, fpb, fps = 30, limite = 5400) {
  let ultimo = null;
  for (const nivel of NIVEIS) {
    const r = tentar(frases, fpb, fps, nivel);
    ultimo = r;
    if (r.total <= limite) return { ...r, estourou: false };
  }
  return { ...ultimo, estourou: true };
}

function tentar(frases, fpb, fps, nivel) {
  let from = 0;
  const cenas = [];
  const out = [];
  for (const c of CENAS) {
    const fr = frases.filter((f) => f.cena === c.id);
    let cur = c.lead;
    fr.forEach((f, k) => {
      // pausa antes da frase: a da narração (fixa, a animação depende dela) ou o respiro da cena
      if (k > 0) cur += f.pausa ?? Math.min(PAUSA_MAX, Math.round(c.respiro * nivel.respiro));
      const durF = Math.ceil(f.sec * fps);
      const abs = from + cur;
      out.push({
        id: f.id,
        cena: c.id,
        texto: f.texto,
        fonte: f.fonte,
        from: abs,
        dur: durF,
        src: `audio/voz/${f.id}.mp3`,
        palavras: f.palavras.map((p) => ({
          w: p.w,
          from: abs + Math.round(p.s * fps),
          to: abs + Math.max(Math.round(p.s * fps) + 1, Math.round(p.e * fps)),
        })),
      });
      cur += durF;
    });
    const conteudo = cur + Math.round(c.cauda * nivel.cauda);
    let dur = Math.max(Math.round(c.min * fps * nivel.min), conteudo);
    // fronteiras de cena na MEIA batida (8 q) — o PROMPT permite e evita perder até 15 q por cena
    const grade = fpb / 2;
    dur = Math.ceil(dur / grade) * grade;
    cenas.push({ id: c.id, nome: c.nome, tema: c.tema, from, dur });
    from += dur;
  }
  return { nivel: nivel.nome, total: from, cenas, frases: out };
}
