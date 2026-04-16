import type { Property } from "../../data/properties";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const extractNeighborhood = (location: string) => location.split(",")[0]?.trim() ?? location;
export const extractCity = (location: string) => location.split(",")[1]?.replace(/-\s*[A-Z]{2}$/i, "").trim() ?? location;

type ParsedSearch = {
  rawQuery: string;
  normalizedQuery: string;
  maxPrice?: number;
  minPrice?: number;
  minSize?: number;
  minCapacity?: number;
  locationTerms: string[];
  amenityTerms: string[];
  keywordTerms: string[];
  labels: string[];
};

export type RankedProperty = {
  property: Property;
  score: number;
  reasons: string[];
};

export type RemoteAISearchResult = {
  provider: string;
  model: string;
  labels: string[];
  propertyIds: string[];
  summary: string;
  matchReasons?: Array<{
    propertyId: string;
    reasons: string[];
  }>;
};

export type AIStatus = {
  available: boolean;
  provider: string;
  model: string;
  message: string;
};

const stopWords = new Set([
  "a",
  "ao",
  "ate",
  "com",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "e",
  "em",
  "na",
  "no",
  "nos",
  "nas",
  "ou",
  "para",
  "por",
  "pra",
  "procuro",
  "quero",
  "busco",
  "buscar",
  "preciso",
  "uma",
  "um",
  "sala",
  "salas",
  "comercial",
  "comerciais",
  "espaco",
  "escritorio",
  "imovel",
  "imoveis",
]);

const amenityAliases = [
  { id: "wifi", label: "Wi-Fi", terms: ["wifi", "wi-fi", "internet", "fibra", "gigabit"] },
  { id: "parking", label: "Estacionamento", terms: ["estacionamento", "vaga", "vagas", "garagem"] },
  { id: "security", label: "Seguranca", terms: ["seguranca", "segurança", "portaria", "cftv", "controle de acesso"] },
  { id: "ac", label: "Ar-condicionado", terms: ["ar condicionado", "climatizado", "climatizacao", "climatização"] },
  { id: "furnished", label: "Mobiliado", terms: ["mobiliado", "mobiliado", "moveis", "móveis"] },
  { id: "meeting", label: "Sala de reuniao", terms: ["reuniao", "reunião", "auditório", "auditorio"] },
  { id: "coffee", label: "Copa ou cafe", terms: ["copa", "cafe", "café"] },
  { id: "seaView", label: "Vista para o mar", terms: ["vista mar", "vista para o mar", "mar"] },
];

const parseNumericValue = (value: string, hasMilSuffix: boolean) => {
  const sanitized = value.replace(/\./g, "").replace(",", ".");
  const numericValue = Number(sanitized);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return hasMilSuffix ? numericValue * 1000 : numericValue;
};

const collectKnownLocations = (properties: Property[]) => {
  const knownTerms = new Set<string>();

  properties.forEach((property) => {
    knownTerms.add(extractNeighborhood(property.location));
    knownTerms.add(extractCity(property.location));
  });

  return Array.from(knownTerms);
};

export const parseNaturalSearch = (query: string, properties: Property[]): ParsedSearch => {
  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeText(trimmedQuery);
  const labels: string[] = [];

  if (!normalizedQuery) {
    return {
      rawQuery: trimmedQuery,
      normalizedQuery,
      locationTerms: [],
      amenityTerms: [],
      keywordTerms: [],
      labels,
    };
  }

  const maxPriceMatch = normalizedQuery.match(/(?:ate|no maximo|maximo|menos de)\s*(?:r\$?\s*)?(\d+(?:[.,]\d+)?)\s*(mil)?/i);
  const minPriceMatch = normalizedQuery.match(/(?:a partir de|acima de|mais de|minimo|minimo de)\s*(?:r\$?\s*)?(\d+(?:[.,]\d+)?)\s*(mil)?/i);
  const sizeMatch = normalizedQuery.match(/(\d+)\s*(?:m2|m²|metros|metro quadrado|metros quadrados)/i);
  const capacityMatch = normalizedQuery.match(/(\d+)\s*(?:pessoas|pessoa|lugares|postos)/i);

  const maxPrice = maxPriceMatch ? parseNumericValue(maxPriceMatch[1], Boolean(maxPriceMatch[2])) : undefined;
  const minPrice = minPriceMatch ? parseNumericValue(minPriceMatch[1], Boolean(minPriceMatch[2])) : undefined;
  const minSize = sizeMatch ? Number(sizeMatch[1]) : undefined;
  const minCapacity = capacityMatch ? Number(capacityMatch[1]) : undefined;

  if (maxPrice) {
    labels.push(`ate R$ ${maxPrice.toLocaleString("pt-BR")}`);
  }

  if (minPrice) {
    labels.push(`a partir de R$ ${minPrice.toLocaleString("pt-BR")}`);
  }

  if (minSize) {
    labels.push(`${minSize}m² ou mais`);
  }

  if (minCapacity) {
    labels.push(`${minCapacity}+ pessoas`);
  }

  const amenityTerms = amenityAliases
    .filter((amenity) => amenity.terms.some((term) => normalizedQuery.includes(normalizeText(term))))
    .map((amenity) => amenity.id);

  amenityTerms.forEach((amenityId) => {
    const amenity = amenityAliases.find((item) => item.id === amenityId);
    if (amenity) {
      labels.push(amenity.label);
    }
  });

  const locationTerms = collectKnownLocations(properties).filter((term) =>
    normalizedQuery.includes(normalizeText(term)),
  );

  locationTerms.forEach((term) => labels.push(term));

  const keywordTerms = normalizedQuery
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !stopWords.has(term))
    .filter((term, index, list) => list.indexOf(term) === index)
    .filter((term) => !locationTerms.some((locationTerm) => normalizeText(locationTerm).includes(term)));

  return {
    rawQuery: trimmedQuery,
    normalizedQuery,
    maxPrice,
    minPrice,
    minSize,
    minCapacity,
    locationTerms,
    amenityTerms,
    keywordTerms,
    labels,
  };
};

