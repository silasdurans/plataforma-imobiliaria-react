/**
 * Versão alternativa ou legada do rodapé da aplicação.
 */
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router";
import logo from "../../assets/logo-grupo-sao-paulo.png";

export function Footer() {
  const quickLinks = [
    { label: "Início", path: "/" },
    { label: "Reserva", path: "/resultados" },
    { label: "Contato", path: "#contato" },
  ];

  return (
    <footer className="bg-[#0F1419] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          {/* Coluna 1 — Logo + Descrição + Social */}
          <div className="md:col-span-5">
            {/* Logo */}
            <div className="mb-6">
              <a href="https://saopauloparticipacoes.com.br/" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                <img src={logo} alt="Grupo São Paulo" className="h-16 w-auto mb-4" />
              </a>
            </div>

            <p className="text-[#6B7280] text-sm leading-relaxed max-w-md mb-6">
              Referência em investimentos imobiliários inteligentes, oferecendo soluções
              estratégicas para gestão patrimonial e desenvolvimento de ativos de alto valor.
            </p>

            {/* Botão para conhecer o site */}
            <a 
              href="https://saopauloparticipacoes.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-600/20 mb-8"
            >
              <span>Conheça nosso site</span>
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="size-9 rounded-full border border-white/[0.08] flex items-center justify-center text-[#6B7280] hover:text-white hover:border-white/20 transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Coluna 2 — Navegação */}
          <div className="md:col-span-3">
            <h4 className="text-white text-sm mb-6 tracking-wide">Navegação</h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[#6B7280] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Contatos */}
          <div className="md:col-span-4">
            <h4 className="text-white text-sm mb-6 tracking-wide">Contatos</h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-[#3ECFB4] mt-0.5 flex-shrink-0" />
                  <div className="text-[#6B7280] text-sm leading-relaxed">
                    Av. São Luís, 100<br />
                    São Paulo, SP - Brasil
                  </div>
                </div>
              </li>
              <li>
                <a href="tel:+551130000000" className="flex items-center gap-3 group">
                  <Phone className="size-4 text-[#3ECFB4] flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm group-hover:text-white transition-colors">
                    +55 (11) 3000-0000
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:contato@spparticipacoes.com.br" className="flex items-center gap-3 group">
                  <Mail className="size-4 text-[#3ECFB4] flex-shrink-0" />
                  <span className="text-[#6B7280] text-sm group-hover:text-white transition-colors">
                    contato@spparticipacoes.com.br
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Linha divisória sutil + copyright */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <p className="text-[#4B5563] text-xs text-center">
            © 2026 São Paulo Participações. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
