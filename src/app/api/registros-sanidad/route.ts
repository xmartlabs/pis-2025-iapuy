import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { RegistrosSanidadController } from "./controller/registros-sanidad.controller";

const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(request: NextRequest) {
  return registrosSanidadController.getRegistrosSanidad();
}
