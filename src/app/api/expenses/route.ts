import { initDatabase } from "@/lib/init-database";
import { ExpensesController } from "./controller/expenses.controller";
import type { NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import { NextResponse } from "next/server";
import type { Expense } from "@/app/models/expense.entity";

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
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense = await expensesController.createExpense(request);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (await request.json()) as unknown;
    const data = (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      raw && typeof raw === "object" ? (raw as any).expense ?? raw : raw
    ) as Partial<Expense>;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const allowed = ["concepto", "estado", "monto", "intervencionId", "userId"];

    const toUpdate: Record<string, unknown> = {};
    const dataObj = data as Record<string, unknown>;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
        toUpdate[key] = dataObj[key];
      }
    }

    if (toUpdate.monto && typeof toUpdate.monto === "string") {
      const num = Number(toUpdate.monto);
      if (!Number.isNaN(num)) toUpdate.monto = num;
    }

    const res = await expensesController.updateExpense(
      id,
      toUpdate as Partial<Expense>
    );

    if (!res) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 500 });
  }
}
