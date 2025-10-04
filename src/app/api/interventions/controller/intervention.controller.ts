import { NextResponse } from "next/server";
import { InterventionService } from "../service/intervention.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";

export class InterventionController {
  constructor(
    private readonly interventionService: InterventionService = new InterventionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
    try {
      const users = await this.interventionService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async createIntervencion(request: Request) {
    const interventionData: CreateInterventionDto =
      (await request.json()) as CreateInterventionDto;
    return await this.interventionService.create(interventionData);
  }
}
