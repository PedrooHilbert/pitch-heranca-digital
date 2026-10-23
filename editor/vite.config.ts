// Estúdio de Revisão — `npm run editor` (http://localhost:5174). Local, sem login, sem nuvem, sem telemetria.
// Importa a MESMA composição das cenas (../src) que o render usa: o que se vê = o que renderiza.
import path from "node:path";
import { defineConfig } from "vite";
import { apiPlugin } from "./api";

export default defineConfig({
  root: __dirname,
  publicDir: path.resolve(__dirname, "..", "public"),
  plugins: [apiPlugin()],
  esbuild: { jsx: "automatic" },
  server: {
    port: 5174,
    strictPort: true,
    open: true,
    host: "127.0.0.1",
    fs: { allow: [path.resolve(__dirname, "..")] },
    watch: { ignored: ["**/revisoes/**", "**/out/**", "**/src/data/project.json"] },
  },
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  optimizeDeps: { include: ["react", "react-dom", "remotion", "@remotion/player", "lucide-react", "zod"] },
});
