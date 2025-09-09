import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { InstitucionesController } from "./controller/institucion.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const institucionesController = new InstitucionesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    return institucionesController.getInstituciones(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}
