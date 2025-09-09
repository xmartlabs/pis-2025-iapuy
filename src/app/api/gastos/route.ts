import { initDatabase } from "@/lib/init-database";
import { GastosController } from "./controller/gastos.controller";
import { NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

const gastoController = new GastosController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return gastoController.getGastos(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}
