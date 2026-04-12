const API_BASE_URL = 'http://localhost:3001/api';

export interface Property {
  id?: number;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  type: 'casa' | 'apartamento' | 'terreno';
  status: 'disponivel' | 'vendido' | 'alugado';
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

// Funções para manipular as propriedades via API
export const getAllProperties = async (): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  return response.json();
};

export const getPropertyById = async (id: number): Promise<Property | undefined> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error('Failed to fetch property');
  }
  return response.json();
};

export const addProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(property),
  });
  if (!response.ok) {
    throw new Error('Failed to add property');
  }
  const result = await response.json();
  return result.id;
};

export const updateProperty = async (id: number, updates: Partial<Property>): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update property');
  }
};

export const deleteProperty = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete property');
  }
};

// Função de inicialização (não necessária para API)
export const initializeDatabase = async (): Promise<void> => {
  // O backend inicializa o banco automaticamente
};