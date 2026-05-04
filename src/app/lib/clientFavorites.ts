/**
 * Utilitários de favoritos do cliente via backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const FAVORITES_EVENT = "grupo-sp-client-favorites:updated";

const emitFavoritesUpdate = () => {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Erro ao acessar ${path}`;

    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {
      // Mantém o texto bruto se não vier JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const getFavoritePropertyIds = async (): Promise<string[]> => {
  try {
    return await apiRequest<string[]>("/api/client/favorites");
  } catch {
    return [];
  }
};

export const isPropertyFavorite = async (propertyId: string) =>
  (await getFavoritePropertyIds()).includes(propertyId);

export const toggleFavoriteProperty = async (propertyId: string) => {
  const result = await apiRequest<{ favorite: boolean }>(`/api/client/favorites/${propertyId}`, {
    method: "POST",
  });

  emitFavoritesUpdate();
  return result.favorite;
};

export const removeFavoriteProperty = async (propertyId: string) => {
  await apiRequest(`/api/client/favorites/${propertyId}`, {
    method: "DELETE",
  });

  emitFavoritesUpdate();
};
