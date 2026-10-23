// Formas de onda (pico por quadro) dos áudios, calculadas no navegador e guardadas em cache.
import { useEffect, useState } from "react";

const cache = new Map<string, Promise<Float32Array>>();
let ctx: AudioContext | null = null;

export function picos(url: string): Promise<Float32Array> {
  const em = cache.get(url);
  if (em) return em;
  const p = (async () => {
    ctx ??= new AudioContext();
    const buf = await (await fetch(url)).arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const canal = audio.getChannelData(0);
    const porQuadro = Math.round(audio.sampleRate / 30);
    const n = Math.ceil(canal.length / porQuadro);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let m = 0;
      const fim = Math.min(canal.length, (i + 1) * porQuadro);
      for (let k = i * porQuadro; k < fim; k += 4) {
        const v = Math.abs(canal[k]);
        if (v > m) m = v;
      }
      out[i] = m;
    }
    return out;
  })();
  cache.set(url, p);
  return p;
}

/** Carrega vários áudios; devolve { url → picos } conforme ficam prontos. */
export function usePicos(urls: string[]) {
  const [mapa, setMapa] = useState<Record<string, Float32Array>>({});
  const chave = urls.join("|");
  useEffect(() => {
    let vivo = true;
    for (const u of urls) {
      picos(u)
        .then((p) => vivo && setMapa((m) => (m[u] ? m : { ...m, [u]: p })))
        .catch(() => undefined);
    }
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return mapa;
}

/** Caminho SVG de uma onda espelhada (x em px por quadro). */
export function caminhoOnda(p: Float32Array, pxq: number, altura: number, ganho = 1) {
  const meio = altura / 2;
  const passo = Math.max(1, Math.floor(1 / pxq));
  let cima = `M0 ${meio}`;
  let baixo = "";
  for (let i = 0; i < p.length; i += passo) {
    let m = 0;
    for (let k = i; k < Math.min(p.length, i + passo); k++) m = Math.max(m, p[k]);
    const h = Math.min(meio, m * meio * ganho);
    const x = (i * pxq).toFixed(1);
    cima += ` L${x} ${(meio - h).toFixed(1)}`;
    baixo = ` L${x} ${(meio + h).toFixed(1)}` + baixo;
  }
  return `${cima}${baixo} Z`;
}
