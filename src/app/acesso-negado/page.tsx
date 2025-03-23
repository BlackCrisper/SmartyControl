"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AccessDeniedPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // If still loading, show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-6">
        <ShieldAlert size={40} />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Acesso Negado</h1>

      <p className="text-gray-600 max-w-md text-center mb-8">
        Você não tem permissão para acessar esta página.
        Esta área requer um nível de acesso superior ao seu.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mb-6">
        <h2 className="text-lg font-medium mb-2">Informações do Usuário</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Nome:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Função:</span>
            <span className="font-medium capitalize">{user?.role || "usuário"}</span>
          </div>
        </div>
      </div>

      <Button onClick={handleBackToDashboard}>
        Voltar ao Dashboard
      </Button>

      <p className="mt-6 text-sm text-gray-500">
        Se você acredita que deveria ter acesso a esta página,
        entre em contato com o administrador do sistema.
      </p>
    </div>
  );
}
