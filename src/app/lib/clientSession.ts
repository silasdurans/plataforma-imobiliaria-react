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

interface StoredUser extends ClientUser {
  password: string;
}

const SESSION_KEY = "grupo-sp-client-session";
const USERS_KEY = "grupo-sp-client-users";

const loadUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored) as StoredUser[];
  } catch {
    // ignore
  }
  return [];
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const fetchClientSession = async (): Promise<ClientUser | null> => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored) as ClientUser;
  } catch {
    // ignore
  }
  return null;
};

export const registerClient = async (input: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<ClientUser> => {
  const users = loadUsers();
  if (users.some((u) => u.email === input.email)) {
    throw new Error("E-mail já cadastrado.");
  }
  const user: StoredUser = {
    id: `client-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    phone: input.phone,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  const { password: _pw, ...session } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const loginClient = async (input: {
  email: string;
  password: string;
}): Promise<ClientUser> => {
  const users = loadUsers();
  const user = users.find((u) => u.email === input.email && u.password === input.password);
  if (!user) throw new Error("E-mail ou senha incorretos.");
  const { password: _pw, ...session } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const clearClientSession = async () => {
  localStorage.removeItem(SESSION_KEY);
};

export const updateCurrentClientUser = async (updates: Partial<ClientUser>): Promise<ClientUser> => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) throw new Error("Nenhuma sessão ativa.");
  const current = JSON.parse(stored) as ClientUser;
  const updated = { ...current, ...updates };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === current.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
  return updated;
};

export const clearLegacyBrowserData = () => {
  // no-op: dados já estão no localStorage, nada para limpar
};
