// Tokens de cor e estilo copiados do protótipo (§4 do PROMPT).
// Tema claro + verde-petróleo: confiança, segurança e acolhimento.

export const colors = {
  teal900: "#0B3F3D", // fundos escuros, barras laterais
  teal800: "#07302F", // gradiente do fundo escuro
  teal700: "#0E5A57", // cor principal, botões, títulos
  teal600: "#14706B", // item ativo, hover
  teal400: "#2FA79A", // gráficos, destaques
  mint: "#7FD1C5", // destaque sobre fundo escuro
  mintSoft: "#CFE3DF", // texto secundário claro sobre escuro
  mintSoft2: "#A9C7C2",
  tealTint: "#E2F0ED", // fundos de ícones/cards claros
  bg: "#F3F6F4", // fundo de página claro
  bg2: "#E9F1EE", // degradê claro
  card: "#FFFFFF",
  cardBorder: "#DCE3E0",
  ink: "#13211F", // texto principal
  ink2: "#44544F", // texto secundário
  ink3: "#5E6E69",
  amber: "#B45309", // alertas / pendências
  amberBg: "#FFF3D6",
  amberBorder: "#F5C86B",
  green: "#15803D", // confirmado / com destino
  greenBg: "#E3F4E8",
  blue: "#1E4E6B", // classe "Patrimonial"
  blueBg: "#D7E9F5",
  red: "#B42318", // ações destrutivas / contestar
  white: "#FFFFFF",
} as const;

// Fundo escuro padrão de cena de impacto (gradiente verde-petróleo).
export const darkBg = `linear-gradient(160deg, ${colors.teal900} 0%, ${colors.teal700} 100%)`;
// Fundo claro padrão.
export const lightBg = `linear-gradient(180deg, ${colors.bg}, ${colors.bg2})`;

export const cardShadow = "0 10px 28px rgba(11,63,61,.07)";
export const cardShadowLg = "0 24px 64px rgba(11,63,61,.18)";
export const radius = { card: 20, cardLg: 24, pill: 999, frame: 18 };

// Slogan e headline da marca (§4).
export const SLOGAN = "Seus dados, sua história, seu futuro.";
export const SLOGAN_SPACED = "SEUS DADOS, SUA HISTÓRIA, SEU FUTURO.";

// Margem de segurança (§11): conteúdo a >= 80px das bordas.
export const SAFE = 80;
