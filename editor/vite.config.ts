// Estúdio de Revisão — `npm run editor` (horizontal, :5174) ou `npm run editor:vertical` (em pé, :5175).
// Local, sem login, sem nuvem, sem telemetria. O formato vem de FORMATO (scripts/editor.mjs).
// Importa a MESMA composição das cenas (../src) que o render usa: o que se vê = o que renderiza.
// Os arquivos de ../public (telas, áudio) são servidos pela API (editor/api.ts), com suporte a Range.
import path from "node:path";
import { defineConfig } from "vite";
import { apiPlugin } from "./api";

export default defineConfig({
  root: __dirname,
  // cache próprio de cada editor: os dois podem rodar ao mesmo tempo sem disputar arquivos
  cacheDir: path.resolve(__dirname, "..", "node_modules", `.vite-editor-${process.env.FORMATO || "horizontal"}`),
  publicDir: false,
  plugins: [apiPlugin()],
  esbuild: { jsx: "automatic" },
  server: {
    port: Number(process.env.EDITOR_PORTA || 5174),
    strictPort: true,
    open: !process.env.EDITOR_SEM_ABRIR, // EDITOR_SEM_ABRIR=1 → não abre o navegador (usado no preview)
    host: "127.0.0.1",
    fs: { allow: [path.resolve(__dirname, "..")] },
    watch: { ignored: ["**/revisoes/**", "**/out/**", "**/src/data/project.json", "**/src/data/project-vertical.json", "**/src/studio/**", "**/whisper.cpp/**", "**/public/**"] },
  },
  define: { "process.env.NODE_ENV": JSON.stringify("development"), __FORMATO__: JSON.stringify(process.env.FORMATO || "horizontal") },
  optimizeDeps: { include: ["react", "react-dom", "remotion", "@remotion/player", "lucide-react", "zod", "@remotion/zod-types"] },
});
