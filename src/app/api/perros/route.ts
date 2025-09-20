import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    const res: boolean = await perrosController.deletePerro(id);
    if (res) {
      return NextResponse.json(
        { success: true, message: "Dog deleted successfully" },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Dog could not be deleted",
      },
      { status: 500 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
