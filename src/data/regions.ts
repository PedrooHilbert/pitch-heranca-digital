// Regiões (blocos) de cada tela do protótipo, medidas no DOM — public/screens/regions.json.
import json from "../../public/screens/regions.json";

export type Regiao = { tag: string; label: string; x: number; y: number; w: number; h: number };
export type InfoTela = { logical_size: [number, number]; regions: Regiao[] };

const regions = json as unknown as Record<string, InfoTela>;
export default regions;
