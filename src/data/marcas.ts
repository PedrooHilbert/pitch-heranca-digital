// Logos das plataformas citadas no pitch (public/brand/marcas/svg, de pacotes abertos: Iconify "SVG Logos" e
// "Simple Icons"). Uso SÓ para identificar as plataformas — sem parceria nem apoio (ver README).
// Regra: não recolorir nem deformar; só tamanho, brilho/sombra e posição.

export type MarcaId =
  | "instagram" | "gmail" | "outlook" | "bitcoin" | "ethereum" | "binance" | "facebook" | "linkedin" | "x"
  | "whatsapp" | "youtube" | "meta" | "google" | "google-drive" | "google-fotos" | "icloud" | "apple"
  | "netflix" | "spotify" | "bitwarden" | "1password"
  // sem logo no pacote → ícone genérico
  | "dominio" | "banco" | "ledger";

export type Marca = {
  nome: string;
  /** arquivo em public/ (null = sem logo: o BrandLogo mostra o ícone genérico) */
  arquivo: string | null;
  /** versão para fundo escuro (logos pretos: X, Apple) */
  arquivoEscuro?: string;
  /** cores do brilho (a da própria marca; 2 cores = degradê) */
  glow: string[];
  /** o desenho já tem fundo próprio (Netflix): vai dentro de um quadrado arredondado */
  fundoProprio?: boolean;
};

const svg = (f: string) => `brand/marcas/svg/${f}.svg`;

export const MARCAS: Record<MarcaId, Marca> = {
  instagram: { nome: "Instagram", arquivo: svg("instagram"), glow: ["#FA7E1E", "#962FBF"] },
  gmail: { nome: "Gmail", arquivo: svg("gmail"), glow: ["#EA4335", "#4285F4"] },
  outlook: { nome: "Outlook", arquivo: svg("outlook"), glow: ["#0F78D4"] },
  bitcoin: { nome: "Bitcoin", arquivo: svg("bitcoin"), glow: ["#F7931A"] },
  ethereum: { nome: "Ethereum", arquivo: svg("ethereum"), glow: ["#8A92B2", "#62C9E8"] },
  binance: { nome: "Binance", arquivo: svg("binance"), glow: ["#F0B90B"] },
  facebook: { nome: "Facebook", arquivo: svg("facebook"), glow: ["#1877F2"] },
  linkedin: { nome: "LinkedIn", arquivo: svg("linkedin"), glow: ["#0A66C2"] },
  x: { nome: "X", arquivo: svg("x-preto"), arquivoEscuro: svg("x-branco"), glow: ["#FFFFFF"] },
  whatsapp: { nome: "WhatsApp", arquivo: svg("whatsapp"), glow: ["#25D366"] },
  youtube: { nome: "YouTube", arquivo: svg("youtube"), glow: ["#FF0000"] },
  meta: { nome: "Meta", arquivo: svg("meta"), glow: ["#0866FF"] },
  google: { nome: "Google", arquivo: svg("google"), glow: ["#4285F4", "#EA4335"] },
  "google-drive": { nome: "Google Drive", arquivo: svg("google-drive"), glow: ["#1FA463", "#FFD04B"] },
  "google-fotos": { nome: "Google Fotos", arquivo: svg("google-fotos"), glow: ["#FBBC04", "#EA4335"] },
  icloud: { nome: "iCloud", arquivo: svg("icloud"), glow: ["#3693F3"] },
  apple: { nome: "Apple", arquivo: svg("apple-preto"), arquivoEscuro: svg("apple-branco"), glow: ["#FFFFFF"] },
  netflix: { nome: "Netflix", arquivo: svg("netflix"), glow: ["#E50914"], fundoProprio: true },
  spotify: { nome: "Spotify", arquivo: svg("spotify"), glow: ["#1ED760"] },
  bitwarden: { nome: "Bitwarden", arquivo: svg("bitwarden"), glow: ["#175DDC"] },
  "1password": { nome: "1Password", arquivo: svg("1password"), glow: ["#3B66BC"] },
  dominio: { nome: "Domínio", arquivo: null, glow: ["#7FD1C5"] },
  banco: { nome: "Banco digital", arquivo: null, glow: ["#7FD1C5"] },
  ledger: { nome: "Ledger", arquivo: null, glow: ["#7FD1C5"] },
};
