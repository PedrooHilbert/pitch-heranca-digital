import { loadFont } from "@remotion/google-fonts/Montserrat";

// Fonte oficial do projeto (§4 do PROMPT). Carrega os pesos usados nas cenas.
// Fora do navegador (scripts Node que importam as cenas, ex.: `npm run sync`) só devolve o nome.
export const { fontFamily } =
  typeof document === "undefined"
    ? { fontFamily: "Montserrat" }
    : loadFont("normal", {
        weights: ["400", "500", "600", "700", "800"],
        subsets: ["latin", "latin-ext"],
      });
