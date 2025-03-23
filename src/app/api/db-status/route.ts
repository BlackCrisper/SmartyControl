import { NextResponse } from "next/server";
import { setupDatabase, checkDatabaseSetup } from "@/lib/db/init-db";
import { executeQuery } from "@/lib/db/sqlserver";
import { hashPassword } from "@/lib/auth/password-argon2";

// Function to ensure the admin user exists
async function ensureAdminUserExists() {
  try {
    // Check if admin user already exists
    const checkUserQuery = `
      SELECT COUNT(*) as count
      FROM Users
      WHERE email = 'blackcrisper@gmail.com'
    `;

    const checkResult = await executeQuery(checkUserQuery);

    if (checkResult[0].count === 0) {
      // User doesn't exist, create it
      const hashedPassword = await hashPassword("admin");

      const createUserQuery = `
        INSERT INTO Users (name, email, password, image_url, role, token_version, created_at, updated_at)
        VALUES (
          'Black Crisper',
          'blackcrisper@gmail.com',
          @param0,
          'https://ui-avatars.com/api/?name=Black+Crisper&background=111111&color=fff',
          'admin',
          0,
          GETDATE(),
          GETDATE()
        )
      `;

      await executeQuery(createUserQuery, [hashedPassword]);
      console.log("Admin user created successfully");
      return true;
    } else {
      console.log("Admin user already exists");
      return true;
    }
  } catch (error) {
    console.error("Error ensuring admin user exists:", error);
    return false;
  }
}

// GET /api/db-status - Check if database is set up
export async function GET() {
  try {
    const isSetup = await checkDatabaseSetup();

    if (isSetup) {
      return NextResponse.json({
        status: "connected",
        message: "Banco de dados conectado e configurado com sucesso."
      });
    } else {
      return NextResponse.json({
        status: "not_configured",
        message: "Banco de dados não configurado. Inicialize para começar a usar o sistema."
      });
    }
  } catch (error) {
    console.error("Error checking database status:", error);
    return NextResponse.json({
      status: "error",
      message: "Erro ao conectar ao banco de dados. Verifique se o servidor SQL está rodando."
    }, { status: 500 });
  }
}

// POST /api/db-status/init - Initialize database
export async function POST() {
  try {
    const setupResult = await setupDatabase();

    if (!setupResult) {
      return NextResponse.json({
        status: "error",
        message: "Erro ao configurar as tabelas. Verifique os logs para mais detalhes."
      }, { status: 500 });
    }

    const adminUserResult = await ensureAdminUserExists();

    if (!adminUserResult) {
      return NextResponse.json({
        status: "error",
        message: "Erro ao criar usuário administrador. Verifique os logs para mais detalhes."
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "connected",
      message: "Banco de dados inicializado com sucesso. Use as credenciais abaixo para entrar no sistema.",
      adminEmail: "blackcrisper@gmail.com",
      adminPassword: "admin"
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json({
      status: "error",
      message: "Erro ao inicializar banco de dados. Verifique os logs para mais detalhes."
    }, { status: 500 });
  }
}
