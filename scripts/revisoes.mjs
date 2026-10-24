// Lista as revisões (pins) do Estúdio de Revisão. Uso: npm run revisoes [-- --todas]
import fs from "node:fs";
import { P } from "./lib/projeto.mjs";

// --vertical → as revisões do editor da versão em pé (revisoes/vertical/)
const arq = process.argv.includes("--vertical") ? P("revisoes", "vertical", "revisoes.json") : P("revisoes", "revisoes.json");
const todas = process.argv.includes("--todas");
const lista = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, "utf8")) : [];
const mostrar = todas ? lista : lista.filter((r) => r.status !== "feito");
const tempo = (f) => {
  const s = f / 30;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};
if (!mostrar.length) {
  console.log(todas ? "Nenhuma revisão registrada." : "✓ Nenhuma revisão aberta.");
  process.exit(0);
}
console.log(`${mostrar.length} revisão(ões) ${todas ? "no total" : "abertas"}:\n`);
for (const r of mostrar) {
  const pos = r.x != null ? ` · posição (${(r.x * 100).toFixed(0)}%, ${(r.y * 100).toFixed(0)}%)` : "";
  console.log(`#${r.id} · ${tempo(r.frame)} (quadro ${r.frame}) · ${r.cenaNome ?? r.cena} · ${r.categoria} · ${r.gravidade} · [${r.status}]${pos}`);
  console.log(`   "${r.texto}"${r.queroQue ? `\n   quero: "${r.queroQue}"` : ""}`);
  console.log(`   still: ${r.still ?? "(sem still)"}\n`);
}
