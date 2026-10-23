// Mapa de pronúncia para a voz sintética (PROMPT_V2 §4.1).
// Só afeta o TEXTO FALADO pelo TTS — as legendas continuam mostrando o original.
// Arquivo sem imports (lido também por scripts Node).

export type Pronuncia = { de: string; para: string };

export const PRONUNCIA: Pronuncia[] = [
  { de: "MVP", para: "ême vê pê" },
  { de: "UC HUB", para: "U-Cê Rabi" },
  { de: "OAB", para: "ó á bê" },
  { de: "gov.br", para: "gov ponto bê érre" },
  { de: "LGPD", para: "éle gê pê dê" },
  { de: "EternaByte", para: "Eterna Báite" }, // nome do grupo
  // revisões #13–#15 (medido: sem a vírgula o "o" de "sabe o" durava 37 ms e o "a" de "nem a" 50 ms — engolidos)
  { de: "sabe o", para: "sabe, o" },
  { de: "nem a", para: "nem a," }, // "nem, a" ainda deixava o "a" com 37 ms; assim ele dura ~200 ms
  { de: "Desfazer", para: "Dês-fazer" }, // a voz dizia "Disfaizer"
  { de: "esta é", para: "ésta é" }, // revisão #16: a voz lia "está" (verbo) em "e esta é a Herança Digital"
];
