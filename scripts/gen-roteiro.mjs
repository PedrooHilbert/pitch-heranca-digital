// Gera docs/ROTEIRO_GRAVACAO.md a partir de src/data/narracao.ts (fonte única do texto).
import fs from "node:fs";
import { P, carregarNarracao, carregarConfig, lerJSON } from "./lib/projeto.mjs";

const NARR = await carregarNarracao();
const CFG = await carregarConfig();
const vt = lerJSON(P("src", "data", "voice-timings.json"), {});
const nomes = { s1: "Abertura", s2: "Problema", s3: "Proposta de valor", s4: "Como funciona", s5: "Demo do protótipo", s6: "Segurança", s7: "Concorrência", s8: "Modelo de negócio", s9: "Equipe e fechamento" };

let md = `# Roteiro de gravação da narração — Herança Digital (v2)

> Gerado de \`src/data/narracao.ts\` (rode \`npm run roteiro\` se o texto mudar).
> Total: ${NARR.length} frases · ${NARR.reduce((a, f) => a + f.texto.split(/\s+/).length, 0)} palavras · ritmo-alvo 160–170 palavras/min (≈ 2 min 40 s de fala).

## Guia rápido de gravação
1. **Lugar:** o mais silencioso possível. Grave num cômodo com tecido (guarda-roupa aberto, cobertor nas costas, sofá). Nada de ventilador/ar-condicionado.
2. **Celular a ~20 cm da boca**, um pouco de lado (evita o "p" estourar). Use o gravador de voz do celular (qualidade alta) ou o computador com fone com microfone.
3. **Uma frase por arquivo**, com o nome do \`id\` (ex.: \`s01_01.m4a\`). Deixe ~0,5 s de silêncio antes e depois — o script corta.
4. **Grave 3 tomadas** de cada frase e escolha a melhor. Se errar, recomece a frase inteira.
5. **Sem música de fundo.** Fale com sorriso, confiante e caloroso, ritmo médio-rápido. Pausas curtas nas vírgulas.
6. Ênfases principais: **"quem fica"**, **"três partes"**, **"só a sua parte"**, **"Desfazer"**.
7. Coloque os arquivos em \`video/gravacoes/\` (wav, mp3, m4a, ogg ou flac) e rode:
   \`\`\`
   npm run voz:importar
   \`\`\`
   Isso corta silêncio (deixa 80 ms), remove cliques, normaliza para −16 LUFS, mede a duração real, alinha palavra por palavra (whisper, se instalado) e refaz timeline, legendas, efeitos e trilha. Depois: \`npm run render\`.
8. Pode misturar: frases gravadas substituem as sintéticas; as que faltarem continuam com a voz sintética.

## Frases
| id | Cena | Texto | Dica de entonação | Duração atual (voz sintética) |
|---|---|---|---|---|
`;
for (const f of NARR) {
  const texto = f.texto.replace("[NOME DO GRUPO]", CFG.NOME_DO_GRUPO.includes("[") ? "**[NOME DO GRUPO]**" : CFG.NOME_DO_GRUPO).replace(/\|/g, "\\|");
  const d = vt[f.id]?.sec ? `${vt[f.id].sec.toFixed(1)} s` : "—";
  md += `| \`${f.id}\` | ${nomes[f.cena]} | ${texto} | ${f.dica.replace(/\|/g, "\\|")} | ${d} |\n`;
}
md += `
## Pronúncia (só para voz sintética)
"MVP" → "ême vê pê" · "UC HUB" → "U-Cê Rabi" · "OAB" → "ó á bê" · "gov.br" → "gov ponto bê érre" · "LGPD" → "éle gê pê dê" (\`src/data/pronuncia.ts\`).
`;
fs.mkdirSync(P("docs"), { recursive: true });
fs.writeFileSync(P("docs", "ROTEIRO_GRAVACAO.md"), md, "utf8");
console.log("✓ docs/ROTEIRO_GRAVACAO.md");
