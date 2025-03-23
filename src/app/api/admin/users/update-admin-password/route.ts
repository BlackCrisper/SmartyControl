import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/sqlserver';

export async function POST(request: NextRequest) {
  try {
    console.log('Recebida solicitação para atualizar senha do admin');

    // Este é o hash da senha 'admin' gerado pelo Argon2
    const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$awGgTD7HwApqfuEuqFyssQ$18bMs8VBMyIRm4tvzXD+axcgyIkJPqZFggom4QyAaA4';

    // Atualizar a senha do admin
    const updateQuery = `
      UPDATE Users
      SET password = @param0,
          token_version = ISNULL(token_version, 0) + 1,
          updated_at = GETDATE()
      WHERE email = 'blackcrisper@gmail.com'
    `;

    const result = await executeQuery(updateQuery, [hashedPassword]);
    console.log('Senha do admin atualizada com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Senha do admin atualizada com sucesso para "admin"'
    });
  } catch (error) {
    console.error('Erro ao atualizar senha do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
