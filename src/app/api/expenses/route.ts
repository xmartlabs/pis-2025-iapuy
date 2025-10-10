import { initDatabase } from "@/lib/init-database";
import { ExpensesController } from "./controller/expenses.controller";
import type { NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import { NextResponse } from "next/server";

const expensesController = new ExpensesController();
await initDatabase();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "Unknown error";
  }
}

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return expensesController.getExpenses(pagination);
  } catch (error) {
    console.error(error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense = await expensesController.createExpense(request);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
