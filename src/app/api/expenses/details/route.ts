import { initDatabase } from "@/lib/init-database";
import { NextResponse, type NextRequest } from "next/server";
import { ExpensesController } from "../controller/expenses.controller";

const expensesController = new ExpensesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const payload = await expensesController.getExpenseDetails(id);
    if (!payload)
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
