// Valida um projeto (JSON) com o schema Zod. Uso: npx tsx scripts/validar-projeto.mts arquivo.json
import fs from "node:fs";
import { projetoSchema } from "../src/data/schema";

const arq = process.argv[2] ?? "src/data/project.json";
const v = projetoSchema.safeParse(JSON.parse(fs.readFileSync(arq, "utf8")));
if (!v.success) {
  for (const i of v.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
console.log("✓ projeto válido");
