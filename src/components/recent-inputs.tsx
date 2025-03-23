"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/data/mock-data";
import { getRecentTransactions, formatCurrency } from "@/lib/api";

export default function RecentInputs() {
  const [recentInputs, setRecentInputs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getRecentTransactions("entrada", 5);
        setRecentInputs(data);
      } catch (err) {
        setError("Falha ao carregar entradas recentes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg dark:text-white">Entradas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500 dark:text-red-400">{error}</div>
        ) : recentInputs.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Nenhuma entrada recente encontrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="dark:text-gray-400">Data</TableHead>
                <TableHead className="dark:text-gray-400">Produto</TableHead>
                <TableHead className="dark:text-gray-400">Qtd.</TableHead>
                <TableHead className="dark:text-gray-400">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInputs.map((input) => (
                <TableRow key={input.id} className="dark:border-gray-700">
                  <TableCell className="dark:text-gray-300">{input.date}</TableCell>
                  <TableCell className="dark:text-gray-300">{input.product}</TableCell>
                  <TableCell className="dark:text-gray-300">{input.quantity}</TableCell>
                  <TableCell className="dark:text-gray-300">{formatCurrency(input.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
