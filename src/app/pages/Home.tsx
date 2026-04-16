/**
 * Página inicial da plataforma. Apresenta a busca principal, destaques e atalhos para os imóveis disponíveis.
 */
import { Search, Sparkles, Award, ArrowRight, MapPin, X } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AIAgent } from "../components/AIAgent";
import { PropertyCard } from "../components/common/PropertyCard";
import { InstitutionalBanner } from "../components/common/InstitutionalBanner";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import heroBackground from "../../assets/0fa28a804d596717eca062a20b6d2ca8d1630f0a.png";
import { useProperties } from "../../data/properties";
import { applyRemoteSearchRanking, buildSearchSuggestions, getAISearchStatus, getRemoteMatchReasons, parseNaturalSearch, rankPropertiesBySearch, searchPropertiesWithAI, type AIStatus, type RemoteAISearchResult } from "../lib/aiSearch";

export default function Home() {
  const navigate = useNavigate();
  const properties = useProperties();
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteResult, setRemoteResult] = useState<RemoteAISearchResult | null>(null);
  const [isAISearchLoading, setIsAISearchLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const parsedSearch = useMemo(() => parseNaturalSearch(searchQuery, properties), [properties, searchQuery]);

  useEffect(() => {
    let isActive = true;

    getAISearchStatus()
      .then((status) => {
        if (isActive) {
          setAIStatus(status);
        }
      })
      .catch(() => {
        if (isActive) {
          setAIStatus({
            available: false,
            provider: "ollama",
            model: "indisponivel",
            message: "Nao foi possivel verificar o Ollama agora.",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setRemoteResult(null);
      setIsAISearchLoading(false);
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      setIsAISearchLoading(true);

      try {
        const result = await searchPropertiesWithAI(trimmedQuery);
        if (isActive) {
          setRemoteResult(result);
        }
      } catch {
        if (isActive) {
          setRemoteResult(null);
        }
      } finally {
        if (isActive) {
          setIsAISearchLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const filteredResults = useMemo(() => {
    if (!parsedSearch.normalizedQuery) {
      return [];
    }

    const remoteRanked = applyRemoteSearchRanking(properties, remoteResult);
    if (remoteRanked) {
      return remoteRanked;
    }

    return rankPropertiesBySearch(properties, searchQuery).map((item) => item.property);
  }, [parsedSearch.normalizedQuery, properties, remoteResult, searchQuery]);

  const suggestions = useMemo(() => {
    return buildSearchSuggestions(properties, searchQuery).slice(0, 5);
  }, [properties, searchQuery]);

  const interpretationLabels = remoteResult?.labels?.length ? remoteResult.labels : parsedSearch.labels;

  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      navigate("/resultados");
      return;
    }

    const remoteRanked = applyRemoteSearchRanking(properties, remoteResult);
    const rankedResults = remoteRanked ?? rankPropertiesBySearch(properties, trimmedQuery).map((item) => item.property);
    const bestMatch = rankedResults[0];

    if (rankedResults.length === 1 && bestMatch) {
      navigate(`/imovel/${bestMatch.id}`);
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
          {aiStatus && !aiStatus.available && (
            <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 backdrop-blur-sm">
              Busca com IA local indisponivel no momento. {aiStatus.message} O sistema continua com a busca inteligente local.
            </div>
          )}

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
                    <p className="text-slate-400">Entende bairro, preco, metragem, capacidade e comodidades</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder='Ex: sala no Calhau ate 4 mil com estacionamento'
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

                  {!!interpretationLabels.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-sm text-cyan-200">
                        {isAISearchLoading ? "IA analisando..." : "IA entendeu:"}
                      </span>
                      {interpretationLabels.slice(0, 5).map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-100"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {remoteResult?.summary && (
                    <p className="mt-3 text-sm text-slate-300">{remoteResult.summary}</p>
                  )}

                  <div className="mt-4 space-y-3">
                    {!!parsedSearch.normalizedQuery && filteredResults.slice(0, 4).map((property) => (
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
                            {!!getRemoteMatchReasons(remoteResult, property.id).length && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {getRemoteMatchReasons(remoteResult, property.id).slice(0, 2).map((reason) => (
                                  <span
                                    key={reason}
                                    className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-100"
                                  >
                                    bate com: {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-cyan-200">R$ {property.price.toLocaleString("pt-BR")}</div>
                        </div>
                      </button>
                    ))}

                    {!!parsedSearch.normalizedQuery && !filteredResults.length && (
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200">
                        Nenhum imovel encontrado para essa intencao. Tente mudar bairro, faixa de preco ou comodidades.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-slate-500 text-sm">Exemplos:</span>
                    {[
                      "Calhau ate 4 mil",
                      "Sala com estacionamento",
                      "Coworking para 8 pessoas",
                      "Ponta d'Areia com ar condicionado",
                    ].map((example) => (
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
