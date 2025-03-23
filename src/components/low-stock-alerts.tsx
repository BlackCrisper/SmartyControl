"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Product } from "@/lib/data/mock-data";
import { getLowStockProducts } from "@/lib/api";

export default function LowStockAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getLowStockProducts();
        setLowStockProducts(data);
      } catch (err) {
        setError("Falha ao carregar produtos com estoque baixo");
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
          <AlertCircle size={18} className="text-orange-500" />
          Alertas de Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md border border-gray-300 dark:border-gray-600 h-24"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 dark:text-red-400">{error}</div>
        ) : lowStockProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <h4 className="text-gray-700 dark:text-gray-300 font-medium">Nenhum produto com estoque baixo</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Todos os produtos estão com estoque adequado
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-100 dark:border-orange-800/20"
              >
                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-800/30 p-2 rounded-full mr-3">
                    <AlertCircle size={16} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm dark:text-white">{product.name}</h4>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 rounded text-xs">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Estoque atual: </span>
                      <span className="font-medium dark:text-gray-300">{product.currentStock}</span>
                      <span className="mx-1 text-gray-400 dark:text-gray-500">|</span>
                      <span className="text-gray-500 dark:text-gray-400">Mínimo: </span>
                      <span className="font-medium dark:text-gray-300">{product.minStock}</span>
                    </div>
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
