import { NextResponse } from "next/server";
import { GastoService } from "../service/gasto.service";

export class GastosController {
  constructor(
    private readonly gastosService: GastoService = new GastoService()
  ) {}
  async getGastos() {
    try {
      const users = await this.gastosService.findAll();
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
