/**
 * Componente raiz do frontend. Entrega o roteador principal para toda a aplicação React.
 */
import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes";
import { clearLegacyBrowserData } from "./lib/clientSession";

export default function App() {
  useEffect(() => {
    clearLegacyBrowserData();
  }, []);

  return <RouterProvider router={router} />;
}
