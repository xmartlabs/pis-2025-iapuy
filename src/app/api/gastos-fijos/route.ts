import { NextRequest, NextResponse } from "next/server";
import { GastosFijosController } from "./controller/gastos-fijos.controller";
import { plainToInstance } from "class-transformer";
import UpdateGastosDTO from "./dtos/update-gastos.dto";

const gastosFijosController = new GastosFijosController();

export async function GET() {
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
    const body = await request.json();

    const costos = plainToInstance(UpdateGastosDTO, body, {
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
