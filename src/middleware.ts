import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  try {
    // Obter o caminho da URL
    const path = request.nextUrl.pathname;

    // Lista de rotas públicas que não precisam de autenticação
    const publicRoutes = [
      '/login',
      '/registro',
      '/api/auth',
      '/favicon.ico',
      '/acesso-negado',
      '/esqueci-senha',
      '/reset-password',
      '/database',        // Permitir acesso à página de inicialização do banco de dados
      '/api/db-status',   // Permitir acesso à API de status e inicialização do banco
      '/api/reset-admin-password' // Rota para resetar a senha do admin
    ];
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

    // Lista de rotas administrativas que requerem permissão de administrador
    const adminRoutes = ['/admin', '/api/admin'];
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

    // Lista de rotas técnicas que requerem permissão de gerente ou admin
    const managerRoutes = ['/api/statistics/advanced'];
    const isManagerRoute = managerRoutes.some(route => path.startsWith(route));

    // Se a rota for pública, permitir acesso independente de autenticação
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Verificar a autenticação usando JWT primeiro, depois fallback para NextAuth
    let userRole: string | undefined;

    // 1. Verificar se existe token JWT no header de autorização
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwtToken = authHeader.substring(7);
      const userData = verifyToken<TokenPayload>(jwtToken);

      if (userData) {
        userRole = userData.role;
      }
    }

    // 2. Se não houver token JWT, verificar cookie de autenticação para compatibilidade com NextAuth
    if (!userRole) {
      const nextAuthToken = await getToken({ req: request });
      if (nextAuthToken) {
        userRole = nextAuthToken.role as string;
      }
    }

    // Se não estiver autenticado, redirecionar para login
    if (!userRole) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Verificar permissões de administrador para rotas administrativas
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/acesso-negado', request.url));
    }

    // Verificar permissões de gerente para rotas técnicas
    if (isManagerRoute && userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/acesso-negado', request.url));
    }

    // Permitir acesso se todas as verificações foram aprovadas
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Em caso de erro, redirecionar para login como fallback de segurança
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except:
    // - Static files (images, fonts, etc)
    // - Favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
