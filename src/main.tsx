/**
 * Ponto de entrada do frontend. Monta a aplicação React no elemento raiz do HTML e carrega os estilos globais.
 */
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Inicia a aplicação React a partir do elemento #root definido no index.html.
createRoot(document.getElementById("root")!).render(<App />);
