import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/sqlserver';
import { verifyPassword } from '@/lib/auth/password-argon2';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Interface para tipagem do usuário do banco de dados
interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  password: string;
  image_url?: string;
  role: string;
  token_version?: number;
}

// Busca usuário pelo email no banco de dados
async function getUserByEmail(email: string): Promise<DatabaseUser | null> {
  try {
    console.log(`Buscando usuário com email: ${email}`);
    const query = `
      SELECT id, name, email, password, image_url, role, token_version
      FROM Users
      WHERE email = @param0
    `;

    const users = await executeQuery(query, [email]);
    console.log(`Resultado da busca: ${users.length} usuários encontrados`);
    return users.length > 0 ? users[0] as DatabaseUser : null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Registrar acesso de usuário (log de atividade)
async function logUserAccess(userId: number): Promise<void> {
  try {
    console.log(`Registrando acesso do usuário ${userId}`);
    const query = `
      INSERT INTO ActivityLogs (user_id, action, entity_type, details, created_at)
      VALUES (@param0, @param1, @param2, @param3, GETDATE())
    `;

    await executeQuery(query, [
      userId,
      'LOGIN',
      'auth',
      'Usuário realizou login no sistema'
    ]);
    console.log('Acesso registrado com sucesso');
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo solicitação de login');
    // Obter dados do corpo da requisição
    const { email, password } = await request.json();
    console.log(`Tentativa de login para: ${email}`);

    // Validar dados básicos
    if (!email || !password) {
      console.log('Email ou senha não fornecidos');
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco de dados
    const user = await getUserByEmail(email);

    // Verificar se o usuário existe
    if (!user) {
      console.log(`Usuário não encontrado: ${email}`);
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    console.log(`Usuário encontrado: ${user.name}, verificando senha`);

    // Verificar senha usando Argon2
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      console.log(`Senha inválida para usuário: ${email}`);
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    console.log(`Autenticação bem-sucedida para ${email}`);

    // Registrar login do usuário
    await logUserAccess(user.id);

    // Versão do token (pode ser usado para invalidar todos os tokens)
    const tokenVersion = user.token_version || 0;
    console.log(`Versão atual do token: ${tokenVersion}`);

    // Gerar tokens JWT
    const accessToken = generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image_url
    });

    const refreshToken = generateRefreshToken({
      id: user.id.toString(),
      tokenVersion
    });

    console.log('Tokens gerados com sucesso');

    // Configurar cookie HTTP-only para o refreshToken
    const cookieStore = await cookies();
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/'
    });

    console.log('Cookie de refresh token configurado');

    // Retornar tokens e informações do usuário
    const response = {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image_url
      }
    };

    console.log('Enviando resposta com token e dados do usuário');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao processar login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
