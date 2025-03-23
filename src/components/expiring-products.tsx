"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Product } from "@/lib/data/mock-data";
import { getProducts } from "@/lib/api";

export default function ExpiringProducts() {
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // In a real app, we would have an API endpoint for expiring products
        // For now, we'll just use the regular products and filter for perishable ones
        const products = await getProducts();
        setExpiringProducts(products.filter(p => p.isPerishable).slice(0, 3));
      } catch (err) {
        setError("Falha ao carregar produtos a vencer");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
          <Clock size={18} className="text-red-500" />
          Produtos a Vencer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 dark:text-red-400">{error}</div>
        ) : expiringProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Clock size={24} className="text-gray-400" />
            </div>
            <h4 className="text-gray-700 dark:text-gray-300 font-medium">Nenhum produto próximo do vencimento</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Os produtos com data de validade próxima serão exibidos aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expiringProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-full mr-3">
                    <Clock size={16} className="text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm dark:text-white">{product.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Validade: 30 dias</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
