/* eslint-disable check-file/folder-naming-convention */

import { initDatabase } from "@/lib/init-database";
import { InstitucionesController } from "../controller/institucion.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const institutionsController = new InstitucionesController();
await initDatabase();

interface PayloadForUser extends jwt.JwtPayload {
  ci: string;
  name: string;
  type: string;
}

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
    // Verificar que el usuario es administrador
    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return NextResponse.json(
        { error: "No se encontró un token de acceso en la solicitud." },
        { status: 401 }
      );
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;

    if (payload.type !== "Administrador") {
      return NextResponse.json(
        { error: "No tiene permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const institution = await institutionsController.updateInstitution(request, id);
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
