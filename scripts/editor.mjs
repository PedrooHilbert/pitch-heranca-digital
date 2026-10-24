// Abre o Estúdio de Revisão de UM formato — são dois editores independentes:
//   npm run editor            → horizontal (16:9) · src/data/project.json         · http://localhost:5174
//   npm run editor:vertical   → em pé (9:16)      · src/data/project-vertical.json · http://localhost:5175
// Cada um tem o próprio projeto, as próprias revisões (revisoes/ e revisoes/vertical/) e os próprios renders.
import { spawn, spawnSync } from "node:child_process";
import { P } from "./lib/projeto.mjs";

const vertical = process.argv.includes("--vertical");
const env = { ...process.env, FORMATO: vertical ? "vertical" : "horizontal", EDITOR_PORTA: vertical ? "5175" : "5174" };
if (!vertical) spawnSync("node", ["scripts/gerar-studio.mjs"], { stdio: "inherit", shell: true, cwd: P() });
const vite = spawn("npx", ["vite", "--config", "editor/vite.config.ts"], { stdio: "inherit", shell: true, cwd: P(), env });
vite.on("exit", (c) => process.exit(c ?? 0));
