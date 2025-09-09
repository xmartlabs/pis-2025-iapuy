import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { InstitucionesController } from "./controller/institucion.controller";

const institucionesController = new InstitucionesController();
await initDatabase();

export async function GET(request: NextRequest) {
  return institucionesController.getInstituciones();
}
