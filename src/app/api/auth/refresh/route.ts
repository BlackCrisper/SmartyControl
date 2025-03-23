import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/sqlserver';
import { verifyToken, generateAccessToken, RefreshTokenPayload } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Interface para o usuário no banco de dados
interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  image_url?: string;
  role: string;
  token_version: number;
}

// Busca usuário pelo ID
async function getUserById(id: string): Promise<DatabaseUser | null> {
  try {
    const query = `
      SELECT id, name, email, image_url, role, token_version
      FROM Users
      WHERE id = @param0
    `;

    const users = await executeQuery(query, [id]);
    return users.length > 0 ? users[0] as DatabaseUser : null;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obter o token de atualização do cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Token de atualização não fornecido' },
        { status: 401 }
      );
    }

    // Verificar e decodificar o token
    const decodedToken = verifyToken<RefreshTokenPayload>(refreshToken);

    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Buscar o usuário no banco de dados
    const user = await getUserById(decodedToken.id);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar se a versão do token ainda é válida
    if (user.token_version !== decodedToken.tokenVersion) {
      return NextResponse.json(
        { error: 'Token revogado' },
        { status: 401 }
      );
    }

    // Gerar um novo token de acesso
    const accessToken = generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image_url
    });

    // Retornar o novo token de acesso
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
