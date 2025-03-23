import { NextResponse } from "next/server";
import { getLowStockProducts } from "@/lib/db/sqlserver-operations";

export async function GET() {
  try {
    const lowStockProducts = await getLowStockProducts();

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
