// S2 — Problema (≈ 20 s). PROMPT_V2 §5: lista de ativos → Sem lista (órbita que embaralha) →
// Sem senhas (escuro, carimbo) → Sem instruções (bilhete amassa e voa) → âmbar: Resultado.
// Cada bloco troca o fundo (interruptor de padrão).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Mail, Share2, Landmark, Bitcoin, Images, RefreshCw, Globe, Lock, Gem, Receipt, ShieldAlert, User } from "lucide-react";
import { relogio } from "../data/timeline";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { Tile, Eyebrow } from "../components/v2/kit";
import { CameraRig, KineticText, Orbit, Stamp, Shake, DrawPath, Flash, vidro } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ATIVOS = [
  { Ic: Mail, nome: "E-mail", w: "e-mail" },
  { Ic: Share2, nome: "Redes sociais", w: "redes" },
  { Ic: Landmark, nome: "Banco digital", w: "banco" },
  { Ic: Bitcoin, nome: "Cripto", w: "criptomoedas" },
  { Ic: Images, nome: "Fotos na nuvem", w: "fotos" },
  { Ic: RefreshCw, nome: "Assinaturas", w: "assinaturas" },
  { Ic: Globe, nome: "Domínios", w: "" },
];

const T = () => {
  const r = relogio("s2");
  const f1 = "s02_01";
  const f2 = "s02_02";
  const f3 = "s02_03";
  const pops = ATIVOS.map((a) => (a.w ? r.em(f1, a.w, 4) : 0));
  pops[6] = pops[5] + 12;
  const b1 = r.em(f2, "Quando", 4);
  const existe = r.em(f2, "existe");
  const b2 = r.em(f2, "não", 4, 2);
  const senhas = r.em(f2, "senhas");
  const b3 = r.em(f2, "não", 4, 3);
  const queria = r.apos(f2, "queria");
  const b4 = r.ini(f3) - 2;
  return {
    r, pops, b1, existe, b2, senhas, b3, queria, b4,
    perdidos: r.em(f3, "perdidos"),
    assinaturas: r.em(f3, "assinaturas"),
    perfis: r.em(f3, "perfis"),
    golpe: r.em(f3, "golpe"),
  };
};

export const sfxS2 = (): Cue[] => {
  const t = T();
  return [
    ...t.pops.map((f) => ({ f, som: "pop" as const })),
    { f: t.b1, som: "whoosh_short" },
    { f: t.existe, som: "impact_low", ganho: 0.18 },
    { f: t.existe + 6, som: "glitch_zap" },
    { f: t.b2, som: "whoosh_short" },
    ...Array.from({ length: 5 }, (_, k) => ({ f: t.b2 + 4 + k * 3, som: "type" as const })),
    { f: t.senhas, som: "thunk" },
    { f: t.senhas + 4, som: "impact_low", ganho: 0.2 },
    { f: t.b3, som: "whoosh_short" },
    { f: t.queria + 4, som: "whoosh_short" },
    { f: t.b4, som: "impact_low" },
    { f: t.perdidos, som: "pop" },
    { f: t.assinaturas, som: "pop" },
    ...Array.from({ length: 6 }, (_, k) => ({ f: t.assinaturas + 8 + k * 9, som: "tick" as const })),
    { f: t.perfis, som: "pop" },
    { f: t.golpe, som: "glitch_zap" },
  ];
};

const CampoSenha: React.FC<{ inicio: number; tranca: number }> = ({ inicio, tranca }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(10, Math.floor((frame - inicio) / 3)));
  return (
    <Shake tremidas={[{ at: tranca, amp: 18, dur: 9 }]}>
      <div style={{ ...vidro(true), width: 760, padding: "34px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 26, color: colors.mintSoft }}>Senha do Gmail da mãe</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, height: 84, borderRadius: 16, padding: "0 26px", background: "rgba(0,0,0,0.25)", border: `2px solid ${frame >= tranca ? colors.red : "rgba(127,209,197,0.4)"}` }}>
          <Lock size={34} color={frame >= tranca ? colors.red : colors.mint} />
          <div style={{ fontFamily, fontSize: 56, letterSpacing: "0.18em", color: "#fff" }}>{"•".repeat(n)}</div>
        </div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 22, color: frame >= tranca ? "#FF9A8F" : colors.mintSoft2, opacity: frame >= tranca ? 1 : 0.6 }}>
          {frame >= tranca ? "Senha incorreta. Conta bloqueada." : "digitando…"}
        </div>
      </div>
    </Shake>
  );
};

