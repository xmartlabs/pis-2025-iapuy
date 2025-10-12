import { initDatabase } from "@/lib/init-database";
import { GastosController } from "./controller/gastos.controller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type { Gasto } from "@/app/models/gastos.entity";

const gastoController = new GastosController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return gastoController.getGastos(pagination);
  } catch {
    return new Response(undefined, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (await request.json()) as unknown;
    const data = (
      raw && typeof raw === "object" ? (raw as any).gasto ?? raw : raw
    ) as Partial<Gasto>;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const allowed = ["concepto", "estado", "monto", "intervencionId", "userId"];

    const toUpdate: Record<string, unknown> = {};
    const dataObj = data as Record<string, unknown>;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
        toUpdate[key] = dataObj[key];
      }
    }

    if (toUpdate.monto && typeof toUpdate.monto === "string") {
      const num = Number(toUpdate.monto);
      if (!Number.isNaN(num)) toUpdate.monto = num;
    }

    const res = await gastoController.updateGasto(
      id,
      toUpdate as Partial<Gasto>
    );

    if (!res) {
      return NextResponse.json({ error: "Gasto not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 500 });
  }
}
