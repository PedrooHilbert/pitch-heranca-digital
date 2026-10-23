// Falha se ainda houver placeholders ([ALGO]) no que será exibido no vídeo (PROMPT §10).
// Varre o project.json inteiro (equipe, textos das cenas, legendas). Rode antes da renderização final.
import { lerProjeto } from "./lib/projeto-json.mjs";

const pj = lerProjeto();
const achados = [];
const re = /\[[^\]\n]+\]/g;
const varrer = (valor, onde) => {
  if (typeof valor === "string") {
    for (const m of valor.match(re) ?? []) achados.push({ m, onde });
  } else if (Array.isArray(valor)) valor.forEach((v, i) => varrer(v, `${onde}[${i}]`));
  else if (valor && typeof valor === "object") for (const [k, v] of Object.entries(valor)) varrer(v, onde ? `${onde}.${k}` : k);
};
varrer(pj.equipe, "equipe");
for (const c of pj.cenas) varrer(c.textos, `cenas.${c.id}.textos`);

if (achados.length) {
  console.error(`\n⚠  ${achados.length} campo(s) [PREENCHER] ainda no vídeo (aparecem em AMARELO):`);
  for (const { m, onde } of achados) console.error(`   ${m}   (${onde})`);
  console.error("\nPreencha no Estúdio de Revisão (npm run editor → Projeto/Equipe) ou em src/data/project.json.\nPara renderizar um rascunho mesmo assim: npm run render:draft\n");
  process.exit(1);
}
console.log("✓ Nenhum placeholder pendente — pronto para a renderização final.");
