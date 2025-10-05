import { initDatabase } from "@/lib/init-database";
import { NextResponse } from "next/server";
import { InstitucionesController } from "../controller/institucion.controller";

const institucionesController = new InstitucionesController();
await initDatabase();

export async function GET() {
  try {
    const institutions = await institucionesController.getInstitutionsSimple();
    return NextResponse.json(institutions);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}
