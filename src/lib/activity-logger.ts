import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { executeQuery } from './db/sqlserver';

export type EntityType = 'product' | 'category' | 'user' | 'transaction' | 'system' | 'auth';

/**
 * Interface for activity log data
 */
export interface LogActivity {
  action: string;
  entityType: string;
  entityId?: number | string;
  details?: string;
}

/**
 * Logs a user activity in the system
 */
export async function logActivity(activity: LogActivity): Promise<void> {
  try {
    const session = await getServerSession();

    // Get IP address and user agent from headers
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Prepare parameters for the query
    const params = [
      session?.user?.id || null,
      session?.user?.email || null,
      activity.action,
      activity.entityType,
      activity.entityId || null,
      activity.details || null,
      ip,
      userAgent
    ];

    // Insert the activity log
    const query = `
      INSERT INTO ActivityLogs (
        user_id,
        user_email,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        @param0,
        @param1,
        @param2,
        @param3,
        @param4,
        @param5,
        @param6,
        @param7,
        GETDATE()
      )
    `;

    await executeQuery(query, params);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't throw here to prevent disrupting the main application flow
  }
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit = 10, page = 1, filter?: { entityType?: EntityType; userId?: number }) {
  try {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: unknown[] = [limit, offset];

    if (filter) {
      const clauses: string[] = [];

      if (filter.entityType) {
        clauses.push('entity_type = @param2');
        params.push(filter.entityType);
      }

      if (filter.userId) {
        clauses.push(`user_id = @param${params.length}`);
        params.push(filter.userId);
      }

      if (clauses.length > 0) {
        whereClause = `WHERE ${clauses.join(' AND ')}`;
      }
    }

    const query = `
      SELECT
        al.id,
        al.user_id,
        al.user_email,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.created_at,
        u.name as user_name
      FROM ActivityLogs al
      LEFT JOIN Users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      OFFSET @param1 ROWS FETCH NEXT @param0 ROWS ONLY
    `;

    const result = await executeQuery(query, params);

    // Also get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ActivityLogs
      ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, params.slice(2)); // Remove limit and offset
    const total = countResult[0].total;

    return {
      activities: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

/**
 * Utility function to log product-related activities
 */
export function logProductActivity(
  action: 'create' | 'update' | 'delete',
  productId: number,
  details?: string
): Promise<void> {
  return logActivity({
    action,
    entityType: 'product',
    entityId: productId,
    details
  });
}

/**
 * Utility function to log category-related activities
 */
export function logCategoryActivity(
  action: 'create' | 'update' | 'delete',
  categoryId: number,
  details?: string
): Promise<void> {
  return logActivity({
    action,
    entityType: 'category',
    entityId: categoryId,
    details
  });
}

/**
 * Utility function to log transaction-related activities
 */
export function logTransactionActivity(
  action: 'input' | 'output',
  transactionId: number,
  details?: string
): Promise<void> {
  return logActivity({
    action,
    entityType: 'transaction',
    entityId: transactionId,
    details
  });
}

/**
 * Utility function to log user-related activities
 */
export function logUserActivity(
  action: string,
  userId?: number,
  details?: string
): Promise<void> {
  return logActivity({
    action,
    entityType: 'user',
    entityId: userId,
    details
  });
}

/**
 * Utility function to log system-related activities
 */
export function logSystemActivity(
  action: string,
  details?: string
): Promise<void> {
  return logActivity({
    action,
    entityType: 'system',
    details
  });
}
