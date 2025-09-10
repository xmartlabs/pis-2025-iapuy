import { NextResponse } from "next/server";
import { IntervencionService } from "../service/Intervencion.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
    try {
      const users = await this.intervencionService.findAll(pagination);
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
