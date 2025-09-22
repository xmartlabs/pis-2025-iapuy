import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { PerrosController } from "./controller/perros.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const perrosController = new PerrosController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return NextResponse.json(await perrosController.getPerros(pagination));
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
          const dog = await perrosController.createPerro(request);
          return NextResponse.json(dog, { status: 201 });
        } catch {
          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        }
}
