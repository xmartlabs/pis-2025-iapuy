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
    const res = await interventionController.getIntervenciones(pagination);
    console.log(res.data[0]);
    return NextResponse.json(res);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("otro error");
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const intervention = await interventionController.createIntervencion(
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
