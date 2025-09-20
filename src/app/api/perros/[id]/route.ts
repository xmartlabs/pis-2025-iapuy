import { NextRequest, NextResponse } from "next/server";
import { PerrosController } from "../controller/perros.controller";

const perrosController = new PerrosController();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await perrosController.getPerro(id);
    if (data.status === 200) {
      const res = NextResponse.json({ perro: data.perro });
      return res;
    }

    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 403 });
  }
}
