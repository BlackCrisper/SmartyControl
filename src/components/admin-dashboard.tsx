"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, ShoppingBag, AlertTriangle, Clock, List, TrendingUp } from "lucide-react";
import StatsCards from "./stats-cards";
import InventoryMovement from "./inventory-movement";
import ProfitAnalysis from "./profit-analysis";
import LowStockAlerts from "./low-stock-alerts";
import ExpiringProducts from "./expiring-products";
import { Button } from "./ui/button";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  newUsersToday: number;
  activeUsers: number;
  totalProducts: number;
  totalCategories: number;
  lowStockItems: number;
  recentActivities: number;
}

interface ActivityLog {
  type: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

interface AdminDashboardProps {
  companyName: string;
}

export default function AdminDashboard({ companyName }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    adminUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    lowStockItems: 0,
    recentActivities: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Fetch admin stats
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch admin statistics');

        const data = await response.json();
        setStats(data);

        // Fetch recent activity
        const activityResponse = await fetch('/api/admin/activity?limit=5');
        if (!activityResponse.ok) throw new Error('Failed to fetch recent activity');

        const activityData = await activityResponse.json();
        setRecentActivity(activityData);

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando dados administrativos...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Users size={16} className="text-blue-500" />;
      case 'product': return <ShoppingBag size={16} className="text-green-500" />;
      case 'user': return <Users size={16} className="text-purple-500" />;
      case 'transaction': return <Activity size={16} className="text-orange-500" />;
      default: return <List size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{companyName} - Dashboard Administrativo</h2>
          <p className="text-gray-500">Visão geral de sistema e usuários</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </Button>
          </Link>
          <Link href="/admin/activity">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Logs de Atividade
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Total de Usuários</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1">
                {stats.adminUsers} administradores
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Produtos Cadastrados</span>
              <ShoppingBag className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <div className="text-xs bg-green-100 text-green-700 rounded px-2 py-1">
                {stats.totalCategories} categorias
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Alertas</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{stats.lowStockItems}</div>
              <div className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-1">
                produtos em baixo estoque
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Atividades Recentes</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">{stats.recentActivities}</div>
              <div className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-1">
                últimas 24 horas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-4 w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
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

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhuma atividade recente encontrada
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 py-2 border-b last:border-b-0">
                      <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityTypeIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">{activity.action}</div>
                          <div className="text-xs text-gray-500">{formatDate(activity.timestamp)}</div>
                        </div>

                        <div className="flex items-center">
                          <div className="text-xs text-gray-600 truncate">{activity.details}</div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {activity.user}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex justify-center mt-4">
                  <Link href="/admin/activity">
                    <Button variant="outline" size="sm">
                      <Clock className="mr-1 h-3 w-3" />
                      Ver Histórico Completo
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Gráfico de usuários ativos disponível na próxima atualização
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Gráfico de desempenho disponível na próxima atualização
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
