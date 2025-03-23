import fs from 'fs';
import path from 'path';
import { executeQuery, connectToSqlServer, closeSqlConnection } from './sqlserver';

/**
 * Inicializa o banco de dados executando o script SQL de schema
 */
export async function initializeDatabase() {
  try {
    console.log('Iniciando a conexão com o banco de dados...');

    // Conectar ao banco de dados
    await connectToSqlServer();

    // Carregar o arquivo SQL com o schema
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('Arquivo de schema SQL carregado, executando...');

    // Dividir o script em comandos separados
    // Dividimos pelo ";" tradicional do SQL
    const commands = schemaSQL
      .split(';')
      .filter(command => command.trim() !== '');

    // Executar cada comando separadamente
    for (const command of commands) {
      try {
        await executeQuery(command);
      } catch (error) {
        console.error(`Erro ao executar comando SQL: ${command.substring(0, 100)}...`, error);
        throw error;
      }
    }

    console.log('Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    return false;
  } finally {
    // Não fechamos a conexão aqui para que ela possa ser reutilizada
    // await closeSqlConnection();
  }
}

/**
 * Verifica se as tabelas principais existem no banco de dados
 * Retorna true se o banco de dados parece estar configurado corretamente
 */
export async function checkDatabaseSetup() {
  try {
    const query = `
      SELECT
        (CASE WHEN EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Categories') THEN 1 ELSE 0 END) AS CategoriesExists,
        (CASE WHEN EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Products') THEN 1 ELSE 0 END) AS ProductsExists,
        (CASE WHEN EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Transactions') THEN 1 ELSE 0 END) AS TransactionsExists,
        (CASE WHEN EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users') THEN 1 ELSE 0 END) AS UsersExists
    `;

    const result = await executeQuery(query);

    if (!result || result.length === 0) {
      return false;
    }

    const { CategoriesExists, ProductsExists, TransactionsExists, UsersExists } = result[0];

    return (
      CategoriesExists === 1 &&
      ProductsExists === 1 &&
      TransactionsExists === 1 &&
      UsersExists === 1
    );
  } catch (error) {
    console.error('Erro ao verificar setup do banco de dados:', error);
    return false;
  }
}

/**
 * Verifica e inicializa o banco de dados se necessário
 */
export async function setupDatabase() {
  try {
    const isSetup = await checkDatabaseSetup();

    if (!isSetup) {
      console.log('Banco de dados não configurado. Inicializando...');
      return await initializeDatabase();
    }

    console.log('Banco de dados já está configurado.');
    return true;
  } catch (error) {
    console.error('Erro no setup do banco de dados:', error);
    return false;
  }
}
