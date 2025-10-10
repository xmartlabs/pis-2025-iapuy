import { NextResponse } from "next/server";
import { GastoService } from "../service/gasto.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { Gasto } from "@/app/models/gastos.entity";

export class GastosController {
  constructor(
    private readonly gastosService: GastoService = new GastoService()
  ) {}
  async getGastos(pagination: PaginationDto) {
    try {
      const users = await this.gastosService.findAll(pagination);
      return NextResponse.json(users);
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async updateGasto(id: string, data: Partial<Gasto>) {
    return await this.gastosService.update(id, data);
  }
}
