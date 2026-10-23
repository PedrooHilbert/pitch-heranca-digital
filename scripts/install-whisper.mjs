// Instala whisper.cpp + modelo (uma vez). Usado para alinhar palavra a palavra a voz GRAVADA
// pelo grupo (npm run voz:importar) e para transcrever a ref2 na receita de movimento.
import path from "node:path";
import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";

const to = path.join(process.cwd(), "whisper.cpp");
const model = process.env.WHISPER_MODEL || "small";
await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model, folder: to });
console.log("whisper.cpp pronto em", to, "modelo", model);
