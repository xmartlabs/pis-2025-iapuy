import { initDatabase } from "@/lib/init-database";
import { InterventionController } from "./controller/intervention.controller";
import { NextResponse, type NextRequest } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PayloadForUser } from "../perros/detalles/route";
import jwt from "jsonwebtoken";

const interventionController = new InterventionController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;

    const pagination = await extractPagination(request);

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    const statuses = request.nextUrl.searchParams.get("statuses");

    const res = await interventionController.getIntervenciones(
      pagination,
      payload,
      startDate,
      endDate,
      statuses
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

export async function POST(request: NextRequest) {
  try {
    const intervention = await interventionController.createIntervention(
      request
    );
    return NextResponse.json(intervention, { status: 201 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }
    await interventionController.deleteIntervention(id);
    return NextResponse.json(
      { message: "Intervention deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}
