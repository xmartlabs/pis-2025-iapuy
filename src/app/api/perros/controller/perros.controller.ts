import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreatePerroDTO } from "../dtos/create-perro.dto";
import { NextRequest } from "next/server";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}

  async getPerros(pagination: PaginationDto) {
    return this.perrosService.findAll(pagination);
  }

  async createPerro(request: NextRequest) {
    const body: CreatePerroDTO = await request.json();
    return this.perrosService.create(body);
  }
}
