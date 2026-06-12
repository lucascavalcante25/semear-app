import { createRoot } from "react-dom/client";
import { aplicarFaviconMarca } from "@/lib/plataforma";
import App from "./App.tsx";
import "./index.css";

aplicarFaviconMarca();
createRoot(document.getElementById("root")!).render(<App />);
