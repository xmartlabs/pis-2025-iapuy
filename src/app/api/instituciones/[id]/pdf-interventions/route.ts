/* eslint-disable check-file/folder-naming-convention */
import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { InstitucionesController } from "../../controller/institucion.controller";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // interventionsPDF may return a NextResponse (with PDF) or JSON. Return it directly.
    return await institutionsController.interventionsPDF(request, id);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error.",
      },
      { status: 500 }
    );
  }
}
