// Tudo que ainda precisa ser preenchido pelo grupo mora aqui (§10 do PROMPT).
// Qualquer texto que contenha "[" aparece DESTACADO EM AMARELO no vídeo
// (componente <Placeholder>), para não esquecer antes da renderização final.

export type Membro = { nome: string; funcao: string };

export const config = {
  // Nome da squad / grupo.
  NOME_DO_GRUPO: "[NOME DO GRUPO]",

  // Integrantes — confirmar com o grupo quem são todos e a função de cada um.
  MEMBROS: [
    { nome: "Walison Librelon", funcao: "[FUNÇÃO]" },
    { nome: "Pedro Morais Hilbert", funcao: "[FUNÇÃO]" },
    { nome: "[DEMAIS INTEGRANTES]", funcao: "[FUNÇÃO]" },
  ] as Membro[],

  // Contato do grupo (e-mail / @ Instagram) — opcional.
  CONTATO: "[E-MAIL / @ DO GRUPO]",

  // Rodapé opcional da abertura.
  DISCIPLINA: "Projeto UC HUB · Sprint 2",

  // Caminho do logo real (símbolo nuvem + cadeado), se o grupo fornecer.
  // Coloque o arquivo em public/brand/ e aponte aqui (ex.: "brand/logo-simbolo.png").
  // Enquanto for null, o componente <Logo> desenha um placeholder SVG.
  LOGO_SIMBOLO: null as string | null,

  // Áudio opcional. Depois de colocar os arquivos em public/audio/, mude para true.
  // (O Remotion não consegue checar a existência do arquivo em tempo de render,
  // por isso usamos flags — veja o README.)
  AUDIO: {
    voz: true, // narração por frase em public/audio/voz/<id>.mp3 (sintética ou gravada — ver README)
    trilha: true, // public/audio/trilha.wav (gerada por scripts/make_music.py, ou a do grupo)
    sfx: true, // efeitos em public/audio/sfx/*.wav (scripts/make_sfx.py)
  },
};

// true se o texto ainda contém um placeholder a preencher.
export const isPlaceholder = (text: string) => text.includes("[");
