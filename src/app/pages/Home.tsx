import { Search, MapPin, DollarSign, Building2, Maximize2, Users, Wifi, Car, Sofa, TrendingUp, Heart, Sparkles, Award, Clock, DoorOpen, ArrowRight } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AIAgent } from "../components/AIAgent";
import { PropertyCard } from "../components/common/PropertyCard";
import { InstitutionalBanner } from "../components/common/InstitutionalBanner";
import { properties } from "../data/properties";
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import heroBackground from "../../assets/0fa28a804d596717eca062a20b6d2ca8d1630f0a.png";

export default function Home() {
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);

  const handleSearch = () => {
    navigate("/resultados");
  };

  const filterCategories = [
    { 
      id: "escritorio", 
      label: "Escritório", 
      icon: Building2,
      color: "from-blue-500 to-blue-600"
    },
    { 
      id: "coworking", 
      label: "Coworking", 
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    { 
      id: "loja", 
      label: "Loja", 
      icon: Sofa,
      color: "from-green-500 to-green-600"
    },
    { 
      id: "sala", 
      label: "Sala Comercial", 
      icon: Maximize2,
      color: "from-orange-500 to-orange-600"
    },
  ];

  const quickFilters = [
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "parking", label: "Estacionamento", icon: Car },
    { id: "furnished", label: "Mobiliado", icon: Sofa },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const recentProperties = properties.slice(0, 3);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Fundo Inovador e Chamativo */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          {/* Overlay escuro para melhor contraste do texto */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Hero Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-blue-300 rounded-full text-sm border border-white/10 backdrop-blur-sm">
                <Award className="size-4" />
                <span>Plataforma líder em imóveis comerciais</span>
              </div>
            </div>
          </motion.div>

          {/* Chatbot Central - Destaque Principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-blue-500/5">
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/25">
                    <Sparkles className="size-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-white">Assistente Inteligente com IA</h2>
                    <p className="text-slate-400">A forma mais rápida de encontrar seu espaço ideal</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Digite: "Preciso de um escritório pequeno em São Luís por até R$2000"'
                      className="flex-1 px-6 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-[#0F172A]"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <Sparkles className="size-5" />
                      <span>Buscar</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-slate-500 text-sm">Exemplos:</span>
                    {["Coworking no Centro", "Loja até R$3000", "Escritório mobiliado"].map((example) => (
                      <button
                        key={example}
                        onClick={() => setSearchQuery(example)}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 text-sm rounded-full border border-white/10 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Espaços em Destaque - White section with dark accents */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#0F172A] to-blue-600 rounded-full" />
              <span className="text-sm text-[#0F172A]/60 uppercase tracking-wider">Destaques</span>
            </div>
            <h2 className="text-4xl mb-2 text-[#0F172A]">Espaços em Destaque</h2>
            <p className="text-slate-500">Selecionados especialmente para você</p>
          </div>
          <button 
            onClick={() => navigate("/resultados")}
            className="px-6 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] transition-colors flex items-center gap-2 shadow-lg shadow-[#0F172A]/20"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <PropertyCard
                id={property.id}
                image={property.image}
                title={property.title}
                price={property.price}
                location={property.location}
                size={property.size}
                capacity={property.capacity}
                rating={property.rating}
                type={property.type}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Institutional Banner - Grupo São Paulo */}
      <InstitutionalBanner />

      {/* CTA Section - Dark Block */}
      <section className="py-20 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl text-white mb-4">Pronto para encontrar seu espaço ideal?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Use nossa plataforma inteligente e encontre o imóvel comercial perfeito para o seu negócio em poucos minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/resultados")}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <Search className="size-5" />
                Explorar Espaços
              </button>
              <button 
                onClick={scrollToTop}
                className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
              >
                <Sparkles className="size-5" />
                Falar com IA
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chatbot Flutuante */}
      <AIAgent />

      {/* Footer */}
      <Footer />
    </div>
  );
}