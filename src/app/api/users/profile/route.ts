import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { updateUser, getUserByEmail } from "@/lib/db/sqlserver-operations";

export async function PUT(request: Request) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, image_url } = body;

    // Validate request data
    if (!name) {
      return NextResponse.json(
        { message: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Get user information from database to verify they exist and get their ID
    const userInfo = await getUserByEmail(session.user.email);

    if (!userInfo) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Update user profile
    const updated = await updateUser(userInfo.id, {
      name,
      image_url: image_url || userInfo.image_url,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Falha ao atualizar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Perfil atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
