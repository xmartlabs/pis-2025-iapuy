import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}
  async getPerros(pagination: PaginationDto) {
    return await this.perrosService.findAll(pagination);
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
