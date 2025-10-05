import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "@/app/api/intervencion/controller/intervencion.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PayloadForUser } from "../detalles/route";
import jwt from "jsonwebtoken";

const intervencionController = new IntervencionController();
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

    const res = await intervencionController.getInterventionByDogId(
      pagination,
      id,
      payload
    );
    return NextResponse.json(res);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}
