// API fetch utilities

import {
  Product,
  Category,
  Transaction,
  StockStatistics
} from "@/lib/data/mock-data";

// Base fetch function with error handling
async function fetchAPI<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}

// Simple API client
export const api = {
  get: async <T>(url: string): Promise<T> => {
    return fetchAPI<T>(url);
  },
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error("API post error:", error);
      throw error;
    }
  }
};

// Statistics API
export async function getStatistics(): Promise<StockStatistics> {
  return fetchAPI<StockStatistics>('/api/statistics');
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/api/categories');
}

// Products API
export async function getProducts(categoryId?: string): Promise<Product[]> {
  const url = categoryId
    ? `/api/products?category=${categoryId}`
    : '/api/products';
  return fetchAPI<Product[]>(url);
}

export async function getLowStockProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>('/api/products/low-stock');
}

// Transactions API
export interface TransactionFilters {
  type?: 'entrada' | 'saida';
  category?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  let url = '/api/transactions';

  if (filters) {
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.product) params.append('product', filters.product);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return fetchAPI<Transaction[]>(url);
}

export async function getRecentTransactions(
  type?: 'entrada' | 'saida',
  limit: number = 5
): Promise<Transaction[]> {
  let url = '/api/transactions/recent';

  const params = new URLSearchParams();
  if (type) params.append('type', type);
  params.append('limit', limit.toString());

  url += `?${params.toString()}`;

  return fetchAPI<Transaction[]>(url);
}

// Format currency for display
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
