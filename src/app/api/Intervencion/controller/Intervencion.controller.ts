import { IntervencionService } from "../service/Intervencion.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
      return await this.intervencionService.findAll(pagination);
  }
  async getInterventionByDogId(pagination: PaginationDto, dogId: string) {
      return await this.intervencionService.findInterventionByDogId(pagination, dogId);
  }
}
