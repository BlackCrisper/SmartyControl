import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { executeQuery } from '@/lib/db/sqlserver';
import { extractUserFromToken } from '@/lib/auth/jwt';

// Função para incrementar a versão do token do usuário
async function incrementTokenVersion(userId: string): Promise<boolean> {
  try {
    const query = `
      UPDATE Users
      SET token_version = ISNULL(token_version, 0) + 1,
          updated_at = GETDATE()
      WHERE id = @param0
    `;

    await executeQuery(query, [userId]);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar versão do token:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter o authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const cookieStore = await cookies();

    // Tentar extrair informações do usuário do token (se existir)
    if (token) {
      const userData = extractUserFromToken(token);
      if (userData?.id) {
        // Incrementar a versão do token para invalidar todos os tokens existentes
        await incrementTokenVersion(userData.id);
      }
    }

    // Limpar o cookie de refresh token
    cookieStore.delete('refresh_token');

    // Responder com sucesso
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar logout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
