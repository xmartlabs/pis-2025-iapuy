import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RegistrosSanidadController } from "./controller/registros-sanidad.controller";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PayloadForUser } from "../perros/detalles/route";
import jwt from "jsonwebtoken";

const registrosSanidadController = new RegistrosSanidadController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination: PaginationDto = await extractPagination(request);
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;

    const data = await registrosSanidadController.getRegistrosSanidad(
      pagination,
      id,
      payload
    );
    return NextResponse.json(data);
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

export async function POST(request: NextRequest) {
  try {
    const regSanidad = await registrosSanidadController.createEventoSanidad(
      request
    );
    return NextResponse.json(regSanidad, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
