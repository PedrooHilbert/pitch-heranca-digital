// Estado do projeto no editor: desfazer/refazer ilimitado na sessão, validação Zod ao vivo e
// salvamento automático (debounce) em src/data/project.json pela API local.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projetoSchema, type Projeto } from "../src/data/schema";

export type ErroValidacao = { caminho: string; msg: string };
export type StatusSalvo = "carregando" | "salvo" | "pendente" | "salvando" | "erro" | "invalido";

/** Cópia profunda + mutação (para escrever atualizações simples sem perder a imutabilidade). */
export const produzir = (p: Projeto, fn: (rascunho: Projeto) => void): Projeto => {
  const c = structuredClone(p);
  fn(c);
  return c;
};

export function useProjeto() {
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [status, setStatus] = useState<StatusSalvo>("carregando");
  const [msg, setMsg] = useState("");
  const passado = useRef<Projeto[]>([]);
  const futuro = useRef<Projeto[]>([]);
  const salvoJSON = useRef("");
  const [, forcar] = useState(0);

  useEffect(() => {
    fetch("/api/projeto")
      .then((r) => r.json())
      .then((p: Projeto) => {
        salvoJSON.current = JSON.stringify(p);
        setProjeto(p);
        setStatus("salvo");
      })
      .catch((e) => {
        setStatus("erro");
        setMsg(String(e));
      });
  }, []);

  const validacao = useMemo(() => (projeto ? projetoSchema.safeParse(projeto) : null), [projeto]);
  const erros: ErroValidacao[] = useMemo(
    () => (validacao && !validacao.success ? validacao.error.issues.map((i) => ({ caminho: i.path.join("."), msg: i.message })) : []),
    [validacao],
  );

  /** Aplica uma mudança. `historico: false` = parte de um gesto (arrastar) já registrado por iniciarGesto(). */
  const alterar = useCallback((fn: (p: Projeto) => Projeto, opts: { historico?: boolean } = {}) => {
    setProjeto((atual) => {
      if (!atual) return atual;
      const novo = fn(atual);
      if (novo === atual) return atual;
      if (opts.historico !== false) {
        passado.current.push(atual);
        if (passado.current.length > 500) passado.current.shift();
        futuro.current = [];
      }
      return novo;
    });
  }, []);

  /** Registra o estado atual no histórico antes de um gesto contínuo (arrastar). */
  const iniciarGesto = useCallback(() => {
    setProjeto((atual) => {
      if (atual) {
        passado.current.push(atual);
        futuro.current = [];
      }
      return atual;
    });
  }, []);

  const desfazer = useCallback(() => {
    setProjeto((atual) => {
      const ant = passado.current.pop();
      if (!ant || !atual) return atual;
      futuro.current.push(atual);
      return ant;
    });
    forcar((n) => n + 1);
  }, []);
  const refazer = useCallback(() => {
    setProjeto((atual) => {
      const prox = futuro.current.pop();
      if (!prox || !atual) return atual;
      passado.current.push(atual);
      return prox;
    });
    forcar((n) => n + 1);
  }, []);

  const salvar = useCallback(async (p?: Projeto) => {
    const alvo = p ?? projeto;
    if (!alvo) return false;
    const v = projetoSchema.safeParse(alvo);
    if (!v.success) {
      setStatus("invalido");
      return false;
    }
    const j = JSON.stringify(alvo);
    if (j === salvoJSON.current) {
      setStatus("salvo");
      return true;
    }
    setStatus("salvando");
    try {
      const r = await fetch("/api/projeto", { method: "PUT", headers: { "Content-Type": "application/json" }, body: j });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setStatus("invalido");
        setMsg(e.erros?.map((x: ErroValidacao) => `${x.caminho}: ${x.msg}`).join(" · ") ?? `HTTP ${r.status}`);
        return false;
      }
      salvoJSON.current = j;
      setStatus("salvo");
      setMsg("");
      return true;
    } catch (e) {
      setStatus("erro");
      setMsg(String(e));
      return false;
    }
  }, [projeto]);

  // salvamento automático 800 ms depois da última mudança (só se o projeto for válido)
  useEffect(() => {
    if (!projeto) return;
    const j = JSON.stringify(projeto);
    if (j === salvoJSON.current) return;
    if (erros.length) {
      setStatus("invalido");
      return;
    }
    setStatus("pendente");
    const t = setTimeout(() => void salvar(projeto), 800);
    return () => clearTimeout(t);
  }, [projeto, erros.length, salvar]);

  return {
    projeto, status, msg, erros, alterar, iniciarGesto, desfazer, refazer, salvar,
    podeDesfazer: passado.current.length > 0,
    podeRefazer: futuro.current.length > 0,
  };
}

export type StoreProjeto = ReturnType<typeof useProjeto>;
