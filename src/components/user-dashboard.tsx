"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, PackageMinus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LowStockAlerts from "./low-stock-alerts";
import RecentInputs from "./recent-inputs";
import RecentOutputs from "./recent-outputs";

interface UserStats {
  pendingTasks: number;
  lowStockItems: number;
  recentTransactions: number;
}

interface UserDashboardProps {
  companyName: string;
}

export default function UserDashboard({ companyName }: UserDashboardProps) {
  const [stats, setStats] = useState<UserStats>({
    pendingTasks: 0,
    lowStockItems: 0,
    recentTransactions: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // In a real implementation, you'd fetch these from an API
        // For now, we'll simulate with some dummy data
        setTimeout(() => {
          setStats({
            pendingTasks: 2,
            lowStockItems: 5,
            recentTransactions: 8
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{companyName} - Dashboard de Usuário</h2>
        <p className="text-gray-500">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/entrada" className="w-full">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <PackagePlus className="h-6 w-6 text-green-500" />
            <span>Nova Entrada</span>
          </Button>
        </Link>

        <Link href="/saida" className="w-full">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <PackageMinus className="h-6 w-6 text-red-500" />
            <span>Nova Saída</span>
          </Button>
        </Link>

        <Link href="/cadastros" className="w-full">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <span>Cadastros</span>
          </Button>
        </Link>

        <Link href="/historico" className="w-full">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <Clock className="h-6 w-6 text-purple-500" />
            <span>Histórico</span>
          </Button>
        </Link>
      </div>

      {/* Task Reminder Card */}
      {stats.pendingTasks > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Você tem {stats.pendingTasks} tarefa(s) pendente(s)</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Existem {stats.lowStockItems} produtos com estoque baixo que precisam de atenção.</p>
                </div>
                <div className="mt-3">
                  <Link href="/entrada">
                    <Button size="sm" variant="outline" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300">
                      Realizar reposição
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-green-500" />
              Entradas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentInputs />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageMinus className="h-5 w-5 text-red-500" />
              Saídas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOutputs />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Produtos com Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LowStockAlerts />
        </CardContent>
      </Card>
    </div>
  );
}
