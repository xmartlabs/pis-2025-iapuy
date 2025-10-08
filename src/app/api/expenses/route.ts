import { initDatabase } from "@/lib/init-database";
import { ExpensesController } from "./controller/expenses.controller";
import type { NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

const expensesController = new ExpensesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return expensesController.getExpenses(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}
