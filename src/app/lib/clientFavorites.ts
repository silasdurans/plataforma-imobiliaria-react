/**
 * Utilitários para favoritos do cliente. Salva, remove e consulta imóveis marcados no armazenamento local.
 */
import { getClientSession } from "./clientSession";

export const FAVORITES_EVENT = "grupo-sp-client-favorites:updated";

const getFavoritesKey = () => {
  const session = getClientSession();
  return session ? `grupo-sp-client-favorites:${session.id}` : null;
};

const emitFavoritesUpdate = () => {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
};

export const getFavoritePropertyIds = (): string[] => {
  const key = getFavoritesKey();

  if (!key) {
    return [];
  }

  const raw = localStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

export const isPropertyFavorite = (propertyId: string) =>
  getFavoritePropertyIds().includes(propertyId);

export const toggleFavoriteProperty = (propertyId: string) => {
  const key = getFavoritesKey();

  if (!key) {
    return false;
  }

  const favorites = getFavoritePropertyIds();
  const nextFavorites = favorites.includes(propertyId)
    ? favorites.filter((id) => id !== propertyId)
    : [propertyId, ...favorites];

  localStorage.setItem(key, JSON.stringify(nextFavorites));
  emitFavoritesUpdate();

  return nextFavorites.includes(propertyId);
};

export const removeFavoriteProperty = (propertyId: string) => {
  const key = getFavoritesKey();

  if (!key) {
    return;
  }

  localStorage.setItem(
    key,
    JSON.stringify(getFavoritePropertyIds().filter((id) => id !== propertyId)),
  );
  emitFavoritesUpdate();
};