const matchesAmenity = (property: Property, amenityId: string) => {
  const featureText = normalizeText(`${property.features.join(" ")} ${property.description}`);
  const amenity = amenityAliases.find((item) => item.id === amenityId);

  return amenity ? amenity.terms.some((term) => featureText.includes(normalizeText(term))) : false;
};

export const rankPropertiesBySearch = (properties: Property[], query: string): RankedProperty[] => {
  const parsed = parseNaturalSearch(query, properties);

  if (!parsed.normalizedQuery) {
    return properties.map((property, index) => ({
      property,
      score: Math.max(1, properties.length - index),
      reasons: [],
    }));
  }

  return properties
    .map((property) => {
      let score = 0;
      const reasons: string[] = [];

      const searchableText = normalizeText(
        [
          property.title,
          property.type,
          property.location,
          extractNeighborhood(property.location),
          extractCity(property.location),
          property.description,
          property.features.join(" "),
        ].join(" "),
      );

      if (searchableText.includes(parsed.normalizedQuery)) {
        score += 90;
        reasons.push("texto exato");
      }

      if (parsed.maxPrice) {
        if (property.price <= parsed.maxPrice) {
          score += 35;
          reasons.push("faixa de preco");
        } else {
          score -= 30;
        }
      }

      if (parsed.minPrice) {
        if (property.price >= parsed.minPrice) {
          score += 15;
        } else {
          score -= 20;
        }
      }

      if (parsed.minSize) {
        if (property.size >= parsed.minSize) {
          score += 20;
          reasons.push("metragem");
        } else {
          score -= 25;
        }
      }

      if (parsed.minCapacity) {
        if (property.capacity >= parsed.minCapacity) {
          score += 20;
          reasons.push("capacidade");
        } else {
          score -= 25;
        }
      }

      parsed.locationTerms.forEach((term) => {
        if (searchableText.includes(normalizeText(term))) {
          score += 45;
          reasons.push("localizacao");
        }
      });

      parsed.amenityTerms.forEach((amenityId) => {
        if (matchesAmenity(property, amenityId)) {
          score += 28;
          reasons.push("comodidades");
        } else {
          score -= 10;
        }
      });

      parsed.keywordTerms.forEach((term) => {
        if (searchableText.includes(term)) {
          score += 14;
        }
      });

      score += Math.round(property.rating * 2);

      const hasStructuredCriteria =
        Boolean(parsed.locationTerms.length) ||
        Boolean(parsed.amenityTerms.length) ||
        Boolean(parsed.maxPrice) ||
        Boolean(parsed.minPrice) ||
        Boolean(parsed.minSize) ||
        Boolean(parsed.minCapacity);

      const matchesFreeText =
        parsed.keywordTerms.length === 0 || parsed.keywordTerms.some((term) => searchableText.includes(term));

      const matchesStructuredCriteria =
        (!parsed.maxPrice || property.price <= parsed.maxPrice) &&
        (!parsed.minPrice || property.price >= parsed.minPrice) &&
        (!parsed.minSize || property.size >= parsed.minSize) &&
        (!parsed.minCapacity || property.capacity >= parsed.minCapacity) &&
        parsed.locationTerms.every((term) => searchableText.includes(normalizeText(term))) &&
        parsed.amenityTerms.every((amenityId) => matchesAmenity(property, amenityId));

      if (matchesStructuredCriteria && matchesFreeText) {
        score += 25;
      }

      if (!hasStructuredCriteria && !matchesFreeText && !searchableText.includes(parsed.normalizedQuery)) {
        score = 0;
      }

      return {
        property,
        score,
        reasons: Array.from(new Set(reasons)),
      };
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score);
};

export const buildSearchSuggestions = (properties: Property[], query: string) => {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return [];
  }

  const suggestions = new Set<string>();

  properties.forEach((property) => {
    [
      property.title,
      extractNeighborhood(property.location),
      extractCity(property.location),
      ...property.features,
    ].forEach((term) => {
      if (normalizeText(term).includes(normalizedQuery)) {
        suggestions.add(term);
      }
    });
  });

  amenityAliases.forEach((amenity) => {
    if (amenity.terms.some((term) => normalizeText(term).includes(normalizedQuery))) {
      suggestions.add(amenity.label);
    }
  });

  return Array.from(suggestions).slice(0, 6);
};

export const applyRemoteSearchRanking = (properties: Property[], result: RemoteAISearchResult | null) => {
  if (!result?.propertyIds.length) {
    return null;
  }

  const propertyMap = new Map(properties.map((property) => [property.id, property]));
  const ranked = result.propertyIds
    .map((id) => propertyMap.get(id))
    .filter((property): property is Property => Boolean(property));

  return ranked.length ? ranked : null;
};

export const getRemoteMatchReasons = (result: RemoteAISearchResult | null, propertyId: string) =>
  result?.matchReasons?.find((item) => item.propertyId === propertyId)?.reasons ?? [];

export const getAISearchStatus = async (): Promise<AIStatus> => {
  const response = await fetch(`${API_BASE_URL}/api/health/ai`);

  if (!response.ok) {
    return (await response.json()) as AIStatus;
  }

  return (await response.json()) as AIStatus;
};

export const searchPropertiesWithAI = async (query: string): Promise<RemoteAISearchResult | null> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/ai-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: trimmedQuery }),
  });

  if (!response.ok) {
    throw new Error("AI search unavailable");
  }

  return (await response.json()) as RemoteAISearchResult;
};
