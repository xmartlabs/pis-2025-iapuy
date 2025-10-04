import { InterventionService } from "../service/intervention.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";

export class InterventionController {
  constructor(
    private readonly interventionService: InterventionService = new InterventionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
    return await this.interventionService.findAll(pagination);
  }

  async createIntervencion(request: Request) {
    const interventionData: CreateInterventionDto =
      (await request.json()) as CreateInterventionDto;
    return await this.interventionService.create(interventionData);
  }
}
