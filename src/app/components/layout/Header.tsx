/**
 * Cabeçalho principal da aplicação. Renderiza navegação, acesso do cliente e menu responsivo.
 */
import { User, Menu, Shield, X, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import logo from "../../../assets/logo-grupo-sao-paulo.png";
import { clearClientSession, getClientSession } from "../../lib/clientSession";

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Recalcula a sessão ao trocar de rota para manter o cabeçalho sincronizado
  // com login/logout feitos em outras telas.
  const clientSession = useMemo(() => getClientSession(), [location.pathname]);
  // Gera as iniciais que aparecem no avatar do cliente logado.
  const avatarFallback = (clientSession?.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    // Limpa a sessão local e força retorno para a home.
    clearClientSession();
    closeMobileMenu();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-slate-100 bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <img src={logo} alt="Grupo São Paulo" className="h-10 w-auto md:h-12" />
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={`relative transition-colors ${isActive("/") ? "text-[#0F172A]" : "text-slate-500 hover:text-[#0F172A]"}`}>
            Início
            {isActive("/") && <motion.div layoutId="activeNav" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#0F172A] rounded-full" />}
          </Link>
          <Link to="/resultados" className={`relative transition-colors ${isActive("/resultados") ? "text-[#0F172A]" : "text-slate-500 hover:text-[#0F172A]"}`}>
            Espaços
            {isActive("/resultados") && <motion.div layoutId="activeNav" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#0F172A] rounded-full" />}
          </Link>
          <a href="https://saopauloparticipacoes.com.br/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0F172A] transition-colors flex items-center gap-1">
            Institucional
          </a>
          <a href="#contato" className="text-slate-500 hover:text-[#0F172A] transition-colors">
            Contato
          </a>
          <Link to="/admin/login" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-sm">
            <Shield className="size-4" />
            Admin
          </Link>
        </nav>

        {clientSession ? (
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/cliente/perfil"
              className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition-transform hover:scale-105"
              title={clientSession.name}
            >
              {avatarFallback}
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-[#0F172A] transition-all">
              <LogOut className="size-4" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <Link to="/cliente/login" className="hidden md:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] hover:shadow-lg transition-all">
              <User className="size-4" />
              <span>Entrar</span>
            </motion.div>
          </Link>
        )}

        <button type="button" onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="md:hidden inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700">
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 py-4 bg-white/95 backdrop-blur-lg">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition-colors text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]">Início</Link>
            <Link to="/resultados" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 transition-colors text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]">Espaços</Link>
            <Link to="/admin/login" onClick={closeMobileMenu} className="rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Shield className="size-4" />
              Admin
            </Link>
            {clientSession ? (
              <>
                <Link to="/cliente/perfil" onClick={closeMobileMenu} className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-white">
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-sm font-semibold">{avatarFallback}</span>
                  <span className="truncate">{clientSession.name}</span>
                </Link>
                <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-[#0F172A] transition-all">
                  <LogOut className="size-4" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link to="/cliente/login" onClick={closeMobileMenu} className="mt-2 flex w-full items-center justify-center gap-2 px-4 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] transition-all">
                <User className="size-4" />
                <span>Entrar</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
