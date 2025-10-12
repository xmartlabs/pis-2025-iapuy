import { initDatabase } from "@/lib/init-database";
import { InscripcionController } from "../controller/inscription.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const inscripcionController = new InscripcionController();
await initDatabase();

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await inscripcionController.postInscripcion(request));
  } catch (error) {
    return NextResponse.json(
        {
        error: error instanceof Error ? error.message : "Internal Server Error",
        },
        {
        status: 500,
        },
    );
  }
}