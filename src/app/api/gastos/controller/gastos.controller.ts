import { NextResponse } from "next/server";
import { GastoService } from "../service/gasto.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class GastosController {
  constructor(
    private readonly gastosService: GastoService = new GastoService()
  ) {}
  async getGastos(pagination: PaginationDto) {
    try {
      const users = await this.gastosService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
