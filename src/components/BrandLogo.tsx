// Logo de uma plataforma (src/data/marcas.ts) em cores originais, sem deformar (object-fit: contain).
// Só muda tamanho e brilho. Sem arquivo → ícone genérico (domínio, banco digital, Ledger).
import React from "react";
import { Img, staticFile } from "remotion";
import { Globe, Landmark, HardDrive, CircleHelp } from "lucide-react";
import { MARCAS, type MarcaId } from "../data/marcas";
import { colors } from "../data/theme";

const GENERICO: Partial<Record<MarcaId, React.FC<{ size?: number; strokeWidth?: number; color?: string }>>> = {
  dominio: Globe, banco: Landmark, ledger: HardDrive,
};

export const BrandLogo: React.FC<{
  nome: MarcaId;
  tamanho: number;
  /** 0..1+ — brilho na cor da marca */
  glow?: number;
  /** fundo onde o logo está: no escuro, X e Apple usam a versão branca */
  fundo?: "escuro" | "claro";
  /** cor do ícone genérico */
  corGenerico?: string;
}> = ({ nome, tamanho, glow = 0, fundo = "escuro", corGenerico }) => {
  const m = MARCAS[nome];
  const sombras = glow > 0 ? m.glow.map((c) => `drop-shadow(0 0 ${Math.round(tamanho * 0.12 * glow)}px ${c})`).join(" ") : undefined;
  if (!m.arquivo) {
    const Ic = GENERICO[nome] ?? CircleHelp;
    return (
      <div style={{ width: tamanho, height: tamanho, display: "flex", alignItems: "center", justifyContent: "center", filter: sombras }}>
        <Ic size={tamanho * 0.86} strokeWidth={1.7} color={corGenerico ?? (fundo === "escuro" ? colors.mint : colors.teal700)} />
      </div>
    );
  }
  const arquivo = fundo === "escuro" && m.arquivoEscuro ? m.arquivoEscuro : m.arquivo;
  const img = <Img src={staticFile(arquivo)} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />;
  return (
    <div style={{ width: tamanho, height: tamanho, filter: sombras }}>
      {m.fundoProprio ? (
        // logo com fundo próprio (Netflix): dentro de um quadrado arredondado, não solto
        <div style={{ width: "100%", height: "100%", borderRadius: tamanho * 0.22, overflow: "hidden" }}>{img}</div>
      ) : (
        img
      )}
    </div>
  );
};
