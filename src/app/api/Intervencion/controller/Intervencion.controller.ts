/* eslint-disable */

import { NextRequest, NextResponse } from "next/server";
import { IntervencionService } from "../service/Intervencion.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { EvaluateInterventionDTO, ExperiencePerroDTO, PatientDTO } from "../dtos/evaluate-intervention.dto";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones(pagination: PaginationDto) {
    try {
      const users = await this.intervencionService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  /* eslint-enable */

  async getPathologies(id: string){
    try {
      const pathologies = await this.intervencionService.findAllPathologiesbyId(id);
      return pathologies;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  
  async getDogsFromIntervention(id: string){
    try {
      const dogs = await this.intervencionService.findAllDogsbyId(id);
      return dogs;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async evaluateIntervention(request: NextRequest, id: string) {
    const formData = await request.formData();

    const patients : PatientDTO[] = JSON.parse(formData.get("patients") as string) as unknown as PatientDTO[];
    const experiences : ExperiencePerroDTO[] = JSON.parse(formData.get("experiences") as string) as unknown as ExperiencePerroDTO[];
    const pictures: File[] = formData.getAll("photos") as File[];
    const driveLink = (formData.get("driveLink") as string) ?? "";

    const body: EvaluateInterventionDTO = {
      patients,
      experiences,
      pictures,
      driveLink
    };

    const ret = await this.intervencionService.evaluate(id, body);
    return ret;
  }

}


