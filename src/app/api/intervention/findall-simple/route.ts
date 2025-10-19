import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { InterventionController } from "../controller/intervention.controller";
import type { PayloadForUser } from "../../perros/detalles/route";
import jwt from "jsonwebtoken";

const interventionsController = new InterventionController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;
    const statuses = request.nextUrl.searchParams.get("statuses");

    const interventions = await interventionsController.getInterventionsSimple(
      payload,
      statuses
    );
    return NextResponse.json(interventions);
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
