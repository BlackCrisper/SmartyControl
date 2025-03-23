import { NextResponse } from "next/server";
import { getRecentTransactions } from "@/lib/db/sqlserver-operations";

export async function GET(request: Request) {
  try {
    // Obter o tipo (input ou output) e limite dos parâmetros da URL
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "input" | "output" | null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 5;

    // Buscar transações recentes do banco de dados
    const transactions = await getRecentTransactions(limit);

    // Filtrar por tipo se especificado
    const filteredTransactions = type
      ? transactions.filter(transaction => transaction.type === type)
      : transactions;

    return NextResponse.json(filteredTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent transactions" },
      { status: 500 }
    );
  }
}
