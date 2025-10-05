import type { PayloadForUser } from "../../users/service/user.service";
import { IntervencionService } from "../service/intervencion.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto, payload: PayloadForUser) {
    return await this.intervencionService.findAll(pagination, payload);
  }
  async getInterventionByDogId(
    pagination: PaginationDto,
    dogId: string,
    payload: PayloadForUser
  ) {
    return await this.intervencionService.findInterventionByDogId(
      pagination,
      dogId,
      payload
    );
  }
}
