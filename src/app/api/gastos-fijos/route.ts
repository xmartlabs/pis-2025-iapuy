import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { GastosFijosController } from "./controller/gastos-fijos.controller";
import { plainToInstance } from "class-transformer";
import UpdateGastosDTO from "./dtos/update-gastos.dto";

const gastosFijosController = new GastosFijosController();

export function GET() {
  try {
    return NextResponse.json(gastosFijosController.getCostos());
  } catch (error) {
    return NextResponse.json(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const costos = plainToInstance(UpdateGastosDTO, await request.json(), {
      enableImplicitConversion: true,
    });
    await gastosFijosController.loadCostos(costos);
    return NextResponse.json(null, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
