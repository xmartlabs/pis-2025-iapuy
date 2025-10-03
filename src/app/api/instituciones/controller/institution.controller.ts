import { type NextRequest, NextResponse } from "next/server";
import { InstitutionsService } from "../service/instituciones.service";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";

export class InstitutionsController {
  constructor(
    private readonly institutionsService: InstitutionsService = new InstitutionsService()
  ) {}
  async getInstitutions(pagination: PaginationDto) {
    try {
      const users = await this.institutionsService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async createInstitution(req: NextRequest) {
    const body = (await req.json()) as unknown as CreateInstitutionDTO;
    return this.institutionsService.create(body);
  }
}
