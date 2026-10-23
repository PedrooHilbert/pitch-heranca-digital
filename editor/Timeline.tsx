// Timeline estilo editor de vídeo: régua em segundos + linhas de batida, playhead arrastável, zoom
// (Ctrl+roda) e as trilhas Cenas · Legendas · Voz · SFX · Trilha · Comentários (cada uma com mudo/solo).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Projeto } from "../src/data/schema";
import { LIMITE_QUADROS } from "../src/data/schema";
import type { Derivado } from "../src/data/projeto";
import { produzir } from "./store";
import { usePicos, caminhoOnda } from "./ondas";
import { arrastar, encaixar, limitar, tempo, type Revisao, type Selecao, type TrilhaId } from "./util";

type Props = {
  projeto: Projeto;
  d: Derivado;
  frame: number;
  onSeek: (f: number) => void;
  sel: Selecao | null;
  onSelect: (s: Selecao) => void;
  alterar: (fn: (p: Projeto) => Projeto, o?: { historico?: boolean }) => void;
  iniciarGesto: () => void;
  revisoes: Revisao[];
  mudos: Record<TrilhaId, boolean>;
  solos: Record<TrilhaId, boolean>;
  alternar: (tipo: "mudo" | "solo", t: TrilhaId) => void;
  toast: (m: string) => void;
};

const ROTULO = 150;
const ALT: Record<TrilhaId | "regua", number> = { regua: 26, cenas: 42, legendas: 32, voz: 46, sfx: 26, trilha: 40, comentarios: 30 };
const NOMES: Record<TrilhaId, string> = { cenas: "Cenas", legendas: "Legendas", voz: "Voz", sfx: "SFX", trilha: "Trilha", comentarios: "Comentários" };
const COM_MUDO: TrilhaId[] = ["legendas", "voz", "sfx", "trilha", "comentarios"];
const COM_SOLO: TrilhaId[] = ["voz", "sfx", "trilha"];

