// Modo Revisão: diálogo do pin (C) e painel de revisões (filtros, marcar feito, copiar pedido para o Claude Code).
import React, { useMemo, useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { CATEGORIAS, GRAVIDADES, type Revisao } from "./util";

export type NovoPin = Pick<Revisao, "categoria" | "gravidade" | "texto" | "queroQue">;

export const DialogoPin: React.FC<{
  tempo: string;
  frame: number;
  cenaNome: string;
  pos: { x: number; y: number } | null;
  salvando: boolean;
  onSalvar: (p: NovoPin) => void;
  onCancelar: () => void;
}> = ({ tempo, frame, cenaNome, pos, salvando, onSalvar, onCancelar }) => {
  const [texto, setTexto] = useState("");
  const [queroQue, setQueroQue] = useState("");
  const [categoria, setCategoria] = useState<NovoPin["categoria"]>("Visual");
  const [gravidade, setGravidade] = useState<NovoPin["gravidade"]>("Média");
  const ok = texto.trim().length > 0 && !salvando;
  return (
    // encostado à direita (sobre o inspetor) para o vídeo ficar livre para o clique que marca o lugar
    <div className="modal-fundo" style={{ background: "transparent", placeItems: "start end", padding: "56px 12px 0 0", pointerEvents: "none" }}>
      <div className="modal" style={{ pointerEvents: "auto", width: 400 }} onKeyDown={(e) => e.stopPropagation()}>
        <h2>Novo comentário · {tempo}</h2>
        <div className="sub" style={{ color: "var(--txt3)" }}>
          Quadro {frame} · {cenaNome} · {pos ? `posição ${(pos.x * 100).toFixed(0)}%, ${(pos.y * 100).toFixed(0)}%` : "clique no vídeo para marcar o lugar (opcional)"}
        </div>
        <label>O que está errado</label>
        <textarea autoFocus rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="ex.: o texto do card ficou cortado" onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && ok) onSalvar({ texto, queroQue, categoria, gravidade }); }} />
        <label>O que eu quero (opcional)</label>
        <textarea rows={2} value={queroQue} onChange={(e) => setQueroQue(e.target.value)} placeholder="ex.: quebrar em duas linhas, fonte menor" />
        <div className="linha">
          <div><label>Categoria</label><select value={categoria} onChange={(e) => setCategoria(e.target.value as NovoPin["categoria"])}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label>Gravidade</label><select value={gravidade} onChange={(e) => setGravidade(e.target.value as NovoPin["gravidade"])}>{GRAVIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div className="linha" style={{ marginTop: 14, justifyContent: "flex-end" }}>
          <span style={{ color: "var(--txt3)", fontSize: 12 }}>{salvando ? "capturando o quadro…" : "Ctrl+Enter salva · Esc cancela"}</span>
          <button style={{ flex: "0 0 auto" }} onClick={onCancelar}>Cancelar</button>
          <button style={{ flex: "0 0 auto" }} className="primario" disabled={!ok} onClick={() => onSalvar({ texto, queroQue, categoria, gravidade })}>Salvar pin</button>
        </div>
      </div>
    </div>
  );
};

export const pedidoParaClaude = (lista: Revisao[]) => {
  const abertas = lista.filter((r) => r.status !== "feito");
  const linhas = abertas.map((r) => {
    const pos = r.x != null ? ` · posição (${(r.x * 100).toFixed(0)}%, ${(r.y! * 100).toFixed(0)}%)` : "";
    const quero = r.queroQue ? ` · quero: "${r.queroQue}"` : "";
    return `#${r.id} · ${r.tempo} (frame ${r.frame}) · ${r.cenaNome} · ${r.categoria} · ${r.gravidade} · "${r.texto}"${quero}${pos} · still: ${r.still ?? "(sem still)"}`;
  });
  return [
    "Resolva as revisões abertas abaixo. Para cada uma: leia o still, localize o código/dados, corrija, rode a auditoria e marque como \"feito\" em revisoes/revisoes.json.",
    "",
    ...linhas,
  ].join("\n");
};

