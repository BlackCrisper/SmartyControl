"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package2,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { StockStatistics } from "@/lib/data/mock-data";
import { getStatistics, formatCurrency, formatPercentage } from "@/lib/api";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconDarkBgColor: string;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
  additionalInfo?: string;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconDarkBgColor,
  trend,
  additionalInfo,
  isLoading = false,
}: StatCardProps) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            {isLoading ? (
              <div className="h-8 w-32 mt-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
            )}

            {trend && (
              <div className="flex items-center mt-2">
                {trend.direction === "up" ? (
                  <TrendingUp
                    size={14}
                    className="text-green-500 mr-1"
                  />
                ) : (
                  <TrendingDown
                    size={14}
                    className="text-red-500 mr-1"
                  />
                )}
                <span className={`text-xs ${
                  trend.direction === "up"
                    ? "text-green-500"
                    : "text-red-500"
                }`}>
                  {trend.label}
                </span>
              </div>
            )}

            {additionalInfo && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {additionalInfo}
              </div>
            )}
          </div>

          <div className={`${iconBgColor} dark:${iconDarkBgColor} p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StatsCards() {
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
        setError("Falha ao carregar estatísticas");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total em Estoque"
        value={stats ? formatCurrency(stats.totalInventory) : "R$ 0,00"}
        icon={<Package2 size={20} className="text-blue-500" />}
        iconBgColor="bg-blue-100"
        iconDarkBgColor="bg-blue-900/30"
        isLoading={isLoading}
      />

      <StatCard
        title="Total Compras"
        value={stats ? formatCurrency(stats.totalPurchases) : "R$ 0,00"}
        icon={<ShoppingCart size={20} className="text-red-500" />}
        iconBgColor="bg-red-100"
        iconDarkBgColor="bg-red-900/30"
        trend={stats ? {
          direction: stats.purchasesTrend,
          label: stats.purchasesTrend === "up" ? "Aumento" : "Redução"
        } : undefined}
        isLoading={isLoading}
      />

      <StatCard
        title="Total Vendas"
        value={stats ? formatCurrency(stats.totalSales) : "R$ 0,00"}
        icon={<ShoppingCart size={20} className="text-green-500" />}
        iconBgColor="bg-green-100"
        iconDarkBgColor="bg-green-900/30"
        trend={stats ? {
          direction: stats.salesTrend,
          label: stats.salesTrend === "up" ? "Aumento" : "Redução"
        } : undefined}
        isLoading={isLoading}
      />

      <StatCard
        title="Lucro Bruto"
        value={stats ? formatCurrency(stats.grossProfit) : "R$ 0,00"}
        icon={<DollarSign size={20} className="text-red-500" />}
        iconBgColor="bg-red-100"
        iconDarkBgColor="bg-red-900/30"
        additionalInfo={stats ? `Margem: ${formatPercentage(stats.profitMargin)}` : "Margem: 0.00%"}
        trend={stats ? {
          direction: stats.profitTrend,
          label: stats.profitTrend === "up" ? "Aumento" : "Redução"
        } : undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
