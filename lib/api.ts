export type MenuPayload = {
  coffee: unknown[];
  pastry: unknown[];
};

export type BootstrapPayload = {
  menu: MenuPayload;
  groups: unknown[];
  activeGroupId: string | null;
  allMembers: unknown[];
  favorites: unknown[];
  cartSetFavorites: unknown[];
  orders: unknown[];
  allergenSettings: {
    excludedAllergens: string[];
    autoFilterEnabled: boolean;
  };
};

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  if (!response.ok) {
    throw new Error(`${init?.method || 'GET'} ${path} failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function fetchBootstrap() {
  return request<BootstrapPayload>('/api/bootstrap');
}

export function fetchHealth() {
  return request<{ ok: boolean; mongo: boolean }>('/api/health');
}

export function saveGroups(payload: {
  groups: unknown[];
  activeGroupId: string | null;
  allMembers: unknown[];
}) {
  return request('/api/groups', { method: 'PUT', body: JSON.stringify(payload) });
}

export function saveFavorites(payload: { favorites: unknown[]; cartSetFavorites: unknown[] }) {
  return request('/api/favorites', { method: 'PUT', body: JSON.stringify(payload) });
}

export function saveOrders(payload: { orders: unknown[] }) {
  return request('/api/orders', { method: 'PUT', body: JSON.stringify(payload) });
}

export function saveAllergens(payload: { excludedAllergens: string[]; autoFilterEnabled: boolean }) {
  return request('/api/allergens', { method: 'PUT', body: JSON.stringify(payload) });
}

export function resetRemoteData() {
  return request('/api/reset', { method: 'POST' });
}