export const PainelRevisoes: React.FC<{
  lista: Revisao[];
  cenas: { id: string; nome: string }[];
  onIr: (r: Revisao) => void;
  onStatus: (id: number, status: Revisao["status"]) => void;
  onApagar: (id: number) => void;
  toast: (m: string) => void;
}> = ({ lista, cenas, onIr, onStatus, onApagar, toast }) => {
  const [fCena, setFCena] = useState("");
  const [fCat, setFCat] = useState("");
  const [fStatus, setFStatus] = useState("abertas");
  const filtrada = useMemo(
    () =>
      lista
        .filter((r) => !fCena || r.cena === fCena)
        .filter((r) => !fCat || r.categoria === fCat)
        .filter((r) => (fStatus === "abertas" ? r.status !== "feito" : fStatus === "todas" ? true : r.status === fStatus))
        .sort((a, b) => a.frame - b.frame),
    [lista, fCena, fCat, fStatus],
  );
  const abertas = lista.filter((r) => r.status !== "feito").length;
  const copiar = async () => {
    const t = pedidoParaClaude(lista);
    try {
      await navigator.clipboard.writeText(t);
      toast(`Pedido com ${abertas} revisão(ões) copiado — cole no Claude Code.`);
    } catch {
      window.prompt("Copie o pedido:", t);
    }
  };
  return (
    <div className="painel">
      <h2>Revisões</h2>
      <div className="sub">{abertas} aberta(s) de {lista.length}. Aperte <b>C</b> para comentar o quadro atual (clique no vídeo para marcar o lugar).</div>
      <button className="primario" disabled={!abertas} onClick={copiar}><Copy size={14} /> Copiar pedido para o Claude Code</button>
      <div className="linha" style={{ marginTop: 10 }}>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="abertas">abertas</option><option value="todas">todas</option><option value="aberto">só “aberto”</option><option value="em-andamento">em andamento</option><option value="feito">feitas</option>
        </select>
        <select value={fCena} onChange={(e) => setFCena(e.target.value)}>
          <option value="">todas as cenas</option>
          {cenas.map((c) => <option key={c.id} value={c.id}>{c.id.toUpperCase()} · {c.nome}</option>)}
        </select>
        <select value={fCat} onChange={(e) => setFCat(e.target.value)}>
          <option value="">todas as categorias</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 10 }}>
        {filtrada.length === 0 ? <div className="sub">Nenhuma revisão com esses filtros.</div> : null}
        {filtrada.map((r) => (
          <div key={r.id} className={`revisao ${r.status === "feito" ? "feito" : ""}`} onClick={() => onIr(r)}>
            {r.still ? <img src={`/${r.still}?v=${r.criadoEm}`} alt="" /> : <div style={{ width: 110, aspectRatio: "16/9", background: "#000", borderRadius: 5 }} />}
            <div>
              <div className="cab">
                <b>#{r.id}</b> {r.tempo} · {r.cenaNome}
                <span className="tag">{r.categoria}</span>
                <span className={`tag ${r.gravidade}`}>{r.gravidade}</span>
              </div>
              <div style={{ margin: "4px 0" }}>{r.texto}</div>
              {r.queroQue ? <div style={{ color: "var(--txt2)", fontSize: 12 }}>quero: {r.queroQue}</div> : null}
              <div className="linha" style={{ marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                <label style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, flex: 1, textTransform: "none", fontSize: 12, color: "var(--txt)" }}>
                  <input type="checkbox" checked={r.status === "feito"} onChange={(e) => onStatus(r.id, e.target.checked ? "feito" : "aberto")} /> feito
                </label>
                {r.status === "em-andamento" ? <span className="tag" style={{ flex: "0 0 auto" }}>em andamento</span> : null}
                <button className="mini perigo" style={{ flex: "0 0 auto" }} onClick={() => onApagar(r.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {abertas === 0 && lista.length > 0 ? <div className="sub"><Check size={14} /> Tudo resolvido.</div> : null}
    </div>
  );
};
