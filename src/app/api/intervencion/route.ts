/* eslint-disable */


import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "./controller/intervencion.controller"
import { NextRequest , NextResponse} from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

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


