// Direção de interpretação da narração (revisão "voz expressiva"). Arquivo SEM imports (lido pelos scripts Node).
//
// O edge-tts não aceita SSML (lê as tags em voz alta — docs/medicoes/motor-edge.md): cada frase vira SEGMENTOS,
// cada um pedido com seu rate/pitch/volume, emendados com crossfade de 15 ms ou silêncio real (scripts/lib/expressiva.mjs).
//
// Marcação (só para a síntese — legendas e tela continuam com o texto de narracao.ts; as PALAVRAS têm de ser as mesmas):
//   *palavra*  ênfase: mais lenta, mais aguda, um pouco mais alta
//   …          pausa dramática (silêncio real)
//   ?          final ascendente: a última palavra da pergunta sobe de tom
//   |          corte de segmento sem ênfase (ex.: "Obrigado!" separado, sorrindo)
//
// Todos os deltas são multiplicados por EXPRESSIVIDADE (src/data/voz.ts): 0 = frase inteira num pedido só (voz plana).

export type Delta = {
  /** % de velocidade */
  rate?: number;
  /** Hz */
  pitch?: number;
  /** dB (aplicado no áudio) */
  volumeDb?: number;
};

export const PARAMS = {
  enfase: { rate: -8, pitch: 12, volumeDb: 2 } as Delta,
  /** última palavra de pergunta (final ascendente) */
  pergunta: { pitch: 16 } as Delta,
  /** "Obrigado!" e outros finais com "!" (sorriso, sobe de leve) */
  exclamacao: { pitch: 8, volumeDb: 1 } as Delta,
  /** silêncios entre segmentos (ms) — no nível 1; no 0 caem para o natural */
  pausaReticencias: 380,
  pausaPontuacao: 110,
  /** crossfade entre segmentos colados (ms) */
  crossfade: 15,
  /** nunca passar disto (soa caricato) */
  limite: { rate: 15, pitch: 25 },
};

/** Mapa de energia por cena (deltas sobre a voz base). */
export const CENAS: Record<string, Delta & { tom: string }> = {
  s1: { tom: "dramática e crescente (deltas por frase abaixo)" },
  s2: { tom: "sombria e tensa", rate: -6, pitch: -8 },
  s3: { tom: "virada: brilhante e esperançosa", rate: 4, pitch: 8, volumeDb: 1 },
  s4: { tom: "didática e clara" },
  s5: { tom: "animada e entusiasmada", rate: 4, pitch: 6, volumeDb: 0.5 },
  s6: { tom: "séria e firme", rate: -6, pitch: -8 },
  s7: { tom: "confiante e objetiva", rate: 2, pitch: 3 },
  s8: { tom: "objetiva e positiva, um pouco mais rápida", rate: 5, pitch: 4 },
  s9: { tom: "humilde → cresce → ponto alto emocional" },
};

/** Por frase: texto marcado e/ou delta próprio (somado ao da cena). Frases ausentes: texto puro + delta da cena. */
export const FRASES: Record<string, { marcado?: string; delta?: Delta }> = {
  // S1 — "Quando você morrer…" grave e lenta + pausa; perguntas em escalada de tom; "Somos…" aberta, sorrindo
  s01_01: { marcado: "Quando você morrer…", delta: { rate: -10, pitch: -10 } },
  s01_02: { marcado: "quem fica com o seu *Instagram?*", delta: { pitch: 2 } },
  s01_03: { marcado: "Com o seu *e-mail?*", delta: { pitch: 7, volumeDb: 0.5 } },
  s01_04: { marcado: "Com as suas *criptomoedas?*", delta: { pitch: 12, volumeDb: 1 } },
  s01_05: { marcado: "Somos o grupo [NOME DO GRUPO], e esta é a *Herança Digital.*", delta: { pitch: 5, volumeDb: 1 } },
  // S2 — sombria; acelera de leve na lista final
  s02_02: { marcado: "Quando a pessoa morre, a família *não sabe* o que existe, *não tem* as senhas, e não sabe o que ela queria." },
  s02_03: { marcado: "Resultado: bens com valor perdidos, assinaturas cobrando *para sempre* e perfis virando alvo de *golpe.*", delta: { rate: 5 } },
  // S3 — virada
  s03_02: { marcado: "Juntamos *três coisas:* um inventário dos seus ativos, um cofre de acessos criptografado," },
  s03_03: { marcado: "e uma liberação que só vale pelo caminho *legal:* inventário em cartório ou na justiça." },
  // S4 — didática
  s04_02: { marcado: "No falecimento, o cofre é *congelado.*", delta: { rate: -4, pitch: -3 } },
  s04_03: { marcado: "Só depois do inventário e de um prazo para contestação, cada herdeiro recebe *apenas a sua parte.*" },
  // S5 — demo animada, variando entre frases
  s05_01: { marcado: "Este é o *protótipo.*", delta: { pitch: 4, volumeDb: 1.5 } },
  s05_02: { delta: { rate: -2, pitch: -3 } },
  s05_03: { marcado: "No inventário, cada ativo (redes sociais, e-mails, cripto, assinaturas) recebe um destino: *pessoal, patrimonial ou encerrar.*" },
  s05_04: { marcado: "Depois, ele escolhe os herdeiros e define a carência: *quinze, trinta, sessenta ou noventa dias.*", delta: { pitch: 2 } },
  s05_05: { marcado: "Quando o titular falece, o herdeiro abre o pedido com a certidão de óbito, o documento do inventário e uma *selfie* para confirmar a identidade.", delta: { rate: -2, pitch: -4 } },
  s05_07: { marcado: "Terminado o prazo, cada herdeiro vê *só o que foi destinado a ele,* com instruções para cada ativo." },
  // S6 — séria
  s06_03: { marcado: "A chave de sucessão é dividida em *três partes,* e duas são necessárias para abri-la: *nem a empresa* consegue abrir o cofre sozinha." },
  s06_04: { marcado: "Mudanças críticas, como remover um herdeiro, geram um alerta: Não foi você? *Desfazer.*" },
  // S7 — comparação
  s07_01: { marcado: "Gerenciadores de senha resolvem o *dia a dia, não a sucessão.*" },
  s07_02: { marcado: "Os contatos de legado de Google, Apple e Meta cobrem *só a própria plataforma.*" },
  s07_03: { marcado: "A Herança Digital reúne *tudo em um só lugar,* seguindo o rito legal brasileiro.", delta: { pitch: 3 } },
  // S9 — humilde → cresce → ponto alto
  s09_01: { delta: { rate: -3, pitch: -2 } },
  s09_02: { delta: { rate: 3, pitch: 6, volumeDb: 1 } },
  s09_03: { marcado: "*Herança Digital*… seus dados, sua história, seu futuro.", delta: { rate: -8, pitch: 2, volumeDb: 1.5 } },
};
