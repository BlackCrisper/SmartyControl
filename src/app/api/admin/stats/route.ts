import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { executeQuery } from '@/lib/db/sqlserver';

export async function GET() {
  try {
    // Verificar autenticação e permissão do usuário
    const session = await getServerSession();
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Consultar estatísticas do sistema
    const totalUsersQuery = `
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminUsers,
        SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as newUsersToday
      FROM Users
    `;

    const usersResult = await executeQuery(totalUsersQuery);

    // Consultar estatísticas de produtos
    const productsQuery = `
      SELECT
        COUNT(*) as totalProducts,
        COUNT(DISTINCT category_id) as totalCategories,
        SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as lowStockItems
      FROM Products
    `;

    const productsResult = await executeQuery(productsQuery);

    // Consultar estatísticas de atividades recentes
    const activitiesQuery = `
      SELECT COUNT(*) as recentActivities
      FROM ActivityLogs
      WHERE created_at >= DATEADD(hour, -24, GETDATE())
    `;

    let recentActivities = 0;

    try {
      const activitiesResult = await executeQuery(activitiesQuery);
      recentActivities = activitiesResult[0]?.recentActivities || 0;
    } catch (error) {
      console.error('Erro ao consultar logs de atividades (tabela pode não existir ainda):', error);
      // Continue mesmo se a consulta falhar (a tabela pode não existir ainda)
    }

    // Preparar estatísticas de usuários ativos (simulação para a demonstração)
    // Numa implementação real, seria calculado a partir de logins ou sessões ativas
    const activeUsers = Math.floor(usersResult[0].totalUsers * 0.7);

    const stats = {
      totalUsers: usersResult[0].totalUsers || 0,
      adminUsers: usersResult[0].adminUsers || 0,
      newUsersToday: usersResult[0].newUsersToday || 0,
      activeUsers: activeUsers || 0,
      totalProducts: productsResult[0].totalProducts || 0,
      totalCategories: productsResult[0].totalCategories || 0,
      lowStockItems: productsResult[0].lowStockItems || 0,
      recentActivities: recentActivities || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas de administrador:', error);
    return NextResponse.json(
      { message: 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}
