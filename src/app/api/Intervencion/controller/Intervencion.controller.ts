import { NextResponse } from "next/server";
import { IntervencionService } from "../service/Intervencion.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
      console.log("controller")
      return await this.intervencionService.findAll(pagination);
  }
}
