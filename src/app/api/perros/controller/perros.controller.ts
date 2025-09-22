import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreatePerroDTO } from "../dtos/create-perro.dto";
import type { NextRequest } from "next/server";


export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}

  getPerros(pagination: PaginationDto) {
    return this.perrosService.findAll(pagination);
  }

  async createPerro(request: NextRequest) {
    const body = await request.json() as unknown as CreatePerroDTO;
    return this.perrosService.create(body);

  }
  async getPerro(id: string) {
    return await this.perrosService.findOne(id);
  }

  async deletePerro(id: string): Promise<boolean> {
    try {
      return await this.perrosService.delete(id);
    } catch {
      return false;
    }
  }
}
