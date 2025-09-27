import { initDatabase } from "@/lib/init-database";
import { InterventionController } from "./controller/intervention.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

const interventionController = new InterventionController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return interventionController.getIntervenciones(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await interventionController.createIntervencion(request);
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
