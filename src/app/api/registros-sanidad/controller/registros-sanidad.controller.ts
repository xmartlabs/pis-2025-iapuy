import { NextResponse } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";

export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService()
  ) {}
  async getRegistrosSanidad() {
    try {
      const users = await this.registrosSanidadService.findAll();
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
