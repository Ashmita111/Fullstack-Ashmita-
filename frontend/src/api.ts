import { API_URL } from './config';
import type {
  User,
  Inventory,
  Category,
  Item,
  DashboardStats,
  ItemCreate,
  ItemUpdate,
} from './types';

const TOKEN_KEY = 'inventrack_token';

const getStoredToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    clearStoredToken();
    window.location.href = '/login';
  }
};

const buildUrl = (path: string): string => {
  if (path.match(/^https?:\/\//i)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBase = API_URL.replace(/\/+$/, '');

  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(text || response.statusText);
      (error as any).detail = text;
      throw error;
    }
    return text as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail ?? data?.message ?? response.statusText;
    const error = new Error(detail ?? 'Request failed');
    (error as any).detail = detail;
    throw error;
  }

  return data as T;
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> => {
  const url = buildUrl(path);
  const headers = new Headers(options.headers ?? {});

  if (options.body instanceof FormData === false && options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    redirectToLogin();
    const error = new Error('Unauthorized');
    (error as any).detail = 'Unauthorized';
    throw error;
  }

  return parseResponse<T>(response);
};

export const register = async (
  email: string,
  password: string,
  name?: string,
): Promise<{ access_token: string; token_type: string }> => {
  const payload = { email, password, ...(name ? { name } : {}) };
  const result = await request<{ access_token: string; token_type: string }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false,
  );

  setStoredToken(result.access_token);
  return result;
};

export const login = async (
  email: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> => {
  const payload = new URLSearchParams();
  payload.append('username', email);
  payload.append('password', password);

  const result = await request<{ access_token: string; token_type: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    false,
  );

  setStoredToken(result.access_token);
  return result;
};

export const logout = (): void => {
  clearStoredToken();
  redirectToLogin();
};

export const getMe = async (): Promise<User> => request<User>('/auth/me');

export const getDashboardStats = async (): Promise<DashboardStats> =>
  request<DashboardStats>('/dashboard/stats');

export const getInventories = async (): Promise<Inventory[]> =>
  request<Inventory[]>('/inventories');

export const createInventory = async (
  name: string,
  description?: string,
): Promise<Inventory> =>
  request<Inventory>('/inventories', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });

export const updateInventory = async (
  id: string,
  name: string,
  description?: string,
): Promise<Inventory> =>
  request<Inventory>(`/inventories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });

export const deleteInventory = async (id: string): Promise<void> =>
  request<void>(`/inventories/${id}`, {
    method: 'DELETE',
  });

export const getInventory = async (id: string): Promise<Inventory> =>
  request<Inventory>(`/inventories/${id}`);

export const getCategories = async (invId: string): Promise<Category[]> =>
  request<Category[]>(`/inventories/${invId}/categories`);

export const createCategory = async (
  invId: string,
  name: string,
  description?: string,
): Promise<Category> =>
  request<Category>(`/inventories/${invId}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });

export const updateCategory = async (
  invId: string,
  catId: string,
  name: string,
  description?: string,
): Promise<Category> =>
  request<Category>(`/inventories/${invId}/categories/${catId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });

export const deleteCategory = async (
  invId: string,
  catId: string,
): Promise<void> =>
  request<void>(`/inventories/${invId}/categories/${catId}`, {
    method: 'DELETE',
  });

export const getItems = async (params?: {
  cat_id?: string;
  inv_id?: string;
}): Promise<Item[]> => {
  const query = new URLSearchParams();

  if (params?.cat_id) {
    query.append('cat_id', params.cat_id);
  }
  if (params?.inv_id) {
    query.append('inv_id', params.inv_id);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Item[]>(`/items${suffix}`);
};

export const createItem = async (data: ItemCreate): Promise<Item> =>
  request<Item>('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateItem = async (
  id: string,
  data: ItemUpdate,
): Promise<Item> =>
  request<Item>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteItem = async (id: string): Promise<void> =>
  request<void>(`/items/${id}`, {
    method: 'DELETE',
  });
