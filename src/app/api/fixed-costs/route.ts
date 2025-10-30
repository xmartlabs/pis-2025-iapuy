import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { plainToInstance } from "class-transformer";
import UpdateFixedCostsDTO from "./dtos/fixed-costs.dto";
import { FixedCostsController } from "./controller/fixed-costs.controller";

const fixedCostsController = new FixedCostsController();

export function GET() {
  try {
    return NextResponse.json(fixedCostsController.getCostos());
  } catch (error) {
    return NextResponse.json(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const costos = plainToInstance(UpdateFixedCostsDTO, await request.json(), {
      enableImplicitConversion: true,
    });
    await fixedCostsController.loadCostos(costos);
    return NextResponse.json(null, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
