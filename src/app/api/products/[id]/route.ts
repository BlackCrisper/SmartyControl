import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db/sqlserver-operations";

// GET /api/products/[id] - Obter um produto por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID do produto inválido" },
        { status: 400 }
      );
    }

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Falha ao buscar produto" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Atualizar um produto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID do produto inválido" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validação básica
    if (!data.name || data.price === undefined || data.category_id === undefined) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    const success = await updateProduct(productId, data);

    if (!success) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Buscar o produto atualizado
    const updatedProduct = await getProductById(productId);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar produto", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Excluir um produto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID do produto inválido" },
        { status: 400 }
      );
    }

    const success = await deleteProduct(productId);

    if (!success) {
      return NextResponse.json(
        { error: "Produto não encontrado ou não pode ser excluído" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);

    // Check if error is related to transactions
    if (error instanceof Error && error.message.includes('transações associadas')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao excluir produto", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
