// Mixagem (PROMPT_V2 §6.4) — níveis vindos do projeto (project.json → audio), editáveis.
// Voz (−16 LUFS por fala) · trilha (−26 LUFS no arquivo, ducking sob a voz com rampa de 9 q) ·
// SFX (project.json → sfx). Normalização final (−14 LUFS) é feita no render (scripts/render-final.mjs).
import React from "react";
import { Audio, Sequence, random, staticFile } from "remotion";
import { derivado, getProjeto, type Derivado } from "../../data/projeto";
import { ANTECIPA, DURACAO, type Som } from "../../data/sfx";

const RAMPA = 9;
const dbLin = (db: number) => Math.pow(10, db / 20);

// quanto de "voz ativa" há em cada quadro (0..1), com rampas de 9 q — cache por projeto
const cacheDuck = new WeakMap<Derivado, Float32Array>();
const duck = (d: Derivado) => {
  const em = cacheDuck.get(d);
  if (em) return em;
  const n = d.total + 1;
  const ativo = new Uint8Array(n);
  for (const f of d.frases) for (let k = Math.max(0, f.from); k < Math.min(n, f.from + f.dur); k++) ativo[k] = 1;
  const dist = new Float32Array(n).fill(1e9);
  let ult = -1e9;
  for (let k = 0; k < n; k++) {
    if (ativo[k]) ult = k;
    dist[k] = k - ult;
  }
  ult = 1e9;
  for (let k = n - 1; k >= 0; k--) {
    if (ativo[k]) ult = k;
    dist[k] = Math.min(dist[k], ult - k);
  }
  const out = new Float32Array(n);
  for (let k = 0; k < n; k++) out[k] = Math.max(0, 1 - dist[k] / RAMPA);
  cacheDuck.set(d, out);
  return out;
};

export const Mix: React.FC<{ semVoz?: boolean }> = ({ semVoz = false }) => {
  const p = getProjeto();
  const d = derivado(p);
  const a = p.audio;
  const D = duck(d);
  const gVoz = dbLin(a.voz.ganhoDb);
  const gTrilha = dbLin(a.trilha.ganhoDb);
  const gDuck = dbLin(a.trilha.duckingDb);
  const gSfx = dbLin(a.sfx.ganhoDb);
  return (
    <>
      {a.voz.ativo && !semVoz
        ? d.frases.map((f) => (
            <Sequence key={f.id} from={f.from} durationInFrames={f.dur + 6} name={`voz ${f.id}`}>
              <Audio src={staticFile(f.src)} volume={gVoz} />
            </Sequence>
          ))
        : null}

      {a.trilha.ativo ? (
        <Audio
          src={staticFile("audio/trilha.wav")}
          volume={(f) => {
            const k = D[Math.min(D.length - 1, Math.max(0, f))];
            const fadeOut = Math.min(1, Math.max(0, (d.total - f) / 24));
            return gTrilha * (1 - (1 - gDuck) * k) * fadeOut;
          }}
        />
      ) : null}

      {a.sfx.ativo
        ? d.sfx.map((q, i) => {
            const som = q.som as Som;
            const ant = ANTECIPA[som] ?? 2;
            const ini = Math.max(0, q.f - ant);
            const varPitch = 1 + (random(`p${q.id}`) * 2 - 1) * 0.03; // ±3 %
            const varVol = dbLin((random(`v${q.id}`) * 2 - 1) * 1); // ±1 dB
            return (
              <Sequence key={`${q.id}-${i}`} from={ini} durationInFrames={Math.ceil(DURACAO[som] * 30) + 4} name={`sfx ${som}`}>
                <Audio src={staticFile(`audio/sfx/${som}.wav`)} volume={dbLin(q.ganhoDb) * gSfx * varVol} playbackRate={varPitch} />
              </Sequence>
            );
          })
        : null}
    </>
  );
};
