"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactions } from "@/lib/api";
import { Transaction } from "@/lib/data/mock-data";

export default function InventoryMovement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (err) {
        setError("Falha ao carregar dados de movimentação");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Process data for the chart visualization
  const processChartData = () => {
    // Get the last 6 months
    const today = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('pt-BR', { month: 'short' }).charAt(0).toUpperCase() +
             d.toLocaleString('pt-BR', { month: 'short' }).slice(1);
    }).reverse();

    // Initialize data arrays for entries and exits
    const entriesData = Array(6).fill(0);
    const exitsData = Array(6).fill(0);

    // Group transactions by month
    transactions.forEach(transaction => {
      // Parse date (date format is "DD/MM/YYYY")
      const [day, month, year] = transaction.date.split('/').map(Number);
      const transactionDate = new Date(year, month - 1, day);
      const monthIndex = months.findIndex(m =>
        m.toLowerCase() === transactionDate.toLocaleString('pt-BR', { month: 'short' }).toLowerCase()
      );

      if (monthIndex !== -1) {
        if (transaction.type === 'entrada') {
          entriesData[monthIndex] += transaction.quantity;
        } else {
          exitsData[monthIndex] += transaction.quantity;
        }
      }
    });

    return {
      months,
      entriesData,
      exitsData
    };
  };

  const { months, entriesData, exitsData } = processChartData();

  return (
    <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg dark:text-white">Movimentação do Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[280px] w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : error ? (
          <div className="h-[280px] flex items-center justify-center text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="h-[280px] relative dark:text-gray-300">
              <div className="absolute inset-0 grid grid-cols-6 w-full h-full">
                {months.map((month, i) => (
                  <div key={month} className="border-r border-dashed border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="h-full relative">
                      {/* Entry data point */}
                      {entriesData[i] > 0 && (
                        <div
                          className="absolute w-4 h-4 bg-green-500 rounded-full -ml-2"
                          style={{
                            bottom: `${(entriesData[i] / 100) * 100}%`,
                            left: '50%'
                          }}
                        ></div>
                      )}

                      {/* Exit data point */}
                      {exitsData[i] > 0 && (
                        <div
                          className="absolute w-4 h-4 bg-red-500 rounded-full -ml-2"
                          style={{
                            bottom: `${(exitsData[i] / 100) * 100}%`,
                            left: '50%'
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {month}
                    </div>
                  </div>
                ))}
              </div>

              {/* Y axis labels */}
              <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Saídas</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
