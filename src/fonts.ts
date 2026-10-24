import { continueRender, delayRender, staticFile } from "remotion";

// Fonte oficial do projeto (§4 do PROMPT): Montserrat (fonte variável — um arquivo cobre os pesos 100–900).
// Os arquivos ficam em public/fonts/ — o render NÃO depende mais da internet (antes vinham do Google Fonts na hora
// e, quando a rede oscilava, o render parava esperando a fonte por 58 s).
// Fora do navegador (scripts Node que importam as cenas, ex.: `npm run sync`) só devolve o nome.
export const fontFamily = "Montserrat";

const ARQUIVOS = [
  { arquivo: "fonts/montserrat-latin.woff2", unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" },
  { arquivo: "fonts/montserrat-latin-ext.woff2", unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF" },
];

if (typeof document !== "undefined" && typeof FontFace !== "undefined") {
  const espera = delayRender("Montserrat (arquivo local)");
  Promise.all(
    ARQUIVOS.map(({ arquivo, unicodeRange }) =>
      new FontFace(fontFamily, `url(${staticFile(arquivo)}) format("woff2")`, { weight: "100 900", style: "normal", unicodeRange })
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .catch((e) => console.error("Montserrat local não carregou:", e))
    .finally(() => continueRender(espera));
}
