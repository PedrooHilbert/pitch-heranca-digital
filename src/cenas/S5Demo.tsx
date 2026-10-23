// S5 — Demo do protótipo (≈ 40 s, claro, tela em 3D). PROMPT_V2 §5 — a cena mais cuidada.
// Sub-cenas ancoradas nas frases s05_01..s05_07; troca por "match-cut" (zoom no elemento clicado →
// a próxima tela cresce a partir dele). UI se monta por blocos reais (regions.json); widgets saltam da tela.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, Fingerprint, Bell, Lock, Copy, Eye, UserRound, ScanFace, FileCheck2, AlertTriangle, Camera, Share2, Mail, Globe } from "lucide-react";
import { relogio } from "../data/timeline";
import { textos, fundo, telaDe } from "../data/projeto";
import { colors } from "../data/theme";
import { fontFamily } from "../fonts";
import { Fundo } from "../components/v2/Fundo";
import { PhoneFrame } from "../components/PhoneFrame";
import { Tilt3D, ScreenAssembly, Cursor, Counter, Roleta, Stamp, Shake, DrawPath, Flash, KineticText, UIBlock, vidro, CameraRig, regiao } from "../components/fx";
import type { Cue } from "../data/sfx";

const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Valores iniciais (semente do project.json). Em tempo de render vale o que está no projeto. */
export const PADRAO_S5 = {
  textos: {
    abertura: "Este é o *protótipo.*",
    selo: "PROTÓTIPO",
    etapa: "etapa {n} de 7",
    digitalOk: "Digital reconhecida",
    anel: "itens\nconcluídos",
    contador1: "ativos", contador2: "herdeiros", contador3: "com destino", contador4: "sem destino",
    donut1: "Entrega direta", donut2: "Conforme a partilha", donut3: "Encerrar ou apagar", donut4: "Sem destino",
    alertaSemDestino: "2 ativos sem destino",
    tipo1: "Redes sociais", tipo2: "E-mails", tipo3: "Cripto", tipo4: "Assinaturas",
    rotulo: "X (Twitter): sem destino",
    destino1: "Pessoal", destino1Sub: "memorial, apagar, entregar",
    destino2: "Patrimonial", destino2Sub: "tem valor: entra no inventário",
    destino3: "Encerrar", destino3Sub: "fechar a conta",
    herdeiro1: "Lucas Souza", parentesco1: "Filho",
    herdeiro2: "Ana Souza", parentesco2: "Filha",
    herdeiro3: "Carlos Souza", parentesco3: "Irmão",
    herdeiroRotulo: "herdeiro",
    carencia: "Carência", dias: "dias",
    check1: "Certidão de óbito", check2: "Documento do inventário", check3: "Identidade confirmada",
    selfie: "selfie",
    aviso1: "Lucas foi avisado", aviso2: "Ana foi avisada", aviso3: "Carlos foi avisado",
    carimbo: "LIBERAÇÃO SUSPENSA",
    senha: "Senha:", senhaValor: "exemplo-1234", copiar: "Copiar", copiado: "Copiado",
    item1: "Instagram", item1Sub: "manter como memorial",
    item2: "Item de outro herdeiro", item2Sub: "só a parte dele",
    item3: "Item de outro herdeiro", item3Sub: "só a parte dele",
    item4: "Domínio", item4Sub: "conforme a partilha",
  },
  fundos: { demo: "claro" },
  telas: {
    login: { tela: "Main", regioes: [0, 1] },
    inicio: { tela: "Dashboard", regioes: [0, 2, 3, 5, 6, 8, 9] },
    ativos: { tela: "Inventario", regioes: [0, 2, 3, 4, 7] },
    novo: { tela: "NovoAtivo", regioes: [0, 2, 3, 4] },
    herdeiros: { tela: "Herdeiros", regioes: [0, 2, 3, 4, 6, 7] },
    regras: { tela: "Regras", regioes: [0, 2, 3, 4, 5, 6] },
    pedido: { tela: "AbrirPedido", regioes: [0, 1, 2, 3] },
    acompanhar: { tela: "Solicitacao", regioes: [0, 1, 2, 3] },
    contestar: { tela: "Contestacao", regioes: [0, 1] },
    acesso: { tela: "AcessoLiberado", regioes: [0, 1, 2] },
    celular: { tela: "Mobile-Acesso", regioes: [1, 2] },
  },
} as const;
type PlanoS5 = keyof typeof PADRAO_S5.telas;
const TL5 = (k: PlanoS5) => telaDe("s5", k, { tela: PADRAO_S5.telas[k].tela as string, regioes: [...PADRAO_S5.telas[k].regioes] as number[] });
const SX = 340;
const SY = 118;
const SW = 1240;
const SH = 742;
const ESC = SW / 1360;
const tela = (x: number, y: number, rol = 0): [number, number] => [SX + x * ESC, SY + (y - rol) * ESC];