const Bilhete: React.FC<{ inicio: number; amassa: number }> = ({ inicio, amassa }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 13, stiffness: 160 } });
  const a = interpolate(frame, [amassa, amassa + 10], [0, 1], clampOpt);
  const voa = interpolate(frame, [amassa + 8, amassa + 22], [0, 1], { ...clampOpt });
  return (
    <div
      style={{
        width: 560, height: 400, background: "#FFFDF6", borderRadius: 10, boxShadow: "0 24px 60px rgba(11,63,61,.2)",
        transform: `translate(${voa * 1400}px, ${voa * -500}px) rotate(${-5 + a * 40 + voa * 120}deg) scale(${s * (1 - a * 0.55)}, ${s * (1 - a * 0.7)})`,
        filter: a > 0 ? `blur(${a * 2}px)` : undefined, position: "relative", overflow: "hidden",
      }}
    >
      <svg width="560" height="400" style={{ position: "absolute", inset: 0 }}>
        {[90, 150, 210, 270, 330].map((y) => <line key={y} x1={40} x2={520} y1={y} y2={y} stroke="#E3DCC8" strokeWidth={2} />)}
        <DrawPath d="M70 120 C 130 70, 200 170, 260 110 S 380 90, 430 130" inicio={inicio + 4} dur={10} cor="#9AA9A5" largura={5} />
        <DrawPath d="M70 200 C 150 240, 220 160, 300 210" inicio={inicio + 8} dur={9} cor="#9AA9A5" largura={5} />
      </svg>
      <div style={{ position: "absolute", right: 60, top: 160, fontFamily, fontWeight: 900, fontSize: 170, color: colors.amber, transform: `rotate(12deg) scale(${spring({ frame: frame - inicio - 12, fps, config: { damping: 8, stiffness: 220 } })})` }}>?</div>
    </div>
  );
};

