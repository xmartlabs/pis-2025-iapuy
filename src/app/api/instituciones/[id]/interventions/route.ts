/* eslint-disable check-file/folder-naming-convention */

import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { InstitucionesController } from "../../controller/institucion.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawDates = request.nextUrl.searchParams.get("dates");

  const dates = rawDates ? rawDates.split(",").map((d) => new Date(d)) : [];
  const pagination = await extractPagination(request);

  try {
    const instituciones = await institutionsController.getInterventions(
      id,
      dates,
      pagination
    );
    return NextResponse.json(instituciones, { status: 200 });
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
