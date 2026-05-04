/**
 * Mapa central de rotas do frontend. Define quais páginas são carregadas em cada URL.
 */
import { Suspense, lazy } from "react";
import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Results from "./pages/Results";
import PropertyDetail from "./pages/PropertyDetail";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ClientAuth = lazy(() => import("./pages/ClientAuth"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const DatabaseInspector = lazy(() => import("./pages/DatabaseInspector"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 h-10 w-56 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const withSuspense = (Component: ComponentType) =>
  function SuspendedRoute() {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <Component />
      </Suspense>
    );
  };

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
    Component: withSuspense(ClientAuth),
  },
  {
    path: "/cliente/perfil",
    Component: withSuspense(ClientProfile),
  },
  {
    path: "/admin/login",
    Component: withSuspense(AdminLogin),
  },
  {
    path: "/admin/dashboard",
    Component: withSuspense(AdminDashboard),
  },
  {
    path: "/__vault/db-7f3a9c",
    Component: withSuspense(DatabaseInspector),
  },
]);
