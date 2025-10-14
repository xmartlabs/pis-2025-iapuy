import { initDatabase } from "@/lib/init-database";
import { ExpensesController } from "./controller/expenses.controller";
import { NextResponse, type NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PayloadForUser } from "../perros/detalles/route";
import jwt from "jsonwebtoken";

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
    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;

    const pagination = await extractPagination(request);

    const months = request.nextUrl.searchParams.get("months");
    const statuses = request.nextUrl.searchParams.get("statuses");
    const people = request.nextUrl.searchParams.get("people");

    const res = await expensesController.getExpenses(
      pagination,
      payload,
      months,
      statuses,
      people
    );
    return NextResponse.json(res);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error en el servidor" },
      { status: 500 }
    );
  }

}

export async function POST(request: NextRequest) {
  try {
    const expense = await expensesController.createExpense(request);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
