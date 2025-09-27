import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "./controller/Intervencion.controller";
import type {NextRequest} from "next/server";
import { NextResponse} from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

const intervencionController = new IntervencionController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    return NextResponse.json(await intervencionController.getIntervenciones(pagination));
  } catch (error) {
      if (error instanceof Error) {
          console.log(error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log("otro error");
      return NextResponse.json(
          { error: "Hubo un error desconocido" },
          { status: 500 },
      );
  }
}
