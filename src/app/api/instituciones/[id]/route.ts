/* eslint-disable check-file/folder-naming-convention */

import { initDatabase } from "@/lib/init-database";
import { InstitucionesController } from "../controller/institucion.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const institucion = await institutionsController.getInstitucion(id);
    return NextResponse.json(institucion, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
