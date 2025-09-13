import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RegistrosSanidadController } from "./controller/registros-sanidad.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    const data =
      await registrosSanidadController.getRegistrosSanidad(pagination);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
