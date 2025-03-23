import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/lib/db/sqlserver";
import { updateUser } from "@/lib/db/sqlserver-operations";
import { hashPassword } from "@/lib/auth/password-argon2"; // Atualizado para usar Argon2

// Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

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
    const { name, role, image_url, password } = body;

    // Validate request data
    if (!name) {
      return NextResponse.json(
        { message: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Check if user exists
    const checkQuery = `
      SELECT id FROM Users WHERE id = @param0
    `;
    const checkResult = await executeQuery(checkQuery, [id]);

    if (checkResult.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Create update data object
    const updateData: Record<string, unknown> = {
      name,
      role,
      image_url: image_url || undefined,
    };

    // If password was provided, hash it
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "A senha deve ter pelo menos 6 caracteres" },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;

      // Incrementar token_version ao mudar a senha (invalidar sessões existentes)
      updateData.token_version = executeQuery(`
        SELECT ISNULL(token_version, 0) + 1 as new_version
        FROM Users
        WHERE id = @param0
      `, [id]).then(result => result[0].new_version);
    }

    // Update the user
    await updateUser(parseInt(id), updateData);

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      id,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Acesso negado. Apenas administradores podem acessar essa funcionalidade." },
        { status: 403 }
      );
    }

    // Get user data (excluding password)
    const query = `
      SELECT id, name, email, image_url, role, token_version, created_at, updated_at
      FROM Users
      WHERE id = @param0
    `;
    const result = await executeQuery(query, [id]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { message: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Acesso negado. Apenas administradores podem acessar essa funcionalidade." },
        { status: 403 }
      );
    }

    // Check if user exists
    const checkQuery = `
      SELECT id FROM Users WHERE id = @param0
    `;
    const checkResult = await executeQuery(checkQuery, [id]);

    if (checkResult.length === 0) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Delete the user
    const deleteQuery = `
      DELETE FROM Users WHERE id = @param0
    `;
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({
      message: "Usuário excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}