const T = () => {
  const r = relogio("s5");
  const s1 = "s05_01", s2 = "s05_02", s3 = "s05_03", s4 = "s05_04", s5 = "s05_05", s6 = "s05_06", s7 = "s05_07";
  const A = 0;
  const B = r.em(s2, "vê", 4);
  const C = r.ini(s3) - 4;
  const C2 = r.em(s3, "destino", 6);
  const D = r.ini(s4) - 4;
  const D2 = r.em(s4, "carência", 6);
  const E = r.ini(s5) - 4;
  const F = r.ini(s6) - 4;
  const F2 = r.em(s6, "contestar", 4);
  const G = r.ini(s7) - 4;
  return {
    r, A, B, C, C2, D, D2, E, F, F2, G,
    prototipo: r.em(s1, "Este", 2),
    telaEntra: r.fim(s1) - 6,
    chave: r.em(s2, "chave"),
    falta: r.em(s2, "falta"),
    plano: r.em(s2, "plano"),
    completo: r.em(s2, "completo"),
    tipos: [r.em(s3, "redes"), r.em(s3, "e-mails"), r.em(s3, "cripto"), r.em(s3, "assinaturas")],
    ativo: r.em(s3, "ativo"),
    pessoal: r.em(s3, "pessoal"),
    patrimonial: r.em(s3, "patrimonial"),
    encerrar: r.em(s3, "encerrar"),
    herdeiros: r.em(s4, "herdeiros"),
    numeros: [r.em(s4, "quinze"), r.em(s4, "trinta"), r.em(s4, "sessenta"), r.em(s4, "noventa")],
    certidao: r.em(s5, "certidão"),
    documento: r.em(s5, "documento"),
    selfie: r.em(s5, "selfie"),
    identidade: r.em(s5, "identidade"),
    valida: r.em(s6, "valida"),
    avisados: r.em(s6, "avisados"),
    prazo: r.em(s7, "prazo"),
    so: r.em(s7, "só"),
    instrucoes: r.em(s7, "instruções"),
  };
};

export const sfxS5 = (): Cue[] => {
  const t = T();
  const clique = t.numeros[3] + 18;
  return [
    { f: t.prototipo, som: "impact_low", ganho: 0.2 },
    { f: t.telaEntra, som: "whoosh_long" },
    { f: t.chave + 6, som: "pop" },
    { f: t.chave + 8, som: "ping" },
    ...[t.B, t.C, t.C2, t.D, t.D2, t.E, t.F, t.F2, t.G].map((f) => ({ f, som: "whoosh_short" as const })),
    ...Array.from({ length: 8 }, (_, k) => ({ f: t.falta + k * 3, som: "tick" as const })),
    ...Array.from({ length: 8 }, (_, k) => ({ f: t.plano + k * 3, som: "tick" as const })),
    { f: t.completo + 14, som: "thunk" },
    ...t.tipos.map((f) => ({ f, som: "pop" as const })),
    { f: t.ativo + 6, som: "pop" },
    { f: t.pessoal, som: "pop" }, { f: t.patrimonial, som: "pop" }, { f: t.encerrar, som: "pop" },
    ...[0, 6, 12].map((k) => ({ f: t.herdeiros + k, som: "pop" as const })),
    ...t.numeros.map((f) => ({ f, som: "tick" as const })),
    { f: clique, som: "lock_click" },
    { f: t.certidao, som: "chime_ok" },
    { f: t.documento, som: "chime_ok" },
    { f: t.selfie + 12, som: "shutter" },
    { f: t.identidade, som: "chime_ok" },
    { f: t.valida, som: "tick" },
    ...[0, 8, 16].map((k) => ({ f: t.avisados + k, som: "ping" as const })),
    { f: t.F2 + 6, som: "impact_low" },
    { f: t.G + 10, som: "whoosh_long" },
    { f: t.so + 4, som: "lock_click" },
    { f: t.instrucoes - 20, som: "pop" },
    { f: t.instrucoes, som: "chime_ok" },
  ];
};

