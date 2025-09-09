import { NextResponse } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService()
  ) {}
  async getRegistrosSanidad(pagination: PaginationDto) {
    try {
      const users = await this.registrosSanidadService.findAll(pagination);
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
