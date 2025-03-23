"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DatabasePage() {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "not_configured">("loading");
  const [message, setMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  interface DBStatusResponse {
    status: "connected" | "error" | "not_configured";
    message: string;
    adminEmail?: string;
    adminPassword?: string;
  }

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  async function checkDatabaseStatus() {
    try {
      setStatus("loading");
      const response = await api.get<DBStatusResponse>("/api/db-status");
      setStatus(response.status);
      setMessage(response.message);
    } catch (error) {
      console.error("Erro ao verificar status do banco:", error);
      setStatus("error");
      setMessage("Erro ao verificar o status do banco de dados");
    }
  }

  async function initializeDatabase() {
    try {
      setIsInitializing(true);
      const response = await api.post<DBStatusResponse>("/api/db-status");
      setStatus(response.status);
      setMessage(response.message);
    } catch (error) {
      console.error("Erro ao inicializar banco:", error);
      setStatus("error");
      setMessage("Erro ao inicializar o banco de dados");
    } finally {
      setIsInitializing(false);
    }
  }

  function renderStatus() {
    switch (status) {
      case "loading":
        return <p className="text-yellow-600">Verificando status do banco de dados...</p>;
      case "connected":
        return <p className="text-green-600">{message}</p>;
      case "not_configured":
        return (
          <div className="space-y-4">
            <p className="text-yellow-600">{message}</p>
            <Button
              onClick={initializeDatabase}
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? "Inicializando..." : "Inicializar Banco de Dados"}
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="space-y-4">
            <p className="text-red-600">{message}</p>
            <Button
              onClick={checkDatabaseStatus}
              className="w-full"
              variant="outline"
            >
              Verificar Novamente
            </Button>
          </div>
        );
    }
  }

  function renderLoginInfo() {
    if (status !== "connected") return null;

    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h3 className="text-md font-semibold mb-2">Dados de acesso ao sistema:</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> blackcrisper@gmail.com</p>
          <p><span className="font-medium">Senha:</span> admin</p>
        </div>
        <Button asChild className="w-full mt-4">
          <Link href="/login">Ir para o Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Status do Banco de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center">
              {renderStatus()}
              {renderLoginInfo()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