export const Timeline: React.FC<Props> = ({ projeto, d, frame, onSeek, sel, onSelect, alterar, iniciarGesto, revisoes, mudos, solos, alternar, toast }) => {
  const corpo = useRef<HTMLDivElement>(null);
  const [pxq, setPxq] = useState(0);
  const fpb = projeto.framesPorBatida;
  const total = d.total;

  // zoom "Ajustar": cabe a duração inteira; segue a largura da janela até alguém usar Ctrl+roda
  const ajustado = useRef(true);
  const ajustar = useCallback(() => {
    if (!corpo.current) return;
    ajustado.current = true;
    setPxq(Math.max(0.05, (corpo.current.clientWidth - ROTULO - 50) / total));
  }, [total]);
  useEffect(() => {
    const el = corpo.current;
    if (!el) return;
    ajustar();
    const ro = new ResizeObserver(() => ajustado.current && ajustar());
    ro.observe(el);
    return () => ro.disconnect();
  }, [ajustar]);

  // Ctrl+roda = zoom em volta do mouse
  useEffect(() => {
    const el = corpo.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      ajustado.current = false;
      const r = el.getBoundingClientRect();
      const xTela = e.clientX - r.left - ROTULO;
      setPxq((z) => {
        const q = (el.scrollLeft + xTela) / z;
        const nz = limitar(z * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 0.05, 12);
        requestAnimationFrame(() => (el.scrollLeft = q * nz - xTela));
        return nz;
      });
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
  }, []);

  // mantém o playhead visível ao tocar
  useEffect(() => {
    const el = corpo.current;
    if (!el || !pxq) return;
    const x = frame * pxq;
    const vis0 = el.scrollLeft;
    const vis1 = el.scrollLeft + el.clientWidth - ROTULO - 30;
    if (x < vis0 || x > vis1) el.scrollLeft = Math.max(0, x - 80);
  }, [frame, pxq]);

  const larg = total * pxq + 40;
  const X = (q: number) => q * pxq;

  const urlsVoz = useMemo(() => d.frases.map((f) => `/${f.src}`), [d.frases]);
  const ondasVoz = usePicos(urlsVoz);
  const ondaTrilha = usePicos(["/audio/trilha.wav"])["/audio/trilha.wav"];

  const quadroDoMouse = (clientX: number) => {
    const el = corpo.current!;
    const r = el.getBoundingClientRect();
    return limitar(Math.round((clientX - r.left - ROTULO + el.scrollLeft) / pxq), 0, total - 1);
  };
  const reguaDown = (e: React.MouseEvent) => {
    onSeek(quadroDoMouse(e.clientX));
    const mv = (ev: MouseEvent) => onSeek(quadroDoMouse(ev.clientX));
    const up = () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
  };

  // ----- gestos -----
  const fimDaFala = (id: string) => Math.max(0, ...projeto.frases.filter((f) => f.cena === id).map((f) => f.inicio + f.dur));

  const arrastarBordaCena = (e: React.MouseEvent, id: string) => {
    const c0 = projeto.cenas.find((c) => c.id === id)!;
    const minimo = Math.max(30, fimDaFala(id) + 8);
    const maximo = c0.dur + (LIMITE_QUADROS - total);
    iniciarGesto();
    let avisou = false;
    arrastar(e, (dx, shift) => {
      const alvo = c0.dur + dx / pxq;
      let nd = encaixar(alvo, fpb, shift);
      if (nd > maximo) {
        nd = shift ? maximo : Math.floor(maximo / fpb) * fpb;
        if (!avisou) toast("Limite de 180 s (5400 quadros) — a cena não cresce mais.");
        avisou = true;
      }
      if (nd < minimo) {
        nd = minimo;
        if (!avisou) toast("A cena não pode terminar antes da fala dela.");
        avisou = true;
      }
      alterar((p) => produzir(p, (r) => {
        const c = r.cenas.find((x) => x.id === id)!;
        c.dur = nd;
        c.durTravada = true;
      }), { historico: false });
    });
  };

  const arrastarLegenda = (e: React.MouseEvent, id: string, modo: "mover" | "esq" | "dir") => {
    const l0 = projeto.legendas.find((l) => l.id === id)!;
    const durCena = projeto.cenas.find((c) => c.id === l0.cena)!.dur;
    iniciarGesto();
    onSelect({ tipo: "legenda", id });
    arrastar(e, (dx) => {
      const dq = Math.round(dx / pxq);
      alterar((p) => produzir(p, (r) => {
        const l = r.legendas.find((x) => x.id === id)!;
        l.manual = true;
        if (modo === "mover") {
          const delta = limitar(dq, -l0.de, durCena - l0.ate);
          l.de = l0.de + delta;
          l.ate = l0.ate + delta;
          l.palavras = l0.palavras.map((w) => ({ ...w, de: w.de + delta, ate: w.ate + delta }));
        } else if (modo === "esq") l.de = limitar(l0.de + dq, 0, l0.ate - 10);
        else l.ate = limitar(l0.ate + dq, l0.de + 10, durCena);
      }), { historico: false });
    });
  };

  const arrastarSfx = (e: React.MouseEvent, id: string) => {
    const s0 = projeto.sfx.find((s) => s.id === id)!;
    const abs0 = d.inicioDe[s0.cena] + s0.frame;
    iniciarGesto();
    onSelect({ tipo: "sfx", id });
    arrastar(e, (dx) => {
      const abs = limitar(abs0 + Math.round(dx / pxq), 0, total - 1);
      const c = d.cenas.find((x) => abs >= x.from && abs < x.from + x.dur) ?? d.cenas[d.cenas.length - 1];
      alterar((p) => produzir(p, (r) => {
        const s = r.sfx.find((x) => x.id === id)!;
        s.cena = c.id;
        s.frame = abs - c.from;
        s.manual = true;
      }), { historico: false });
    });
  };

  // ----- régua -----
  const passoSeg = pxq * 30 > 60 ? 1 : pxq * 30 > 25 ? 2 : pxq * 30 > 10 ? 5 : 10;
  const ticks: number[] = [];
  for (let s = 0; s * 30 <= total; s += passoSeg) ticks.push(s);
  const batidas: number[] = [];
  if (pxq * fpb >= 6) for (let q = 0; q <= total; q += fpb) batidas.push(q);

  const voz = d.frases;
  const ehSel = (tipo: string, id: string | number) => sel != null && sel.tipo === tipo && "id" in sel && sel.id === id;

  const Rotulo: React.FC<{ t: TrilhaId }> = ({ t }) => (
    <div className="tl-rotulo">
      <span className="nome">{NOMES[t]}</span>
      {COM_MUDO.includes(t) ? (
        <button className={`mini ${mudos[t] ? "ativo" : ""}`} title={t === "legendas" || t === "comentarios" ? "Ocultar" : "Mudo"} onClick={() => alternar("mudo", t)}>M</button>
      ) : null}
      {COM_SOLO.includes(t) ? (
        <button className={`mini ${solos[t] ? "ativo" : ""}`} title="Solo (só esta trilha toca)" onClick={() => alternar("solo", t)}>S</button>
      ) : null}
    </div>
  );

  // trechos com voz (ducking da trilha)
  const trechosVoz = voz.map((f) => [f.from, f.from + f.dur] as const);

  return (
    <div className="tl">
      <div className="tl-barra">
        <b>Timeline</b>
        <span>{tempo(frame)} · quadro {frame}</span>
        <span>· total {tempo(total)} ({total} q, máx. {LIMITE_QUADROS})</span>
        <span>· batida = {fpb} q</span>
        <span style={{ flex: 1 }} />
        <span>Arraste a borda direita de uma cena para mudar a duração (encaixa na batida; Shift = livre) · Ctrl+roda = zoom</span>
        <button className="mini" onClick={ajustar}>Ajustar</button>
      </div>
      <div className="tl-corpo" ref={corpo}>
        <div className="tl-conteudo" style={{ width: larg + ROTULO }}>
          {/* régua */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.regua}px` }}>
            <div className="tl-rotulo" />
            <div className="tl-faixa regua" onMouseDown={reguaDown}>
              {ticks.map((s) => (
                <div key={s} className="tick" style={{ left: X(s * 30) }}>
                  <span>{s}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* cenas */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.cenas}px` }}>
            <Rotulo t="cenas" />
            <div className="tl-faixa">
              {d.cenas.map((c) => {
                const pc = projeto.cenas.find((x) => x.id === c.id)!;
                const escuro = Object.values(pc.fundos)[0] !== "claro";
                return (
                  <div
                    key={c.id}
                    className={`bloco cena ${escuro ? "escuro" : ""} ${pc.durTravada ? "travada" : ""} ${ehSel("cena", c.id) ? "sel" : ""}`}
                    style={{ left: X(c.from), width: Math.max(2, X(c.dur) - 1) }}
                    title={`${c.nome} · ${(c.dur / 30).toFixed(1)} s (${c.dur} q)${pc.durTravada ? " · duração ajustada à mão" : ""}`}
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      onSelect({ tipo: "cena", id: c.id });
                      onSeek(c.from);
                    }}
                  >
                    <b>{c.id.toUpperCase()}</b> {c.nome} · {(c.dur / 30).toFixed(1)} s
                    <div className="alca dir" title="Arraste para mudar a duração" onMouseDown={(e) => arrastarBordaCena(e, c.id)} />
                  </div>
                );
              })}
              {batidas.map((q) => <div key={q} className="batida" style={{ left: X(q) }} />)}
            </div>
          </div>

          {/* legendas */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.legendas}px`, opacity: mudos.legendas ? 0.4 : 1 }}>
            <Rotulo t="legendas" />
            <div className="tl-faixa">
              {d.legendas.map((l) => {
                const pl = projeto.legendas.find((x) => x.id === l.id)!;
                return (
                  <div
                    key={l.id}
                    className={`bloco legenda ${pl.manual ? "manual" : ""} ${ehSel("legenda", l.id) ? "sel" : ""}`}
                    style={{ left: X(l.from), width: Math.max(2, X(l.to - l.from) - 1) }}
                    title={l.palavras.map((w) => w.w).join(" ")}
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      onSeek(l.from);
                      arrastarLegenda(e, l.id, "mover");
                    }}
                  >
                    <div className="alca esq" onMouseDown={(e) => arrastarLegenda(e, l.id, "esq")} />
                    {l.palavras.map((w) => w.w).join(" ")}
                    <div className="alca dir" onMouseDown={(e) => arrastarLegenda(e, l.id, "dir")} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* voz */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.voz}px`, opacity: mudos.voz ? 0.4 : 1 }}>
            <Rotulo t="voz" />
            <div className="tl-faixa">
              {voz.map((f) => {
                const p = ondasVoz[`/${f.src}`];
                const w = X(f.dur);
                return (
                  <div
                    key={f.id}
                    className={`bloco voz ${ehSel("frase", f.id) ? "sel" : ""}`}
                    style={{ left: X(f.from), width: Math.max(2, w - 1) }}
                    title={`${f.id}: ${f.texto}`}
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      onSelect({ tipo: "frase", id: f.id });
                      onSeek(f.from);
                    }}
                  >
                    {p ? (
                      <svg className="onda" width={w} height={ALT.voz - 8}>
                        <path d={caminhoOnda(p, pxq, ALT.voz - 8, 1.6)} fill="#5fb3e6" opacity={0.85} />
                      </svg>
                    ) : null}
                    <span>{f.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* sfx */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.sfx}px`, opacity: mudos.sfx ? 0.4 : 1 }}>
            <Rotulo t="sfx" />
            <div className="tl-faixa">
              {d.sfx.map((s) => {
                const ps = projeto.sfx.find((x) => x.id === s.id)!;
                return (
                  <div
                    key={s.id}
                    className={`sfx ${ps.manual ? "manual" : ""} ${ehSel("sfx", s.id) ? "sel" : ""}`}
                    style={{ left: X(s.f) }}
                    title={`${s.som} · ${s.ganhoDb} dB · ${tempo(s.f)}`}
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      arrastarSfx(e, s.id);
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* trilha */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.trilha}px`, opacity: mudos.trilha ? 0.4 : 1 }}>
            <Rotulo t="trilha" />
            <div className="tl-faixa" onMouseDown={() => onSelect({ tipo: "audio" })} style={{ cursor: "pointer" }} title="Trilha — clique para ajustar ganho e ducking">
              {trechosVoz.map(([a, b], i) => <div key={i} className="duck" style={{ left: X(a), width: X(b - a) }} />)}
              {ondaTrilha ? (
                <svg className="onda" width={X(total)} height={ALT.trilha - 4} style={{ top: 2 }}>
                  <path d={caminhoOnda(ondaTrilha.subarray(0, total), pxq, ALT.trilha - 4, 1.4)} fill="#7fd1c5" opacity={0.6} />
                </svg>
              ) : null}
            </div>
          </div>

          {/* comentários */}
          <div className="tl-trilha" style={{ ["--h" as string]: `${ALT.comentarios}px` }}>
            <Rotulo t="comentarios" />
            <div className="tl-faixa">
              {mudos.comentarios
                ? null
                : revisoes.map((r) => (
                    <div
                      key={r.id}
                      className={`pin-tl ${r.status === "feito" ? "feito" : ""}`}
                      style={{ left: X(r.frame) }}
                      title={`#${r.id} · ${r.categoria} · ${r.texto}`}
                      onMouseDown={() => {
                        onSelect({ tipo: "pin", id: r.id });
                        onSeek(r.frame);
                      }}
                    >
                      <span>{r.id}</span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="playhead" style={{ left: ROTULO + X(frame) }} />
        </div>
      </div>
    </div>
  );
};
