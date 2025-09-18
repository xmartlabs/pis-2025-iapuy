import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { RegistrosSanidadController } from "./controller/registros-sanidad.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return registrosSanidadController.getRegistrosSanidad(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }

}

export async function POST(request: NextRequest) {
  return registrosSanidadController.createEventoSanidad(request);
}
