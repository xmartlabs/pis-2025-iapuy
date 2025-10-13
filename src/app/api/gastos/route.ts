import { initDatabase } from "@/lib/init-database";
import { GastosController } from "./controller/gastos.controller";
import { NextResponse, type NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PayloadForUser } from "../perros/detalles/route";
import jwt from "jsonwebtoken";

const gastoController = new GastosController();
await initDatabase();

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

    const res = await gastoController.getExpenses(
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
