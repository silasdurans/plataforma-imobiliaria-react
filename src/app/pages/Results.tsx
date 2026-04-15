import { Grid, List, Map as MapIcon, Filter, X, Building2, Users, Maximize2, Coffee, Wifi, Car, Shield, Zap, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { AIAgent } from "../components/AIAgent";
import { Footer } from "../components/Footer";
import { PropertyCard } from "../components/PropertyCard";
import { MapSection } from "../components/common/MapSection";
import { useProperties } from "../../data/properties";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const extractNeighborhood = (location: string) => location.split(",")[0]?.trim() ?? location;
const extractCity = (location: string) => location.split(",")[1]?.replace("- MA", "").trim() ?? location;

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const properties = useProperties();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

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

  const normalizedQuery = normalizeText(searchQuery.trim());

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const matches = new Set<string>();

    properties.forEach((property) => {
      [property.title, extractNeighborhood(property.location), extractCity(property.location)].forEach((term) => {
        if (normalizeText(term).includes(normalizedQuery)) {
          matches.add(term);
        }
      });
    });

    return Array.from(matches).slice(0, 6);
  }, [normalizedQuery, properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        !normalizedQuery ||
        normalizeText(
          `${property.title} ${property.location} ${extractNeighborhood(property.location)} ${extractCity(property.location)}`,
        ).includes(normalizedQuery);

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

      return matchesSearch && matchesType && matchesAmenities;
    });
  }, [amenities, normalizedQuery, properties, selectedAmenities, selectedTypes]);

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

  const activeFiltersCount = selectedTypes.length + selectedAmenities.length + (normalizedQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />

      <div className="bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
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
                  placeholder="Busque por nome, cidade ou bairro"
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
                      onClick={() => handleSearchSubmit(suggestion)}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 mb-6 sticky top-20 z-40 backdrop-blur-lg bg-white/95"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters((current) => !current)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium ${
                  showFilters
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Filter className="size-4" />
                Filtros
                {!!activeFiltersCount && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeFiltersCount}</span>}
              </button>

              {!!activeFiltersCount && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedAmenities([]);
                    setSearchQuery("");
                    setSearchParams({});
                  }}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 hover:bg-slate-200"
                >
                  <X className="size-4" />
                  Limpar
                </button>
              )}
            </div>

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

          {showFilters && (
            <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 lg:grid-cols-2">
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
            </div>
          )}
        </motion.div>

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
                    <PropertyCard {...property} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AIAgent />
      <Footer />
    </div>
  );
}
