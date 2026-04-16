/**
 * Versão alternativa ou legada do banner institucional.
 */
import { motion } from "motion/react";
import { ExternalLink, Building2, Award, TrendingUp, Users, Shield, ChevronRight, Sparkles } from "lucide-react";

export function InstitutionalBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0F172A] to-[#1a1f3a] py-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo Grande */}
            <motion.div 
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                <div className="size-16 bg-white rounded-xl flex items-center justify-center shadow-xl">
                  <Building2 className="size-10 text-[#0F172A]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Grupo São Paulo</div>
                  <div className="text-sm text-blue-300">Participações</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30 mb-6">
                <Sparkles className="size-4 text-blue-300" />
                <span className="text-sm text-blue-200 font-medium">Tradição e Inovação desde 1987</span>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Conheça o Grupo
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  São Paulo Participações
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Mais de 35 anos de experiência no mercado imobiliário, oferecendo soluções 
                completas em investimentos, gestão de ativos e desenvolvimento de projetos comerciais.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: "35+", label: "Anos", icon: Award },
                  { value: "500+", label: "Imóveis", icon: Building2 },
                  { value: "10k+", label: "Clientes", icon: Users },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  >
                    <stat.icon className="size-6 text-blue-400 mb-2" />
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="https://saopauloparticipacoes.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all"
                >
                  <ExternalLink className="size-5" />
                  Visite Nosso Site Institucional
                  <ChevronRight className="size-5" />
                </motion.a>
                
                <motion.a
                  href="https://saopauloparticipacoes.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
                >
                  Sobre a Empresa
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              {
                icon: Shield,
                title: "Segurança e Confiabilidade",
                description: "Processos certificados e transparentes em todas as operações",
                color: "from-emerald-500 to-green-600"
              },
              {
                icon: TrendingUp,
                title: "Portfólio Premium",
                description: "Imóveis de alto padrão nas melhores localizações de São Paulo",
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: Award,
                title: "Excelência Reconhecida",
                description: "Premiados pelo mercado e certificações internacionais",
                color: "from-purple-500 to-violet-600"
              },
              {
                icon: Users,
                title: "Atendimento Personalizado",
                description: "Equipe especializada dedicada ao seu sucesso",
                color: "from-orange-500 to-amber-600"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className={`size-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-50" />
    </section>
  );
}
