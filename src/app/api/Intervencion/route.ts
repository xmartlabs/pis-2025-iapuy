/* eslint-disable */


import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "./controller/Intervencion.controller";
import { NextRequest , NextResponse} from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import { sendError } from "next/dist/server/api-utils";

const intervencionController = new IntervencionController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return intervencionController.getIntervenciones(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}

/* eslint-enable */

export async function PUT( request: NextRequest , { params }: { params: { id: string } }){
  try {
    const intervention = await intervencionController.evaluateIntervention(request, params.id);
    return NextResponse.json(intervention, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return NextResponse.json(
      { error: 'Error al evaluar la intervención' },
      { status: 500 }
    );
  }
}

