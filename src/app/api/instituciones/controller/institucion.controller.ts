import { NextResponse } from "next/server";
import { InstitucionesService } from "../service/instituciones.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class InstitucionesController {
  constructor(
    private readonly institucionesService: InstitucionesService = new InstitucionesService()
  ) {}
  async getInstituciones(pagination: PaginationDto) {
    try {
      const users = await this.institucionesService.findAll(pagination);
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
