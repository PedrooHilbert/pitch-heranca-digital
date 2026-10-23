// Cores da marca — lidas do projeto (project.json → tema), editáveis no Estúdio de Revisão e no Studio.
// `colors.X` é lido NA HORA do render (Proxy), então trocar uma cor no editor muda o preview na hora.
import { getProjeto } from "./projeto";

export type Cores = {
  teal900: string; teal800: string; teal700: string; teal600: string; teal400: string;
  mint: string; mintSoft: string; mintSoft2: string; tealTint: string; bg: string; bg2: string;
  card: string; cardBorder: string; ink: string; ink2: string; ink3: string;
  amber: string; amberBg: string; amberBorder: string; green: string; greenBg: string;
  blue: string; blueBg: string; red: string; white: string;
};

export const colors: Cores = new Proxy({} as Cores, {
  get: (_alvo, chave: string) => (getProjeto().tema as Record<string, string>)[chave],
  ownKeys: () => Reflect.ownKeys(getProjeto().tema),
  getOwnPropertyDescriptor: (_alvo, chave: string) => ({
    enumerable: true,
    configurable: true,
    value: (getProjeto().tema as Record<string, string>)[chave],
  }),
});

export const cardShadow = "0 10px 28px rgba(11,63,61,.07)";
export const cardShadowLg = "0 24px 64px rgba(11,63,61,.18)";

// Slogan (project.json → equipe.slogan).
export const slogan = () => getProjeto().equipe.slogan;
export const sloganCaixaAlta = () => getProjeto().equipe.slogan.toLocaleUpperCase("pt-BR");

// Margem de segurança: conteúdo a >= 80 px das bordas.
export const SAFE = 80;
