"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao solicitar redefinição de senha");
      }

      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro ao processar sua solicitação");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="flex items-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-800 mr-3">
                <ArrowLeft size={16} />
              </Link>
              <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
            </div>
            <CardDescription>
              Insira seu email para receber um link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 mx-auto rounded-full flex items-center justify-center">
                  <Mail size={32} />
                </div>
                <h3 className="text-lg font-medium">Email enviado!</h3>
                <p className="text-gray-500 text-sm">
                  Se existe uma conta associada ao email <span className="font-medium">{email}</span>,
                  você receberá um link para redefinir sua senha.
                </p>
                <p className="text-gray-500 text-sm">
                  Verifique também sua pasta de spam.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/login")}
                >
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/login" className="text-sm text-blue-600 hover:underline">
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
