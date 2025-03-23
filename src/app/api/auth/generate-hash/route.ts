import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password-argon2';

export async function POST(request: NextRequest) {
  try {
    // Esta rota só deve ser acessível em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Esta rota só está disponível em ambiente de desenvolvimento' },
        { status: 403 }
      );
    }

    // Obter a senha do corpo da requisição
    const { password } = await request.json();
    console.log(`Recebida solicitação para gerar hash da senha: ${password}`);

    if (!password) {
      console.log('Senha não fornecida');
      return NextResponse.json(
        { error: 'Senha não fornecida' },
        { status: 400 }
      );
    }

    // Gerar o hash usando Argon2
    const hashedPassword = await hashPassword(password);
    console.log(`Hash gerado: ${hashedPassword}`);

    // Retornar o hash gerado
    const response = {
      original: password,
      hashed: hashedPassword
    };

    console.log('Enviando resposta com o hash');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
