/**
 * Mapa central de rotas do frontend. Define quais páginas são carregadas em cada URL.
 */
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Results from "./pages/Results";
import PropertyDetail from "./pages/PropertyDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ClientAuth from "./pages/ClientAuth";
import ClientProfile from "./pages/ClientProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/resultados",
    Component: Results,
  },
  {
    path: "/imovel/:id",
    Component: PropertyDetail,
  },
  {
    // Rotas protegidas visualmente pelo fluxo de autenticação do cliente.
    path: "/cliente/login",
    Component: ClientAuth,
  },
  {
    path: "/cliente/perfil",
    Component: ClientProfile,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
]);
