// Leitura do project.json pelos scripts Node: cenas com início/duração absolutos e falas absolutas.
import fs from "node:fs";
import { P } from "./projeto.mjs";

export const lerProjeto = () => JSON.parse(fs.readFileSync(P("src", "data", "project.json"), "utf8"));

export const linhaDoTempo = (pj = lerProjeto()) => {
  let acc = 0;
  const cenas = pj.cenas.map((c) => {
    const r = { id: c.id, nome: c.nome, from: acc, dur: c.dur };
    acc += c.dur;
    return r;
  });
  const ini = Object.fromEntries(cenas.map((c) => [c.id, c.from]));
  const frases = pj.frases.map((f) => ({ ...f, from: ini[f.cena] + f.inicio }));
  return { total: acc, cenas, frases, projeto: pj };
};