/** Sub-cena com match-cut: cresce a partir de `de` e, no fim, mergulha (zoom) em `para`. */
const Sub: React.FC<{ ini: number; fim: number; de?: [number, number]; para?: [number, number]; children: React.ReactNode }> = ({ ini, fim, de = [960, 540], para = [960, 540], children }) => {
  const frame = useCurrentFrame();
  if (frame < ini - 2 || frame > fim + 2) return null;
  const e = interpolate(frame, [ini - 2, ini + 9], [0, 1], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  const s = interpolate(frame, [fim - 7, fim + 2], [0, 1], { ...clampOpt, easing: Easing.in(Easing.cubic) });
  const saindo = s > 0;
  const escala = saindo ? 1 + s * 1.8 : 0.22 + 0.78 * e;
  const blur = saindo ? s * 14 : (1 - e) * 12;
  const origem = saindo ? para : de;
  return (
    <AbsoluteFill style={{ transform: `scale(${escala})`, transformOrigin: `${origem[0]}px ${origem[1]}px`, opacity: saindo ? 1 - s * 0.9 : Math.min(1, e * 1.6), filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

const Widget: React.FC<{ at: number; x: number; y: number; w?: number; children: React.ReactNode; tremeAt?: number; ambar?: boolean }> = ({ at, x, y, w, children, tremeAt, ambar }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 210, mass: 0.6 } });
  const flut = Math.sin((frame + at) / 20) * 4;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateY(${(1 - s) * 50 + flut}px) scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.6), zIndex: 30 }}>
      <Shake tremidas={tremeAt != null ? [{ at: tremeAt, amp: 10, dur: 12 }, { at: tremeAt + 14, amp: 8, dur: 10 }] : []}>
        <div style={{ ...vidro(false), padding: "18px 24px", border: ambar ? `2px solid ${colors.amberBorder}` : `1px solid ${colors.cardBorder}`, background: ambar ? colors.amberBg : "rgba(255,255,255,0.96)" }}>{children}</div>
      </Shake>
    </div>
  );
};

const Anel: React.FC<{ at: number; de: number; ate: number; total: number }> = ({ at, de, ate, total }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + 24], [de, ate], { ...clampOpt, easing: Easing.out(Easing.cubic) });
  const C = 2 * Math.PI * 52;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={130} height={130}>
        <circle cx={65} cy={65} r={52} fill="none" stroke={colors.tealTint} strokeWidth={14} />
        <circle cx={65} cy={65} r={52} fill="none" stroke={colors.teal400} strokeWidth={14} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v / total)} transform="rotate(-90 65 65)" />
        <text x={65} y={76} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill={colors.ink}>{`${Math.round(v)}/${total}`}</text>
      </svg>
      <div style={{ fontFamily, fontWeight: 800, fontSize: 26, color: colors.ink, lineHeight: 1.15, whiteSpace: "pre-line" }}>{textos("s5")("anel")}</div>
    </div>
  );
};

const Donut: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const fatias = [
    { v: 5, c: colors.teal900, t: textos("s5")("donut1") },
    { v: 3, c: colors.teal400, t: textos("s5")("donut2") },
    { v: 2, c: colors.mint, t: textos("s5")("donut3") },
    { v: 2, c: colors.amberBorder, t: textos("s5")("donut4") },
  ];
  const C = 2 * Math.PI * 60;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={160} height={160}>
        {fatias.map((f, i) => {
          const p = interpolate(frame, [at + i * 6, at + i * 6 + 8], [0, 1], clampOpt);
          const len = (f.v / 12) * C * p;
          const off = acc;
          acc += (f.v / 12) * C;
          return <circle key={i} cx={80} cy={80} r={60} fill="none" stroke={f.c} strokeWidth={26} strokeDasharray={`${len} ${C}`} strokeDashoffset={-off} transform="rotate(-90 80 80)" />;
        })}
        <text x={80} y={92} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={36} fill={colors.ink}>12</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {fatias.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily, fontSize: 18, fontWeight: 600, color: colors.ink2, opacity: interpolate(frame, [at + i * 6, at + i * 6 + 6], [0, 1], clampOpt) }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: f.c }} />{f.t}
          </div>
        ))}
      </div>
    </div>
  );
};

