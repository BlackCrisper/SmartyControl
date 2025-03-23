import { NextResponse } from "next/server";
import { transactions } from "@/lib/data/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "entrada" | "saida" | null;
  const category = searchParams.get("category");
  const product = searchParams.get("product");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let filteredTransactions = [...transactions];

  // Filter by type
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }

  // Filter by category
  if (category) {
    filteredTransactions = filteredTransactions.filter(t => t.categoryId === category);
  }

  // Filter by product
  if (product) {
    filteredTransactions = filteredTransactions.filter(t => t.productId === product);
  }

  // Filter by date range
  if (startDate) {
    const start = new Date(startDate.split('/').reverse().join('-'));
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date.split('/').reverse().join('-'));
      return transDate >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate.split('/').reverse().join('-'));
    filteredTransactions = filteredTransactions.filter(t => {
      const transDate = new Date(t.date.split('/').reverse().join('-'));
      return transDate <= end;
    });
  }

  return NextResponse.json(filteredTransactions);
}
