import { NextResponse } from "next/server";
import { getCategoryById } from "@/lib/db/sqlserver-operations";
import { executeQuery } from "@/lib/db/sqlserver";

// GET /api/categories/[id] - Obter uma categoria por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await getCategoryById(categoryId);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Atualizar uma categoria
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe
    const category = await getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Validar dados
    if (!data.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Atualizar categoria
    const query = `
      UPDATE Categories
      SET name = @param1, description = @param2, updated_at = GETDATE()
      WHERE id = @param0;
    `;

    await executeQuery(query, [categoryId, data.name, data.description || null]);

    // Obter categoria atualizada
    const updatedCategory = await getCategoryById(categoryId);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Excluir uma categoria
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe
    const category = await getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verificar se há produtos usando esta categoria
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM Products
      WHERE category_id = @param0
    `;

    const result = await executeQuery(checkQuery, [categoryId]);

    if (result[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      );
    }

    // Excluir categoria
    const deleteQuery = `
      DELETE FROM Categories
      WHERE id = @param0
    `;

    await executeQuery(deleteQuery, [categoryId]);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
