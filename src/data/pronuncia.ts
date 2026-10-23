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
];
