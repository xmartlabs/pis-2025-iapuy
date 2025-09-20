import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type {DetallesPerroDto} from "@/app/api/perros/dtos/detalles-perro.dto";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService(),
  ) {}
  async getPerros(pagination: PaginationDto) {
    return await this.perrosService.findAll(pagination);
  }
  async getPerro(id: string): Promise<null | DetallesPerroDto> {
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
