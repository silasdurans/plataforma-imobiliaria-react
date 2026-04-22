/**
 * Utilitários de autenticação do cliente via backend.
 * A fonte de verdade agora está no servidor, sem persistência local no navegador.
 */
export interface ClientSession {
  id: string;
  name: string;
  email: string;
}

export interface ClientUser extends ClientSession {
  phone?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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
      // Mantém o texto original quando a resposta não vem em JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const fetchClientSession = async (): Promise<ClientUser | null> => {
  try {
    return await apiRequest<ClientUser>("/api/client/session");
  } catch {
    return null;
  }
};

export const registerClient = async (input: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<ClientUser> =>
  apiRequest<ClientUser>("/api/client/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const loginClient = async (input: {
  email: string;
  password: string;
}): Promise<ClientUser> =>
  apiRequest<ClientUser>("/api/client/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const clearClientSession = async () => {
  await apiRequest("/api/client/logout", { method: "POST" });
};

export const updateCurrentClientUser = async (updates: Partial<ClientUser>) =>
  apiRequest<ClientUser>("/api/client/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const clearLegacyBrowserData = () => {
  const legacyKeys = [
    "grupo-sp-client-users",
    "grupo-sp-client-session",
    "grupo-sp-properties",
    "grupo-sp-schedules",
    "admin_authenticated",
  ];

  legacyKeys.forEach((key) => localStorage.removeItem(key));

  Object.keys(localStorage)
    .filter((key) => key.startsWith("grupo-sp-client-favorites:"))
    .forEach((key) => localStorage.removeItem(key));
};
