import { initDatabase } from "@/lib/init-database";
import { GastosController } from "./controller/gastos.controller";
import { NextRequest } from "next/server";

const gastoController = new GastosController();
await initDatabase();

export async function GET(request: NextRequest) {
  return gastoController.getGastos();
}
