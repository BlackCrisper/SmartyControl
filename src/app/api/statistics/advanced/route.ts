import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { executeQuery } from '@/lib/db/sqlserver';

// Define interfaces for the statistics types
interface InventoryStats {
  totalInputs: number;
  totalOutputs: number;
  productsAffected: number;
  avgOutputQuantity: number;
}

interface SalesStats {
  totalSalesValue: number;
  totalSalesCount: number;
  avgSaleValue: number;
  maxSaleValue: number;
}

interface PurchasesStats {
  totalPurchasesValue: number;
  totalPurchasesCount: number;
  avgPurchaseValue: number;
  maxPurchaseValue: number;
}

interface ProductStats {
  totalProducts: number;
  avgPrice: number;
  avgStock: number;
  inventoryValue: number;
}

interface ProfitabilityStats {
  netProfit: number;
  profitMargin: number;
}

interface TopProduct {
  id: number;
  name: string;
  stock_quantity: number;
  total_sold: number;
  total_sales: number;
}

interface Statistics {
  inventory?: InventoryStats;
  sales?: SalesStats;
  purchases?: PurchasesStats;
  products?: ProductStats;
  profitability?: ProfitabilityStats;
  topProducts?: TopProduct[];
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação e permissão do usuário
    const session = await getServerSession();
    if (!session?.user?.email || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { message: 'Acesso negado. Apenas administradores e gerentes podem acessar estas estatísticas.' },
        { status: 403 }
      );
    }

    // Pegar parâmetros da URL
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    const type = url.searchParams.get('type') || 'all'; // 'inventory', 'sales', 'purchases', 'all'

    // Determinar intervalo de datas com base no período
    let dateInterval;
    switch (period) {
      case 'day':
        dateInterval = 'DATEADD(day, -1, GETDATE())';
        break;
      case 'week':
        dateInterval = 'DATEADD(week, -1, GETDATE())';
        break;
      case 'year':
        dateInterval = 'DATEADD(year, -1, GETDATE())';
        break;
      case 'month':
      default:
        dateInterval = 'DATEADD(month, -1, GETDATE())';
        break;
    }

    // Array para armazenar as estatísticas
    const statistics: Statistics = {};

    // Estatísticas de movimentação de inventário
    if (type === 'all' || type === 'inventory') {
      const inventoryStatsQuery = `
        SELECT
          SUM(CASE WHEN type = 'input' THEN quantity ELSE 0 END) as totalInputs,
          SUM(CASE WHEN type = 'output' THEN quantity ELSE 0 END) as totalOutputs,
          COUNT(DISTINCT product_id) as productsAffected,
          AVG(CASE WHEN type = 'output' THEN quantity ELSE NULL END) as avgOutputQuantity
        FROM Transactions
        WHERE transaction_date >= ${dateInterval}
      `;

      const inventoryStats = await executeQuery(inventoryStatsQuery);
      statistics.inventory = inventoryStats[0] as InventoryStats;
    }

    // Estatísticas de vendas
    if (type === 'all' || type === 'sales') {
      const salesStatsQuery = `
        SELECT
          SUM(total_price) as totalSalesValue,
          COUNT(*) as totalSalesCount,
          AVG(total_price) as avgSaleValue,
          MAX(total_price) as maxSaleValue
        FROM Transactions
        WHERE transaction_date >= ${dateInterval}
        AND type = 'output'
      `;

      const salesStats = await executeQuery(salesStatsQuery);
      statistics.sales = salesStats[0] as SalesStats;
    }

    // Estatísticas de compras
    if (type === 'all' || type === 'purchases') {
      const purchasesStatsQuery = `
        SELECT
          SUM(total_price) as totalPurchasesValue,
          COUNT(*) as totalPurchasesCount,
          AVG(total_price) as avgPurchaseValue,
          MAX(total_price) as maxPurchaseValue
        FROM Transactions
        WHERE transaction_date >= ${dateInterval}
        AND type = 'input'
      `;

      const purchasesStats = await executeQuery(purchasesStatsQuery);
      statistics.purchases = purchasesStats[0] as PurchasesStats;
    }

    // Estatísticas de produtos
    if (type === 'all') {
      const productStatsQuery = `
        SELECT
          COUNT(*) as totalProducts,
          AVG(price) as avgPrice,
          AVG(stock_quantity) as avgStock,
          SUM(price * stock_quantity) as inventoryValue
        FROM Products
      `;

      const productStats = await executeQuery(productStatsQuery);
      statistics.products = productStats[0] as ProductStats;

      // Calcular lucratividade
      const profitabilityQuery = `
        SELECT
          SUM(CASE WHEN t.type = 'output' THEN t.total_price ELSE 0 END) -
          SUM(CASE WHEN t.type = 'input' THEN t.total_price ELSE 0 END) as netProfit,
          CASE
            WHEN SUM(CASE WHEN t.type = 'input' THEN t.total_price ELSE 0 END) = 0 THEN 0
            ELSE (SUM(CASE WHEN t.type = 'output' THEN t.total_price ELSE 0 END) -
                 SUM(CASE WHEN t.type = 'input' THEN t.total_price ELSE 0 END)) /
                 SUM(CASE WHEN t.type = 'input' THEN t.total_price ELSE 0 END) * 100
          END as profitMargin
        FROM Transactions t
        WHERE t.transaction_date >= ${dateInterval}
      `;

      const profitabilityStats = await executeQuery(profitabilityQuery);
      statistics.profitability = profitabilityStats[0] as ProfitabilityStats;
    }

    // Top produtos
    if (type === 'all' || type === 'sales') {
      const topProductsQuery = `
        SELECT TOP 5
          p.id,
          p.name,
          p.stock_quantity,
          SUM(t.quantity) as total_sold,
          SUM(t.total_price) as total_sales
        FROM Products p
        JOIN Transactions t ON p.id = t.product_id
        WHERE t.type = 'output'
        AND t.transaction_date >= ${dateInterval}
        GROUP BY p.id, p.name, p.stock_quantity
        ORDER BY total_sold DESC
      `;

      const topProducts = await executeQuery(topProductsQuery);
      statistics.topProducts = topProducts as TopProduct[];
    }

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Erro ao obter estatísticas avançadas:', error);
    return NextResponse.json(
      { message: 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}
