import { initDatabase } from "@/lib/init-database";
import { ExpensesController } from "../controller/expenses.controller";
import { NextResponse, type NextRequest } from "next/server";

const expensesController = new ExpensesController();
await initDatabase();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const res = await expensesController.getExpensesInitialFilters();
    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error en el servidor" },
      { status: 500 }
    );
  }
}
