import { type NextRequest } from "next/server";
import { InstitucionesService } from "../service/instituciones.service";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";
import type { Institucion } from "@/app/models/institucion.entity";

export class InstitucionesController {
  constructor(
    private readonly institutionsService: InstitucionesService = new InstitucionesService()
  ) {}
  async getInstitutions(pagination: PaginationDto) {
    const institutions = await this.institutionsService.findAll(pagination);
    return institutions;
  }

  async getInstitutionsSimple() {
    const institutions = await this.institutionsService.findAllSimple();
    return institutions;
  }

  async createInstitution(req: NextRequest): Promise<Institucion> {
    const body = (await req.json()) as unknown as CreateInstitutionDTO;
    return this.institutionsService.create(body);
  }
}
