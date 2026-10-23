// Monta o TEXTO FALADO a partir do texto exibido (nome do grupo + mapa de pronúncia)
// mantendo a correspondência palavra-exibida → palavras-faladas, e alinha os tempos
// por palavra (do TTS ou do whisper) de volta às palavras exibidas nas legendas.
import { norm, tokens } from "./projeto.mjs";

const PONT = /[.,;:!?…]+$/;

/**
 * @returns {{ itens: {d: string, s: string[]}[], fala: string }}
 *   itens[i].d = palavra exibida; itens[i].s = palavras faladas correspondentes (0..n).
 */
export function montarFala(texto, grupo, pronuncia, { gravada = false } = {}) {
  const semNome = !grupo || grupo.includes("[");
  const disp = tokens(texto.replace("[NOME DO GRUPO]", "§GRUPO§"));
  const itens = [];
  for (let i = 0; i < disp.length; i++) {
    const d = disp[i];
    if (d.includes("§GRUPO§")) {
      const mostrado = d.replace("§GRUPO§", grupo);
      const pont = d.match(PONT)?.[0] ?? "";
      if (semNome && !gravada) {
        // nome ainda não definido: a voz sintética pula o nome (a legenda mostra o placeholder)
        if (itens.length) {
          const ant = itens[itens.length - 1];
          if (ant.s.length) ant.s[ant.s.length - 1] += pont;
        }
        tokens(mostrado).forEach((t) => itens.push({ d: t, s: [] }));
      } else {
        // o nome também pode ter pronúncia (ex.: EternaByte → "Eterna Báite")
        const pr = !gravada && pronuncia.find((p) => p.de === grupo);
        if (pr) {
          const falada = tokens(pr.para);
          falada[falada.length - 1] += pont;
          tokens(mostrado).forEach((t, k) => itens.push({ d: t, s: k === 0 ? falada : [] }));
        } else tokens(mostrado).forEach((t) => itens.push({ d: t, s: [t] }));
      }
      continue;
    }
    let casou = false;
    if (!gravada) {
      for (const p of pronuncia) {
        const chave = tokens(p.de);
        const fatia = disp.slice(i, i + chave.length).map((x) => x.replace(PONT, ""));
        if (fatia.join(" ") === p.de) {
          const pont = disp[i + chave.length - 1].match(PONT)?.[0] ?? "";
          const falada = tokens(p.para);
          falada[falada.length - 1] += pont;
          disp.slice(i, i + chave.length).forEach((dt, k) => itens.push({ d: dt, s: k === 0 ? falada : [] }));
          i += chave.length - 1;
          casou = true;
          break;
        }
      }
    }
    if (!casou) itens.push({ d, s: [d] });
  }
  return { itens, fala: itens.flatMap((o) => o.s).join(" ") };
}

/**
 * Alinha palavras com tempo ([{w, s, e}] em segundos) a uma lista de palavras-alvo.
 * Junta pedaços (ex.: "e" + "mail" = "e-mail") e interpola as que não casarem.
 * @returns {({s:number,e:number})[]}
 */
export function alinhar(alvos, palavras) {
  const res = alvos.map(() => null);
  let j = 0;
  for (let i = 0; i < alvos.length; i++) {
    const alvo = norm(alvos[i]);
    if (!alvo) continue;
    let acc = "";
    let s = null;
    let e = null;
    const j0 = j;
    while (j < palavras.length) {
      const pw = norm(palavras[j].w);
      if (!pw) {
        j++;
        continue;
      }
      const cand = acc + pw;
      if (alvo.startsWith(cand) || cand.startsWith(alvo)) {
        if (s === null) s = palavras[j].s;
        e = palavras[j].e;
        acc = cand;
        j++;
        if (acc.length >= alvo.length) break;
      } else break;
    }
    if (s !== null && acc.length >= alvo.length * 0.6) {
      res[i] = { s, e };
      continue;
    }
    j = j0;
    for (let k = j0; k < Math.min(palavras.length, j0 + 4); k++) {
      if (norm(palavras[k].w) === alvo) {
        res[i] = { s: palavras[k].s, e: palavras[k].e };
        j = k + 1;
        break;
      }
    }
  }
  // interpola faltantes proporcionalmente ao nº de letras
  for (let i = 0; i < res.length; i++) {
    if (res[i]) continue;
    let a = i - 1;
    while (a >= 0 && !res[a]) a--;
    let b = i;
    while (b < res.length && !res[b]) b++;
    const t0 = a >= 0 ? res[a].e : (palavras[0]?.s ?? 0);
    const t1 = b < res.length ? res[b].s : (palavras.at(-1)?.e ?? t0 + 0.3 * (b - a));
    const grupo = alvos.slice(a + 1, b);
    const tot = grupo.reduce((x, w) => x + Math.max(1, norm(w).length), 0) || 1;
    let acc = t0;
    for (let k = a + 1; k < b; k++) {
      const dur = ((t1 - t0) * Math.max(1, norm(alvos[k]).length)) / tot;
      res[k] = { s: acc, e: acc + dur };
      acc += dur;
    }
    i = b - 1;
  }
  return res;
}

/** Distribuição por nº de letras quando não há tempo por palavra (último recurso). */
export function distribuir(alvos, t0, t1) {
  const pesos = alvos.map((w) => Math.max(1, norm(w).length) + 1);
  const tot = pesos.reduce((a, b) => a + b, 0);
  let acc = t0;
  return pesos.map((p) => {
    const d = ((t1 - t0) * p) / tot;
    const r = { s: acc, e: acc + d * 0.9 };
    acc += d;
    return r;
  });
}
