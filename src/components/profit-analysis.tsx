"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getStatistics, formatCurrency, formatPercentage } from "@/lib/api";
import { StockStatistics } from "@/lib/data/mock-data";

export default function ProfitAnalysis() {
  const [stats, setStats] = useState<StockStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getStatistics();
        setStats(data);
      } catch (err) {
        setError("Falha ao carregar dados de lucro");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2 flex flex-row items-center">
        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
          <TrendingUp size={18} className="text-blue-500" />
          Análise de Lucro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ))}
            </div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 dark:text-red-400">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Compras</div>
                <div className="text-xl font-bold dark:text-white">
                  {stats ? formatCurrency(stats.totalPurchases) : "R$ 0,00"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Vendas</div>
                <div className="text-xl font-bold dark:text-white">
                  {stats ? formatCurrency(stats.totalSales) : "R$ 0,00"}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Lucro Bruto</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats ? formatCurrency(stats.grossProfit) : "R$ 0,00"}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Margem de Lucro</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-500">
                  {stats ? formatPercentage(stats.profitMargin) : "0.00%"}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2 dark:text-gray-300">Comparativo</div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Progress bar showing profit margin */}
                <div
                  className="h-full bg-blue-500 dark:bg-blue-600"
                  style={{ width: stats ? `${Math.min(stats.profitMargin, 100)}%` : "0%" }}
                ></div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
