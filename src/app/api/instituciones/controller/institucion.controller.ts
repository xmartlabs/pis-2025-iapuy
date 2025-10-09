import { type NextRequest, NextResponse } from "next/server";
import { InstitucionesService } from "../service/instituciones.service";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";
import type { Institucion } from "@/app/models/institucion.entity";

export class InstitucionesController {
  constructor(
    private readonly institutionsService: InstitucionesService = new InstitucionesService()
  ) {}
  async getInstitutions(pagination: PaginationDto) {
    try {
      const users = await this.institutionsService.findAll(pagination);
      return NextResponse.json(users);
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async getInstitutionsSimple() {
    const institutions = await this.institutionsService.findAllSimple();
    return institutions;
  }

  async createInstitution(req: NextRequest): Promise<Institucion> {
    const body = (await req.json()) as unknown as CreateInstitutionDTO;
    return this.institutionsService.create(body);
  }

  async deleteInstitution(id: string): Promise<void> {
    await this.institutionsService.delete(id);
  }

  async interventionsPDF(req: NextRequest, id: string) {
    const { fechas } = (await req.json()) as { fechas: Date[] };

    const result = await this.institutionsService.interventionsPDF(id, fechas);

    if (result instanceof Uint8Array || Buffer.isBuffer(result)) {
      const body = (Buffer.isBuffer(result)
        ? result
        : Buffer.from(result)) as unknown as BodyInit;
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=intervenciones_${id}.pdf`,
        },
      });
    }

    // Otherwise return JSON (fallback)
    return NextResponse.json(result);
  }
}
