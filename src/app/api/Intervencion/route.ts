import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "./controller/Intervencion.controller";
import { NextRequest } from "next/server";

const intervencionController = new IntervencionController();
await initDatabase();

export async function GET(request: NextRequest) {
  return intervencionController.getIntervenciones();
}

