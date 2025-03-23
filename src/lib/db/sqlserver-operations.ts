import { executeQuery } from './sqlserver';

// Interfaces
export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  category_id: number;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Transaction {
  id?: number;
  type: 'input' | 'output';
  product_id: number;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  notes?: string;
  created_by?: string;
  transaction_date: Date;
}

// Interface para usuários
export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string; // Optional para não retornar em consultas
  image_url?: string;
  role?: string;
  token_version?: number; // Adicionado para controle de versão do token
  created_at?: Date;
  updated_at?: Date;
}

// Operações de Usuários
export async function getUserByEmail(email: string) {
  try {
    const query = `
      SELECT id, name, email, image_url, role, token_version, created_at, updated_at
      FROM Users
      WHERE email = @param0
    `;

    const users = await executeQuery(query, [email]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error(`Erro ao buscar usuário com email ${email}:`, error);
    throw error;
  }
}

export async function getUserWithPasswordByEmail(email: string) {
  try {
    const query = `
      SELECT id, name, email, password, image_url, role, token_version, created_at, updated_at
      FROM Users
      WHERE email = @param0
    `;

    const users = await executeQuery(query, [email]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error(`Erro ao buscar usuário com email ${email}:`, error);
    throw error;
  }
}

// Obsoleto - mantido por compatibilidade, mas recomendado usar getUserWithPasswordByEmail
// e fazer a comparação manualmente com comparePassword
export async function getUserByCredentials(email: string, password: string) {
  try {
    const query = `
      SELECT id, name, email, password, image_url, role, token_version, created_at, updated_at
      FROM Users
      WHERE email = @param0 AND password = @param1
    `;

    const users = await executeQuery(query, [email, password]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Erro ao verificar credenciais do usuário:', error);
    throw error;
  }
}

export async function createUser(user: User) {
  try {
    // Verificar se o email já existe
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM Users
      WHERE email = @param0
    `;

    const checkResult = await executeQuery(checkQuery, [user.email]);

    if (checkResult[0].count > 0) {
      throw new Error('Email já está em uso');
    }

    const query = `
      INSERT INTO Users (name, email, password, image_url, role, token_version, created_at, updated_at)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, [
      user.name,
      user.email,
      user.password,
      user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`,
      user.role || 'user',
      user.token_version || 0
    ]);

    return result[0].id;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: number, user: Partial<User>) {
  try {
    // Construir query dinamicamente com base nos campos fornecidos
    let setClause = '';
    const params: unknown[] = [];

    Object.entries(user).forEach(([key, value], index) => {
      // Ignorar id pois estamos atualizando com base nele
      if (key !== 'id') {
        if (index > 0) setClause += ', ';
        setClause += `${key} = @param${index}`;
        params.push(value);
      }
    });

    setClause += ', updated_at = GETDATE()';

    const query = `
      UPDATE Users
      SET ${setClause}
      WHERE id = @param${params.length};
      SELECT @@ROWCOUNT as count;
    `;

    // Adiciona o ID como último parâmetro
    params.push(id);

    const result = await executeQuery(query, params);
    return result[0].count > 0;
  } catch (error) {
    console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
    throw error;
  }
}

// Operações de Produtos
export async function getAllProducts() {
  try {
    const query = `
      SELECT p.*, c.name as category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `;

    return await executeQuery(query);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

export async function getProductById(id: number) {
  try {
    const query = `
      SELECT p.*, c.name as category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      WHERE p.id = @param0
    `;

    const products = await executeQuery(query, [id]);
    return products.length > 0 ? products[0] : null;
  } catch (error) {
    console.error(`Erro ao buscar produto com ID ${id}:`, error);
    throw error;
  }
}

export async function createProduct(product: Product) {
  try {
    const query = `
      INSERT INTO Products (
        name, description, sku, barcode, price, cost_price, stock_quantity,
        min_stock_level, category_id, image_url, created_at, updated_at
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4, @param5, @param6,
        @param7, @param8, @param9, GETDATE(), GETDATE()
      );
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, [
      product.name,
      product.description || null,
      product.sku || null,
      product.barcode || null,
      product.price,
      product.cost_price,
      product.stock_quantity,
      product.min_stock_level,
      product.category_id,
      product.image_url || null
    ]);

    return result[0].id;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
}

export async function updateProduct(id: number, product: Partial<Product>) {
  try {
    // Construir query dinamicamente com base nos campos fornecidos
    let setClause = '';
    const params: unknown[] = [];

    Object.entries(product).forEach(([key, value], index) => {
      // Ignorar id pois estamos atualizando com base nele
      if (key !== 'id') {
        if (index > 0) setClause += ', ';
        setClause += `${key} = @param${index}`;
        params.push(value);
      }
    });

    setClause += ', updated_at = GETDATE()';

    const query = `
      UPDATE Products
      SET ${setClause}
      WHERE id = @param${params.length};
      SELECT @@ROWCOUNT as count;
    `;

    // Adiciona o ID como último parâmetro
    params.push(id);

    const result = await executeQuery(query, params);
    return result[0].count > 0;
  } catch (error) {
    console.error(`Erro ao atualizar produto com ID ${id}:`, error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  try {
    // Verificar se existem transações utilizando este produto
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM Transactions
      WHERE product_id = @param0
    `;

    const checkResult = await executeQuery(checkQuery, [id]);

    if (checkResult[0].count > 0) {
      throw new Error('Não é possível excluir um produto com transações associadas');
    }

    const query = `
      DELETE FROM Products
      WHERE id = @param0;
      SELECT @@ROWCOUNT as count;
    `;

    const result = await executeQuery(query, [id]);
    return result[0].count > 0;
  } catch (error) {
    console.error(`Erro ao excluir produto com ID ${id}:`, error);
    throw error;
  }
}

export async function getLowStockProducts() {
  try {
    const query = `
      SELECT p.*, c.name as category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.min_stock_level
      ORDER BY (p.stock_quantity / p.min_stock_level) ASC
    `;

    return await executeQuery(query);
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error);
    throw error;
  }
}

// Operações de Categorias
export async function getAllCategories() {
  try {
    const query = `
      SELECT * FROM Categories
      ORDER BY name ASC
    `;

    return await executeQuery(query);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
}

export async function getCategoryById(id: number) {
  try {
    const query = `
      SELECT * FROM Categories
      WHERE id = @param0
    `;

    const categories = await executeQuery(query, [id]);
    return categories.length > 0 ? categories[0] : null;
  } catch (error) {
    console.error(`Erro ao buscar categoria com ID ${id}:`, error);
    throw error;
  }
}

// Operações de Transações
export async function getRecentTransactions(limit = 10) {
  try {
    const query = `
      SELECT t.*, p.name as product_name, p.image_url
      FROM Transactions t
      INNER JOIN Products p ON t.product_id = p.id
      ORDER BY t.transaction_date DESC
      OFFSET 0 ROWS FETCH NEXT @param0 ROWS ONLY
    `;

    return await executeQuery(query, [limit]);
  } catch (error) {
    console.error('Erro ao buscar transações recentes:', error);
    throw error;
  }
}

export async function createTransaction(transaction: Transaction) {
  try {
    // Iniciar uma transação no banco de dados
    const startTransactionQuery = 'BEGIN TRANSACTION;';
    await executeQuery(startTransactionQuery);

    try {
      // 1. Criar o registro da transação
      const transactionQuery = `
        INSERT INTO Transactions (
          type, product_id, quantity, price_per_unit, total_price,
          notes, created_by, transaction_date
        )
        VALUES (
          @param0, @param1, @param2, @param3, @param4,
          @param5, @param6, @param7
        );
        SELECT SCOPE_IDENTITY() AS id;
      `;

      const transactionResult = await executeQuery(transactionQuery, [
        transaction.type,
        transaction.product_id,
        transaction.quantity,
        transaction.price_per_unit,
        transaction.total_price,
        transaction.notes || null,
        transaction.created_by || null,
        transaction.transaction_date || new Date()
      ]);

      // 2. Atualizar o estoque do produto
      const updateStockQuery = `
        UPDATE Products
        SET stock_quantity = stock_quantity ${transaction.type === 'input' ? '+' : '-'} @param0
        WHERE id = @param1;
      `;

      await executeQuery(updateStockQuery, [transaction.quantity, transaction.product_id]);

      // Comitar a transação
      const commitQuery = 'COMMIT;';
      await executeQuery(commitQuery);

      return transactionResult[0].id;
    } catch (error) {
      // Rollback em caso de erro
      const rollbackQuery = 'ROLLBACK;';
      await executeQuery(rollbackQuery);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
}

export async function getStatistics() {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM Products) AS totalProducts,
        (SELECT COUNT(*) FROM Products WHERE stock_quantity <= min_stock_level) AS lowStockProducts,
        (SELECT COUNT(*) FROM Categories) AS totalCategories,
        (SELECT COUNT(*) FROM Transactions WHERE type = 'input') AS totalInputs,
        (SELECT COUNT(*) FROM Transactions WHERE type = 'output') AS totalOutputs,
        (SELECT SUM(total_price) FROM Transactions WHERE type = 'input') AS totalInputValue,
        (SELECT SUM(total_price) FROM Transactions WHERE type = 'output') AS totalOutputValue
    `;

    const result = await executeQuery(query);
    return result[0];
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}
