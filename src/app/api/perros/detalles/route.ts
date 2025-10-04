import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "../controller/perros.controller";
import { initDatabase } from "@/lib/init-database";

await initDatabase();
const perrosController = new PerrosController();

export async function GET(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json(
        { perro: null, error: "ID is required" },
        { status: 400 }
      );
    }
    const data = await perrosController.getPerro(id);
    if (data.status === 200) {
      return NextResponse.json(
        { perro: data.perro, error: null },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { perro: null, error: data.error },
      { status: data.status }
    );
  } catch (error) {
    return NextResponse.json(
      { perro: null, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
