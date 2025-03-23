import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/sqlserver';
import { hashPassword } from '@/lib/auth/password-argon2';

export async function GET() {
  try {
    console.log('Recebida solicitação para resetar senha do admin');

    // Gerar um novo hash para a senha 'admin'
    const hashedPassword = await hashPassword('admin');
    console.log(`Novo hash gerado: ${hashedPassword}`);

    // Atualizar a senha do admin
    const updateQuery = `
      UPDATE Users
      SET password = @param0,
          token_version = ISNULL(token_version, 0) + 1,
          updated_at = GETDATE()
      WHERE email = 'blackcrisper@gmail.com'
    `;

    await executeQuery(updateQuery, [hashedPassword]);
    console.log('Senha do admin resetada com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Senha do admin resetada com sucesso para "admin"',
      hash: hashedPassword
    });
  } catch (error) {
    console.error('Erro ao resetar senha do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
