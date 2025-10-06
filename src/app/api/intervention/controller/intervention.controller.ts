import type { PayloadForUser } from "../../users/service/user.service";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";
import { InterventionService } from "../service/intervention.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class InterventionController {
  constructor(
    private readonly interventionService: InterventionService = new InterventionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto, payload: PayloadForUser) {
    return await this.interventionService.findAll(pagination, payload);
  }
  async getInterventionByDogId(
    pagination: PaginationDto,
    dogId: string,
    payload: PayloadForUser
  ) {
    return await this.interventionService.findInterventionByDogId(
      pagination,
      dogId,
      payload
    );
  }
  async createIntervention(request: Request) {
    const interventionData: CreateInterventionDto =
      (await request.json()) as CreateInterventionDto;
    return await this.interventionService.create(interventionData);
  }
}
