// Voz da narração (revisão de voz). Arquivo SEM imports: lido também pelos scripts Node (npm run voz).
// Trocar de voz: mude VOZ_ESCOLHIDA e rode `npm run voz` (regenera a narração inteira + sync).
// Opções testadas: out/voz-teste/index.html (`npm run voz:teste` refaz o banco de testes).

export type VozConfig = {
  /** motor de síntese que roda nesta máquina */
  motor: "edge" | "kokoro";
  /** id da voz no motor */
  voz: string;
  /** velocidade NATURAL da voz: no máximo ±3 % (nada de acelerar para caber em 180 s) */
  rate: string;
  descricao: string;
  /** true enquanto o grupo não escolher no banco de testes */
  provisoria: boolean;
};

export const VOZ_ESCOLHIDA: VozConfig = {
  motor: "edge",
  voz: "pt-BR-ThalitaMultilingualNeural",
  rate: "+0%",
  descricao: "Thalita (Microsoft, pt-BR, multilíngue) — feminina, velocidade natural",
  provisoria: false, // escolhida pelo grupo depois de ouvir out/voz-teste
};
