// Estúdio de Revisão — editor local do pitch (PROMPT_V3 §Fase 2).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  Play, Pause, SkipBack, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Volume2, VolumeX, Repeat, Grid3x3,
  MessageSquarePlus, Undo2, Redo2, Save, Film, FolderOpen, RefreshCw, Settings2,
} from "lucide-react";
import { PitchHerancaDigital } from "../src/PitchHerancaDigital";
import { derivado } from "../src/data/projeto";
import { useProjeto } from "./store";
import { Timeline } from "./Timeline";
import { Inspector } from "./Inspector";
import { DialogoPin, PainelRevisoes, type NovoPin } from "./Revisoes";
import { placeholders, tempo, type Revisao, type Selecao, type TrilhaId } from "./util";

type Job = { tipo: string; status: "rodando" | "ok" | "erro"; progresso: number; etapa: string; saida: string; segundos: number; log: string };
const SEM_TRILHAS: Record<TrilhaId, boolean> = { cenas: false, legendas: false, voz: false, sfx: false, trilha: false, comentarios: false };

export const App: React.FC = () => {
  const store = useProjeto();
  const { projeto } = store;
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [sel, setSel] = useState<Selecao | null>(null);
  const [aba, setAba] = useState<"inspetor" | "revisoes">("inspetor");
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [mudos, setMudos] = useState(SEM_TRILHAS);
  const [solos, setSolos] = useState(SEM_TRILHAS);
  const [velocidade, setVelocidade] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [mudo, setMudo] = useState(false);
  const [loopCena, setLoopCena] = useState(false);
  const [grade, setGrade] = useState(false);
  const [pin, setPin] = useState<{ frame: number; pos: { x: number; y: number } | null } | null>(null);
  const [salvandoPin, setSalvandoPin] = useState(false);
  const [msg, setMsg] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});

  const toast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout((toast as unknown as { t?: number }).t);
    (toast as unknown as { t?: number }).t = window.setTimeout(() => setMsg(""), 3500);
  }, []);

  const d = useMemo(() => (projeto ? derivado(projeto) : null), [projeto]);
  const cenaAtual = d ? d.cenas.find((c) => frame >= c.from && frame < c.from + c.dur) ?? d.cenas[d.cenas.length - 1] : null;

  // ---------- revisões ----------
  const carregarRevisoes = useCallback(() => fetch("/api/revisoes").then((r) => r.json()).then(setRevisoes).catch(() => undefined), []);
  useEffect(() => {
    void carregarRevisoes();
    const t = setInterval(carregarRevisoes, 8000); // o Claude Code pode marcar como "feito" por fora
    return () => clearInterval(t);
  }, [carregarRevisoes]);
  const atualizarRevisao = useCallback(async (id: number, mud: Partial<Revisao>) => {
    setRevisoes((l) => l.map((r) => (r.id === id ? { ...r, ...mud } : r)));
    await fetch(`/api/revisoes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mud) });
  }, []);
  const apagarRevisao = useCallback(async (id: number) => {
    if (!window.confirm(`Apagar a revisão #${id}?`)) return;
    setRevisoes((l) => l.filter((r) => r.id !== id));
    setSel(null);
    await fetch(`/api/revisoes/${id}`, { method: "DELETE" });
  }, []);

  // ---------- player ----------
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const fu = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const pl = () => setTocando(true);
    const pa = () => setTocando(false);
    p.addEventListener("frameupdate", fu);
    p.addEventListener("seeked", fu);
    p.addEventListener("play", pl);
    p.addEventListener("pause", pa);
    return () => {
      p.removeEventListener("frameupdate", fu);
      p.removeEventListener("seeked", fu);
      p.removeEventListener("play", pl);
      p.removeEventListener("pause", pa);
    };
  }, [d != null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => player.current?.setVolume(volume), [volume, d != null]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => (mudo ? player.current?.mute() : player.current?.unmute()), [mudo]);

  const total = d?.total ?? 1;
  const ir = useCallback((f: number) => {
    const q = Math.max(0, Math.min(total - 1, Math.round(f)));
    player.current?.seekTo(q);
    setFrame(q);
  }, [total]);

  // trilhas em mudo/solo → só no preview (não altera o projeto salvo)
  const props = useMemo(() => {
    if (!projeto) return null;
    const algumSolo = solos.voz || solos.sfx || solos.trilha;
    const ouve = (t: TrilhaId) => (algumSolo ? solos[t] : !mudos[t]);
    const a = projeto.audio;
    return {
      ...projeto,
      audio: {
        voz: { ...a.voz, ativo: a.voz.ativo && ouve("voz") },
        trilha: { ...a.trilha, ativo: a.trilha.ativo && ouve("trilha") },
        sfx: { ...a.sfx, ativo: a.sfx.ativo && ouve("sfx") },
      },
      semLegendas: mudos.legendas,
    };
  }, [projeto, mudos, solos]);

  const alternar = useCallback((tipo: "mudo" | "solo", t: TrilhaId) => {
    (tipo === "mudo" ? setMudos : setSolos)((m) => ({ ...m, [t]: !m[t] }));
  }, []);

  // ---------- pins ----------
  const abrirPin = useCallback(() => {
    player.current?.pause();
    setPin({ frame: player.current?.getCurrentFrame() ?? frame, pos: null });
  }, [frame]);
  const salvarPin = async (p: NovoPin) => {
    if (!pin || !projeto || !d) return;
    setSalvandoPin(true);
    const c = d.cenas.find((x) => pin.frame >= x.from && pin.frame < x.from + x.dur) ?? d.cenas[0];
    try {
      const r = await fetch("/api/revisoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: { frame: pin.frame, tempo: tempo(pin.frame), cena: c.id, cenaNome: `Cena ${c.id.slice(1)} · ${c.nome}`, x: pin.pos?.x ?? null, y: pin.pos?.y ?? null, ...p },
          projeto,
        }),
      });
      const novo: Revisao = await r.json();
      setRevisoes((l) => [...l, novo]);
      setSel({ tipo: "pin", id: novo.id });
      toast(novo.still ? `Pin #${novo.id} salvo com o still do quadro ${novo.frame}.` : `Pin #${novo.id} salvo (sem still).`);
      setPin(null);
    } catch (e) {
      toast(`Erro ao salvar o pin: ${String(e)}`);
    } finally {
      setSalvandoPin(false);
    }
  };

  // ---------- render ----------
  useEffect(() => {
    if (job?.status !== "rodando") return;
    const t = setInterval(async () => {
      const j = await fetch("/api/render").then((r) => r.json());
      setJob(j);
      if (j?.status === "ok") toast(`Render pronto: ${j.saida}`);
      if (j?.status === "erro") toast("O render falhou — veja o terminal.");
    }, 1000);
    return () => clearInterval(t);
  }, [job?.status, toast]);
  const renderizar = async (tipo: "rascunho" | "final") => {
    if (!projeto) return;
    if (store.erros.length) return toast("Corrija os erros em vermelho antes de renderizar.");
    if (tipo === "final") {
      const ph = placeholders(projeto).length;
      if (ph && !window.confirm(`Ainda há ${ph} campo(s) [PREENCHER] (aparecem em amarelo). Renderizar o final mesmo assim?`)) return;
    }
    const r = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo, projeto }) });
    if (!r.ok) return toast((await r.json()).erro ?? "não deu para iniciar o render");
    setJob({ tipo, status: "rodando", progresso: 0, etapa: "preparando", saida: "", segundos: 0, log: "" });
  };

  // ---------- miniaturas das cenas ----------
  const carregarMiniaturas = useCallback(async () => {
    if (!projeto || !d) return;
    setMiniaturas({});
    for (const c of d.cenas) {
      try {
        const r = await fetch("/api/still", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ frame: c.from + Math.round(c.dur * 0.6), projeto, escala: 0.2 }) });
        if (!r.ok) continue;
        const url = URL.createObjectURL(await r.blob());
        setMiniaturas((m) => ({ ...m, [c.id]: url }));
      } catch {
        /* sem miniatura */
      }
    }
  }, [projeto, d]);
  const jaCarregou = useRef(false);
  useEffect(() => {
    if (projeto && !jaCarregou.current) {
      jaCarregou.current = true;
      void carregarMiniaturas();
    }
  }, [projeto, carregarMiniaturas]);

  // ---------- atalhos ----------
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) {
        if (e.key === "Escape") alvo.blur();
        if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s")) return;
      }
      const p = player.current;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "s") {
        e.preventDefault();
        void store.salvar().then((ok) => toast(ok ? "Salvo em project.json" : "Não salvei — há erros de validação."));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (k === "y" || (k === "z" && e.shiftKey))) {
        e.preventDefault();
        store.refazer();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && k === "z") {
        e.preventDefault();
        store.desfazer();
        return;
      }
      if (pin) {
        if (e.key === "Escape") setPin(null);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        p?.toggle();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        p?.pause();
        ir((p?.getCurrentFrame() ?? frame) - (e.shiftKey ? 30 : 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        p?.pause();
        ir((p?.getCurrentFrame() ?? frame) + (e.shiftKey ? 30 : 1));
      } else if (k === "j") ir((p?.getCurrentFrame() ?? frame) - 30);
      else if (k === "k") p?.pause();
      else if (k === "l") {
        if (p?.isPlaying()) setVelocidade((v) => Math.min(2, v + 0.5));
        else p?.play();
      } else if (k === "c") {
        e.preventDefault();
        abrirPin();
      } else if (k === "m") setMudo((m) => !m);
      else if (k === "s") toast("“Dividir cena” não se aplica: cada cena é uma animação própria. Para mudar a estrutura, deixe um pin (C) e peça ao Claude.");
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [store, pin, frame, ir, abrirPin, toast]);

  // aviso ao fechar com mudanças não salvas
  useEffect(() => {
    const antes = (e: BeforeUnloadEvent) => {
      if (store.status === "pendente" || store.status === "salvando" || store.status === "invalido") e.preventDefault();
    };
    window.addEventListener("beforeunload", antes);
    return () => window.removeEventListener("beforeunload", antes);
  }, [store.status]);

  if (!projeto || !d || !props) {
    return <div style={{ padding: 40 }}>{store.status === "erro" ? `Erro ao carregar o projeto: ${store.msg}` : "Carregando o projeto…"}</div>;
  }

  const ph = placeholders(projeto);
  const abertas = revisoes.filter((r) => r.status !== "feito").length;
  const statusTxt = { carregando: "carregando…", salvo: "✓ salvo", pendente: "● alterações…", salvando: "salvando…", erro: "erro ao salvar", invalido: "✗ não salvo (erros)" }[store.status];
  const statusCls = store.status === "salvo" ? "ok" : store.status === "erro" || store.status === "invalido" ? "erro" : "pend";
  const selecionar = (s: Selecao) => {
    setSel(s);
    setAba("inspetor");
  };
  const pinsVisiveis = mudos.comentarios ? [] : revisoes.filter((r) => r.x != null && Math.abs(r.frame - frame) <= 20);

  return (
    <div className="app">
      <header className="topo">
        <div className="titulo">Estúdio de Revisão · <span>{projeto.equipe.marca}</span></div>
        <span className={`selo ${statusCls}`} title={store.msg}>{statusTxt}</span>
        {store.erros.length ? (
          <span className="selo erro" title={store.erros.map((e) => `${e.caminho}: ${e.msg}`).join("\n")} onClick={() => toast(store.erros[0].msg)} style={{ cursor: "pointer" }}>
            {store.erros.length} erro(s) — {store.erros[0].msg}
          </span>
        ) : null}
        {ph.length ? (
          <span className="selo aviso" title={ph.map((x) => `${x.valor} (${x.onde})`).join("\n")} onClick={() => selecionar({ tipo: "projeto" })}>⚠ {ph.length} campos [PREENCHER]</span>
        ) : null}
        <button disabled={!store.podeDesfazer} onClick={store.desfazer} title="Desfazer (Ctrl+Z)"><Undo2 size={15} /></button>
        <button disabled={!store.podeRefazer} onClick={store.refazer} title="Refazer (Ctrl+Shift+Z)"><Redo2 size={15} /></button>
        <button onClick={() => void store.salvar()} title="Salvar (Ctrl+S)"><Save size={15} /> Salvar</button>
        <span className="espaco" />
        {job ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }} title={job.log}>
            <span style={{ color: "var(--txt2)" }}>{job.tipo === "final" ? "Final" : "Rascunho"}: {job.status === "rodando" ? `${job.etapa} · ${Math.round(job.progresso * 100)}%` : job.status === "ok" ? "pronto ✓" : "erro ✗"}</span>
            <span className="progresso"><div style={{ width: `${job.progresso * 100}%` }} /></span>
          </span>
        ) : null}
        <button disabled={job?.status === "rodando"} onClick={() => void renderizar("rascunho")} title="Rápido, 960×540, com tudo o que está no editor (mesmo sem salvar)"><Film size={15} /> Rascunho 540p</button>
        <button className="primario" disabled={job?.status === "rodando"} onClick={() => void renderizar("final")} title="1080p com loudnorm (salva o projeto antes). ~15–20 min."><Film size={15} /> Final 1080p</button>
        <button onClick={() => void fetch("/api/abrir-out", { method: "POST" })} title="Abrir a pasta out/"><FolderOpen size={15} /> out/</button>
      </header>

      <aside className="cenas">
        <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Cenas <button className="mini" title="Atualizar miniaturas" onClick={() => void carregarMiniaturas()}><RefreshCw size={11} /></button>
        </h3>
        {d.cenas.map((c) => (
          <button
            key={c.id}
            className={`cena-item ${cenaAtual?.id === c.id ? "atual" : ""} ${sel?.tipo === "cena" && sel.id === c.id ? "sel" : ""}`}
            onClick={() => {
              ir(c.from);
              selecionar({ tipo: "cena", id: c.id });
            }}
          >
            <div className="mini" style={{ backgroundImage: miniaturas[c.id] ? `url(${miniaturas[c.id]})` : undefined }}>
              {miniaturas[c.id] ? null : <div className="carregando">gerando miniatura…</div>}
            </div>
            <div className="nome">{c.id.toUpperCase()} · {c.nome}</div>
            <div className="info">{tempo(c.from)} · {(c.dur / 30).toFixed(1)} s{revisoes.some((r) => r.cena === c.id && r.status !== "feito") ? ` · ${revisoes.filter((r) => r.cena === c.id && r.status !== "feito").length} revisão(ões)` : ""}</div>
          </button>
        ))}
        <button className="cena-item" onClick={() => selecionar({ tipo: "projeto" })}><Settings2 size={14} /> <b>Projeto</b> <span className="info">equipe, marca, cores</span></button>
        <button className="cena-item" onClick={() => selecionar({ tipo: "audio" })}><Volume2 size={14} /> <b>Áudio</b> <span className="info">voz, trilha, efeitos</span></button>
      </aside>

      <main className="centro">
        <div className="palco">
          <div className="tela16x9" style={{ maxWidth: "calc((100vh - 50px - var(--h-timeline, 300px) - 80px) * 16 / 9)" }}>
            <Player
              ref={player}
              className="player"
              component={PitchHerancaDigital}
              inputProps={props}
              durationInFrames={total}
              fps={30}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{ width: "100%", height: "100%" }}
              controls={false}
              clickToPlay={false}
              spaceKeyToPlayOrPause={false}
              playbackRate={velocidade}
              loop={loopCena}
              inFrame={loopCena && cenaAtual ? cenaAtual.from : undefined}
              outFrame={loopCena && cenaAtual ? cenaAtual.from + cenaAtual.dur - 1 : undefined}
              numberOfSharedAudioTags={16}
              acknowledgeRemotionLicense
            />
            <div
              className={`sobre ${pin ? "capturando" : ""}`}
              onClick={(e) => {
                if (!pin) return;
                const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setPin({ ...pin, pos: { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } });
              }}
            >
              {grade ? <div className="margem80" /> : null}
              {pinsVisiveis.map((r) => (
                <div key={r.id} className={`pin-video ${r.status === "feito" ? "feito" : ""}`} style={{ left: `${r.x! * 100}%`, top: `${r.y! * 100}%` }} title={r.texto} onClick={() => selecionar({ tipo: "pin", id: r.id })}>
                  {r.id}
                </div>
              ))}
              {pin?.pos ? <div className="pin-video" style={{ left: `${pin.pos.x * 100}%`, top: `${pin.pos.y * 100}%` }}>+</div> : null}
            </div>
          </div>
        </div>
        <div className="controles">
          <button onClick={() => ir(0)} title="Início"><SkipBack size={15} /></button>
          <button onClick={() => ir(frame - 30)} title="−1 s (Shift+←)"><ChevronsLeft size={15} /></button>
          <button onClick={() => ir(frame - 1)} title="−1 quadro (←)"><ChevronLeft size={15} /></button>
          <button className="primario" onClick={() => player.current?.toggle()} title="Play/pausa (Espaço)">{tocando ? <Pause size={16} /> : <Play size={16} />}</button>
          <button onClick={() => ir(frame + 1)} title="+1 quadro (→)"><ChevronRight size={15} /></button>
          <button onClick={() => ir(frame + 30)} title="+1 s (Shift+→)"><ChevronsRight size={15} /></button>
          <span className="tempo">{tempo(frame)} <small>/ {tempo(total)}</small> · quadro {frame} <small>· {cenaAtual?.id.toUpperCase()} {cenaAtual?.nome}</small></span>
          <button onClick={() => setMudo((m) => !m)} title="Mudo (M)">{mudo ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: 90 }} title="Volume" />
          <button className={loopCena ? "ativo" : ""} onClick={() => setLoopCena((l) => !l)} title="Repetir a cena atual"><Repeat size={15} /> cena</button>
          <select value={velocidade} onChange={(e) => setVelocidade(Number(e.target.value))} style={{ width: 80 }} title="Velocidade">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => <option key={v} value={v}>{v}×</option>)}
          </select>
          <button className={grade ? "ativo" : ""} onClick={() => setGrade((g) => !g)} title="Margem de segurança (80 px)"><Grid3x3 size={15} /></button>
          <span style={{ flex: 1 }} />
          <button className="primario" onClick={abrirPin} title="Comentar este quadro (C)"><MessageSquarePlus size={15} /> Comentar (C)</button>
        </div>
      </main>

      <aside className="lado">
        <div className="abas">
          <button className={aba === "inspetor" ? "ativo" : ""} onClick={() => setAba("inspetor")}>Inspetor</button>
          <button className={aba === "revisoes" ? "ativo" : ""} onClick={() => setAba("revisoes")}>Revisões {abertas ? `(${abertas})` : ""}</button>
        </div>
        {aba === "inspetor" ? (
          <Inspector
            projeto={projeto} d={d} sel={sel} frame={frame} onSeek={ir} onSelect={selecionar} alterar={store.alterar}
            erros={store.erros} revisoes={revisoes} atualizarRevisao={atualizarRevisao} apagarRevisao={apagarRevisao}
          />
        ) : (
          <PainelRevisoes
            lista={revisoes} cenas={d.cenas} toast={toast}
            onIr={(r) => { ir(r.frame); setSel({ tipo: "pin", id: r.id }); }}
            onStatus={(id, status) => void atualizarRevisao(id, { status })}
            onApagar={(id) => void apagarRevisao(id)}
          />
        )}
      </aside>

      <Timeline
        projeto={projeto} d={d} frame={frame} onSeek={ir} sel={sel} onSelect={selecionar}
        alterar={store.alterar} iniciarGesto={store.iniciarGesto} revisoes={revisoes}
        mudos={mudos} solos={solos} alternar={alternar} toast={toast}
      />

      {pin && cenaAtual ? (
        <DialogoPin
          tempo={tempo(pin.frame)} frame={pin.frame} pos={pin.pos} salvando={salvandoPin}
          cenaNome={`${(d.cenas.find((x) => pin.frame >= x.from && pin.frame < x.from + x.dur) ?? cenaAtual).id.toUpperCase()} · ${(d.cenas.find((x) => pin.frame >= x.from && pin.frame < x.from + x.dur) ?? cenaAtual).nome}`}
          onSalvar={(p) => void salvarPin(p)} onCancelar={() => setPin(null)}
        />
      ) : null}
      {msg ? <div className="toast">{msg}</div> : null}
    </div>
  );
};
