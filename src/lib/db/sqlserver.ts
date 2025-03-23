import sql from 'mssql';

// Configuração de conexão com o SQL Server usando variáveis de ambiente
const sqlConfig = {
  user: process.env.SQLSERVER_USER || 'BlackCrisper_SQLLogin_1',
  password: process.env.SQLSERVER_PASSWORD || '856n17x1fq',
  server: process.env.SQLSERVER_SERVER || 'systemcontrol.mssql.somee.com',
  database: process.env.SQLSERVER_DATABASE || 'systemcontrol',
  options: {
    encrypt: true, // Para conexões seguras
    trustServerCertificate: true, // Importante para ambientes de desenvolvimento
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
};

// Função para conectar ao banco de dados
export async function connectToSqlServer() {
  try {
    // Manter uma única conexão global
    if (!global.sqlPool) {
      global.sqlPool = await sql.connect(sqlConfig);
      console.log('Conectado ao SQL Server');
    }

    return global.sqlPool;
  } catch (error) {
    console.error('Erro ao conectar ao SQL Server:', error);
    throw error;
  }
}

// Função para executar consultas SQL
export async function executeQuery(query: string, params: unknown[] = []) {
  try {
    const pool = await connectToSqlServer();
    const request = pool.request();

    // Adicionar parâmetros à consulta se forem fornecidos
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Erro ao executar consulta SQL:', error);
    throw error;
  }
}

// Função para fechar a conexão - útil em testes ou quando a aplicação é encerrada
export async function closeSqlConnection() {
  try {
    if (global.sqlPool) {
      await global.sqlPool.close();
      global.sqlPool = undefined;
      console.log('Conexão com SQL Server fechada');
    }
  } catch (error) {
    console.error('Erro ao fechar conexão com SQL Server:', error);
    throw error;
  }
}

// Declare o tipo global para o pool de conexão
declare global {
  // eslint-disable-next-line no-var
  var sqlPool: sql.ConnectionPool | undefined;
}

// Exportar o objeto sql para uso avançado se necessário
export { sql };
