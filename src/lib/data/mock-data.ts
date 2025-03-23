// This file contains mock data for the application
// In a real application, this would be stored in a database

export type Product = {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  minStock: number;
  isPerishable: boolean;
  description?: string;
  currentStock: number;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: "entrada" | "saida";
  productId: string;
  product: string;
  categoryId: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
};

export type StockStatistics = {
  totalInventory: number;
  totalPurchases: number;
  totalSales: number;
  grossProfit: number;
  profitMargin: number;
  purchasesTrend: "up" | "down";
  salesTrend: "up" | "down";
  profitTrend: "up" | "down";
};

// Mock data
export const categories: Category[] = [
  {
    id: "cat1",
    name: "produto 1",
    description: "teste",
  },
  {
    id: "cat2",
    name: "Eletrônicos",
    description: "Produtos eletrônicos diversos",
  },
  {
    id: "cat3",
    name: "Alimentos",
    description: "Produtos alimentícios",
  },
];

export const products: Product[] = [
  {
    id: "prod1",
    name: "produto 1 twatw",
    category: "cat1",
    buyPrice: 500,
    sellPrice: 1000,
    minStock: 30,
    isPerishable: false,
    description: "Produto de teste",
    currentStock: 0,
  },
  {
    id: "prod2",
    name: "produto 2",
    category: "cat1",
    buyPrice: 300,
    sellPrice: 600,
    minStock: 35,
    isPerishable: false,
    description: "Produto de teste 2",
    currentStock: 0,
  },
  {
    id: "prod3",
    name: "Smartphone",
    category: "cat2",
    buyPrice: 1200,
    sellPrice: 2000,
    minStock: 10,
    isPerishable: false,
    description: "Smartphone com 128GB de memória",
    currentStock: 15,
  },
  {
    id: "prod4",
    name: "Cereal",
    category: "cat3",
    buyPrice: 8,
    sellPrice: 15,
    minStock: 50,
    isPerishable: true,
    description: "Cereal matinal",
    currentStock: 60,
  },
];

export const transactions: Transaction[] = [
  {
    id: "trans1",
    date: "21/03/2023",
    type: "entrada",
    productId: "prod1",
    product: "produto 1 twatw",
    categoryId: "cat1",
    category: "produto 1",
    quantity: 1,
    unitPrice: 500,
    total: 500,
    notes: "Entrada inicial",
  },
  {
    id: "trans2",
    date: "21/03/2023",
    type: "saida",
    productId: "prod1",
    product: "produto 1 twatw",
    categoryId: "cat1",
    category: "produto 1",
    quantity: 1,
    unitPrice: 1000,
    total: 1000,
    notes: "Venda para cliente",
  },
  {
    id: "trans3",
    date: "22/03/2023",
    type: "entrada",
    productId: "prod3",
    product: "Smartphone",
    categoryId: "cat2",
    category: "Eletrônicos",
    quantity: 20,
    unitPrice: 1200,
    total: 24000,
    notes: "Compra de estoque inicial",
  },
  {
    id: "trans4",
    date: "23/03/2023",
    type: "saida",
    productId: "prod3",
    product: "Smartphone",
    categoryId: "cat2",
    category: "Eletrônicos",
    quantity: 5,
    unitPrice: 2000,
    total: 10000,
    notes: "Venda para cliente",
  },
  {
    id: "trans5",
    date: "24/03/2023",
    type: "entrada",
    productId: "prod4",
    product: "Cereal",
    categoryId: "cat3",
    category: "Alimentos",
    quantity: 70,
    unitPrice: 8,
    total: 560,
    notes: "Reabastecimento de estoque",
  },
  {
    id: "trans6",
    date: "25/03/2023",
    type: "saida",
    productId: "prod4",
    product: "Cereal",
    categoryId: "cat3",
    category: "Alimentos",
    quantity: 10,
    unitPrice: 15,
    total: 150,
    notes: "Venda para supermercado",
  },
];

export const stockStatistics: StockStatistics = {
  totalInventory: 34610, // Sum of (currentStock * buyPrice) for all products
  totalPurchases: 25060, // Sum of all entrada transactions
  totalSales: 11150,     // Sum of all saida transactions
  grossProfit: 4090,     // totalSales - (Sum of quantities sold * buyPrice)
  profitMargin: 36.68,   // (grossProfit / totalSales) * 100
  purchasesTrend: "up",
  salesTrend: "up",
  profitTrend: "down",
};

// Helper functions to work with the mock data
export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(product => product.category === categoryId);
}

export function getLowStockProducts(): Product[] {
  return products.filter(product => product.currentStock < product.minStock);
}

export function getRecentTransactions(type?: "entrada" | "saida", limit = 5): Transaction[] {
  let filtered = transactions;
  if (type) {
    filtered = transactions.filter(transaction => transaction.type === type);
  }

  // Sort by date (most recent first) and limit
  return [...filtered]
    .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() -
                    new Date(a.date.split('/').reverse().join('-')).getTime())
    .slice(0, limit);
}
