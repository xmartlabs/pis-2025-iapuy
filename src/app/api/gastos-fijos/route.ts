import { NextRequest, NextResponse } from "next/server";
import { GastosFijosController } from "./controller/gastos-fijos.controller";
import { plainToInstance } from "class-transformer";
import UpdateGastosDTO from "./dtos/update-gastos.dto";

const gastosFijosController = new GastosFijosController();

export async function GET() {
  return NextResponse.json(gastosFijosController.getCostos());
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const costos = plainToInstance(UpdateGastosDTO, body, {
    enableImplicitConversion: true,
  });
  await gastosFijosController.loadCostos(costos);
  return NextResponse.json(null, { status: 201 });
}
