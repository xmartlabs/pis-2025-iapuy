// eslint-disable-next-line check-file/folder-naming-convention
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RegistrosSanidadController } from "../controller/registros-sanidad.controller";
import { initDatabase } from "@/lib/init-database";
const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await registrosSanidadController.findOne(id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "Registro no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
