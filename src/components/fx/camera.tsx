// Câmera e perspectiva (PROMPT_V2 §3): CameraRig, Tilt3D, Shake.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Tremida = { at: number; amp?: number; dur?: number };

/** Deslocamento de tremida determinística (decai), somando várias tremidas. */
export const tremor = (frame: number, tremidas: Tremida[], seed = "cam") => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const t of tremidas) {
    const dur = t.dur ?? 7;
    const amp = t.amp ?? 14;
    const k = frame - t.at;
    if (k < 0 || k > dur) continue;
    const dec = 1 - k / dur;
    x += (random(`${seed}x${t.at}-${k}`) * 2 - 1) * amp * dec;
    y += (random(`${seed}y${t.at}-${k}`) * 2 - 1) * amp * dec;
    r += (random(`${seed}r${t.at}-${k}`) * 2 - 1) * amp * 0.04 * dec;
  }
  return { x, y, r };
};

/** "Respiração" de câmera (zoom lento), pan e tremidas nos impactos. Nunca deixa o quadro parado. */
export const CameraRig: React.FC<{
  dur: number;
  zoom?: [number, number];
  panX?: [number, number];
  panY?: [number, number];
  tremidas?: Tremida[];
  /** zooms bruscos: [{at, para, dur}] — "interruptor de padrão" */
  socos?: { at: number; para: number; dur?: number }[];
  origem?: string;
  children: React.ReactNode;
}> = ({ dur, zoom = [1, 1.06], panX = [0, 0], panY = [0, 0], tremidas = [], socos = [], origem = "50% 50%", children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { ...clampOpt, easing: Easing.inOut(Easing.sin) });
  let z = zoom[0] + (zoom[1] - zoom[0]) * t;
  for (const s of socos) {
    const d = s.dur ?? 10;
    // tranco rápido e volta ao normal (não acumula entre socos)
    z *= interpolate(frame, [s.at, s.at + 3, s.at + d], [1, s.para, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  }
  const tr = tremor(frame, tremidas);
  const x = panX[0] + (panX[1] - panX[0]) * t + tr.x;
  const y = panY[0] + (panY[1] - panY[0]) * t + tr.y;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${tr.r}deg) scale(${z})`, transformOrigin: origem }}>
      {children}
    </AbsoluteFill>
  );
};

/** Perspectiva 3D leve que ASSENTA para 0° quando o elemento "fala" (+ deriva sutil contínua). */
export const Tilt3D: React.FC<{
  inicio?: number;
  assenta: number;
  rotY?: number;
  rotX?: number;
  deriva?: number;
  perspectiva?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ inicio = 0, assenta, rotY = -10, rotX = 7, deriva = 1.2, perspectiva = 1800, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - assenta, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const entra = spring({ frame: frame - inicio, fps, config: { damping: 15, stiffness: 150, mass: 0.8 } });
  const dy = Math.sin(frame / 47) * deriva;
  const dx = Math.cos(frame / 61) * deriva;
  return (
    <div style={{ perspective: perspectiva, ...style }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(${(1 - entra) * -260}px) rotateY(${rotY * (1 - s) + dx}deg) rotateX(${rotX * (1 - s) + dy}deg)`,
          opacity: interpolate(frame, [inicio, inicio + 6], [0, 1], clampOpt),
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Tremida de impacto envolvendo qualquer elemento. */
export const Shake: React.FC<{ tremidas: Tremida[]; seed?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  tremidas, seed = "sh", children, style,
}) => {
  const frame = useCurrentFrame();
  const tr = tremor(frame, tremidas, seed);
  return <div style={{ transform: `translate(${tr.x}px, ${tr.y}px) rotate(${tr.r}deg)`, ...style }}>{children}</div>;
};
