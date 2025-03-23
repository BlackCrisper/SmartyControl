import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/lib/db/sqlserver";
import { createUser } from "@/lib/db/sqlserver-operations";
import { hashPassword } from "@/lib/auth/password";

// List all users
export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Acesso negado. Apenas administradores podem acessar essa funcionalidade." },
        { status: 403 }
      );
    }

    // Query to get all users from the database
    const query = `
      SELECT id, name, email, role, image_url, created_at, updated_at
      FROM Users
      ORDER BY name ASC
    `;

    const users = await executeQuery(query);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { message: "Erro ao listar usuários" },
      { status: 500 }
    );
  }
}

// Create a new user
export async function POST(request: Request) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Acesso negado. Apenas administradores podem acessar essa funcionalidade." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, email, password, role, image_url } = body;

    // Validate request data
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    try {
      const userId = await createUser({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        image_url: image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
      });

      return NextResponse.json(
        {
          message: "Usuário criado com sucesso",
          user: { id: userId, name, email, role: role || "user" },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Email já está em uso') {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
