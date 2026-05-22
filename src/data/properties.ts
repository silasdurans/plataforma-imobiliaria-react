import { useEffect, useState } from "react";
import { properties as seedProperties } from "../app/data/properties";

const PROPERTIES_EVENT = "grupo-sp-properties:updated";
const STORAGE_KEY = "grupo-sp-properties";
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

const dispatchPropertiesEvent = () => {
  window.dispatchEvent(new Event(PROPERTIES_EVENT));
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

const loadFromStorage = (): Property[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Property[];
  } catch {
    // ignore parse errors
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProperties));
  return defaultProperties;
};

const saveToStorage = (properties: Property[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

export const renderizarImoveis = (): Property[] =>
  loadFromStorage().sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

export const getAllProperties = async (): Promise<Property[]> => loadFromStorage();

export const getPropertyById = async (id: string): Promise<Property | undefined> =>
  loadFromStorage().find((p) => p.id === id);

export const addProperty = async (
  property: Omit<Property, "id" | "created_at" | "updated_at">,
): Promise<string> => {
  const properties = loadFromStorage();
  const now = new Date().toISOString();
  const created = normalizeProperty({ ...property, created_at: now, updated_at: now });
  properties.unshift(created);
  saveToStorage(properties);
  dispatchPropertiesEvent();
  return created.id;
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<void> => {
  const properties = loadFromStorage();
  const index = properties.findIndex((p) => p.id === id);
  if (index !== -1) {
    properties[index] = normalizeProperty({
      ...properties[index],
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    });
    saveToStorage(properties);
    dispatchPropertiesEvent();
  }
};

export const deleteProperty = async (id: string): Promise<void> => {
  saveToStorage(loadFromStorage().filter((p) => p.id !== id));
  dispatchPropertiesEvent();
};

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const syncProperties = () => {
      setProperties(loadFromStorage());
    };

    syncProperties();
    window.addEventListener(PROPERTIES_EVENT, syncProperties);

    return () => {
      window.removeEventListener(PROPERTIES_EVENT, syncProperties);
    };
  }, []);

  return properties;
};

export const initializeDatabase = async (): Promise<void> => {
  loadFromStorage();
};
