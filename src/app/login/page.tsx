"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth(); // Hook personalizado de autenticação

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setSuccessMessage("Registro realizado com sucesso! Faça login para continuar.");
    }

    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Email ou senha inválidos. Por favor, verifique suas credenciais.");
      } else {
        setError("Ocorreu um erro durante a autenticação. Por favor, tente novamente.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("Tentando login com:", email);

      // Usando o novo método de autenticação JWT
      const result = await login(email, password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Falha na autenticação. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro de login:", error);
      setError("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-600 p-3 rounded-md mb-4 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Senha
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right">
            <Link
              href="/esqueci-senha"
              className="text-xs text-blue-600 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Entrar"}
        </Button>

        <div className="text-center text-sm text-gray-500 mt-2">
          <span>Não possui uma conta? </span>
          <Link href="/registro" className="text-blue-600 hover:underline">
            Registre-se
          </Link>
        </div>
      </form>
    </>
  );
}

function LoginFormLoading() {
  return <div className="p-4 text-center">Carregando...</div>;
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-3 relative">
            <Image
              src="https://ext.same-assets.com/751156660/499160334.png"
              alt="Estoque"
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Controle de Estoque
          </h1>
          <p className="text-gray-600">
            Gerencie seu estoque de forma simples e eficiente
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoginFormLoading />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
        <p className="text-center mt-6 text-sm text-gray-500">
          Sistema de Controle de Estoque Inteligente © 2025
        </p>
      </div>
    </div>
  );
}