const Etapa: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: "absolute", left: SX, top: 82, width: SW, display: "flex", alignItems: "center", gap: 18, zIndex: 40 }}>
    <div style={{ padding: "6px 14px", borderRadius: 999, background: colors.greenBg, color: colors.green, border: "1px solid #BFE6CB", fontFamily, fontWeight: 800, fontSize: 16, letterSpacing: "0.1em" }}>{textos("s5")("selo")}</div>
    <div style={{ flex: 1, height: 6, borderRadius: 999, background: colors.cardBorder, overflow: "hidden" }}>
      <div style={{ width: `${(n / 7) * 100}%`, height: "100%", background: colors.teal600, borderRadius: 999 }} />
    </div>
    <div style={{ fontFamily, fontWeight: 700, fontSize: 18, color: colors.ink3 }}>{textos("s5")("etapa").replace("{n}", String(n))}</div>
  </div>
);

const Rotulo: React.FC<{ at: number; x: number; y: number; texto: string; para: [number, number] }> = ({ at, x, y, texto, para }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 220 } });
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, zIndex: 34, pointerEvents: "none" }}>
        <DrawPath d={`M ${x} ${y} L ${para[0]} ${para[1]}`} inicio={at} dur={8} cor={colors.teal600} largura={3} />
        <circle cx={para[0]} cy={para[1]} r={7 * s} fill={colors.teal600} />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, zIndex: 35, padding: "10px 18px", borderRadius: 999, background: colors.teal900, color: "#fff", fontFamily, fontWeight: 800, fontSize: 22, whiteSpace: "nowrap", boxShadow: "0 10px 26px rgba(0,0,0,.25)" }}>
        {texto}
      </div>
    </>
  );
};

