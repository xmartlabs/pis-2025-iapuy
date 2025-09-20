import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "../controller/perros.controller";

const perrosController = new PerrosController();

export async function GET(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ perro: null, error: "ID is required" }, { status: 400 });
    }
    const data = await perrosController.getPerro(id);
    if (data) {
      return NextResponse.json({ perro: data, error: null }, { status: 200 });
    }
    return NextResponse.json({ perro: null, error: "Internal Server Error" }, { status: 500 });
  } catch {
    return NextResponse.json({ perro: null, error: "Bad Request" }, { status: 403 });
  }
}
