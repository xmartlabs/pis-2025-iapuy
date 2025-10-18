import type { NextRequest } from "next/server";
import { InscripcionService } from "../service/inscription.service";
import type { InscripcionDto } from "../dtos/inscription.dto";

export class InscripcionController {
  constructor(
    private readonly inscripcionService: InscripcionService = new InscripcionService()
  ) {}
  async postInscripcion(request: NextRequest) {
    try {
      const req: InscripcionDto = (await request.json()) as InscripcionDto;

      if (req.duplas.length === 0 && req.acompaniantes.length === 0)
        throw new Error("Se requiere al menos una inscripcion");
      if (!req.intervention) throw new Error("Id de intervención requerida");

      return await this.inscripcionService.inscribirse(req);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Internal Server Error"
      );
    }
  }
}
