// Falha se ainda houver placeholders ([ALGO]) no que será exibido no vídeo (§10 do PROMPT).
// Rode antes da renderização final: `npm run check`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["src/data/config.ts"];
const re = /\[[^\]\n]+\]/g;

let found = [];
for (const f of files) {
  const txt = readFileSync(join(root, f), "utf8");
  for (const m of txt.match(re) ?? []) {
    // ignora colchetes de tipo/array; mantém só tokens com letras (placeholders reais)
    if (/[A-Za-zÀ-ÿ]/.test(m) && m.length > 2) found.push({ f, m });
  }
}

if (found.length) {
  console.error("\n⚠  Placeholders ainda NÃO preenchidos (aparecem em AMARELO no vídeo):");
  for (const { f, m } of found) console.error(`   ${m}   (${f})`);
  console.error(
    "\nPreencha-os em src/data/config.ts e rode de novo.\nPara renderizar um rascunho mesmo assim: npm run render:draft\n",
  );
  process.exit(1);
}
console.log("✓ Nenhum placeholder pendente — pronto para a renderização final.");
