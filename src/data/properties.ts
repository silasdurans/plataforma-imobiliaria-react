import { useEffect, useState } from "react";
import { properties as seedProperties } from "../app/data/properties";

const STORAGE_KEY = "grupo-sp-properties";
const STORAGE_EVENT = "grupo-sp-properties:updated";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  size: number;
  capacity: number;
  rating: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: "disponivel" | "vendido" | "alugado";
  created_at?: string;
  updated_at?: string;
}

type PropertyDraft = Partial<Property> &
  Pick<Property, "title" | "description" | "price" | "location">;

const isBrowser = () => typeof window !== "undefined";

const dispatchPropertiesEvent = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
};

const normalizeProperty = (property: Partial<Property>, index = 0): Property => {
  const mainImage = property.image || property.images?.[0] || DEFAULT_IMAGE;
  const size = Number(property.size ?? property.area ?? 60);
  const capacity = Number(property.capacity ?? property.bedrooms ?? 4);
  const bedrooms = Number(property.bedrooms ?? Math.max(1, Math.round(capacity / 2)));
  const bathrooms = Number(property.bathrooms ?? Math.max(1, Math.round(size / 40)));
  const timestamp = property.created_at ?? new Date().toISOString();

  return {
    id: property.id ?? `${Date.now()}-${index}`,
    title: property.title?.trim() || "Imovel sem titulo",
    type: property.type?.trim() || "Imovel",
    price: Number(property.price ?? 0),
    location: property.location?.trim() || "Localizacao nao informada",
    size,
    capacity,
    rating: Number(property.rating ?? 4.7),
    image: mainImage,
    images:
      property.images?.filter((image) => image.trim())?.length
        ? property.images.filter((image) => image.trim())
        : [mainImage],
    description: property.description?.trim() || "Descricao nao informada.",
    features:
      property.features?.length
        ? property.features
        : ["Imagem principal cadastrada", "Disponivel para consulta"],
    lat: Number(property.lat ?? -2.5297),
    lng: Number(property.lng ?? -44.3028),
    bedrooms,
    bathrooms,
    area: Number(property.area ?? size),
    status: property.status ?? "disponivel",
    created_at: timestamp,
    updated_at: property.updated_at ?? timestamp,
  };
};

const defaultProperties: Property[] = seedProperties.map((property, index) =>
  normalizeProperty(
    {
      ...property,
      area: property.size,
      bedrooms: Math.max(1, Math.round(property.capacity / 2)),
      bathrooms: Math.max(1, Math.round(property.size / 40)),
      status: "disponivel",
    },
    index,
  ),
);

const cacheProperties = (properties: Property[], shouldDispatch = false) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  if (shouldDispatch) {
    dispatchPropertiesEvent();
  }
};

const loadCachedProperties = (): Property[] => {
  if (!isBrowser()) {
    return defaultProperties;
  }

  const storedProperties = localStorage.getItem(STORAGE_KEY);

  if (!storedProperties) {
    cacheProperties(defaultProperties);
    return defaultProperties;
  }

  try {
    const parsedProperties = JSON.parse(storedProperties) as Partial<Property>[];
    return parsedProperties.map((property, index) => normalizeProperty(property, index));
  } catch {
    cacheProperties(defaultProperties);
    return defaultProperties;
  }
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ao acessar ${path}`);
  }

  return (await response.json()) as T;
};

export const renderizarImoveis = (): Property[] =>
  loadCachedProperties().sort((first, second) =>
    (second.created_at ?? "").localeCompare(first.created_at ?? ""),
  );

export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const properties = (await apiRequest<Partial<Property>[]>("/api/properties")).map((property, index) =>
      normalizeProperty(property, index),
    );
    cacheProperties(properties);
    return properties;
  } catch {
    return renderizarImoveis();
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  try {
    const property = await apiRequest<Partial<Property>>(`/api/properties/${id}`);
    return normalizeProperty(property);
  } catch {
    return renderizarImoveis().find((property) => property.id === id);
  }
};

export const addProperty = async (property: Omit<Property, "id" | "created_at" | "updated_at">): Promise<string> => {
  const payload = normalizeProperty(property);

  try {
    const created = normalizeProperty(
      await apiRequest<Partial<Property>>("/api/properties", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    const current = renderizarImoveis().filter((item) => item.id !== created.id);
    cacheProperties([created, ...current], true);
    return created.id;
  } catch {
    const fallbackCreated = normalizeProperty({ ...payload, id: crypto.randomUUID() });
    cacheProperties([fallbackCreated, ...renderizarImoveis()], true);
    return fallbackCreated.id;
  }
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<void> => {
  try {
    const updated = normalizeProperty(
      await apiRequest<Partial<Property>>(`/api/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...updates, id }),
      }),
    );
    const next = renderizarImoveis().map((property) => (property.id === id ? updated : property));
    cacheProperties(next, true);
  } catch {
    const updatedProperties = renderizarImoveis().map((property) =>
      property.id === id
        ? normalizeProperty({
            ...property,
            ...updates,
            id,
            updated_at: new Date().toISOString(),
          })
        : property,
    );
    cacheProperties(updatedProperties, true);
  }
};

export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await apiRequest(`/api/properties/${id}`, { method: "DELETE" });
  } finally {
    const filteredProperties = renderizarImoveis().filter((property) => property.id !== id);
    cacheProperties(filteredProperties, true);
  }
};

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>(() => renderizarImoveis());

  useEffect(() => {
    const syncProperties = async () => {
      setProperties(await getAllProperties());
    };

    syncProperties();
    window.addEventListener(STORAGE_EVENT, syncProperties);
    window.addEventListener("storage", syncProperties);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncProperties);
      window.removeEventListener("storage", syncProperties);
    };
  }, []);

  return properties;
};

export const initializeDatabase = async (): Promise<void> => {
  await getAllProperties();
};
