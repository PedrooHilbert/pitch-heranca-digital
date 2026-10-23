// Dados da equipe e liga/desliga de áudio — lidos do projeto (project.json → equipe / audio).
// Qualquer texto que contenha "[" aparece DESTACADO EM AMARELO no vídeo (<Placeholder>).
import { getProjeto } from "./projeto";

export type Membro = { nome: string; funcao: string };

/** Nome do produto dividido para o wordmark: [início, última palavra em destaque]. */
export const marcaPartes = (): [string, string] => {
  const m = getProjeto().equipe.marca.trim();
  const i = m.lastIndexOf(" ");
  return i < 0 ? ["", m] : [m.slice(0, i) + " ", m.slice(i + 1)];
};

export const config = {
  get MARCA() {
    return getProjeto().equipe.marca;
  },
  get NOME_DO_GRUPO() {
    return getProjeto().equipe.nomeDoGrupo;
  },
  get MEMBROS(): Membro[] {
    return getProjeto().equipe.membros;
  },
  get CONTATO() {
    return getProjeto().equipe.contato;
  },
  get DISCIPLINA() {
    return getProjeto().equipe.disciplina;
  },
  get LOGO_SIMBOLO() {
    return getProjeto().equipe.logoSimbolo;
  },
  get AUDIO() {
    const a = getProjeto().audio;
    return { voz: a.voz.ativo, trilha: a.trilha.ativo, sfx: a.sfx.ativo };
  },
};

// true se o texto ainda contém um placeholder a preencher.
export const isPlaceholder = (text: string) => text.includes("[");
