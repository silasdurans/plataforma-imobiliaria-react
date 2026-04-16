/**
 * Componente raiz do frontend. Entrega o roteador principal para toda a aplicação React.
 */
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  // Entrega o roteador principal para toda a árvore de componentes.
  return <RouterProvider router={router} />;
}
