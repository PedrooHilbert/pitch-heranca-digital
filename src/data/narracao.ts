// Roteiro de narração v2 (PROMPT_V2 §4.1) — UMA frase por id.
// Fonte única do texto: usada pela voz sintética, pelo roteiro de gravação,
// pela timeline guiada pelo áudio e pelas legendas.
// Este arquivo NÃO importa nada (é lido também por scripts Node via type stripping).
// "[NOME DO GRUPO]" é substituído pelo valor de config.NOME_DO_GRUPO onde for exibido/falado.

export type CenaId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9";

export type Frase = {
  id: string;
  cena: CenaId;
  texto: string;
  dica: string; // dica de entonação para quem for gravar
  /** silêncio ANTES desta frase, em quadros (substitui o respiro padrão da cena — use quando a animação precisa de espaço) */
  pausa?: number;
};

export const NARRACAO: Frase[] = [
  // S1 — Abertura (gancho A, revisão #1): uma pergunta por frase, cada uma vira um "estouro" na tela.
  { id: "s01_01", cena: "s1", texto: "Quando você morrer…", dica: "Grave e lento, quase sussurrado. Segure as reticências." },
  { id: "s01_02", cena: "s1", texto: "quem fica com o seu Instagram?", dica: "Pergunta direta, olhando pra plateia. Ênfase em \"quem fica\".", pausa: 3 },
  { id: "s01_03", cena: "s1", texto: "Com o seu e-mail?", dica: "Curta, subindo a entonação.", pausa: 3 },
  { id: "s01_04", cena: "s1", texto: "Com as suas criptomoedas?", dica: "Mais forte que a anterior (é o fim da escalada).", pausa: 3 },
  // a pausa longa é o fim do clímax (cadeados) + glitch + blackout + revelação do logo — ver T() em S1Abertura.tsx
  { id: "s01_05", cena: "s1", texto: "Somos o grupo [NOME DO GRUPO], e esta é a Herança Digital.", dica: "Depois do silêncio, voz aberta, sorriso na voz. Ênfase em \"Herança Digital\".", pausa: 42 },

  // S2 — Problema
  { id: "s02_01", cena: "s2", texto: "Hoje quase todo mundo tem e-mail, redes sociais, banco digital, criptomoedas, fotos na nuvem e assinaturas.", dica: "Lista rápida, em ritmo de enumeração." },
  { id: "s02_02", cena: "s2", texto: "Quando a pessoa morre, a família não sabe o que existe, não tem as senhas, e não sabe o que ela queria.", dica: "Mais séria. Pequena pausa em cada vírgula (três golpes)." },
  { id: "s02_03", cena: "s2", texto: "Resultado: bens com valor perdidos, assinaturas cobrando para sempre e perfis virando alvo de golpe.", dica: "\"Resultado:\" com pausa. Final firme." },

  // S3 — Proposta de valor
  { id: "s03_01", cena: "s3", texto: "A Herança Digital é um cofre onde você organiza, em vida, tudo o que tem no mundo digital.", dica: "Virada para o positivo. Voz mais aberta." },
  { id: "s03_02", cena: "s3", texto: "Juntamos três coisas: um inventário dos seus ativos, um cofre de acessos criptografado,", dica: "Ênfase em \"três coisas\". Não feche a frase (continua)." },
  { id: "s03_03", cena: "s3", texto: "e uma liberação que só vale pelo caminho legal: inventário em cartório ou na justiça.", dica: "Ênfase em \"caminho legal\"." },

  // S4 — Como funciona
  { id: "s04_01", cena: "s4", texto: "Em vida, o titular cadastra os ativos e escolhe o destino de cada um.", dica: "Didático, ritmo médio." },
  { id: "s04_02", cena: "s4", texto: "No falecimento, o cofre é congelado.", dica: "Mais lento e grave. Pausa depois." },
  { id: "s04_03", cena: "s4", texto: "Só depois do inventário e de um prazo para contestação, cada herdeiro recebe apenas a sua parte.", dica: "Ênfase em \"só a sua parte\" (\"apenas a sua parte\")." },

  // S5 — Demo do protótipo
  { id: "s05_01", cena: "s5", texto: "Este é o protótipo.", dica: "Curta e animada, como quem abre a cortina." },
  { id: "s05_02", cena: "s5", texto: "O titular entra com a chave de acesso do celular e vê o que falta para o plano ficar completo.", dica: "Natural, descrevendo a tela." },
  { id: "s05_03", cena: "s5", texto: "No inventário, cada ativo (redes sociais, e-mails, cripto, assinaturas) recebe um destino: pessoal, patrimonial ou encerrar.", dica: "Parênteses mais baixo e rápido. Ênfase nos três destinos." },
  { id: "s05_04", cena: "s5", texto: "Depois, ele escolhe os herdeiros e define a carência: quinze, trinta, sessenta ou noventa dias.", dica: "Os números bem marcados, um por um." },
  { id: "s05_05", cena: "s5", texto: "Quando o titular falece, o herdeiro abre o pedido com a certidão de óbito, o documento do inventário e uma selfie para confirmar a identidade.", dica: "Frase longa: respire antes. Ênfase em \"selfie\"." },
  { id: "s05_06", cena: "s5", texto: "A equipe valida, todos são avisados e podem contestar.", dica: "Três ações, ritmo firme." },
  { id: "s05_07", cena: "s5", texto: "Terminado o prazo, cada herdeiro vê só o que foi destinado a ele, com instruções para cada ativo.", dica: "Ênfase em \"só o que foi destinado a ele\"." },

  // S6 — Segurança
  { id: "s06_01", cena: "s6", texto: "Segurança é o coração do produto.", dica: "Pausa dramática depois. Voz mais baixa e confiante." },
  { id: "s06_02", cena: "s6", texto: "O conteúdo é cifrado no aparelho do titular.", dica: "Claro e técnico." },
  { id: "s06_03", cena: "s6", texto: "A chave de sucessão é dividida em três partes, e duas são necessárias para abri-la: nem a empresa consegue abrir o cofre sozinha.", dica: "Ênfase forte em \"três partes\" e \"nem a empresa\"." },
  { id: "s06_04", cena: "s6", texto: "Mudanças críticas, como remover um herdeiro, geram um alerta: Não foi você? Desfazer.", dica: "\"Não foi você?\" como pergunta. \"Desfazer\" com ênfase." },

  // S7 — Concorrência
  { id: "s07_01", cena: "s7", texto: "Gerenciadores de senha resolvem o dia a dia, não a sucessão.", dica: "Contraste: \"dia a dia\" × \"sucessão\"." },
  { id: "s07_02", cena: "s7", texto: "Os contatos de legado de Google, Apple e Meta cobrem só a própria plataforma.", dica: "Neutro, sem desdenhar." },
  { id: "s07_03", cena: "s7", texto: "A Herança Digital reúne tudo em um só lugar, seguindo o rito legal brasileiro.", dica: "Confiante. Ênfase em \"tudo em um só lugar\"." },

  // S8 — Modelo de negócio
  { id: "s08_01", cena: "s8", texto: "A receita vem da assinatura anual do titular e de uma taxa na liberação.", dica: "Objetivo." },
  { id: "s08_02", cena: "s8", texto: "Escritórios de advocacia, cartórios, bancos e seguradoras são parceiros previstos e canais de venda.", dica: "Ênfase em \"previstos\"." },
  { id: "s08_03", cena: "s8", texto: "Os valores serão definidos depois da pesquisa com usuários.", dica: "Honesto, tranquilo." },

  // S9 — Equipe, próximos passos e fechamento
  { id: "s09_01", cena: "s9", texto: "Somos um projeto de faculdade; escritórios, cartórios e verificação de identidade são parceiros previstos.", dica: "Honesto. Ênfase em \"previstos\"." },
  { id: "s09_02", cena: "s9", texto: "Próximos passos: validar com um advogado de sucessões, ouvir usuários e construir o MVP.", dica: "Três passos, energia subindo." },
  { id: "s09_03", cena: "s9", texto: "Herança Digital: seus dados, sua história, seu futuro.", dica: "Slogan devagar, uma pausa por vírgula, final firme (é a última fala do vídeo)." },
];

export const frasesDaCena = (cena: CenaId) => NARRACAO.filter((f) => f.cena === cena);
