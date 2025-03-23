import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getUserWithPasswordByEmail, updateUser } from "@/lib/db/sqlserver-operations";
import { comparePassword, hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
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
    const { currentPassword, newPassword } = body;

    // Validate request data
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Get user with password from database
    const userInfo = await getUserWithPasswordByEmail(session.user.email);

    if (!userInfo) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      userInfo.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user's password
    const updated = await updateUser(userInfo.id, {
      password: hashedNewPassword,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Falha ao atualizar senha" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Senha atualizada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
