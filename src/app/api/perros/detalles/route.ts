import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "../controller/perros.controller";

const perrosController = new PerrosController();

export async function GET(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const data = await perrosController.getPerro(id);
    if (data.status === 200) {
      return NextResponse.json({ perro: data.perro });
    }
    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 403 });
  }
}
