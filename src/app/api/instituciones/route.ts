import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { InstitucionesController } from "./controller/institucion.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    const institutions = await institutionsController.getInstitutions(
      pagination
    );
    return NextResponse.json(institutions, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
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
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }
    await institutionsController.deleteInstitution(id);
    return NextResponse.json(
      { message: "Institution deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Institution not found")
    ) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