const Card: React.FC<{ at: number; icone: React.ReactNode; titulo: string; children?: React.ReactNode; alerta?: number }> = ({ at, icone, titulo, children, alerta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } });
  const al = alerta != null && frame >= alerta;
  const flut = Math.sin((frame + at) / 24) * 6;
  if (frame < at) return <div style={{ width: 470 }} />;
  return (
    <Shake tremidas={alerta != null ? [{ at: alerta, amp: 14, dur: 10 }] : []}>
      <div
        style={{
          width: 470, height: 380, borderRadius: 26, padding: 30, boxSizing: "border-box",
          background: al ? "#4A0E0B" : "rgba(255,248,232,0.96)", border: `3px solid ${al ? colors.red : colors.amberBorder}`,
          boxShadow: `0 24px 60px rgba(0,0,0,.35)${al ? `, 0 0 40px ${colors.red}` : ""}`,
          transform: `translateY(${(1 - s) * 80 + flut}px) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.5),
          display: "flex", flexDirection: "column", gap: 16, overflow: "hidden",
        }}
      >
        <div style={{ color: al ? "#FF9A8F" : colors.amber }}>{icone}</div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 34, lineHeight: 1.1, color: al ? "#fff" : colors.ink }}>{titulo}</div>
        {children}
      </div>
    </Shake>
  );
};

const Cobrancas: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const itens = ["Streaming", "Armazenamento", "Música", "App de treino", "Jornal", "Streaming"];
  const y = -((Math.max(0, frame - at) * 2.2) % 216);
  return (
    <div style={{ height: 150, overflow: "hidden", maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)" }}>
      <div style={{ transform: `translateY(${y}px)` }}>
        {[...itens, ...itens].map((it, i) => (
          <div key={i} style={{ height: 36, display: "flex", justifyContent: "space-between", fontFamily, fontSize: 22, color: colors.ink2 }}>
            <span>{it}</span>
            <span style={{ color: colors.red, fontWeight: 700 }}>cobrando…</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const S2Problema: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const bloco = frame < t.b1 ? 0 : frame < t.b2 ? 1 : frame < t.b3 ? 2 : frame < t.b4 ? 3 : 4;
  // whip-pan de entrada (continua o movimento da S1)
  const whip = interpolate(frame, [0, 9], [1, 0], clampOpt);
  const pulsoQ = 1 + 0.05 * Math.sin((frame / fps) * Math.PI * 2 * 1.875);

  return (
    <AbsoluteFill style={{ transform: `translateX(${whip * 520}px)`, filter: whip > 0.02 ? `blur(${whip * 22}px)` : undefined }}>
      <CameraRig dur={dur} zoom={[1, 1.05]} socos={[t.b1, t.b2, t.b3, t.b4].map((at) => ({ at, para: 1.05, dur: 12 }))}>
        {bloco === 0 ? (
          <>
            <Fundo tema="claro" seed="s2a" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
              <Eyebrow texto="HOJE, QUASE TODO MUNDO TEM" at={6} />
              <div style={{ height: 34 }} />
              <KineticText texto="uma vida inteira no digital" inicio={14} stagger={5} destaque={["digital"]} cor={colors.ink} tamanho={70} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 480 }}>
              <div style={{ display: "flex", gap: 36 }}>
                {ATIVOS.map((a, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 140 }}>
                    <Tile entra={t.pops[i]} escuro={false} tamanho={120} icone={<a.Ic size={56} strokeWidth={1.8} />} />
                    <div style={{ fontFamily, fontWeight: 700, fontSize: 21, color: colors.ink2, textAlign: "center", opacity: interpolate(frame, [t.pops[i] + 3, t.pops[i] + 9], [0, 1], clampOpt) }}>{a.nome}</div>
                  </div>
                ))}
              </div>
            </AbsoluteFill>
          </>
        ) : null}

        {bloco === 1 ? (
          <>
            <Fundo tema="claro" seed="s2b" />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
              <div style={{ fontFamily, fontWeight: 900, fontSize: 380, color: colors.teal700, transform: `scale(${pulsoQ})`, textShadow: "0 20px 60px rgba(14,90,87,.25)" }}>?</div>
            </AbsoluteFill>
            <Orbit
              cx={960} cy={470} raio={560} achata={0.36} periodo={260} caos={t.existe + 6}
              entradas={ATIVOS.map((_, i) => t.b1 + i * 3)} tamanho={96}
              itens={ATIVOS.map((a, i) => (
                <div key={i} style={{ width: 96, height: 96, borderRadius: 24, background: colors.white, border: `2px solid ${colors.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.teal700, boxShadow: "0 14px 30px rgba(11,63,61,.15)" }}>
                  <a.Ic size={46} strokeWidth={1.8} />
                </div>
              ))}
            />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
              <KineticText texto="Sem lista." inicio={t.existe - 4} stagger={6} destaque={["lista"]} cor={colors.ink} tamanho={110} />
            </AbsoluteFill>
          </>
        ) : null}

        {bloco === 2 ? (
          <>
            <Fundo tema="escuro" seed="s2c" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
              <KineticText texto="Sem senhas." inicio={t.b2 + 2} stagger={6} destaque={["senhas"]} tamanho={110} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 360 }}>
              <CampoSenha inicio={t.b2 + 4} tranca={t.senhas} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 610, paddingLeft: 420 }}>
              <Stamp texto="TRANCADO" at={t.senhas + 4} cor={colors.amberBorder} tamanho={58} />
            </AbsoluteFill>
          </>
        ) : null}

        {bloco === 3 ? (
          <>
            <Fundo tema="claro" seed="s2d" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
              <KineticText texto="Sem instruções." inicio={t.b3 + 2} stagger={6} destaque={["instruções"]} cor={colors.ink} tamanho={110} />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
              <Bilhete inicio={t.b3 + 4} amassa={t.queria + 2} />
            </AbsoluteFill>
          </>
        ) : null}

        {bloco === 4 ? (
          <>
            <Fundo tema="ambar" seed="s2e" />
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
              <KineticText texto="Resultado:" inicio={t.b4 + 2} stagger={5} tamanho={96} cor="#FFF4DF" />
            </AbsoluteFill>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 270 }}>
              <div style={{ display: "flex", gap: 40 }}>
                <Card at={t.perdidos - 4} icone={<Gem size={56} />} titulo="Bens com valor perdidos">
                  <div style={{ fontFamily, fontSize: 22, color: colors.ink2 }}>Cripto, milhas, perfis que geram renda — sem ninguém saber que existem.</div>
                </Card>
                <Card at={t.assinaturas - 4} icone={<Receipt size={56} />} titulo="Assinaturas cobrando para sempre">
                  <Cobrancas at={t.assinaturas} />
                </Card>
                <Card at={t.perfis - 4} alerta={t.golpe} icone={frame >= t.golpe ? <ShieldAlert size={56} /> : <User size={56} />} titulo={frame >= t.golpe ? "Perfil virou alvo de golpe" : "Perfis abandonados"}>
                  <div style={{ fontFamily, fontSize: 22, color: frame >= t.golpe ? "#FFD0CA" : colors.ink2 }}>
                    {frame >= t.golpe ? "⚠ Mensagens pedindo dinheiro em nome de quem já partiu." : "Ninguém mais cuida da conta."}
                  </div>
                </Card>
              </div>
            </AbsoluteFill>
          </>
        ) : null}
      </CameraRig>
      {[t.b1, t.b2, t.b3, t.b4].map((at) => <Flash key={at} at={at} dur={2} max={0.5} />)}
      <Flash at={dur - 5} dur={4} max={0.8} />
    </AbsoluteFill>
  );
};
