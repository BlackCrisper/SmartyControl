import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/db/sqlserver-operations";
import { executeQuery } from "@/lib/db/sqlserver";

// GET /api/categories - Obter todas as categorias
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Criar uma nova categoria
export async function POST(request: Request) {
  try {
    const categoryData = await request.json();

    // Validação básica
    if (!categoryData.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO Categories (name, description, created_at, updated_at)
      VALUES (@param0, @param1, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await executeQuery(query, [
      categoryData.name,
      categoryData.description || null
    ]);

    return NextResponse.json(
      {
        message: "Category created successfully",
        categoryId: result[0].id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
