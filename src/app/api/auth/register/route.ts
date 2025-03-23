import { NextResponse } from "next/server";
import { createUser } from "@/lib/db/sqlserver-operations";
import { hashPassword } from "@/lib/auth/password-argon2"; // Alterado para usar Argon2

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    try {
      // Hash da senha usando Argon2 antes de salvar no banco de dados
      const hashedPassword = await hashPassword(password);

      // Criar o usuário no banco de dados com token_version inicial
      const userId = await createUser({
        name,
        email,
        password: hashedPassword,
        image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
        token_version: 0 // Inicializar a versão do token
      });

      // Retornar sucesso sem expor a senha
      return NextResponse.json(
        {
          message: "Usuário registrado com sucesso",
          user: {
            id: userId,
            name,
            email,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      // Verificar se é o erro de email já em uso
      if (error instanceof Error && error.message === 'Email já está em uso') {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }

      // Repassar o erro para o handler principal
      throw error;
    }
  } catch (error) {
    console.error("Erro de registro:", error);
    return NextResponse.json(
      { message: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
