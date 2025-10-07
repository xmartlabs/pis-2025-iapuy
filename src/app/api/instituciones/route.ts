import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { InstitucionesController } from "./controller/institucion.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    return institutionsController.getInstitutions(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institution = await institutionsController.createInstitution(request);
    return NextResponse.json(institution, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Ya existe una institucion")
    ) {
      return NextResponse.json(
        { error: "Ya existe una institucion con el nombre elegido." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}
