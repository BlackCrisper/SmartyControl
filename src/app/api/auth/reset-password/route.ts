import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/sqlserver';
import { hashPassword } from '@/lib/auth/password';

// Reset a password with a valid token
export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Token, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Find valid reset token
    const query = `
      SELECT pr.user_id, u.email
      FROM PasswordResets pr
      JOIN Users u ON pr.user_id = u.id
      WHERE pr.token = @param0
        AND u.email = @param1
        AND pr.expires_at > GETDATE()
        AND pr.used = 0
    `;

    const result = await executeQuery(query, [token, email]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    const userId = result[0].user_id;

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    const updateQuery = `
      UPDATE Users
      SET password = @param0, updated_at = GETDATE()
      WHERE id = @param1;
      UPDATE PasswordResets
      SET used = 1
      WHERE token = @param2;
    `;

    await executeQuery(updateQuery, [hashedPassword, userId, token]);

    return NextResponse.json(
      { message: 'Senha atualizada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
