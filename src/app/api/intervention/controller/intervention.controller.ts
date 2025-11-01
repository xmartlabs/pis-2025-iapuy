import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { PayloadForUser } from "../../users/service/user.service";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";
import type {
  EvaluateInterventionDTO,
  ExperiencePerroDTO,
  PatientDTO,
} from "../dtos/evaluate-intervention.dto";
import { InterventionService } from "../service/intervention.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

export class InterventionController {
  constructor(
    private readonly interventionService: InterventionService = new InterventionService()
  ) {}
  async getIntervenciones(
    pagination: PaginationDto,
    payload: PayloadForUser,
    months: string | null,
    statuses: string | null
  ) {
    return await this.interventionService.findAll(
      pagination,
      payload,
      months,
      statuses
    );
  }

  async getInterventionsSimple(
    payload: PayloadForUser,
    statuses: string | null
  ) {
    const interventions = await this.interventionService.findAllSimple(
      payload,
      statuses
    );
    return interventions;
  }

  async getUsersInvolvedInInterventionForExpense(
    payload: PayloadForUser,
    interventionId: string
  ) {
    const involved =
      await this.interventionService.findUsersInvolvedInIntervention(
        payload,
        interventionId
      );
    return involved;
  }

  async getInterventionDetails(id: string) {
    return await this.interventionService.getInterventionDetails(id);
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

  async getPathologies(id: string) {
    try {
      const pathologies = await this.interventionService.findAllPathologiesbyId(
        id
      );
      return pathologies;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async getDogsFromIntervention(id: string) {
    try {
      const dogs = await this.interventionService.findAllDogsbyId(id);
      return dogs;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async evaluateIntervention(request: NextRequest, id: string) {
    const formData = await request.formData();

    const patients: PatientDTO[] = JSON.parse(
      formData.get("patients") as string
    ) as unknown as PatientDTO[];
    const experiences: ExperiencePerroDTO[] = JSON.parse(
      formData.get("experiences") as string
    ) as unknown as ExperiencePerroDTO[];
    const pictures: File[] = formData.getAll("photos") as File[];
    const driveLink = (formData.get("driveLink") as string) ?? "";

    const body: EvaluateInterventionDTO = {
      patients,
      experiences,
      pictures,
      driveLink,
    };

    const ret = await this.interventionService.evaluate(id, body);
    return ret;
  }

  async getDogsInterventionByPK(id: string) {
    try {
      const intervention = await this.interventionService.findIntervention(id);
      return intervention;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async suspendIntervention(id: string) {
    return await this.interventionService.suspend(id);
  }

  async deleteIntervention(id: string) {
    await this.interventionService.delete(id);
  }
}
