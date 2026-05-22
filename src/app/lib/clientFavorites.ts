const FAVORITES_KEY_PREFIX = "grupo-sp-client-favorites:";
export const FAVORITES_EVENT = "grupo-sp-client-favorites:updated";

const emitFavoritesUpdate = () => {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
};

const getSessionEmail = (): string => {
  try {
    const stored = localStorage.getItem("grupo-sp-client-session");
    if (stored) {
      const session = JSON.parse(stored) as { email: string };
      return session.email;
    }
  } catch {
    // ignore
  }
  return "anonymous";
};

const getFavoritesKey = () => `${FAVORITES_KEY_PREFIX}${getSessionEmail()}`;

export const getFavoritePropertyIds = async (): Promise<string[]> => {
  try {
    const stored = localStorage.getItem(getFavoritesKey());
    if (stored) return JSON.parse(stored) as string[];
  } catch {
    // ignore
  }
  return [];
};

export const isPropertyFavorite = async (propertyId: string) =>
  (await getFavoritePropertyIds()).includes(propertyId);

export const toggleFavoriteProperty = async (propertyId: string): Promise<boolean> => {
  const favorites = await getFavoritePropertyIds();
  const isFav = favorites.includes(propertyId);
  const updated = isFav
    ? favorites.filter((id) => id !== propertyId)
    : [...favorites, propertyId];
  localStorage.setItem(getFavoritesKey(), JSON.stringify(updated));
  emitFavoritesUpdate();
  return !isFav;
};

export const removeFavoriteProperty = async (propertyId: string) => {
  const favorites = (await getFavoritePropertyIds()).filter((id) => id !== propertyId);
  localStorage.setItem(getFavoritesKey(), JSON.stringify(favorites));
  emitFavoritesUpdate();
};
