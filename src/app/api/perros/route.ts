import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { PerrosController } from "./controller/perros.controller";

const perrosController = new PerrosController();
await initDatabase();

export async function GET(request: NextRequest) {
  return perrosController.getPerros();
}
