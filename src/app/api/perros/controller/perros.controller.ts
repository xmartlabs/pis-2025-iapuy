import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreatePerroDTO } from "../dtos/create-perro.dto";
import type { NextRequest } from "next/server";
import type { PayloadForUser } from "../detalles/route";
import { type DetallesPerroDto } from "../dtos/detalles-perro.dto";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}

  getPerros(pagination: PaginationDto) {
    return this.perrosService.findAll(pagination);
  }

  async createPerro(request: NextRequest) {
    const body = (await request.json()) as unknown as CreatePerroDTO;
    return this.perrosService.create(body);
  }

  async updatePerro(request: NextRequest) {
    const body = (await request.json()) as unknown as DetallesPerroDto;
    return this.perrosService.update(body.id, body);
  }

  async getPerro(id: string, payload: PayloadForUser) {
    return await this.perrosService.findOne(id, payload);
  }

  async deletePerro(id: string): Promise<boolean> {
    try {
      return await this.perrosService.delete(id);
    } catch {
      return false;
    }
  }

  async listOptions(
    payload: PayloadForUser
  ): Promise<{ id: string; nombre: string }[]> {
    return await this.perrosService.listOptions(payload.type, payload.ci);
  }
}
