import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/lib/db/sqlserver-operations";

// GET /api/products - Obter todos os produtos
export async function GET() {
  try {
    const products = await getAllProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Criar um novo produto
export async function POST(request: Request) {
  try {
    const productData = await request.json();

    // Validação básica
    if (!productData.name || productData.price === undefined || productData.category_id === undefined) {
      return NextResponse.json(
        { error: "Name, price and category_id are required" },
        { status: 400 }
      );
    }

    const productId = await createProduct(productData);

    return NextResponse.json(
      {
        message: "Product created successfully",
        productId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
