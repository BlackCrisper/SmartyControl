"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Clipboard, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import StatsCards from "./stats-cards";
import InventoryMovement from "./inventory-movement";
import ProfitAnalysis from "./profit-analysis";
import LowStockAlerts from "./low-stock-alerts";
import ExpiringProducts from "./expiring-products";

interface ManagerDashboardProps {
  companyName: string;
}

export default function ManagerDashboard({ companyName }: ManagerDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{companyName} - Dashboard Gerencial</h2>
        <p className="text-gray-500">Análise de estoque e desempenho</p>
      </div>

      <StatsCards />

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InventoryMovement />
            <ProfitAnalysis />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LowStockAlerts />
            <ExpiringProducts />
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                  Análise de Giro de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Gráfico de giro de estoque disponível na próxima atualização
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Cronograma de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-md bg-green-50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <Clipboard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Pedido #35981</div>
                      <div className="text-sm text-gray-500">Próximos 7 dias</div>
                    </div>
                    <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                      Agendado
                    </div>
                  </div>

                  <div className="flex items-center p-3 rounded-md bg-blue-50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <Clipboard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Reposição Regular</div>
                      <div className="text-sm text-gray-500">Próximos 14 dias</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold">
                      Pendente
                    </div>
                  </div>

                  <div className="flex items-center p-3 rounded-md bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
                      <Clipboard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Inventário Mensal</div>
                      <div className="text-sm text-gray-500">Final do mês</div>
                    </div>
                    <div className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs font-semibold">
                      Planejado
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Projeção de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Gráfico de projeção disponível na próxima atualização
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  Margem de Lucro por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Gráfico de margens disponível na próxima atualização
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
