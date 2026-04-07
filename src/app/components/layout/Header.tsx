import { Building2, User, Menu, Shield } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import logo from "../../../assets/482221208ce2694bfbd00f953045a69d75c76c41.png";

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-slate-100 bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img src={logo} alt="Grupo São Paulo" className="h-12 w-auto" />
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`relative transition-colors ${isActive('/') ? 'text-[#0F172A]' : 'text-slate-500 hover:text-[#0F172A]'}`}
          >
            Início
            {isActive('/') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#0F172A] rounded-full"
              />
            )}
          </Link>
          <Link 
            to="/resultados" 
            className={`relative transition-colors ${isActive('/resultados') ? 'text-[#0F172A]' : 'text-slate-500 hover:text-[#0F172A]'}`}
          >
            Espaços
            {isActive('/resultados') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#0F172A] rounded-full"
              />
            )}
          </Link>
          <a 
            href="https://saopauloparticipacoes.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-[#0F172A] transition-colors flex items-center gap-1"
          >
            Institucional
            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a href="#contato" className="text-slate-500 hover:text-[#0F172A] transition-colors">
            Contato
          </a>
          <Link 
            to="/admin/login" 
            className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-sm"
          >
            <Shield className="size-4" />
            Admin
          </Link>
        </nav>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] hover:shadow-lg transition-all"
        >
          <User className="size-4" />
          <span>Entrar</span>
        </motion.button>

        {/* Mobile menu button */}
        <button className="md:hidden p-2">
          <Menu className="size-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
