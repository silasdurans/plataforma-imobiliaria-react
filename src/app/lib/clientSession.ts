export interface ClientSession {
  id: string;
  name: string;
  email: string;
}

export interface ClientUser extends ClientSession {
  password: string;
  createdAt: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export const CLIENT_USERS_STORAGE_KEY = "grupo-sp-client-users";
export const CLIENT_SESSION_STORAGE_KEY = "grupo-sp-client-session";

export const getClientSession = (): ClientSession | null => {
  const raw = localStorage.getItem(CLIENT_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ClientSession;
  } catch {
    return null;
  }
};

export const saveClientSession = (session: ClientSession) => {
  localStorage.setItem(CLIENT_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearClientSession = () => {
  localStorage.removeItem(CLIENT_SESSION_STORAGE_KEY);
};

export const getClientUsers = (): ClientUser[] => {
  const raw = localStorage.getItem(CLIENT_USERS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ClientUser[];
  } catch {
    return [];
  }
};

export const saveClientUsers = (users: ClientUser[]) => {
  localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentClientUser = (): ClientUser | null => {
  const session = getClientSession();

  if (!session) {
    return null;
  }

  return getClientUsers().find((user) => user.id === session.id) ?? null;
};

export const updateCurrentClientUser = (updates: Partial<ClientUser>): ClientUser | null => {
  const currentUser = getCurrentClientUser();

  if (!currentUser) {
    return null;
  }

  const users = getClientUsers();
  const updatedUser = {
    ...currentUser,
    ...updates,
    name: updates.name?.trim() || currentUser.name,
    email: updates.email?.trim().toLowerCase() || currentUser.email,
  };

  saveClientUsers(users.map((user) => (user.id === currentUser.id ? updatedUser : user)));
  saveClientSession({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
  });

  return updatedUser;
};