export const S5Demo: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = T();
  const tx = textos("s5");
  const cel = TL5("celular");
  const botaoChave = tela(1044, 289);
  const etapa = frame < t.B ? 1 : frame < t.C ? 2 : frame < t.D ? 3 : frame < t.E ? 4 : frame < t.F ? 5 : frame < t.G ? 6 : 7;
  const rolRegras = 430;
  const clique30 = t.numeros[3] + 18;

  return (
    <AbsoluteFill>
      <Fundo tema={fundo("s5", "demo", "claro")} seed="s5" />
      <CameraRig dur={dur} zoom={[1, 1.04]}>
        {/* abertura: "Este é o protótipo." */}
        {frame < t.telaEntra + 8 ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [t.telaEntra, t.telaEntra + 8], [1, 0], clampOpt) }}>
            <KineticText texto={tx("abertura")} inicio={t.prototipo} stagger={5} cor={colors.ink} tamanho={120} />
          </AbsoluteFill>
        ) : null}

        {frame >= t.telaEntra ? <Etapa n={etapa} /> : null}

        {/* 5a — Entrar */}
        <Sub ini={t.telaEntra} fim={t.B} para={botaoChave}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.telaEntra} assenta={t.telaEntra + 20} rotY={-14} rotX={8}>
              <ScreenAssembly tela={TL5("login").tela} largura={SW} altura={SH} inicio={t.telaEntra + 2} ordem={TL5("login").regioes} stagger={6} />
            </Tilt3D>
          </div>
          {[0, 6, 12].map((d) => {
            const k = frame - (t.chave + 6) - d;
            if (k < 0 || k > 22) return null;
            const r = interpolate(k, [0, 22], [30, 190]);
            return <div key={d} style={{ position: "absolute", left: botaoChave[0] - r, top: botaoChave[1] - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `4px solid ${colors.mint}`, opacity: 1 - k / 22, zIndex: 31 }} />;
          })}
          <Widget at={t.chave + 8} x={botaoChave[0] - 120} y={botaoChave[1] + 70}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily, fontWeight: 800, fontSize: 24, color: colors.teal700 }}>
              <Fingerprint size={36} /> {tx("digitalOk")}
            </div>
          </Widget>
          <Cursor pontos={[{ f: t.telaEntra + 14, x: 820, y: 760 }, { f: t.chave, x: botaoChave[0] - 20, y: botaoChave[1] }]} cliques={[t.chave + 6]} />
        </Sub>

        {/* 5b — Início (dashboard) */}
        <Sub ini={t.B} fim={t.C} de={botaoChave} para={tela(360, 640)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.B} assenta={t.B + 16} rotY={10}>
              <ScreenAssembly tela={TL5("inicio").tela} largura={SW} altura={SH} inicio={t.B + 2} ordem={TL5("inicio").regioes} stagger={3} rolagem={{ de: 0, ate: 70, f0: t.B, f1: t.C }} />
            </Tilt3D>
          </div>
          <Widget at={t.falta} x={1290} y={150}><Anel at={t.falta} de={0} ate={3} total={6} /></Widget>
          <Widget at={t.plano} x={92} y={330} w={300}>
            {[
              { n: 12, t: tx("contador1") }, { n: 3, t: tx("contador2") }, { n: 10, t: tx("contador3") }, { n: 2, t: tx("contador4") },
            ].map((k, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily, color: i === 3 ? colors.amber : colors.ink }}>
                <Counter ate={k.n} inicio={t.plano + i * 3} dur={22} style={{ fontSize: 46, fontWeight: 900, minWidth: 60 }} />
                <span style={{ fontSize: 22, fontWeight: 700 }}>{k.t}</span>
              </div>
            ))}
          </Widget>
          <Widget at={t.completo - 12} x={1250} y={470}><Donut at={t.completo - 12} /></Widget>
          <Widget at={t.completo + 6} x={560} y={690} ambar tremeAt={t.completo + 14}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily, fontWeight: 800, fontSize: 24, color: colors.amber }}>
              <AlertTriangle size={30} /> {tx("alertaSemDestino")}
            </div>
          </Widget>
        </Sub>

        {/* 5c — Ativos: inventário → novo ativo */}
        <Sub ini={t.C} fim={t.C2} de={tela(360, 640)} para={tela(1139, 420)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.C} assenta={t.C + 18} rotY={-10}>
              <ScreenAssembly tela={TL5("ativos").tela} largura={SW} altura={SH} inicio={t.C + 2} ordem={TL5("ativos").regioes} stagger={5} pops={[{ regiao: 7, at: t.ativo + 6, ate: t.C2 - 10, escala: 1.06 }]} />
            </Tilt3D>
          </div>
          {[tx("tipo1"), tx("tipo2"), tx("tipo3"), tx("tipo4")].map((n, i) => (
            <Widget key={i} at={t.tipos[i]} x={88} y={190 + i * 110} w={232}>
              <div style={{ fontFamily, fontWeight: 800, fontSize: 24, color: colors.teal700 }}>{n}</div>
            </Widget>
          ))}
          <Rotulo at={t.ativo + 12} x={1560} y={180} texto={tx("rotulo")} para={tela(1139, 420)} />
        </Sub>
        <Sub ini={t.C2} fim={t.D} de={tela(1139, 420)} para={tela(700, 520)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.C2} assenta={t.C2 + 16} rotY={10}>
              <ScreenAssembly tela={TL5("novo").tela} largura={SW} altura={SH} inicio={t.C2 + 2} ordem={TL5("novo").regioes} stagger={4} />
            </Tilt3D>
          </div>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 560, zIndex: 32 }}>
            <div style={{ display: "flex", gap: 30 }}>
              {[
                { at: t.pessoal, n: tx("destino1"), c: colors.teal600, d: tx("destino1Sub") },
                { at: t.patrimonial, n: tx("destino2"), c: colors.blue, d: tx("destino2Sub") },
                { at: t.encerrar, n: tx("destino3"), c: colors.amber, d: tx("destino3Sub") },
              ].map((x, i) => {
                const s = spring({ frame: frame - x.at, fps, config: { damping: 8, stiffness: 230, mass: 0.6 } });
                if (frame < x.at) return <div key={i} style={{ width: 360 }} />;
                return (
                  <div key={i} style={{ width: 360, padding: "22px 26px", borderRadius: 24, background: x.c, color: "#fff", transform: `translateY(${(1 - s) * 120}px) scale(${0.7 + 0.3 * s}) rotate(${(1 - s) * (i - 1) * 8}deg)`, boxShadow: `0 20px 50px ${x.c}66` }}>
                    <div style={{ fontFamily, fontWeight: 900, fontSize: 40 }}>{x.n}</div>
                    <div style={{ fontFamily, fontWeight: 600, fontSize: 20, opacity: 0.9 }}>{x.d}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        </Sub>

        {/* 5d — Herdeiros → Regras (carência) */}
        <Sub ini={t.D} fim={t.D2} de={tela(700, 520)} para={tela(800, 720)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.D} assenta={t.D + 18} rotY={-10}>
              <ScreenAssembly tela={TL5("herdeiros").tela} largura={SW} altura={SH} inicio={t.D + 2} ordem={TL5("herdeiros").regioes} stagger={4} pops={[{ regiao: 4, at: t.herdeiros, ate: t.D2 }]} />
            </Tilt3D>
          </div>
          {[1, 2, 3].map((k) => ({ n: tx(`herdeiro${k}`), p: tx(`parentesco${k}`) })).map((h, i) => {
            const s = spring({ frame: frame - (t.herdeiros + i * 6), fps, config: { damping: 11, stiffness: 200 } });
            if (frame < t.herdeiros + i * 6) return null;
            const ang = (i - 1) * 5 * s;
            const dx = (i - 1) * 440 * s;
            return (
              <div key={i} style={{ position: "absolute", left: 760, top: 640, width: 400, transformOrigin: "50% 100%", transform: `translateX(${dx}px) rotate(${ang}deg) translateY(${(1 - s) * 60}px)`, zIndex: 33 - i, ...vidro(false), padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: colors.tealTint, color: colors.teal700, display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={30} /></div>
                <div>
                  <div style={{ fontFamily, fontWeight: 800, fontSize: 24, color: colors.ink }}>{h.n}</div>
                  <div style={{ fontFamily, fontWeight: 600, fontSize: 18, color: colors.ink3 }}>{h.p} · {tx("herdeiroRotulo")}</div>
                </div>
              </div>
            );
          })}
        </Sub>
        <Sub ini={t.D2} fim={t.E} de={tela(800, 720, rolRegras)} para={tela(800, 720, rolRegras)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.D2} assenta={t.D2 + 16} rotY={10}>
              <ScreenAssembly tela={TL5("regras").tela} largura={SW} altura={SH} inicio={t.D2 + 2} ordem={TL5("regras").regioes} stagger={3} rolagem={{ de: rolRegras, ate: rolRegras, f0: 0, f1: 1 }} pops={[{ regiao: 4, at: t.numeros[0] - 6 }]} />
            </Tilt3D>
          </div>
          <Widget at={t.numeros[0] - 4} x={1330} y={300}>
            <div style={{ fontFamily, fontWeight: 700, fontSize: 22, color: colors.ink2, textAlign: "center" }}>{tx("carencia")}</div>
            <Roleta valores={["15", "30", "60", "90", "30"]} tempos={[t.numeros[0], t.numeros[1], t.numeros[2], t.numeros[3], clique30]} altura={110}
              style={{ width: 200 }} itemStyle={(a) => ({ fontFamily, fontWeight: 900, fontSize: 92, color: a ? colors.teal700 : colors.ink3 })} />
            <div style={{ fontFamily, fontWeight: 700, fontSize: 22, color: colors.ink2, textAlign: "center" }}>{tx("dias")}</div>
          </Widget>
          <Cursor pontos={[{ f: t.numeros[2], x: 1100, y: 760 }, { f: clique30 - 2, x: 1430, y: 470 }]} cliques={[clique30]} />
        </Sub>

        {/* 5e — Pedido do herdeiro */}
        <Sub ini={t.E} fim={t.F} de={tela(800, 720, rolRegras)} para={tela(700, 500)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.E} assenta={t.E + 18} rotY={-10}>
              <ScreenAssembly tela={TL5("pedido").tela} largura={SW} altura={SH} inicio={t.E + 2} ordem={TL5("pedido").regioes} stagger={5} rolagem={{ de: 0, ate: 260, f0: t.E + 20, f1: t.F }} />
            </Tilt3D>
          </div>
          <Widget at={t.certidao - 10} x={1240} y={150} w={560}>
            {[
              { at: t.certidao, txt: tx("check1"), Ic: FileCheck2 },
              { at: t.documento, txt: tx("check2"), Ic: FileCheck2 },
              { at: t.identidade, txt: tx("check3"), Ic: ScanFace },
            ].map((c, i) => {
              const ok = frame >= c.at;
              const s = spring({ frame: frame - c.at, fps, config: { damping: 9, stiffness: 260 } });
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", fontFamily, fontWeight: 700, fontSize: 25, color: ok ? colors.ink : colors.ink3 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: ok ? colors.greenBg : colors.bg2, color: colors.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ok ? 0.7 + 0.3 * s : 1})` }}>
                    {ok ? <Check size={26} strokeWidth={3.2} /> : <c.Ic size={20} />}
                  </div>
                  {c.txt}
                </div>
              );
            })}
          </Widget>
          {frame >= t.selfie - 6 && frame < t.identidade + 30 ? (
            <Widget at={t.selfie - 6} x={1380} y={430}>
              <div style={{ position: "relative", width: 220, height: 260, borderRadius: 24, background: colors.teal900, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <UserRound size={130} color={colors.mintSoft} />
                <div style={{ position: "absolute", left: 20, right: 20, height: 4, background: colors.mint, boxShadow: `0 0 16px ${colors.mint}`, top: 20 + ((frame - t.selfie) * 9) % 220 }} />
                <div style={{ position: "absolute", inset: 14, border: `3px dashed ${frame >= t.identidade ? colors.green : colors.mint}`, borderRadius: 20 }} />
                {frame >= t.identidade ? <div style={{ position: "absolute", inset: 0, background: "rgba(21,128,61,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Check size={110} strokeWidth={3.4} /></div> : null}
                <div style={{ position: "absolute", top: 10, left: 12, color: colors.mint, display: "flex", gap: 6, fontFamily, fontWeight: 800, fontSize: 16 }}><Camera size={18} /> {tx("selfie")}</div>
              </div>
            </Widget>
          ) : null}
          <Flash at={t.selfie + 12} dur={3} max={0.85} />
        </Sub>

        {/* 5f — Acompanhar e contestar */}
        <Sub ini={t.F} fim={t.F2} de={tela(700, 500)} para={tela(680, 540)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Tilt3D inicio={t.F} assenta={t.F + 16} rotY={10}>
              <ScreenAssembly tela={TL5("acompanhar").tela} largura={SW} altura={SH} inicio={t.F + 2} ordem={TL5("acompanhar").regioes} stagger={3} rolagem={{ de: 60, ate: 300, f0: t.F + 8, f1: t.F2 }} pops={[{ regiao: 2, at: t.valida }]} />
            </Tilt3D>
          </div>
          {[tx("aviso1"), tx("aviso2"), tx("aviso3")].map((n, i) => (
            <Widget key={n} at={t.avisados + i * 8} x={1380} y={140 + i * 96} w={420}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily, fontWeight: 700, fontSize: 22, color: colors.ink }}>
                <Bell size={26} color={colors.teal600} /> {n}
              </div>
            </Widget>
          ))}
        </Sub>
        <Sub ini={t.F2} fim={t.G} de={tela(680, 540)} para={tela(680, 400)}>
          <div style={{ position: "absolute", left: SX, top: SY }}>
            <Shake tremidas={[{ at: t.F2 + 6, amp: 16, dur: 10 }]}>
              <Tilt3D inicio={t.F2} assenta={t.F2 + 10} rotY={-8}>
                <ScreenAssembly tela={TL5("contestar").tela} largura={SW} altura={SH} inicio={t.F2 + 1} ordem={TL5("contestar").regioes} stagger={3} />
              </Tilt3D>
            </Shake>
          </div>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 420, zIndex: 36 }}>
            <Stamp texto={tx("carimbo")} at={t.F2 + 6} cor={colors.red} tamanho={64} rot={-9} style={{ background: "rgba(255,255,255,0.9)" }} />
          </AbsoluteFill>
        </Sub>

        {/* 5g — Acesso liberado */}
        <Sub ini={t.G} fim={dur + 10} de={tela(680, 400)}>
          <div style={{ position: "absolute", left: SX - 160, top: SY }}>
            <Tilt3D inicio={t.G} assenta={t.G + 18} rotY={-12}>
              <ScreenAssembly tela={TL5("acesso").tela} largura={SW - 120} altura={SH} inicio={t.G + 2} ordem={TL5("acesso").regioes} stagger={5} rolagem={{ de: 40, ate: 420, f0: t.G + 20, f1: dur }} />
            </Tilt3D>
          </div>
          {(() => {
            const s = spring({ frame: frame - (t.G + 10), fps, config: { damping: 14, stiffness: 160 } });
            const PW = 330;
            const PH = 700;
            return (
              <div style={{ position: "absolute", left: 1500 + (1 - s) * 520, top: 130, transform: `rotate(${(1 - s) * 12}deg)`, zIndex: 33 }}>
                <PhoneFrame width={PW} height={PH}>
                  <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                    <UIBlock tela={cel.tela} regiao={cel.regioes[0] ?? 0} escala={(PW - 20) / 390} x={0} y={0} inicio={t.G + 14} entrada="sobe" raio={0} sombra={false} />
                    {cel.regioes[1] != null ? <UIBlock tela={cel.tela} regiao={cel.regioes[1]} escala={(PW - 20) / 390} x={0} y={(regiao(cel.tela, cel.regioes[0] ?? 0).h + 16) * ((PW - 20) / 390)} inicio={t.G + 20} raio={0} sombra={false} /> : null}
                  </div>
                </PhoneFrame>
              </div>
            );
          })()}
          {/* "Mostrar" desembaça a senha, "Copiar" ganha ✓ */}
          <Widget at={t.prazo} x={150} y={530} w={1000}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily }}>
              <Eye size={30} color={colors.teal700} />
              <span style={{ fontWeight: 700, fontSize: 24, color: colors.ink2 }}>{tx("senha")}</span>
              <span style={{ fontSize: 30, fontWeight: 800, color: colors.ink, letterSpacing: "0.04em", filter: `blur(${interpolate(frame, [t.prazo + 14, t.prazo + 30], [9, 0], clampOpt)}px)` }}>{tx("senhaValor")}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 22, color: frame >= t.so - 6 ? colors.green : colors.teal700 }}>
                {frame >= t.so - 6 ? <Check size={24} strokeWidth={3} /> : <Copy size={22} />} {frame >= t.so - 6 ? tx("copiado") : tx("copiar")}
              </span>
            </div>
          </Widget>
          {[
            { Ic: Camera, n: tx("item1"), d: tx("item1Sub"), meu: true },
            { Ic: Share2, n: tx("item2"), d: tx("item2Sub"), meu: false },
            { Ic: Mail, n: tx("item3"), d: tx("item3Sub"), meu: false },
            { Ic: Globe, n: tx("item4"), d: tx("item4Sub"), meu: true },
          ].map((it, i) => (
            <Widget key={i} at={t.so + i * 5} x={150 + (i % 2) * 520} y={650 + Math.floor(i / 2) * 104} w={480}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily, opacity: it.meu ? 1 : 0.5, filter: it.meu ? undefined : "grayscale(1)" }}>
                <it.Ic size={28} color={colors.teal700} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: colors.ink }}>{it.n}</div>
                  <div style={{ fontWeight: 600, fontSize: 17, color: colors.ink3 }}>{it.d}</div>
                </div>
                {it.meu ? <Check size={26} color={colors.green} strokeWidth={3} /> : <Lock size={24} color={colors.ink3} />}
              </div>
            </Widget>
          ))}
        </Sub>
      </CameraRig>
    </AbsoluteFill>
  );
};
