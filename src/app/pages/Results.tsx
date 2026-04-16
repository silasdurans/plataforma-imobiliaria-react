/**
 * Página de resultados da busca. Filtra os imóveis e apresenta a listagem conforme os critérios informados.
 */
import { Grid, List, Map as MapIcon, Filter, X, Building2, Users, Maximize2, Coffee, Wifi, Car, Shield, Zap, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { AIAgent } from "../components/AIAgent";
import { Footer } from "../components/Footer";
import { PropertyCard } from "../components/PropertyCard";
import { MapSection } from "../components/common/MapSection";
import { useProperties } from "../../data/properties";
import {
  applyRemoteSearchRanking,
  buildSearchSuggestions,
  getAISearchStatus,
  getRemoteMatchReasons,
  normalizeText,
  parseNaturalSearch,
  rankPropertiesBySearch,
  searchPropertiesWithAI,
  type AIStatus,
  type RemoteAISearchResult,
} from "../lib/aiSearch";

const getBounds = (values: number[], fallback: [number, number]) =>
  values.length
    ? { min: Math.min(...values), max: Math.max(...values) }
    : { min: fallback[0], max: fallback[1] };

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const properties = useProperties();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [remoteResult, setRemoteResult] = useState<RemoteAISearchResult | null>(null);
  const [isAISearchLoading, setIsAISearchLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);

  const propertyTypes = [
    { id: "escritorio", label: "Escritório", icon: Building2 },
    { id: "coworking", label: "Coworking", icon: Users },
    { id: "sala", label: "Sala Comercial", icon: Maximize2 },
    { id: "loja", label: "Loja", icon: Coffee },
  ];

  const amenities = [
    { id: "wifi", label: "Wi-Fi", icon: Wifi, keywords: ["wi-fi", "internet"] },
    { id: "parking", label: "Estacionamento", icon: Car, keywords: ["estacionamento", "vaga", "vagas"] },
    { id: "security", label: "Segurança", icon: Shield, keywords: ["segurança", "cftv", "portaria"] },
    { id: "ac", label: "Ar Condicionado", icon: Zap, keywords: ["ar condicionado", "climatizado"] },
  ];

  const priceBounds = useMemo(() => getBounds(properties.map((property) => property.price), [0, 10000]), [properties]);
  const sizeBounds = useMemo(() => getBounds(properties.map((property) => property.size), [0, 200]), [properties]);
  const capacityBounds = useMemo(() => getBounds(properties.map((property) => property.capacity), [1, 30]), [properties]);

  const [priceRange, setPriceRange] = useState<[number, number]>([priceBounds.min, priceBounds.max]);
  const [sizeRange, setSizeRange] = useState<[number, number]>([sizeBounds.min, sizeBounds.max]);
  const [capacityRange, setCapacityRange] = useState<[number, number]>([
    capacityBounds.min,
    capacityBounds.max,
  ]);

  useEffect(() => {
    setPriceRange((current) => {
      const min = Math.max(priceBounds.min, Math.min(current[0], priceBounds.max));
      const max = Math.max(priceBounds.min, Math.min(current[1], priceBounds.max));
      return [Math.min(min, max), Math.max(min, max)];
    });
    setSizeRange((current) => {
      const min = Math.max(sizeBounds.min, Math.min(current[0], sizeBounds.max));
      const max = Math.max(sizeBounds.min, Math.min(current[1], sizeBounds.max));
      return [Math.min(min, max), Math.max(min, max)];
    });
    setCapacityRange((current) => {
      const min = Math.max(capacityBounds.min, Math.min(current[0], capacityBounds.max));
      const max = Math.max(capacityBounds.min, Math.min(current[1], capacityBounds.max));
      return [Math.min(min, max), Math.max(min, max)];
    });
  }, [capacityBounds.max, capacityBounds.min, priceBounds.max, priceBounds.min, sizeBounds.max, sizeBounds.min]);

  const normalizedQuery = normalizeText(searchQuery.trim());
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

  const suggestions = useMemo(() => buildSearchSuggestions(properties, searchQuery), [properties, searchQuery]);
  const interpretationLabels = remoteResult?.labels?.length ? remoteResult.labels : parsedSearch.labels;

  const filteredProperties = useMemo(() => {
    const remoteRanked = applyRemoteSearchRanking(properties, remoteResult);
    const localRanked = rankPropertiesBySearch(properties, searchQuery).map((item) => item.property);
    const baseProperties = normalizedQuery ? remoteRanked ?? localRanked : properties;

    return baseProperties.filter((property) => {
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => normalizeText(property.type).includes(type));

      const featuresText = normalizeText(property.features.join(" "));
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenityId) =>
          amenities
            .find((item) => item.id === amenityId)
            ?.keywords.some((keyword) => featuresText.includes(normalizeText(keyword))),
        );

      const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchesSize = property.size >= sizeRange[0] && property.size <= sizeRange[1];
      const matchesCapacity =
        property.capacity >= capacityRange[0] && property.capacity <= capacityRange[1];

      return matchesType && matchesAmenities && matchesPrice && matchesSize && matchesCapacity;
    });
  }, [
    amenities,
    capacityRange,
    normalizedQuery,
    priceRange,
    properties,
    remoteResult,
    searchQuery,
    selectedAmenities,
    selectedTypes,
    sizeRange,
  ]);

  const handleSearchSubmit = (query = searchQuery) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    setSearchParams(trimmedQuery ? { q: trimmedQuery } : {});
  };

  const toggleValue = (list: string[], setList: Dispatch<SetStateAction<string[]>>, value: string) => {
    setList((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const activeFiltersCount =
    selectedTypes.length +
    selectedAmenities.length +
    Number(priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max) +
    Number(sizeRange[0] !== sizeBounds.min || sizeRange[1] !== sizeBounds.max) +
    Number(capacityRange[0] !== capacityBounds.min || capacityRange[1] !== capacityBounds.max) +
    (normalizedQuery ? 1 : 0);

  const handleRangeChange = (
    value: number,
    setRange: Dispatch<SetStateAction<[number, number]>>,
    index: 0 | 1,
  ) => {
    setRange((current) => {
      if (index === 0) {
        return [Math.min(value, current[1]), current[1]];
      }
      return [current[0], Math.max(value, current[0])];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />

      <div className="bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          {aiStatus && !aiStatus.available && (
            <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 backdrop-blur-sm">
              IA local indisponivel no momento. {aiStatus.message} Os resultados abaixo usam a busca local como fallback.
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-5 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Busca Inteligente com IA</span>
            </div>
            <h1 className="text-3xl sm:text-5xl mb-3 text-white">Espaços Comerciais</h1>
            <p className="text-slate-300 text-base sm:text-lg mb-6">
              {filteredProperties.length} resultados para sua pesquisa
            </p>

            <div className="max-w-3xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearchSubmit()}
                  placeholder="Ex: sala no Calhau ate 4 mil com estacionamento"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/95 px-5 py-4 text-[#0F172A] outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600"
                >
                  Buscar
                </button>
              </div>

              {!!suggestions.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearchSubmit(suggestion);
                      }}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {!!interpretationLabels.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-cyan-200">
                    {isAISearchLoading ? "IA analisando..." : "IA entendeu:"}
                  </span>
                  {interpretationLabels.slice(0, 6).map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-100"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {remoteResult?.summary && (
                <p className="mt-3 text-sm text-slate-300">{remoteResult.summary}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-slate-600" />
                  <h2 className="text-base font-semibold text-[#0F172A]">Filtros</h2>
                </div>
                {!!activeFiltersCount && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Tipo</p>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      const isActive = selectedTypes.includes(normalizeText(type.id));

                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleValue(selectedTypes, setSelectedTypes, normalizeText(type.id))}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                            isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Icon className="size-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Comodidades</p>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      const isActive = selectedAmenities.includes(amenity.id);

                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleValue(selectedAmenities, setSelectedAmenities, amenity.id)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                            isActive ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Icon className="size-4" />
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Faixa de aluguel</p>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                      <span>R$ {priceRange[0].toLocaleString("pt-BR")}</span>
                      <span>R$ {priceRange[1].toLocaleString("pt-BR")}</span>
                    </div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={100}
                      value={priceRange[0]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setPriceRange, 0)}
                      className="w-full accent-emerald-600"
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={100}
                      value={priceRange[1]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setPriceRange, 1)}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Metragem</p>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                      <span>{sizeRange[0]} m²</span>
                      <span>{sizeRange[1]} m²</span>
                    </div>
                    <input
                      type="range"
                      min={sizeBounds.min}
                      max={sizeBounds.max}
                      step={1}
                      value={sizeRange[0]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setSizeRange, 0)}
                      className="w-full accent-indigo-600"
                    />
                    <input
                      type="range"
                      min={sizeBounds.min}
                      max={sizeBounds.max}
                      step={1}
                      value={sizeRange[1]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setSizeRange, 1)}
                      className="mt-2 w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Capacidade</p>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                      <span>{capacityRange[0]} pessoas</span>
                      <span>{capacityRange[1]} pessoas</span>
                    </div>
                    <input
                      type="range"
                      min={capacityBounds.min}
                      max={capacityBounds.max}
                      step={1}
                      value={capacityRange[0]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setCapacityRange, 0)}
                      className="w-full accent-violet-600"
                    />
                    <input
                      type="range"
                      min={capacityBounds.min}
                      max={capacityBounds.max}
                      step={1}
                      value={capacityRange[1]}
                      onChange={(event) => handleRangeChange(Number(event.target.value), setCapacityRange, 1)}
                      className="mt-2 w-full accent-violet-600"
                    />
                  </div>
                </div>
              </div>

              {!!activeFiltersCount && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedAmenities([]);
                    setPriceRange([priceBounds.min, priceBounds.max]);
                    setSizeRange([sizeBounds.min, sizeBounds.max]);
                    setCapacityRange([capacityBounds.min, capacityBounds.max]);
                    setSearchQuery("");
                    setSearchParams({});
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 hover:bg-slate-200"
                >
                  <X className="size-4" />
                  Limpar filtros
                </button>
              )}
            </div>
          </motion.aside>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <button
                    onClick={() => setShowFilters((current) => !current)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all ${
                      showFilters
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Filter className="size-4" />
                    Filtros
                    {!!activeFiltersCount && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeFiltersCount}</span>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-600">
                  {filteredProperties.length} imovel(is) encontrado(s)
                </p>

                <div className="flex items-center gap-2">
                  {[
                    { id: "grid", icon: Grid },
                    { id: "list", icon: List },
                    { id: "map", icon: MapIcon },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isActive = viewMode === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setViewMode(option.id as "grid" | "list" | "map")}
                        className={`rounded-xl p-3 transition-colors ${
                          isActive ? "bg-[#0F172A] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <Icon className="size-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {showFilters && (
              <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden">
                <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg text-[#0F172A]">Filtros</h2>
                      <p className="text-sm text-slate-500">Refine sua busca sem poluir a tela</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="rounded-full bg-slate-100 p-2 text-slate-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Tipo</p>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map((type) => {
                          const Icon = type.icon;
                          const isActive = selectedTypes.includes(normalizeText(type.id));

                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => toggleValue(selectedTypes, setSelectedTypes, normalizeText(type.id))}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Icon className="size-4" />
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Comodidades</p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity) => {
                          const Icon = amenity.icon;
                          const isActive = selectedAmenities.includes(amenity.id);

                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggleValue(selectedAmenities, setSelectedAmenities, amenity.id)}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                                isActive ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Icon className="size-4" />
                              {amenity.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Faixa de aluguel</p>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                          <span>R$ {priceRange[0].toLocaleString("pt-BR")}</span>
                          <span>R$ {priceRange[1].toLocaleString("pt-BR")}</span>
                        </div>
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step={100}
                          value={priceRange[0]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setPriceRange, 0)}
                          className="w-full accent-emerald-600"
                        />
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step={100}
                          value={priceRange[1]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setPriceRange, 1)}
                          className="mt-2 w-full accent-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Metragem</p>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{sizeRange[0]} m²</span>
                          <span>{sizeRange[1]} m²</span>
                        </div>
                        <input
                          type="range"
                          min={sizeBounds.min}
                          max={sizeBounds.max}
                          step={1}
                          value={sizeRange[0]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setSizeRange, 0)}
                          className="w-full accent-indigo-600"
                        />
                        <input
                          type="range"
                          min={sizeBounds.min}
                          max={sizeBounds.max}
                          step={1}
                          value={sizeRange[1]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setSizeRange, 1)}
                          className="mt-2 w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Capacidade</p>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{capacityRange[0]} pessoas</span>
                          <span>{capacityRange[1]} pessoas</span>
                        </div>
                        <input
                          type="range"
                          min={capacityBounds.min}
                          max={capacityBounds.max}
                          step={1}
                          value={capacityRange[0]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setCapacityRange, 0)}
                          className="w-full accent-violet-600"
                        />
                        <input
                          type="range"
                          min={capacityBounds.min}
                          max={capacityBounds.max}
                          step={1}
                          value={capacityRange[1]}
                          onChange={(event) => handleRangeChange(Number(event.target.value), setCapacityRange, 1)}
                          className="mt-2 w-full accent-violet-600"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTypes([]);
                          setSelectedAmenities([]);
                          setPriceRange([priceBounds.min, priceBounds.max]);
                          setSizeRange([sizeBounds.min, sizeBounds.max]);
                          setCapacityRange([capacityBounds.min, capacityBounds.max]);
                          setSearchQuery("");
                          setSearchParams({});
                        }}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                      >
                        Limpar filtros
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm text-white shadow-lg shadow-cyan-200"
                      >
                        Ver salas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "map" ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <MapSection
                  title="Nossa Localização"
                  cityOptions={[
                    { label: "São Luís", query: "Sao Luis, Maranhao, Brasil" },
                    { label: "Centro", query: "Centro, Sao Luis, Maranhao, Brasil" },
                    { label: "Renascença", query: "Renascenca, Sao Luis, Maranhao, Brasil" },
                    { label: "Calhau", query: "Calhau, Sao Luis, Maranhao, Brasil" },
                  ]}
                />
              </motion.div>
            ) : (
              <>
                {!filteredProperties.length && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                    Nenhum imóvel encontrado
                  </div>
                )}

                {!!filteredProperties.length && (
                  <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                    {filteredProperties.map((property, index) => (
                      <motion.div key={property.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                        <PropertyCard {...property} matchReasons={getRemoteMatchReasons(remoteResult, property.id)} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AIAgent />
      <Footer />
    </div>
  );
}
