import { loadFont } from "@remotion/google-fonts/Montserrat";

// Fonte oficial do projeto (§4 do PROMPT). Carrega os pesos usados nas cenas.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});
