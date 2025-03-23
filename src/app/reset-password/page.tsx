"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, X, AlertTriangle } from "lucide-react";

// The main form component that uses useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    const emailParam = searchParams?.get("email");

    if (!tokenParam || !emailParam) {
      setError("Link de redefinição inválido ou expirado");
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao redefinir a senha");
      }

      setIsSuccess(true);
      toast.success("Senha redefinida com sucesso!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao redefinir a senha");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="inline-block p-3 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Senha Redefinida!</h3>
        <p className="text-gray-600 mb-4">
          Sua senha foi redefinida com sucesso. Você será redirecionado para a
          página de login.
        </p>
        <Button asChild>
          <Link href="/login">Ir para o Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
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
            value={email}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Nova Senha
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirme a Senha
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Redefinir Senha"}
        </Button>

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o Login
          </Link>
        </div>
      </form>
    </>
  );
}

// Loading fallback
function ResetPasswordLoading() {
  return <div className="p-4 text-center">Carregando...</div>;
}

// Export the main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-3 relative">
            <Image
              src="https://ext.same-assets.com/751156660/499160334.png"
              alt="Logo"
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Redefinir Senha
          </h1>
          <p className="text-gray-600">
            Defina uma nova senha para sua conta
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Suspense fallback={<ResetPasswordLoading />}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
