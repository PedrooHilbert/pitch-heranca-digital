// Inspetor: edita o que estiver selecionado. Toda mudança atualiza o preview na hora e é salva
// (automaticamente) no project.json. Movimento/estrutura das animações NÃO são editáveis aqui.
import React, { useState } from "react";
import { Play, Trash2, Plus, Crosshair, Lock, Unlock } from "lucide-react";
import regions from "../src/data/regions";
import { NOMES_TELAS, SONS, LIMITE_QUADROS, type Projeto } from "../src/data/schema";
import type { Derivado } from "../src/data/projeto";
import { produzir, type ErroValidacao } from "./store";
import { CATEGORIAS, GRAVIDADES, TEMAS_FUNDO, encaixar, limitar, redistribuir, tempo, type Revisao, type Selecao } from "./util";

type Props = {
  projeto: Projeto;
  d: Derivado;
  sel: Selecao | null;
  frame: number;
  onSeek: (f: number) => void;
  onSelect: (s: Selecao) => void;
  alterar: (fn: (p: Projeto) => Projeto, o?: { historico?: boolean }) => void;
  erros: ErroValidacao[];
  revisoes: Revisao[];
  atualizarRevisao: (id: number, mud: Partial<Revisao>) => void;
  apagarRevisao: (id: number) => void;
};

const BRAND = ["#0B3F3D", "#07302F", "#0E5A57", "#14706B", "#2FA79A", "#7FD1C5", "#CFE3DF", "#E2F0ED", "#F3F6F4", "#13211F", "#B45309", "#F5C86B", "#15803D", "#1E4E6B", "#B42318", "#FFFFFF"];
const ROTULOS_TEMA: Record<string, string> = {
  teal900: "Verde-petróleo escuro", teal800: "Fundo escuro (gradiente)", teal700: "Cor principal", teal600: "Ativo / hover", teal400: "Destaques / gráficos",
  mint: "Menta (destaque no escuro)", mintSoft: "Texto claro no escuro", mintSoft2: "Texto claro 2", tealTint: "Fundo de ícones claros",
  bg: "Fundo claro", bg2: "Fundo claro 2", card: "Cards", cardBorder: "Borda dos cards", ink: "Texto principal", ink2: "Texto secundário", ink3: "Texto terciário",
  amber: "Âmbar (alerta)", amberBg: "Fundo âmbar", amberBorder: "Borda âmbar / placeholder", green: "Verde (ok)", greenBg: "Fundo verde",
  blue: "Azul (patrimonial)", blueBg: "Fundo azul", red: "Vermelho", white: "Branco",
};

const tocar = (som: string, ganhoDb: number) => {
  const a = new Audio(`/audio/sfx/${som}.wav`);
  a.volume = Math.min(1, Math.pow(10, ganhoDb / 20) * 4);
  void a.play();
};

const ErrosDe: React.FC<{ erros: ErroValidacao[]; prefixo: string }> = ({ erros, prefixo }) => {
  const meus = erros.filter((e) => e.caminho.startsWith(prefixo) || e.caminho === "cenas");
  if (!meus.length) return null;
  return <div className="erro-campo">{meus.map((e) => <div key={e.caminho + e.msg}>⚠ {e.msg}</div>)}</div>;
};

const AvisoAnimacao = () => (
  <div className="aviso-animacao">
    🎬 <b>Animação e estrutura não se editam aqui.</b> Para mudar movimento, ordem ou efeito visual, aperte <b>C</b> no quadro e deixe um pin
    com o que você quer — depois diga ao Claude Code “resolva as revisões abertas”.
  </div>
);

