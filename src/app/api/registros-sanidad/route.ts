import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RegistrosSanidadController } from "./controller/registros-sanidad.controller";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination: PaginationDto = await extractPagination(request);
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const data =
      await registrosSanidadController.getRegistrosSanidad(pagination, id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error." }, { status: 500 });
  }

}

export async function POST(request: NextRequest) {
  try {
    const regSanidad = await registrosSanidadController.createEventoSanidad(request);
    return NextResponse.json(regSanidad, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
