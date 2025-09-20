import { PerrosService } from "../service/perros.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}
  async getPerros(pagination: PaginationDto) {
    return await this.perrosService.findAll(pagination);
  }
}
