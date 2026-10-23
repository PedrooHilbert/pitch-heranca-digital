// Mixagem (PROMPT_V2 §6.4): voz (−16 LUFS por frase) · trilha (−26 LUFS no arquivo, −6 dB extra
// enquanto há voz, com rampa suave de 9 quadros) · SFX (−14 a −18 dB; impactos até −10 dB).
// A normalização final do vídeo (−14 LUFS, true-peak −1,5 dBTP) é feita no render (scripts/render-final.mjs).
import React from "react";
import { Audio, Sequence, random, staticFile } from "remotion";
import { TL } from "../../data/timeline";
import { config } from "../../data/config";
import { SFX_CUES } from "../../data/sfx-cues";
import { ANTECIPA, DURACAO, GANHO } from "../../data/sfx";

const RAMPA = 9;

// quanto de "voz ativa" há em cada frame (0..1), com rampas de 9 quadros
const DUCK: Float32Array = (() => {
  const n = TL.total + 1;
  const ativo = new Uint8Array(n);
  for (const f of TL.frases) for (let k = Math.max(0, f.from); k < Math.min(n, f.from + f.dur); k++) ativo[k] = 1;
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
  const d = new Float32Array(n);
  for (let k = 0; k < n; k++) d[k] = Math.max(0, 1 - dist[k] / RAMPA);
  return d;
})();

export const Mix: React.FC<{ semVoz?: boolean }> = ({ semVoz = false }) => {
  return (
    <>
      {config.AUDIO.voz && !semVoz
        ? TL.frases.map((f) => (
            <Sequence key={f.id} from={f.from} durationInFrames={f.dur + 6} name={`voz ${f.id}`}>
              <Audio src={staticFile(f.src)} />
            </Sequence>
          ))
        : null}

      {config.AUDIO.trilha ? (
        <Audio
          src={staticFile("audio/trilha.wav")}
          volume={(f) => {
            const d = DUCK[Math.min(DUCK.length - 1, Math.max(0, f))];
            const fadeOut = Math.min(1, Math.max(0, (TL.total - f) / 24));
            return (1 - 0.5 * d) * fadeOut; // −6 dB sob a voz
          }}
        />
      ) : null}

      {config.AUDIO.sfx
        ? SFX_CUES.map((q, i) => {
            const ant = ANTECIPA[q.som] ?? 2;
            const ini = Math.max(0, q.f - ant);
            const varPitch = 1 + (random(`p${i}`) * 2 - 1) * 0.03; // ±3 %
            const varVol = Math.pow(10, ((random(`v${i}`) * 2 - 1) * 1) / 20); // ±1 dB
            return (
              <Sequence key={i} from={ini} durationInFrames={Math.ceil(DURACAO[q.som] * 30) + 4} name={`sfx ${q.som}`}>
                <Audio src={staticFile(`audio/sfx/${q.som}.wav`)} volume={(q.ganho ?? GANHO[q.som]) * varVol} playbackRate={varPitch} />
              </Sequence>
            );
          })
        : null}
    </>
  );
};
