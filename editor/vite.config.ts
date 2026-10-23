// Estúdio de Revisão — `npm run editor` (http://localhost:5174). Local, sem login, sem nuvem, sem telemetria.
// Importa a MESMA composição das cenas (../src) que o render usa: o que se vê = o que renderiza.
// Os arquivos de ../public (telas, áudio) são servidos pela API (editor/api.ts), com suporte a Range.
import path from "node:path";
import { defineConfig } from "vite";
import { apiPlugin } from "./api";

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [apiPlugin()],
  esbuild: { jsx: "automatic" },
  server: {
    port: 5174,
    strictPort: true,
    open: !process.env.EDITOR_SEM_ABRIR, // EDITOR_SEM_ABRIR=1 → não abre o navegador (usado no preview)
    host: "127.0.0.1",
    fs: { allow: [path.resolve(__dirname, "..")] },
    watch: { ignored: ["**/revisoes/**", "**/out/**", "**/src/data/project.json", "**/src/studio/**", "**/whisper.cpp/**", "**/public/**"] },
  },
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  optimizeDeps: { include: ["react", "react-dom", "remotion", "@remotion/player", "lucide-react", "zod", "@remotion/zod-types"] },
});
