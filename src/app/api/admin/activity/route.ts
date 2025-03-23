import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getRecentActivities, type EntityType } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissão do usuário
    const session = await getServerSession();
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Obter parâmetros da URL
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Filtros opcionais
    const entityType = searchParams.get('type') as EntityType | undefined;
    const userId = searchParams.get('userId') ?
      parseInt(searchParams.get('userId') as string, 10) :
      undefined;

    // Buscar atividades recentes
    const result = await getRecentActivities(limit, page, {
      entityType,
      userId
    });

    // Transformar os dados para um formato mais amigável para o frontend
    const formattedActivities = result.activities.map(activity => {
      // Formatar a data para um formato mais amigável
      const timestamp = new Date(activity.created_at).toISOString();

      // Determinar o tipo de atividade para exibição
      let type = activity.entity_type;
      if (activity.entity_type === 'auth') {
        type = 'login';
      } else if (activity.entity_type === 'system') {
        type = 'system';
      }

      return {
        id: activity.id,
        user: activity.user_name || activity.user_email || 'Anônimo',
        userId: activity.user_id,
        action: activity.action,
        type,
        details: activity.details || '',
        timestamp,
        ip: activity.ip_address
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Erro ao obter logs de atividades:', error);
    return NextResponse.json(
      { message: 'Erro ao obter logs de atividades' },
      { status: 500 }
    );
  }
}
