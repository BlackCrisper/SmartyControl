import { NextResponse } from "next/server";
import { stockStatistics } from "@/lib/data/mock-data";

export async function GET() {
  return NextResponse.json(stockStatistics);
}
