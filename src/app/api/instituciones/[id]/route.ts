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
    const institucion = await institutionsController.getInstitution(id);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const institution = await institutionsController.updateInstitution(
      request,
      id
    );
    return NextResponse.json(institution, { status: 200 });
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
    if (
      error instanceof Error &&
      error.message.includes("Institution not found")
    ) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }
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
