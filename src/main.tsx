import { createRoot } from "react-dom/client";
import { aplicarFaviconMarca } from "@/lib/plataforma";
import { registrarRecuperacaoChunkDeploy } from "@/lib/lazy-com-reload";
import App from "./App.tsx";
import "./index.css";

registrarRecuperacaoChunkDeploy();
aplicarFaviconMarca();
createRoot(document.getElementById("root")!).render(<App />);
