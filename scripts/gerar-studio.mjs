// Ponte Remotion Studio ↔ project.json (PROMPT_V3 §Fase 1).
// O botão "Salvar" do painel de props do Studio só consegue gravar quando o defaultProps está
// escrito DIRETO no arquivo da composição. Por isso este script gera src/studio/Composicao.gerada.tsx
// a partir do project.json (fonte única) e, no modo --observar, copia de volta para o project.json
// tudo o que o Studio salvar ali (validando com o schema Zod antes).
//   node scripts/gerar-studio.mjs              → só gera
//   node scripts/gerar-studio.mjs --observar   → gera e fica observando os dois arquivos
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import { P } from "./lib/projeto.mjs";

const PROJ = P("src", "data", "project.json");
const GERADO = P("src", "studio", "Composicao.gerada.tsx");
const HIST = P("revisoes", "historico");

const json = (obj) => JSON.stringify(obj, null, 1);

export function gerarStudio() {
  const pj = JSON.parse(fs.readFileSync(PROJ, "utf8"));
  const total = pj.cenas.reduce((a, c) => a + c.dur, 0);
  const literal = JSON.stringify(pj, null, 2).split("\n").join("\n    ");
  const code = `// ARQUIVO GERADO de src/data/project.json por scripts/gerar-studio.mjs — não edite à mão.
// É aqui que o botão "Salvar" do painel de props do Remotion Studio grava; com \`npm run dev\`
// aberto, as mudanças são validadas e copiadas de volta para o project.json automaticamente.
import React from "react";
import { Composition } from "remotion";
import { PitchHerancaDigital } from "../PitchHerancaDigital";
import { projetoSchema, LIMITE_QUADROS, type Projeto } from "../data/schema";

export const ComposicaoPitch: React.FC = () => (
  <Composition
    id="PitchHerancaDigital"
    component={PitchHerancaDigital}
    schema={projetoSchema}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={${total}}
    calculateMetadata={({ props }) => {
      const total = (props as Projeto).cenas.reduce((a, c) => a + c.dur, 0);
      if (total > LIMITE_QUADROS) throw new Error(\`Duração total \${total} q passa de \${LIMITE_QUADROS} (180 s).\`);
      return { durationInFrames: total };
    }}
    defaultProps={${literal}}
  />
);
`;
  fs.mkdirSync(path.dirname(GERADO), { recursive: true });
  if (!fs.existsSync(GERADO) || fs.readFileSync(GERADO, "utf8") !== code) fs.writeFileSync(GERADO, code, "utf8");
  return code;
}

/** Lê o objeto literal de defaultProps do arquivo gerado (depois que o Studio salvou). */
export function lerDoStudio() {
  const src = fs.readFileSync(GERADO, "utf8");
  const sf = ts.createSourceFile(GERADO, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let texto = null;
  const visita = (n) => {
    if (texto) return;
    if (ts.isJsxAttribute(n) && n.name.getText(sf) === "defaultProps" && n.initializer && ts.isJsxExpression(n.initializer)) {
      texto = n.initializer.expression.getText(sf);
      return;
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  if (!texto) throw new Error("defaultProps não encontrado no arquivo gerado");
  // é um literal puro (strings, números, booleanos, null, arrays e objetos)
  return Function(`"use strict"; return (${texto});`)();
}

function validar(obj) {
  const tmp = P("scripts", ".cache", "studio-validar.json");
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(obj));
  const r = spawnSync("npx", ["tsx", "scripts/validar-projeto.mts", tmp], { cwd: P(), shell: true, encoding: "utf8" });
  return { ok: r.status === 0, msg: (r.stdout + r.stderr).trim() };
}

function guardarHistorico() {
  fs.mkdirSync(HIST, { recursive: true });
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  const nome = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}_${p2(d.getHours())}-${p2(d.getMinutes())}-${p2(d.getSeconds())}.json`;
  fs.copyFileSync(PROJ, path.join(HIST, nome));
  const todos = fs.readdirSync(HIST).filter((f) => f.endsWith(".json")).sort();
  for (const v of todos.slice(0, Math.max(0, todos.length - 50))) fs.unlinkSync(path.join(HIST, v));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(P("scripts", "gerar-studio.mjs"))) {
  gerarStudio();
  console.log("✓ src/studio/Composicao.gerada.tsx gerado do project.json");
  if (process.argv.includes("--observar")) {
    let timer = null;
    let ocupado = false;
    const doStudio = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (ocupado) return;
        ocupado = true;
        try {
          const novo = lerDoStudio();
          const atual = JSON.parse(fs.readFileSync(PROJ, "utf8"));
          if (json(novo) === json(atual)) return;
          const v = validar(novo);
          if (!v.ok) {
            console.error(`✗ Studio salvou um projeto inválido — project.json NÃO alterado:\n${v.msg}`);
            return;
          }
          guardarHistorico();
          fs.writeFileSync(PROJ, json(novo), "utf8");
          console.log(`✓ [${new Date().toLocaleTimeString()}] Studio → project.json salvo`);
        } catch (e) {
          console.error("✗ não consegui ler o que o Studio salvou:", e.message);
        } finally {
          ocupado = false;
        }
      }, 400);
    };
    const doProjeto = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          gerarStudio();
        } catch (e) {
          console.error("✗ project.json ilegível:", e.message);
        }
      }, 400);
    };
    fs.watch(GERADO, doStudio);
    fs.watch(PROJ, doProjeto);
    console.log("… observando o Studio e o project.json (Ctrl+C para sair)");
  }
}