/** Pré-visualização da tela do protótipo com os blocos (regiões) clicáveis. */
const Recorte: React.FC<{ tela: string; ativas: number[]; mudar: (r: number[]) => void }> = ({ tela, ativas, mudar }) => {
  const info = regions[`${tela}.png`];
  if (!info) return <div className="erro-campo">Tela “{tela}” não existe em public/screens/.</div>;
  const [w, h] = info.logical_size;
  return (
    <div style={{ maxHeight: 340, overflow: "auto", marginTop: 6 }}>
      <div className="recorte">
        <img src={`/screens/${tela}.png`} alt={tela} />
        {info.regions.map((g, i) => {
          const on = ativas.includes(i);
          return (
            <div
              key={i}
              className={`reg ${on ? "" : "off"}`}
              style={{ left: `${(g.x / w) * 100}%`, top: `${(g.y / h) * 100}%`, width: `${(g.w / w) * 100}%`, height: `${(g.h / h) * 100}%` }}
              title={`${i}: ${g.label}`}
              onClick={() => mudar(on ? ativas.filter((x) => x !== i) : [...ativas, i])}
            >
              <span>{on ? `${ativas.indexOf(i) + 1}º · ${i}` : i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Inspector: React.FC<Props> = (props) => {
  const { projeto, d, sel, frame, onSeek, onSelect, alterar, erros, revisoes, atualizarRevisao, apagarRevisao } = props;
  const [abertos, setAbertos] = useState<Record<string, boolean>>({ textos: true });

  const novoSfx = () => {
    const c = d.cenas.find((x) => frame >= x.from && frame < x.from + x.dur) ?? d.cenas[0];
    const id = `m${Date.now().toString(36)}`;
    alterar((p) => produzir(p, (r) => {
      r.sfx.push({ id, cena: c.id, frame: frame - c.from, som: "pop", ganhoDb: -17, manual: true });
    }));
    onSelect({ tipo: "sfx", id });
  };

  if (!sel) {
    return (
      <div className="painel">
        <h2>Nada selecionado</h2>
        <div className="sub">Clique numa cena (lista à esquerda ou timeline), numa legenda, num efeito (◆) ou num pin. Para dados do grupo, cores e áudio: <b>Projeto</b>.</div>
        <button onClick={() => onSelect({ tipo: "projeto" })}>Abrir Projeto (equipe, cores)</button>
        <AvisoAnimacao />
      </div>
    );
  }

  // ---------- cena ----------
  if (sel.tipo === "cena") {
    const ci = projeto.cenas.findIndex((c) => c.id === sel.id);
    const c = projeto.cenas[ci];
    const dc = d.cenas[ci];
    const fimFala = Math.max(0, ...projeto.frases.filter((f) => f.cena === c.id).map((f) => f.inicio + f.dur));
    const maxDur = c.dur + (LIMITE_QUADROS - d.total);
    const mudarCena = (fn: (cc: Projeto["cenas"][number]) => void) => alterar((p) => produzir(p, (r) => fn(r.cenas[ci])));
    return (
      <div className="painel">
        <h2>{c.id.toUpperCase()} · {c.nome}</h2>
        <div className="sub">
          {tempo(dc.from)} → {tempo(dc.from + dc.dur)} · <a href="#" onClick={(e) => { e.preventDefault(); onSeek(dc.from); }}>ir para o início</a>
        </div>
        <label>Nome</label>
        <input value={c.nome} onChange={(e) => mudarCena((cc) => { cc.nome = e.target.value; })} />
        <label>Duração (segundos) — encaixa na batida de {projeto.framesPorBatida} q</label>
        <div className="linha">
          <input
            type="number" step={projeto.framesPorBatida / 30} min={Math.ceil(((fimFala + 8) / 30) * 10) / 10} max={maxDur / 30}
            value={(c.dur / 30).toFixed(2)}
            onChange={(e) => {
              const q = limitar(encaixar(Number(e.target.value) * 30, projeto.framesPorBatida), Math.max(30, fimFala + 8), maxDur);
              mudarCena((cc) => { cc.dur = q; cc.durTravada = true; });
            }}
          />
          <span style={{ flex: "0 0 auto", color: "var(--txt3)" }}>{c.dur} q</span>
          <button title={c.durTravada ? "Duração ajustada à mão (o npm run sync mantém). Clique para voltar à automática no próximo sync." : "Duração automática (segue a voz)"} onClick={() => mudarCena((cc) => { if (cc.durTravada) delete cc.durTravada; else cc.durTravada = true; })} style={{ flex: "0 0 auto" }}>
            {c.durTravada ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        </div>
        <div className="sub">Mínimo {((fimFala + 8) / 30).toFixed(1)} s (a fala da cena termina em {(fimFala / 30).toFixed(1)} s) · máximo {(maxDur / 30).toFixed(1)} s (teto de 180 s).</div>
        <ErrosDe erros={erros} prefixo={`cenas.${ci}`} />

        <details className="grupo" open={abertos.textos} onToggle={(e) => setAbertos((a) => ({ ...a, textos: (e.target as HTMLDetailsElement).open }))}>
          <summary>Textos na tela ({Object.keys(c.textos).length})</summary>
          <div className="sub">Use <code>*palavra*</code> para o destaque (caixa menta). Texto com [colchetes] fica amarelo (placeholder).</div>
          {Object.entries(c.textos).map(([k, v]) => (
            <div key={k}>
              <label>{k}</label>
              <textarea rows={v.length > 60 ? 3 : 1} value={v} onChange={(e) => mudarCena((cc) => { cc.textos[k] = e.target.value; })} style={{ borderColor: v.trim() ? undefined : "var(--vermelho)" }} />
              {!v.trim() ? <div className="erro-campo">⚠ texto vazio</div> : null}
            </div>
          ))}
        </details>

        {Object.keys(c.fundos).length ? (
          <details className="grupo">
            <summary>Fundos ({Object.keys(c.fundos).length})</summary>
            {Object.entries(c.fundos).map(([k, v]) => (
              <div key={k} className="linha" style={{ marginTop: 6 }}>
                <span>{k}</span>
                <select value={v} onChange={(e) => mudarCena((cc) => { cc.fundos[k] = e.target.value as (typeof TEMAS_FUNDO)[number]; })}>
                  {TEMAS_FUNDO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </details>
        ) : null}

        {Object.keys(c.telas).length ? (
          <details className="grupo">
            <summary>Telas do protótipo ({Object.keys(c.telas).length})</summary>
            <div className="sub">Clique nos blocos para incluir/tirar do recorte. A ordem (1º, 2º…) é a ordem em que eles se montam na tela.</div>
            {Object.entries(c.telas).map(([k, t]) => (
              <div key={k} style={{ marginTop: 10 }}>
                <label>{k}</label>
                <select value={t.tela} onChange={(e) => mudarCena((cc) => { cc.telas[k] = { tela: e.target.value, regioes: [0] }; })}>
                  {NOMES_TELAS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <Recorte tela={t.tela} ativas={t.regioes} mudar={(rr) => mudarCena((cc) => { cc.telas[k] = { tela: t.tela, regioes: rr }; })} />
              </div>
            ))}
          </details>
        ) : null}
        <AvisoAnimacao />
      </div>
    );
  }

  // ---------- legenda ----------
  if (sel.tipo === "legenda") {
    const li = projeto.legendas.findIndex((l) => l.id === sel.id);
    if (li < 0) return <div className="painel">Legenda não encontrada.</div>;
    const l = projeto.legendas[li];
    const ini = d.inicioDe[l.cena];
    const texto = l.palavras.map((w) => w.w).join(" ");
    const mudar = (fn: (ll: Projeto["legendas"][number]) => void) => alterar((p) => produzir(p, (r) => { fn(r.legendas[li]); r.legendas[li].manual = true; }));
    return (
      <div className="painel">
        <h2>Legenda {l.id}</h2>
        <div className="sub">Fala {l.fraseId} · {tempo(ini + l.de)} → {tempo(ini + l.ate)} {l.manual ? "· editada à mão (o sync mantém)" : ""}</div>
        <label>Texto</label>
        <textarea rows={3} value={texto} onChange={(e) => mudar((ll) => { ll.palavras = redistribuir(e.target.value, ll.palavras[0]?.de ?? ll.de, ll.palavras[ll.palavras.length - 1]?.ate ?? ll.ate); })} />
        <div className="sub">Ao mudar o texto, as palavras se redistribuem no tempo da fala. O áudio não muda.</div>
        <div className="linha">
          <div><label>Aparece (q)</label><input type="number" value={l.de} onChange={(e) => mudar((ll) => { ll.de = Math.min(Number(e.target.value), ll.ate - 10); })} /></div>
          <div><label>Some (q)</label><input type="number" value={l.ate} onChange={(e) => mudar((ll) => { ll.ate = Math.max(Number(e.target.value), ll.de + 10); })} /></div>
        </div>
        <ErrosDe erros={erros} prefixo={`legendas.${li}`} />
        <div style={{ marginTop: 10 }}><button onClick={() => onSeek(ini + l.de)}>Ir para a legenda</button></div>
      </div>
    );
  }

  // ---------- efeito sonoro ----------
  if (sel.tipo === "sfx") {
    const si = projeto.sfx.findIndex((s) => s.id === sel.id);
    if (si < 0) return <div className="painel">Efeito não encontrado.</div>;
    const s = projeto.sfx[si];
    const abs = d.inicioDe[s.cena] + s.frame;
    const mudar = (fn: (ss: Projeto["sfx"][number]) => void) => alterar((p) => produzir(p, (r) => { fn(r.sfx[si]); r.sfx[si].manual = true; }));
    return (
      <div className="painel">
        <h2>Efeito sonoro {s.id}</h2>
        <div className="sub">{tempo(abs)} (quadro {abs}) · cena {s.cena.toUpperCase()} {s.manual ? "· editado à mão (o sync mantém)" : "· gerado pela animação"}</div>
        <label>Som</label>
        <div className="linha">
          <select value={s.som} onChange={(e) => mudar((ss) => { ss.som = e.target.value as (typeof SONS)[number]; })}>
            {SONS.map((n) => <option key={n}>{n}</option>)}
          </select>
          <button style={{ flex: "0 0 auto" }} onClick={() => tocar(s.som, s.ganhoDb)}><Play size={14} /> ouvir</button>
        </div>
        <label>Ganho: {s.ganhoDb} dB</label>
        <input type="range" min={-40} max={0} step={0.5} value={s.ganhoDb} onChange={(e) => mudar((ss) => { ss.ganhoDb = Number(e.target.value); })} />
        <label>Quadro (no vídeo)</label>
        <input type="number" value={abs} onChange={(e) => {
          const f = limitar(Number(e.target.value), 0, d.total - 1);
          const c = d.cenas.find((x) => f >= x.from && f < x.from + x.dur) ?? d.cenas[0];
          mudar((ss) => { ss.cena = c.id; ss.frame = f - c.from; });
        }} />
        <div className="linha" style={{ marginTop: 12 }}>
          <button onClick={() => onSeek(abs)}><Crosshair size={14} /> Ir para</button>
          <button onClick={novoSfx}><Plus size={14} /> Novo no playhead</button>
          <button className="perigo" onClick={() => { alterar((p) => produzir(p, (r) => { r.sfx.splice(si, 1); })); onSelect({ tipo: "audio" }); }}><Trash2 size={14} /> Excluir</button>
        </div>
        <div className="sub" style={{ marginTop: 8 }}>Arraste o ◆ na timeline para mover. O som toca 2–3 quadros antes do evento (som antecipa imagem).</div>
      </div>
    );
  }

  // ---------- fala ----------
  if (sel.tipo === "frase") {
    const f = d.frases.find((x) => x.id === sel.id);
    if (!f) return <div className="painel">Fala não encontrada.</div>;
    return (
      <div className="painel">
        <h2>Fala {f.id}</h2>
        <div className="sub">{tempo(f.from)} → {tempo(f.from + f.dur)} · {(f.dur / 30).toFixed(1)} s · voz {f.fonte === "gravada" ? "gravada pelo grupo" : "sintética"}</div>
        <label>Texto falado</label>
        <div style={{ padding: 8, border: "1px solid var(--linha)", borderRadius: 7 }}>{f.texto}</div>
        <div className="aviso-animacao">
          🎙 A voz não se edita aqui (as animações estão presas às palavras). Para mudar o texto: edite <code>src/data/narracao.ts</code> e rode
          <code> npm run voz:sintetica</code>; para usar a voz do grupo: grave seguindo <code>docs/ROTEIRO_GRAVACAO.md</code> e rode <code>npm run voz:importar</code>.
        </div>
        <div style={{ marginTop: 10 }}><button onClick={() => { const a = new Audio(`/${f.src}`); void a.play(); }}><Play size={14} /> Ouvir só esta fala</button></div>
      </div>
    );
  }

  // ---------- pin ----------
  if (sel.tipo === "pin") {
    const r = revisoes.find((x) => x.id === sel.id);
    if (!r) return <div className="painel">Revisão não encontrada.</div>;
    return (
      <div className="painel">
        <h2>Revisão #{r.id}</h2>
        <div className="sub">{r.tempo} (quadro {r.frame}) · {r.cenaNome} {r.x != null ? `· posição ${(r.x * 100).toFixed(0)}%, ${(r.y! * 100).toFixed(0)}%` : ""}</div>
        {r.still ? <img src={`/${r.still}?v=${r.criadoEm}`} style={{ width: "100%", borderRadius: 8 }} alt="" /> : <div className="sub">(sem still)</div>}
        <label>Observação</label>
        <textarea rows={3} value={r.texto} onChange={(e) => atualizarRevisao(r.id, { texto: e.target.value })} />
        <label>O que eu quero</label>
        <textarea rows={2} value={r.queroQue ?? ""} onChange={(e) => atualizarRevisao(r.id, { queroQue: e.target.value })} />
        <div className="linha">
          <div><label>Categoria</label><select value={r.categoria} onChange={(e) => atualizarRevisao(r.id, { categoria: e.target.value as Revisao["categoria"] })}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label>Gravidade</label><select value={r.gravidade} onChange={(e) => atualizarRevisao(r.id, { gravidade: e.target.value as Revisao["gravidade"] })}>{GRAVIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label>Status</label><select value={r.status} onChange={(e) => atualizarRevisao(r.id, { status: e.target.value as Revisao["status"] })}><option value="aberto">aberto</option><option value="em-andamento">em andamento</option><option value="feito">feito</option></select></div>
        </div>
        <div className="linha" style={{ marginTop: 12 }}>
          <button onClick={() => onSeek(r.frame)}><Crosshair size={14} /> Ir para o quadro</button>
          <button className="perigo" onClick={() => apagarRevisao(r.id)}><Trash2 size={14} /> Apagar</button>
        </div>
      </div>
    );
  }

  // ---------- áudio ----------
  if (sel.tipo === "audio") {
    const a = projeto.audio;
    const mudar = (fn: (aa: Projeto["audio"]) => void) => alterar((p) => produzir(p, (r) => fn(r.audio)));
    return (
      <div className="painel">
        <h2>Áudio</h2>
        <div className="sub">Níveis da mixagem. O render final ainda normaliza tudo para −14 LUFS.</div>
        {(["voz", "trilha", "sfx"] as const).map((k) => (
          <div className="grupo" key={k}>
            <div className="linha" style={{ marginTop: 6 }}>
              <b style={{ flex: 1 }}>{k === "voz" ? "Voz" : k === "trilha" ? "Trilha" : "Efeitos (SFX)"}</b>
              <label style={{ flex: "0 0 auto", margin: 0, display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={a[k].ativo} onChange={(e) => mudar((aa) => { aa[k].ativo = e.target.checked; })} /> ligado
              </label>
            </div>
            <label>Ganho: {a[k].ganhoDb > 0 ? "+" : ""}{a[k].ganhoDb} dB</label>
            <input type="range" min={-24} max={12} step={0.5} value={a[k].ganhoDb} onChange={(e) => mudar((aa) => { aa[k].ganhoDb = Number(e.target.value); })} />
            {k === "trilha" ? (
              <>
                <label>Ducking (trilha sob a voz): {a.trilha.duckingDb} dB</label>
                <input type="range" min={-24} max={0} step={0.5} value={a.trilha.duckingDb} onChange={(e) => mudar((aa) => { aa.trilha.duckingDb = Number(e.target.value); })} />
              </>
            ) : null}
          </div>
        ))}
        <button onClick={novoSfx}><Plus size={14} /> Novo efeito sonoro no playhead ({tempo(frame)})</button>
        <div className="sub" style={{ marginTop: 8 }}>Para trocar a trilha por uma do grupo: substitua <code>public/audio/trilha.wav</code> (livre de direitos) e ajuste o BPM.</div>
      </div>
    );
  }

  // ---------- projeto ----------
  const e = projeto.equipe;
  const mudarEquipe = (fn: (q: Projeto["equipe"]) => void) => alterar((p) => produzir(p, (r) => fn(r.equipe)));
  return (
    <div className="painel">
      <h2>Projeto</h2>
      <div className="sub">Dados do grupo (aparecem na abertura e no fechamento), cores da marca e nome do produto.</div>
      <details className="grupo" open>
        <summary>Equipe e contato</summary>
        <label>Nome do grupo (squad)</label>
        <input value={e.nomeDoGrupo} onChange={(ev) => mudarEquipe((q) => { q.nomeDoGrupo = ev.target.value; })} />
        <div className="sub">A voz sintética só fala o nome depois de rodar <code>npm run voz:sintetica</code> de novo.</div>
        {e.membros.map((m, i) => (
          <div key={i} className="linha" style={{ marginTop: 6 }}>
            <input placeholder="Nome" value={m.nome} onChange={(ev) => mudarEquipe((q) => { q.membros[i].nome = ev.target.value; })} />
            <input placeholder="Função (vazio = só o nome)" value={m.funcao} onChange={(ev) => mudarEquipe((q) => { q.membros[i].funcao = ev.target.value; })} />
            <button className="perigo" style={{ flex: "0 0 auto" }} disabled={e.membros.length <= 1} onClick={() => mudarEquipe((q) => { q.membros.splice(i, 1); })}><Trash2 size={13} /></button>
          </div>
        ))}
        <button style={{ marginTop: 6 }} disabled={e.membros.length >= 6} onClick={() => mudarEquipe((q) => { q.membros.push({ nome: "[NOME]", funcao: "[FUNÇÃO]" }); })}><Plus size={13} /> integrante</button>
        <label>Contato (e-mail / @) — vazio = não aparece</label>
        <input placeholder="vazio = sem contato no fechamento" value={e.contato} onChange={(ev) => mudarEquipe((q) => { q.contato = ev.target.value; })} />
        <label>Disciplina / rodapé</label>
        <input value={e.disciplina} onChange={(ev) => mudarEquipe((q) => { q.disciplina = ev.target.value; })} />
      </details>
      <details className="grupo">
        <summary>Marca</summary>
        <label>Nome do produto (a última palavra fica em destaque)</label>
        <input value={e.marca} onChange={(ev) => mudarEquipe((q) => { q.marca = ev.target.value; })} />
        <label>Slogan</label>
        <input value={e.slogan} onChange={(ev) => mudarEquipe((q) => { q.slogan = ev.target.value; })} />
        <label>Logo real (arquivo em public/brand/, ex.: brand/logo-simbolo.png — vazio = desenho provisório)</label>
        <input value={e.logoSimbolo ?? ""} onChange={(ev) => mudarEquipe((q) => { q.logoSimbolo = ev.target.value.trim() || null; })} />
      </details>
      <details className="grupo">
        <summary>Cores (tema)</summary>
        {Object.entries(projeto.tema).map(([k, v]) => (
          <div key={k} className="linha" style={{ marginTop: 6 }}>
            <input type="color" value={v} style={{ flex: "0 0 34px" }} onChange={(ev) => alterar((p) => produzir(p, (r) => { (r.tema as Record<string, string>)[k] = ev.target.value.toUpperCase(); }))} />
            <span title={k}>{ROTULOS_TEMA[k] ?? k}</span>
            <code style={{ flex: "0 0 auto", color: "var(--txt3)" }}>{v}</code>
          </div>
        ))}
        <label>Paleta da marca</label>
        <div className="paleta">{BRAND.map((c) => <button key={c} title={c} style={{ background: c }} onClick={() => navigator.clipboard?.writeText(c)} />)}</div>
        <div className="sub">Clique numa cor da paleta para copiar o código.</div>
      </details>
      <ErrosDe erros={erros} prefixo="equipe" />
    </div>
  );
};
