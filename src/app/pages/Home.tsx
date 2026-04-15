import { Search, Sparkles, Award, ArrowRight, MapPin, X } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AIAgent } from "../components/AIAgent";
import { PropertyCard } from "../components/common/PropertyCard";
import { InstitutionalBanner } from "../components/common/InstitutionalBanner";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import heroBackground from "../../assets/0fa28a804d596717eca062a20b6d2ca8d1630f0a.png";
import { useProperties } from "../../data/properties";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const extractNeighborhood = (location: string) => location.split(",")[0]?.trim() ?? location;
const extractCity = (location: string) => location.split(",")[1]?.replace("- MA", "").trim() ?? location;

export default function Home() {
  const navigate = useNavigate();
  const properties = useProperties();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = normalizeText(searchQuery.trim());

  const filteredResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return properties.filter((property) => {
      const searchText = normalizeText(
        `${property.title} ${property.location} ${extractNeighborhood(property.location)} ${extractCity(property.location)}`,
      );
      return searchText.includes(normalizedQuery);
    });
  }, [normalizedQuery, properties]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const terms = new Set<string>();

    properties.forEach((property) => {
      [property.title, extractNeighborhood(property.location), extractCity(property.location)].forEach((term) => {
        if (normalizeText(term).includes(normalizedQuery)) {
          terms.add(term);
        }
      });
    });

    return Array.from(terms).slice(0, 5);
  }, [normalizedQuery, properties]);

  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      navigate("/resultados");
      return;
    }

    const normalizedTrimmedQuery = normalizeText(trimmedQuery);
    const exactMatch = properties.find((property) =>
      normalizeText(
        `${property.title} ${property.location} ${extractNeighborhood(property.location)} ${extractCity(property.location)}`,
      ).includes(normalizedTrimmedQuery),
    );

    if (filteredResults.length === 1 && exactMatch) {
      navigate(`/imovel/${exactMatch.id}`);
      return;
    }

    navigate(`/resultados?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const recentProperties = properties.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-blue-300 rounded-full text-sm border border-white/10 backdrop-blur-sm">
                <Award className="size-4" />
                <span>Plataforma líder em imóveis comerciais</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-4xl mx-auto mb-12">
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl shadow-blue-500/5">
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/25">
                    <Sparkles className="size-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-white">Assistente Inteligente com IA</h2>
                    <p className="text-slate-400">Busque por nome, cidade ou bairro em tempo real</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder='Ex: São Luís, Athenas, Centro'
                        className="w-full px-6 py-4 pr-14 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-[#0F172A]"
                        onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-[#0F172A]"
                          aria-label="Limpar busca"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleSearch()}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <Sparkles className="size-5" />
                      <span>Buscar</span>
                    </button>
                  </div>

                  {!!suggestions.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-sm rounded-full border border-white/10 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {!!normalizedQuery && filteredResults.slice(0, 4).map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => navigate(`/imovel/${property.id}`)}
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-left text-white transition-colors hover:bg-white/15"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                              <MapPin className="size-4" />
                              {property.location}
                            </div>
                          </div>
                          <div className="text-sm text-cyan-200">R$ {property.price.toLocaleString("pt-BR")}</div>
                        </div>
                      </button>
                    ))}

                    {!!normalizedQuery && !filteredResults.length && (
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200">
                        Nenhum imóvel encontrado
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-slate-500 text-sm">Exemplos:</span>
                    {["São Luís", "Athenas", "Centro", "Ponta d'Areia"].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          setSearchQuery(example);
                          handleSearch(example);
                        }}
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

      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#0F172A] to-blue-600 rounded-full" />
              <span className="text-sm text-[#0F172A]/60 uppercase tracking-wider">Destaques</span>
            </div>
            <h2 className="text-3xl sm:text-4xl mb-2 text-[#0F172A]">Espaços em Destaque</h2>
            <p className="text-slate-500">Selecionados especialmente para você</p>
          </div>
          <button onClick={() => navigate("/resultados")} className="w-full sm:w-auto justify-center px-6 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#1E293B] transition-colors flex items-center gap-2 shadow-lg shadow-[#0F172A]/20">
            Ver todos
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property, index) => (
            <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }}>
              <PropertyCard {...property} />
            </motion.div>
          ))}
        </div>
      </section>

      <InstitutionalBanner />

      <section className="py-20 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl text-white mb-4">Pronto para encontrar seu espaço ideal?</h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Use nossa plataforma inteligente e encontre o imóvel comercial perfeito para o seu negócio em poucos minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate("/resultados")} className="w-full sm:w-auto justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25">
                <Search className="size-5" />
                Explorar Espaços
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <AIAgent />
      <Footer />
    </div>
  );
}
