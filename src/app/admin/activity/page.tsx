"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Filter,
  PackagePlus,
  PackageMinus,
  User,
  ShieldAlert,
  Database,
  BarChart4,
  Activity,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

interface ActivityLog {
  id: number;
  user: string;
  userId: number;
  action: string;
  type: string;
  details: string;
  timestamp: string;
  ip: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Wrap the component that uses useSearchParams in a Suspense boundary
function ActivityLogPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Fetch activities function memoized with useCallback
  const fetchActivities = useCallback(async (page = 1, type = "all", userId: string | null = null) => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pagination.limit.toString());

      if (type !== "all") {
        params.append("type", type);
      }

      if (userId) {
        params.append("userId", userId);
      }

      // Fetch data
      const response = await fetch(`/api/admin/activity?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar dados de atividade");
      }

      const data = await response.json();
      setActivities(data.activities);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Erro ao carregar registros de atividade");
      toast.error("Erro ao carregar registros de atividade");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // URL params handling
  useEffect(() => {
    const page = searchParams?.get("page") ? parseInt(searchParams.get("page") as string, 10) : 1;
    const type = searchParams?.get("type") || "all";
    const userId = searchParams?.get("userId") || null;

    // Update state from URL params
    setPagination(prev => ({ ...prev, page }));
    setFilterType(type);
    setFilterUser(userId);

    fetchActivities(page, type, userId);
  }, [searchParams, fetchActivities]);

  // Check for admin permissions
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && user?.role !== "admin") {
      toast.error("Acesso restrito a administradores");
      router.push("/dashboard");
      return;
    }
  }, [user, authLoading, isAuthenticated, router]);

  const handlePageChange = (newPage: number) => {
    // Update URL with new params
    const params = new URLSearchParams();

    // Copy existing parameters
    for (const [key, value] of Array.from(searchParams.entries())) {
      params.set(key, value);
    }

    params.set("page", newPage.toString());

    router.push(`/admin/activity?${params.toString()}`);
  };

  const handleTypeChange = (newType: string) => {
    // Update URL with new params
    const params = new URLSearchParams();

    // Copy existing parameters
    for (const [key, value] of Array.from(searchParams.entries())) {
      params.set(key, value);
    }

    params.set("type", newType);
    params.set("page", "1"); // Reset to first page

    router.push(`/admin/activity?${params.toString()}`);
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn size={18} className="text-blue-500" />;
      case "product":
        return <PackagePlus size={18} className="text-green-500" />;
      case "category":
        return <Database size={18} className="text-orange-500" />;
      case "user":
        return <User size={18} className="text-purple-500" />;
      case "transaction":
        return <Activity size={18} className="text-yellow-500" />;
      case "system":
        return <ShieldAlert size={18} className="text-red-500" />;
      default:
        return <BarChart4 size={18} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter the activities client-side based on search term
  const filteredActivities = activities.filter(
    (activity) =>
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activities.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div>Carregando registros de atividade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Registros de Atividade</h1>
          <p className="text-gray-500">
            Monitore todas as ações realizadas no sistema
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Voltar ao Dashboard</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Atividade
              </label>
              <Select
                value={filterType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="product">Produtos</SelectItem>
                  <SelectItem value="category">Categorias</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                  <SelectItem value="transaction">Transações</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar por ação, detalhes, usuário..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    Nenhum registro de atividade encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {formatDate(activity.timestamp)}
                    </TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityTypeIcon(activity.type)}
                        <span className="capitalize">{activity.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={activity.details}>
                      {activity.details || "-"}
                    </TableCell>
                    <TableCell>{activity.ip}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.page > 1 && handlePageChange(pagination.page - 1)}
                  className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: pagination.totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === pagination.page;

                // Show only current page, first, last, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.totalPages ||
                  (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={isCurrentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Show ellipsis for skipped pages
                if (
                  (pageNumber === 2 && pagination.page > 3) ||
                  (pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => pagination.page < pagination.totalPages && handlePageChange(pagination.page + 1)}
                  className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// Loading fallback
function ActivityLogLoading() {
  return <div className="p-4 text-center">Carregando logs de atividade...</div>;
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<ActivityLogLoading />}>
      <ActivityLogPage />
    </Suspense>
  );
}
