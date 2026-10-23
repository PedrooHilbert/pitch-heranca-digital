// npm run dev / npm run studio: gera a composição do Studio a partir do project.json, abre o
// Remotion Studio e fica copiando de volta para o project.json o que for salvo no painel de props.
import { spawn } from "node:child_process";
import { P } from "./lib/projeto.mjs";

const ponte = spawn("node", ["scripts/gerar-studio.mjs", "--observar"], { cwd: P(), stdio: "inherit", shell: true });
const studio = spawn("npx", ["remotion", "studio", ...process.argv.slice(2)], { cwd: P(), stdio: "inherit", shell: true });
const sair = () => {
  ponte.kill();
  studio.kill();
  process.exit(0);
};
studio.on("exit", sair);
process.on("SIGINT", sair);
